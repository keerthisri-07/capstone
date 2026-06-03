"""
Distress Detection Agent using LangGraph.

This agent analyzes text input to detect signs of distress or danger using
a multi-stage pipeline:

  preprocess_text -> classify_distress -> generate_recommendations -> format_response

Classification levels:
  - safe       (confidence 0-25%):  Normal communication, no distress signals
  - concern    (confidence 25-50%): Mild stress or discomfort detected
  - warning    (confidence 50-75%): Significant distress, possible unsafe situation
  - emergency  (confidence 75-100%): Immediate danger, activate emergency response

The agent gracefully falls back to rule-based classification when no API key
is configured, ensuring the system works in demo/development mode.
"""

import re
import asyncio
from typing import TypedDict, Optional, List, Any

# LangGraph import with graceful fallback
try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False


# ── State Definition ───────────────────────────────────────────────────────────

class DistressState(TypedDict):
    """State object passed between nodes in the distress detection pipeline."""
    input_text: str
    context: str
    user_id: str
    preprocessed_text: str
    classification: str          # safe | concern | warning | emergency
    confidence: float            # 0.0 to 1.0
    reasoning: str
    recommendations: List[str]
    response: dict


# ── Keyword Dictionaries ───────────────────────────────────────────────────────

EMERGENCY_KEYWORDS = {
    "help me", "i'm in danger", "someone is attacking", "call police",
    "i am being attacked", "rape", "assault", "kidnap", "threatening me",
    "going to hurt me", "please help", "sos", "danger", "he has a weapon",
    "she has a knife", "gun", "i might die", "emergency", "save me",
    "being followed into", "locked me", "can't escape",
}

WARNING_KEYWORDS = {
    "following me", "someone is following", "feels unsafe", "i feel unsafe",
    "being watched", "he keeps staring", "she keeps staring", "threatening",
    "stalking", "scared", "terrified", "afraid", "don't feel safe",
    "weird man", "weird woman", "suspicious", "uncomfortable",
    "creepy", "harassing", "harassment", "touching me", "grabbed my",
}

CONCERN_KEYWORDS = {
    "alone", "dark area", "late night", "no one around", "nervous",
    "anxious", "something feels wrong", "uneasy", "worried", "not sure",
    "this route is deserted", "no lights", "empty street",
    "running late", "missed bus", "missed my stop", "lost",
}


# ── Node Functions ─────────────────────────────────────────────────────────────

def preprocess_text(state: DistressState) -> DistressState:
    """
    Node 1: Clean and normalize the input text.

    - Converts to lowercase
    - Removes excessive whitespace
    - Expands common abbreviations
    """
    text = state["input_text"].strip().lower()
    # Expand abbreviations
    abbreviations = {
        r"\bpls\b": "please",
        r"\bplz\b": "please",
        r"\bu\b": "you",
        r"\br\b": "are",
        r"\bim\b": "i am",
        r"\bdnt\b": "don't",
        r"\bsumbdy\b": "somebody",
        r"\bsmone\b": "someone",
    }
    for pattern, replacement in abbreviations.items():
        text = re.sub(pattern, replacement, text)

    text = re.sub(r"\s+", " ", text)

    return {**state, "preprocessed_text": text}


def classify_distress(state: DistressState) -> DistressState:
    """
    Node 2: Classify the distress level of the preprocessed text.

    Uses keyword matching for mock/demo mode.
    In production with API keys, this would invoke the LLM.
    """
    text = state["preprocessed_text"]

    # Check emergency first (most severe)
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text:
            reasoning = (
                f"Emergency keyword detected: '{keyword}'. "
                f"The text contains phrases indicating immediate danger or a request for urgent help."
            )
            return {
                **state,
                "classification": "emergency",
                "confidence": 0.92,
                "reasoning": reasoning,
            }

    # Check warning
    for keyword in WARNING_KEYWORDS:
        if keyword in text:
            reasoning = (
                f"Warning keyword detected: '{keyword}'. "
                f"The text suggests the user may be in an unsafe or uncomfortable situation."
            )
            return {
                **state,
                "classification": "warning",
                "confidence": 0.72,
                "reasoning": reasoning,
            }

    # Check concern
    for keyword in CONCERN_KEYWORDS:
        if keyword in text:
            reasoning = (
                f"Concern keyword detected: '{keyword}'. "
                f"The text indicates mild concern or an uncertain situation that warrants attention."
            )
            return {
                **state,
                "classification": "concern",
                "confidence": 0.45,
                "reasoning": reasoning,
            }

    # Default: safe
    return {
        **state,
        "classification": "safe",
        "confidence": 0.18,
        "reasoning": "No distress indicators found in the text. Communication appears normal.",
    }


