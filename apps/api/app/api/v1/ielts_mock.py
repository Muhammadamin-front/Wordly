"""IELTS Full Mock — a complete, timed, four-skill exam in one sitting.

Distinct from the standalone practice router (app.api.v1.ielts): this is
the premium, "official-feeling" product surface, not free practice. The
session/leg lifecycle lives here; each leg's actual content and grading
reuses the existing per-skill services rather than duplicating them.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_premium
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.ielts_mock import MockSessionCreate, MockSessionListItem, MockSessionOut
from app.services import ielts_mock

router = APIRouter(
    prefix="/ielts/mock",
    tags=["ielts-mock"],
    dependencies=[Depends(get_current_user), Depends(require_premium), Depends(rate_limit("ai"))],
)


async def _owned_session(db: AsyncSession, user: User, session_id: UUID):
    session = await ielts_mock.get_session(db, user, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock session not found")
    return session


@router.post("/sessions", response_model=MockSessionOut, status_code=status.HTTP_201_CREATED)
async def start_session(
    payload: MockSessionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await ielts_mock.has_active_session(db, user):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a mock exam in progress",
        )
    session = await ielts_mock.create_session(db, user, track=payload.track)
    await db.commit()
    return session


@router.get("/sessions", response_model=list[MockSessionListItem])
async def list_sessions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await ielts_mock.list_sessions(db, user)


@router.get("/sessions/{session_id}", response_model=MockSessionOut)
async def get_session(
    session_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await _owned_session(db, user, session_id)


@router.post("/sessions/{session_id}/abandon", response_model=MockSessionOut)
async def abandon_session(
    session_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    session = await _owned_session(db, user, session_id)
    if session.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Session is not in progress")
    session = await ielts_mock.abandon_session(db, session)
    await db.commit()
    return session
