from datetime import timedelta
from typing import Dict, List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.flashcards import Card, ReviewLog
from app.models.user import User
from app.models.vocabulary import Category, Word
from app.services.leveling import MASTERED_INTERVAL_DAYS


async def card_state_counts(db: AsyncSession, user: User) -> Dict[str, int]:
    rows = await db.execute(
        select(Card.srs_state, func.count())
        .where(Card.user_id == user.id)
        .group_by(Card.srs_state)
    )
    counts = {state: int(n) for state, n in rows}
    mastered = int(
        await db.scalar(
            select(func.count(Card.id)).where(
                Card.user_id == user.id, Card.interval_days >= MASTERED_INTERVAL_DAYS
            )
        )
        or 0
    )
    total = int(await db.scalar(select(func.count(Card.id)).where(Card.user_id == user.id)) or 0)
    return {
        "total": total,
        "new": counts.get("new", 0),
        "learning": counts.get("learning", 0) + counts.get("relearning", 0),
        "review": counts.get("review", 0),
        "mastered": mastered,
    }


def _accuracy(total: int, again: int) -> float:
    return round((total - again) / total * 100, 1) if total else 0.0


async def review_accuracy(db: AsyncSession, user: User) -> Dict[str, float]:
    total = int(
        await db.scalar(select(func.count(ReviewLog.id)).where(ReviewLog.user_id == user.id)) or 0
    )
    again = int(
        await db.scalar(
            select(func.count(ReviewLog.id)).where(
                ReviewLog.user_id == user.id, ReviewLog.rating == "again"
            )
        )
        or 0
    )
    # "Mature" recall: only reviews of already-graduated cards (review/relearning).
    mature_total = int(
        await db.scalar(
            select(func.count(ReviewLog.id)).where(
                ReviewLog.user_id == user.id,
                ReviewLog.state_before.in_(("review", "relearning")),
            )
        )
        or 0
    )
    mature_again = int(
        await db.scalar(
            select(func.count(ReviewLog.id)).where(
                ReviewLog.user_id == user.id,
                ReviewLog.state_before.in_(("review", "relearning")),
                ReviewLog.rating == "again",
            )
        )
        or 0
    )
    return {
        "accuracy_all": _accuracy(total, again),
        "accuracy_mature": _accuracy(mature_total, mature_again),
        "total_reviews": total,
    }


async def rating_breakdown(db: AsyncSession, user: User) -> Dict[str, int]:
    rows = await db.execute(
        select(ReviewLog.rating, func.count())
        .where(ReviewLog.user_id == user.id)
        .group_by(ReviewLog.rating)
    )
    counts = {rating: int(n) for rating, n in rows}
    return {r: counts.get(r, 0) for r in ("again", "hard", "good", "easy")}


async def reviews_by_day(db: AsyncSession, user: User, days: int = 30) -> List[Dict]:
    since = utcnow() - timedelta(days=days)
    day = func.date(ReviewLog.reviewed_at)
    rows = await db.execute(
        select(day.label("day"), func.count().label("count"))
        .where(ReviewLog.user_id == user.id, ReviewLog.reviewed_at >= since)
        .group_by(day)
        .order_by(day)
    )
    return [{"day": str(d), "count": int(c)} for d, c in rows]


async def time_spent_ms(db: AsyncSession, user: User) -> int:
    return int(
        await db.scalar(
            select(func.coalesce(func.sum(ReviewLog.duration_ms), 0)).where(
                ReviewLog.user_id == user.id
            )
        )
        or 0
    )


async def forgotten_words(db: AsyncSession, user: User, limit: int = 8) -> List[Dict]:
    rows = await db.execute(
        select(Word.headword, Word.slug, Card.lapses)
        .join(Word, Card.word_id == Word.id)
        .where(Card.user_id == user.id, Card.lapses > 0)
        .order_by(Card.lapses.desc(), Card.updated_at.desc())
        .limit(limit)
    )
    return [{"headword": h, "slug": s, "lapses": int(lp)} for h, s, lp in rows]


async def mastered_words(db: AsyncSession, user: User, limit: int = 8) -> List[Dict]:
    rows = await db.execute(
        select(Word.headword, Word.slug, Card.interval_days)
        .join(Word, Card.word_id == Word.id)
        .where(Card.user_id == user.id, Card.interval_days >= MASTERED_INTERVAL_DAYS)
        .order_by(Card.interval_days.desc())
        .limit(limit)
    )
    return [{"headword": h, "slug": s, "interval_days": float(iv)} for h, s, iv in rows]


async def weak_categories(db: AsyncSession, user: User, limit: int = 5) -> List[Dict]:
    """Categories where the user's cards have the most lapses relative to size —
    a simple, card-based weakness signal."""
    lapse_sum = func.sum(Card.lapses)
    card_count = func.count(Card.id)
    rows = await db.execute(
        select(
            Category.slug,
            Category.name_en,
            Category.name_uz,
            Category.name_ru,
            Category.emoji,
            card_count.label("cards"),
            func.coalesce(lapse_sum, 0).label("lapses"),
        )
        .join(Word, Card.word_id == Word.id)
        .join(Category, Word.category_id == Category.id)
        .where(Card.user_id == user.id)
        .group_by(Category.id)
        .having(card_count >= 3)
        .order_by((func.coalesce(lapse_sum, 0) * 1.0 / card_count).desc())
        .limit(limit)
    )
    result = []
    for slug, en, uz, ru, emoji, cards, lapses in rows:
        result.append(
            {
                "slug": slug,
                "name_en": en,
                "name_uz": uz,
                "name_ru": ru,
                "emoji": emoji,
                "card_count": int(cards),
                "lapses": int(lapses),
            }
        )
    return result
