from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class PublicStartRequest(BaseModel):
    name: str
    email: str | None = None
    age: int | None = None


class PublicAnswersRequest(BaseModel):
    attemptId: str
    answers: list[dict]


class PublicCompleteRequest(BaseModel):
    attemptId: str


class AttemptReportStatus(BaseModel):
    reportGeneratedAt: datetime | None = None
    reportSentAt: datetime | None = None


class MetricRule(BaseModel):
    question_id: str
    type: Literal["choice", "scale"]
    scores: dict[str, float] | None = None
    multiplier: float | None = None


class Metric(BaseModel):
    id: str
    name: str
    description: str = ""
    rules: list[MetricRule] = Field(default_factory=list)


class MetricsPayload(BaseModel):
    metrics: list[Metric] = Field(default_factory=list)
