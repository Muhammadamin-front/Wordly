from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MockSessionCreate(BaseModel):
    track: str = Field(default="academic", pattern="^(academic|general)$")


class MockLegOut(BaseModel):
    skill: str
    status: str
    band: Optional[float]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


class MockSessionOut(BaseModel):
    id: UUID
    track: str
    status: str
    current_leg: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]
    overall_band: Optional[float]
    band_listening: Optional[float]
    band_reading: Optional[float]
    band_writing: Optional[float]
    band_speaking: Optional[float]
    legs: list[MockLegOut] = []


class MockSessionListItem(BaseModel):
    id: UUID
    track: str
    status: str
    started_at: datetime
    finished_at: Optional[datetime]
    overall_band: Optional[float]
