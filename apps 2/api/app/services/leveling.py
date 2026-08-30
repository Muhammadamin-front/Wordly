"""Pure XP/level math and gamification constants. No DB, no I/O — trivially
testable and shared by the service and schemas."""
from datetime import date, datetime, timedelta
from typing import Tuple
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

# --- economy ---------------------------------------------------------------
XP_BY_RATING = {"again": 4, "hard": 8, "good": 10, "easy": 12}
COINS_PER_REVIEW = 1
DAILY_GOAL_XP_BONUS = 20
DAILY_GOAL_COIN_BONUS = 10
DEFAULT_DAILY_GOAL = 20
FREEZE_COST_COINS = 50
MAX_STREAK_FREEZES = 5
MASTERED_INTERVAL_DAYS = 21  # a card is "mastered" once its interval reaches ~3 weeks


def level_progress(xp: int) -> Tuple[int, int, int]:
    """(level, xp_into_current_level, xp_needed_for_next_level).

    Cost to go from level L to L+1 is 100 + (L-1)*20, so early levels come
    quickly and later ones stretch out."""
    level = 1
    remaining = max(0, xp)
    while True:
        needed = 100 + (level - 1) * 20
        if remaining < needed:
            return level, remaining, needed
        remaining -= needed
        level += 1


def level_for_xp(xp: int) -> int:
    return level_progress(xp)[0]


def local_today(timezone: str) -> date:
    try:
        tz = ZoneInfo(timezone)
    except (ZoneInfoNotFoundError, ValueError, KeyError):
        tz = ZoneInfo("UTC")
    return datetime.now(tz).date()


def iso_week(day: date) -> str:
    iso = day.isocalendar()
    return "{:04d}-W{:02d}".format(iso[0], iso[1])


def xp_for_rating(rating: str) -> int:
    return XP_BY_RATING.get(rating, 0)


def days_between(earlier: date, later: date) -> int:
    return (later - earlier).days


def yesterday(day: date) -> date:
    return day - timedelta(days=1)
