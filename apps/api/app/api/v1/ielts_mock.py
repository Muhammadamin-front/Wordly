"""IELTS Full Mock — a complete, timed, four-skill exam in one sitting.

Distinct from the standalone practice router (app.api.v1.ielts): this is
the premium, "official-feeling" product surface, not free practice. The
session/leg lifecycle lives here; each leg's actual content and grading
reuses the existing per-skill services rather than duplicating them.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_premium
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.ielts_mock import MOCK_SKILLS
from app.models.user import User
from app.schemas.ielts_mock import (
    LegCompleteRequest,
    MockSessionCreate,
    MockSessionListItem,
    MockSessionOut,
)
from app.services import ielts_mock, listening_audio, tts

router = APIRouter(
    prefix="/ielts/mock",
    tags=["ielts-mock"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("ai"))],
)


async def _owned_session(db: AsyncSession, user: User, session_id: UUID):
    session = await ielts_mock.get_session(db, user, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock session not found")
    return session


@router.post(
    "/sessions",
    response_model=MockSessionOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_premium)],
)
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


@router.post(
    "/sessions/{session_id}/abandon",
    response_model=MockSessionOut,
    dependencies=[Depends(require_premium)],
)
async def abandon_session(
    session_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    session = await _owned_session(db, user, session_id)
    if session.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Session is not in progress")
    session = await ielts_mock.abandon_session(db, session)
    await db.commit()
    return session


@router.post(
    "/sessions/{session_id}/legs/{skill}/complete",
    response_model=MockSessionOut,
    dependencies=[Depends(require_premium)],
)
async def complete_leg(
    session_id: UUID,
    skill: str,
    payload: LegCompleteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if skill not in MOCK_SKILLS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown skill")
    session = await _owned_session(db, user, session_id)
    try:
        session = await ielts_mock.complete_leg(
            db, session, skill, band=payload.band, detail=payload.detail
        )
    except ielts_mock.LegNotActive as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    await db.commit()
    return session


@router.get(
    "/listening/{slug}/section/{section}/audio",
    dependencies=[Depends(require_premium), Depends(rate_limit("mock_listening_audio"))],
)
async def listening_section_audio(slug: str, section: int):
    """Multi-voice ElevenLabs narration for one section (1-4) of a Full Mock
    listening test (MP3). The slug/section pair is checked against a fixed,
    checked-in content catalog — never arbitrary client text — so this can't
    be used to burn synthesis credits on anything but our own scripts."""
    if not get_settings().tts_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="TTS is not configured"
        )
    if section < 1 or section > 4:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown section")
    try:
        audio = await listening_audio.synthesize_section(slug, section)
    except tts.TtsError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Speech synthesis failed"
        )
    if audio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown test or section")
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "private, max-age=86400"},
    )
