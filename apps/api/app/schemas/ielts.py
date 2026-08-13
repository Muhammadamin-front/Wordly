from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RewardOut(BaseModel):
    xp_gained: int
    total_xp: int
    level: int
    leveled_up: bool


class WritingTask(BaseModel):
    title: str
    prompt: str
    # Task 1 prompts may include a compact chart description for the web client.
    # Keeping the data alongside the prompt lets learners see the visual before
    # they start writing, without fetching a separate image asset.
    visual: Optional[Dict[str, Any]] = None


class HistoryItemOut(BaseModel):
    skill: str
    band: float
    correct: Optional[int] = None  # Reading/Listening only
    total: Optional[int] = None
    created_at: datetime


class OverviewOut(BaseModel):
    best_bands: Dict[str, float]  # skill -> best band
    recent: List[HistoryItemOut]  # newest first
    enabled: bool


class QuestionOut(BaseModel):
    prompt: str
    options: List[str]


class BankItemOut(BaseModel):
    id: str
    title: str
    band: float  # approximate difficulty, for sorting/labelling
    question_count: int
    word_count: int
    done: bool


class GenerateRequest(BaseModel):
    band: float = Field(default=6.0, ge=4.0, le=9.0)


class GeneratedTestOut(BaseModel):
    test_id: UUID
    title: str
    body: str  # reading passage OR listening script (spoken by the browser)
    questions: List[QuestionOut]


class SubmitRequest(BaseModel):
    test_id: UUID
    answers: List[int]


class GradeOut(BaseModel):
    correct: int
    total: int
    band: float
    answers: List[int]  # correct indices, revealed after grading
    reward: RewardOut


class WritingScoreRequest(BaseModel):
    task_type: str = Field(pattern="^(task1|task2)$")
    prompt: str = Field(min_length=10, max_length=1200)
    essay: str = Field(min_length=20, max_length=6000)
    lang: str = Field(default="en", pattern="^(uz|ru|en)$")  # feedback language


class CriterionOut(BaseModel):
    band: float
    comment: str


class WritingErrorOut(BaseModel):
    quote: str  # exact fragment from the essay
    fix: str  # corrected fragment
    note: str  # one-sentence explanation in the requested language
    type: str  # grammar|vocabulary|spelling|punctuation|style


class WritingScoreOut(BaseModel):
    band_overall: float
    task: CriterionOut
    coherence: CriterionOut
    lexical: CriterionOut
    grammar: CriterionOut
    errors: List[WritingErrorOut]
    strengths: List[str]
    feedback: str
    improved: str  # full band-8 model rewrite
    reward: RewardOut
