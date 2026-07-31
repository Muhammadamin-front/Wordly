import json
import logging

import httpx
import pytest

from app.core.config import Settings
from app.services.emailer import (
    ConsoleEmailer,
    EmailDeliveryError,
    RESEND_EMAILS_URL,
    ResendEmailer,
)


async def test_console_emailer_never_logs_message_body(caplog):
    caplog.set_level(logging.INFO, logger="words.emailer")
    emailer = ConsoleEmailer()

    await emailer.send("learner@example.uz", "Verify", "secret-token-123")

    assert "secret-token-123" not in caplog.text
    assert ConsoleEmailer.outbox[-1]["body"] == "secret-token-123"


async def test_resend_emailer_uses_provider_contract():
    async def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == RESEND_EMAILS_URL
        assert request.headers["Authorization"] == "Bearer re_test"
        assert json.loads(request.content) == {
            "from": "Wordly <noreply@words.uz>",
            "to": ["learner@example.uz"],
            "subject": "Verify",
            "text": "Open the verification link",
            "reply_to": "support@words.uz",
        }
        return httpx.Response(200, json={"id": "email_123"})

    emailer = ResendEmailer(
        api_key="re_test",
        sender="Wordly <noreply@words.uz>",
        reply_to="support@words.uz",
        transport=httpx.MockTransport(handler),
    )

    await emailer.send("learner@example.uz", "Verify", "Open the verification link")


async def test_resend_emailer_masks_provider_error():
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(422, json={"message": "provider detail"})

    emailer = ResendEmailer(
        api_key="re_test",
        sender="Wordly <noreply@words.uz>",
        transport=httpx.MockTransport(handler),
    )

    with pytest.raises(EmailDeliveryError, match="Email delivery failed"):
        await emailer.send("learner@example.uz", "Verify", "secret-token-123")


def test_production_requires_real_email_provider():
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        SECRET_KEY="production-secret-with-at-least-32-bytes",
        EMAIL_PROVIDER="console",
    )

    with pytest.raises(RuntimeError, match="EMAIL_PROVIDER"):
        settings.validate_runtime()


def test_production_accepts_complete_resend_configuration():
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        SECRET_KEY="production-secret-with-at-least-32-bytes",
        EMAIL_PROVIDER="resend",
        RESEND_API_KEY="re_production",
        EMAIL_FROM="Wordly <noreply@words.uz>",
    )

    settings.validate_runtime()
