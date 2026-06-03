"""
Journey monitoring Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document
from pydantic import Field


class Journey(Document):
    """
    Represents a user's travel journey with safety monitoring.

    Tracks real-time checkpoints, route deviations, and AI safety assessments.
    Status transitions: active -> completed | emergency
    """

    user_id: str = Field(..., description="ID of the travelling user")

    # Route Info
    source: str = Field(..., description="Starting location name or address")
    destination: str = Field(..., description="Destination name or address")
    source_coords: Optional[dict] = Field(
        default=None, description="Starting coordinates {lat, lng}"
    )
    destination_coords: Optional[dict] = Field(
        default=None, description="Destination coordinates {lat, lng}"
    )
    travel_mode: str = Field(
        default="walking",
        description="Travel mode: walking | auto | bus | metro | cab",
    )

    # Status & Timing
    status: str = Field(
        default="active",
        description="Journey status: active | completed | emergency",
    )
    start_time: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Journey start timestamp",
    )
    end_time: Optional[datetime] = Field(default=None, description="Journey end timestamp")
    expected_duration: Optional[int] = Field(
        default=None, description="Expected journey duration in minutes"
    )
    actual_duration: Optional[int] = Field(
        default=None, description="Actual journey duration in minutes"
    )

    # Tracking Data
    checkpoints: List[dict] = Field(
        default_factory=list,
        description="List of checkpoint records: {lat, lng, timestamp, note}",
    )
    deviations: List[dict] = Field(
        default_factory=list,
        description="List of detected route deviations",
    )

    # Safety Assessment
    safety_score: float = Field(default=85.0, ge=0, le=100, description="Journey safety score")
    ai_analysis: Optional[dict] = Field(
        default=None,
        description="AI safety assessment and recommendations",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Record creation timestamp",
    )

    class Settings:
        name = "journeys"
        use_state_management = True
