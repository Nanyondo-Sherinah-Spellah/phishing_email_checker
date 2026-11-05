
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EmailAnalysisRequest(BaseModel):
    """Validates the information submitted for email analysis."""

    model_config = ConfigDict(str_strip_whitespace=True)

    subject: str = Field(
        ...,
        min_length=1,
        max_length=300,
        description="The subject line of the email.",
    )

    sender_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="The display name of the email sender.",
    )

    sender_email: str = Field(
        ...,
        min_length=3,
        max_length=254,
        description="The sender's email address.",
    )

    body: str = Field(
        ...,
        min_length=1,
        max_length=20000,
        description="The contents of the email.",
    )


class RiskIndicatorResponse(BaseModel):
    """Describes an individual detected risk indicator."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    description: str
    evidence: str
    severity: str
    points: int


class EmailAnalysisResponse(BaseModel):
    """Defines the information returned for a saved analysis."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: str
    sender_name: str
    sender_email: str
    body: str
    risk_score: int
    classification: str
    indicators: list[RiskIndicatorResponse]
    recommendation: str
    urls_found: list[str]
    created_at: datetime
