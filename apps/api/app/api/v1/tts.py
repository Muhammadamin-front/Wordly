from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.vocabulary import Word
from app.services import tts

router = APIRouter(tags=["tts"])


async def _synthesize_or_502(text: str) -> bytes:
    try:
        return await tts.synthesize(text)
    except tts.TtsError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Speech synthesis failed"
        )


@router.get("/tts", dependencies=[Depends(get_current_user), Depends(rate_limit("tts"))])
async def pronounce(text: str = Query(min_length=1, max_length=500)):
    """Natural pronunciation audio for any signed-in text, e.g. an example
    sentence (MP3). Served from the server-side cache when possible;
    immutable-cacheable on the client since the same text always yields the
    same audio.
    """
    settings = get_settings()
    if not settings.tts_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="TTS is not configured"
        )
    text = text.strip()
    if not text or len(text) > settings.TTS_MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Text too long"
        )
    audio = await _synthesize_or_502(text)
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "private, max-age=86400, immutable"},
    )


@router.get("/tts/word", dependencies=[Depends(rate_limit("tts_guest"))])
async def pronounce_public_word(
    headword: str = Query(min_length=1, max_length=80),
    db: AsyncSession = Depends(get_db),
):
    """Natural pronunciation for a single published headword, with no sign-in
    required. Pronunciation is part of the public vocabulary preview, so a
    signed-out visitor should not hear the robotic browser fallback voice —
    but unlike `/tts`, the input must resolve to a real published word
    (never arbitrary text) to keep this endpoint from being an open,
    anonymous proxy onto a paid synthesis provider.
    """
    settings = get_settings()
    if not settings.tts_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="TTS is not configured"
        )
    headword = headword.strip()
    exists = await db.scalar(
        select(Word.id).where(Word.headword == headword, Word.status == "published").limit(1)
    )
    if exists is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown word")
    audio = await _synthesize_or_502(headword)
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=86400, immutable"},
    )
