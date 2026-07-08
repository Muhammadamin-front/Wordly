from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Words.uz API"
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

    # Rate limits: "<max_requests>/<window_seconds>"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN: str = "10/60"
    RATE_LIMIT_REGISTER: str = "5/60"
    RATE_LIMIT_FORGOT_PASSWORD: str = "3/60"
    RATE_LIMIT_DEFAULT: str = "120/60"

    @property
    def cors_origins(self) -> List[str]:
        return [self.FRONTEND_ORIGIN]


@lru_cache
def get_settings() -> Settings:
    return Settings()
