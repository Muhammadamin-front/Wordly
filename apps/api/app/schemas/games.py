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
    questions: List[GameQuestionOut]


class GameAnswerRequest(BaseModel):
    card_id: UUID
    correct: bool
    duration_ms: Optional[int] = Field(default=None, ge=0, le=10 * 60 * 1000)


class GameAnswerResult(BaseModel):
    rating: str
    reward: RewardOut
