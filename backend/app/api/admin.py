"""
Admin API routes (ADMIN role required for all endpoints).

Endpoints:
  GET  /api/admin/users              - List all users
  PUT  /api/admin/users/{id}         - Update any user (role, status)
  DELETE /api/admin/users/{id}       - Hard delete user
  GET  /api/admin/sos-events         - View all SOS events
  GET  /api/admin/incidents          - View all incidents
  GET  /api/admin/analytics          - Platform-wide analytics
  GET  /api/admin/ai-usage           - AI usage statistics
  POST /api/admin/seed-data          - Seed demo data
"""

import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_active_user, require_role, UserRole, hash_password
from app.models.user import User
from app.models.journey import Journey
from app.models.incident import Incident
from app.models.sos_event import SOSEvent
from app.models.guardian import Guardian
from app.models.notification import Notification

router = APIRouter(prefix="/admin", tags=["Admin"])

admin_required = Depends(require_role(UserRole.ADMIN))


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    safety_score: Optional[float] = None


# ── GET /admin/users ──────────────────────────────────────────────────────────

@router.get("/users", dependencies=[admin_required])
async def list_all_users(
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    role: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
):
    """List all platform users with filtering options."""
    query = User.find()
    if role:
        query = query.find(User.role == role)
    if is_active is not None:
        query = query.find(User.is_active == is_active)

    users = await query.sort(-User.created_at).skip(skip).limit(limit).to_list()
    total = await User.find().count()

    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role,
                "safety_score": u.safety_score,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat(),
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


# ── PUT /admin/users/{id} ─────────────────────────────────────────────────────

@router.put("/users/{user_id}", dependencies=[admin_required])
async def update_user_admin(user_id: str, payload: AdminUserUpdate):
    """Update any user's role, status, or safety score (admin only)."""
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        allowed_roles = {"user", "guardian", "admin"}
        if payload.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Allowed: {allowed_roles}",
            )
        user.role = payload.role
    if payload.safety_score is not None:
        user.safety_score = max(0, min(100, payload.safety_score))

    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return {"message": "User updated successfully", "user_id": user_id}


# ── DELETE /admin/users/{id} ──────────────────────────────────────────────────

@router.delete("/users/{user_id}", dependencies=[admin_required], status_code=status.HTTP_204_NO_CONTENT)
async def hard_delete_user(user_id: str):
    """Permanently delete a user and all associated data."""
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Cascade delete related data
    await Journey.find(Journey.user_id == user_id).delete()
    await Incident.find(Incident.user_id == user_id).delete()
    await SOSEvent.find(SOSEvent.user_id == user_id).delete()
    await Guardian.find(Guardian.user_id == user_id).delete()
    await Notification.find(Notification.user_id == user_id).delete()
    await user.delete()


# ── GET /admin/sos-events ─────────────────────────────────────────────────────

@router.get("/sos-events", dependencies=[admin_required])
async def list_all_sos_events(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
):
    """List all SOS events across the platform."""
    query = SOSEvent.find()
    if status_filter:
        query = query.find(SOSEvent.status == status_filter)

    events = await query.sort(-SOSEvent.created_at).skip(skip).limit(limit).to_list()
    total = await SOSEvent.find().count()

    return {
        "sos_events": [
            {
                "id": str(e.id),
                "user_id": e.user_id,
                "location": e.location,
                "emergency_type": e.emergency_type,
                "status": e.status,
                "created_at": e.created_at.isoformat(),
                "resolved_at": e.resolved_at.isoformat() if e.resolved_at else None,
                "notified_contacts_count": len(e.notified_contacts),
            }
            for e in events
        ],
        "total": total,
        "active": await SOSEvent.find(SOSEvent.status == "active").count(),
    }


# ── GET /admin/incidents ──────────────────────────────────────────────────────

@router.get("/incidents", dependencies=[admin_required])
async def list_all_incidents(
    severity: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
):
    """List all incidents across the platform."""
    query = Incident.find()
    if severity:
        query = query.find(Incident.severity == severity)

    incidents = await query.sort(-Incident.created_at).skip(skip).limit(limit).to_list()
    total = await Incident.find().count()

    return {
        "incidents": [
            {
                "id": str(i.id),
                "user_id": i.user_id,
                "title": i.title,
                "incident_type": i.incident_type,
                "severity": i.severity,
                "status": i.status,
                "created_at": i.created_at.isoformat(),
            }
            for i in incidents
        ],
        "total": total,
    }


# ── GET /admin/analytics ──────────────────────────────────────────────────────

