
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.email import router as email_router
from app.api.history import router as history_router
from app.core.database import Base, engine
from app.models.email import EmailAnalysis


# Create database tables if they do not already exist.
Base.metadata.create_all(bind=engine)


# Initialise the FastAPI application.
app = FastAPI(
    title="Phishing Email Checker API",
    description="API for analysing emails and detecting phishing indicators.",
    version="1.0.0",
)


# Configure frontend access.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://phishing-email-checker-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes.
app.include_router(email_router)
app.include_router(history_router)


@app.get("/")
def root():
    return {
        "message": "Phishing Email Checker API is running",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Phishing Email Checker",
    }
