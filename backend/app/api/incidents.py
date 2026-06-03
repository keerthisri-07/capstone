"""
Incident management and reporting API routes.

Endpoints:
  POST   /api/incidents                         - Report a new incident
  GET    /api/incidents                         - List incidents
  GET    /api/incidents/{id}                    - Get incident details
  PUT    /api/incidents/{id}                    - Update incident
  DELETE /api/incidents/{id}                    - Delete incident
  POST   /api/incidents/{id}/export/{format}    - Export as PDF or DOCX
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Query, BackgroundTasks
from fastapi.responses import Response
from beanie import PydanticObjectId

from app.core.security import get_current_active_user
from app.models.incident import Incident
from app.models.user import User
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.agents.incident_agent import analyze_incident
from app.services.report_generator import generate_incident_pdf, generate_incident_docx

router = APIRouter(prefix="/incidents", tags=["Incidents"])


def _incident_to_response(incident: Incident) -> IncidentResponse:
    """Convert Incident document to IncidentResponse schema."""
    return IncidentResponse(
        id=str(incident.id),
        user_id=incident.user_id,
        title=incident.title,
        description=incident.description,
        incident_type=incident.incident_type,
        severity=incident.severity,
        location=incident.location,
        status=incident.status,
        ai_timeline=incident.ai_timeline,
        ai_summary=incident.ai_summary,
        recommended_actions=incident.recommended_actions,
        tags=incident.tags,
        attachments=incident.attachments,
        exported_formats=incident.exported_formats,
        incident_time=incident.incident_time,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
    )


# ── POST /incidents ───────────────────────────────────────────────────────────

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    payload: IncidentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
):
    """
    Report a new safety incident.

    AI analysis (timeline generation, severity assessment, recommendations) is
    triggered in the background and updates the incident record asynchronously.
    """
    incident = Incident(
        user_id=str(current_user.id),
        title=payload.title,
        description=payload.description,
        incident_type=payload.incident_type,
        severity=payload.severity,
        location=payload.location,
        tags=payload.tags or [],
        incident_time=payload.incident_time or datetime.now(timezone.utc),
    )
    await incident.insert()

    # Queue AI analysis
    background_tasks.add_task(_run_incident_ai_analysis, str(incident.id), payload.description)

    return _incident_to_response(incident)


async def _run_incident_ai_analysis(incident_id: str, description: str):
    """Background task: run AI incident analysis."""
    try:
        incident = await Incident.get(PydanticObjectId(incident_id))
        if not incident:
            return

        result = await analyze_incident({
            "incident_id": incident_id,
            "title": incident.title,
            "description": description,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "location": incident.location,
        })

        incident.ai_timeline = result.get("timeline", [])
        incident.ai_summary = result.get("summary", "")
        incident.recommended_actions = result.get("recommended_actions", [])
        incident.severity = result.get("assessed_severity", incident.severity)
        incident.updated_at = datetime.now(timezone.utc)
        await incident.save()
    except Exception:
        pass


# ── GET /incidents ────────────────────────────────────────────────────────────

@router.get("/", response_model=list[IncidentResponse])
async def list_incidents(
    current_user: User = Depends(get_current_active_user),
    severity: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    incident_type: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """Get paginated list of incidents for the current user."""
    query = Incident.find(Incident.user_id == str(current_user.id))
    if severity:
        query = query.find(Incident.severity == severity)
    if status_filter:
        query = query.find(Incident.status == status_filter)
    if incident_type:
        query = query.find(Incident.incident_type == incident_type)

    incidents = await query.sort(-Incident.created_at).skip(skip).limit(limit).to_list()
    return [_incident_to_response(i) for i in incidents]


# ── GET /incidents/{id} ───────────────────────────────────────────────────────

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific incident by ID."""
    try:
        incident = await Incident.get(PydanticObjectId(incident_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    if not incident or incident.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    return _incident_to_response(incident)


# ── PUT /incidents/{id} ───────────────────────────────────────────────────────

@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    payload: IncidentUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """Update an existing incident report."""
    try:
        incident = await Incident.get(PydanticObjectId(incident_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    if not incident or incident.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    if payload.title is not None:
        incident.title = payload.title
    if payload.description is not None:
        incident.description = payload.description
    if payload.severity is not None:
        incident.severity = payload.severity
    if payload.status is not None:
        incident.status = payload.status
    if payload.tags is not None:
        incident.tags = payload.tags

    incident.updated_at = datetime.now(timezone.utc)
    await incident.save()
    return _incident_to_response(incident)


# ── DELETE /incidents/{id} ────────────────────────────────────────────────────

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Delete an incident report."""
    try:
        incident = await Incident.get(PydanticObjectId(incident_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    if not incident or incident.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    await incident.delete()


# ── POST /incidents/{id}/export/{format} ──────────────────────────────────────

@router.post("/{incident_id}/export/{export_format}")
async def export_incident(
    incident_id: str,
    export_format: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Export incident report as PDF or DOCX.

    Generates a professionally formatted document with:
    - Incident title and severity badge
    - AI-generated timeline
    - Summary and recommendations
    - Location information
    - Footer with generation timestamp

    Args:
        export_format: 'pdf' or 'docx'
    """
    if export_format.lower() not in ("pdf", "docx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Use 'pdf' or 'docx'",
        )

    try:
        incident = await Incident.get(PydanticObjectId(incident_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    if not incident or incident.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    # Build incident dict for report generators
    incident_dict = {
        "id": incident_id,
        "title": incident.title,
        "description": incident.description,
        "incident_type": incident.incident_type,
        "severity": incident.severity,
        "status": incident.status,
        "location": incident.location,
        "ai_timeline": incident.ai_timeline,
        "ai_summary": incident.ai_summary,
        "recommended_actions": incident.recommended_actions,
        "tags": incident.tags,
        "incident_time": incident.incident_time.isoformat() if incident.incident_time else None,
        "created_at": incident.created_at.isoformat(),
    }

    if export_format.lower() == "pdf":
        content = generate_incident_pdf(incident_dict)
        media_type = "application/pdf"
        filename = f"incident_{incident_id[:8]}.pdf"
    else:
        content = generate_incident_docx(incident_dict)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"incident_{incident_id[:8]}.docx"

    # Track export format
    if export_format.lower() not in incident.exported_formats:
        incident.exported_formats.append(export_format.lower())
        incident.updated_at = datetime.now(timezone.utc)
        await incident.save()

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(content)),
        },
    )
