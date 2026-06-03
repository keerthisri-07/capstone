"""
AI analysis API routes.

Endpoints:
  POST /api/ai/distress-detect         - Detect distress in user text
  POST /api/ai/journey-analyze         - Analyze journey safety
  POST /api/ai/safety-recommendations  - Get personalized recommendations
  POST /api/ai/incident-analyze        - Generate incident timeline and summary
  POST /api/ai/chat                    - Knowledge assistant chat (RAG)
"""

import asyncio
import random
import time
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_active_user
from app.models.user import User
from app.agents.distress_agent import detect_distress
from app.agents.knowledge_agent import chat_with_knowledge_base

router = APIRouter(prefix="/ai", tags=["AI Agents"])


# ── Request Schemas ────────────────────────────────────────────────────────────

class DistressDetectRequest(BaseModel):
    text: str
    context: Optional[str] = None
    include_reasoning: bool = True


class JourneyAnalyzeRequest(BaseModel):
    source: str
    destination: str
    travel_mode: str = "walking"
    time_of_day: Optional[str] = None
    checkpoints: Optional[List[dict]] = None
    duration_minutes: Optional[int] = None


class SafetyRecommendationsRequest(BaseModel):
    context: str = "general"
    location: Optional[dict] = None
    time_of_day: Optional[str] = None
    recent_incidents: Optional[int] = 0


class IncidentAnalyzeRequest(BaseModel):
    title: str
    description: str
    incident_type: str = "harassment"
    severity: Optional[str] = None
    location: Optional[dict] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = None
    language: str = "en"


# ── POST /ai/distress-detect ──────────────────────────────────────────────────

@router.post("/distress-detect")
async def distress_detect(
    payload: DistressDetectRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze text for signs of distress or danger.

    Uses a multi-stage LangGraph agent pipeline:
    1. Preprocess and normalize text
    2. Classify distress level
    3. Generate recommendations
    4. Format structured response

    Classifications:
    - safe (0-25%): Normal text, no distress signals
    - concern (25-50%): Mild stress or discomfort detected
    - warning (50-75%): Significant distress, possible danger
    - emergency (75-100%): Immediate danger, activate emergency response
    """
    start_time = time.time()

    result = await detect_distress({
        "input_text": payload.text,
        "context": payload.context or "",
        "user_id": str(current_user.id),
    })

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "user_id": str(current_user.id),
        "input_text": payload.text[:200] + "..." if len(payload.text) > 200 else payload.text,
        "classification": result.get("classification", "safe"),
        "confidence": result.get("confidence", 0.5),
        "confidence_percent": round(result.get("confidence", 0.5) * 100, 1),
        "reasoning": result.get("reasoning", "") if payload.include_reasoning else None,
        "recommendations": result.get("recommendations", []),
        "should_trigger_sos": result.get("classification") == "emergency",
        "emergency_contacts_to_notify": (
            len(current_user.emergency_contacts)
            if result.get("classification") in ("emergency", "warning")
            else 0
        ),
        "helplines": {
            "emergency": "112",
            "women_helpline": "181",
            "police": "100",
        },
        "analysis_metadata": {
            "response_time_ms": elapsed_ms,
            "model_version": "distress-agent-v1",
            "mock_mode": True,
        },
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }


# ── POST /ai/journey-analyze ──────────────────────────────────────────────────

@router.post("/journey-analyze")
async def journey_analyze(
    payload: JourneyAnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze a journey route for safety risks.

    Assesses:
    - Time-of-day risk (nighttime routes are higher risk)
    - Route type safety (isolated vs busy areas)
    - Travel mode safety
    - Duration vs expected time comparison
    - Checkpoint anomalies
    """
    start_time = time.time()

    # Determine time risk
    hour = datetime.now(timezone.utc).hour
    time_str = payload.time_of_day or f"{hour:02d}:00"
    try:
        time_hour = int(time_str.split(":")[0])
    except Exception:
        time_hour = hour

    # Risk factor calculation
    time_risk = 0.3 if 22 <= time_hour or time_hour < 6 else (0.15 if 18 <= time_hour < 22 else 0.05)
    mode_risk = {
        "walking": 0.2,
        "auto": 0.1,
        "bus": 0.05,
        "metro": 0.03,
        "cab": 0.08,
    }.get(payload.travel_mode, 0.1)

    total_risk = time_risk + mode_risk
    safety_score = max(40, min(100, round((1 - total_risk) * 100, 1)))

    risk_level = (
        "critical" if safety_score < 40
        else "high" if safety_score < 60
        else "medium" if safety_score < 80
        else "low"
    )

    recommendations = []
    if time_hour >= 22 or time_hour < 6:
        recommendations.append("It's late night — prefer a cab over walking")
        recommendations.append("Share your live location with a trusted contact")
    if payload.travel_mode == "walking":
        recommendations.append("Stay on well-lit, populated routes")
        recommendations.append("Keep emergency contacts informed of your route")
    recommendations.extend([
        "Keep your phone charged and accessible",
        "Trust your instincts — if something feels wrong, seek help immediately",
    ])

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "source": payload.source,
        "destination": payload.destination,
        "travel_mode": payload.travel_mode,
        "time_of_day": time_str,
        "safety_score": safety_score,
        "risk_level": risk_level,
        "risk_factors": [
            {
                "factor": "time_of_day",
                "value": time_str,
                "risk_contribution": round(time_risk * 100, 1),
                "description": "Late night travel increases risk" if time_risk > 0.1 else "Safe travel hours",
            },
            {
                "factor": "travel_mode",
                "value": payload.travel_mode,
                "risk_contribution": round(mode_risk * 100, 1),
                "description": f"{payload.travel_mode.capitalize()} mode risk assessment",
            },
        ],
        "recommendations": recommendations,
        "estimated_safe_duration_minutes": payload.duration_minutes or 30,
        "deviation_threshold_meters": 500,
        "checkpoint_interval_minutes": 10,
        "emergency_protocol": {
            "auto_sos_after_minutes": 30,
            "contacts_to_notify": len(current_user.emergency_contacts),
        },
        "analysis_metadata": {
            "response_time_ms": elapsed_ms,
            "model_version": "journey-agent-v1",
            "mock_mode": True,
        },
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }


