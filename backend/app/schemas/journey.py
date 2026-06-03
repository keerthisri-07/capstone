"""
Journey Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class JourneyCreate(BaseModel):
    """Schema for creating a new journey."""

    source: str = Field(..., description="Starting location name or address")
    destination: str = Field(..., description="Destination name or address")
    source_coords: Optional[dict] = Field(
        default=None, description="Source coordinates {lat, lng}"
    )
    destination_coords: Optional[dict] = Field(
        default=None, description="Destination coordinates {lat, lng}"
    )
    travel_mode: str = Field(
        default="walking",
        description="Travel mode: walking | auto | bus | metro | cab",
    )
    expected_duration: Optional[int] = Field(
        default=None, description="Expected duration in minutes"
    )


class JourneyUpdate(BaseModel):
    """Schema for updating journey details."""

    status: Optional[str] = None
    expected_duration: Optional[int] = None
    destination: Optional[str] = None
    destination_coords: Optional[dict] = None


class CheckpointUpdate(BaseModel):
    """Schema for adding a checkpoint to a journey."""

    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    note: Optional[str] = Field(default=None, description="Optional note for this checkpoint")
    timestamp: Optional[datetime] = None


class JourneyResponse(BaseModel):
    """Schema for journey data in API responses."""

    id: str
    user_id: str
    source: str
    destination: str
    source_coords: Optional[dict] = None
    destination_coords: Optional[dict] = None
    travel_mode: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    expected_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    checkpoints: List[dict] = []
    deviations: List[dict] = []
    safety_score: float
    ai_analysis: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}
