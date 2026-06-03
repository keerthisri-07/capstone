"""
Authentication Pydantic schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """Schema for user registration request."""

    email: EmailStr = Field(..., description="Valid email address")
    username: str = Field(
        ..., min_length=3, max_length=30, description="Unique username (3-30 chars)"
    )
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    phone: Optional[str] = Field(default=None, description="Phone number with country code")
    role: Optional[str] = Field(default="user", description="Role: user | guardian")

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        """Ensure username contains only alphanumeric characters and underscores."""
        import re
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username must contain only letters, digits, and underscores")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce basic password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    """Schema for user login request."""

    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class TokenResponse(BaseModel):
    """Schema for successful authentication token response."""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Access token TTL in seconds")
    user_id: str = Field(..., description="Authenticated user ID")
    role: str = Field(..., description="User role")


class RefreshRequest(BaseModel):
    """Schema for token refresh request."""

    refresh_token: str = Field(..., description="Valid refresh token")


class OTPVerifyRequest(BaseModel):
    """Schema for OTP verification."""

    email: EmailStr = Field(..., description="Email address to verify")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password initiation."""

    email: EmailStr = Field(..., description="Registered email address")


class ResetPasswordRequest(BaseModel):
    """Schema for password reset with OTP."""

    email: EmailStr = Field(..., description="Registered email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP from email")
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str
    success: bool = True
