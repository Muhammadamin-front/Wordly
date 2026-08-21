"""Shared review recording — used by both the flashcard review endpoint and
the games endpoint so every path applies SRS, the append-only log, and
gamification rewards identically."""
from typing import Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.flashcards import Card, ReviewLog
from app.models.user import User
from app.services.gamification import RewardSummary, apply_review_rewards, get_or_create_stats
from app.services.srs import SrsState, get_scheduler


def card_state(card: Card) -> SrsState:
    return SrsState(
        state=card.srs_state,
        step=card.srs_step,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
        repetitions=card.repetitions,
        lapses=card.lapses,
        due_at=card.due_at,
        stability=card.stability,
        difficulty=card.difficulty,
        last_review=card.last_reviewed_at,
    )


def apply_state(card: Card, state: SrsState) -> None:
    card.srs_state = state.state
    card.srs_step = state.step
    card.ease_factor = state.ease_factor
    card.interval_days = state.interval_days
    card.repetitions = state.repetitions
    card.lapses = state.lapses
    card.due_at = state.due_at
    card.stability = state.stability
    card.difficulty = state.difficulty
    card.last_reviewed_at = state.last_review


async def record_review(
    db: AsyncSession,
    user: User,
    card: Card,
    rating: str,
    duration_ms: Optional[int] = None,
) -> Tuple[SrsState, RewardSummary]:
    """Schedule the card, append an immutable log row, award rewards. Mutates
    within the caller's transaction; the caller commits."""
    before = card_state(card)
    after = get_scheduler().schedule(before, rating, utcnow())
    apply_state(card, after)

    db.add(
        ReviewLog(
            user_id=user.id,
            card_id=card.id,
            rating=rating,
            state_before=before.state,
            interval_before=before.interval_days,
            interval_after=after.interval_days,
            ease_before=before.ease_factor,
            ease_after=after.ease_factor,
            stability_before=before.stability,
            stability_after=after.stability,
            difficulty_before=before.difficulty,
            difficulty_after=after.difficulty,
            duration_ms=duration_ms,
        )
    )

    stats = await get_or_create_stats(db, user)
    reward = await apply_review_rewards(db, user, stats, rating)
    return after, reward
