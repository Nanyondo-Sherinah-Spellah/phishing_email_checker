
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EmailAnalysis(Base):
    """Database model for storing email analysis results."""

    __tablename__ = "email_analyses"

    # Unique identifier for each analysis.
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Original email information.
    subject: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    sender_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    sender_email: Mapped[str] = mapped_column(
        String(254),
        nullable=False,
    )

    body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Results produced by the detection engine.
    risk_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    classification: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    indicators: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    recommendation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    urls_found: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    # Time when the analysis was saved.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<EmailAnalysis id={self.id} "
            f"classification={self.classification!r}>"
        )