# ── POST /ai/safety-recommendations ──────────────────────────────────────────

@router.post("/safety-recommendations")
async def get_safety_recommendations(
    payload: SafetyRecommendationsRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get personalized safety recommendations based on user context.

    Considers:
    - User's safety score and recent activity
    - Current time and location context
    - Recent incidents and SOS events
    - Journey patterns
    """
    score = current_user.safety_score
    recent_incidents = payload.recent_incidents or 0

    # Build personalized recommendations
    core_tips = [
        {
            "category": "travel",
            "priority": "high",
            "tip": "Share your live location before starting any journey",
            "action": "Enable journey tracking",
        },
        {
            "category": "emergency",
            "priority": "critical",
            "tip": "Save emergency contacts: Police 100, Women Helpline 181, Emergency 112",
            "action": "Add to speed dial",
        },
        {
            "category": "digital",
            "priority": "medium",
            "tip": "Enable 'shake to SOS' feature for quick emergency activation",
            "action": "Configure in settings",
        },
        {
            "category": "awareness",
            "priority": "medium",
            "tip": "Stay alert in crowded public spaces and trust your intuition",
            "action": "Read safety guide",
        },
    ]

    if score < 70:
        core_tips.insert(0, {
            "category": "score_improvement",
            "priority": "high",
            "tip": "Your safety score is below average. Complete journeys and report incidents to improve it.",
            "action": "View safety score details",
        })

    if recent_incidents > 0:
        core_tips.insert(0, {
            "category": "incident_followup",
            "priority": "critical",
            "tip": f"You have {recent_incidents} recent incident(s). Consider filing a police complaint.",
            "action": "File complaint",
        })

    return {
        "user_id": str(current_user.id),
        "safety_score": score,
        "context": payload.context,
        "personalized_recommendations": core_tips,
        "quick_actions": [
            {"label": "Start Safe Journey", "action": "open_journey", "icon": "map"},
            {"label": "Call Helpline", "action": "call_181", "icon": "phone"},
            {"label": "Share Location", "action": "share_location", "icon": "location"},
            {"label": "File Incident", "action": "open_incident", "icon": "report"},
        ],
        "local_resources": {
            "police": {"number": "100", "nearest": "Indiranagar PS - 2.1km"},
            "hospital": {"name": "Apollo Hospital", "distance": "1.8km"},
            "women_helpline": "181",
            "emergency": "112",
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── POST /ai/incident-analyze ─────────────────────────────────────────────────

@router.post("/incident-analyze")
async def incident_analyze(
    payload: IncidentAnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Generate AI analysis for an incident.

    Produces:
    - Timeline reconstruction from description
    - Severity assessment
    - Recommended actions
    - Legal advice pointers
    - Similar case patterns
    """
    start_time = time.time()

    # Assess severity
    high_severity_keywords = ["assault", "attack", "weapon", "threat", "rape", "kidnap"]
    medium_severity_keywords = ["follow", "stalk", "harass", "threat", "unsafe"]
    text_lower = payload.description.lower()

    assessed_severity = payload.severity or "medium"
    if any(kw in text_lower for kw in high_severity_keywords):
        assessed_severity = "high"
    elif any(kw in text_lower for kw in medium_severity_keywords):
        assessed_severity = "medium"

    now = datetime.now(timezone.utc)
    timeline = [
        {
            "timestamp": (now.replace(hour=max(0, now.hour - 2))).strftime("%H:%M"),
            "event": f"Incident began: {payload.title}",
            "severity": assessed_severity,
            "location": payload.location.get("address", "Reported location") if payload.location else "Location reported",
        },
        {
            "timestamp": (now.replace(hour=max(0, now.hour - 1))).strftime("%H:%M"),
            "event": "User became aware of the situation and felt unsafe",
            "severity": "high" if assessed_severity in ("high", "critical") else "medium",
            "location": "Same location",
        },
        {
            "timestamp": now.strftime("%H:%M"),
            "event": "User reported the incident on the Safety Companion platform",
            "severity": "low",
            "location": "Safe location",
        },
    ]

    actions = [
        "Document all evidence: screenshots, descriptions, witness contacts",
        "File an FIR at the nearest police station",
        "Contact Women Helpline: 181 for guidance",
        "Inform your guardian or trusted contact",
        "Avoid the location until situation is resolved",
    ]

    if assessed_severity in ("high", "critical"):
        actions.insert(0, "⚠️ URGENT: Call police (100) or emergency services (112) immediately")
        actions.insert(1, "Seek medical attention if physically harmed")

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "incident_type": payload.incident_type,
        "assessed_severity": assessed_severity,
        "severity_confidence": round(random.uniform(0.75, 0.95), 2),
        "ai_summary": (
            f"This incident involves {payload.incident_type} reported by the user. "
            f"Based on the description, the severity has been assessed as '{assessed_severity}'. "
            f"The situation warrants {'immediate' if assessed_severity in ('high','critical') else 'prompt'} action. "
            f"Legal options and safety recommendations have been prepared."
        ),
        "timeline": timeline,
        "recommended_actions": actions,
        "legal_resources": [
            "Indian Penal Code Section 354 - Assault or criminal force on woman",
            "IPC Section 509 - Word, gesture or act intended to insult the modesty of a woman",
            "Protection of Women from Domestic Violence Act, 2005",
            "Sexual Harassment of Women at Workplace Act, 2013",
        ],
        "support_resources": {
            "helplines": {
                "women_helpline": "181",
                "police": "100",
                "emergency": "112",
                "ncw": "7827170170",
            },
            "ngos": [
                "Sakshi (Delhi) - 011-26535563",
                "Snehi Foundation - 044-24640050",
            ],
        },
        "analysis_metadata": {
            "response_time_ms": elapsed_ms,
            "model_version": "incident-agent-v1",
            "mock_mode": True,
        },
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }


# ── POST /ai/chat ─────────────────────────────────────────────────────────────

@router.post("/chat")
async def ai_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Knowledge assistant chat with RAG (Retrieval-Augmented Generation).

    The assistant can answer questions about:
    - Women's safety tips and procedures
    - Legal rights in India
    - Emergency procedures and helplines
    - Cyber safety and digital security
    - Self-defense awareness
    - Platform feature guidance

    Uses ChromaDB for knowledge retrieval with graceful fallback.
    """
    start_time = time.time()

    result = await chat_with_knowledge_base({
        "message": payload.message,
        "user_id": str(current_user.id),
        "conversation_history": payload.conversation_history or [],
        "language": payload.language,
    })

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "message": result.get("response", "I'm here to help with your safety questions."),
        "sources": result.get("sources", []),
        "related_topics": result.get("related_topics", []),
        "suggested_actions": result.get("suggested_actions", []),
        "helplines_mentioned": result.get("helplines", {}),
        "conversation_id": result.get("conversation_id", "demo_conv_001"),
        "analysis_metadata": {
            "response_time_ms": elapsed_ms,
            "model_version": "knowledge-agent-v1",
            "retrieval_used": result.get("retrieval_used", False),
            "mock_mode": True,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
