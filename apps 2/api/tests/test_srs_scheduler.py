from datetime import datetime, timedelta

import pytest

from app.services.srs import (
    DEFAULT_EASE,
    EASY_GRADUATING_INTERVAL_DAYS,
    GRADUATING_INTERVAL_DAYS,
    LEARNING_STEPS_MINUTES,
    MAX_EASE,
    MIN_EASE,
    Sm2Scheduler,
    SrsState,
)

NOW = datetime(2026, 7, 9, 12, 0, 0)
scheduler = Sm2Scheduler()


def minutes(n: float) -> timedelta:
    return timedelta(minutes=n)


def test_new_card_good_walks_learning_steps_then_graduates():
    state = SrsState()
    state = scheduler.schedule(state, "good", NOW)
    assert state.state == "learning"
    assert state.step == 1
    assert state.due_at == NOW + minutes(LEARNING_STEPS_MINUTES[1])

    state = scheduler.schedule(state, "good", NOW)
    assert state.state == "review"
    assert state.interval_days == GRADUATING_INTERVAL_DAYS
    assert state.repetitions == 1
    assert state.due_at == NOW + timedelta(days=GRADUATING_INTERVAL_DAYS)


def test_easy_on_new_card_graduates_immediately():
    state = scheduler.schedule(SrsState(), "easy", NOW)
    assert state.state == "review"
    assert state.interval_days == EASY_GRADUATING_INTERVAL_DAYS


def test_hard_repeats_learning_step():
    state = scheduler.schedule(SrsState(), "hard", NOW)
    assert state.state == "learning"
    assert state.step == 0
    assert state.due_at == NOW + minutes(LEARNING_STEPS_MINUTES[0])


def test_again_in_learning_resets_to_first_step():
    state = scheduler.schedule(SrsState(), "good", NOW)  # step 1
    state = scheduler.schedule(state, "again", NOW)
    assert state.step == 0
    assert state.state == "learning"


def graduated(interval: float = 1.0, ease: float = DEFAULT_EASE, reps: int = 1) -> SrsState:
    return SrsState(
        state="review", interval_days=interval, ease_factor=ease, repetitions=reps, due_at=NOW
    )


def test_good_multiplies_interval_by_ease():
    state = scheduler.schedule(graduated(interval=10.0), "good", NOW)
    assert state.interval_days == 25.0  # 10 * 2.5
    assert state.ease_factor == DEFAULT_EASE  # unchanged
    assert state.due_at == NOW + timedelta(days=25)


def test_hard_grows_slowly_and_reduces_ease():
    state = scheduler.schedule(graduated(interval=10.0), "hard", NOW)
    assert state.interval_days == 12.0  # 10 * 1.2
    assert state.ease_factor == pytest.approx(DEFAULT_EASE - 0.15)


def test_easy_grows_fast_and_increases_ease():
    state = scheduler.schedule(graduated(interval=10.0), "easy", NOW)
    assert state.interval_days == pytest.approx(32.5)  # 10 * 2.5 * 1.3
    assert state.ease_factor == pytest.approx(DEFAULT_EASE + 0.15)


def test_again_on_review_lapses_to_relearning():
    state = scheduler.schedule(graduated(interval=30.0, reps=5), "again", NOW)
    assert state.state == "relearning"
    assert state.lapses == 1
    assert state.repetitions == 0
    assert state.interval_days == 0.0
    assert state.ease_factor == pytest.approx(DEFAULT_EASE - 0.20)
    # relearn graduates back to review at 1 day
    state = scheduler.schedule(state, "good", NOW)
    state = scheduler.schedule(state, "good", NOW)
    assert state.state == "review"
    assert state.interval_days == GRADUATING_INTERVAL_DAYS


def test_ease_never_leaves_bounds():
    state = graduated(ease=MIN_EASE)
    for _ in range(10):
        state = scheduler.schedule(state, "again", NOW)
        state = scheduler.schedule(state, "good", NOW)
        state = scheduler.schedule(state, "good", NOW)
    assert state.ease_factor == MIN_EASE

    state = graduated(ease=MAX_EASE - 0.01, interval=1.0)
    for _ in range(5):
        state = scheduler.schedule(state, "easy", NOW)
    assert state.ease_factor <= MAX_EASE


def test_interval_never_below_one_day_after_graduation():
    state = scheduler.schedule(graduated(interval=1.0, ease=MIN_EASE), "hard", NOW)
    assert state.interval_days >= 1.0


def test_long_run_progression_is_monotonic_for_good():
    state = graduated(interval=1.0)
    intervals = []
    for _ in range(8):
        state = scheduler.schedule(state, "good", NOW)
        intervals.append(state.interval_days)
    assert intervals == sorted(intervals)
    assert intervals[-1] > 100  # a year-scale interval after ~8 good reviews


def test_invalid_rating_rejected():
    with pytest.raises(ValueError):
        scheduler.schedule(SrsState(), "amazing", NOW)
