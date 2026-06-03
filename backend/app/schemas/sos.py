"""
SOS Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SOSCreate(BaseModel):
    """Schema for triggering an SOS event."""

    lat: float = Field(..., ge=-90, le=90, description="Latitude of the user")
    lng: float = Field(..., ge=-180, le=180, description="Longitude of the user")
    address: Optional[str] = Field(default=None, description="Human-readable address")
    emergency_type: str = Field(
        default="general",
        description="Type: general | medical | assault | stalking | accident | other",
    )
    message: Optional[str] = Field(default=None, description="Optional context message")


class SOSResponse(BaseModel):
    """Schema for SOS event data in API responses."""

    id: str
    user_id: str
    location: dict
    emergency_type: str
    status: str
    message: Optional[str] = None
    ai_summary: Optional[str] = None
    notified_contacts: List[dict] = []
    response_time: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SOSUpdate(BaseModel):
    """Schema for updating SOS event status."""

    status: str = Field(..., description="New status: resolved | false_alarm")
    resolution_note: Optional[str] = Field(default=None, description="Resolution notes")
