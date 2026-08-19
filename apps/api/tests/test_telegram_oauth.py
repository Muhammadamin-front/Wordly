import hashlib
import hmac
import time
from typing import Optional

from app.main import app
from app.services.telegram_oauth import TelegramIdentity, TelegramVerifier, get_telegram_verifier
from tests.conftest import register_user

BOT_TOKEN = "123456:test-bot-token-not-real"


def sign(fields: dict) -> dict:
    """Builds a valid Telegram callback payload the way Telegram itself
    would: HMAC-SHA256 over the sorted `key=value` fields, keyed by
    SHA256(bot token). Written independently of TelegramVerifier's own
    implementation, so a bug on either side shows up as a mismatch."""
    check_string = "\n".join(f"{k}={v}" for k, v in sorted(fields.items()))
    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    digest = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return {**fields, "hash": digest}


def test_verifier_accepts_a_correctly_signed_payload():
    fields = sign({"id": "778899", "first_name": "Jasur", "auth_date": str(int(time.time()))})
    identity = TelegramVerifier(bot_token=BOT_TOKEN).verify(fields)
    assert identity is not None
    assert identity.sub == "778899"
    assert identity.first_name == "Jasur"


def test_verifier_rejects_a_tampered_field():
    fields = sign({"id": "778899", "first_name": "Jasur", "auth_date": str(int(time.time()))})
    fields["first_name"] = "NotJasur"  # tampered after signing
    assert TelegramVerifier(bot_token=BOT_TOKEN).verify(fields) is None


def test_verifier_rejects_a_wrong_bot_token():
    fields = sign({"id": "778899", "first_name": "Jasur", "auth_date": str(int(time.time()))})
    assert TelegramVerifier(bot_token="000000:a-different-bot-token").verify(fields) is None


def test_verifier_rejects_a_stale_auth_date():
    stale = str(int(time.time()) - 25 * 60 * 60)  # 25h old
    fields = sign({"id": "778899", "first_name": "Jasur", "auth_date": stale})
    assert TelegramVerifier(bot_token=BOT_TOKEN).verify(fields) is None


def test_verifier_rejects_when_no_bot_token_is_configured():
    fields = sign({"id": "778899", "first_name": "Jasur", "auth_date": str(int(time.time()))})
    assert TelegramVerifier(bot_token=None).verify(fields) is None


class FakeVerifier(TelegramVerifier):
    def __init__(self, identity: Optional[TelegramIdentity]) -> None:
        self._identity = identity

    def verify(self, fields: dict) -> Optional[TelegramIdentity]:
        return self._identity


IDENTITY = TelegramIdentity(sub="778899", first_name="Jasur", username="jasur_uz")


def use_verifier(identity: Optional[TelegramIdentity]) -> None:
    app.dependency_overrides[get_telegram_verifier] = lambda: FakeVerifier(identity)


REQUEST_BODY = {"id": "778899", "first_name": "Jasur", "auth_date": "1700000000", "hash": "x" * 20}


async def test_telegram_login_creates_a_user_with_a_synthetic_email(client):
    use_verifier(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/telegram", json=REQUEST_BODY)
        assert response.status_code == 200, response.text
        user = response.json()["user"]
        assert user["email"] == "telegram-778899@users.vocora.uz"
        assert user["profile"]["display_name"] == "Jasur"
    finally:
        app.dependency_overrides.clear()


async def test_telegram_login_is_stable_across_repeat_sign_ins(client):
    use_verifier(IDENTITY)
    try:
        first = await client.post("/api/v1/auth/telegram", json=REQUEST_BODY)
        second = await client.post("/api/v1/auth/telegram", json=REQUEST_BODY)
        assert first.json()["user"]["id"] == second.json()["user"]["id"]
    finally:
        app.dependency_overrides.clear()


async def test_telegram_login_rejects_invalid_payload(client):
    use_verifier(None)
    try:
        response = await client.post("/api/v1/auth/telegram", json=REQUEST_BODY)
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


async def test_telegram_synthetic_email_does_not_collide_with_a_real_account(client):
    # A coincidental real signup at the synthetic address must not let a
    # Telegram sign-in silently take over that account.
    await register_user(client, email="telegram-778899@users.vocora.uz")
    use_verifier(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/telegram", json=REQUEST_BODY)
        assert response.status_code == 409, response.text
    finally:
        app.dependency_overrides.clear()
