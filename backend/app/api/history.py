
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.email import EmailAnalysis
from app.schemas.email import EmailAnalysisResponse

router = APIRouter(prefix="/api/history", tags=["Analysis History"])


@router.get("/", response_model=list[EmailAnalysisResponse])
def get_analysis_history(db: Session = Depends(get_db)):
    analyses = (
        db.query(EmailAnalysis)
        .order_by(EmailAnalysis.created_at.desc())
        .all()
    )
    return analyses


@router.get("/{analysis_id}", response_model=EmailAnalysisResponse)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(EmailAnalysis)
        .filter(EmailAnalysis.id == analysis_id)
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis with ID {analysis_id} was not found.",
        )

    return analysis


@router.delete("/")
def delete_all_analysis_history(db: Session = Depends(get_db)):
    deleted_count = (
        db.query(EmailAnalysis)
        .delete(synchronize_session=False)
    )

    db.commit()

    return {
        "message": "Analysis history cleared successfully.",
        "deleted_count": deleted_count,
    }
