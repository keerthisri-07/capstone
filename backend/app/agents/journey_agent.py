"""
Journey Monitoring Agent using LangGraph.

Monitors active journeys for:
  - Route deviations (>500m from expected path)
  - Long stoppages (>15 minutes stationary)
  - Delayed arrival (>20% over expected duration)
  - Unsafe time/location combinations

Pipeline:
  analyze_route -> detect_deviations -> assess_risk -> generate_alerts
"""

import asyncio
import math
from datetime import datetime, timezone
from typing import TypedDict, List, Optional, Any

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False


# ── State Definition ───────────────────────────────────────────────────────────

class JourneyState(TypedDict):
    """State passed through the journey monitoring pipeline."""
    journey_id: str
    source: str
    destination: str
    travel_mode: str
    checkpoints: List[dict]
    start_time: str
    expected_duration: Optional[int]
    route_analysis: dict
    deviations: List[dict]
    stoppages: List[dict]
    risk_level: str
    safety_score: float
    alerts: List[dict]
    recommendations: List[str]
    response: dict


# ── Helper Functions ───────────────────────────────────────────────────────────

def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance in meters between two GPS coordinates
    using the Haversine formula.
    """
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _parse_timestamp(ts_str: str) -> Optional[datetime]:
    """Parse ISO timestamp string to datetime object."""
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        return None


# ── Node Functions ─────────────────────────────────────────────────────────────

def analyze_route(state: JourneyState) -> JourneyState:
    """
    Node 1: Analyze the route characteristics.

    Assesses time-of-day risk, travel mode safety, and route length.
    """
    checkpoints = state["checkpoints"]
    travel_mode = state["travel_mode"]
    start_time = _parse_timestamp(state["start_time"])

    hour = start_time.hour if start_time else datetime.now(timezone.utc).hour

    # Time risk scoring
    if 22 <= hour or hour < 5:
        time_category = "late_night"
        time_risk = 0.35
    elif 18 <= hour < 22:
        time_category = "evening"
        time_risk = 0.20
    else:
        time_category = "daytime"
        time_risk = 0.05

    # Mode risk scoring
    mode_risk_map = {
        "walking": 0.20,
        "auto": 0.10,
        "cab": 0.08,
        "bus": 0.05,
        "metro": 0.03,
    }
    mode_risk = mode_risk_map.get(travel_mode, 0.10)

    # Total distance from checkpoints
    total_distance = 0.0
    if len(checkpoints) >= 2:
        for i in range(len(checkpoints) - 1):
            cp1, cp2 = checkpoints[i], checkpoints[i + 1]
            total_distance += _haversine_distance(
                cp1.get("lat", 0), cp1.get("lng", 0),
                cp2.get("lat", 0), cp2.get("lng", 0),
            )

    route_analysis = {
        "time_category": time_category,
        "time_risk": time_risk,
        "mode_risk": mode_risk,
        "total_distance_meters": round(total_distance, 1),
        "checkpoint_count": len(checkpoints),
    }

    return {**state, "route_analysis": route_analysis}


def detect_deviations(state: JourneyState) -> JourneyState:
    """
    Node 2: Detect route deviations and long stoppages.

    Deviation threshold: 500 meters from expected path
    Stoppage threshold: 15 minutes stationary
    """
    checkpoints = state["checkpoints"]
    DEVIATION_THRESHOLD_M = 500
    STOPPAGE_THRESHOLD_MIN = 15

    deviations = []
    stoppages = []

    # Detect stoppages (consecutive checkpoints within 50m for >15 min)
    for i in range(len(checkpoints) - 1):
        cp1, cp2 = checkpoints[i], checkpoints[i + 1]
        dist = _haversine_distance(
            cp1.get("lat", 0), cp1.get("lng", 0),
            cp2.get("lat", 0), cp2.get("lng", 0),
        )

        if dist < 50:  # Less than 50m apart
            ts1 = _parse_timestamp(cp1.get("timestamp", ""))
            ts2 = _parse_timestamp(cp2.get("timestamp", ""))
            if ts1 and ts2:
                duration_min = (ts2 - ts1).total_seconds() / 60
                if duration_min > STOPPAGE_THRESHOLD_MIN:
                    stoppages.append({
                        "checkpoint_index": i,
                        "duration_minutes": round(duration_min, 1),
                        "location": {"lat": cp1.get("lat"), "lng": cp1.get("lng")},
                        "severity": "high" if duration_min > 30 else "medium",
                    })

    # Note: In production, deviations would compare against Google Maps route
    # For demo, we check if any checkpoint seems very far from a mock "straight" route
    if len(checkpoints) >= 3:
        first, last = checkpoints[0], checkpoints[-1]
        for i, cp in enumerate(checkpoints[1:-1], 1):
            # Check perpendicular distance from direct route line
            # Simplified: just check if lateral distance exceeds threshold
            mid_lat = (first.get("lat", 0) + last.get("lat", 0)) / 2
            mid_lng = (first.get("lng", 0) + last.get("lng", 0)) / 2
            dist_from_expected = _haversine_distance(
                cp.get("lat", 0), cp.get("lng", 0), mid_lat, mid_lng
            )
            if dist_from_expected > DEVIATION_THRESHOLD_M * 2:
                deviations.append({
                    "checkpoint_index": i,
                    "deviation_meters": round(dist_from_expected, 1),
                    "location": {"lat": cp.get("lat"), "lng": cp.get("lng")},
                    "severity": "high" if dist_from_expected > 1000 else "medium",
                })

    return {**state, "deviations": deviations, "stoppages": stoppages}


def assess_risk(state: JourneyState) -> JourneyState:
    """
    Node 3: Compute overall risk level and safety score.
    """
    route_analysis = state["route_analysis"]
    deviations = state["deviations"]
    stoppages = state["stoppages"]
    checkpoints = state["checkpoints"]
    expected_duration = state.get("expected_duration")

    base_score = 90.0

    # Deduct for deviations
    base_score -= len(deviations) * 8
    for d in deviations:
        if d.get("severity") == "high":
            base_score -= 5

    # Deduct for stoppages
    base_score -= len(stoppages) * 6
    for s in stoppages:
        if s.get("severity") == "high":
            base_score -= 4

    # Deduct for time/mode risk
    base_score -= route_analysis.get("time_risk", 0) * 30
    base_score -= route_analysis.get("mode_risk", 0) * 20

    # Check duration overrun
    if expected_duration and checkpoints:
        start_ts = _parse_timestamp(checkpoints[0].get("timestamp", ""))
        last_ts = _parse_timestamp(checkpoints[-1].get("timestamp", ""))
        if start_ts and last_ts:
            actual_min = (last_ts - start_ts).total_seconds() / 60
            overrun_pct = (actual_min - expected_duration) / expected_duration if expected_duration > 0 else 0
            if overrun_pct > 0.20:
                base_score -= min(15, overrun_pct * 30)

    safety_score = max(30.0, min(100.0, base_score))

    if safety_score >= 80:
        risk_level = "low"
    elif safety_score >= 60:
        risk_level = "medium"
    elif safety_score >= 40:
        risk_level = "high"
    else:
        risk_level = "critical"

    return {**state, "safety_score": round(safety_score, 1), "risk_level": risk_level}


def generate_alerts(state: JourneyState) -> JourneyState:
    """
    Node 4: Generate alerts and recommendations based on risk assessment.
    """
    risk_level = state["risk_level"]
    deviations = state["deviations"]
    stoppages = state["stoppages"]

    alerts = []
    recommendations = []

    if deviations:
        alerts.append({
            "type": "route_deviation",
            "severity": "high",
            "message": f"Route deviation detected at {len(deviations)} point(s). "
                       f"Maximum deviation: {max(d['deviation_meters'] for d in deviations):.0f}m",
        })
        recommendations.append("You appear to have deviated from your planned route. Please confirm you are safe.")

    if stoppages:
        max_stoppage = max(s["duration_minutes"] for s in stoppages)
        alerts.append({
            "type": "long_stoppage",
            "severity": "medium" if max_stoppage < 30 else "high",
            "message": f"Extended stoppage detected: {max_stoppage:.0f} minutes at one location.",
        })
        recommendations.append(f"You have been stationary for {max_stoppage:.0f} minutes. Are you safe?")

    if risk_level == "critical":
        alerts.append({
            "type": "high_risk",
            "severity": "critical",
            "message": "This journey has multiple risk factors. Please check in with your guardian.",
        })
        recommendations.append("Consider calling someone or moving to a safer location.")

    recommendations.extend([
        "Keep your phone charged and accessible",
        "Stay in well-lit, populated areas",
        f"Emergency: 112 | Police: 100 | Women Helpline: 181",
    ])

    response = {
        "journey_id": state["journey_id"],
        "safety_score": state["safety_score"],
        "risk_level": state["risk_level"],
        "deviations": deviations,
        "stoppages": stoppages,
        "alerts": alerts,
        "recommendations": recommendations,
        "route_analysis": state["route_analysis"],
    }

    return {**state, "alerts": alerts, "recommendations": recommendations, "response": response}


# ── Build Graph ────────────────────────────────────────────────────────────────

def _build_journey_graph():
    if not LANGGRAPH_AVAILABLE:
        return None
    try:
        workflow = StateGraph(JourneyState)
        workflow.add_node("analyze_route", analyze_route)
        workflow.add_node("detect_deviations", detect_deviations)
        workflow.add_node("assess_risk", assess_risk)
        workflow.add_node("generate_alerts", generate_alerts)

        workflow.set_entry_point("analyze_route")
        workflow.add_edge("analyze_route", "detect_deviations")
        workflow.add_edge("detect_deviations", "assess_risk")
        workflow.add_edge("assess_risk", "generate_alerts")
        workflow.add_edge("generate_alerts", END)

        return workflow.compile()
    except Exception:
        return None


_journey_graph = _build_journey_graph()


# ── Public API ─────────────────────────────────────────────────────────────────

async def analyze_journey(input_data: dict) -> dict:
    """
    Run the journey monitoring pipeline.

    Args:
        input_data: Dictionary with journey data including checkpoints.

    Returns:
        Safety assessment with risk level, deviations, stoppages, and alerts.
    """
    initial_state: JourneyState = {
        "journey_id": input_data.get("journey_id", ""),
        "source": input_data.get("source", ""),
        "destination": input_data.get("destination", ""),
        "travel_mode": input_data.get("travel_mode", "walking"),
        "checkpoints": input_data.get("checkpoints", []),
        "start_time": input_data.get("start_time", datetime.now(timezone.utc).isoformat()),
        "expected_duration": input_data.get("expected_duration"),
        "route_analysis": {},
        "deviations": [],
        "stoppages": [],
        "risk_level": "low",
        "safety_score": 85.0,
        "alerts": [],
        "recommendations": [],
        "response": {},
    }

    if _journey_graph is not None:
        try:
            loop = asyncio.get_event_loop()
            final_state = await loop.run_in_executor(
                None,
                lambda: _journey_graph.invoke(initial_state),
            )
            return final_state.get("response", {})
        except Exception:
            pass

    # Manual fallback
    state = initial_state
    for node_fn in [analyze_route, detect_deviations, assess_risk, generate_alerts]:
        state = node_fn(state)

    return state.get("response", {})
