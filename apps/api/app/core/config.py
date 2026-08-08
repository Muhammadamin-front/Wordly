from collections import Counter
from functools import lru_cache
from ipaddress import IPv4Network, IPv6Network, ip_network
from math import log2
from typing import List, Literal, Optional, Tuple, Union

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
    # text costs ElevenLabs credits exactly once. Off gracefully when unset —
    # the web client falls back to the browser's built-in voice.
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "pNInz6obpgDQGcFmaJgB"  # "Adam" — free-tier OK
    ELEVENLABS_MODEL: str = "eleven_flash_v2_5"
    TTS_CACHE_DIR: str = "./tts_cache"
    TTS_MAX_TEXT_LENGTH: int = 200
    # Word pronunciations are single words, disk-cached after first synthesis,
    # so browsing a vocabulary list shouldn't hit a wall. Generous limit.
    RATE_LIMIT_TTS: str = "120/60"

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
    def payment_sandbox_enabled(self) -> bool:
        return self.PAYMENTS_SANDBOX and self.ENVIRONMENT != "production"

    # Rate limits: "<max_requests>/<window_seconds>"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN: str = "10/60"
    RATE_LIMIT_REGISTER: str = "5/60"
    RATE_LIMIT_FORGOT_PASSWORD: str = "3/60"
    RATE_LIMIT_AI: str = "20/60"  # AI calls are expensive (tokens + latency)
    RATE_LIMIT_GAMES: str = "90/60"  # a session + rapid answers
    RATE_LIMIT_SOCIAL: str = "30/60"  # friend requests / profile lookups
    RATE_LIMIT_MULTIPLAYER: str = "20/60"  # room creation
    RATE_LIMIT_DEFAULT: str = "120/60"
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

    # Response cache (public corpus reads). TTLs in seconds.
    CACHE_ENABLED: bool = True
    CACHE_TTL_CATEGORIES: int = 300
    CACHE_TTL_WORDS: int = 60
    CACHE_TTL_WORD_DETAIL: int = 120

    # Hardening & observability
    MAX_REQUEST_BYTES: int = 5 * 1024 * 1024  # reject oversized bodies (413)
    HSTS_MAX_AGE: int = 63072000  # 2 years; sent only in production (HTTPS)
    SLOW_REQUEST_MS: int = 1000  # log a warning above this

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_ORIGIN]
        if self.FRONTEND_ORIGINS:
            origins.extend(origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip())
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

    def validate_runtime(self) -> None:
        try:
            trusted_proxy_networks = self.trusted_proxy_networks
        except ValueError as exc:
            raise RuntimeError(
                "TRUSTED_PROXY_CIDRS contains an invalid IP or CIDR"
            ) from exc

        if any(network.prefixlen == 0 for network in trusted_proxy_networks):
            raise RuntimeError("TRUSTED_PROXY_CIDRS must not trust every IP address")

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

        if self.EMAIL_PROVIDER != "resend":
            raise RuntimeError("EMAIL_PROVIDER must be 'resend' in production")
        if not self.RESEND_API_KEY:
            raise RuntimeError("RESEND_API_KEY must be set in production")
        if not self.EMAIL_FROM:
            raise RuntimeError("EMAIL_FROM must be set in production")


@lru_cache
def get_settings() -> Settings:
    return Settings()
