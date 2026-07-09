"""Weekly leagues (Duolingo-style tiers with promotion/relegation).

Backed by the `league_entries` table — durable and testable without Redis.
Promotion/relegation is computed lazily: when a user's first activity of a new
week creates their entry, we rank their previous week's finish and adjust tier.
A Redis sorted-set fast path is a future optimization (see docs/milestones/M4).
"""
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import LeagueEntry

TIERS = ["bronze", "silver", "gold", "sapphire", "ruby", "emerald", "amethyst", "pearl"]
GROUP_SIZE = 30
PROMOTE_TOP = 7
RELEGATE_BOTTOM = 5


async def _rank_in_group(db: AsyncSession, entry: LeagueEntry) -> Tuple[int, int]:
    """(1-based rank of this entry within its group, group size)."""
    rows = (
        await db.execute(
            select(LeagueEntry.user_id, LeagueEntry.xp)
            .where(
                LeagueEntry.iso_week == entry.iso_week,
                LeagueEntry.tier_index == entry.tier_index,
                LeagueEntry.league_group == entry.league_group,
            )
            .order_by(LeagueEntry.xp.desc(), LeagueEntry.created_at.asc())
        )
    ).all()
    size = len(rows)
    for index, (user_id, _xp) in enumerate(rows, start=1):
        if user_id == entry.user_id:
            return index, size
    return size, size


async def _next_tier_from_previous(db: AsyncSession, previous: LeagueEntry) -> int:
    rank, size = await _rank_in_group(db, previous)
    if rank <= PROMOTE_TOP:
        return min(previous.tier_index + 1, len(TIERS) - 1)
    if size >= (PROMOTE_TOP + RELEGATE_BOTTOM) and rank > size - RELEGATE_BOTTOM:
        return max(previous.tier_index - 1, 0)
    return previous.tier_index


async def _assign_group(db: AsyncSession, week: str, tier_index: int) -> int:
    """Place the user in the smallest not-full group at this tier, else a new one."""
    rows = (
        await db.execute(
            select(LeagueEntry.league_group, func.count())
            .where(LeagueEntry.iso_week == week, LeagueEntry.tier_index == tier_index)
            .group_by(LeagueEntry.league_group)
        )
    ).all()
    open_groups = [(count, group) for group, count in rows if count < GROUP_SIZE]
    if open_groups:
        return min(open_groups)[1]
    return (max((group for group, _ in rows), default=-1)) + 1


async def ensure_entry(db: AsyncSession, user_id: UUID, week: str) -> LeagueEntry:
    entry = await db.scalar(
        select(LeagueEntry).where(
            LeagueEntry.user_id == user_id, LeagueEntry.iso_week == week
        )
    )
    if entry is not None:
        return entry

    previous = await db.scalar(
        select(LeagueEntry)
        .where(LeagueEntry.user_id == user_id, LeagueEntry.iso_week < week)
        .order_by(LeagueEntry.iso_week.desc())
        .limit(1)
    )
    tier_index = await _next_tier_from_previous(db, previous) if previous else 0
    group = await _assign_group(db, week, tier_index)

    entry = LeagueEntry(
        user_id=user_id, iso_week=week, tier_index=tier_index, league_group=group, xp=0
    )
    db.add(entry)
    await db.flush()
    return entry


async def add_xp(db: AsyncSession, user_id: UUID, week: str, amount: int) -> None:
    entry = await ensure_entry(db, user_id, week)
    entry.xp += amount


async def group_standings(
    db: AsyncSession, entry: LeagueEntry
) -> List[Tuple[UUID, int]]:
    """Ordered (user_id, xp) for everyone in the entry's group."""
    return [
        (row.user_id, row.xp)
        for row in (
            await db.execute(
                select(LeagueEntry.user_id, LeagueEntry.xp)
                .where(
                    LeagueEntry.iso_week == entry.iso_week,
                    LeagueEntry.tier_index == entry.tier_index,
                    LeagueEntry.league_group == entry.league_group,
                )
                .order_by(LeagueEntry.xp.desc(), LeagueEntry.created_at.asc())
            )
        ).all()
    ]


def tier_name(tier_index: int) -> str:
    return TIERS[max(0, min(tier_index, len(TIERS) - 1))]
