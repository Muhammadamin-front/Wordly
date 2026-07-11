from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Wordly API"
    ENVIRONMENT: str = "development"  # development | test | production
    API_V1_PREFIX: str = "/api/v1"

    # Security. SECRET_KEY has no default on purpose in production; the dev
    # fallback below is rejected when ENVIRONMENT=production (see main.py).
    SECRET_KEY: str = "dev-only-secret-change-me"
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
    COOKIE_SECURE: bool = False  # True in production (HTTPS)
    COOKIE_DOMAIN: Optional[str] = None

    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    # AI (Claude). AI features are disabled gracefully when the key is unset.
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_MODEL: str = "claude-opus-4-8"
    AI_MAX_TOKENS: int = 1024
    AI_FREE_DAILY_QUOTA: int = 5  # AI actions/day on the free tier
    AI_PREMIUM_DAILY_QUOTA: int = 200  # effectively unlimited for a human

    # Fallback LLM (Google Gemini). When the primary provider runs out of
    # credits or errors, the chain fails over silently (see services/ai_client).
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"

    @property
    def ai_enabled(self) -> bool:
        return bool(self.ANTHROPIC_API_KEY or self.GEMINI_API_KEY)

    # Text-to-speech (ElevenLabs). Pronunciation audio is proxied through the
    # API (the key never reaches the browser) and disk-cached, so each unique
    # text costs ElevenLabs credits exactly once. Off gracefully when unset —
    # the web client falls back to the browser's built-in voice.
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "pNInz6obpgDQGcFmaJgB"  # "Adam" — free-tier OK
    ELEVENLABS_MODEL: str = "eleven_flash_v2_5"
    TTS_CACHE_DIR: str = "./tts_cache"
    TTS_MAX_TEXT_LENGTH: int = 200
    RATE_LIMIT_TTS: str = "30/60"

    @property
    def tts_enabled(self) -> bool:
        return bool(self.ELEVENLABS_API_KEY)

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
        return [self.FRONTEND_ORIGIN]


@lru_cache
def get_settings() -> Settings:
    return Settings()
