"""
Knowledge Retrieval-Augmented Generation (RAG) Agent.

Answers questions about women's safety, legal rights, and emergency procedures.
Queries a local ChromaDB collection or falls back to keyword searching over 
the seeded safety documents if database is unavailable or running in serverless/offline environments.
"""

import os
import re
import uuid
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.core.config import settings

# Pre-defined safety documents (fallback dataset)
SAFETY_DOCUMENTS = [
    # Legal Rights (India)
    {"id": "law_01", "text": "Zero FIR: A First Information Report (FIR) can be filed at any police station, regardless of the jurisdiction where the incident occurred. This ensures immediate action. It is later transferred to the relevant police station.", "category": "Legal Rights"},
    {"id": "law_02", "text": "Right to Privacy: Under Section 164 of the CrPC, a woman who has been a victim of sexual assault has the right to record her statement in private, in the presence of a female police officer or magistrate.", "category": "Legal Rights"},
    {"id": "law_03", "text": "No Arrest After Sunset: Under Section 46(4) of the CrPC, a woman cannot be arrested after sunset and before sunrise, except in exceptional circumstances with the prior permission of a Judicial Magistrate.", "category": "Legal Rights"},
    {"id": "law_04", "text": "Free Legal Aid: Under the Legal Services Authorities Act, a woman is entitled to free legal aid, regardless of her income, to fight a case in court.", "category": "Legal Rights"},
    {"id": "law_05", "text": "Right Against Workplace Harassment: The POSH Act (Prevention of Sexual Harassment) mandates every workplace with 10 or more employees to have an Internal Complaints Committee (ICC) to address sexual harassment grievances.", "category": "Legal Rights"},
    {"id": "law_06", "text": "Right to Virtual Complaints: Women can file a complaint via email or registered post if they cannot physically go to the police station. The Station House Officer (SHO) will assign an officer to follow up.", "category": "Legal Rights"},
    {"id": "law_07", "text": "Protection from Domestic Violence Act, 2005: Provides protection to a woman from physical, emotional, verbal, sexual, and economic abuse by a partner or family member living in a shared household.", "category": "Legal Rights"},
    {"id": "law_08", "text": "Right Against Stalking: Section 354D of the IPC criminalizes physical stalking and cyberstalking. Repeated unwanted contact is a punishable offense.", "category": "Legal Rights"},
    {"id": "law_09", "text": "Right Against Voyeurism: Section 354C of the IPC makes it illegal for anyone to capture or share images of a woman engaging in a private act without her consent.", "category": "Legal Rights"},
    {"id": "law_10", "text": "Equal Remuneration Act: Mandates that women must be paid the same salary as men for doing the same or similar work, preventing gender-based wage discrimination.", "category": "Legal Rights"},

    # Helplines and Emergency Numbers (India)
    {"id": "help_01", "text": "National Emergency Number: Dial 112 for immediate police, fire, or medical assistance across India. This is a unified emergency response number.", "category": "Emergency Response"},
    {"id": "help_02", "text": "Women's Helpline Number: Dial 1091 for a dedicated police helpline specifically for women in distress. It is toll-free and operates 24/7.", "category": "Emergency Response"},
    {"id": "help_03", "text": "Domestic Abuse Helpline: Dial 181 for the women's helpline addressing domestic violence and abuse.", "category": "Emergency Response"},
    {"id": "help_04", "text": "National Commission for Women (NCW): Contact number 7827170170 (WhatsApp) for reporting violence and seeking intervention from the commission.", "category": "Emergency Response"},
    {"id": "help_05", "text": "Cyber Crime Helpline: Dial 1930 or visit cybercrime.gov.in to report cyberstalking, deepfakes, online harassment, or financial fraud.", "category": "Emergency Response"},
    {"id": "help_06", "text": "Police Control Room: Dial 100 for direct connection to local police dispatches.", "category": "Emergency Response"},
    {"id": "help_07", "text": "Ambulance Helpline: Dial 108 or 102 for emergency medical transport.", "category": "Emergency Response"},
    {"id": "help_08", "text": "Railway Police Helpline: Dial 1512 for safety emergencies while traveling on Indian Railways.", "category": "Emergency Response"},
    {"id": "help_09", "text": "Student/Child Helpline: Dial 1098 if the victim is a minor facing abuse or trafficking.", "category": "Emergency Response"},
    {"id": "help_10", "text": "Tourist Police: Dial 1363 for assistance if you are a female tourist facing safety issues in India.", "category": "Emergency Response"},

    # Public Transport & Travel Safety
    {"id": "travel_01", "text": "Cab Safety: Before entering a taxi or ride-share, verify the license plate, driver's name, and photo. Always share your live trip status with a trusted guardian.", "category": "Travel Safety"},
    {"id": "travel_02", "text": "Sitting Arrangement in Cabs: Always sit in the back seat of a taxi. This keeps you out of immediate reach and allows for an easier exit from either door if necessary.", "category": "Travel Safety"},
    {"id": "travel_03", "text": "Public Transport Awareness: While on a bus or train, avoid empty compartments. Sit near other women, families, or the conductor/driver.", "category": "Travel Safety"},
    {"id": "travel_04", "text": "Fake Phone Call Tactic: If you feel uncomfortable during a ride, make a fake phone call (or use SafeHer's Fake Call feature) and loudly state your location, ETA, and cab number.", "category": "Travel Safety"},
    {"id": "travel_05", "text": "Child Lock Check: As soon as you enter a cab, check if the child lock on your door is engaged. Roll down the window slightly if you feel suspicious.", "category": "Travel Safety"},
    {"id": "travel_06", "text": "Walking at Night: Stick to well-lit, populated streets. Walk confidently, keep your head up, and avoid looking at your phone to maintain situational awareness.", "category": "Travel Safety"},
    {"id": "travel_07", "text": "Car Keys as Weapons: Do not lace keys between your fingers as it can break your hand. Hold a single key firmly pointing outward like a small knife for defense.", "category": "Travel Safety"},
    {"id": "travel_08", "text": "Elevator Safety: Stand near the control panel in an elevator. If someone suspicious enters, press all the floor buttons so the doors open frequently.", "category": "Travel Safety"},
    {"id": "travel_09", "text": "Hotel Safety: Always use the deadbolt. Do not answer the door for 'room service' if you didn't order any. Call the front desk to verify.", "category": "Travel Safety"},
    {"id": "travel_10", "text": "Route Unpredictability: If you commute daily, occasionally alter your route and the time you travel to prevent stalkers from learning your patterns.", "category": "Travel Safety"},

    # Cyber Safety & Online Protection
    {"id": "cyber_01", "text": "Social Media Privacy: Keep social media profiles private. Do not accept friend requests from unknown individuals. Turn off live location sharing on platforms like Snapchat.", "category": "Cyber Safety"},
    {"id": "cyber_02", "text": "Reporting Deepfakes: If you find non-consensual deepfake imagery of yourself, immediately report it to the platform, block the sender, and file a complaint on the National Cyber Crime Portal.", "category": "Cyber Safety"},
    {"id": "cyber_03", "text": "Doxxing Protection: Avoid posting pictures that reveal your home address, vehicle license plates, or specific workplace building names.", "category": "Cyber Safety"},
    {"id": "cyber_04", "text": "Handling Cyberstalking: Do not engage or reply to a cyberstalker. Take screenshots of all messages/threats as evidence, block the account, and report to authorities.", "category": "Cyber Safety"},
    {"id": "cyber_05", "text": "Strong Passwords: Use unique, 12+ character passwords with a mix of symbols. Enable Two-Factor Authentication (2FA) on all email and social accounts.", "category": "Cyber Safety"},
    {"id": "cyber_06", "text": "Phishing Awareness: Never click on suspicious links sent via SMS or email claiming you won a prize or your bank account is blocked. These are used to steal credentials.", "category": "Cyber Safety"},
    {"id": "cyber_07", "text": "Public Wi-Fi Risks: Avoid logging into banking apps or typing passwords while connected to free public Wi-Fi in cafes or airports. Use a VPN if necessary.", "category": "Cyber Safety"},
    {"id": "cyber_08", "text": "Location Tagging: Delay posting your location on social media. Post pictures of restaurants or events *after* you have left the venue, not while you are still there.", "category": "Cyber Safety"},
    {"id": "cyber_09", "text": "Bluetooth Security: Turn off Bluetooth and AirDrop when in public places to prevent strangers from sending unsolicited inappropriate images.", "category": "Cyber Safety"},
    {"id": "cyber_10", "text": "Webcam Cover: Keep your laptop webcam covered with a sticker or slide cover when not in use to prevent remote surveillance by hackers.", "category": "Cyber Safety"},

    # Self-Defense & Immediate Action
    {"id": "defense_01", "text": "The Vulnerable Points: If physically attacked, aim for the attacker's most vulnerable areas: eyes, nose, throat, and groin.", "category": "Self Defense"},
    {"id": "defense_02", "text": "Palm Strike: Use the heel of your palm to strike upward into the attacker's nose. This is highly effective and less likely to injure your hand compared to a closed fist.", "category": "Self Defense"},
    {"id": "defense_03", "text": "Escaping a Wrist Hold: If someone grabs your wrist, pull your arm forcefully in the direction of their thumb (the weakest point of their grip).", "category": "Self Defense"},
    {"id": "defense_04", "text": "Using Pepper Spray: Aim for the eyes and face in a side-to-side sweeping motion. Hold your breath, spray, and run immediately in the opposite direction.", "category": "Self Defense"},
    {"id": "defense_05", "text": "Loud Voice as a Weapon: Shout 'FIRE' instead of 'HELP'. People are more likely to respond to a fire emergency. Shout 'NO' and 'STOP' in a deep, authoritative voice.", "category": "Self Defense"},
    {"id": "defense_06", "text": "Escaping a Bear Hug (Front): If grabbed from the front, drop your weight down instantly, and strike the attacker's groin with your knee.", "category": "Self Defense"},
    {"id": "defense_07", "text": "Escaping a Bear Hug (Rear): If grabbed from behind, stomp heavily on their instep/foot, or throw your head back into their nose.", "category": "Self Defense"},
    {"id": "defense_08", "text": "Improvised Weapons: Use everyday items for defense. An umbrella, heavy bag, hot coffee, dirt, or a pen can be used to distract or strike an attacker.", "category": "Self Defense"},
    {"id": "defense_09", "text": "The OODA Loop: Observe (your surroundings), Orient (identify threats), Decide (run or fight), Act. Do not freeze; take any action to disrupt the attacker's plan.", "category": "Self Defense"},
    {"id": "defense_10", "text": "Distance is Safety: Keep a minimum distance of two arm-lengths from strangers who ask for directions or make you uncomfortable. Do not let them close the gap.", "category": "Self Defense"}
]

