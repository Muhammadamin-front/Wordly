import uuid

import pytest
from sqlalchemy import select

import app.db.session as db_session
from app.models.jobs import JOB_DONE, JOB_FAILED, JOB_QUEUED, JOB_RUNNING, AiJob
from app.models.user import User
from app.services import job_queue
from tests.conftest import register_user


async def _a_user_id(client) -> uuid.UUID:
    await register_user(client)
    async with db_session.get_session_factory()() as db:
        user = (await db.execute(select(User))).scalars().first()
        return user.id


async def test_enqueue_then_claim_then_complete(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        job = await job_queue.enqueue(db, user_id, "writing_score", {"essay": "hello"})
        await db.commit()
        job_id = job.id
        assert job.status == JOB_QUEUED

        claimed = await job_queue.claim(db, ("writing_score",))
        assert claimed is not None and claimed.id == job_id
        assert claimed.status == JOB_RUNNING
        assert claimed.attempts == 1

        # A second worker finds nothing left to take.
        assert await job_queue.claim(db, ("writing_score",)) is None

        await job_queue.complete(db, claimed, {"band_overall": 7.0})
        await db.commit()

    async with db_session.get_session_factory()() as db:
        stored = await db.get(AiJob, job_id)
        assert stored.status == JOB_DONE
        assert stored.result == {"band_overall": 7.0}
        assert stored.finished_at is not None


async def test_claim_ignores_other_kinds(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        await job_queue.enqueue(db, user_id, "something_else", {})
        await db.commit()
        assert await job_queue.claim(db, ("writing_score",)) is None


async def test_failure_requeues_until_the_attempt_limit(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        job = await job_queue.enqueue(db, user_id, "writing_score", {})
        await db.commit()

        for _ in range(job_queue.MAX_ATTEMPTS - 1):
            claimed = await job_queue.claim(db, ("writing_score",))
            assert claimed is not None
            await job_queue.fail(db, claimed, "AI service error")
            # Still retryable, so it goes back on the queue.
            assert claimed.status == JOB_QUEUED

        claimed = await job_queue.claim(db, ("writing_score",))
        await job_queue.fail(db, claimed, "AI service error")
        assert claimed.status == JOB_FAILED
        assert claimed.attempts == job_queue.MAX_ATTEMPTS
        await db.commit()

        # And it is never handed out again.
        assert await job_queue.claim(db, ("writing_score",)) is None


async def test_enqueue_rejects_more_than_the_in_flight_limit(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        for _ in range(job_queue.MAX_JOBS_IN_FLIGHT):
            await job_queue.enqueue(db, user_id, "writing_score", {})
        await db.commit()

        with pytest.raises(job_queue.TooManyJobs):
            await job_queue.enqueue(db, user_id, "writing_score", {})


async def test_get_is_scoped_to_the_owner(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        job = await job_queue.enqueue(db, user_id, "writing_score", {})
        await db.commit()

        assert (await job_queue.get(db, job.id, user_id)) is not None
        assert (await job_queue.get(db, job.id, uuid.uuid4())) is None


async def test_reading_someone_elses_job_is_a_404(client):
    user_id = await _a_user_id(client)
    async with db_session.get_session_factory()() as db:
        job = await job_queue.enqueue(db, user_id, "writing_score", {})
        await db.commit()
        job_id = job.id

    other = await register_user(client, email="other@example.uz", display_name="Other")
    response = await client.get(
        f"/api/v1/jobs/{job_id}",
        headers={"Authorization": f"Bearer {other['access_token']}"},
    )
    assert response.status_code == 404
