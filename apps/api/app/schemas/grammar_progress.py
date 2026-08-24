from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GrammarProgressEntryIn(BaseModel):
    lesson_slug: str = Field(min_length=1, max_length=160, pattern=r"^[a-z0-9][a-z0-9-]*$")
    attempts: int = Field(ge=1, le=100_000)
    best_score: int = Field(ge=0, le=100)
    last_score: int = Field(ge=0, le=100)
    updated_at: datetime


class GrammarProgressSyncRequest(BaseModel):
    entries: list[GrammarProgressEntryIn] = Field(default_factory=list, max_length=500)


class GrammarAttemptRequest(BaseModel):
    attempt_id: UUID
    lesson_slug: str = Field(min_length=1, max_length=160, pattern=r"^[a-z0-9][a-z0-9-]*$")
    score: int = Field(ge=0, le=100)


class GrammarProgressEntryOut(BaseModel):
    lesson_slug: str
    attempts: int
    best_score: int
    last_score: int
    updated_at: datetime


class GrammarProgressOut(BaseModel):
    entries: list[GrammarProgressEntryOut]
