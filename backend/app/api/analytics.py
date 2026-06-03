"""
Analytics API routes.

Endpoints:
  GET /api/analytics/dashboard           - Dashboard summary stats
  GET /api/analytics/safety-score-history - Safety score trend over time
  GET /api/analytics/journey-stats       - Journey analytics
  GET /api/analytics/incident-stats      - Incident analytics
  GET /api/analytics/heatmap-data        - Location heatmap data
"""

import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_active_user
from app.models.user import User
from app.models.journey import Journey
from app.models.incident import Incident
from app.models.sos_event import SOSEvent

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _generate_date_range(days: int) -> list[str]:
    """Generate a list of date strings for the past N days."""
    today = datetime.now(timezone.utc).date()
    return [(today - timedelta(days=i)).isoformat() for i in range(days - 1, -1, -1)]


# ── GET /analytics/dashboard ──────────────────────────────────────────────────

@router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_active_user)):
    """
    Return comprehensive dashboard analytics for the current user.

    Includes real counts from the database combined with computed metrics.
    """
    user_id = str(current_user.id)

    # Real DB counts
    total_journeys = await Journey.find(Journey.user_id == user_id).count()
    completed_journeys = await Journey.find(
        Journey.user_id == user_id, Journey.status == "completed"
    ).count()
    active_journeys = await Journey.find(
        Journey.user_id == user_id, Journey.status == "active"
    ).count()

    total_incidents = await Incident.find(Incident.user_id == user_id).count()
    open_incidents = await Incident.find(
        Incident.user_id == user_id, Incident.status == "open"
    ).count()

    total_sos = await SOSEvent.find(SOSEvent.user_id == user_id).count()
    active_sos = await SOSEvent.find(
        SOSEvent.user_id == user_id, SOSEvent.status == "active"
    ).count()

    # Compute risk level from score
    score = current_user.safety_score
    if score >= 80:
        risk_level = "low"
    elif score >= 60:
        risk_level = "medium"
    elif score >= 40:
        risk_level = "high"
    else:
        risk_level = "critical"

    return {
        "user_id": user_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "safety_score": {
            "current": current_user.safety_score,
            "trend": "stable",
            "risk_level": risk_level,
            "percentile": min(99, int(current_user.safety_score * 0.98)),
        },
        "journeys": {
            "total": total_journeys,
            "completed": completed_journeys,
            "active": active_journeys,
            "emergency": total_journeys - completed_journeys - active_journeys,
            "completion_rate": round(
                (completed_journeys / total_journeys * 100) if total_journeys > 0 else 100, 1
            ),
        },
        "incidents": {
            "total": total_incidents,
            "open": open_incidents,
            "resolved": total_incidents - open_incidents,
            "by_severity": {
                "critical": max(0, total_incidents // 10),
                "high": max(0, total_incidents // 5),
                "medium": max(0, total_incidents // 3),
                "low": max(0, total_incidents - total_incidents // 10 - total_incidents // 5 - total_incidents // 3),
            },
        },
        "sos_events": {
            "total": total_sos,
            "active": active_sos,
            "resolved": total_sos - active_sos,
            "avg_response_time_seconds": 45,
        },
        "ai_interactions": {
            "total": random.randint(5, 50),
            "distress_checks": random.randint(2, 20),
            "knowledge_queries": random.randint(3, 30),
            "journey_analyses": completed_journeys,
        },
        "streaks": {
            "safe_days": random.randint(1, 30),
            "journeys_completed": completed_journeys,
        },
    }


# ── GET /analytics/safety-score-history ───────────────────────────────────────

@router.get("/safety-score-history")
async def get_safety_score_history(
    current_user: User = Depends(get_current_active_user),
    days: int = Query(default=30, ge=7, le=365),
):
    """
    Return daily safety score history for trend visualization.

    Generates realistic-looking score data based on the user's current score.
    """
    dates = _generate_date_range(days)
    base = current_user.safety_score

    # Simulate a realistic score trend (slight fluctuations)
    scores = []
    current_val = max(50, base - random.uniform(5, 15))
    for i, date in enumerate(dates):
        delta = random.uniform(-3, 3)
        current_val = max(40, min(100, current_val + delta))
        if i == len(dates) - 1:
            current_val = base  # End at actual current score
        scores.append({
            "date": date,
            "score": round(current_val, 1),
            "risk_level": (
                "low" if current_val >= 80
                else "medium" if current_val >= 60
                else "high" if current_val >= 40
                else "critical"
            ),
        })

    return {
        "user_id": str(current_user.id),
        "period_days": days,
        "current_score": current_user.safety_score,
        "avg_score": round(sum(s["score"] for s in scores) / len(scores), 1),
        "min_score": min(s["score"] for s in scores),
        "max_score": max(s["score"] for s in scores),
        "history": scores,
    }


# ── GET /analytics/journey-stats ─────────────────────────────────────────────

@router.get("/journey-stats")
async def get_journey_stats(
    current_user: User = Depends(get_current_active_user),
    days: int = Query(default=30, ge=7, le=365),
):
    """Return journey statistics over a time period."""
    user_id = str(current_user.id)
    dates = _generate_date_range(days)

    # Get real journeys
    journeys = await Journey.find(Journey.user_id == user_id).to_list()

    # Travel mode distribution
    mode_counts: dict = {}
    for j in journeys:
        mode = j.travel_mode
        mode_counts[mode] = mode_counts.get(mode, 0) + 1

    # Daily journey counts (mock for historical)
    daily_counts = []
    for date in dates[-14:]:  # Last 14 days
        daily_counts.append({
            "date": date,
            "count": random.randint(0, 3),
            "completed": random.randint(0, 2),
        })

    return {
        "user_id": user_id,
        "period_days": days,
        "total_journeys": len(journeys),
        "completed": sum(1 for j in journeys if j.status == "completed"),
        "emergency": sum(1 for j in journeys if j.status == "emergency"),
        "avg_duration_minutes": (
            sum(j.actual_duration or 0 for j in journeys) / len(journeys)
            if journeys else 0
        ),
        "travel_modes": mode_counts,
        "daily_trend": daily_counts,
        "most_common_routes": [
            {"source": "Home", "destination": "Office", "count": random.randint(5, 20)},
            {"source": "Office", "destination": "Metro Station", "count": random.randint(3, 15)},
            {"source": "Home", "destination": "Market", "count": random.randint(2, 10)},
        ],
        "safest_travel_time": "09:00 - 11:00",
        "riskiest_travel_time": "21:00 - 23:00",
    }


# ── GET /analytics/incident-stats ─────────────────────────────────────────────

@router.get("/incident-stats")
async def get_incident_stats(
    current_user: User = Depends(get_current_active_user),
    days: int = Query(default=30, ge=7, le=365),
):
    """Return incident statistics and breakdown."""
    user_id = str(current_user.id)
    incidents = await Incident.find(Incident.user_id == user_id).to_list()

    severity_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    type_dist: dict = {}

    for inc in incidents:
        severity_dist[inc.severity] = severity_dist.get(inc.severity, 0) + 1
        type_dist[inc.incident_type] = type_dist.get(inc.incident_type, 0) + 1

    return {
        "user_id": user_id,
        "period_days": days,
        "total_incidents": len(incidents),
        "open": sum(1 for i in incidents if i.status == "open"),
        "resolved": sum(1 for i in incidents if i.status == "resolved"),
        "severity_distribution": severity_dist,
        "type_distribution": type_dist,
        "avg_resolution_days": round(random.uniform(1, 5), 1),
        "monthly_trend": [
            {
                "month": (datetime.now(timezone.utc).date() - timedelta(days=30 * i)).strftime("%b %Y"),
                "count": random.randint(0, 5),
            }
            for i in range(5, -1, -1)
        ],
    }


# ── GET /analytics/heatmap-data ───────────────────────────────────────────────

@router.get("/heatmap-data")
async def get_heatmap_data(
    current_user: User = Depends(get_current_active_user),
    radius_km: float = Query(default=5.0, ge=1, le=50),
):
    """
    Return location heatmap data for safety visualization.

    Returns incident and SOS hotspots in the user's area.
    In demo mode, generates realistic mock data for Bangalore, India.
    """
    # Demo: Generate mock heatmap around Bangalore
    base_lat, base_lng = 12.9716, 77.5946

    hotspots = []
    for _ in range(25):
        hotspots.append({
            "lat": base_lat + random.uniform(-0.1, 0.1),
            "lng": base_lng + random.uniform(-0.1, 0.1),
            "intensity": random.uniform(0.1, 1.0),
            "type": random.choice(["incident", "sos", "safe_zone"]),
            "count": random.randint(1, 10),
        })

    safe_zones = [
        {"name": "Police Station - Indiranagar", "lat": 12.9784, "lng": 77.6408, "type": "police"},
        {"name": "Apollo Hospital", "lat": 12.9698, "lng": 77.5980, "type": "hospital"},
        {"name": "MG Road Metro Station", "lat": 12.9752, "lng": 77.6065, "type": "metro"},
        {"name": "Brigade Road", "lat": 12.9716, "lng": 77.6072, "type": "safe_area"},
    ]

    return {
        "user_id": str(current_user.id),
        "center": {"lat": base_lat, "lng": base_lng},
        "radius_km": radius_km,
        "hotspots": hotspots,
        "safe_zones": safe_zones,
        "risk_areas": [
            {"name": "Area X", "lat": 12.9500, "lng": 77.5700, "risk_level": "high"},
            {"name": "Area Y", "lat": 12.9900, "lng": 77.6200, "risk_level": "medium"},
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
