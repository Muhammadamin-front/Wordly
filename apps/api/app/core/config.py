from collections import Counter
from functools import lru_cache
from ipaddress import IPv4Network, IPv6Network, ip_network
from math import log2
from typing import List, Literal, Optional, Tuple, Union
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_SECRET_KEY = "dev-only-secret-change-me"
MIN_PRODUCTION_SECRET_LENGTH = 48
MIN_PRODUCTION_SECRET_ENTROPY_BITS = 192.0
KNOWN_INSECURE_SECRET_KEYS = frozenset(
    {
        "",
        DEV_SECRET_KEY,
        "compose-dev-secret-change-me-32-bytes!",
        "test-secret-key-with-at-least-32-bytes!!",
    }
)
SECRET_PLACEHOLDER_MARKERS = (
    "change-me",
    "changeme",
    "generate-with",
    "python -c",
    "replace-with",
    "<python",
    "<secret",
)


def estimated_secret_entropy_bits(secret: str) -> float:
    """Conservative Shannon estimate used to reject obvious repeated patterns."""
    counts = Counter(secret)
    length = len(secret)
    if length == 0:
        return 0.0
    entropy_per_character = -sum(
        (count / length) * log2(count / length) for count in counts.values()
    )
    return entropy_per_character * length


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Vocora API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # development | test | production
    API_V1_PREFIX: str = "/api/v1"

    # Development has a predictable fallback for zero-setup local runs.
    # validate_runtime() rejects it and weak/placeholder values in production.
    SECRET_KEY: str = DEV_SECRET_KEY
    ACCESS_TOKEN_TTL_SECONDS: int = 15 * 60
    REFRESH_TOKEN_TTL_SECONDS: int = 30 * 24 * 3600
    EMAIL_TOKEN_TTL_SECONDS: int = 24 * 3600
    RESET_TOKEN_TTL_SECONDS: int = 30 * 60
    BCRYPT_ROUNDS: int = 12

    # The only account the "admin"/"super_admin" roles can ever be granted to
    # or held by — enforced in api.v1.admin's set_role, not just a default.
    # A single hardcoded owner account rather than a general admin-invite
    # system, by explicit product decision.
    SOLE_ADMIN_EMAIL: str = "berdullayev@gmail.com"

    # Storage
    DATABASE_URL: str = "sqlite+aiosqlite:///./words_dev.db"
    REDIS_URL: Optional[str] = None  # e.g. redis://localhost:6379/0

    # Web
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    FRONTEND_ORIGINS: Optional[str] = None
    COOKIE_SECURE: bool = False  # True in production (HTTPS)
    COOKIE_DOMAIN: Optional[str] = None

    # Transactional email. Console is intentionally limited to development and
    # tests; production must use a real provider and a verified sender.
    EMAIL_PROVIDER: Literal["console", "resend"] = "console"
    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    EMAIL_REPLY_TO: Optional[str] = None

    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    APPLE_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    TELEGRAM_BOT_TOKEN: Optional[str] = None

    # AI. Features are disabled gracefully when no provider key is configured.
    AI_MAX_TOKENS: int = 1024
    AI_FREE_DAILY_QUOTA: int = 5  # AI actions/day on the free tier
    AI_PREMIUM_DAILY_QUOTA: int = 200  # effectively unlimited for a human

    # Fallback LLM (Google Gemini). When the primary provider runs out of
    # credits or errors, the chain fails over silently (see services/ai_client).
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"

    # AWS Bedrock (Converse API via a Bedrock API key / bearer token). Region +
    # model are configurable; the model must be enabled on the AWS account.
    BEDROCK_API_KEY: Optional[str] = None
    BEDROCK_REGION: str = "us-east-1"
    BEDROCK_MODEL: str = ""

    @property
    def ai_enabled(self) -> bool:
        return bool((self.BEDROCK_API_KEY and self.BEDROCK_MODEL) or self.GEMINI_API_KEY)

    # Text-to-speech (ElevenLabs). Pronunciation audio is proxied through the
    # API (the key never reaches the browser) and disk-cached, so each unique
    # text costs ElevenLabs credits exactly once. Off when unset — listening
    # UIs show a retry state rather than degrading to a robotic browser voice.
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "pNInz6obpgDQGcFmaJgB"  # "Adam" — free-tier OK
    # Second speaker for multi-voice content (Full Mock listening dialogues).
    # Unset = every role collapses onto ELEVENLABS_VOICE_ID (single-voice
    # fallback), so this stays optional without breaking anything.
    ELEVENLABS_VOICE_ID_B: Optional[str] = "EXAVITQu4vr4xnSDxMaL"  # "Bella"
    # One voice per AI Speaking Coach character (real-time voice mode). Unset
    # = that character falls back to ELEVENLABS_VOICE_ID, same graceful-
    # degradation pattern as ELEVENLABS_VOICE_ID_B above.
    ELEVENLABS_VOICE_ID_GORDON: Optional[str] = None
    ELEVENLABS_VOICE_ID_MOCHI: Optional[str] = None
    ELEVENLABS_VOICE_ID_ALEX: Optional[str] = None
    ELEVENLABS_VOICE_ID_EXAMINER: Optional[str] = None
    ELEVENLABS_VOICE_ID_RAJ: Optional[str] = None
    ELEVENLABS_MODEL: str = "eleven_flash_v2_5"
    ELEVENLABS_OUTPUT_FORMAT: str = "mp3_44100_128"
    # Delivery rate, 0.7-1.2 at the provider. Word pronunciation is fine at
    # normal speed; the mock listening test is not — a learner has to hear a
    # spelled-out name well enough to write it down, and the real exam is
    # noticeably slower than the default synthesis.
    ELEVENLABS_SPEED: float = 1.0
    ELEVENLABS_LISTENING_SPEED: float = 0.88
    ELEVENLABS_STABILITY: float = 0.42
    ELEVENLABS_SIMILARITY_BOOST: float = 0.82
    ELEVENLABS_STYLE: float = 0.16
    ELEVENLABS_USE_SPEAKER_BOOST: bool = True
    TTS_CACHE_DIR: str = "./tts_cache"
    TTS_MAX_TEXT_LENGTH: int = 200
    # Word pronunciations are single words, disk-cached after first synthesis,
    # so browsing a vocabulary list shouldn't hit a wall. Generous limit.
    RATE_LIMIT_TTS: str = "120/60"
    # /tts/word needs no sign-in, so this is the only cost control on an
    # anonymous caller — deliberately tighter than the signed-in limit.
    RATE_LIMIT_TTS_GUEST: str = "20/60"
    # A full listening attempt is 4 requests (one per section); this allows
    # roughly 10 attempts/hour/user, generous for retries after a failure.
    RATE_LIMIT_MOCK_LISTENING_AUDIO: str = "40/3600"

    @property
    def tts_enabled(self) -> bool:
        return bool(self.ELEVENLABS_API_KEY)

    # Speech-to-text (Deepgram). Streaming STT for real-time voice conversation.
    DEEPGRAM_API_KEY: Optional[str] = None

    @property
    def deepgram_enabled(self) -> bool:
        return bool(self.DEEPGRAM_API_KEY)

    # Call recording & analysis (Fireflies). Optional: records speaking sessions for review.
    FIREFLIES_API_KEY: Optional[str] = None

    # Serper (Google Images) — used by scripts/enrich_images.py to attach a
    # representative picture to corpus words. Never exposed to clients.
    SERPER_API_KEY: Optional[str] = None

    # Payments (Uzbek rails). Merchant creds are injected in production; the
    # gateway endpoints run without them but reject unsigned/unauth'd calls.
    PAYME_MERCHANT_ID: Optional[str] = None
    PAYME_MERCHANT_KEY: Optional[str] = None
    PAYME_CHECKOUT_URL: str = "https://checkout.paycom.uz"
    CLICK_SERVICE_ID: Optional[str] = None
    CLICK_MERCHANT_ID: Optional[str] = None
    CLICK_SECRET_KEY: Optional[str] = None
    CLICK_CHECKOUT_URL: str = "https://my.click.uz/services/pay"
    # Uzum Checkout hosted payment form. These values are issued by Uzum Bank
    # to a merchant; they never reach a browser or native app.
    UZUM_TERMINAL_ID: Optional[str] = None
    UZUM_API_KEY: Optional[str] = None
    UZUM_WEBHOOK_SECRET: Optional[str] = None
    UZUM_API_BASE_URL: str = "https://developer.uzumbank.uz/api/v1"
    # Dev/demo only: lets a user self-activate premium without a real gateway.
    PAYMENTS_SANDBOX: bool = True
    REFERRAL_REWARD_DAYS: int = 30

    @property
    def payme_enabled(self) -> bool:
        return bool(self.PAYME_MERCHANT_ID and self.PAYME_MERCHANT_KEY)

    @property
    def click_enabled(self) -> bool:
        return bool(
            self.CLICK_SERVICE_ID and self.CLICK_MERCHANT_ID and self.CLICK_SECRET_KEY
        )

    @property
    def uzum_enabled(self) -> bool:
        # The opaque callback token is part of the merchant callback URL. It
        # prevents a random internet client from making us query an order.
        return bool(self.UZUM_TERMINAL_ID and self.UZUM_API_KEY and self.UZUM_WEBHOOK_SECRET)

    @property
    def payment_sandbox_enabled(self) -> bool:
        return self.PAYMENTS_SANDBOX and self.ENVIRONMENT != "production"

    # Rate limits: "<max_requests>/<window_seconds>"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN: str = "10/60"
    # Registration answers "is this email taken?" with a 409, which is the
    # honest UX (a learner needs to know they already have an account) but is
    # also an enumeration oracle. The window is deliberately long rather than
    # the response made vague: 20 attempts an hour is far more than a real
    # signup needs and far less than a list is worth harvesting with.
    RATE_LIMIT_REGISTER: str = "20/3600"
    RATE_LIMIT_FORGOT_PASSWORD: str = "3/60"
    RATE_LIMIT_RESEND_VERIFICATION: str = "3/60"
    RATE_LIMIT_AI: str = "20/60"  # AI calls are expensive (tokens + latency)
    RATE_LIMIT_GAMES: str = "90/60"  # a session + rapid answers
    RATE_LIMIT_SOCIAL: str = "30/60"  # friend requests / profile lookups
    RATE_LIMIT_MULTIPLAYER: str = "20/60"  # room creation
    RATE_LIMIT_WS_CONNECT: str = "20/60"  # handshake attempts, per IP — before any auth/action
    RATE_LIMIT_DEFAULT: str = "120/60"
    # Grace window a disconnected multiplayer player has to reconnect (same
    # user_id, idempotent `join`) before they're actually removed and, if
    # they were host, the role transfers to the next player.
    MULTIPLAYER_RECONNECT_GRACE_SECONDS: int = 25
    # Absolute cap on a room's Redis TTL — well past any real game's length,
    # just a backstop against an abandoned room lingering forever.
    MULTIPLAYER_ROOM_TTL_SECONDS: int = 2 * 60 * 60

    # Word Chain is server-authoritative. These values are kept with the
    # multiplayer settings so operators can tune pacing without deploying a
    # new API build. Public online matching always uses at least two humans;
    # bots remain available only in explicitly created private rooms.
    WORD_CHAIN_STARTING_TIME: int = 15
    WORD_CHAIN_TIME_DECREASE_PER_ROUND: int = 1
    WORD_CHAIN_MINIMUM_TIME: int = 5
    WORD_CHAIN_MIN_PLAYERS: int = 2
    WORD_CHAIN_MAX_PLAYERS: int = 8
    WORD_CHAIN_MINIMUM_WORD_LENGTH: int = 3
    WORD_CHAIN_DIFFICULT_LETTER_THRESHOLD: int = 15
    WORD_CHAIN_LIVES_PER_PLAYER: int = 2
    WORD_CHAIN_STREAK_BONUS_THRESHOLD: int = 3
    WORD_CHAIN_STREAK_TIME_BONUS: int = 2
    WORD_CHAIN_BOT_MIN_DELAY: float = 1.0
    WORD_CHAIN_BOT_MAX_DELAY: float = 5.0
    WORD_CHAIN_BOT_ENABLED: bool = True
    # A private room can survive longer than an invite. This keeps a stale
    # message from looking actionable after the host has moved on.
    WORD_CHAIN_INVITATION_TTL_SECONDS: int = 30 * 60
    # Comma-separated IPs/CIDRs of reverse proxies allowed to supply
    # X-Forwarded-For. Empty means forwarded headers are never trusted.
    TRUSTED_PROXY_CIDRS: str = ""

    @property
    def trusted_proxy_networks(
        self,
    ) -> Tuple[Union[IPv4Network, IPv6Network], ...]:
        return tuple(
            ip_network(value.strip(), strict=False)
            for value in self.TRUSTED_PROXY_CIDRS.split(",")
            if value.strip()
        )

    # Database pool, per uvicorn worker. See init_engine() for the ceiling
    # this implies on Postgres connections.
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # Response cache (public corpus reads). TTLs in seconds.
    CACHE_ENABLED: bool = True
    CACHE_TTL_CATEGORIES: int = 300
    CACHE_TTL_WORDS: int = 60
    CACHE_TTL_WORD_DETAIL: int = 120

    # Hardening & observability
    MAX_REQUEST_BYTES: int = 5 * 1024 * 1024  # reject oversized bodies (413)
    HSTS_MAX_AGE: int = 63072000  # 2 years; sent only in production (HTTPS)
    SLOW_REQUEST_MS: int = 1000  # log a warning above this

    # Bearer token for GET /api/v1/metrics. Unset (the default) and the route
    # returns 404: an unwatched endpoint is not worth exposing.
    METRICS_TOKEN: Optional[str] = None

    # Error tracking (Sentry). Unset = errors stay in application logs only.
    SENTRY_DSN: Optional[str] = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.0  # 0..1; performance tracing is opt-in

    @property
    def sentry_enabled(self) -> bool:
        return bool(self.SENTRY_DSN)

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_ORIGIN.strip().rstrip("/")]
        if self.FRONTEND_ORIGINS:
            origins.extend(
                origin.strip().rstrip("/")
                for origin in self.FRONTEND_ORIGINS.split(",")
                if origin.strip()
            )
        if self.ENVIRONMENT == "development":
            origins.extend(
                [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:3002",
                    "http://localhost:3006",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                    "http://127.0.0.1:3002",
                    "http://127.0.0.1:3006",
                ]
            )
        return list(dict.fromkeys(origins))

    def validate_cors_origins(self) -> None:
        """Reject CORS values that would weaken credentialed browser auth."""
        for origin in self.cors_origins:
            parsed = urlparse(origin)
            if (
                origin == "*"
                or parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.path
                or parsed.params
                or parsed.query
                or parsed.fragment
                or parsed.username
                or parsed.password
            ):
                raise RuntimeError("CORS origins must be exact scheme-and-host origins")
            if self.ENVIRONMENT == "production" and parsed.scheme != "https":
                raise RuntimeError("CORS origins must use HTTPS in production")

    def validate_runtime(self) -> None:
        try:
            trusted_proxy_networks = self.trusted_proxy_networks
        except ValueError as exc:
            raise RuntimeError(
                "TRUSTED_PROXY_CIDRS contains an invalid IP or CIDR"
            ) from exc

        if any(network.prefixlen == 0 for network in trusted_proxy_networks):
            raise RuntimeError("TRUSTED_PROXY_CIDRS must not trust every IP address")

        self.validate_cors_origins()

        if self.ENVIRONMENT != "production":
            return

        secret = self.SECRET_KEY.strip()
        lower_secret = secret.lower()

        if (
            secret in KNOWN_INSECURE_SECRET_KEYS
            or secret.startswith("<")
            or any(marker in lower_secret for marker in SECRET_PLACEHOLDER_MARKERS)
        ):
            raise RuntimeError(
                "SECRET_KEY must be replaced with a generated production secret"
            )

        if len(secret) < MIN_PRODUCTION_SECRET_LENGTH:
            raise RuntimeError(
                "SECRET_KEY must be at least {} characters in production".format(
                    MIN_PRODUCTION_SECRET_LENGTH
                )
            )

        if estimated_secret_entropy_bits(secret) < MIN_PRODUCTION_SECRET_ENTROPY_BITS:
            raise RuntimeError("SECRET_KEY must be a high-entropy production secret")

        if not self.COOKIE_SECURE:
            raise RuntimeError("COOKIE_SECURE must be true in production")

        if not self.REDIS_URL:
            raise RuntimeError("REDIS_URL is required in production for shared rate limits and caching")

        if self.EMAIL_PROVIDER != "resend" or not self.RESEND_API_KEY or not self.EMAIL_FROM:
            raise RuntimeError(
                "A configured Resend sender is required in production for account emails"
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
