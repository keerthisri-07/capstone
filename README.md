# 🛡️ SURAKSHA — AI Women Safety Companion Platform

<div align="center">

![SURAKSHA Banner](https://img.shields.io/badge/SURAKSHA-AI%20Safety%20Platform-6d28d9?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)
![LangGraph](https://img.shields.io/badge/LangGraph-Agents-FF6B6B?style=flat-square)

**An intelligent AI-powered safety companion that proactively monitors journeys, detects distress, automates emergency response, and empowers women with real-time safety intelligence.**

[🚀 Quick Start](#quick-start) • [📖 Features](#features) • [🏗️ Architecture](#architecture) • [📡 API Docs](#api-documentation) • [🐳 Docker Deployment](#docker-deployment)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Journey Monitoring** | AI tracks routes, detects deviations & stoppages, triggers safety checks |
| 🧠 **Distress Detection** | Real-time text/voice analysis classifies situations: Safe → Concern → Warning → Emergency |
| 🚨 **Emergency Response** | One-tap SOS with automatic location capture, guardian notification & n8n workflows |
| 👥 **Guardian Network** | Trusted contacts with customizable notification preferences & activity logs |
| 📋 **Incident Intelligence** | AI-generated timelines, severity scoring, PDF/DOCX export |
| 💬 **Safety Knowledge Assistant** | RAG-powered chatbot covering legal rights, emergency procedures, safety tips |
| 🖥️ **Cyber Harassment Reporter** | Upload screenshots/messages, AI categorizes abuse & drafts complaints |
| 📞 **Fake Emergency Call** | Simulate incoming call to safely exit uncomfortable situations |
| 📊 **Safety Score Engine** | 0-100 dynamic score based on journey behavior, incidents & patterns |
| 🗺️ **Safety Heatmap** | Interactive map of travel history, incident zones & safe areas |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SURAKSHA PLATFORM                        │
├─────────────────┬───────────────────────────────────────────┤
│   FRONTEND      │              BACKEND                       │
│   React 18      │         FastAPI + Python 3.11             │
│   Tailwind CSS  │                                            │
│   Framer Motion │  ┌──────────────────────────────────────┐ │
│   React Router  │  │     LANGGRAPH AGENT SYSTEM           │ │
│   Recharts      │  │  Journey → Distress → Emergency      │ │
│   Leaflet Maps  │  │  Incident → Guardian → Knowledge     │ │
│   React Query   │  └──────────────────────────────────────┘ │
├─────────────────┼───────────────────────────────────────────┤
│   DATABASES     │           INTEGRATIONS                    │
│   MongoDB       │   LangSmith  │  n8n  │  ChromaDB         │
│   ChromaDB      │   (Tracing)  │ (Auto)│  (RAG Store)      │
└─────────────────┴───────────────────────────────────────────┘
```

### LangGraph Multi-Agent System

```
User Request
     │
     ▼
Orchestrator Agent
     │
     ├── Journey Monitoring Agent    ─── Route deviation, stopage detection
     ├── Distress Detection Agent    ─── Text/voice classification
     ├── Safety Recommendation Agent ─── Personalized safety tips
     ├── Incident Intelligence Agent ─── Timeline + severity + actions
     ├── Emergency Response Agent    ─── SOS workflow orchestration
     ├── Guardian Notification Agent ─── Contact notification
     └── Knowledge Assistant Agent  ─── RAG over ChromaDB knowledge base
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Setup

```bash
git clone <repo-url>
cd capstone
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values (app works in mock mode without API keys)

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you followed setup)
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@suraksha.ai | demo123 |
| User | user@suraksha.ai | demo123 |
| Guardian | guardian@suraksha.ai | demo123 |

---

## 🐳 Docker Deployment

### Start all services

```bash
# Copy env file
cp backend/.env.example backend/.env

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### Services
| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost |
| Backend | 8000 | http://localhost:8000 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| ChromaDB | 8001 | http://localhost:8001 |
| n8n | 5678 | http://localhost:5678 |

---

## 📡 API Documentation

FastAPI auto-generates interactive docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
```
POST /api/v1/auth/register     Register new user
POST /api/v1/auth/login        Login with email/password
POST /api/v1/auth/refresh      Refresh access token
POST /api/v1/auth/otp/verify   Verify OTP (demo OTP: 123456)
```

#### Core Features
```
POST /api/v1/sos               Trigger emergency SOS
GET  /api/v1/journeys          List user journeys
POST /api/v1/journeys          Start new journey
POST /api/v1/incidents         Create incident report
GET  /api/v1/guardians         Get guardian network
GET  /api/v1/analytics/dashboard Dashboard data
```

#### AI Endpoints
```
POST /api/v1/ai/distress-detect     Analyze text for distress
POST /api/v1/ai/journey-analyze     Analyze journey safety
POST /api/v1/ai/safety-recommendations Get personalized tips
POST /api/v1/ai/incident-analyze    Generate incident intelligence
POST /api/v1/ai/chat               Chat with knowledge assistant
```

#### Admin
```
GET  /api/v1/admin/users       List all users
GET  /api/v1/admin/analytics   Platform analytics
POST /api/v1/admin/seed-data   Seed demo data
```

---

## 🤖 AI Agent Configuration

The platform works in **Mock Mode** by default (no API keys needed). To enable real AI:

### Gemini (Recommended)
```env
GEMINI_API_KEY=your-key-here
AI_PROVIDER=gemini
```

### OpenAI
```env
OPENAI_API_KEY=your-key-here
AI_PROVIDER=openai
```

### LangSmith (Monitoring)
```env
LANGSMITH_API_KEY=your-key-here
LANGSMITH_PROJECT=suraksha-platform
LANGCHAIN_TRACING_V2=true
```

---

## 🔄 n8n Automations

Import the following workflow JSONs from `/n8n-workflows/` into your n8n instance:

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `sos_workflow.json` | SOS Button Press | Email + WhatsApp + SMS + Audit Log |
| `guardian_alert.json` | Journey Emergency | Notify all guardians |
| `incident_report.json` | New Incident | Generate + email report |
| `daily_summary.json` | Daily Cron (9AM) | Safety summary email |
| `weekly_analytics.json` | Weekly Cron (Mon) | Analytics report |

**Configure n8n Webhook URL:**
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_ENABLED=true
```

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (access + refresh tokens) |
| Authorization | Role-Based Access Control (USER/GUARDIAN/ADMIN) |
| Password Security | bcrypt hashing |
| Rate Limiting | slowapi (100/min default, 5/min auth) |
| Input Validation | Pydantic v2 schemas |
| CORS | Configurable allowed origins |
| Audit Logging | All requests logged with user context |
| Data Masking | Passwords/tokens masked in logs |

---

## 📁 Project Structure

```
capstone/
├── frontend/                    # React + Tailwind frontend
│   ├── src/
│   │   ├── api/                 # Axios API client & endpoints
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Navbar, Sidebar, AppLayout
│   │   │   └── ui/              # SOSButton, FakeCallModal, Charts...
│   │   ├── hooks/               # useAuth, useGeolocation, useSpeech...
│   │   ├── pages/               # All 13 route pages
│   │   ├── store/               # Zustand state management
│   │   └── utils/               # Constants, helpers, mock data
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── agents/              # LangGraph AI agents (7 agents)
│   │   ├── api/                 # REST API routes
│   │   ├── core/                # Config, security, RBAC
│   │   ├── integrations/        # ChromaDB, LangSmith, n8n
│   │   ├── middleware/          # Audit logging, rate limiting
│   │   ├── models/              # MongoDB Beanie documents
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # Business logic (safety score, reports)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🧪 Evaluation Metrics (LangSmith)

| Metric | Target | Description |
|--------|--------|-------------|
| Distress Classification Accuracy | >95% | Correct emergency detection |
| False Alarm Rate | <2% | Avoiding unnecessary alerts |
| AI Response Time | <3s | End-to-end agent latency |
| Emergency Detection Accuracy | >98% | Life-critical threshold |
| User Satisfaction Score | >4.5/5 | Feedback-based rating |
| Agent Success Rate | >99% | Successful completions |

---

## 🆘 Emergency Helplines (India)

| Service | Number |
|---------|--------|
| 🚨 Emergency | 112 |
| 👮 Police | 100 |
| 🚒 Fire | 101 |
| 🚑 Ambulance | 108 |
| 👩 Women Helpline | 181 |
| 👩‍⚖️ Women in Distress | 1091 |
| 📞 Cyber Crime | 1930 |
| 🏠 Domestic Violence | 181 |

---

## 📄 License

This project is built as a capstone project demonstrating production-grade AI application development.

---

<div align="center">
Built with ❤️ for women's safety | SURAKSHA Platform 2024
</div>
