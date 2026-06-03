"""
Analytics Beanie document model.
"""

from datetime import datetime, timezone
from beanie import Document
from pydantic import Field


class Analytics(Document):
    """
    Daily analytics snapshot per user.

    Aggregated once per day to track safety trends, usage patterns,
    and AI interaction statistics.
    """

    user_id: str = Field(..., description="User this analytics record belongs to")
    date: str = Field(..., description="Date in YYYY-MM-DD format")

    # Activity Counts
    safety_score: float = Field(default=80.0, ge=0, le=100, description="Safety score for the day")
    journeys_count: int = Field(default=0, description="Number of journeys started")
    incidents_count: int = Field(default=0, description="Number of incidents reported")
    sos_count: int = Field(default=0, description="Number of SOS events triggered")
    ai_interactions: int = Field(default=0, description="Number of AI assistant interactions")

    # Risk Assessment
    risk_level: str = Field(
        default="low",
        description="Overall risk level: low | medium | high | critical",
    )

    # Detailed Metrics
    completed_journeys: int = Field(default=0, description="Journeys completed successfully")
    emergency_journeys: int = Field(default=0, description="Journeys that turned emergency")
    avg_journey_duration: float = Field(
        default=0.0, description="Average journey duration in minutes"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Record creation timestamp",
    )

    class Settings:
        name = "analytics"
        use_state_management = True
