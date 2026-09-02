from uuid import uuid4

from app.services.word_chain import WordChainPlayer, WordChainRoom
from app.services.word_chain_store import MemoryWordChainRoomStore, word_chain_room_version


async def test_memory_store_create_load_save_delete():
    store = MemoryWordChainRoomStore()
    host_id = uuid4()
    room = WordChainRoom("ABC123", host_id)
    room.add_player(WordChainPlayer(host_id, "Host"))
    assert await store.create(room) is True
    assert await store.create(room) is False
    loaded = await store.load("ABC123")
    assert loaded is room
    assert word_chain_room_version(loaded) == 1
    room.add_bot()
    assert await store.save(room, expected_version=word_chain_room_version(room)) is True
    assert word_chain_room_version(room) == 2
    assert len((await store.load("ABC123")).players) == 2  # type: ignore[union-attr]
    assert await store.delete("ABC123", expected_version=word_chain_room_version(room)) is True
    assert await store.load("ABC123") is None


async def test_memory_store_save_rejects_a_stale_version():
    """Same CAS contract as Redis: a caller that read an old version must not
    be able to clobber a write that happened after it read."""
    store = MemoryWordChainRoomStore()
    host_id = uuid4()
    room = WordChainRoom("XYZ999", host_id)
    room.add_player(WordChainPlayer(host_id, "Host"))
    await store.create(room)
    stale_version = word_chain_room_version(room)

    # Someone else saves first, bumping the version.
    room.add_bot()
    assert await store.save(room, expected_version=stale_version) is True

    # A second writer still holding the pre-bump version must be rejected,
    # not silently allowed to overwrite the newer state.
    assert await store.save(room, expected_version=stale_version) is False


async def test_memory_store_delete_rejects_a_stale_version():
    store = MemoryWordChainRoomStore()
    host_id = uuid4()
    room = WordChainRoom("DEL001", host_id)
    room.add_player(WordChainPlayer(host_id, "Host"))
    await store.create(room)
    stale_version = word_chain_room_version(room)
    room.add_bot()
    await store.save(room, expected_version=stale_version)

    assert await store.delete("DEL001", expected_version=stale_version) is False
    assert await store.load("DEL001") is not None
