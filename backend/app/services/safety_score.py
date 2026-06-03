"""
Safety Score calculation service.
Computes a user's safety score based on profile completion, journey history, and active incident reports.
"""

from typing import Dict, Any
from app.models.user import User
from app.models.journey import Journey
from app.models.incident import Incident
from beanie import PydanticObjectId

async def calculate_score(user_id: str) -> Dict[str, Any]:
    """
    Calculate the safety score for a user dynamically.
    Returns score, breakdown, trend and recommendations.
    """
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        user = None

    # Base profile completion
    profile_completion = 50
    if user:
        if user.phone:
            profile_completion += 15
        if user.emergency_contacts:
            profile_completion += 20
        if user.full_name:
            profile_completion += 15

    # Safe journeys factor
    safe_journeys = 100
    try:
        # Check active or completed journeys
        journeys = await Journey.find(Journey.user_id == user_id).to_list()
        completed_journeys = [j for j in journeys if j.status == "completed"]
        active_sos_journeys = [j for j in journeys if j.status == "sos_triggered"]
        
        if len(journeys) > 0:
            # SOS journeys drag the score down temporary
            sos_ratio = len(active_sos_journeys) / len(journeys)
            safe_journeys = max(30, int(100 - (sos_ratio * 70)))
    except Exception:
        pass

    # Incident reporting factor (more incidents reported = user is proactive, but might reside in riskier area)
    incidents_factor = 100
    try:
        incidents = await Incident.find(Incident.user_id == user_id).to_list()
        # High severity incidents reduce safety rating temporary
        high_severity = [i for i in incidents if i.severity == "high" and i.status != "resolved"]
        if high_severity:
            incidents_factor = max(40, 100 - (len(high_severity) * 15))
    except Exception:
        pass

    # Overall score calculation
    raw_score = int((profile_completion * 0.3) + (safe_journeys * 0.5) + (incidents_factor * 0.2))
    score = max(10, min(100, raw_score))

    # Recommendations
    recommendations = []
    if not user or not user.emergency_contacts:
        recommendations.append("Add emergency contacts to notify them immediately during an SOS.")
    if user and not user.phone:
        recommendations.append("Complete your phone verification in your profile.")
    if safe_journeys < 90:
        recommendations.append("Avoid high-risk routes during late hours to boost travel safety.")
    if not recommendations:
        recommendations.append("Maintain your excellent safety habits! Your profile and tracking are fully active.")

    # Update user document cache
    if user and user.safety_score != score:
        user.safety_score = score
        await user.save()

    return {
        "score": score,
        "breakdown": {
            "profile_setup": profile_completion,
            "journey_safety": safe_journeys,
            "incident_response": incidents_factor
        },
        "trend": "stable" if score > 70 else "improving",
        "recommendations": recommendations
    }
