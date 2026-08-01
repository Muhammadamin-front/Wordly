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
    game_type: str
    difficulty: str = "balanced"
    recent_accuracy: float = 0.0
    questions: List[GameQuestionOut]


class GameAnswerRequest(BaseModel):
    card_id: UUID
    game_type: str = Field(max_length=30)
    # The learner's actual submission — graded server-side, never trusted as-is.
    answer: str = Field(default="", max_length=500)
    duration_ms: Optional[int] = Field(default=None, ge=0, le=10 * 60 * 1000)


class GameAnswerResult(BaseModel):
    rating: str
    reward: RewardOut
