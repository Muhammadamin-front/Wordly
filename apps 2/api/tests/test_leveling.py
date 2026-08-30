from datetime import date

from app.services.leveling import iso_week, level_for_xp, level_progress


def test_level_one_at_zero_xp():
    level, into, needed = level_progress(0)
    assert level == 1
    assert into == 0
    assert needed == 100


def test_level_two_after_100_xp():
    assert level_for_xp(99) == 1
    assert level_for_xp(100) == 2
    level, into, needed = level_progress(100)
    assert level == 2
    assert into == 0
    assert needed == 120  # cost grows by 20 each level


def test_level_progress_carries_remainder():
    level, into, needed = level_progress(150)
    assert level == 2
    assert into == 50
    assert needed == 120


def test_levels_are_monotonic():
    last = 0
    for xp in range(0, 5000, 37):
        current = level_for_xp(xp)
        assert current >= last
        last = current


def test_iso_week_format():
    assert iso_week(date(2026, 7, 9)) == "2026-W28"
    assert iso_week(date(2026, 1, 1)) == "2026-W01"
