from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, journeys, sos, incidents, guardians, analytics, ai, admin

app = FastAPI(
    title="SURAKSHA API",
    description="Backend API for AI Women Safety Companion",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api/v1 to match frontend expectations
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(journeys.router, prefix="/api/v1")
app.include_router(sos.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(guardians.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "service": "SURAKSHA API"}

