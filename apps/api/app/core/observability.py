"""Safe, vendor-neutral operational logging plus optional Sentry reporting.

The structured log line is always written; Sentry only receives events when
SENTRY_DSN is configured. Sensitive request payloads and credentials never
enter either boundary.
"""

import json
import logging
from typing import Any, Mapping, Optional

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

SENSITIVE_KEY_PARTS = ("password", "token", "secret", "cookie", "authorization", "email", "phone")


def safe_context(context: Mapping[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}
    for key, value in context.items():
        if any(part in key.lower() for part in SENSITIVE_KEY_PARTS):
            continue
        if isinstance(value, (str, int, float, bool)) or value is None:
            cleaned[key] = value
    return cleaned


def _scrub_event(event: dict[str, Any], hint: Mapping[str, Any]) -> Optional[dict[str, Any]]:
    """Strip request bodies, cookies, and headers before Sentry ever sees them."""
    request = event.get("request")
    if isinstance(request, dict):
        request.pop("data", None)
        request.pop("cookies", None)
        headers = request.get("headers")
        if isinstance(headers, dict):
            for header in ("authorization", "cookie", "x-api-key"):
                headers.pop(header, None)
    event.pop("user", None)
    return event


def init_sentry(settings: Any) -> None:
    """Wire error reporting when SENTRY_DSN is set; a no-op otherwise."""
    if not settings.sentry_enabled:
        return
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[StarletteIntegration(), FastApiIntegration()],
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        send_default_pii=False,
        before_send=_scrub_event,
    )


def capture_exception(logger: logging.Logger, event: str, error: Exception, **context: Any) -> None:
    """Emit non-sensitive error context to logs and, if configured, Sentry."""
    safe = safe_context(context)
    logger.error(
        "event=%s error_type=%s context=%s",
        event,
        type(error).__name__,
        json.dumps(safe, sort_keys=True, default=str),
    )
    client = sentry_sdk.get_client()
    if client.is_active():
        with sentry_sdk.new_scope() as scope:
            scope.set_tag("event", event)
            for key, value in safe.items():
                scope.set_extra(key, value)
            sentry_sdk.capture_exception(error)
