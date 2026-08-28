from datetime import datetime
from typing import List, Literal, Optional
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


class AdminSubscriptionOut(BaseModel):
    plan_code: str
    status: str
    provider: str
    auto_renew: bool
    expires_at: datetime


class AdminPaymentOut(BaseModel):
    id: UUID
    provider: str
    plan_code: str
    amount_tiyin: int
    state: int
    created_at: datetime


class AdminUserDetailOut(AdminUserOut):
    email_verified: bool
    cefr_level: str
    learning_goal: str
    onboarding_completed: bool
    cards_total: int
    cards_due: int
    reviews_total: int
    latest_review_at: Optional[datetime] = None
    active_sessions: int
    latest_session_at: Optional[datetime] = None
    password_reset_pending: bool
    subscription: Optional[AdminSubscriptionOut] = None
    payments: List[AdminPaymentOut] = Field(default_factory=list)


class AdminActionRequest(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=500)


class ManualSubscriptionGrant(BaseModel):
    plan_code: Literal["premium_monthly", "premium_quarterly", "premium_yearly"]
    extra_days: int = Field(default=0, ge=0, le=3650)
    reason: str = Field(min_length=3, max_length=500)


class RoleUpdate(AdminActionRequest):
    role: Literal["learner", "teacher", "support", "content_manager", "admin", "super_admin"]


class AdminAuditLogOut(BaseModel):
    id: UUID
    actor_id: Optional[UUID] = None
    actor_email: Optional[str] = None
    action: str
    target_type: str
    target_id: str
    previous_value: Optional[dict] = None
    new_value: Optional[dict] = None
    reason: Optional[str] = None
    created_at: datetime


class MessageOut(BaseModel):
    message: str
