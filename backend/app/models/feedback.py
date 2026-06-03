"""
Feedback Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Feedback(Document):
    """
    User feedback on platform features.

    Collected to improve AI models and UX. Includes star ratings
    and optional textual comments.
    """

    user_id: str = Field(..., description="User who submitted feedback")
    feature: str = Field(
        ...,
        description="Feature name: ai_chat | journey | sos | incident | dashboard | general",
    )
    rating: int = Field(..., ge=1, le=5, description="Star rating 1-5")
    comment: Optional[str] = Field(default=None, description="Optional text feedback")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Feedback submission timestamp",
    )

    class Settings:
        name = "feedback"
        use_state_management = True
