"""Subscription plans and coin packs. Prices are in so'm (UZS); Payme works
in tiyin (×100)."""
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
    "premium_monthly": Plan("premium_monthly", "premium", 49_000, 30, 1),
    # ~15% off 3x monthly (147,000 -> 124,950, rounded to a clean 125,000).
    "premium_quarterly": Plan("premium_quarterly", "premium", 125_000, 90, 1),
    # Exactly 25% off 12x monthly (588,000 * 0.75 = 441,000).
    "premium_yearly": Plan("premium_yearly", "premium", 441_000, 365, 1),
    "family": Plan("family", "premium", 349_000, 365, 6),
}

PAID_PLANS = [p for p in PLANS.values() if p.tier == "premium"]
PUBLIC_PLAN_CODES = ("free", "premium_monthly", "premium_quarterly", "premium_yearly")
SELLABLE_PLAN_CODES = frozenset(("premium_monthly", "premium_quarterly", "premium_yearly"))


@dataclass(frozen=True)
class CoinPack:
    code: str
    coins: int
    price_som: int


# Codes are prefixed "coins_" specifically so payme.py/click.py/uzum.py can
# tell a coin-pack Payment.plan_code apart from a subscription Plan.code with
# a plain string check (is_coin_pack_code below) — no extra DB column needed
# on Payment to distinguish what a completed order should grant.
COIN_PACKS: Dict[str, CoinPack] = {
    "coins_small": CoinPack("coins_small", 300, 9_000),
    "coins_medium": CoinPack("coins_medium", 1_100, 29_000),  # ~10% bonus over linear
    "coins_large": CoinPack("coins_large", 2_500, 59_000),  # ~15% bonus over linear
}

# Reference costs for the actions coins can pay for — the source of truth
# both API routes and the web/mobile clients should quote to the user.
COIN_COST_MOCK_ATTEMPT = 500
COIN_COST_SECTION_RETRY = 150
COIN_COST_C1_C2_UNLOCK = 1000


def public_plans() -> list[Plan]:
    return [PLANS[code] for code in PUBLIC_PLAN_CODES]


def get_plan(code: str) -> Optional[Plan]:
    return PLANS.get(code)


def public_coin_packs() -> list[CoinPack]:
    return list(COIN_PACKS.values())


def get_coin_pack(code: str) -> Optional[CoinPack]:
    return COIN_PACKS.get(code)


def is_coin_pack_code(code: str) -> bool:
    return code in COIN_PACKS


def som_to_tiyin(som: int) -> int:
    return som * 100
