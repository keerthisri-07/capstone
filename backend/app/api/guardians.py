"""
Guardian management API routes.

Endpoints:
  POST   /api/guardians              - Add a new guardian
  GET    /api/guardians              - List user's guardians
  PUT    /api/guardians/{id}         - Update guardian details/prefs
  DELETE /api/guardians/{id}         - Remove a guardian
  POST   /api/guardians/{id}/accept  - Accept guardian invitation
  POST   /api/guardians/{id}/decline - Decline guardian invitation
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List

from app.core.security import get_current_active_user
from app.models.guardian import Guardian
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/guardians", tags=["Guardians"])


class GuardianCreate(BaseModel):
    guardian_email: str
    guardian_name: str
    guardian_phone: Optional[str] = None
    relationship: str = "other"
    notification_prefs: Optional[dict] = None


class GuardianUpdate(BaseModel):
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    relationship: Optional[str] = None
    notification_prefs: Optional[dict] = None


def _guardian_to_dict(g: Guardian) -> dict:
    return {
        "id": str(g.id),
        "user_id": g.user_id,
        "guardian_email": g.guardian_email,
        "guardian_name": g.guardian_name,
        "guardian_phone": g.guardian_phone,
        "relationship": g.relationship,
        "status": g.status,
        "notification_prefs": g.notification_prefs,
        "created_at": g.created_at.isoformat(),
        "updated_at": g.updated_at.isoformat(),
    }


# ── POST /guardians ───────────────────────────────────────────────────────────

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_guardian(
    payload: GuardianCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Add a new guardian to the user's safety network.

    Sends an invitation to the guardian's email (mocked in demo mode).
    Guardian must accept the invitation to become active.
    """
    # Check if guardian relationship already exists
    existing = await Guardian.find_one(
        Guardian.user_id == str(current_user.id),
        Guardian.guardian_email == payload.guardian_email,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A guardian with this email already exists in your network",
        )

    guardian = Guardian(
        user_id=str(current_user.id),
        guardian_email=payload.guardian_email,
        guardian_name=payload.guardian_name,
        guardian_phone=payload.guardian_phone,
        relationship=payload.relationship,
        notification_prefs=payload.notification_prefs or {
            "sos_alerts": True,
            "journey_updates": True,
            "daily_summary": False,
            "incident_reports": True,
        },
    )
    await guardian.insert()

    # In demo mode: also add to user's emergency_contacts list
    emergency_contact = {
        "name": payload.guardian_name,
        "phone": payload.guardian_phone or "",
        "email": payload.guardian_email,
        "relationship": payload.relationship,
        "guardian_id": str(guardian.id),
    }
    current_user.emergency_contacts.append(emergency_contact)
    await current_user.save()

    # Send invitation notification to current user
    notification = Notification(
        user_id=str(current_user.id),
        type="guardian",
        title="Guardian Invitation Sent",
        message=f"Invitation sent to {payload.guardian_name} ({payload.guardian_email}). "
                f"Awaiting acceptance. (Demo: use /accept endpoint)",
        metadata={"guardian_id": str(guardian.id)},
    )
    await notification.insert()

    return _guardian_to_dict(guardian)


# ── GET /guardians ────────────────────────────────────────────────────────────

@router.get("/")
async def list_guardians(
    current_user: User = Depends(get_current_active_user),
    status_filter: Optional[str] = Query(default=None, alias="status"),
):
    """List all guardians in the user's safety network."""
    query = Guardian.find(Guardian.user_id == str(current_user.id))
    if status_filter:
        query = query.find(Guardian.status == status_filter)

    guardians = await query.sort(-Guardian.created_at).to_list()
    return {
        "guardians": [_guardian_to_dict(g) for g in guardians],
        "total": len(guardians),
        "active": sum(1 for g in guardians if g.status == "active"),
        "pending": sum(1 for g in guardians if g.status == "pending"),
    }


# ── PUT /guardians/{id} ───────────────────────────────────────────────────────

@router.put("/{guardian_id}")
async def update_guardian(
    guardian_id: str,
    payload: GuardianUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """Update guardian details or notification preferences."""
    try:
        guardian = await Guardian.get(PydanticObjectId(guardian_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")

    if not guardian or guardian.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")

    if payload.guardian_name is not None:
        guardian.guardian_name = payload.guardian_name
    if payload.guardian_phone is not None:
        guardian.guardian_phone = payload.guardian_phone
    if payload.relationship is not None:
        guardian.relationship = payload.relationship
    if payload.notification_prefs is not None:
        guardian.notification_prefs.update(payload.notification_prefs)

    guardian.updated_at = datetime.now(timezone.utc)
    await guardian.save()

    return _guardian_to_dict(guardian)


# ── DELETE /guardians/{id} ────────────────────────────────────────────────────

@router.delete("/{guardian_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_guardian(
    guardian_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Remove a guardian from the user's safety network."""
    try:
        guardian = await Guardian.get(PydanticObjectId(guardian_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")

    if not guardian or guardian.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")

    # Remove from emergency_contacts
    current_user.emergency_contacts = [
        c for c in current_user.emergency_contacts
        if c.get("guardian_id") != guardian_id
    ]
    await current_user.save()

    await guardian.delete()


# ── POST /guardians/{id}/accept ───────────────────────────────────────────────

@router.post("/{guardian_id}/accept")
async def accept_guardian_invitation(
    guardian_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Accept a guardian invitation.

    In a real system, the guardian would receive an email with a link.
    In demo mode, this endpoint simulates the acceptance.
    """
    try:
        guardian = await Guardian.get(PydanticObjectId(guardian_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian invitation not found")

    if not guardian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian invitation not found")

    if guardian.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invitation is already {guardian.status}",
        )

    guardian.status = "active"
    guardian.updated_at = datetime.now(timezone.utc)
    await guardian.save()

    # Notify the user whose guardian this is
    notification = Notification(
        user_id=guardian.user_id,
        type="guardian",
        title="Guardian Accepted",
        message=f"{guardian.guardian_name} has accepted your guardian invitation and is now active.",
        metadata={"guardian_id": guardian_id},
    )
    await notification.insert()

    return {"message": f"Guardian invitation accepted. {guardian.guardian_name} is now active.", "guardian": _guardian_to_dict(guardian)}


# ── POST /guardians/{id}/decline ──────────────────────────────────────────────

@router.post("/{guardian_id}/decline")
async def decline_guardian_invitation(
    guardian_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Decline a guardian invitation."""
    try:
        guardian = await Guardian.get(PydanticObjectId(guardian_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian invitation not found")

    if not guardian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian invitation not found")

    guardian.status = "declined"
    guardian.updated_at = datetime.now(timezone.utc)
    await guardian.save()

    # Notify the user
    notification = Notification(
        user_id=guardian.user_id,
        type="guardian",
        title="Guardian Invitation Declined",
        message=f"{guardian.guardian_name} has declined your guardian invitation.",
        metadata={"guardian_id": guardian_id},
    )
    await notification.insert()

    return {"message": "Guardian invitation declined", "guardian": _guardian_to_dict(guardian)}
