# 🛡️ SURAKSHA — Software Requirements & UML Architecture Documentation

> **AI Women Safety Companion Platform**  
> *Ready-to-use specifications and diagrams for Project Documentation and PPT Presentation*

---

## Table of Contents
1. [Functional & Non-Functional Requirements](#1-functional--non-functional-requirements)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Entity-Relationship (ER) Diagram](#3-entity-relationship-er-diagram)
4. [Use Case Diagram](#4-use-case-diagram)
5. [Sequence Diagrams](#5-sequence-diagrams)
   - 5.1 SOS Emergency Trigger & Orchestration
   - 5.2 Journey Monitoring & Anomaly Detection
6. [Activity Diagram](#6-activity-diagram)
7. [Deployment Diagram](#7-deployment-diagram)
8. [Slide-by-Slide Presentation Guide (PPT Ready)](#8-slide-by-slide-presentation-guide)

---

## 1. Functional & Non-Functional Requirements

### 1.1 Functional Requirements (FR)

| ID | Feature Domain | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **User Authentication & RBAC** | Support registration, bcrypt password hashing, JWT access/refresh token rotation, email OTP verification, and role-based access control (`user`, `guardian`, `admin`). | Must Have |
| **FR-02** | **One-Tap SOS Emergency** | Instant trigger of emergency alarm capturing real-time GPS coordinates, reverse-geocoded address, emergency type (`general`, `medical`, `assault`, `stalking`, `accident`), and automated summary. | Must Have |
| **FR-03** | **Guardian Network** | Manage trusted contacts with relationship tagging, invitation status tracking (`pending`, `active`, `declined`), and customizable notification preferences. | Must Have |
| **FR-04** | **Journey Tracking & Anomaly Detection** | Real-time GPS path logging with automatic detection of route deviations (>500m using Haversine algorithm), prolonged stoppages (>15 min), and expected arrival delays (>20%). | Must Have |
| **FR-05** | **Distress Detection Engine** | AI-driven sentiment and threat analysis of user text/voice input, classifying danger levels into 4 tiers: `Safe` (80-100), `Concern` (60-79), `Warning` (40-59), and `Emergency` (<40). | Must Have |
| **FR-06** | **Incident Intelligence & Reporting** | Allow reporting of safety violations (harassment, stalking, assault, cyber threats), auto-generate chronological timelines and severity assessments, and export reports in PDF/DOCX formats. | Should Have |
| **FR-07** | **RAG Safety & Legal Knowledge Assistant** | Conversational AI grounded on ChromaDB vector store containing Indian Penal Code (IPC), women's legal rights, emergency helplines, and actionable safety protocols. | Should Have |
| **FR-08** | **Discreet Protection (Fake Call Simulator)** | Built-in incoming call simulation interface with selectable caller identities (e.g., "Dad", "Police Officer") and timed ring triggers to assist users in discreetly exiting unsafe environments. | Should Have |
| **FR-09** | **Safety Score & Risk Analytics** | Dynamic 0–100 safety score calculator evaluating trip histories, incident vicinity, time-of-day risks, and user safety check compliance, visualized on interactive heatmaps. | Should Have |
| **FR-10** | **Admin Governance & Telemetry** | Administrative portal to inspect all platform users, monitor active SOS states, view audit logs, run analytics, and seed mock demonstration data. | Could Have |

---

### 1.2 Non-Functional Requirements (NFR)

| Category | ID | Requirement | Target Metric / Specification |
| :--- | :--- | :--- | :--- |
| **Performance** | NFR-01 | **SOS Response Latency** | SOS event creation and contact notification pipeline initiation must complete within **< 500 ms**. |
| **Performance** | NFR-02 | **GPS Checkpoint Ingestion** | Location telemetry endpoints must process incoming checkpoints in **< 200 ms**. |
| **Security** | NFR-03 | **Data Protection & Encryption** | All transport encrypted via **TLS 1.3 / HTTPS**. Passwords hashed with **bcrypt (cost factor 12)**. Sensitive tokens masked in audit logs. |
| **Security** | NFR-04 | **API Rate Limiting** | Strict rate limits using SlowAPI (e.g., 5 requests/min for Auth endpoints, 100 requests/min default) to mitigate brute-force and DDoS attacks. |
| **Reliability** | NFR-05 | **Graceful AI Fallback** | When external LLM APIs (Gemini/OpenAI) or network connections fail, the platform must seamlessly fall back to local rule-based mock pipelines without throwing 500 errors. |
| **Availability** | NFR-06 | **High Uptime** | Platform core services designed for **99.9% uptime** through containerized multi-process deployment (Docker, Uvicorn, Nginx). |
| **Usability** | NFR-07 | **Rapid Emergency Access** | High-visibility floating SOS button reachable within **1 click** from any viewport or screen. Mobile-first responsive layout (Tailwind CSS). |
| **Interoperability**| NFR-08 | **Automated Webhook Integration** | Standard REST/Webhook integration with **n8n** automation engine for multi-channel messaging (WhatsApp, SMS, Email, external emergency dispatches). |

---

## 2. System Architecture Diagram

SURAKSHA follows a modern **Cloud-Native, Multi-Agent Microservices Architecture** split into four decoupled layers: Client, Gateway & Security, Application & AI Agentic Core, and Persistence & External Services.

```mermaid
graph TB
    subgraph Client_Layer["🖥️ Presentation Layer (Frontend - React 18 + Vite)"]
        UI_Web["Single Page Application (SPA)\nReact 18 + Tailwind CSS + Framer Motion"]
        State["Client State & Cache\nZustand + TanStack Query"]
        Map_Comp["Interactive Mapping\nLeaflet.js + OpenStreetMap"]
        Audio_Loc["Browser APIs\nWeb Speech API + Geolocation API"]
        UI_Web --> State
        UI_Web --> Map_Comp
        UI_Web --> Audio_Loc
    end

    subgraph Gateway_Layer["🛡️ Gateway & Security Layer (Nginx & FastAPI Middleware)"]
        ReverseProxy["Nginx Reverse Proxy / Load Balancer\nPort 80 / 443"]
        CORS["CORS Middleware"]
        RateLimiter["SlowAPI Rate Limiter"]
        AuthGuard["JWT Bearer RBAC Guard\n(User / Guardian / Admin)"]
        AuditLogger["Audit Logging & Request Interceptor"]
        
        ReverseProxy --> CORS --> RateLimiter --> AuthGuard --> AuditLogger
    end

    subgraph App_Layer["⚙️ Core Application Layer (FastAPI Backend - Port 8000)"]
        subgraph REST_Routers["REST API Endpoints (/api/v1)"]
            R_Auth["auth.py\nLogin, Register, OTP"]
            R_SOS["sos.py\nSOS Dispatch & Resolve"]
            R_Journey["journeys.py\nTracking & Deviations"]
            R_Incident["incidents.py\nReports & PDF Export"]
            R_Guardian["guardians.py\nGuardian Network"]
            R_AI["ai.py\nDistress & Assistant"]
            R_Admin["admin.py\nAnalytics & Governance"]
        end

        subgraph LangGraph_Agents["🤖 LangGraph Multi-Agent Safety System"]
            Agent_Orch["Safety Orchestrator Agent"]
            Agent_SOS["Emergency Response Agent\n(Protocol Evaluator + Dispatch)"]
            Agent_Journey["Journey Monitoring Agent\n(Haversine Deviation & Stoppage)"]
            Agent_Distress["Distress Detection Agent\n(NLP Sentiment & Voice Threat)"]
            Agent_Incident["Incident Intelligence Agent\n(Timeline Builder & Severity Classifier)"]
            Agent_RAG["Knowledge Assistant Agent\n(Legal Rights & Safety Advice)"]
            
            Agent_Orch --> Agent_SOS
            Agent_Orch --> Agent_Journey
            Agent_Orch --> Agent_Distress
            Agent_Orch --> Agent_Incident
            Agent_Orch --> Agent_RAG
        end
    end

    subgraph Data_Layer["💾 Persistence & Vector Store Layer"]
        MongoDB[("🍃 MongoDB 7.0\n(Beanie ODM Collections:\nUsers, Journeys, SOS, Incidents,\nGuardians, Notifications, Analytics)")]
        ChromaDB[("🧠 ChromaDB Vector Store\n(Embeddings: IPC Legal Codes,\nHelpline Directories, Safety Protocols)")]
    end

    subgraph Integration_Layer["🌐 Integration & External Automation Layer"]
        N8N["🔄 n8n Workflow Automation\nPort 5678 (WhatsApp, Email, SMS alerts)"]
        LLM_APIs["✨ AI Models: Google Gemini 1.5 Pro / OpenAI GPT-4o"]
        LangSmith["📊 LangSmith Observability & Agent Tracing"]
        Telco["🚨 Emergency Helplines (112 / 100 / 181) & SMS Gateway"]
    end

    %% Connections
    Client_Layer -->|HTTPS / REST API Calls| ReverseProxy
    AuditLogger --> REST_Routers
    REST_Routers --> LangGraph_Agents
    REST_Routers --> MongoDB
    LangGraph_Agents --> MongoDB
    Agent_RAG --> ChromaDB
    LangGraph_Agents --> LLM_APIs
    LangGraph_Agents --> LangSmith
    Agent_SOS -->|Webhook POST /webhook/sos| N8N
    N8N --> Telco
```

---

## 3. Entity-Relationship (ER) Diagram

The data persistence layer is implemented using MongoDB with the **Beanie Asynchronous ODM** (Object-Document Mapper) backed by **Pydantic v2 schemas**.

```mermaid
erDiagram
    USER ||--o{ GUARDIAN : "registers/trusts"
    USER ||--o{ JOURNEY : "embarks_on"
    USER ||--o{ SOS_EVENT : "triggers"
    USER ||--o{ INCIDENT : "reports"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ FEEDBACK : "submits"
    USER ||--o{ ANALYTICS : "tracks_daily"

    USER {
        ObjectId _id PK
        string email UK "Indexed, unique"
        string username UK "Indexed, unique"
        string full_name
        string phone
        string password_hash "Bcrypt hash"
        string role "user | guardian | admin"
        float safety_score "0.0 - 100.0"
        boolean is_active
        boolean is_verified
        string profile_picture
        list emergency_contacts "Embedded [{name, phone, email, relation}]"
        dict location "{lat, lng, address, updated_at}"
        string otp "Verification / Reset OTP"
        datetime otp_expiry
        datetime created_at
        datetime updated_at
        datetime last_login
    }

    GUARDIAN {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string guardian_email
        string guardian_name
        string guardian_phone
        string relationship "parent | sibling | friend | spouse | other"
        string status "pending | active | declined"
        dict notification_prefs "{sos_alerts, journey_updates, daily_summary}"
        datetime created_at
        datetime updated_at
    }

    JOURNEY {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string source
        string destination
        dict source_coords "{lat, lng}"
        dict destination_coords "{lat, lng}"
        string travel_mode "walking | auto | bus | metro | cab"
        string status "active | completed | emergency"
        datetime start_time
        datetime end_time
        int expected_duration "Minutes"
        int actual_duration "Minutes"
        list checkpoints "[{lat, lng, timestamp, note}]"
        list deviations "[{lat, lng, distance_meters, timestamp}]"
        float safety_score "Journey risk score"
        dict ai_analysis "AI risk assessment & recommendations"
        datetime created_at
    }

    SOS_EVENT {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        dict location "{lat, lng, address}"
        string emergency_type "general | medical | assault | stalking | accident"
        string status "active | resolved | false_alarm"
        string message "User SOS text or voice note"
        string ai_summary "LLM-generated emergency assessment"
        list notified_contacts "[{name, phone, email, notified_at, method}]"
        int response_time "Seconds to acknowledgment"
        datetime resolved_at
        string resolved_by "user | guardian | admin"
        datetime created_at
    }

    INCIDENT {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string title
        string description
        string incident_type "harassment | stalking | assault | theft | cyber | other"
        string severity "low | medium | high | critical"
        dict location "{lat, lng, address, area}"
        string status "open | under_review | resolved | closed"
        list ai_timeline "[{timestamp, event, severity}]"
        string ai_summary "LLM synthesized incident overview"
        list recommended_actions "Action steps & legal remedies"
        list tags "Category tags"
        list attachments "[{filename, url, type, size}]"
        list exported_formats "['pdf', 'docx']"
        datetime incident_time
        datetime created_at
        datetime updated_at
    }

    NOTIFICATION {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string type "sos | journey | guardian | ai_alert | system | incident"
        string title
        string message
        boolean is_read
        dict metadata "{related_id, action_url, icon}"
        datetime created_at
    }

    FEEDBACK {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string feature "ai_chat | journey | sos | incident | dashboard"
        int rating "1 to 5 stars"
        string comment
        datetime created_at
    }

    ANALYTICS {
        ObjectId _id PK
        string user_id FK "Refers to USER"
        string date "YYYY-MM-DD"
        float safety_score
        int journeys_count
        int incidents_count
        int sos_count
        int ai_interactions
        string risk_level "low | medium | high | critical"
        int completed_journeys
        int emergency_journeys
        float avg_journey_duration
        datetime created_at
    }
```

---

## 4. Use Case Diagram

The Use Case model defines the functional boundary of SURAKSHA across 4 primary actors:
1. **Woman / Commuter (Primary User)**
2. **Guardian / Trusted Contact**
3. **Platform Administrator**
4. **LangGraph Safety AI / Automation System (Secondary System Actor)**

```mermaid
graph LR
    %% Actors
    User(("👩 User\n(Commuter)"))
    Guardian(("👥 Guardian\n(Contact)"))
    Admin(("👨‍💼 Admin"))
    AISystem(("🤖 LangGraph AI\n& n8n Engine"))

    subgraph SURAKSHA_Platform["🛡️ SURAKSHA Platform Boundary"]
        %% Auth & Profile
        UC_Auth["UC-1: Register & Login (JWT/OTP)"]
        UC_Profile["UC-2: Manage Emergency Contacts & Profile"]
        
        %% SOS & Emergency
        UC_SOS["UC-3: Trigger Emergency SOS"]
        UC_Loc["UC-4: Capture Real-time Geolocation"]
        UC_AlertGuardians["UC-5: Dispatch Multi-Channel Alerts"]
        UC_ResolveSOS["UC-6: Resolve / De-escalate SOS"]
        
        %% Journey
        UC_StartJourney["UC-7: Start Journey Tracking"]
        UC_MonitorRoute["UC-8: Detect Route Deviations & Stoppages"]
        UC_FakeCall["UC-9: Trigger Fake Emergency Call"]
        
        %% AI & Reporting
        UC_Distress["UC-10: Analyze Text/Speech for Distress"]
        UC_ReportIncident["UC-11: Report Safety / Cyber Harassment Incident"]
        UC_GenTimeline["UC-12: Auto-Generate Incident Timeline & Dossier"]
        UC_ExportDossier["UC-13: Export Incident Report (PDF/DOCX)"]
        UC_ChatRAG["UC-14: Query Legal & Safety Knowledge Assistant"]
        
        %% Analytics & Admin
        UC_ViewAnalytics["UC-15: View Safety Score & Risk Heatmap"]
        UC_AdminUsers["UC-16: Audit Users & Review Incident Logs"]
        UC_SeedData["UC-17: Seed Demo / Simulation Data"]
    end

    %% User Interactions
    User --> UC_Auth
    User --> UC_Profile
    User --> UC_SOS
    User --> UC_StartJourney
    User --> UC_FakeCall
    User --> UC_Distress
    User --> UC_ReportIncident
    User --> UC_ChatRAG
    User --> UC_ViewAnalytics

    %% Guardian Interactions
    Guardian --> UC_Auth
    Guardian --> UC_ResolveSOS
    Guardian -.->|Receives SOS Alert| UC_AlertGuardians

    %% Admin Interactions
    Admin --> UC_Auth
    Admin --> UC_AdminUsers
    Admin --> UC_SeedData

    %% Includes & Extends
    UC_SOS -.->|<<include>>| UC_Loc
    UC_SOS -.->|<<include>>| UC_AlertGuardians
    UC_StartJourney -.->|<<include>>| UC_Loc
    UC_StartJourney -.->|<<extend>>| UC_MonitorRoute
    UC_Distress -.->|<<extend: threat detected>>| UC_SOS
    UC_ReportIncident -.->|<<include>>| UC_GenTimeline
    UC_GenTimeline -.->|<<extend>>| UC_ExportDossier

    %% AI System Actor Connections
    UC_MonitorRoute --- AISystem
    UC_AlertGuardians --- AISystem
    UC_Distress --- AISystem
    UC_GenTimeline --- AISystem
    UC_ChatRAG --- AISystem
```

---

## 5. Sequence Diagrams

### 5.1 SOS Emergency Trigger & Multi-Agent Orchestration
This diagram demonstrates the end-to-end event-driven flow triggered when a user taps the SOS emergency button.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👩 User
    participant Frontend as 🖥️ React Frontend
    participant API as 🛡️ FastAPI Gateway
    participant Agent as 🤖 LangGraph Emergency Agent
    participant DB as 🍃 MongoDB (Beanie)
    participant N8N as 🔄 n8n Webhook
    participant Guardian as 👥 Guardians & Helplines

    User ->> Frontend: Clicks "SOS Emergency" Button
    activate Frontend
    Frontend ->> Frontend: Query Browser Geolocation API (lat, lng, accuracy)
    Frontend ->> API: POST /api/v1/sos {lat, lng, address, emergency_type: "assault"}
    activate API

    API ->> DB: Insert SOSEvent(status="active", user_id, coords)
    DB -->> API: SOSEvent Created (sos_id: "sos_1092")

    API ->> Agent: invoke_emergency_pipeline(sos_id, location, emergency_type)
    activate Agent

    Agent ->> Agent: Node 1: capture_situation() [Protocol lookup: Assault -> Priority: Critical]
    Agent ->> Agent: Node 2: generate_summary() [AI synthesis + Google Maps URL]
    Agent ->> Agent: Node 3: notify_contacts() [Format SMS & Email payloads]
    Agent ->> Agent: Node 4: trigger_workflows() [Identify webhook actions]
    Agent ->> Agent: Node 5: log_event() [Compute ETA for help: 3-5 min police PCR]

    Agent -->> API: Return Structured Emergency Response
    deactivate Agent

    API ->> DB: Update SOSEvent (ai_summary, notified_contacts, actions_taken)
    
    par Async Automation Dispatch
        API ->> N8N: POST /webhook/sos {sos_id, user_name, location, summary}
        activate N8N
        N8N ->> Guardian: Send WhatsApp alert with live GPS link
        N8N ->> Guardian: Send SMS alert with emergency helpline (100 / 112)
        N8N ->> DB: Log Dispatch Audit Log
        deactivate N8N
    and In-App Push Notification
        API ->> DB: Create Notification record for user & active guardians
    end

    API -->> Frontend: 201 Created {emergency_id, status: "active", eta: "3-5 mins", summary}
    deactivate API

    Frontend ->> User: Display Emergency Active Banner, Siren Sound & Live Countdown
    deactivate Frontend
```

---

### 5.2 Journey Monitoring & Route Anomaly Detection Flow
This sequence captures background periodic GPS telemetry checks during an active travel journey.

```mermaid
sequenceDiagram
    autonumber
    actor Commuter as 👩 Commuter
    participant Geo as 📍 Browser Geolocation
    participant App as 🖥️ React App
    participant JourneyAPI as 🛡️ Journey Router (/api/v1/journeys)
    participant JourneyAgent as 🤖 Journey Monitoring Agent
    participant DB as 🍃 MongoDB

    loop Every 30 Seconds
        App ->> Geo: getCurrentPosition()
        Geo -->> App: {lat: 12.972, lng: 77.594, timestamp}
        App ->> JourneyAPI: POST /api/v1/journeys/{id}/checkpoint
        activate JourneyAPI

        JourneyAPI ->> DB: Fetch Journey expected route & previous checkpoints
        DB -->> JourneyAPI: Journey Record

        JourneyAPI ->> JourneyAgent: run_pipeline(checkpoint, expected_path)
        activate JourneyAgent
        
        JourneyAgent ->> JourneyAgent: analyze_route()
        JourneyAgent ->> JourneyAgent: detect_deviations() [Calculate Haversine Distance]
        
        alt Deviation > 500 meters OR Stoppage > 15 mins
            JourneyAgent ->> JourneyAgent: assess_risk() -> Risk Level = "HIGH", Score = 45.0
            JourneyAgent ->> JourneyAgent: generate_alerts() -> Trigger Safety Warning
            JourneyAgent -->> JourneyAPI: {risk: "HIGH", alert: "Off-route detected", deviation_m: 620}
            
            JourneyAPI ->> DB: Append deviation to Journey record & decrease safety_score
            JourneyAPI -->> App: 200 OK {status: "warning", alert: "Route Deviation Detected (>600m)"}
            App ->> Commuter: Show "Are You Safe?" Prompt with 60s Countdown
            
            opt User Does Not Respond in 60s
                App ->> JourneyAPI: POST /api/v1/sos (Auto-escalate to SOS)
            end
        else Route is Safe
            JourneyAgent -->> JourneyAPI: {risk: "LOW", safety_score: 95.0}
            JourneyAPI ->> DB: Append normal checkpoint
            JourneyAPI -->> App: 200 OK {status: "safe", safety_score: 95.0}
        end
        deactivate JourneyAgent
        deactivate JourneyAPI
    end
```

---

## 6. Activity Diagram

The Activity Diagram illustrates the **Complete Journey Monitoring, Distress Evaluation & SOS Escalation Lifecycle**.

```mermaid
stateDiagram-v2
    [*] --> StartJourney: User initiates Journey (Source, Destination, Mode)
    StartJourney --> InitializeTracking: Capture Initial Coordinates & Start Timer

    state InitializeTracking {
        [*] --> PeriodicGPSCheck
        PeriodicGPSCheck --> EvaluateHaversine: Ingest GPS coordinates (lat, lng)
        EvaluateHaversine --> CheckDeviation: Calculate distance from expected path
    }

    CheckDeviation --> NormalTransit: Deviation <= 500m AND Moving
    NormalTransit --> PeriodicGPSCheck: Wait 30 seconds

    CheckDeviation --> AnomalyDetected: Deviation > 500m OR Stationary > 15min
    
    state AnomalyDetected {
        [*] --> RecalculateSafetyScore: Reduce score based on severity
        RecalculateSafetyScore --> PromptUserCheck: Send Push Alert "Are you safe?"
        PromptUserCheck --> UserPromptDecision
    }

    UserPromptDecision --> PromptAcknowledged: User clicks "I am safe" (enters PIN)
    PromptAcknowledged --> ResumeNormal: Update route to new trajectory
    ResumeNormal --> PeriodicGPSCheck

    UserPromptDecision --> PromptIgnored: No response within 60s OR User taps "Need Help"
    
    state DistressAndSOS {
        [*] --> EvaluateDistressNLP: Run Distress Agent on Voice/Text
        EvaluateDistressNLP --> DetermineProtocol: Map protocol (General, Assault, Medical)
        DetermineProtocol --> DispatchSOS: Trigger SOS Emergency State
        DispatchSOS --> NotifyGuardians: Dispatch SMS / WhatsApp / Email
        NotifyGuardians --> AlertHelplines: Trigger n8n Automation Workflows
        AlertHelplines --> ProvideAssistance: Show Emergency Advice & Nearest Police/Hospitals
    }

    PromptIgnored --> DistressAndSOS

    NormalTransit --> DestinationReached: User arrives within 100m of Destination
    DestinationReached --> EndJourney: Mark Status = "completed"
    EndJourney --> UpdateDailyAnalytics: Aggregate trip duration & safety score
    UpdateDailyAnalytics --> [*]

    DistressAndSOS --> ResolveEmergency: User / Guardian marks "Resolved"
    ResolveEmergency --> [*]
```

---

## 7. Deployment Diagram

This deployment diagram details the physical and containerized node infrastructure as configured in `docker-compose.yml` and cloud production setups.

```mermaid
graph TB
    subgraph Client_Device["📱 Client Node (Smartphone / Laptop Browser)"]
        Browser["User Web Browser\n(Google Chrome / Safari / Firefox)\n- PWA / Responsive Web App\n- Geolocation Sensor\n- Web Audio & Speech API"]
    end

    subgraph Host_Server["🖥️ SURAKSHA Docker Host / Cloud VM (Ubuntu Linux)"]
        subgraph Docker_Network["Docker Bridge Network: suraksha_net"]
            
            subgraph Container_Frontend["Container: suraksha_frontend"]
                Nginx["Nginx Alpine Web Server\nPort: 80 (HTTP) / 443 (TLS)\nServes Built React Static Assets (HTML/JS/CSS)"]
            end

            subgraph Container_Backend["Container: suraksha_backend"]
                Uvicorn["Uvicorn ASGI Server\nPort: 8000\nFastAPI Application Runtime\n- LangGraph Agent Engine\n- Beanie Async ODM\n- Pydantic v2 Models"]
            end

            subgraph Container_MongoDB["Container: suraksha_mongodb"]
                MongoService["MongoDB 7.0 Engine\nPort: 27017\nDatabase: suraksha_db"]
                MongoVolume[("Volume:\nmongo_data\n(/data/db)")]
                MongoService --- MongoVolume
            end

            subgraph Container_ChromaDB["Container: suraksha_chromadb"]
                ChromaService["ChromaDB Vector Store\nPort: 8001 -> 8000\nPersistent Vector Indices"]
                ChromaVolume[("Volume:\nchroma_data\n(/chroma/chroma)")]
                ChromaService --- ChromaVolume
            end

            subgraph Container_N8N["Container: suraksha_n8n"]
                N8NService["n8n Automation Engine\nPort: 5678\nWorkflow Orchestration"]
                N8NVolume[("Volume:\nn8n_data\n(/home/node/.n8n)")]
                N8NService --- N8NVolume
            end

        end
    end

    subgraph External_Cloud["☁️ External Cloud Services & APIs"]
        GeminiAPI["Google Gemini 1.5 Pro API\n(Generative AI & Knowledge Agent)"]
        OpenAIAPI["OpenAI GPT-4o API (Optional Fallback)"]
        LangSmithCloud["LangSmith Tracing Platform\n(Agent Observability & Traces)"]
        NotificationGateways["Twilio / WhatsApp Business API / SendGrid"]
        EmergencyDispatch["Emergency Services & Helplines (112 / 100 / 181)"]
    end

    %% Network links
    Browser -->|HTTP / HTTPS (Port 80/443)| Nginx
    Nginx -->|Reverse Proxy /api/v1 -> Port 8000| Uvicorn
    Uvicorn -->|TCP Wire Protocol (Port 27017)| MongoService
    Uvicorn -->|HTTP REST Client (Port 8001)| ChromaService
    Uvicorn -->|Webhook HTTP POST (Port 5678)| N8NService
    
    Uvicorn -->|HTTPS API Requests| GeminiAPI
    Uvicorn -->|HTTPS API Requests| OpenAIAPI
    Uvicorn -->|Telemetry HTTPS| LangSmithCloud
    N8NService -->|HTTPS Webhooks / SMTP| NotificationGateways
    NotificationGateways --> EmergencyDispatch
```

---

## 8. Slide-by-Slide Presentation Guide (PPT Ready)

Use these curated slide outlines for your project evaluation or design presentation.

### 📽️ Slide 1: Title & Problem Statement
- **Title**: SURAKSHA — AI-Powered Women Safety Companion Platform
- **Problem**: Women face safety vulnerabilities during daily commutes, cyber harassment, and lack immediate, automated emergency response mechanisms.
- **Solution**: An autonomous, proactive multi-agent platform combining real-time journey anomaly tracking, NLP distress detection, automated emergency escalation, and legal intelligence.

### 📽️ Slide 2: Key Functional & Non-Functional Highlights
- **Functional**: 1-Tap SOS, Route Deviation Detection (>500m Haversine), Distress NLP Analyzer, Guardian Network, RAG Legal Chatbot, Fake Emergency Call.
- **Non-Functional**: Sub-500ms SOS latency, end-to-end TLS & bcrypt encryption, 99.9% uptime, graceful offline/mock fallback when LLMs disconnect.

### 📽️ Slide 3: High-Level System Architecture
- *Show the System Architecture Diagram (Section 2)*
- **Talking Points**: 
  - 4-Tier Architecture: Presentation (React), Gateway/Security (Nginx + FastAPI Middleware), Core Application (LangGraph Multi-Agents), and Persistence (MongoDB + ChromaDB).
  - Multi-agent orchestration isolates responsibilities: Distress Agent, Journey Agent, Emergency Agent, and RAG Knowledge Agent.

### 📽️ Slide 4: Data Architecture & ER Diagram
- *Show the ER Diagram (Section 3)*
- **Talking Points**:
  - 8 Beanie ODM documents mapped cleanly in MongoDB.
  - Efficient embedded sub-documents for coordinates and checkpoints; indexed unique email and usernames.
  - Explicit foreign-key relations linking Users to Journeys, SOS Events, Guardians, Incidents, and Daily Analytics snapshots.

### 📽️ Slide 5: Actor Interaction & Use Cases
- *Show the Use Case Diagram (Section 4)*
- **Talking Points**:
  - Highlights user personas (Commuter, Guardian, Administrator, and AI System).
  - Emphasize `<<include>>` relationships: triggering an SOS automatically includes GPS capture and guardian alert dispatch.

### 📽️ Slide 6: Critical Sequence: SOS Emergency Pipeline
- *Show the SOS Sequence Diagram (Section 5.1)*
- **Talking Points**:
  - From button tap to multi-channel alerting takes under 500 ms.
  - LangGraph executes a 5-step pipeline: Capture $\rightarrow$ Summarize $\rightarrow$ Format $\rightarrow$ Trigger $\rightarrow$ Log.
  - Asynchronously integrates with n8n to send WhatsApp and SMS messages simultaneously.

### 📽️ Slide 7: Algorithmic Logic: Journey Monitoring & Activity Flow
- *Show the Activity Diagram (Section 6)*
- **Talking Points**:
  - Uses the Haversine spherical trigonometric formula to calculate true GPS distance deviations.
  - Automatic escalation: if the user ignores safety prompts during a critical deviation, the system autonomously triggers an SOS alert.

### 📽️ Slide 8: Deployment & Container Topology
- *Show the Deployment Diagram (Section 7)*
- **Talking Points**:
  - Complete multi-container Docker Compose configuration (`frontend`, `backend`, `mongodb`, `chromadb`, `n8n`).
  - Isolated bridge network (`suraksha_net`) with persistent named volumes preventing data loss.
  - Cloud-ready for deployment on AWS EC2, GCP Compute Engine, or Azure Container Apps.

---
*Documentation compiled and verified for the SURAKSHA AI Women Safety Platform.*
