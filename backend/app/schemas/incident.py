"""
Incident Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    """Schema for creating a new incident report."""

    title: str = Field(..., min_length=5, max_length=200, description="Short incident title")
    description: str = Field(..., min_length=20, description="Detailed description")
    incident_type: str = Field(
        default="harassment",
        description="Type: harassment | stalking | assault | theft | cyber | other",
    )
    severity: str = Field(
        default="medium",
        description="Severity: low | medium | high | critical",
    )
    location: Optional[dict] = Field(
        default=None,
        description="Location: {lat, lng, address, area}",
    )
    incident_time: Optional[datetime] = Field(
        default=None,
        description="When the incident occurred (defaults to now)",
    )
    tags: Optional[List[str]] = Field(default_factory=list, description="Incident tags")


class IncidentUpdate(BaseModel):
    """Schema for updating an existing incident."""

    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None


class IncidentResponse(BaseModel):
    """Schema for incident data in API responses."""

    id: str
    user_id: str
    title: str
    description: str
    incident_type: str
    severity: str
    location: Optional[dict] = None
    status: str
    ai_timeline: List[dict] = []
    ai_summary: Optional[str] = None
    recommended_actions: List[str] = []
    tags: List[str] = []
    attachments: List[dict] = []
    exported_formats: List[str] = []
    incident_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IncidentExport(BaseModel):
    """Schema for incident export request."""

    format: str = Field(..., description="Export format: pdf | docx")
    include_timeline: bool = Field(default=True)
    include_recommendations: bool = Field(default=True)
    include_location: bool = Field(default=True)
