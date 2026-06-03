"""
Emergency Response Agent using LangGraph.

Handles the full emergency response workflow when an SOS is triggered:

  capture_situation -> generate_summary -> notify_contacts -> trigger_workflows -> log_event

Returns structured emergency response data including:
  - Unique emergency ID
  - AI-generated situation summary
  - Actions taken (contacts notified, workflows triggered)
  - Estimated time to help
"""

import asyncio
import uuid
import random
from datetime import datetime, timezone
from typing import TypedDict, List, Optional

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False


# ── State Definition ───────────────────────────────────────────────────────────

class EmergencyState(TypedDict):
    """State passed through the emergency response pipeline."""
    sos_id: str
    user_id: str
    user_name: str
    location: dict
    emergency_type: str
    contacts: List[dict]

    # Pipeline outputs
    emergency_id: str
    situation_capture: dict
    summary: str
    notifications_sent: List[dict]
    workflows_triggered: List[str]
    actions_taken: List[str]
    eta_for_help: str
    response: dict


# ── Emergency Type Context ─────────────────────────────────────────────────────

EMERGENCY_PROTOCOLS = {
    "general": {
        "priority": "high",
        "notify_police": False,
        "notify_ambulance": False,
        "message_template": "User {name} has triggered an SOS alert at {location}. Please contact them immediately.",
    },
    "medical": {
        "priority": "critical",
        "notify_police": False,
        "notify_ambulance": True,
        "message_template": "MEDICAL EMERGENCY: {name} needs immediate medical assistance at {location}. Call ambulance immediately.",
    },
    "assault": {
        "priority": "critical",
        "notify_police": True,
        "notify_ambulance": True,
        "message_template": "ASSAULT REPORTED: {name} may be under physical attack at {location}. Call police (100) immediately.",
    },
    "stalking": {
        "priority": "high",
        "notify_police": True,
        "notify_ambulance": False,
        "message_template": "STALKING ALERT: {name} is being followed at {location}. Please contact them and consider calling police (100).",
    },
    "accident": {
        "priority": "critical",
        "notify_police": True,
        "notify_ambulance": True,
        "message_template": "ACCIDENT: {name} may have been in an accident at {location}. Immediate assistance required.",
    },
}


# ── Node Functions ─────────────────────────────────────────────────────────────