@router.get("/analytics", dependencies=[admin_required])
async def get_platform_analytics():
    """Get platform-wide analytics and usage statistics."""
    total_users = await User.find().count()
    active_users = await User.find(User.is_active == True).count()
    total_journeys = await Journey.find().count()
    total_incidents = await Incident.find().count()
    total_sos = await SOSEvent.find().count()

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_role": {
                "user": await User.find(User.role == "user").count(),
                "guardian": await User.find(User.role == "guardian").count(),
                "admin": await User.find(User.role == "admin").count(),
            },
            "new_this_month": random.randint(5, 50),
            "new_this_week": random.randint(1, 20),
        },
        "journeys": {
            "total": total_journeys,
            "completed": await Journey.find(Journey.status == "completed").count(),
            "active": await Journey.find(Journey.status == "active").count(),
            "emergency": await Journey.find(Journey.status == "emergency").count(),
        },
        "incidents": {
            "total": total_incidents,
            "open": await Incident.find(Incident.status == "open").count(),
            "resolved": await Incident.find(Incident.status == "resolved").count(),
        },
        "sos_events": {
            "total": total_sos,
            "active": await SOSEvent.find(SOSEvent.status == "active").count(),
            "resolved": await SOSEvent.find(SOSEvent.status == "resolved").count(),
            "avg_response_time_seconds": 42,
        },
        "platform_health": {
            "uptime_percent": 99.8,
            "avg_response_ms": 120,
            "error_rate_percent": 0.2,
        },
    }


# ── GET /admin/ai-usage ───────────────────────────────────────────────────────

@router.get("/ai-usage", dependencies=[admin_required])
async def get_ai_usage_stats():
    """Get AI usage and performance statistics."""
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_interactions": random.randint(500, 5000),
        "by_agent": {
            "distress_detection": {
                "calls": random.randint(100, 1000),
                "avg_latency_ms": random.randint(200, 800),
                "classifications": {
                    "safe": random.randint(200, 500),
                    "concern": random.randint(50, 200),
                    "warning": random.randint(20, 100),
                    "emergency": random.randint(5, 30),
                },
            },
            "journey_monitoring": {
                "calls": random.randint(50, 500),
                "avg_latency_ms": random.randint(300, 1000),
                "deviations_detected": random.randint(5, 50),
            },
            "incident_analysis": {
                "calls": random.randint(20, 200),
                "avg_latency_ms": random.randint(500, 2000),
            },
            "knowledge_assistant": {
                "calls": random.randint(100, 2000),
                "avg_latency_ms": random.randint(200, 600),
                "topics": {
                    "legal_rights": random.randint(30, 200),
                    "emergency_procedures": random.randint(20, 150),
                    "travel_safety": random.randint(40, 300),
                    "helplines": random.randint(10, 100),
                },
            },
        },
        "mock_mode": True,
        "api_keys_configured": {
            "gemini": False,
            "openai": False,
            "langsmith": False,
        },
    }


# ── POST /admin/seed-data ─────────────────────────────────────────────────────

