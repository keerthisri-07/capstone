"""
Incident Beanie document model.
"""

from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document
from pydantic import Field


class Incident(Document):
    """
    Represents a safety incident reported by a user.

    Incidents are analyzed by AI to generate timelines, severity assessments,
    and recommended actions. They can be exported as PDF or DOCX reports.
    """

    user_id: str = Field(..., description="ID of the user who reported the incident")

    # Basic Info
    title: str = Field(..., description="Short incident title")
    description: str = Field(..., description="Detailed incident description")
    incident_type: str = Field(
        default="harassment",
        description="Type: harassment | stalking | assault | theft | cyber | other",
    )
    severity: str = Field(
        default="medium",
        description="Severity: low | medium | high | critical",
    )

    # Location
    location: Optional[dict] = Field(
        default=None,
        description="Location: {lat, lng, address, area}",
    )

    # Status
    status: str = Field(
        default="open",
        description="Status: open | under_review | resolved | closed",
    )

    # AI Analysis
    ai_timeline: List[dict] = Field(
        default_factory=list,
        description="AI-generated timeline: [{timestamp, event, severity}]",
    )
    ai_summary: Optional[str] = Field(
        default=None,
        description="AI-generated incident summary",
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="AI-recommended action steps",
    )

    # Metadata
    tags: List[str] = Field(default_factory=list, description="Incident tags for filtering")
    attachments: List[dict] = Field(
        default_factory=list,
        description="Attached files: [{filename, url, type, size}]",
    )
    exported_formats: List[str] = Field(
        default_factory=list,
        description="Previously exported formats: pdf | docx",
    )

    # Incident occurrence time (may differ from report time)
    incident_time: Optional[datetime] = Field(
        default=None,
        description="When the incident actually occurred",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Report creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )

    class Settings:
        name = "incidents"
        use_state_management = True
