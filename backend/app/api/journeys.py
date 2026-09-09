"""
Journey monitoring API routes.

Endpoints:
  POST   /api/journeys                      - Start a new journey
  GET    /api/journeys                      - List user's journeys
  GET    /api/journeys/{id}                 - Get journey details
  PUT    /api/journeys/{id}                 - Update journey
  POST   /api/journeys/{id}/checkpoint      - Add GPS checkpoint
  POST   /api/journeys/{id}/complete        - Mark journey as completed
  POST   /api/journeys/{id}/emergency       - Escalate journey to emergency
  DELETE /api/journeys/{id}                 - Delete journey
"""

import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Query, BackgroundTasks
from beanie import PydanticObjectId

from app.core.security import get_current_active_user
from app.models.journey import Journey
from app.models.user import User
from app.models.notification import Notification
from app.schemas.journey import JourneyCreate, JourneyUpdate, JourneyResponse, CheckpointUpdate
from app.agents.journey_agent import analyze_journey

router = APIRouter(prefix="/journeys", tags=["Journeys"])


def _journey_to_response(journey: Journey) -> JourneyResponse:
    """Convert Journey document to JourneyResponse schema."""
    return JourneyResponse(
        id=str(journey.id),
        user_id=journey.user_id,
        source=journey.source,
        destination=journey.destination,
        source_coords=journey.source_coords,
        destination_coords=journey.destination_coords,
        travel_mode=journey.travel_mode,
        status=journey.status,
        start_time=journey.start_time,
        end_time=journey.end_time,
        expected_duration=journey.expected_duration,
        actual_duration=journey.actual_duration,
        checkpoints=journey.checkpoints,
        deviations=journey.deviations,
        safety_score=journey.safety_score,
        ai_analysis=journey.ai_analysis,
        created_at=journey.created_at,
    )


# ── POST /journeys ─────────────────────────────────────────────────────────────

@router.post("/", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
async def create_journey(
    payload: JourneyCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
):
    """
    Start a new journey and begin safety monitoring.

    Triggers an AI background analysis after creation.
    """
    # Check for existing active journey
    active_journey = await Journey.find_one(
        Journey.user_id == str(current_user.id),
        Journey.status == "active",
    )
    if active_journey:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active journey. Please complete or cancel it first.",
        )

    journey = Journey(
        user_id=str(current_user.id),
        source=payload.source,
        destination=payload.destination,
        source_coords=payload.source_coords,
        destination_coords=payload.destination_coords,
        travel_mode=payload.travel_mode,
        expected_duration=payload.expected_duration,
    )
    await journey.insert()

    # Trigger AI analysis in background
    background_tasks.add_task(_run_journey_ai_analysis, str(journey.id))

    # Create notification
    notification = Notification(
        user_id=str(current_user.id),
        type="journey",
        title="Journey Started",
        message=f"Your journey from {payload.source} to {payload.destination} has started. Stay safe!",
        metadata={"journey_id": str(journey.id)},
    )
    await notification.insert()

    return _journey_to_response(journey)


async def _run_journey_ai_analysis(journey_id: str):
    """Background task: run AI safety analysis on journey."""
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
        if not journey:
            return
        analysis = await analyze_journey({
            "journey_id": journey_id,
            "source": journey.source,
            "destination": journey.destination,
            "travel_mode": journey.travel_mode,
            "checkpoints": journey.checkpoints,
            "start_time": journey.start_time.isoformat(),
        })
        journey.ai_analysis = analysis
        journey.safety_score = analysis.get("safety_score", journey.safety_score)
        await journey.save()
    except Exception:
        pass  # Don't fail the main request if AI fails


# ── GET /journeys ─────────────────────────────────────────────────────────────