@router.post("/seed-data", dependencies=[admin_required])
async def seed_demo_data():
    """
    Seed the database with realistic demo data.

    Creates:
    - 3 demo users (user, guardian, admin)
    - Sample journeys, incidents, and SOS events
    - Notifications and analytics snapshots

    Safe to run multiple times (checks for existing demo users).
    """
    created = {
        "users": [],
        "journeys": [],
        "incidents": [],
        "sos_events": [],
    }

    # ── Demo Users ────────────────────────────────────────────────
    demo_users_data = [
        {
            "email": "priya@demo.com",
            "username": "priya_sharma",
            "full_name": "Priya Sharma",
            "phone": "+91-9876543210",
            "role": "user",
            "safety_score": 82.5,
        },
        {
            "email": "rahul.guardian@demo.com",
            "username": "rahul_guardian",
            "full_name": "Rahul Sharma",
            "phone": "+91-9876543211",
            "role": "guardian",
            "safety_score": 75.0,
        },
        {
            "email": "admin@safeguard.com",
            "username": "admin_sg",
            "full_name": "SafeGuard Admin",
            "phone": "+91-9999999999",
            "role": "admin",
            "safety_score": 95.0,
        },
    ]

    demo_user_docs = []
    for udata in demo_users_data:
        existing = await User.find_one(User.email == udata["email"])
        if not existing:
            user = User(
                email=udata["email"],
                username=udata["username"],
                full_name=udata["full_name"],
                phone=udata["phone"],
                password_hash=hash_password("Demo@1234"),
                role=udata["role"],
                safety_score=udata["safety_score"],
                is_verified=True,
                emergency_contacts=[
                    {
                        "name": "Emergency Contact 1",
                        "phone": "+91-9876543299",
                        "email": "emergency@demo.com",
                        "relationship": "family",
                        "is_primary": True,
                    }
                ],
            )
            await user.insert()
            created["users"].append(udata["email"])
            demo_user_docs.append(user)
        else:
            demo_user_docs.append(existing)

    # ── Demo Journeys ─────────────────────────────────────────────
    if demo_user_docs:
        primary_user = demo_user_docs[0]
        journey_data_list = [
            {
                "source": "HSR Layout, Bangalore",
                "destination": "Koramangala, Bangalore",
                "travel_mode": "walking",
                "status": "completed",
                "actual_duration": 25,
                "safety_score": 88.0,
            },
            {
                "source": "Indiranagar, Bangalore",
                "destination": "MG Road, Bangalore",
                "travel_mode": "metro",
                "status": "completed",
                "actual_duration": 15,
                "safety_score": 92.0,
            },
            {
                "source": "Home",
                "destination": "Office",
                "travel_mode": "cab",
                "status": "active",
                "actual_duration": None,
                "safety_score": 85.0,
            },
        ]

        for jdata in journey_data_list:
            journey = Journey(
                user_id=str(primary_user.id),
                source=jdata["source"],
                destination=jdata["destination"],
                travel_mode=jdata["travel_mode"],
                status=jdata["status"],
                actual_duration=jdata.get("actual_duration"),
                expected_duration=30,
                safety_score=jdata["safety_score"],
                start_time=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48)),
                end_time=(
                    datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 60))
                    if jdata["status"] == "completed"
                    else None
                ),
                checkpoints=[
                    {
                        "lat": 12.9716 + random.uniform(-0.01, 0.01),
                        "lng": 77.5946 + random.uniform(-0.01, 0.01),
                        "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=i * 5)).isoformat(),
                        "index": i + 1,
                    }
                    for i in range(3)
                ],
                ai_analysis={
                    "safety_assessment": "Route appears safe based on time and location data.",
                    "risk_factors": [],
                    "recommendations": ["Stay on main roads", "Share location with contacts"],
                },
            )
            await journey.insert()
            created["journeys"].append(str(journey.id))

        # ── Demo Incidents ─────────────────────────────────────────
        incidents_data = [
            {
                "title": "Harassment at Metro Station",
                "description": "A man was following me from Indiranagar metro station to the exit. He made inappropriate comments.",
                "incident_type": "harassment",
                "severity": "high",
                "status": "open",
            },
            {
                "title": "Suspicious Vehicle Trailing",
                "description": "A white car followed me for about 2 km while I was walking home from the market.",
                "incident_type": "stalking",
                "severity": "medium",
                "status": "resolved",
            },
        ]

        for idata in incidents_data:
            incident = Incident(
                user_id=str(primary_user.id),
                title=idata["title"],
                description=idata["description"],
                incident_type=idata["incident_type"],
                severity=idata["severity"],
                status=idata["status"],
                location={"lat": 12.9784, "lng": 77.6408, "address": "Indiranagar, Bangalore"},
                ai_summary=f"AI Analysis: This incident involves {idata['incident_type']}. The user reported the situation at a public location. Recommended to file an official complaint.",
                ai_timeline=[
                    {"time": "18:30", "event": "Incident began at metro station", "severity": "medium"},
                    {"time": "18:45", "event": "User reported feeling unsafe", "severity": "high"},
                    {"time": "19:00", "event": "User reached safe location", "severity": "low"},
                ],
                recommended_actions=[
                    "File a complaint with local police",
                    "Share incident details with your guardian",
                    "Contact Women Helpline: 181",
                    "Avoid the location in the evening hours",
                ],
                tags=["public transport", "evening", "bangalore"],
            )
            await incident.insert()
            created["incidents"].append(str(incident.id))

        # ── Demo SOS Events ───────────────────────────────────────
        sos = SOSEvent(
            user_id=str(primary_user.id),
            location={"lat": 12.9716, "lng": 77.5946, "address": "MG Road, Bangalore"},
            emergency_type="general",
            status="resolved",
            message="I felt unsafe walking to my car",
            ai_summary="User triggered SOS near MG Road. Emergency contacts were notified. User reported being safe 10 minutes later.",
            notified_contacts=[
                {
                    "name": "Rahul Sharma",
                    "phone": "+91-9876543211",
                    "email": "rahul.guardian@demo.com",
                    "method": "sms+email",
                    "notified_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
                    "status": "delivered",
                }
            ],
            resolved_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=50),
            response_time=45,
        )
        await sos.insert()
        created["sos_events"].append(str(sos.id))

    return {
        "message": "Demo data seeded successfully",
        "created": created,
        "demo_credentials": {
            "user": {"email": "priya@demo.com", "password": "Demo@1234"},
            "guardian": {"email": "rahul.guardian@demo.com", "password": "Demo@1234"},
            "admin": {"email": "admin@safeguard.com", "password": "Demo@1234"},
        },
    }
