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
    # Unlike streaming seats, each family seat is a real AI-consuming user
    # (own 200/day quota) — marginal cost per seat is ~4,500 so'm/mo typical,
    # not ~0. Priced at ~25% off 6x premium_yearly (2,646,000 -> 1,990,000),
    # not a steep streaming-style bulk discount: was 349,000 total, which
    # undercut a single solo yearly seat and ran near-zero margin per seat
    # at typical usage — see git history for the analysis.
    "family": Plan("family", "premium", 1_990_000, 365, 6),
    # Real-time voice speaking (GPT-5.6 Terra/Gemini brain + ElevenLabs TTS)
    # costs ~262 so'm/minute — dominated by ElevenLabs, not much room to cut.
    # 300 min/mo (~85,000 so'm real cost) needs its own tier priced for that,
    # not folded into premium_* at ~40% margin — lands right next to what
    # rivals already charge for the same generosity (Cefrs Max: 134,199).
    "speaking_pro_monthly": Plan("speaking_pro_monthly", "premium", 145_000, 30, 1),
    # ~15% off 3x monthly (435,000 -> 369,750, rounded to a clean 370,000).
    "speaking_pro_quarterly": Plan("speaking_pro_quarterly", "premium", 370_000, 90, 1),
    # Exactly 25% off 12x monthly (1,740,000 * 0.75 = 1,305,000).
    "speaking_pro_yearly": Plan("speaking_pro_yearly", "premium", 1_305_000, 365, 1),
}

PAID_PLANS = [p for p in PLANS.values() if p.tier == "premium"]
PUBLIC_PLAN_CODES = (
    "free",
    "premium_monthly", "premium_quarterly", "premium_yearly",
    "speaking_pro_monthly", "speaking_pro_quarterly", "speaking_pro_yearly",
)
SELLABLE_PLAN_CODES = frozenset((
    "premium_monthly", "premium_quarterly", "premium_yearly",
    "speaking_pro_monthly", "speaking_pro_quarterly", "speaking_pro_yearly",
))

# Real-time voice speaking allowance, in whole seconds, reset every calendar
# week (see services.voice_minutes) — not a lifetime balance like coins.
# "premium_*" plan codes are the Basic tier here; any code not listed gets 0
# (free tier never reaches real-time voice at all — see services.voice_minutes).
#
# Weekly rather than monthly because it is what the plans advertise, and it
# paces the spend: a learner cannot burn a whole month's voice cost in one
# sitting and then churn, and a quiet week costs nothing to carry.
VOICE_SECONDS_PER_WEEK: Dict[str, int] = {
    "premium_monthly": 10 * 60,
    "premium_quarterly": 10 * 60,
    "premium_yearly": 10 * 60,
    "family": 10 * 60,
    # ~70/week keeps Speaking Pro at the ~300 minutes a month it was priced
    # against (~262 so'm/minute real cost) now that the window is weekly.
    "speaking_pro_monthly": 70 * 60,
    "speaking_pro_quarterly": 70 * 60,
    "speaking_pro_yearly": 70 * 60,
}

# Coin price for extra real-time voice minutes beyond the monthly allowance
# (either tier). ~262 so'm/min real cost, ~30 so'm/coin -> ~9 coins covers
# cost; priced with margin, same logic as the other COIN_COST_* constants.
COIN_COST_VOICE_MINUTE = 15

# Free tier only reaches these games directly — the rest need Basic/Speaking
# Pro (see api.v1.games). All games cost the same to serve (no AI involved),
# so this is a taste-then-upsell boundary, not a cost-control one. Includes
# "listening"/"speaking" — the M11 skill drills that share GAME_TYPES' route
# plumbing but are a different product surface than the vocabulary games this
# boundary is actually about; never part of the discussed premium split.
FREE_GAME_TYPES = frozenset(("word_match", "speed_quiz", "fill_blank", "listening", "speaking"))

# CEFR levels a free learner can study without paying. Everything above needs
# Premium or the one-off coin unlock (see services.vocabulary_unlocks).
#
# Two separate ceilings because the two libraries are different sizes and sit
# at different points in the funnel: the word list runs A1-C2 and A1+A2 is
# already thousands of words — enough to judge the product — while the grammar
# curriculum only runs A1-B2, so giving away two of its four levels would be
# giving away half the course.
FREE_VOCABULARY_LEVELS = frozenset(("A1", "A2"))
FREE_GRAMMAR_LEVELS = frozenset(("A1",))


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


def voice_seconds_per_week(plan_code: Optional[str]) -> int:
    """0 for free/unknown/None — real-time voice is never reachable without
    an active Basic or Speaking Pro subscription."""
    if not plan_code:
        return 0
    return VOICE_SECONDS_PER_WEEK.get(plan_code, 0)


def public_coin_packs() -> list[CoinPack]:
    return list(COIN_PACKS.values())


def get_coin_pack(code: str) -> Optional[CoinPack]:
    return COIN_PACKS.get(code)


def is_coin_pack_code(code: str) -> bool:
    return code in COIN_PACKS


def som_to_tiyin(som: int) -> int:
    return som * 100
