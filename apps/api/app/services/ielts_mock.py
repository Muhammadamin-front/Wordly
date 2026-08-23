"""IELTS Full Mock — session/leg orchestration.

Owns only the MockSession/MockLeg lifecycle (create, resume, abandon,
finalize). The actual content and grading for each leg lives in the
existing per-skill services (ielts.generate_test/grade_test for
Listening/Reading, ielts.score_writing for Writing, coach.score_ielts for
Speaking) — this module reuses them rather than duplicating them; see the
leg-specific service functions added alongside the corresponding routes.
"""
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.ielts_mock import MOCK_SKILLS, MockLeg, MockSession
from app.models.user import User
from app.services import ielts_scoring


async def has_active_session(db: AsyncSession, user: User) -> bool:
    existing = await db.scalar(
        select(MockSession.id).where(
            MockSession.user_id == user.id, MockSession.status == "in_progress"
        )
    )
    return existing is not None


async def create_session(db: AsyncSession, user: User, *, track: str) -> MockSession:
    session = MockSession(user_id=user.id, track=track, current_leg=MOCK_SKILLS[0])
    db.add(session)
    await db.flush()
    now = utcnow()
    for skill in MOCK_SKILLS:
        first = skill == MOCK_SKILLS[0]
        db.add(
            MockLeg(
                session_id=session.id,
                skill=skill,
                status="in_progress" if first else "pending",
                started_at=now if first else None,
            )
        )
    await db.flush()
    await db.refresh(session, attribute_names=["legs"])
    return session


async def get_session(db: AsyncSession, user: User, session_id: UUID) -> Optional[MockSession]:
    return await db.scalar(
        select(MockSession).where(MockSession.id == session_id, MockSession.user_id == user.id)
    )


async def list_sessions(db: AsyncSession, user: User, limit: int = 20) -> List[MockSession]:
    rows = await db.scalars(
        select(MockSession)
        .where(MockSession.user_id == user.id)
        .order_by(MockSession.started_at.desc())
        .limit(limit)
    )
    return list(rows)


async def get_leg(db: AsyncSession, session: MockSession, skill: str) -> Optional[MockLeg]:
    return await db.scalar(
        select(MockLeg).where(MockLeg.session_id == session.id, MockLeg.skill == skill)
    )


async def abandon_session(db: AsyncSession, session: MockSession) -> MockSession:
    session.status = "abandoned"
    session.current_leg = None
    session.finished_at = utcnow()
    await db.flush()
    return session


class LegNotActive(ValueError):
    """Raised when a leg-complete call targets a leg that isn't the session's
    current, in-progress one — a stale tab, a double-submit, or a client bug."""


async def complete_leg(
    db: AsyncSession,
    session: MockSession,
    skill: str,
    *,
    band: float,
    detail: Optional[Dict[str, Any]] = None,
) -> MockSession:
    """Record one leg's band, then either hand off to the next leg or, for the
    last leg (Speaking), compute the overall band and close the session out."""
    if session.status != "in_progress" or session.current_leg != skill:
        raise LegNotActive(f"{skill} is not the active leg of this session")
    leg = await get_leg(db, session, skill)
    if leg is None or leg.status != "in_progress":
        raise LegNotActive(f"{skill} leg is not in progress")

    band = ielts_scoring.half_band(band)
    now = utcnow()
    leg.band = band
    leg.status = "done"
    leg.completed_at = now
    if detail is not None:
        leg.detail_json = json.dumps(detail)
    setattr(session, f"band_{skill}", band)

    next_index = MOCK_SKILLS.index(skill) + 1
    if next_index < len(MOCK_SKILLS):
        next_skill = MOCK_SKILLS[next_index]
        session.current_leg = next_skill
        next_leg = await get_leg(db, session, next_skill)
        next_leg.status = "in_progress"
        next_leg.started_at = now
    else:
        session.current_leg = None
        session.status = "finished"
        session.finished_at = now
        session.overall_band = ielts_scoring.overall_band(
            session.band_listening or 0.0,
            session.band_reading or 0.0,
            session.band_writing or 0.0,
            session.band_speaking or 0.0,
        )
    await db.flush()
    return session
