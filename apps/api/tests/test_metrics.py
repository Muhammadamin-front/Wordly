"""The metrics endpoint is invisible unless a token is configured, and refuses
anything that is not that token."""
from app.core.config import get_settings


async def test_metrics_is_absent_without_a_token(client):
    settings = get_settings()
    settings.METRICS_TOKEN = None
    assert (await client.get("/api/v1/metrics")).status_code == 404


async def test_metrics_rejects_a_wrong_token(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "METRICS_TOKEN", "s3cret-token-value")
    unauthorized = await client.get(
        "/api/v1/metrics", headers={"Authorization": "Bearer wrong"}
    )
    assert unauthorized.status_code == 401


async def test_metrics_reports_the_numbers_worth_watching(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "METRICS_TOKEN", "s3cret-token-value")
    response = await client.get(
        "/api/v1/metrics", headers={"Authorization": "Bearer s3cret-token-value"}
    )
    assert response.status_code == 200
    body = response.text
    for metric in (
        "vocora_uptime_seconds",
        "vocora_db_pool_checked_out",
        "vocora_jobs_queued",
        "vocora_jobs_running",
    ):
        assert metric in body


async def test_requests_work_without_a_lifespan_startup(client):
    """The latency window is part of the app, not of a successful startup.

    It used to be created in the lifespan, which the test client never runs,
    so the timing middleware raised on every single request and the whole
    suite went red. Any endpoint answering here proves it is set at
    construction instead."""
    assert (await client.get("/health")).status_code == 200