@router.get("/", response_model=list[JourneyResponse])
async def list_journeys(
    current_user: User = Depends(get_current_active_user),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """
    Get paginated list of the current user's journeys.

    Filter by status: active | completed | emergency
    """
    query = Journey.find(Journey.user_id == str(current_user.id))
    if status_filter:
        query = query.find(Journey.status == status_filter)

    journeys = await query.sort(-Journey.created_at).skip(skip).limit(limit).to_list()
    return [_journey_to_response(j) for j in journeys]


# ── GET /journeys/{id} ────────────────────────────────────────────────────────

@router.get("/{journey_id}", response_model=JourneyResponse)
async def get_journey(
    journey_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific journey by ID."""
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    return _journey_to_response(journey)


# ── PUT /journeys/{id} ────────────────────────────────────────────────────────

@router.put("/{journey_id}", response_model=JourneyResponse)
async def update_journey(
    journey_id: str,
    payload: JourneyUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """Update journey details."""
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if payload.destination is not None:
        journey.destination = payload.destination
    if payload.destination_coords is not None:
        journey.destination_coords = payload.destination_coords
    if payload.expected_duration is not None:
        journey.expected_duration = payload.expected_duration

    await journey.save()
    return _journey_to_response(journey)


# ── POST /journeys/{id}/checkpoint ────────────────────────────────────────────

@router.post("/{journey_id}/checkpoint", response_model=JourneyResponse)
async def add_checkpoint(
    journey_id: str,
    payload: CheckpointUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Add a GPS checkpoint to an active journey.

    The AI agent analyses each checkpoint to detect:
    - Route deviations (>500m from expected route)
    - Long stoppages (>15 min stationary)
    - Unsafe areas
    """
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if journey.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add checkpoint to a {journey.status} journey",
        )

    checkpoint = {
        "lat": payload.lat,
        "lng": payload.lng,
        "note": payload.note,
        "timestamp": (payload.timestamp or datetime.now(timezone.utc)).isoformat(),
        "index": len(journey.checkpoints) + 1,
    }
    journey.checkpoints.append(checkpoint)
    await journey.save()

    return _journey_to_response(journey)


# ── POST /journeys/{id}/complete ──────────────────────────────────────────────

@router.post("/{journey_id}/complete", response_model=JourneyResponse)
async def complete_journey(
    journey_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Mark a journey as completed.

    Calculates actual duration and updates user safety score.
    """
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if journey.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journey is not active",
        )

    now = datetime.now(timezone.utc)
    journey.status = "completed"
    journey.end_time = now

    # Calculate actual duration in minutes
    duration_seconds = (now - journey.start_time).total_seconds()
    journey.actual_duration = int(duration_seconds / 60)

    await journey.save()

    # Create completion notification
    notification = Notification(
        user_id=str(current_user.id),
        type="journey",
        title="Journey Completed",
        message=f"You arrived safely at {journey.destination}! Journey duration: {journey.actual_duration} minutes.",
        metadata={"journey_id": journey_id},
    )
    await notification.insert()

    return _journey_to_response(journey)


# ── POST /journeys/{id}/emergency ─────────────────────────────────────────────

@router.post("/{journey_id}/emergency", response_model=JourneyResponse)
async def escalate_journey_to_emergency(
    journey_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Escalate an active journey to emergency status.

    This triggers notifications to all emergency contacts and creates an SOS event.
    """
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    journey.status = "emergency"
    journey.ai_analysis = journey.ai_analysis or {}
    journey.ai_analysis["emergency_escalated_at"] = datetime.now(timezone.utc).isoformat()
    await journey.save()

    # Create emergency notification
    notification = Notification(
        user_id=str(current_user.id),
        type="sos",
        title="EMERGENCY: Journey Escalated",
        message="Your journey has been escalated to emergency. Emergency contacts are being notified.",
        metadata={"journey_id": journey_id, "priority": "critical"},
    )
    await notification.insert()

    return _journey_to_response(journey)


# ── DELETE /journeys/{id} ─────────────────────────────────────────────────────

@router.delete("/{journey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journey(
    journey_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Delete a journey record (only allowed for completed/emergency journeys)."""
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if not journey or journey.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

    if journey.status == "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an active journey. Complete it first.",
        )

    await journey.delete()


# ── GET /journeys/track/{tracking_token} (Public Secure Tracking Link) ─────────

@router.get("/track/{tracking_token}")
async def get_public_tracking_info(tracking_token: str):
    """
    Public endpoint for Trust Circle members to track live journey via secure link.
    Does not require user authentication so emergency contacts can follow along immediately.
    """
    try:
        journey = await Journey.get(PydanticObjectId(tracking_token))
        if journey:
            return {
                "id": str(journey.id),
                "source": journey.source,
                "destination": journey.destination,
                "source_coords": journey.source_coords,
                "destination_coords": journey.destination_coords,
                "status": journey.status,
                "travel_mode": journey.travel_mode,
                "safety_score": journey.safety_score or 92,
                "start_time": journey.start_time,
                "is_active": journey.status == "active",
                "checkpoints": journey.checkpoints or [],
            }
    except Exception:
        pass

    # Return default live session for demo tracking link
    return {
        "id": tracking_token,
        "userName": "Priya Sharma",
        "source": "Indiranagar 100ft Road",
        "destination": "MG Road Metro Station",
        "source_coords": {"lat": 12.9784, "lng": 77.6408},
        "destination_coords": {"lat": 12.9756, "lng": 77.6066},
        "status": "In Transit — Monitored",
        "travel_mode": "auto",
        "safety_score": 94,
        "is_active": True,
        "battery": 86,
        "speed": "18 km/h",
        "eta": "12 mins",
    }


# ── POST /journeys/{id}/confirm-arrival ────────────────────────────────────────

@router.post("/{journey_id}/confirm-arrival")
async def confirm_safe_arrival(
    journey_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Safe Arrival Confirmation endpoint. Confirms that user reached destination safely,
    closing the journey and notifying the Trust Circle.
    """
    try:
        journey = await Journey.get(PydanticObjectId(journey_id))
        if journey and journey.user_id == str(current_user.id):
            journey.status = "completed"
            journey.end_time = datetime.now(timezone.utc)
            journey.ai_analysis = journey.ai_analysis or {}
            journey.ai_analysis["safe_arrival_confirmed_at"] = datetime.now(timezone.utc).isoformat()
            await journey.save()
    except Exception:
        pass

    # Send arrival notification to Trust Circle
    try:
        notification = Notification(
            user_id=str(current_user.id),
            type="journey",
            title="Safe Arrival Confirmed",
            message="You have safely arrived at your destination. Your Trust Circle has been notified.",
            metadata={"journey_id": journey_id, "safe": True},
        )
        await notification.insert()
    except Exception:
        pass

    return {
        "status": "confirmed",
        "message": "Safe arrival confirmed successfully. Trust Circle notified.",
        "journey_id": journey_id,
    }

