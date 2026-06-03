"""
Guardian relationship Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Guardian(Document):
    """
    Represents a guardian-user relationship.

    When a user adds a guardian, a pending Guardian record is created.
    The guardian must accept to activate the relationship.
    """

    user_id: str = Field(..., description="ID of the user who added the guardian")
    guardian_email: str = Field(..., description="Email address of the guardian")
    guardian_name: str = Field(..., description="Full name of the guardian")
    guardian_phone: Optional[str] = Field(default=None, description="Guardian's phone number")
    relationship: str = Field(
        default="other",
        description="Relationship type: parent | sibling | friend | spouse | other",
    )
    status: str = Field(
        default="pending",
        description="Status: pending | active | declined",
    )
    notification_prefs: dict = Field(
        default_factory=lambda: {
            "sos_alerts": True,
            "journey_updates": True,
            "daily_summary": False,
            "incident_reports": True,
        },
        description="Guardian notification preferences",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the guardian was added",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the record was last updated",
    )

    class Settings:
        name = "guardians"
        use_state_management = True
