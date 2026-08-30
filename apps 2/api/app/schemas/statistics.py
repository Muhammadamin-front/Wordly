from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class CardStateCounts(BaseModel):
    total: int
    new: int
    learning: int
    review: int
    mastered: int


class WordRef(BaseModel):
    headword: str
    slug: str
    lapses: Optional[int] = None
    interval_days: Optional[float] = None


class WeakCategory(BaseModel):
    slug: str
    name_en: str
    name_uz: str
    name_ru: str
    emoji: Optional[str] = None
    card_count: int
    lapses: int


class DayCount(BaseModel):
    day: str
    count: int


class StatisticsOut(BaseModel):
    cards: CardStateCounts
    total_reviews: int
    accuracy_all: float
    accuracy_mature: float
    time_spent_ms: int
    rating_breakdown: dict
    reviews_by_day: List[DayCount]
    forgotten: List[WordRef]
    mastered: List[WordRef]
    weak_categories: List[WeakCategory]


class LearningPlanOut(BaseModel):
    due_count: int
    new_count: int
    reviewed_today: int
    mistake_count: int
    recent_accuracy: float
    recent_reviews: int
    difficulty: str
    recommended_game: str
    daily_target: int


class MasteryLevelOut(BaseModel):
    level: str
    total: int
    new: int
    learning: int
    strong: int
    mastered: int
    started: int
    progress_percent: int


class MasteryMapOut(BaseModel):
    levels: List[MasteryLevelOut]
    current_level: str
    total_words: int
    started_words: int
    mastered_words: int
    overall_percent: int


class MistakeWord(BaseModel):
    card_id: UUID
    headword: str
    slug: str
    pos: str
    cefr_level: str
    translation_uz: str
    translation_ru: str
    definition_en: str
    example_en: Optional[str] = None
    example_uz: Optional[str] = None
    example_ru: Optional[str] = None
    lapses: int
    wrong_count: int
    last_missed_at: datetime
    last_rating: str
    status: str


class MistakeNotebookOut(BaseModel):
    items: List[MistakeWord]
    total: int
