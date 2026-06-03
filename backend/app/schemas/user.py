"""
User Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for creating a new user (admin use)."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    full_name: str
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    role: str = "user"


class UserUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)."""

    full_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    emergency_contacts: Optional[List[dict]] = None


class EmergencyContactSchema(BaseModel):
    """Schema for an emergency contact entry."""

    name: str
    phone: str
    email: Optional[str] = None
    relationship: str = "other"
    is_primary: bool = False


class UserResponse(BaseModel):
    """Schema for user data in API responses."""

    id: str
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    role: str
    safety_score: float
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    emergency_contacts: List[dict] = []
    location: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SafetyScoreUpdate(BaseModel):
    """Schema for manually updating safety score (admin only)."""

    safety_score: float = Field(..., ge=0, le=100)
    reason: Optional[str] = None


class LocationUpdate(BaseModel):
    """Schema for updating user's current location."""

    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    address: Optional[str] = Field(default=None, description="Human-readable address")


class NotificationResponse(BaseModel):
    """Schema for notification in API responses."""

    id: str
    type: str
    title: str
    message: str
    is_read: bool
    metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}
