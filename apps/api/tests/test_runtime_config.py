import pytest

from app.core.config import Settings, estimated_secret_entropy_bits

VALID_PRODUCTION_SECRET = (
    "G8vQ2mN7xR4kT9pL6sW1cD5fH0jB3yU8aE2zK7nM4qP9tV6wX1rC5gS0"
)


def production_settings(secret_key: str) -> Settings:
    return Settings(
        _env_file=None,
        ENVIRONMENT="production",
        FRONTEND_ORIGIN="https://vocora.uz",
        SECRET_KEY=secret_key,
        EMAIL_PROVIDER="resend",
        RESEND_API_KEY="re_production",
        EMAIL_FROM="Wordly <noreply@words.uz>",
        COOKIE_SECURE=True,
        REDIS_URL="redis://redis:6379/0",
    )


@pytest.mark.parametrize(
    "secret_key",
    [
        "dev-only-secret-change-me",
        "compose-dev-secret-change-me-32-bytes!",
        "test-secret-key-with-at-least-32-bytes!!",
        "generate-with:python -c secrets.token_urlsafe(48)",
        "<paste-generated-output>",
    ],
)
def test_production_rejects_known_or_placeholder_secrets(secret_key):
    with pytest.raises(RuntimeError, match="generated production secret"):
        production_settings(secret_key).validate_runtime()


def test_production_rejects_short_secret():
    with pytest.raises(RuntimeError, match="at least 48 characters"):
        production_settings("short-but-otherwise-varied-123").validate_runtime()


def test_production_rejects_low_entropy_secret():
    with pytest.raises(RuntimeError, match="high-entropy"):
        production_settings("abcd" * 16).validate_runtime()


def test_production_accepts_generated_secret():
    assert estimated_secret_entropy_bits(VALID_PRODUCTION_SECRET) >= 192
    production_settings(VALID_PRODUCTION_SECRET).validate_runtime()


def test_production_requires_secure_cookie_and_redis():
    settings = production_settings(VALID_PRODUCTION_SECRET)
    settings.COOKIE_SECURE = False
    with pytest.raises(RuntimeError, match="COOKIE_SECURE"):
        settings.validate_runtime()

    settings.COOKIE_SECURE = True
    settings.REDIS_URL = None
    with pytest.raises(RuntimeError, match="REDIS_URL"):
        settings.validate_runtime()


@pytest.mark.parametrize(
    ("trusted_proxies", "message"),
    [
        ("10.0.0.0/8,not-a-network", "invalid IP or CIDR"),
        ("0.0.0.0/0", "must not trust every IP address"),
    ],
)
def test_runtime_rejects_unsafe_trusted_proxy_cidr(trusted_proxies, message):
    settings = production_settings(VALID_PRODUCTION_SECRET)
    settings.TRUSTED_PROXY_CIDRS = trusted_proxies

    with pytest.raises(RuntimeError, match=message):
        settings.validate_runtime()
