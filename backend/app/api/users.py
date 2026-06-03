"""
User management API routes.

Endpoints:
  GET  /api/users/me               - Get current user profile
  PUT  /api/users/me               - Update current user profile
  GET  /api/users/me/safety-score  - Get safety score details
  PUT  /api/users/me/location      - Update current location
  GET  /api/users/me/notifications - Get user notifications
  PUT  /api/users/notifications/{id}/read - Mark notification as read
  DELETE /api/users/me            - Delete account (soft delete)
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie import PydanticObjectId

from app.core.security import get_current_active_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.user import UserResponse, UserUpdate, LocationUpdate, NotificationResponse
from app.services.safety_score import calculate_score

router = APIRouter(prefix="/users", tags=["Users"])


def _user_to_response(user: User) -> UserResponse:
    """Convert a User document to a UserResponse schema."""
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        safety_score=user.safety_score,
        is_active=user.is_active,
        is_verified=user.is_verified,
        profile_picture=user.profile_picture,
        emergency_contacts=user.emergency_contacts,
        location=user.location,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login,
    )


# ── GET /me ───────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Retrieve the authenticated user's profile.
    """
    return _user_to_response(current_user)


# ── PUT /me ───────────────────────────────────────────────────────────────────

@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update the authenticated user's profile.

    Only non-null fields in the payload are applied.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.profile_picture is not None:
        current_user.profile_picture = payload.profile_picture
    if payload.emergency_contacts is not None:
        current_user.emergency_contacts = payload.emergency_contacts

    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()

    return _user_to_response(current_user)


# ── GET /me/safety-score ──────────────────────────────────────────────────────

@router.get("/me/safety-score")
async def get_safety_score(current_user: User = Depends(get_current_active_user)):
    """
    Get detailed safety score breakdown for the current user.

    Returns the current score, component breakdown, and trend information.
    """
    score_data = await calculate_score(str(current_user.id))

    return {
        "user_id": str(current_user.id),
        "current_score": current_user.safety_score,
        "calculated_score": score_data.get("score", current_user.safety_score),
        "breakdown": score_data.get("breakdown", {}),
        "trend": score_data.get("trend", "stable"),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "recommendations": score_data.get("recommendations", []),
    }


# ── PUT /me/location ──────────────────────────────────────────────────────────

@router.put("/me/location")
async def update_location(
    payload: LocationUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update the user's current GPS location.

    Used by the mobile app for real-time tracking during journeys.
    """
    current_user.location = {
        "lat": payload.lat,
        "lng": payload.lng,
        "address": payload.address or "Unknown",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()

    return {
        "message": "Location updated successfully",
        "location": current_user.location,
    }


# ── GET /me/notifications ─────────────────────────────────────────────────────

@router.get("/me/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_active_user),
    unread_only: bool = Query(default=False, description="Return only unread notifications"),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """
    Get paginated list of notifications for the current user.
    """
    query = Notification.find(Notification.user_id == str(current_user.id))
    if unread_only:
        query = query.find(Notification.is_read == False)

    notifications = await query.sort(-Notification.created_at).skip(skip).limit(limit).to_list()
    unread_count = await Notification.find(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,
    ).count()

    return {
        "notifications": [
            NotificationResponse(
                id=str(n.id),
                type=n.type,
                title=n.title,
                message=n.message,
                is_read=n.is_read,
                metadata=n.metadata,
                created_at=n.created_at,
            )
            for n in notifications
        ],
        "unread_count": unread_count,
        "total": len(notifications),
        "skip": skip,
        "limit": limit,
    }


# ── PUT /notifications/{id}/read ──────────────────────────────────────────────

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Mark a specific notification as read.
    """
    try:
        notification = await Notification.get(PydanticObjectId(notification_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    if not notification or notification.user_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    await notification.save()

    return {"message": "Notification marked as read", "id": notification_id}


# ── PUT /notifications/read-all ───────────────────────────────────────────────

@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
):
    """
    Mark all notifications as read for the current user.
    """
    await Notification.find(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,
    ).update({"$set": {"is_read": True}})

    return {"message": "All notifications marked as read"}


# ── DELETE /me ────────────────────────────────────────────────────────────────

@router.delete("/me")
async def delete_account(current_user: User = Depends(get_current_active_user)):
    """
    Soft-delete the current user's account.

    Sets is_active=False rather than physically deleting to preserve
    audit trails and incident records.
    """
    current_user.is_active = False
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()

    return {"message": "Account deactivated successfully. Contact support to restore access."}