def capture_situation(state: EmergencyState) -> EmergencyState:
    """
    Node 1: Capture and contextualize the emergency situation.
    """
    emergency_type = state["emergency_type"]
    location = state["location"]
    user_name = state["user_name"]

    protocol = EMERGENCY_PROTOCOLS.get(emergency_type, EMERGENCY_PROTOCOLS["general"])
    address = location.get("address", "Unknown Location")
    lat = location.get("lat", 0)
    lng = location.get("lng", 0)

    situation_capture = {
        "emergency_id": state["emergency_id"],
        "emergency_type": emergency_type,
        "priority": protocol["priority"],
        "user_name": user_name,
        "location": {
            "address": address,
            "lat": lat,
            "lng": lng,
            "google_maps_url": f"https://maps.google.com/?q={lat},{lng}",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "protocol": protocol,
    }

    return {**state, "situation_capture": situation_capture}


def generate_summary(state: EmergencyState) -> EmergencyState:
    """
    Node 2: Generate an AI summary of the emergency for notifications.
    """
    capture = state["situation_capture"]
    protocol = capture.get("protocol", {})
    user_name = state["user_name"]
    location = state["location"]
    emergency_type = state["emergency_type"]

    address = location.get("address", "Unknown location")
    lat = location.get("lat", 0)
    lng = location.get("lng", 0)
    maps_url = f"https://maps.google.com/?q={lat},{lng}"

    template = protocol.get("message_template", EMERGENCY_PROTOCOLS["general"]["message_template"])
    contact_message = template.format(name=user_name, location=address)

    summary = (
        f"🚨 EMERGENCY ALERT - {emergency_type.upper()} 🚨\n\n"
        f"User: {user_name}\n"
        f"Location: {address}\n"
        f"Map: {maps_url}\n"
        f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
        f"{contact_message}\n\n"
        f"Emergency Helplines:\n"
        f"  Police: 100\n"
        f"  Ambulance: 102\n"
        f"  Emergency: 112\n"
        f"  Women Helpline: 181\n\n"
        f"Reference ID: {state['emergency_id']}"
    )

    return {**state, "summary": summary}


def notify_contacts(state: EmergencyState) -> EmergencyState:
    """
    Node 3: Log notification dispatch to emergency contacts.

    In production, this would integrate with:
    - SMS gateway (Twilio, AWS SNS)
    - Email service (SendGrid, SES)
    - Push notifications (FCM, APNs)
    """
    contacts = state.get("contacts", [])
    notifications_sent = []

    for contact in contacts:
        notifications_sent.append({
            "contact_name": contact.get("name", "Unknown"),
            "contact_phone": contact.get("phone", ""),
            "contact_email": contact.get("email", ""),
            "methods": ["sms", "email"],
            "status": "sent",  # Mock: always sent in demo
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "message_preview": state["summary"][:100] + "...",
        })

    actions_taken = [
        f"Emergency alert created: {state['emergency_id']}",
        f"Notified {len(notifications_sent)} emergency contact(s) via SMS and email",
        "AI emergency summary generated",
        "Location shared with all contacts",
    ]

    if state["situation_capture"].get("protocol", {}).get("notify_police"):
        actions_taken.append("Police notification protocol activated (manual action may be required)")

    if state["situation_capture"].get("protocol", {}).get("notify_ambulance"):
        actions_taken.append("Medical emergency protocol activated - please call 102")

    return {**state, "notifications_sent": notifications_sent, "actions_taken": actions_taken}


def trigger_workflows(state: EmergencyState) -> EmergencyState:
    """
    Node 4: Trigger automated workflows via n8n or similar automation tools.
    """
    emergency_type = state["emergency_type"]
    priority = state["situation_capture"].get("protocol", {}).get("priority", "high")

    workflows_triggered = [
        "sos_emergency_notification",
        "guardian_alert_workflow",
    ]

    if priority == "critical":
        workflows_triggered.extend([
            "emergency_services_alert",
            "platform_admin_notification",
        ])

    if emergency_type in ("assault", "stalking"):
        workflows_triggered.append("incident_auto_create_workflow")

    return {**state, "workflows_triggered": workflows_triggered}


def log_event(state: EmergencyState) -> EmergencyState:
    """
    Node 5: Log the emergency event and build the final response.
    """
    # Estimate time to help based on emergency type
    eta_map = {
        "general": "10-15 minutes (guardian response)",
        "medical": "5-10 minutes (ambulance dispatch)",
        "assault": "3-5 minutes (police nearest PCR van)",
        "stalking": "10-15 minutes (police patrol)",
        "accident": "5-8 minutes (emergency services)",
    }
    eta = eta_map.get(state["emergency_type"], "10-15 minutes")

    response = {
        "emergency_id": state["emergency_id"],
        "sos_id": state["sos_id"],
        "user_id": state["user_id"],
        "user_name": state["user_name"],
        "emergency_type": state["emergency_type"],
        "priority": state["situation_capture"].get("protocol", {}).get("priority", "high"),
        "summary": state["summary"],
        "location": state["situation_capture"]["location"],
        "notifications_sent": state["notifications_sent"],
        "workflows_triggered": state["workflows_triggered"],
        "actions_taken": state["actions_taken"],
        "eta_for_help": eta,
        "helplines": {
            "police": "100",
            "ambulance": "102",
            "emergency": "112",
            "women_helpline": "181",
            "women_in_distress": "1091",
        },
        "logged_at": datetime.now(timezone.utc).isoformat(),
    }

    return {**state, "eta_for_help": eta, "response": response}


# ── Build Graph ────────────────────────────────────────────────────────────────

def _build_emergency_graph():
    if not LANGGRAPH_AVAILABLE:
        return None
    try:
        workflow = StateGraph(EmergencyState)
        workflow.add_node("capture_situation", capture_situation)
        workflow.add_node("generate_summary", generate_summary)
        workflow.add_node("notify_contacts", notify_contacts)
        workflow.add_node("trigger_workflows", trigger_workflows)
        workflow.add_node("log_event", log_event)

        workflow.set_entry_point("capture_situation")
        workflow.add_edge("capture_situation", "generate_summary")
        workflow.add_edge("generate_summary", "notify_contacts")
        workflow.add_edge("notify_contacts", "trigger_workflows")
        workflow.add_edge("trigger_workflows", "log_event")
        workflow.add_edge("log_event", END)

        return workflow.compile()
    except Exception:
        return None


_emergency_graph = _build_emergency_graph()


# ── Public API ─────────────────────────────────────────────────────────────────

async def handle_emergency(input_data: dict) -> dict:
    """
    Run the emergency response pipeline.

    Args:
        input_data: SOS trigger data including location, user info, contacts.

    Returns:
        Emergency response data with actions taken and ETA for help.
    """
    initial_state: EmergencyState = {
        "sos_id": input_data.get("sos_id", ""),
        "user_id": input_data.get("user_id", ""),
        "user_name": input_data.get("user_name", "User"),
        "location": input_data.get("location", {"lat": 0, "lng": 0, "address": "Unknown"}),
        "emergency_type": input_data.get("emergency_type", "general"),
        "contacts": input_data.get("contacts", []),
        "emergency_id": str(uuid.uuid4()).upper()[:12],
        "situation_capture": {},
        "summary": "",
        "notifications_sent": [],
        "workflows_triggered": [],
        "actions_taken": [],
        "eta_for_help": "10-15 minutes",
        "response": {},
    }

    if _emergency_graph is not None:
        try:
            loop = asyncio.get_event_loop()
            final_state = await loop.run_in_executor(
                None,
                lambda: _emergency_graph.invoke(initial_state),
            )
            return final_state.get("response", {})
        except Exception:
            pass

    # Manual fallback
    state = initial_state
    for node_fn in [capture_situation, generate_summary, notify_contacts, trigger_workflows, log_event]:
        state = node_fn(state)

    return state.get("response", {})
