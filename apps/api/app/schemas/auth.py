from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=80)
    ui_locale: str = Field(default="uz", pattern="^(uz|ru|en)$")
    referral_code: Optional[str] = Field(default=None, max_length=12)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=10)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=10)


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str
    avatar_url: Optional[str] = None
    ui_locale: str
    timezone: str
    bio: Optional[str] = None
    cefr_level: str
    learning_goal: str
    daily_minutes: int
    learning_interests: List[str]
    onboarding_completed: bool
    starter_deck_id: Optional[UUID] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    email_verified: bool
    role: str
    profile: ProfileOut


class TokenPair(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class MessageOut(BaseModel):
    message: str


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    avatar_url: Optional[str] = Field(default=None, max_length=512)
    ui_locale: Optional[str] = Field(default=None, pattern="^(uz|ru|en)$")
    timezone: Optional[str] = Field(default=None, max_length=64)
    bio: Optional[str] = Field(default=None, max_length=500)


class OnboardingRequest(BaseModel):
    cefr_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"]
    learning_goal: Literal["general", "travel", "career", "ielts"]
    daily_minutes: Literal[5, 10, 15, 20]
    learning_interests: List[
        Literal["daily-life", "travel", "work", "education", "technology", "culture"]
    ] = Field(min_length=1, max_length=3)


class OnboardingOut(BaseModel):
    user: UserOut
    starter_deck_id: UUID
    starter_cards: int
