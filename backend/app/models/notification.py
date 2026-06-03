"""
Notification Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Notification(Document):
    """
    In-app notification document.

    Notifications are created for SOS events, journey milestones,
    guardian requests, and AI alerts.
    """

    user_id: str = Field(..., description="Recipient user ID")
    type: str = Field(
        ...,
        description="Notification type: sos | journey | guardian | ai_alert | system | incident",
    )
    title: str = Field(..., description="Short notification title")
    message: str = Field(..., description="Full notification message body")
    is_read: bool = Field(default=False, description="Whether the notification has been read")
    metadata: Optional[dict] = Field(
        default=None,
        description="Additional context: {related_id, action_url, icon}",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Notification creation timestamp",
    )

    class Settings:
        name = "notifications"
        use_state_management = True
