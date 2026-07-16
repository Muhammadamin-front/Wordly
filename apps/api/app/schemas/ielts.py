from typing import Dict, List, Optional
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


class OverviewOut(BaseModel):
    best_bands: Dict[str, float]  # skill -> best band
    enabled: bool


class QuestionOut(BaseModel):
    prompt: str
    options: List[str]


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


class WritingScoreOut(BaseModel):
    band_overall: float
    task: float
    coherence: float
    lexical: float
    grammar: float
    feedback: str
    improved: str
    reward: RewardOut
