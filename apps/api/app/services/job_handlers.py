"""What the worker actually runs, one coroutine per job kind.

Each handler receives an open session and the job, and returns the JSON body
the client will read back from GET /jobs/{id}. Quota is charged here rather
than at enqueue time, so a job that never produced a result never costs the
learner an allowance — the same order the synchronous routes use.
"""

import uuid
from typing import Any, Awaitable, Callable, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.jobs import AiJob
from app.models.user import User
from app.schemas.ielts import writing_score_out
from app.services import ai_quota, ielts
from app.services.ai_client import get_ai_client

WRITING_SCORE = "writing_score"


async def _load_user(db: AsyncSession, user_id: uuid.UUID) -> User:
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if user is None:
        raise ValueError("job owner no longer exists")
    return user


async def _writing_score(db: AsyncSession, job: AiJob) -> dict[str, Any]:
    client = get_ai_client()
    if client is None:
        raise RuntimeError("no AI provider configured")
    user = await _load_user(db, job.user_id)
    payload = job.payload
    score = await ielts.score_writing(
        db,
        user,
        client,
        payload["task_type"],
        payload["prompt"],
        payload["essay"],
        lang=payload.get("lang") or "uz",
        mock_session_id=payload.get("mock_session_id"),
    )
    await ai_quota.consume(db, user)
    if payload.get("plan_code"):
        await ielts.log_writing_action(db, user.id, "essay")
    return writing_score_out(score).model_dump(mode="json")


HANDLERS: Dict[str, Callable[[AsyncSession, AiJob], Awaitable[dict[str, Any]]]] = {
    WRITING_SCORE: _writing_score,
}

KINDS: tuple[str, ...] = tuple(HANDLERS)