# Try initializing ChromaDB
chroma_collection = None
try:
    import chromadb
    chroma_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db"))
    chroma_client = chromadb.PersistentClient(path=chroma_path)
    # Ensure collection exists
    chroma_collection = chroma_client.get_collection(name="womens_safety_knowledge")
except Exception:
    chroma_collection = None


def query_knowledge_base(query: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Query ChromaDB or fall back to keyword matching over local documents."""
    results = []
    
    # 1. Try querying ChromaDB
    if chroma_collection is not None:
        try:
            db_res = chroma_collection.query(
                query_texts=[query],
                n_results=limit
            )
            if db_res and db_res.get("documents") and db_res["documents"][0]:
                for i in range(len(db_res["documents"][0])):
                    results.append({
                        "id": db_res["ids"][0][i],
                        "text": db_res["documents"][0][i],
                        "category": db_res["metadatas"][0][i].get("category", "General")
                    })
                return results
        except Exception:
            pass # Fall back to local search
            
    # 2. Fall back to local keyword searching
    keywords = re.findall(r"\w+", query.lower())
    scored_docs = []
    for doc in SAFETY_DOCUMENTS:
        score = 0
        doc_text_lower = doc["text"].lower()
        doc_cat_lower = doc["category"].lower()
        for kw in keywords:
            if len(kw) > 3: # Only match meaningful keywords
                if kw in doc_text_lower:
                    score += 2
                if kw in doc_cat_lower:
                    score += 5
        if score > 0:
            scored_docs.append((score, doc))
            
    # Sort and pick top results
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    results = [doc for score, doc in scored_docs[:limit]]
    
    # If no matches, return default safety tips
    if not results:
        results = SAFETY_DOCUMENTS[:limit]
        
    return results


async def chat_with_knowledge_base(input_data: dict) -> dict:
    """
    RAG Assistant Chat.
    Retrieves relevant knowledge base contexts and queries Gemini/OpenAI or generates a mock response.
    """
    message = input_data.get("message", "")
    conversation_history = input_data.get("conversation_history", [])
    
    # Retrieve sources
    sources = query_knowledge_base(message, limit=3)
    context_str = "\n\n".join([f"Category: {s['category']}\nTip: {s['text']}" for s in sources])
    
    # Check for API key and determine provider
    api_key = settings.GEMINI_API_KEY
    openai_key = settings.OPENAI_API_KEY
    
    response_text = ""
    retrieval_used = len(sources) > 0
    
    # Identify key terms for helplines and related topics
    msg_lower = message.lower()
    helplines = {}
    if "police" in msg_lower or "100" in msg_lower:
        helplines["Police"] = "100"
    if "women" in msg_lower or "181" in msg_lower or "1091" in msg_lower:
        helplines["Women Helpline"] = "181 / 1091"
    if "emergency" in msg_lower or "112" in msg_lower:
        helplines["National Emergency"] = "112"
    if "cyber" in msg_lower or "online" in msg_lower or "1930" in msg_lower:
        helplines["Cyber Crime"] = "1930"

    related_topics = []
    suggested_actions = []
    
    # Categorize topic to give structured suggestions
    if any(k in msg_lower for k in ["fir", "law", "right", "arrest", "court", "legal"]):
        related_topics = ["Zero FIR Procedures", "Right to Privacy", "Free Legal Aid in India"]
        suggested_actions = ["Ask for a female police officer", "Record statements under CrPC 164", "Contact Free Legal Services"]
    elif any(k in msg_lower for k in ["cab", "taxi", "travel", "auto", "night", "bus", "train"]):
        related_topics = ["Safe Rideshare Practices", "Sitting arrangements", "Child Lock checks"]
        suggested_actions = ["Share live trip details", "Sit in the rear seat", "Check door child-locks"]
    elif any(k in msg_lower for k in ["attack", "fight", "defense", "pepper", "spray", "wrist"]):
        related_topics = ["Vulnerable strike points", "Palm strike technique", "Pepper spray usage"]
        suggested_actions = ["Aim for eyes and throat", "Pull wrist towards attacker's thumb", "Shout 'FIRE' loudly"]
    elif any(k in msg_lower for k in ["online", "password", "cyber", "insta", "facebook", "stalk", "social"]):
        related_topics = ["Social media privacy settings", "Handling cyberstalkers", "Doxxing protections"]
        suggested_actions = ["Lock social media profiles", "Report deepfakes immediately", "Enable 2FA (Two-factor auth)"]
    else:
        related_topics = ["Emergency Helplines", "Immediate Self Defense", "Legal Rights Overview"]
        suggested_actions = ["Save speed-dial shortcuts", "Review Indian Penal Code rights", "Download safety checklist"]

    # 1. Try Gemini API
    if api_key and api_key != "your-gemini-api-key-here":
        try:
            prompt = f"""You are 'Chitti', a supportive and professional AI safety assistant for SafeHer.
Answer the user's safety query based on the retrieved safety knowledge facts. 
If the retrieved facts do not directly answer, provide general safety advice focusing on practical, actionable tips.
Keep the answer helpful, empathetic, and formatted using clean Markdown.

Retrieved Safety Knowledge:
{context_str}

User's Question: {message}
"""
            url = f"https://generativelimits.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            # Fallback to standard endpoint
            if "generativelimits" not in url:
                url = f"https://generativetooling.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            # Use standard API endpoint url
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            response_text = ""

    # 2. Try OpenAI API if Gemini failed or wasn't set
    if not response_text and openai_key and openai_key != "your-openai-api-key-here":
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            prompt = f"Retrieved Safety Knowledge:\n{context_str}\n\nUser Question: {message}"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are 'Chitti', an empathetic and professional women's safety AI assistant for SafeHer. Answer based on safety knowledge context."},
                    {"role": "user", "content": prompt}
                ]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data["choices"][0]["message"]["content"]
        except Exception:
            response_text = ""

    # 3. Fallback to Local/Mock response generator
    if not response_text:
        # Match query with some custom rules
        matched_text = "Here is what I found in our safety knowledge base:\n\n"
        for s in sources:
            matched_text += f"- **{s['category']}**: {s['text']}\n"
            
        matched_text += "\nAlways trust your intuition. In any emergency, your immediate safety is the top priority."
        response_text = matched_text

    return {
        "response": response_text,
        "sources": [{"title": s["category"], "content": s["text"], "id": s["id"]} for s in sources],
        "related_topics": related_topics,
        "suggested_actions": suggested_actions,
        "helplines": helplines,
        "conversation_id": input_data.get("conversation_id", f"conv-{uuid.uuid4().hex[:8]}"),
        "retrieval_used": retrieval_used
    }
