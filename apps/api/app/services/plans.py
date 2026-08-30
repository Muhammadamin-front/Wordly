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
    # Three tiers replace the old premium_*/speaking_pro_* split: Plus is
    # writing-only (no real-time voice at all — speaking stays a Pro/Max
    # differentiator instead of a taste on every paid tier), Pro bundles in
    # the same voice allowance the old speaking_pro_monthly sold separately,
    # Max is the top tier. See WRITING_ACTIONS_PER_DAY/WRITING_ESSAY_SUBCAP_
    # PER_DAY/VOICE_SECONDS_PER_WEEK below for what each tier actually gets.
    "plus_monthly": Plan("plus_monthly", "premium", 49_000, 30, 1),
    # ~15% off 3x monthly (147,000 -> 124,950, rounded to a clean 125,000).
    "plus_quarterly": Plan("plus_quarterly", "premium", 125_000, 90, 1),
    # Exactly 25% off 12x monthly (588,000 * 0.75 = 441,000).
    "plus_yearly": Plan("plus_yearly", "premium", 441_000, 365, 1),
    # Priced as "Plus + what speaking_pro_monthly used to cost standalone,
    # bundled" (49,000 + 145,000 = 194,000) at a real ~33% bundle discount —
    # not a number invented from scratch. See VOICE_SECONDS_PER_WEEK: Pro
    # gets exactly the old speaking_pro_monthly voice allowance.
    "pro_monthly": Plan("pro_monthly", "premium", 129_000, 30, 1),
    # ~15% off 3x monthly (387,000 -> 328,950, rounded to a clean 329,000).
    "pro_quarterly": Plan("pro_quarterly", "premium", 329_000, 90, 1),
    # Exactly 25% off 12x monthly (1,548,000 * 0.75 = 1,161,000).
    "pro_yearly": Plan("pro_yearly", "premium", 1_161_000, 365, 1),
    "max_monthly": Plan("max_monthly", "premium", 499_999, 30, 1),
    # ~15% off 3x monthly (1,499,997 * 0.85 = 1,274,997.45, rounded to 1,275,000).
    "max_quarterly": Plan("max_quarterly", "premium", 1_275_000, 90, 1),
    # 25% off 12x monthly (5,999,988 * 0.75 = 4,499,991), rounded up to keep
    # the "999" pricing style consistent with the monthly price.
    "max_yearly": Plan("max_yearly", "premium", 4_499_999, 365, 1),
    # Unlike streaming seats, each family seat is a real AI-consuming user
    # (own daily quota) — marginal cost per seat is real, not ~0. Priced at
    # ~25% off 6x plus_yearly (2,646,000 -> 1,990,000), not a steep
    # streaming-style bulk discount — see git history for the analysis.
    # Allowances follow the Plus tier (see WRITING_ACTIONS_PER_DAY etc.) —
    # family was always linked to the base premium tier, never to Pro/Max.
    "family": Plan("family", "premium", 1_990_000, 365, 6),
}

PAID_PLANS = [p for p in PLANS.values() if p.tier == "premium"]
PUBLIC_PLAN_CODES = (
    "free",
    "plus_monthly", "plus_quarterly", "plus_yearly",
    "pro_monthly", "pro_quarterly", "pro_yearly",
    "max_monthly", "max_quarterly", "max_yearly",
)
SELLABLE_PLAN_CODES = frozenset((
    "plus_monthly", "plus_quarterly", "plus_yearly",
    "pro_monthly", "pro_quarterly", "pro_yearly",
    "max_monthly", "max_quarterly", "max_yearly",
))

# Which tier ladder a plan code belongs to, for the two per-tier dicts below
# — every duration of a tier shares the same daily/weekly allowances (only
# the price and billing period change with duration).
_TIER_OF_PLAN: Dict[str, str] = {
    "plus_monthly": "plus", "plus_quarterly": "plus", "plus_yearly": "plus",
    "pro_monthly": "pro", "pro_quarterly": "pro", "pro_yearly": "pro",
    "max_monthly": "max", "max_quarterly": "max", "max_yearly": "max",
    "family": "plus",
}

