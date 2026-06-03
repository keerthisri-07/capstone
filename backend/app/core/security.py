"""
Security utilities for the AI Women Safety Companion backend.

Handles:
  - Password hashing/verification using bcrypt
  - JWT access and refresh token creation
  - Token verification and decoding
  - FastAPI dependency helpers for authentication
  - Role-based access control (RBAC)
"""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional, Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password Hashing ───────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── OAuth2 Bearer token scheme ─────────────────────────────────────────────────

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Role Enum ─────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    """Enumeration of all user roles within the platform."""
    USER = "user"
    GUARDIAN = "guardian"
    ADMIN = "admin"


# ── Password Utilities ─────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        plain_password: The raw password string from the user.

    Returns:
        A bcrypt-hashed password string.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored bcrypt hash.

    Args:
        plain_password: Raw password to verify.
        hashed_password: Previously hashed password from the database.

    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ── Token Creation ─────────────────────────────────────────────────────────────

def create_access_token(subject: str, role: str = UserRole.USER) -> str:
    """
    Create a short-lived JWT access token.

    Args:
        subject: The user identifier (typically user ID string).
        role: The user's role string.

    Returns:
        Signed JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": subject,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """
    Create a long-lived JWT refresh token.

    Args:
        subject: The user identifier (typically user ID string).

    Returns:
        Signed JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub": subject,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Token Verification ─────────────────────────────────────────────────────────

def verify_token(token: str, token_type: str = "access") -> dict:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT string to decode.
        token_type: Expected token type ('access' or 'refresh').

    Returns:
        Decoded payload dictionary.

    Raises:
        HTTPException 401 if token is invalid, expired, or wrong type.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != token_type:
            raise credentials_exception
        subject: Optional[str] = payload.get("sub")
        if subject is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


# ── FastAPI Dependencies ───────────────────────────────────────────────────────

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    FastAPI dependency that extracts and validates the current user from the
    Bearer token.

    Returns:
        The Beanie User document for the authenticated user.

    Raises:
        HTTPException 401 if the token is invalid.
        HTTPException 404 if the user no longer exists.
    """
    from app.models.user import User  # avoid circular import at module level

    payload = verify_token(token, token_type="access")
    user_id: str = payload.get("sub")

    try:
        from beanie import PydanticObjectId
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_active_user(
    current_user=Depends(get_current_user),
):
    """
    FastAPI dependency that also checks the user is active (not banned/deleted).

    Raises:
        HTTPException 403 if the user account is inactive.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )
    return current_user


# ── Role-Based Access Control ──────────────────────────────────────────────────

def require_role(*roles: UserRole):
    """
    Factory function that returns a FastAPI dependency enforcing role-based access.

    Usage:
        @router.get("/admin/data", dependencies=[Depends(require_role(UserRole.ADMIN))])

    Args:
        *roles: One or more UserRole values that are permitted.

    Returns:
        An async dependency function.
    """

    async def role_checker(current_user=Depends(get_current_active_user)):
        allowed = [r.value for r in roles]
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed)}",
            )
        return current_user

    return role_checker
