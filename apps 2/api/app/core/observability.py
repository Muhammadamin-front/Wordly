"""Safe, vendor-neutral operational logging.

Deployments can forward this structured application log to Sentry, Datadog, or
their platform collector. Sensitive request payloads and credentials never
enter this boundary.
"""

import json
import logging
from typing import Any, Mapping


SENSITIVE_KEY_PARTS = ("password", "token", "secret", "cookie", "authorization", "email", "phone")


def safe_context(context: Mapping[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}
    for key, value in context.items():
        if any(part in key.lower() for part in SENSITIVE_KEY_PARTS):
            continue
        if isinstance(value, (str, int, float, bool)) or value is None:
            cleaned[key] = value
    return cleaned


def capture_exception(logger: logging.Logger, event: str, error: Exception, **context: Any) -> None:
    """Emit useful, non-sensitive error context for centralized log collectors."""
    logger.error(
        "event=%s error_type=%s context=%s",
        event,
        type(error).__name__,
        json.dumps(safe_context(context), sort_keys=True, default=str),
    )