# Real-time voice speaking allowance, in whole seconds, reset every calendar
# week (see services.voice_minutes) — not a lifetime balance like coins.
# Any tier not listed gets 0 (Plus and free never reach real-time voice at
# all — speaking is a Pro/Max differentiator now, not a taste on every tier).
#
# Weekly rather than monthly because it is what the plans advertise, and it
# paces the spend: a learner cannot burn a whole month's voice cost in one
# sitting and then churn, and a quiet week costs nothing to carry.
#
# Real cost is ~262 so'm/minute (ElevenLabs-dominated, not much room to cut):
#   Pro:  70 min/week (~300/mo) is exactly the old speaking_pro_monthly
#         allowance — a proven ~46% margin at that plan's price, and now
#         bundled into pro_monthly instead of sold as its own tier.
#   Max:  25 min/day (175/week, ~750/mo) — real cost ~196,500 so'm/mo,
#         ~39% of max_monthly's price, leaving comfortable margin at the
#         top tier's price point.
_VOICE_SECONDS_PER_WEEK_BY_TIER: Dict[str, int] = {
    "plus": 0,
    "pro": 70 * 60,
    "max": 25 * 60 * 7,
}
VOICE_SECONDS_PER_WEEK: Dict[str, int] = {
    code: _VOICE_SECONDS_PER_WEEK_BY_TIER[tier] for code, tier in _TIER_OF_PLAN.items()
}

# Master Writing's combined daily action pool — every check that spends a
# real model call (the paraphrase/overview drills AND the full essay
# band-score check) draws from one number, which is what's actually
# advertised ("15/45/100 writing checks a day"). See services.ielts's
# has_writing_action_quota/log_writing_action for enforcement.
WRITING_ACTIONS_PER_DAY: Dict[str, int] = {
    code: {"plus": 15, "pro": 45, "max": 100}[tier] for code, tier in _TIER_OF_PLAN.items()
}

# A sub-limit *within* the pool above, specifically for full essay checks —
# those are a much bigger model call (8192-token cap, full rubric) than a
# drill (400-token cap), so without this a learner could spend the whole
# daily pool on the expensive path only. Deliberately not a 3x-9x jump off
# the old flat 5/day premium cap — a modest, cost-aware scale-up per tier.
WRITING_ESSAY_SUBCAP_PER_DAY: Dict[str, int] = {
    code: {"plus": 5, "pro": 12, "max": 25}[tier] for code, tier in _TIER_OF_PLAN.items()
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
# Master Writing units, in teaching order. Only the first (process diagrams)
# is free — same "one unit as a taste" shape as FREE_GRAMMAR_LEVELS.
FREE_WRITING_MASTER_UNITS = frozenset(("process",))


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
    """0 for free/unknown/None/Plus — real-time voice needs Pro or Max."""
    if not plan_code:
        return 0
    return VOICE_SECONDS_PER_WEEK.get(plan_code, 0)


def writing_actions_per_day(plan_code: Optional[str]) -> int:
    """0 for free/unknown/None — the free tier keeps its own separate
    weekly-rolling quota (FREE_WRITING_CHECKS_PER_WEEK in services.ielts),
    unaffected by this per-tier pool."""
    if not plan_code:
        return 0
    return WRITING_ACTIONS_PER_DAY.get(plan_code, 0)


def writing_essay_subcap_per_day(plan_code: Optional[str]) -> int:
    if not plan_code:
        return 0
    return WRITING_ESSAY_SUBCAP_PER_DAY.get(plan_code, 0)


def public_coin_packs() -> list[CoinPack]:
    return list(COIN_PACKS.values())


def get_coin_pack(code: str) -> Optional[CoinPack]:
    return COIN_PACKS.get(code)


def is_coin_pack_code(code: str) -> bool:
    return code in COIN_PACKS


def som_to_tiyin(som: int) -> int:
    return som * 100
