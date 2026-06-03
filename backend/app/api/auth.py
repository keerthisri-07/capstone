"""
Authentication API routes for the AI Women Safety Companion platform.

Endpoints:
  POST /api/auth/register     - Create new user account
  POST /api/auth/login        - Authenticate and get tokens
  POST /api/auth/refresh      - Refresh access token
  POST /api/auth/otp/verify   - Verify email OTP
  POST /api/auth/forgot-password  - Request password reset OTP
  POST /api/auth/reset-password   - Reset password with OTP
  POST /api/auth/logout       - Invalidate refresh token
"""

import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Request
from beanie import PydanticObjectId

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_active_user,
)
from app.core.config import settings
from app.models.user import User
from app.models.notification import Notification
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    RefreshRequest,
    OTPVerifyRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Demo OTP (fixed for development) ──────────────────────────────────────────
DEMO_OTP = "123456"


def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP string."""
    return "".join(random.choices(string.digits, k=length))


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    """
    Register a new user account.

    - Validates email/username uniqueness
    - Hashes password with bcrypt
    - Creates user document in MongoDB
    - Returns JWT tokens immediately (email verification optional)
    """
    # Check email uniqueness
    existing_email = await User.find_one(User.email == payload.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Check username uniqueness
    existing_username = await User.find_one(User.username == payload.username.lower())
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )

    # Validate role (only user or guardian on self-registration)
    allowed_roles = {"user", "guardian"}
    role = payload.role if payload.role in allowed_roles else "user"

    # Create user document
    user = User(
        email=payload.email,
        username=payload.username.lower(),
        full_name=payload.full_name,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=role,
        # Set demo OTP for email verification
        otp=DEMO_OTP,
        otp_expiry=datetime.now(timezone.utc) + timedelta(minutes=15),
    )
    await user.insert()

    # Create welcome notification
    notification = Notification(
        user_id=str(user.id),
        type="system",
        title="Welcome to Safety Companion!",
        message=f"Hi {user.full_name}, your account has been created successfully. "
                f"Use OTP {DEMO_OTP} to verify your email (demo mode).",
        metadata={"action_url": "/verify-email"},
    )
    await notification.insert()

    # Issue tokens
    user_id = str(user.id)
    access_token = create_access_token(subject=user_id, role=user.role)
    refresh_token = create_refresh_token(subject=user_id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user_id,
        role=user.role,
    )


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Authenticate a user and return JWT tokens.

    - Verifies email/password combination
    - Updates last_login timestamp
    - Returns access + refresh tokens
    """
    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await user.save()

    user_id = str(user.id)
    access_token = create_access_token(subject=user_id, role=user.role)
    refresh_token = create_refresh_token(subject=user_id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user_id,
        role=user.role,
    )


# ── Google Login ──────────────────────────────────────────────────────────────

@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest):
    """
    Authenticate a user via Google Sign-In and return JWT tokens.
    """
    try:
        # In a real app, you would pass client_id=settings.GOOGLE_CLIENT_ID
        # Here we disable audience verification if GOOGLE_CLIENT_ID is not set
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        if client_id:
            idinfo = id_token.verify_oauth2_token(
                payload.credential, google_requests.Request(), client_id
            )
        else:
            # Mock mode or demo mode if no client ID is set
            from jose import jwt
            # Decodes without verification for demo purposes
            idinfo = jwt.decode(payload.credential, "", options={"verify_signature": False})
            
        email = idinfo.get("email")
        if not email:
            raise ValueError("No email in token")
            
        user = await User.find_one(User.email == email)
        
        if not user:
            # Create a new user automatically
            base_username = email.split("@")[0].lower()
            username = base_username
            counter = 1
            while await User.find_one(User.username == username):
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User(
                email=email,
                username=username,
                full_name=idinfo.get("name", username),
                password_hash=hash_password("google_oauth_dummy_password"),
                role="user",
                is_verified=True, # Google emails are pre-verified
                profile_picture=idinfo.get("picture")
            )
            await user.insert()
            
            # Create welcome notification
            notification = Notification(
                user_id=str(user.id),
                type="system",
                title="Welcome to Safety Companion!",
                message=f"Hi {user.full_name}, your account was created successfully via Google.",
                metadata={"action_url": "/dashboard"},
            )
            await notification.insert()
            
        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact support.",
            )

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await user.save()

        user_id = str(user.id)
        access_token = create_access_token(subject=user_id, role=user.role)
        refresh_token = create_refresh_token(subject=user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user_id,
            role=user.role,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}",
        )


# ── Refresh Token ─────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    """
    Exchange a refresh token for a new access token.

    Refresh tokens have a longer TTL (7 days by default).
    """
    token_payload = verify_token(payload.refresh_token, token_type="refresh")
    user_id = token_payload.get("sub")

    user = await User.get(PydanticObjectId(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    new_access_token = create_access_token(subject=user_id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user_id)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user_id,
        role=user.role,
    )


# ── OTP Verify ────────────────────────────────────────────────────────────────

@router.post("/otp/verify", response_model=MessageResponse)
async def verify_otp(payload: OTPVerifyRequest):
    """
    Verify email OTP to activate account.

    In demo mode, OTP is always '123456'. In production, a real OTP
    would be sent to the user's email via an email service.
    """
    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email",
        )

    if user.is_verified:
        return MessageResponse(message="Email is already verified")

    # Check OTP (demo: accept 123456 always; production: check stored OTP)
    stored_otp = user.otp or DEMO_OTP
    if payload.otp != stored_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please check your email or use 123456 (demo mode)",
        )

    # Check expiry
    if user.otp_expiry and datetime.now(timezone.utc) > user.otp_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    # Mark as verified and clear OTP
    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return MessageResponse(message="Email verified successfully! Your account is now active.")


# ── Forgot Password ───────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(payload: ForgotPasswordRequest):
    """
    Initiate password reset flow.

    In demo mode, always sets OTP to '123456' and informs the user.
    In production, this would send the OTP via email.
    """
    user = await User.find_one(User.email == payload.email)

    # Always return success to prevent email enumeration
    if not user:
        return MessageResponse(
            message="If an account with this email exists, you will receive an OTP shortly. "
                    "(Demo OTP: 123456)"
        )

    # Set OTP (demo mode)
    user.otp = DEMO_OTP
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
    await user.save()

    return MessageResponse(
        message="Password reset OTP sent to your email. (Demo mode: use 123456)"
    )


# ── Reset Password ────────────────────────────────────────────────────────────

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest):
    """
    Reset password using OTP from email.

    Validates OTP, updates password hash, and clears the OTP.
    """
    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email",
        )

    stored_otp = user.otp or DEMO_OTP
    if payload.otp != stored_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    if user.otp_expiry and datetime.now(timezone.utc) > user.otp_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new password reset.",
        )

    user.password_hash = hash_password(payload.new_password)
    user.otp = None
    user.otp_expiry = None
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return MessageResponse(message="Password reset successfully. Please log in with your new password.")


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user=Depends(get_current_active_user)):
    """
    Log out the current user.

    In a stateless JWT setup this is primarily a client-side operation.
    This endpoint can be extended with a token blacklist (Redis) in production.
    """
    return MessageResponse(
        message="Logged out successfully. Please discard your tokens on the client side."
    )
