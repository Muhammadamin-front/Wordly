"""Background job worker: `python -m scripts.worker`.

Runs beside the API as its own container. It polls rather than listens —
these jobs take tens of seconds and arrive a few per minute, so a one-second
poll costs nothing and removes a broker from the deployment.

SIGTERM finishes the job in hand before exiting, so a deploy never abandons
a half-scored essay: the row simply stays `running` until this process
commits it.
"""

import asyncio
import logging
import signal

from app.core.config import get_settings
from app.core.observability import capture_exception, init_sentry
from app.db.session import get_session_factory, init_engine
from app.models.jobs import AiJob
from app.services import job_queue
from app.services.ai_client import AiError
from app.services.job_handlers import HANDLERS, KINDS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("words.worker")

IDLE_SLEEP_SECONDS = 1.0
# Long enough for a slow model, short enough that a wedged provider call
# cannot hold a job (and a database transaction) open indefinitely.
JOB_TIMEOUT_SECONDS = 180

_stopping = asyncio.Event()


async def _run_once(session_factory) -> bool:
    """Claims and runs a single job. Returns False when the queue was empty."""
    async with session_factory() as db:
        job = await job_queue.claim(db, KINDS)
        if job is None:
            return False
        # Committing the claim before the work starts means a crash mid-job
        # leaves a visible `running` row rather than silently releasing it
        # back to another worker that would redo the AI call.
        await db.commit()
        job_id, kind = job.id, job.kind
        logger.info("job %s (%s) claimed, attempt %s", job_id, kind, job.attempts)

        handler = HANDLERS.get(kind)
        if handler is None:
            await job_queue.fail(db, job, f"unknown job kind: {kind}")
            await db.commit()
            return True

        try:
            result = await asyncio.wait_for(handler(db, job), JOB_TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            await db.rollback()
            await _mark_failed(session_factory, job_id, "AI service timed out")
        except (AiError, ValueError) as exc:
            await db.rollback()
            logger.warning("job %s failed: %s", job_id, exc)
            await _mark_failed(session_factory, job_id, "AI service error")
        except Exception as exc:  # noqa: BLE001 — the worker must not die on one job
            await db.rollback()
            logger.exception("job %s crashed", job_id)
            capture_exception(exc)
            await _mark_failed(session_factory, job_id, "internal error")
        else:
            await job_queue.complete(db, job, result)
            await db.commit()
            logger.info("job %s done", job_id)
        return True


async def _mark_failed(session_factory, job_id, message: str) -> None:
    """Records the failure in a fresh session: the one that ran the job was
    rolled back, so its objects can no longer be written through."""
    async with session_factory() as db:
        job = await db.get(AiJob, job_id)
        if job is None:
            return
        await job_queue.fail(db, job, message)
        await db.commit()


async def main() -> None:
    settings = get_settings()
    settings.validate_runtime()
    init_sentry()
    init_engine()
    session_factory = get_session_factory()
    logger.info("worker started for kinds: %s", ", ".join(KINDS))

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, _stopping.set)

    while not _stopping.is_set():
        try:
            worked = await _run_once(session_factory)
        except Exception as exc:  # noqa: BLE001 — a database blip must not end the worker
            logger.exception("worker loop error")
            capture_exception(exc)
            worked = False
        if not worked:
            try:
                await asyncio.wait_for(_stopping.wait(), IDLE_SLEEP_SECONDS)
            except asyncio.TimeoutError:
                pass

    logger.info("worker stopped")


if __name__ == "__main__":
    asyncio.run(main())
