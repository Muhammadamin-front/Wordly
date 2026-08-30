from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

UNIT_SLUG_PATTERN = r"^[a-z][a-z-]*$"


class WritingMasterProgressEntryIn(BaseModel):
    unit_slug: str = Field(min_length=1, max_length=40, pattern=UNIT_SLUG_PATTERN)
    attempts: int = Field(ge=1, le=100_000)
    best_score: int = Field(ge=0, le=100)
    last_score: int = Field(ge=0, le=100)
    updated_at: datetime


class WritingMasterProgressSyncRequest(BaseModel):
    entries: list[WritingMasterProgressEntryIn] = Field(default_factory=list, max_length=50)


class WritingMasterAttemptRequest(BaseModel):
    attempt_id: UUID
    unit_slug: str = Field(min_length=1, max_length=40, pattern=UNIT_SLUG_PATTERN)
    score: int = Field(ge=0, le=100)


class WritingMasterProgressEntryOut(BaseModel):
    unit_slug: str
    attempts: int
    best_score: int
    last_score: int
    updated_at: datetime


class WritingMasterProgressOut(BaseModel):
    entries: list[WritingMasterProgressEntryOut]


# --- Paraphrase / overview drills --------------------------------------------

DrillQuality = Literal["needs_work", "good", "excellent"]


class ParaphraseCheckRequest(BaseModel):
    unit_slug: str = Field(min_length=1, max_length=40, pattern=UNIT_SLUG_PATTERN)
    original_title: str = Field(min_length=10, max_length=300)
    paraphrase: str = Field(min_length=5, max_length=400)
    lang: str = Field(default="en", pattern="^(uz|ru|en)$")


class OverviewCheckRequest(BaseModel):
    unit_slug: str = Field(min_length=1, max_length=40, pattern=UNIT_SLUG_PATTERN)
    # The visual dict from a WRITING_TASKS task1 entry — same loose shape
    # WritingTask.visual already accepts (schemas/ielts.py), so a client-sent
    # visual is trusted the same way the existing endpoint trusts it: the
    # model grades against structure it can read, not a server-side lookup,
    # since visuals aren't individually addressable by id today.
    visual: dict
    overview: str = Field(min_length=10, max_length=600)
    lang: str = Field(default="en", pattern="^(uz|ru|en)$")


class DrillFeedbackOut(BaseModel):
    quality: DrillQuality
    feedback: str
    model_example: str
    # Deterministic from `quality` (needs_work=40, good=75, excellent=100),
    # not model-chosen — the client posts this straight to
    # /me/writing-master-progress/attempt without inventing its own mapping.
    score: int
    # Echoes the XP this call already awarded server-side (apply_skill_xp
    # runs unconditionally, win or "needs_work") so the UI can show a real
    # "+10 XP" toast instead of a client-guessed constant.
    xp_gained: int
    leveled_up: bool