def generate_recommendations(state: DistressState) -> DistressState:
    """
    Node 3: Generate actionable recommendations based on classification.
    """
    classification = state["classification"]

    recs_map = {
        "emergency": [
            "🚨 Call emergency services immediately: 112",
            "🚔 Call police: 100",
            "📞 Women helpline: 181",
            "📍 Share your live location with your guardian NOW",
            "🔔 Trigger SOS alert on the app",
            "🏃 Move to the nearest crowded public place",
            "📢 Make noise to attract attention if in immediate danger",
        ],
        "warning": [
            "📍 Share your live location with a trusted contact",
            "📞 Call someone you trust and stay on the line",
            "🏪 Move to a well-lit, populated area immediately",
            "📱 Keep your phone visible and accessible",
            "🚗 Consider calling a trusted cab service",
            "📞 Women Helpline: 181 is available 24/7",
        ],
        "concern": [
            "📍 Let someone know your current location",
            "🔦 Stay on well-lit routes",
            "📞 Keep emergency contacts accessible",
            "🚶 Avoid isolated areas",
            "💬 Check in with a guardian or friend",
        ],
        "safe": [
            "✅ Everything looks normal. Stay aware of your surroundings.",
            "📱 Keep emergency contacts saved for quick access",
            "💪 Review our safety tips in the Knowledge Base",
        ],
    }

    return {**state, "recommendations": recs_map.get(classification, recs_map["safe"])}


def format_response(state: DistressState) -> DistressState:
    """
    Node 4: Format the final response dictionary.
    """
    response = {
        "classification": state["classification"],
        "confidence": state["confidence"],
        "reasoning": state["reasoning"],
        "recommendations": state["recommendations"],
        "input_text": state["input_text"],
    }
    return {**state, "response": response}


# ── Build LangGraph Graph ──────────────────────────────────────────────────────

def _build_distress_graph():
    """Construct and compile the distress detection StateGraph."""
    if not LANGGRAPH_AVAILABLE:
        return None

    try:
        workflow = StateGraph(DistressState)

        # Add nodes
        workflow.add_node("preprocess_text", preprocess_text)
        workflow.add_node("classify_distress", classify_distress)
        workflow.add_node("generate_recommendations", generate_recommendations)
        workflow.add_node("format_response", format_response)

        # Add edges (sequential pipeline)
        workflow.set_entry_point("preprocess_text")
        workflow.add_edge("preprocess_text", "classify_distress")
        workflow.add_edge("classify_distress", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "format_response")
        workflow.add_edge("format_response", END)

        return workflow.compile()
    except Exception:
        return None


# Compile graph at module load (may be None if LangGraph not available)
_distress_graph = _build_distress_graph()


# ── Public API ─────────────────────────────────────────────────────────────────

async def detect_distress(input_data: dict) -> dict:
    """
    Run the distress detection pipeline on the input data.

    Args:
        input_data: Dictionary with keys:
            - input_text (str): Text to analyze
            - context (str, optional): Additional context
            - user_id (str): User identifier

    Returns:
        Dictionary with classification, confidence, reasoning, recommendations.
    """
    initial_state: DistressState = {
        "input_text": input_data.get("input_text", ""),
        "context": input_data.get("context", ""),
        "user_id": input_data.get("user_id", ""),
        "preprocessed_text": "",
        "classification": "safe",
        "confidence": 0.0,
        "reasoning": "",
        "recommendations": [],
        "response": {},
    }

    if _distress_graph is not None:
        try:
            # Run the LangGraph pipeline
            loop = asyncio.get_event_loop()
            final_state = await loop.run_in_executor(
                None,
                lambda: _distress_graph.invoke(initial_state),
            )
            return final_state.get("response", {})
        except Exception:
            pass  # Fall through to manual execution

    # Manual pipeline execution (fallback)
    state = initial_state
    for node_fn in [preprocess_text, classify_distress, generate_recommendations, format_response]:
        state = node_fn(state)

    return state.get("response", {})
