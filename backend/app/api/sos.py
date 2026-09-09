"""
SOS (Emergency) API routes.

Endpoints:
  POST /api/sos               - Trigger SOS alert
  GET  /api/sos               - List SOS events
  GET  /api/sos/{id}          - Get SOS event details
  PUT  /api/sos/{id}/resolve  - Resolve SOS event
  DELETE /api/sos/{id}        - Delete SOS event
"""

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks, Query
from beanie import PydanticObjectId

from app.core.security import get_current_active_user
from app.models.sos_event import SOSEvent
from app.models.user import User
from app.models.notification import Notification
from app.schemas.sos import SOSCreate, SOSResponse, SOSUpdate
from app.integrations.n8n_client import trigger_sos_workflow
from app.agents.emergency_agent import handle_emergency

router = APIRouter(prefix="/sos", tags=["SOS / Emergency"])


def _sos_to_response(sos: SOSEvent) -> SOSResponse:
    """Convert SOSEvent document to SOSResponse schema."""
    return SOSResponse(
        id=str(sos.id),
        user_id=sos.user_id,
        location=sos.location,
        emergency_type=sos.emergency_type,
        status=sos.status,
        message=sos.message,
        ai_summary=sos.ai_summary,
        notified_contacts=sos.notified_contacts,
        response_time=sos.response_time,
        resolved_at=sos.resolved_at,
        created_at=sos.created_at,
    )


# ── POST /sos ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=SOSResponse, status_code=status.HTTP_201_CREATED)
async def trigger_sos(
    payload: SOSCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
):
    """
    Trigger an SOS emergency alert.

    This endpoint:
    1. Creates an SOS event record in the database
    2. Triggers n8n automation webhook (non-blocking)
    3. Runs the emergency AI agent (background)
    4. Notifies all registered emergency contacts
    5. Creates an in-app notification

    Returns immediately with SOS event ID for tracking.
    """
    location_data = {
        "lat": payload.lat,
        "lng": payload.lng,
        "address": payload.address or "Location unavailable",
    }

    # Generate AI summary (mock for now, replaced by background agent)
    ai_summary = (
        f"EMERGENCY ALERT: {current_user.full_name} triggered an SOS at "
        f"{location_data['address']}. Emergency type: {payload.emergency_type}. "
        f"Immediate assistance may be required. All emergency contacts are being notified."
    )

    # Build notified contacts list from user's emergency contacts
    notified = []
    for contact in current_user.emergency_contacts:
        notified.append({
            "name": contact.get("name", "Unknown"),
            "phone": contact.get("phone", ""),
            "email": contact.get("email", ""),
            "method": "sms+email",
            "notified_at": datetime.now(timezone.utc).isoformat(),
            "status": "sent",
        })

    sos = SOSEvent(
        user_id=str(current_user.id),
        location=location_data,
        emergency_type=payload.emergency_type,
        message=payload.message,
        ai_summary=ai_summary,
        notified_contacts=notified,
    )
    await sos.insert()

    sos_id = str(sos.id)

    # Non-blocking background tasks
    background_tasks.add_task(
        trigger_sos_workflow,
        {
            "sos_id": sos_id,
            "user_id": str(current_user.id),
            "user_name": current_user.full_name,
            "user_phone": current_user.phone,
            "location": location_data,
            "emergency_type": payload.emergency_type,
            "message": payload.message,
            "contacts": notified,
            "timestamp": sos.created_at.isoformat(),
        },
    )

    background_tasks.add_task(
        _run_emergency_agent_background,
        sos_id,
        str(current_user.id),
        current_user.full_name,
        location_data,
        payload.emergency_type,
    )

    # Create in-app notification
    notification = Notification(
        user_id=str(current_user.id),
        type="sos",
        title="🚨 SOS Alert Triggered",
        message=f"Your SOS alert has been sent. {len(notified)} contacts notified. "
                f"Emergency services: 112 | Women Helpline: 181",
        metadata={"sos_id": sos_id, "priority": "critical"},
    )
    await notification.insert()

    return _sos_to_response(sos)


async def _run_emergency_agent_background(
    sos_id: str,
    user_id: str,
    user_name: str,
    location: dict,
    emergency_type: str,
):
    """Background task: run AI emergency agent to enhance SOS response."""
    try:
        result = await handle_emergency({
            "sos_id": sos_id,
            "user_id": user_id,
            "user_name": user_name,
            "location": location,
            "emergency_type": emergency_type,
        })
        sos = await SOSEvent.get(PydanticObjectId(sos_id))
        if sos and result:
            sos.ai_summary = result.get("summary", sos.ai_summary)
            await sos.save()
    except Exception:
        pass


