"""Spaced-repetition scheduling.

The `Scheduler` protocol is the seam that lets FSRS replace SM-2 later without
touching card storage: schedulers are pure functions over (state, rating, now).

SM-2 here is the classic algorithm with two pragmatic adjustments used by every
modern implementation (Anki included):
- a short learning phase (same-day relearn) instead of pure day-granularity,
- a "hard" rating between "again" and "good".
"""
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Protocol

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


def get_scheduler() -> Scheduler:
    return Sm2Scheduler()
