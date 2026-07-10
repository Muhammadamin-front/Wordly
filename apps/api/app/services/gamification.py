from dataclasses import dataclass, field
from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.flashcards import Card
from app.models.gamification import DailyActivity, UserAchievement, UserStats
from app.models.user import User
from app.services import leagues
from app.services.achievements import ACHIEVEMENTS, NEEDS_MASTERED
from app.services.leveling import (
    COINS_PER_REVIEW,
    DAILY_GOAL_COIN_BONUS,
    DAILY_GOAL_XP_BONUS,
    MASTERED_INTERVAL_DAYS,
    iso_week,
    level_for_xp,
    local_today,
    xp_for_rating,
    yesterday,
)


@dataclass
class RewardSummary:
    xp_gained: int = 0
    coins_gained: int = 0
    total_xp: int = 0
    level: int = 1
    leveled_up: bool = False
    current_streak: int = 0
    streak_increased: bool = False
    freeze_used: bool = False
    goal_reached: bool = False
    new_achievements: List[str] = field(default_factory=list)


async def get_or_create_stats(db: AsyncSession, user: User) -> UserStats:
    stats = await db.scalar(select(UserStats).where(UserStats.user_id == user.id))
    if stats is None:
        stats = UserStats(user_id=user.id)
        db.add(stats)
        await db.flush()
    return stats


async def _get_or_create_activity(db: AsyncSession, user: User, day) -> DailyActivity:
    activity = await db.scalar(
        select(DailyActivity).where(
            DailyActivity.user_id == user.id, DailyActivity.day == day
        )
    )
    if activity is None:
        activity = DailyActivity(user_id=user.id, day=day)
        db.add(activity)
        await db.flush()
    return activity


def _update_streak(stats: UserStats, today) -> RewardSummary:
    summary = RewardSummary()
    last = stats.last_active_on
    if last is None:
        stats.current_streak = 1
        summary.streak_increased = True
    elif last == today:
        pass  # already counted today
    elif last == yesterday(today):
        stats.current_streak += 1
        summary.streak_increased = True
    else:
        gap = (today - last).days
        # Freeze covers exactly one fully-missed day, keeping the streak alive.
        if gap == 2 and stats.streak_freezes > 0:
            stats.streak_freezes -= 1
            stats.current_streak += 1
            summary.streak_increased = True
            summary.freeze_used = True
        else:
            stats.current_streak = 1
            summary.streak_increased = True
    stats.last_active_on = today
    stats.longest_streak = max(stats.longest_streak, stats.current_streak)
    return summary


async def _check_achievements(
    db: AsyncSession, user: User, stats: UserStats, goal_reached_ever: bool
) -> List[str]:
    unlocked = set(
        (
            await db.scalars(
                select(UserAchievement.code).where(UserAchievement.user_id == user.id)
            )
        ).all()
    )
    locked = [a for a in ACHIEVEMENTS if a.code not in unlocked]
    if not locked:
        return []

    needs_mastered = any(a.code in NEEDS_MASTERED for a in locked)
    mastered_words = 0
    if needs_mastered:
        mastered_words = int(
            await db.scalar(
                select(func.count(Card.id)).where(
                    Card.user_id == user.id, Card.interval_days >= MASTERED_INTERVAL_DAYS
                )
            )
            or 0
        )

    context = {
        "total_reviews": stats.total_reviews,
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "level": level_for_xp(stats.xp),
        "mastered_words": mastered_words,
        "goal_reached": 1 if goal_reached_ever else 0,
    }

    newly: List[str] = []
    for achievement in locked:
        if achievement.unlocked(context):
            db.add(UserAchievement(user_id=user.id, code=achievement.code))
            stats.xp += achievement.xp_reward
            stats.coins += achievement.coin_reward
            newly.append(achievement.code)
    return newly


async def apply_skill_xp(db: AsyncSession, user: User, xp_gain: int) -> RewardSummary:
    """Award XP for non-review learning (reading passages, writing practice).
    Counts toward level, daily XP, and the weekly league — but not review
    streaks/goals, which stay tied to actual SRS reviews."""
    today = local_today(user.profile.timezone or "UTC")
    stats = await get_or_create_stats(db, user)
    level_before = level_for_xp(stats.xp)

    stats.xp += xp_gain
    activity = await _get_or_create_activity(db, user, today)
    activity.xp_earned += xp_gain
    await leagues.add_xp(db, user.id, iso_week(today), xp_gain)

    summary = RewardSummary(xp_gained=xp_gain, total_xp=stats.xp)
    summary.level = level_for_xp(stats.xp)
    summary.leveled_up = summary.level > level_before
    summary.current_streak = stats.current_streak
    return summary


async def apply_review_rewards(
    db: AsyncSession, user: User, stats: UserStats, rating: str
) -> RewardSummary:
    """Award XP/coins/streak/league/achievements for one review. Mutates within
    the caller's transaction; the caller commits."""
    today = local_today(user.profile.timezone or "UTC")

    xp_gain = xp_for_rating(rating)
    level_before = level_for_xp(stats.xp)

    stats.xp += xp_gain
    stats.coins += COINS_PER_REVIEW
    stats.total_reviews += 1

    activity = await _get_or_create_activity(db, user, today)
    activity.reviews_count += 1
    activity.xp_earned += xp_gain

    summary = _update_streak(stats, today)
    summary.xp_gained = xp_gain
    summary.coins_gained = COINS_PER_REVIEW

    # Daily goal — bonus once per day when the target is crossed.
    if not activity.goal_reached and activity.reviews_count >= stats.daily_goal:
        activity.goal_reached = True
        summary.goal_reached = True
        stats.xp += DAILY_GOAL_XP_BONUS
        stats.coins += DAILY_GOAL_COIN_BONUS
        activity.xp_earned += DAILY_GOAL_XP_BONUS
        summary.xp_gained += DAILY_GOAL_XP_BONUS
        summary.coins_gained += DAILY_GOAL_COIN_BONUS

    await leagues.add_xp(db, user.id, iso_week(today), summary.xp_gained)

    summary.new_achievements = await _check_achievements(
        db, user, stats, goal_reached_ever=activity.goal_reached
    )

    summary.total_xp = stats.xp
    summary.level = level_for_xp(stats.xp)
    summary.leveled_up = summary.level > level_before
    summary.current_streak = stats.current_streak
    return summary