# ── GET /sos ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[SOSResponse])
async def list_sos_events(
    current_user: User = Depends(get_current_active_user),
    status_filter: str = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """Get paginated list of the user's SOS events."""
    query = SOSEvent.find(SOSEvent.user_id == str(current_user.id))
    if status_filter:
        query = query.find(SOSEvent.status == status_filter)

    events = await query.sort(-SOSEvent.created_at).skip(skip).limit(limit).to_list()
    return [_sos_to_response(e) for e in events]


# ── GET /sos/{id} ─────────────────────────────────────────────────────────────

@router.get("/{sos_id}", response_model=SOSResponse)
async def get_sos_event(
    sos_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific SOS event by ID."""
    try:
        sos = await SOSEvent.get(PydanticObjectId(sos_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    if not sos or sos.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    return _sos_to_response(sos)


# ── PUT /sos/{id}/resolve ─────────────────────────────────────────────────────

@router.put("/{sos_id}/resolve", response_model=SOSResponse)
async def resolve_sos(
    sos_id: str,
    payload: SOSUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Resolve an active SOS event.

    Call this when the user is safe or if it was a false alarm.
    """
    try:
        sos = await SOSEvent.get(PydanticObjectId(sos_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    if not sos or sos.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    if sos.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SOS event is already {sos.status}",
        )

    now = datetime.now(timezone.utc)
    sos.status = payload.status  # resolved | false_alarm
    sos.resolved_at = now
    sos.resolved_by = "user"

    if payload.resolution_note:
        sos.ai_summary = (sos.ai_summary or "") + f"\n\nResolution: {payload.resolution_note}"

    # Calculate response time
    response_seconds = (now - sos.created_at).total_seconds()
    sos.response_time = int(response_seconds)

    await sos.save()

    # Notification
    notification = Notification(
        user_id=str(current_user.id),
        type="sos",
        title="SOS Resolved",
        message=f"Your SOS alert has been marked as '{payload.status}'. Stay safe!",
        metadata={"sos_id": sos_id},
    )
    await notification.insert()

    return _sos_to_response(sos)


# ── DELETE /sos/{id} ──────────────────────────────────────────────────────────

@router.delete("/{sos_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sos_event(
    sos_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Delete a resolved SOS event record."""
    try:
        sos = await SOSEvent.get(PydanticObjectId(sos_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    if not sos or sos.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")

    if sos.status == "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an active SOS event. Resolve it first.",
        )

    await sos.delete()


# ── POST /sos/voice-trigger ───────────────────────────────────────────────────

@router.post("/voice-trigger")
async def trigger_voice_sos(
    payload: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
):
    """
    Voice-activated SOS endpoint. Triggered when custom voice keyword (e.g., 'Help me SURAKSHA')
    is detected through browser/app speech recognition.
    """
    keyword = payload.get("keyword", "Help me SURAKSHA")
    lat = payload.get("latitude", 12.9716)
    lng = payload.get("longitude", 77.5946)

    location_data = {
        "lat": lat,
        "lng": lng,
        "address": payload.get("address", "Live GPS Coordinates"),
    }

    event_id = f"SOS-VOICE-{int(datetime.now(timezone.utc).timestamp())}"

    # Non-blocking trigger to n8n emergency workflow
    background_tasks.add_task(
        trigger_sos_workflow,
        sos_id=event_id,
        user_name=current_user.full_name or "SURAKSHA User",
        user_phone=current_user.phone or "N/A",
        location=location_data,
        message=f"Voice SOS activated by keyword '{keyword}'",
        contacts=current_user.emergency_contacts or [],
    )

    return {
        "status": "triggered",
        "event_id": event_id,
        "trigger_type": "voice_sos",
        "keyword": keyword,
        "location": location_data,
        "message": f"Voice SOS initiated for keyword '{keyword}'. Trust Circle & n8n notified.",
    }


# ── GET /sos/offline-payload ──────────────────────────────────────────────────

@router.get("/offline-payload")
async def get_offline_sms_payload(
    lat: float = Query(12.9716),
    lng: float = Query(77.5946),
):
    """
    Generates standard offline SMS message payload for offline emergency dispatch.
    """
    body = (
        f"🚨 EMERGENCY ALERT FROM SURAKSHA!\n"
        f"I need urgent assistance!\n"
        f"Location: https://maps.google.com/?q={lat},{lng}\n"
        f"Coordinates: {lat}, {lng}"
    )
    return {
        "sms_uri": f"sms:?body={body}",
        "message_body": body,
        "emergency_number": "112",
        "women_helpline": "1091",
    }

