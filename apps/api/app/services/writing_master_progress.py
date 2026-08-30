"""Server-side sync for Master Writing curriculum progress — a direct mirror
of services/grammar_progress.py's merge/idempotency semantics, one row per
(user, unit) instead of per lesson. See that module for the reasoning behind
max-attempts/max-best-score merging and the attempt-receipt idempotency key."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.user import User
from app.models.writing_master import WritingMasterAttemptReceipt, WritingMasterProgress
from app.schemas.writing_master import WritingMasterProgressEntryIn


def _naive_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


async def list_progress(db: AsyncSession, user: User) -> list[WritingMasterProgress]:
    rows = await db.scalars(
        select(WritingMasterProgress)
        .where(WritingMasterProgress.user_id == user.id)
        .order_by(WritingMasterProgress.updated_at.desc(), WritingMasterProgress.unit_slug)
    )
    return list(rows)


async def _lock_account(db: AsyncSession, user: User) -> None:
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())


async def merge_legacy_progress(
    db: AsyncSession, user: User, entries: list[WritingMasterProgressEntryIn]
) -> list[WritingMasterProgress]:
    await _lock_account(db, user)
    current = {row.unit_slug: row for row in await list_progress(db, user)}
    for incoming in entries:
        incoming_updated = min(_naive_utc(incoming.updated_at), utcnow())
        row = current.get(incoming.unit_slug)
        if row is None:
            row = WritingMasterProgress(
                user_id=user.id,
                unit_slug=incoming.unit_slug,
                attempts=incoming.attempts,
                best_score=incoming.best_score,
                last_score=incoming.last_score,
                updated_at=incoming_updated,
            )
            db.add(row)
            current[incoming.unit_slug] = row
            continue
        row.attempts = max(row.attempts, incoming.attempts)
        row.best_score = max(row.best_score, incoming.best_score)
        if incoming_updated > row.updated_at:
            row.last_score = incoming.last_score
            row.updated_at = incoming_updated
    await db.flush()
    return sorted(current.values(), key=lambda row: (row.updated_at, row.unit_slug), reverse=True)


async def record_attempt(
    db: AsyncSession, user: User, *, attempt_id: UUID, unit_slug: str, score: int,
) -> WritingMasterProgress:
    await _lock_account(db, user)
    receipt = await db.get(WritingMasterAttemptReceipt, attempt_id)
    if receipt is not None:
        row = await db.get(WritingMasterProgress, (user.id, receipt.unit_slug))
        if receipt.user_id != user.id or row is None:
            raise ValueError("Attempt id is already owned by another account")
        return row

    row = await db.scalar(
        select(WritingMasterProgress)
        .where(
            WritingMasterProgress.user_id == user.id,
            WritingMasterProgress.unit_slug == unit_slug,
        )
        .with_for_update()
    )
    now = utcnow()
    if row is None:
        row = WritingMasterProgress(
            user_id=user.id, unit_slug=unit_slug, attempts=1, best_score=score,
            last_score=score, updated_at=now,
        )
        db.add(row)
    else:
        row.attempts += 1
        row.best_score = max(row.best_score, score)
        row.last_score = score
        row.updated_at = now
    db.add(
        WritingMasterAttemptReceipt(
            attempt_id=attempt_id, user_id=user.id, unit_slug=unit_slug, score=score,
        )
    )
    await db.flush()
    return row
