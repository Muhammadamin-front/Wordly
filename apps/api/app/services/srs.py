"""Spaced-repetition scheduling.

The `Scheduler` protocol is the seam that let FSRS replace SM-2 without
touching card storage: schedulers are pure functions over (state, rating, now).

FSRS (below) is now the default — the same memory model Anki itself uses,
via the open-source `fsrs` package (MIT, github.com/open-spaced-repetition/
py-fsrs). Sm2Scheduler stays for reference/rollback; nothing currently
constructs it directly outside get_scheduler().
"""
from dataclasses import dataclass, replace
from datetime import datetime, timedelta, timezone
from typing import Optional, Protocol

import fsrs

RATINGS = ("again", "hard", "good", "easy")

MIN_EASE = 1.3
MAX_EASE = 3.0
DEFAULT_EASE = 2.5

# Learning steps for cards not yet graduated (minutes).
LEARNING_STEPS_MINUTES = (1, 10)
GRADUATING_INTERVAL_DAYS = 1
EASY_GRADUATING_INTERVAL_DAYS = 4


@dataclass(frozen=True)
class SrsState:
    """Everything the scheduler needs; mirrors columns on Card."""

    state: str = "new"  # new | learning | review | relearning
    step: int = 0  # index into LEARNING_STEPS_MINUTES while (re)learning
    ease_factor: float = DEFAULT_EASE
    interval_days: float = 0.0
    repetitions: int = 0  # successful reviews in a row since last lapse
    lapses: int = 0
    due_at: datetime = datetime.min
    # FSRS memory model (unused by Sm2Scheduler).
    stability: float = 0.0
    difficulty: float = 0.0
    last_review: Optional[datetime] = None


class Scheduler(Protocol):
    def schedule(self, state: SrsState, rating: str, now: datetime) -> SrsState: ...


def clamp_ease(ease: float) -> float:
    return max(MIN_EASE, min(MAX_EASE, ease))


class Sm2Scheduler:
    def schedule(self, state: SrsState, rating: str, now: datetime) -> SrsState:
        if rating not in RATINGS:
            raise ValueError("rating must be one of {}".format(RATINGS))
        if state.state in ("new", "learning", "relearning"):
            return self._schedule_learning(state, rating, now)
        return self._schedule_review(state, rating, now)

    def _schedule_learning(self, state: SrsState, rating: str, now: datetime) -> SrsState:
        phase = "relearning" if state.state == "relearning" else "learning"
        if rating == "again":
            return replace(
                state,
                state=phase,
                step=0,
                repetitions=0,
                due_at=now + timedelta(minutes=LEARNING_STEPS_MINUTES[0]),
            )
        if rating == "easy":
            return self._graduate(state, now, EASY_GRADUATING_INTERVAL_DAYS)
        # hard repeats the current step; good advances one step
        next_step = state.step if rating == "hard" else state.step + 1
        if next_step >= len(LEARNING_STEPS_MINUTES):
            return self._graduate(state, now, GRADUATING_INTERVAL_DAYS)
        return replace(
            state,
            state=phase,
            step=next_step,
            due_at=now + timedelta(minutes=LEARNING_STEPS_MINUTES[next_step]),
        )

    def _graduate(self, state: SrsState, now: datetime, interval_days: float) -> SrsState:
        return replace(
            state,
            state="review",
            step=0,
            interval_days=interval_days,
            repetitions=state.repetitions + 1,
            due_at=now + timedelta(days=interval_days),
        )

    def _schedule_review(self, state: SrsState, rating: str, now: datetime) -> SrsState:
        if rating == "again":
            # Lapse: back to relearning today, ease penalty, interval reset.
            return replace(
                state,
                state="relearning",
                step=0,
                ease_factor=clamp_ease(state.ease_factor - 0.20),
                interval_days=0.0,
                repetitions=0,
                lapses=state.lapses + 1,
                due_at=now + timedelta(minutes=LEARNING_STEPS_MINUTES[0]),
            )

        if rating == "hard":
            ease = clamp_ease(state.ease_factor - 0.15)
            interval = max(state.interval_days * 1.2, state.interval_days + 1)
        elif rating == "good":
            ease = state.ease_factor
            interval = state.interval_days * state.ease_factor
        else:  # easy
            ease = clamp_ease(state.ease_factor + 0.15)
            interval = state.interval_days * state.ease_factor * 1.3

        interval = max(1.0, round(interval, 1))
        return replace(
            state,
            state="review",
            step=0,
            ease_factor=ease,
            interval_days=interval,
            repetitions=state.repetitions + 1,
            due_at=now + timedelta(days=interval),
        )


_FSRS_STATE_TO_VOCORA = {
    fsrs.State.New: "new",
    fsrs.State.Learning: "learning",
    fsrs.State.Review: "review",
    fsrs.State.Relearning: "relearning",
}
_VOCORA_STATE_TO_FSRS = {v: k for k, v in _FSRS_STATE_TO_VOCORA.items()}
_VOCORA_RATING_TO_FSRS = {
    "again": fsrs.Rating.Again,
    "hard": fsrs.Rating.Hard,
    "good": fsrs.Rating.Good,
    "easy": fsrs.Rating.Easy,
}


def _aware(dt: datetime) -> datetime:
    """py-fsrs works in tz-aware UTC internally; this codebase persists naive
    UTC (see app.core.security.utcnow) — convert only at this boundary."""
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _naive(dt: datetime) -> datetime:
    return dt.replace(tzinfo=None) if dt.tzinfo is not None else dt


class FsrsScheduler:
    """Free Spaced Repetition Scheduler — the memory model Anki itself now
    ships as its default, replacing a single "ease factor" with stability
    (days until recall probability drops to ~90%) and difficulty (1-10).
    Delegates the actual math to the open-source `fsrs` package rather than
    a hand-transcribed reimplementation, so the well-published default
    weights are exactly the upstream ones. Per-user weight optimization from
    each learner's own review history (what Anki's "Optimize" button does)
    is a natural follow-up, not implemented here — this uses the population
    defaults every new Anki collection also starts from.
    """

    def __init__(self) -> None:
        self._fsrs = fsrs.FSRS()

    def schedule(self, state: SrsState, rating: str, now: datetime) -> SrsState:
        if rating not in RATINGS:
            raise ValueError("rating must be one of {}".format(RATINGS))

        card = fsrs.Card(
            due=_aware(state.due_at),
            stability=state.stability,
            difficulty=state.difficulty,
            reps=state.repetitions,
            lapses=state.lapses,
            state=_VOCORA_STATE_TO_FSRS[state.state],
            last_review=_aware(state.last_review) if state.last_review else None,
        )
        new_card, _log = self._fsrs.review_card(card, _VOCORA_RATING_TO_FSRS[rating], _aware(now))

        return replace(
            state,
            state=_FSRS_STATE_TO_VOCORA[new_card.state],
            step=0,  # not meaningful under FSRS; the library owns short-term timing
            stability=new_card.stability,
            difficulty=new_card.difficulty,
            interval_days=float(new_card.scheduled_days),
            repetitions=new_card.reps,
            lapses=new_card.lapses,
            due_at=_naive(new_card.due),
            last_review=now,
        )


def get_scheduler() -> Scheduler:
    return FsrsScheduler()
