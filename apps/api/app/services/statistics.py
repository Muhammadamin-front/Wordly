from datetime import timedelta
from typing import Dict, List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.flashcards import Card, ReviewLog
from app.models.user import User
from app.models.vocabulary import Category, Word
from app.services.leveling import MASTERED_INTERVAL_DAYS

RECENT_REVIEW_LIMIT = 40
DAILY_REVIEW_TARGET = 10


async def recent_learning_profile(
    db: AsyncSession, user: User, limit: int = RECENT_REVIEW_LIMIT
) -> Dict[str, object]:
    ratings = list(
        (
            await db.scalars(
                select(ReviewLog.rating)
                .where(ReviewLog.user_id == user.id)
                .order_by(ReviewLog.reviewed_at.desc())
                .limit(limit)
            )
        ).all()
    )
    accuracy = _accuracy(len(ratings), ratings.count("again"))
    if len(ratings) < 10 or accuracy < 65:
        difficulty = "guided"
        recommended_game = "memory"
    elif accuracy < 85:
        difficulty = "balanced"
        recommended_game = "fill_blank"
    else:
        difficulty = "challenge"
        recommended_game = "typing_race"
    return {
        "recent_accuracy": accuracy,
        "recent_reviews": len(ratings),
        "difficulty": difficulty,
        "recommended_game": recommended_game,
    }


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


async def learning_plan(db: AsyncSession, user: User) -> Dict[str, object]:
    now = utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    due_count = int(
        await db.scalar(
            select(func.count(Card.id)).where(
                Card.user_id == user.id,
                Card.word_id.isnot(None),
                Card.srs_state != "new",
                Card.due_at <= now,
            )
        )
        or 0
    )
    new_count = int(
        await db.scalar(
            select(func.count(Card.id)).where(
                Card.user_id == user.id,
                Card.word_id.isnot(None),
                Card.srs_state == "new",
            )
        )
        or 0
    )
    reviewed_today = int(
        await db.scalar(
            select(func.count(ReviewLog.id)).where(
                ReviewLog.user_id == user.id,
                ReviewLog.reviewed_at >= today_start,
            )
        )
        or 0
    )

    latest_review = (
        select(
            ReviewLog.card_id.label("card_id"),
            func.max(ReviewLog.reviewed_at).label("reviewed_at"),
        )
        .where(ReviewLog.user_id == user.id)
        .group_by(ReviewLog.card_id)
        .subquery()
    )
    mistake_count = int(
        await db.scalar(
            select(func.count(func.distinct(Card.id)))
            .join(latest_review, latest_review.c.card_id == Card.id)
            .join(
                ReviewLog,
                (ReviewLog.card_id == latest_review.c.card_id)
                & (ReviewLog.reviewed_at == latest_review.c.reviewed_at),
            )
            .where(
                Card.user_id == user.id,
                Card.word_id.isnot(None),
                ReviewLog.rating.in_(("again", "hard")),
            )
        )
        or 0
    )

    profile = await recent_learning_profile(db, user)
    return {
        "due_count": due_count,
        "new_count": new_count,
        "reviewed_today": reviewed_today,
        "mistake_count": mistake_count,
        "daily_target": DAILY_REVIEW_TARGET,
        **profile,
    }


async def mistake_notebook(db: AsyncSession, user: User, limit: int = 20) -> Dict[str, object]:
    total = int(
        await db.scalar(
            select(func.count(func.distinct(ReviewLog.card_id)))
            .join(Card, Card.id == ReviewLog.card_id)
            .where(
                ReviewLog.user_id == user.id,
                Card.user_id == user.id,
                Card.word_id.isnot(None),
                ReviewLog.rating == "again",
            )
        )
        or 0
    )
    missed = list(
        (
            await db.execute(
                select(
                    ReviewLog.card_id,
                    func.count(ReviewLog.id).label("wrong_count"),
                    func.max(ReviewLog.reviewed_at).label("last_missed_at"),
                )
                .join(Card, Card.id == ReviewLog.card_id)
                .where(
                    ReviewLog.user_id == user.id,
                    Card.user_id == user.id,
                    Card.word_id.isnot(None),
                    ReviewLog.rating == "again",
                )
                .group_by(ReviewLog.card_id)
                .order_by(func.max(ReviewLog.reviewed_at).desc())
                .limit(limit)
            )
        ).all()
    )
    if not missed:
        return {"items": [], "total": 0}

    card_ids = [row.card_id for row in missed]
    cards = list(
        (
            await db.scalars(
                select(Card).where(Card.user_id == user.id, Card.id.in_(card_ids))
            )
        ).unique()
    )
    cards_by_id = {card.id: card for card in cards}

    latest_ratings: Dict[object, str] = {}
    rating_rows = await db.execute(
        select(ReviewLog.card_id, ReviewLog.rating)
        .where(ReviewLog.user_id == user.id, ReviewLog.card_id.in_(card_ids))
        .order_by(ReviewLog.reviewed_at.desc())
    )
    for card_id, rating in rating_rows:
        latest_ratings.setdefault(card_id, rating)

    items = []
    for card_id, wrong_count, last_missed_at in missed:
        card = cards_by_id.get(card_id)
        if not card or not card.word or not card.word.senses:
            continue
        word = card.word
        sense = word.senses[0]
        example = sense.examples[0] if sense.examples else None
        last_rating = latest_ratings.get(card_id, "again")
        items.append(
            {
                "card_id": card.id,
                "headword": word.headword,
                "slug": word.slug,
                "pos": word.pos,
                "cefr_level": word.cefr_level,
                "translation_uz": sense.translation_uz,
                "translation_ru": sense.translation_ru,
                "definition_en": sense.definition_en,
                "example_en": example.text_en if example else None,
                "example_uz": example.text_uz if example else None,
                "example_ru": example.text_ru if example else None,
                "lapses": card.lapses,
                "wrong_count": int(wrong_count),
                "last_missed_at": last_missed_at,
                "last_rating": last_rating,
                "status": (
                    "needs_practice"
                    if last_rating in ("again", "hard")
                    else "improving"
                ),
            }
        )
    return {"items": items, "total": total}
