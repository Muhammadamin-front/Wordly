from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.gamification import DailyActivity, LeagueEntry, UserAchievement
from app.models.user import Profile, User
from app.schemas.gamification import (
    AchievementOut,
    DailyGoalUpdate,
    DailyQuestsOut,
    FreezePurchaseOut,
    HeatmapDay,
    HeatmapOut,
    LeaderboardMember,
    LeaderboardOut,
    StatsOut,
)
from app.services import leagues
from app.services.achievements import ACHIEVEMENTS
from app.services.gamification import get_or_create_stats
from app.services.quests import daily_quest_snapshot
from app.services.leveling import (
    FREEZE_COST_COINS,
    MAX_STREAK_FREEZES,
    iso_week,
    level_progress,
    local_today,
)

router = APIRouter(tags=["gamification"], dependencies=[Depends(get_current_user)])


@router.get("/me/daily-quests", response_model=DailyQuestsOut)
async def my_daily_quests(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return DailyQuestsOut(**(await daily_quest_snapshot(db, user)))


@router.get("/me/stats", response_model=StatsOut)
async def my_stats(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stats = await get_or_create_stats(db, user)
    today = local_today(user.profile.timezone or "UTC")
    activity = await db.scalar(
        select(DailyActivity).where(
            DailyActivity.user_id == user.id, DailyActivity.day == today
        )
    )
    entry = await leagues.ensure_entry(db, user.id, iso_week(today))
    await db.commit()

    level, into, needed = level_progress(stats.xp)
    return StatsOut(
        xp=stats.xp,
        level=level,
        xp_into_level=into,
        xp_for_next_level=needed,
        coins=stats.coins,
        total_reviews=stats.total_reviews,
        current_streak=stats.current_streak,
        longest_streak=stats.longest_streak,
        streak_freezes=stats.streak_freezes,
        daily_goal=stats.daily_goal,
        reviews_today=activity.reviews_count if activity else 0,
        goal_reached_today=activity.goal_reached if activity else False,
        league_tier=leagues.tier_name(entry.tier_index),
        league_tier_index=entry.tier_index,
    )


@router.put("/me/daily-goal", response_model=StatsOut)
async def set_daily_goal(
    payload: DailyGoalUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await get_or_create_stats(db, user)
    stats.daily_goal = payload.daily_goal
    await db.commit()
    return await my_stats(user, db)


@router.post("/me/streak-freeze", response_model=FreezePurchaseOut)
async def buy_streak_freeze(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stats = await get_or_create_stats(db, user)
    if stats.streak_freezes >= MAX_STREAK_FREEZES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="You already have the maximum freezes"
        )
    if stats.coins < FREEZE_COST_COINS:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Not enough coins"
        )
    stats.coins -= FREEZE_COST_COINS
    stats.streak_freezes += 1
    await db.commit()
    return FreezePurchaseOut(streak_freezes=stats.streak_freezes, coins=stats.coins)


@router.get("/me/achievements", response_model=list[AchievementOut])
async def my_achievements(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    rows = await db.execute(
        select(UserAchievement.code, UserAchievement.unlocked_at).where(
            UserAchievement.user_id == user.id
        )
    )
    unlocked = {code: at for code, at in rows}
    return [
        AchievementOut(
            code=a.code,
            category=a.category,
            xp_reward=a.xp_reward,
            coin_reward=a.coin_reward,
            unlocked=a.code in unlocked,
            unlocked_at=unlocked.get(a.code),
        )
        for a in ACHIEVEMENTS
    ]


@router.get("/me/heatmap", response_model=HeatmapOut)
async def my_heatmap(
    days: int = Query(120, ge=1, le=400),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = local_today(user.profile.timezone or "UTC")
    since = today - timedelta(days=days)
    rows = await db.scalars(
        select(DailyActivity)
        .where(DailyActivity.user_id == user.id, DailyActivity.day >= since)
        .order_by(DailyActivity.day)
    )
    return HeatmapOut(
        days=[
            HeatmapDay(
                day=a.day,
                reviews_count=a.reviews_count,
                xp_earned=a.xp_earned,
                goal_reached=a.goal_reached,
            )
            for a in rows
        ]
    )


@router.get("/leaderboard", response_model=LeaderboardOut)
async def leaderboard(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    today = local_today(user.profile.timezone or "UTC")
    entry = await leagues.ensure_entry(db, user.id, iso_week(today))
    await db.commit()

    standings = await leagues.group_standings(db, entry)
    user_ids = [uid for uid, _ in standings]
    profiles = {
        p.user_id: p
        for p in (
            await db.scalars(select(Profile).where(Profile.user_id.in_(user_ids)))
        )
    }

    members = []
    my_rank = 0
    for rank, (uid, xp) in enumerate(standings, start=1):
        profile = profiles.get(uid)
        is_me = uid == user.id
        if is_me:
            my_rank = rank
        members.append(
            LeaderboardMember(
                rank=rank,
                user_id=uid,
                display_name=profile.display_name if profile else "Learner",
                avatar_url=profile.avatar_url if profile else None,
                xp=xp,
                is_me=is_me,
            )
        )

    return LeaderboardOut(
        tier=leagues.tier_name(entry.tier_index),
        tier_index=entry.tier_index,
        iso_week=entry.iso_week,
        promote_top=leagues.PROMOTE_TOP,
        relegate_bottom=leagues.RELEGATE_BOTTOM,
        my_rank=my_rank,
        members=members,
    )
