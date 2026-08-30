"""Master Writing curriculum progress sync — a direct mirror of
api/v1/grammar_progress.py, one row per unit instead of per lesson."""
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.writing_master import (
    WritingMasterAttemptRequest,
    WritingMasterProgressEntryOut,
    WritingMasterProgressOut,
    WritingMasterProgressSyncRequest,
)
from app.services import subscriptions, writing_master_progress
from app.services.plans import FREE_WRITING_MASTER_UNITS

router = APIRouter(
    prefix="/me/writing-master-progress",
    tags=["writing-master-progress"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("default"))],
)


def _out(rows) -> WritingMasterProgressOut:
    return WritingMasterProgressOut(
        entries=[
            WritingMasterProgressEntryOut(
                unit_slug=row.unit_slug,
                attempts=row.attempts,
                best_score=row.best_score,
                last_score=row.last_score,
                updated_at=row.updated_at.replace(tzinfo=timezone.utc),
            )
            for row in rows
        ]
    )


@router.get("", response_model=WritingMasterProgressOut)
async def get_progress(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return _out(await writing_master_progress.list_progress(db, user))


@router.post("/sync", response_model=WritingMasterProgressOut)
async def sync_progress(
    payload: WritingMasterProgressSyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Silently drop entries for units this account can no longer prove access
    # to (e.g. a lapsed subscription) rather than 402ing a routine sync —
    # this endpoint uploads a whole snapshot, not one deliberate action.
    allowed = set(FREE_WRITING_MASTER_UNITS)
    if await subscriptions.is_premium(db, user):
        entries = payload.entries
    else:
        entries = [e for e in payload.entries if e.unit_slug in allowed]
    rows = await writing_master_progress.merge_legacy_progress(db, user, entries)
    await db.commit()
    return _out(rows)


@router.post("/attempt", response_model=WritingMasterProgressEntryOut)
async def record_attempt(
    payload: WritingMasterAttemptRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.unit_slug not in FREE_WRITING_MASTER_UNITS and not await subscriptions.is_premium(
        db, user
    ):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="This Master Writing unit requires Premium",
        )
    try:
        row = await writing_master_progress.record_attempt(
            db, user,
            attempt_id=payload.attempt_id, unit_slug=payload.unit_slug, score=payload.score,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    await db.commit()
    return WritingMasterProgressEntryOut(
        unit_slug=row.unit_slug,
        attempts=row.attempts,
        best_score=row.best_score,
        last_score=row.last_score,
        updated_at=row.updated_at.replace(tzinfo=timezone.utc),
    )
