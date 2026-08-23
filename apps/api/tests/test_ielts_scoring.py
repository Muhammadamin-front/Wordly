"""Shared IELTS scoring primitives (app.services.ielts_scoring) — previously
duplicated in services/ielts.py and services/coach.py."""
from app.services.ielts_scoring import (
    band_from_ratio,
    combine_writing_band,
    half_band,
    overall_band,
)


def test_half_band_rounds_a_quarter_remainder_up_not_to_even():
    # Python's round() uses banker's rounding: round(6.25 * 2) / 2 == 6.0.
    # IELTS always rounds a .25/.75 remainder UP to the next half band.
    assert half_band(6.25) == 6.5
    assert half_band(6.75) == 7.0
    # A value already on a half-band boundary is untouched either way.
    assert half_band(6.5) == 6.5
    assert half_band(7.0) == 7.0


def test_half_band_clamps_to_the_0_to_9_scale():
    assert half_band(-3) == 0.0
    assert half_band(12) == 9.0


def test_half_band_falls_back_on_unparseable_input():
    assert half_band(None) == 5.0
    assert half_band("not a number") == 5.0


def test_combine_writing_band_weights_task_2_double():
    # (5.0 + 2*7.0) / 3 == 6.333... -> rounds up to 6.5.
    assert combine_writing_band(5.0, 7.0) == 6.5
    # Equal tasks: weighting is moot.
    assert combine_writing_band(6.0, 6.0) == 6.0


def test_overall_band_averages_all_four_skills():
    # (6.0 + 6.5 + 7.0 + 6.0) / 4 == 6.375 -> rounds up to 6.5.
    assert overall_band(listening=6.0, reading=6.5, writing=7.0, speaking=6.0) == 6.5


def test_general_reading_band_5_is_reachable():
    # Regression test for a duplicate-threshold bug: (0.375, 5.5) once sat
    # directly above (0.375, 5.0) in the General Training table, so
    # band_from_ratio's first-match-wins scan could never return 5.0 — any
    # ratio that should land there hit the 5.5 row first.
    assert band_from_ratio(0.40, "general_reading") == 5.0
    assert band_from_ratio(0.55, "general_reading") == 5.5


def test_general_reading_is_stricter_than_academic_at_the_same_ratio():
    assert band_from_ratio(0.75, "general_reading") <= band_from_ratio(0.75, "reading")
