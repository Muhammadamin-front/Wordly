from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.gamification import RewardOut
from app.schemas.vocabulary import WordOut

RATING_PATTERN = "^(again|hard|good|easy)$"


class DeckCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=300)


class DeckUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=300)


class DeckOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    card_count: int = 0
    due_count: int = 0


class CardCreate(BaseModel):
    # Either a corpus word...
    word_id: Optional[UUID] = None
    # ...or a custom front/back pair.
    front_text: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    back_text: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    deck_id: Optional[UUID] = None


class CardUpdate(BaseModel):
    is_favorite: Optional[bool] = None
    memory_note: Optional[str] = Field(default=None, max_length=1000)
    front_text: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    back_text: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    deck_id: Optional[UUID] = None


class CardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    deck_id: Optional[UUID] = None
    word: Optional[WordOut] = None
    front_text: Optional[str] = None
    back_text: Optional[str] = None
    is_favorite: bool
    memory_note: Optional[str] = None
    srs_state: str
    ease_factor: float
    interval_days: float
    repetitions: int
    lapses: int
    due_at: datetime


class QueueOut(BaseModel):
    cards: List[CardOut]
    due_count: int
    new_count: int
    learning_count: int


class ReviewRequest(BaseModel):
    rating: str = Field(pattern=RATING_PATTERN)
    duration_ms: Optional[int] = Field(default=None, ge=0, le=10 * 60 * 1000)


class ReviewResult(BaseModel):
    card: CardOut
    next_due_at: datetime
    reward: "RewardOut"


class AddByLevelRequest(BaseModel):
    cefr_level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    limit: int = Field(default=20, ge=1, le=100)
    category_slug: Optional[str] = None


class AddByLevelResult(BaseModel):
    added: int
    already_added: int


class DeckImportReport(BaseModel):
    created: int
    skipped: int
    errors: List[str]
