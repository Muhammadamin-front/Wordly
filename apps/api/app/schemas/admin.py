from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AdminAnalyticsOut(BaseModel):
    users_total: int
    premium_users: int
    active_subscriptions: int
    revenue_som: int
    ai_reports_open: int
    reviews_total: int


class AiReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    kind: str
    output: str
    prompt: Optional[str] = None
    reason: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime


class AdminUserOut(BaseModel):
    id: UUID
    email: str
    display_name: str
    role: str
    is_active: bool
    is_premium: bool
    created_at: datetime


class AdminUserPage(BaseModel):
    items: List[AdminUserOut]
    total: int
    page: int
    page_size: int


class RoleUpdate(BaseModel):
    role: str = Field(pattern="^(learner|teacher|admin)$")


class MessageOut(BaseModel):
    message: str
