"""IELTS Full Mock — session/leg orchestration.

Owns only the MockSession/MockLeg lifecycle (create, resume, abandon,
finalize). The actual content and grading for each leg lives in the
existing per-skill services (ielts.generate_test/grade_test for
Listening/Reading, ielts.score_writing for Writing, coach.score_ielts for
Speaking) — this module reuses them rather than duplicating them; see the
leg-specific service functions added alongside the corresponding routes.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.ielts_mock import MOCK_SKILLS, MockLeg, MockSession
from app.models.user import User


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
    for skill in MOCK_SKILLS:
        db.add(
            MockLeg(
                session_id=session.id,
                skill=skill,
                status="in_progress" if skill == MOCK_SKILLS[0] else "pending",
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
