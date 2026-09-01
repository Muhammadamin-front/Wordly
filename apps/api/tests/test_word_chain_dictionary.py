from app.core.cache import MemoryCache
from app.services.external_dictionary import ExternalLookup
from app.services.word_chain_dictionary import CorpusDictionaryService


async def test_corpus_word_is_valid_without_external_request(monkeypatch):
    service = CorpusDictionaryService(lambda: None, MemoryCache())

    async def corpus():
        return {"blue", "eagle"}

    async def external(_word):
        raise AssertionError("published corpus hits must not call the provider")

    monkeypatch.setattr(service, "_corpus_words", corpus)
    monkeypatch.setattr("app.services.word_chain_dictionary.lookup_external_word", external)
    result = await service.validate_word(" BLUE ")
    assert result.status == "valid"
    assert result.normalized_word == "blue"


async def test_external_result_is_cached(monkeypatch):
    cache = MemoryCache()
    service = CorpusDictionaryService(lambda: None, cache)
    calls = 0

    async def corpus():
        return set()

    async def external(_word):
        nonlocal calls
        calls += 1
        return ExternalLookup("found")

    monkeypatch.setattr(service, "_corpus_words", corpus)
    monkeypatch.setattr("app.services.word_chain_dictionary.lookup_external_word", external)
    assert (await service.validate_word("zebra")).valid
    assert (await service.validate_word("ZEBRA")).valid
    assert calls == 1


async def test_external_outage_retries_and_remains_retryable(monkeypatch):
    service = CorpusDictionaryService(lambda: None, MemoryCache())
    calls = 0

    async def corpus():
        return set()

    async def unavailable(_word):
        nonlocal calls
        calls += 1
        return ExternalLookup("unavailable")

    monkeypatch.setattr(service, "_corpus_words", corpus)
    monkeypatch.setattr("app.services.word_chain_dictionary.lookup_external_word", unavailable)
    assert (await service.validate_word("zebra")).status == "unavailable"
    assert calls == 2


async def test_corpus_failure_uses_the_independent_dictionary_fallback(monkeypatch):
    service = CorpusDictionaryService(lambda: None, MemoryCache())

    async def broken_corpus():
        raise RuntimeError("database unavailable")

    async def external(_word):
        return ExternalLookup("found")

    monkeypatch.setattr(service, "_corpus_words", broken_corpus)
    monkeypatch.setattr("app.services.word_chain_dictionary.lookup_external_word", external)
    assert (await service.validate_word("zebra")).status == "valid"


async def test_start_counts_fail_closed_when_the_corpus_is_unavailable(monkeypatch):
    service = CorpusDictionaryService(lambda: None, MemoryCache())

    async def broken_corpus():
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(service, "_corpus_words", broken_corpus)
    assert not any((await service.letter_counts()).values())


async def test_bot_candidates_follow_letter_and_exclude_used(monkeypatch):
    service = CorpusDictionaryService(lambda: None)

    async def corpus():
        return {"earth", "eagle", "apple"}

    monkeypatch.setattr(service, "_corpus_words", corpus)
    assert await service.candidate_words("E", ["EAGLE"]) == ["earth"]
