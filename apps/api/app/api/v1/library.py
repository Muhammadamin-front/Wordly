"""Vocabulary library overview — per-level totals and the user's progress."""
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.flashcards import Card
from app.models.user import User
from app.models.vocabulary import CEFR_LEVELS, Category, Word

router = APIRouter(
    prefix="/library",
    tags=["library"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("default"))],
)

# Category shelves surfaced in the library alongside CEFR levels.
CATEGORY_SHELVES = ("ielts", "phrasal", "idioms", "toefl", "sat", "business")


class ShelfOut(BaseModel):
    key: str  # "A1".."C2" or a category slug
    total: int
    added: int  # words the user has as cards
    learned: int  # cards reviewed at least once


class OverviewOut(BaseModel):
    shelves: List[ShelfOut]


@router.get("/overview", response_model=OverviewOut)
async def overview(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_cards = (
        select(Card.id, Card.word_id, Card.repetitions)
        .where(Card.user_id == user.id, Card.word_id.isnot(None))
        .subquery()
    )
    card = user_cards.c

    def base_query():
        return (
            select(
                func.count(Word.id),
                func.count(card.id),
                func.coalesce(func.sum(case((card.repetitions >= 1, 1), else_=0)), 0),
            )
            .select_from(Word)
            .join(user_cards, card.word_id == Word.id, isouter=True)
            .where(Word.status == "published")
        )

    shelves: List[ShelfOut] = []
    for level in CEFR_LEVELS:
        total, added, learned = (
            await db.execute(base_query().where(Word.cefr_level == level))
        ).one()
        shelves.append(ShelfOut(key=level, total=total, added=added, learned=int(learned)))

    for slug in CATEGORY_SHELVES:
        total, added, learned = (
            await db.execute(
                base_query()
                .join(Category, Word.category_id == Category.id)
                .where(Category.slug == slug)
            )
        ).one()
        shelves.append(ShelfOut(key=slug, total=total, added=added, learned=int(learned)))

    return OverviewOut(shelves=shelves)
