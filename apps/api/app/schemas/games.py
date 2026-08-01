from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.gamification import RewardOut


class GameQuestionOut(BaseModel):
    card_id: UUID
    prompt: str
    answer: str
    distractors: List[str]
    audio_text: Optional[str] = None


class GameSessionOut(BaseModel):
    session_id: UUID
    game_type: str
    difficulty: str = "balanced"
    recent_accuracy: float = 0.0
    questions: List[GameQuestionOut]


class GameAnswerRequest(BaseModel):
    session_id: Optional[UUID] = None
    card_id: UUID
    game_type: str = Field(max_length=30)
    # The learner's actual submission — graded server-side, never trusted as-is.
    answer: str = Field(default="", max_length=500)
    duration_ms: Optional[int] = Field(default=None, ge=0, le=10 * 60 * 1000)


class GameRunProgressOut(BaseModel):
    answered_count: int
    correct_count: int
    total_questions: int
    best_combo: int
    completed: bool
    xp_earned: int
    completion_bonus: int


class GameAnswerResult(BaseModel):
    rating: str
    reward: RewardOut
    run: Optional[GameRunProgressOut] = None
    quest_completions: List[str] = Field(default_factory=list)
