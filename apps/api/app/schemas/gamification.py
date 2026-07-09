from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RewardOut(BaseModel):
    xp_gained: int
    coins_gained: int
    total_xp: int
    level: int
    leveled_up: bool
    current_streak: int
    streak_increased: bool
    freeze_used: bool
    goal_reached: bool
    new_achievements: List[str]


class StatsOut(BaseModel):
    xp: int
    level: int
    xp_into_level: int
    xp_for_next_level: int
    coins: int
    total_reviews: int
    current_streak: int
    longest_streak: int
    streak_freezes: int
    daily_goal: int
    reviews_today: int
    goal_reached_today: bool
    league_tier: str
    league_tier_index: int


class AchievementOut(BaseModel):
    code: str
    category: str
    xp_reward: int
    coin_reward: int
    unlocked: bool
    unlocked_at: Optional[datetime] = None


class DailyGoalUpdate(BaseModel):
    daily_goal: int = Field(ge=5, le=200)


class FreezePurchaseOut(BaseModel):
    streak_freezes: int
    coins: int


class LeaderboardMember(BaseModel):
    rank: int
    user_id: UUID
    display_name: str
    avatar_url: Optional[str] = None
    xp: int
    is_me: bool


class LeaderboardOut(BaseModel):
    tier: str
    tier_index: int
    iso_week: str
    promote_top: int
    relegate_bottom: int
    my_rank: int
    members: List[LeaderboardMember]


class HeatmapDay(BaseModel):
    day: date
    reviews_count: int
    xp_earned: int
    goal_reached: bool


class HeatmapOut(BaseModel):
    days: List[HeatmapDay]
