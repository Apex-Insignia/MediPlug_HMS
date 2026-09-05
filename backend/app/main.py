from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, patients, encounters, claims
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI Claim Bridge - HMS API",
    description="Hospital Management System API MVP",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "HMS Backend is running"}

# Include routers here
app.include_router(auth.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(encounters.router, prefix="/api/v1")
app.include_router(claims.router, prefix="/api/v1")
