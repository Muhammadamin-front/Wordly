from typing import List, Optional

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
