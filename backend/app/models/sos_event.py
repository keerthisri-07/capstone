"""
SOS Event Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document
from pydantic import Field


class SOSEvent(Document):
    """
    Represents an SOS emergency event triggered by a user.

    When created, the system notifies all emergency contacts and
    triggers n8n automation workflows.
    """

    user_id: str = Field(..., description="ID of the user who triggered SOS")

    # Location at time of SOS
    location: dict = Field(
        ...,
        description="Location: {lat: float, lng: float, address: str}",
    )

    # Emergency Details
    emergency_type: str = Field(
        default="general",
        description="Type: general | medical | assault | stalking | accident | other",
    )
    status: str = Field(
        default="active",
        description="Status: active | resolved | false_alarm",
    )
    message: Optional[str] = Field(
        default=None,
        description="Optional message from the user",
    )
    ai_summary: Optional[str] = Field(
        default=None,
        description="AI-generated emergency situation summary",
    )

    # Notification Tracking
    notified_contacts: List[dict] = Field(
        default_factory=list,
        description="List of contacts notified: {name, phone, email, notified_at, method}",
    )

    # Response Metrics
    response_time: Optional[int] = Field(
        default=None,
        description="Time in seconds until first response",
    )
    resolved_at: Optional[datetime] = Field(
        default=None,
        description="When the SOS was resolved",
    )
    resolved_by: Optional[str] = Field(
        default=None,
        description="Who resolved: user | guardian | admin",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="SOS trigger timestamp",
    )

    class Settings:
        name = "sos_events"
        use_state_management = True
