
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.email import EmailAnalysis
from app.schemas.email import EmailAnalysisRequest
from app.services.detector import analyse_email


router = APIRouter(prefix="/api", tags=["Email Analysis"])


@router.post("/analyse")
def analyse_submitted_email(
    request: EmailAnalysisRequest,
    db: Session = Depends(get_db),
):
    """Analyse a submitted email and save its results."""

    # Run the phishing detection engine.
    result = analyse_email(
        subject=request.subject,
        sender_name=request.sender_name,
        sender_email=request.sender_email,
        body=request.body,
    )

    # Create a database record.
    analysis_record = EmailAnalysis(
        subject=request.subject,
        sender_name=request.sender_name,
        sender_email=request.sender_email,
        body=request.body,
        risk_score=result["risk_score"],
        classification=result["classification"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        urls_found=result["urls_found"],
    )

    # Save the record to SQLite.
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Return the analysis result and its database ID.
    return {
        **result,
        "id": analysis_record.id,
        "created_at": analysis_record.created_at,
    }
