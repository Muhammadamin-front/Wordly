"""Real-time voice bridge for the Speaking Coach.

Browser mic (PCM16) → our WebSocket → Deepgram streaming STT → transcript back to
the browser; on end-of-utterance we generate the coach's reply and send it for
the browser to speak. The Deepgram key stays server-side.

Kept on its own router (no HTTP auth dependency) so the WS handshake isn't
rejected by the bearer-header dependency the /coach HTTP routes use; auth is a
token query param, as with the multiplayer socket.

Client protocol:
  → first text frame: {"type":"config","sample_rate":16000}
  → then binary frames: raw little-endian PCM16 mono audio
  → optional text frame: {"type":"stop"} to end
  ← {"type":"ready"}                          bridge is live
  ← {"type":"transcript","text","final"}      live captions
  ← {"type":"user_turn","text"}               a finished user utterance
  ← {"type":"reply","text"}                   coach reply (browser speaks it)
  ← {"type":"reward",...}                      XP for the turn
  ← {"type":"error","error"}                   fatal; socket then closes
"""
import asyncio
import json
import logging

import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.services import coach_live
from app.services.ai_client import AiError, get_ai_client

logger = logging.getLogger(__name__)

router = APIRouter(tags=["coach"])


@router.websocket("/coach/sessions/{session_id}/live")
async def live_voice(websocket: WebSocket, session_id: str):
    await websocket.accept()

    # --- Auth + preconditions ------------------------------------------------
    user_id = decode_access_token(websocket.query_params.get("token", ""))
    if user_id is None:
        await websocket.send_json({"type": "error", "error": "unauthorized"})
        await websocket.close()
        return

    settings = get_settings()
    if not settings.deepgram_enabled:
        await websocket.send_json({"type": "error", "error": "stt_unavailable"})
        await websocket.close()
        return
    if get_ai_client() is None:
        await websocket.send_json({"type": "error", "error": "ai_unavailable"})
        await websocket.close()
        return

    try:
        session_uuid = _parse_uuid(session_id)
    except ValueError:
        await websocket.send_json({"type": "error", "error": "not_found"})
        await websocket.close()
        return

    system, history, error = await coach_live.load_live_context(user_id, session_uuid)
    if error is not None:
        await websocket.send_json({"type": "error", "error": error})
        await websocket.close()
        return

    # --- Handshake: client tells us its actual mic sample rate ---------------
    try:
        config = await websocket.receive_json()
    except (WebSocketDisconnect, json.JSONDecodeError):
        await websocket.close()
        return
    sample_rate = 16000
    if isinstance(config, dict) and config.get("type") == "config":
        try:
            sample_rate = max(8000, min(48000, int(config.get("sample_rate", 16000))))
        except (TypeError, ValueError):
            sample_rate = 16000

    # --- Connect to Deepgram (key stays here) --------------------------------
    try:
        deepgram = await websockets.connect(
            coach_live.deepgram_url(sample_rate),
            additional_headers={"Authorization": "Token {}".format(settings.DEEPGRAM_API_KEY)},
        )
    except Exception:  # noqa: BLE001 — surface a clean error, log the detail
        logger.exception("Deepgram connect failed")
        await websocket.send_json({"type": "error", "error": "stt_connect_failed"})
        await websocket.close()
        return

    await websocket.send_json({"type": "ready"})

    state = {"buffer": "", "busy": False}

    async def pump_audio() -> None:
        """Browser audio/control frames → Deepgram."""
        try:
            while True:
                message = await websocket.receive()
                if message.get("type") == "websocket.disconnect":
                    break
                data = message.get("bytes")
                if data is not None:
                    await deepgram.send(data)
                    continue
                text = message.get("text")
                if text:
                    try:
                        control = json.loads(text)
                    except json.JSONDecodeError:
                        continue
                    if control.get("type") == "stop":
                        break
        except (WebSocketDisconnect, RuntimeError):
            pass
        finally:
            # Tell Deepgram to flush and finish.
            try:
                await deepgram.send(json.dumps({"type": "CloseStream"}))
            except Exception:  # noqa: BLE001
                pass

    async def handle_turn(turn_text: str) -> None:
        await websocket.send_json({"type": "user_turn", "text": turn_text})
        history.append({"role": "user", "content": turn_text})
        try:
            reply = await coach_live.generate_reply(system, history)
        except AiError:
            history.pop()
            await websocket.send_json({"type": "error", "error": "ai_failed"})
            return
        history.append({"role": "assistant", "content": reply})
        await websocket.send_json({"type": "reply", "text": reply})
        reward = await coach_live.persist_turn(user_id, session_uuid, turn_text, reply)
        if reward is not None:
            await websocket.send_json({"type": "reward", **reward})

    async def pump_transcripts() -> None:
        """Deepgram results → live captions; on end-of-utterance, a coach reply."""
        try:
            async for raw in deepgram:
                data = json.loads(raw)
                if data.get("type") not in (None, "Results"):
                    continue
                alternatives = (data.get("channel") or {}).get("alternatives") or [{}]
                text = (alternatives[0].get("transcript") or "").strip()
                is_final = bool(data.get("is_final"))
                speech_final = bool(data.get("speech_final"))

                if text and is_final:
                    state["buffer"] = (state["buffer"] + " " + text).strip()
                    await websocket.send_json(
                        {"type": "transcript", "text": state["buffer"], "final": True}
                    )
                elif text:
                    await websocket.send_json({"type": "transcript", "text": text, "final": False})

                if speech_final and state["buffer"] and not state["busy"]:
                    state["busy"] = True
                    turn_text = state["buffer"]
                    state["buffer"] = ""
                    try:
                        await handle_turn(turn_text)
                    finally:
                        state["busy"] = False
        except (WebSocketDisconnect, websockets.ConnectionClosed, json.JSONDecodeError):
            pass

    audio_task = asyncio.create_task(pump_audio())
    transcript_task = asyncio.create_task(pump_transcripts())
    try:
        _, pending = await asyncio.wait(
            {audio_task, transcript_task}, return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()
    finally:
        try:
            await deepgram.close()
        except Exception:  # noqa: BLE001
            pass
        try:
            await websocket.close()
        except Exception:  # noqa: BLE001
            pass


def _parse_uuid(value: str):
    from uuid import UUID

    return UUID(value)
