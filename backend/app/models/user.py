"""
User Beanie document model for the AI Women Safety Companion platform.
"""

from datetime import datetime, timezone
from typing import Optional, List, Annotated
from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    """
    Primary user document stored in the 'users' collection.

    Represents all users of the platform (regular users, guardians, admins).
    Safety scores, emergency contacts, and location data are embedded directly.
    """

    email: Annotated[str, Indexed(unique=True)] = Field(
        ..., description="Unique email address for the user"
    )
    username: Annotated[str, Indexed(unique=True)] = Field(
        ..., description="Unique username for display"
    )
    full_name: str = Field(..., description="Full legal name of the user")
    phone: Optional[str] = Field(default=None, description="Phone number with country code")
    password_hash: str = Field(..., description="Bcrypt hashed password")
    role: str = Field(default="user", description="Role: user | guardian | admin")

    # Safety & Profile
    safety_score: float = Field(default=80.0, ge=0, le=100, description="Safety score 0-100")
    is_active: bool = Field(default=True, description="Whether the account is active")
    is_verified: bool = Field(default=False, description="Whether email is verified")
    profile_picture: Optional[str] = Field(default=None, description="URL or path to profile picture")

    # Emergency Contacts (embedded list of dicts)
    emergency_contacts: List[dict] = Field(
        default_factory=list,
        description="List of emergency contacts with name/phone/email/relation",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Account creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last profile update timestamp",
    )
    last_login: Optional[datetime] = Field(default=None, description="Last successful login time")

    # OTP for email verification / password reset
    otp: Optional[str] = Field(default=None, description="Current OTP for verification")
    otp_expiry: Optional[datetime] = Field(default=None, description="OTP expiration timestamp")

    # Location
    location: Optional[dict] = Field(
        default=None,
        description="Last known location: {lat, lng, address, updated_at}",
    )

    class Settings:
        name = "users"
        use_state_management = True
