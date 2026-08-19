"""Verification of the Telegram Login Widget's signed callback payload.

Unlike Google/Apple/GitHub, there is no token endpoint to call: Telegram
signs the returned fields itself using HMAC-SHA256 keyed by SHA256(bot
token), and the backend only needs to recompute that signature and compare.
See https://core.telegram.org/widgets/login#checking-authorization.
"""

import hashlib
import hmac
import time
from typing import Optional

from pydantic import BaseModel

from app.core.config import get_settings

AUTH_MAX_AGE_SECONDS = 24 * 60 * 60


class TelegramIdentity(BaseModel):
    sub: str
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None


class TelegramVerifier:
    """Overridden in tests through FastAPI dependency injection.

    Takes the bot token as a constructor argument (defaulting to the
    configured one) rather than reading `get_settings()` inside `verify`,
    so a test can exercise the real HMAC check against a known token
    without mutating global env/settings state.
    """

    def __init__(self, bot_token: Optional[str] = None) -> None:
        self._bot_token = bot_token if bot_token is not None else get_settings().TELEGRAM_BOT_TOKEN

    def verify(self, fields: dict) -> Optional[TelegramIdentity]:
        if not self._bot_token:
            return None
        received_hash = fields.get("hash")
        if not received_hash:
            return None

        check_fields = {
            str(k): str(v) for k, v in fields.items() if k != "hash" and v is not None
        }
        if "id" not in check_fields or "auth_date" not in check_fields:
            return None

        data_check_string = "\n".join(f"{k}={check_fields[k]}" for k in sorted(check_fields))
        secret_key = hashlib.sha256(self._bot_token.encode()).digest()
        computed_hash = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(computed_hash, str(received_hash)):
            return None

        try:
            auth_date = int(check_fields["auth_date"])
        except ValueError:
            return None
        if time.time() - auth_date > AUTH_MAX_AGE_SECONDS:
            return None  # a stale, possibly-replayed link

        first_name = check_fields.get("first_name")
        if not first_name:
            return None
        return TelegramIdentity(
            sub=check_fields["id"],
            first_name=first_name,
            last_name=check_fields.get("last_name"),
            username=check_fields.get("username"),
            photo_url=check_fields.get("photo_url"),
        )


def get_telegram_verifier() -> TelegramVerifier:
    return TelegramVerifier()
