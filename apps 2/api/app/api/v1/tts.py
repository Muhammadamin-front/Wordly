from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.services import tts

router = APIRouter(
    tags=["tts"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("tts"))],
)


@router.get("/tts")
async def pronounce(text: str = Query(min_length=1, max_length=500)):
    """Natural pronunciation audio for a word or sentence (MP3).

    Served from the server-side cache when possible; immutable-cacheable on
    the client since the same text always yields the same audio.
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
    try:
        audio = await tts.synthesize(text)
    except tts.TtsError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Speech synthesis failed"
        )
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "private, max-age=86400, immutable"},
    )
