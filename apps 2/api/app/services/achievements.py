"""Achievement definitions. Titles/descriptions/icons live in the web
dictionaries (i18n) — the backend only owns codes, rewards, and unlock rules."""
from dataclasses import dataclass
from typing import Callable, Dict, List


@dataclass(frozen=True)
class AchievementDef:
    code: str
    category: str
    xp_reward: int
    coin_reward: int
    # predicate over a context dict of the user's current totals
    unlocked: Callable[[Dict[str, int]], bool]


ACHIEVEMENTS: List[AchievementDef] = [
    AchievementDef("first_steps", "volume", 20, 5, lambda c: c["total_reviews"] >= 1),
    AchievementDef("getting_serious", "volume", 40, 10, lambda c: c["total_reviews"] >= 100),
    AchievementDef("word_machine", "volume", 200, 50, lambda c: c["total_reviews"] >= 1000),
    AchievementDef("committed", "streak", 50, 15, lambda c: c["current_streak"] >= 7),
    AchievementDef("unstoppable", "streak", 150, 40, lambda c: c["current_streak"] >= 30),
    AchievementDef("legendary", "streak", 500, 120, lambda c: c["longest_streak"] >= 100),
    AchievementDef("collector", "mastery", 100, 30, lambda c: c["mastered_words"] >= 50),
    AchievementDef("curator", "mastery", 300, 80, lambda c: c["mastered_words"] >= 250),
    AchievementDef("rising_star", "level", 40, 10, lambda c: c["level"] >= 5),
    AchievementDef("scholar", "level", 100, 30, lambda c: c["level"] >= 10),
    AchievementDef("goal_getter", "goal", 15, 5, lambda c: c["goal_reached"] >= 1),
]

ACHIEVEMENTS_BY_CODE = {a.code: a for a in ACHIEVEMENTS}

# Which context keys require an extra DB query, so the service only computes
# them when a dependent achievement is still locked.
NEEDS_MASTERED = {"collector", "curator"}
