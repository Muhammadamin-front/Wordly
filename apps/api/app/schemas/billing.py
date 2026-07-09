from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PlanOut(BaseModel):
    code: str
    tier: str
    price_som: int
    duration_days: int
    seats: int


class PlansOut(BaseModel):
    plans: List[PlanOut]


class SubscriptionOut(BaseModel):
    is_premium: bool
    plan_code: Optional[str] = None
    status: Optional[str] = None
    provider: Optional[str] = None
    expires_at: Optional[datetime] = None
    seats: int = 1


class CheckoutRequest(BaseModel):
    plan_code: str = Field(min_length=1, max_length=24)
    provider: str = Field(pattern="^(payme|click)$")
    return_url: Optional[str] = Field(default=None, max_length=500)


class CheckoutOut(BaseModel):
    order_id: str
    checkout_url: str
    amount_som: int


class SandboxActivateRequest(BaseModel):
    plan_code: str = Field(min_length=1, max_length=24)


class ReferralOut(BaseModel):
    code: str
    invited: int
    rewarded: int
    reward_days: int


class MessageOut(BaseModel):
    message: str
