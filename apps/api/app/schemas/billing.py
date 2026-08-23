from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class PlanOut(BaseModel):
    code: str
    tier: str
    price_som: int
    duration_days: int
    seats: int


class PlansOut(BaseModel):
    plans: List[PlanOut]


class BillingStatusOut(BaseModel):
    checkout_enabled: bool
    sandbox_enabled: bool
    providers: Dict[str, bool]
    family_plan_available: bool = False


class SubscriptionOut(BaseModel):
    is_premium: bool
    plan_code: Optional[str] = None
    status: Optional[str] = None
    provider: Optional[str] = None
    expires_at: Optional[datetime] = None
    seats: int = 1
    auto_renew: bool = False
    cancelled_at: Optional[datetime] = None


class CheckoutRequest(BaseModel):
    plan_code: str = Field(min_length=1, max_length=24)
    provider: Literal["payme", "click", "uzum"]
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
