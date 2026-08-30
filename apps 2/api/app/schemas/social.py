from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FriendRequest(BaseModel):
    code: str = Field(min_length=1, max_length=12)


class FriendOut(BaseModel):
    user_id: UUID
    display_name: str
    level: int
    current_streak: int


class PendingOut(BaseModel):
    friendship_id: UUID
    user_id: UUID
    display_name: str
    level: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: UUID
    display_name: str
    level: int
    xp: int
    current_streak: int
    is_me: bool


class PublicProfileOut(BaseModel):
    user_id: UUID
    code: str
    display_name: str
    level: int
    xp: int
    current_streak: int
    longest_streak: int
    achievements: List[str]


class MessageOut(BaseModel):
    message: str
