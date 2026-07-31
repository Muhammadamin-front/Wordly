"""Subscription plans. Prices are in so'm (UZS); Payme works in tiyin (×100)."""
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass(frozen=True)
class Plan:
    code: str
    tier: str  # "free" | "premium"
    price_som: int
    duration_days: int
    seats: int


PLANS: Dict[str, Plan] = {
    "free": Plan("free", "free", 0, 0, 1),
    "premium_monthly": Plan("premium_monthly", "premium", 29_000, 30, 1),
    "premium_yearly": Plan("premium_yearly", "premium", 199_000, 365, 1),
    "family": Plan("family", "premium", 349_000, 365, 6),
}

PAID_PLANS = [p for p in PLANS.values() if p.tier == "premium"]
PUBLIC_PLAN_CODES = ("free", "premium_monthly", "premium_yearly")
SELLABLE_PLAN_CODES = frozenset(("premium_monthly", "premium_yearly"))


def public_plans() -> list[Plan]:
    return [PLANS[code] for code in PUBLIC_PLAN_CODES]


def get_plan(code: str) -> Optional[Plan]:
    return PLANS.get(code)


def som_to_tiyin(som: int) -> int:
    return som * 100
