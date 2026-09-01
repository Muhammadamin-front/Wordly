from uuid import uuid4

from app.services.word_chain import WordChainPlayer, WordChainRoom
from app.services.word_chain_store import MemoryWordChainRoomStore


async def test_memory_store_create_load_save_delete():
    store = MemoryWordChainRoomStore()
    host_id = uuid4()
    room = WordChainRoom("ABC123", host_id)
    room.add_player(WordChainPlayer(host_id, "Host"))
    assert await store.create(room) is True
    assert await store.create(room) is False
    loaded = await store.load("ABC123")
    assert loaded is room
    room.add_bot()
    assert await store.save(room, expected_version=None) is True
    assert len((await store.load("ABC123")).players) == 2  # type: ignore[union-attr]
    await store.delete("ABC123")
    assert await store.load("ABC123") is None
