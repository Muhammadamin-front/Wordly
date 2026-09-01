from uuid import uuid4

from fastapi.testclient import TestClient

import app.api.v1.word_chain as word_chain_transport
from app.core.config import get_settings
from app.main import app
from app.services.word_chain_matchmaking import MemoryWordChainMatchmaker


async def test_memory_matchmaker_claims_waiting_rooms_in_fifo_order():
    matchmaker = MemoryWordChainMatchmaker()

    await matchmaker.enqueue("FIRST1")
    await matchmaker.enqueue("SECOND")

    assert await matchmaker.claim() == "FIRST1"
    assert await matchmaker.claim() == "SECOND"
    assert await matchmaker.claim() is None


async def test_memory_matchmaker_keeps_one_entry_per_room_and_can_cancel_search():
    matchmaker = MemoryWordChainMatchmaker()

    await matchmaker.enqueue("REJOIN")
    await matchmaker.enqueue("OTHER1")
    await matchmaker.enqueue("REJOIN")
    await matchmaker.remove("REJOIN")

    assert await matchmaker.claim() == "OTHER1"
    assert await matchmaker.claim() is None


def test_websocket_matchmaking_pairs_two_people_and_starts_a_game(monkeypatch):
    first_id, second_id = uuid4(), uuid4()
    identities = {
        "first-token": (first_id, "Alice", None),
        "second-token": (second_id, "Bob", None),
    }

    async def resolve_user(token: str):
        return identities.get(token)

    async def letter_counts(_service):
        return {letter: 10 for letter in "abcdefghijklmnopqrstuvwxyz"}

    # The transport test does not require a database. Keep the app lifespan
    # in its memory-backed mode and replace the authenticated identity lookup.
    settings = get_settings().model_copy(update={"REDIS_URL": ""})
    monkeypatch.setattr("app.main.get_settings", lambda: settings)
    monkeypatch.setattr("app.main.init_engine", lambda: None)
    monkeypatch.setattr(word_chain_transport, "_resolve_user", resolve_user)
    monkeypatch.setattr(
        word_chain_transport.CorpusDictionaryService, "letter_counts", letter_counts
    )

    with TestClient(app) as client:
        with client.websocket_connect("/api/v1/ws/word-chain") as first:
            first.send_json({"action": "authenticate", "token": "first-token"})
            assert first.receive_json() == {"type": "authenticated"}
            first.send_json({"action": "find_match"})
            searching = first.receive_json()
            assert searching["state"]["matchmaking_status"] == "searching"

            with client.websocket_connect("/api/v1/ws/word-chain") as second:
                second.send_json({"action": "authenticate", "token": "second-token"})
                assert second.receive_json() == {"type": "authenticated"}
                second.send_json({"action": "find_match"})

                first_matched = first.receive_json()
                second_matched = second.receive_json()
                assert first_matched["state"]["matchmaking_status"] == "matched"
                assert second_matched["state"]["matchmaking_status"] == "matched"

                first_playing = first.receive_json()
                second_playing = second.receive_json()
                assert first_playing["state"]["status"] == "playing"
                assert second_playing["state"]["status"] == "playing"
                assert {
                    player["id"] for player in first_playing["state"]["players"]
                } == {str(first_id), str(second_id)}


def test_websocket_cancel_removes_a_waiting_room_from_matchmaking(monkeypatch):
    first_id, second_id = uuid4(), uuid4()
    identities = {
        "first-token": (first_id, "Alice", None),
        "second-token": (second_id, "Bob", None),
    }

    async def resolve_user(token: str):
        return identities.get(token)

    settings = get_settings().model_copy(update={"REDIS_URL": ""})
    monkeypatch.setattr("app.main.get_settings", lambda: settings)
    monkeypatch.setattr("app.main.init_engine", lambda: None)
    monkeypatch.setattr(word_chain_transport, "_resolve_user", resolve_user)

    with TestClient(app) as client:
        with client.websocket_connect("/api/v1/ws/word-chain") as first:
            first.send_json({"action": "authenticate", "token": "first-token"})
            assert first.receive_json() == {"type": "authenticated"}
            first.send_json({"action": "find_match"})
            cancelled_room = first.receive_json()["state"]["code"]
            first.send_json({"action": "leave"})

            with client.websocket_connect("/api/v1/ws/word-chain") as second:
                second.send_json({"action": "authenticate", "token": "second-token"})
                assert second.receive_json() == {"type": "authenticated"}
                second.send_json({"action": "find_match"})
                next_search = second.receive_json()["state"]
                assert next_search["matchmaking_status"] == "searching"
                assert next_search["code"] != cancelled_room
