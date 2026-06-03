"""
n8n Client Integration.
Sends webhooks to n8n to trigger external safety automation workflows.
"""

import httpx
from app.core.config import settings

async def trigger_sos_workflow(sos_data: dict) -> bool:
    """
    Trigger the SOS workflow in n8n.
    Sends full emergency data to the configured webhook URL.
    """
    # Check if enabled
    # We load from env directly or fallback
    n8n_enabled = getattr(settings, "N8N_ENABLED", False)
    if not n8n_enabled:
        # Mock mode
        print(f"[n8n Integration] Mock Trigger: SOS alert {sos_data.get('sos_id')} received.")
        return True

    webhook_url = getattr(settings, "N8N_WEBHOOK_URL", "")
    if not webhook_url:
        return False

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(webhook_url, json=sos_data)
            if response.status_code in (200, 201, 202):
                return True
            return False
    except Exception as e:
        print(f"[n8n Integration] Error triggering webhook: {e}")
        return False
