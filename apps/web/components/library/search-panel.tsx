"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { WordCard } from "@/components/library/word-card";
import { WordDetailModal } from "@/components/library/word-detail-modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { flashcardsApi } from "@/lib/flashcards";
import { defineWordViaAi, fetchWord, fetchWords, type Word, type WordListItem } from "@/lib/vocab";
import type { Dictionary } from "@/app/[lang]/dictionaries";

function toListItem(word: Word): WordListItem {
  const sense = word.senses[0];
  return {
    id: word.id,
    headword: word.headword,
    slug: word.slug,
    pos: word.pos,
    ipa: word.ipa,
    cefr_level: word.cefr_level,
    frequency_rank: word.frequency_rank,
    status: word.status,
    ai_generated: word.ai_generated,
    category: word.category,
    primary_translation_uz: sense?.translation_uz ?? null,
    primary_translation_ru: sense?.translation_ru ?? null,
    primary_example_en: sense?.examples[0]?.text_en ?? null,
    image_url: word.image_url,
  };
}

/** Corpus-wide word search with one-tap add to the learner's cards. */
export function SearchPanel({
  lang,
  t,
  vocab,
}: {
  lang: string;
  t: Dictionary["library"];
  vocab: Dictionary["vocab"];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WordListItem[] | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [openWord, setOpenWord] = useState<WordListItem | null>(null);
  const [wordDetail, setWordDetail] = useState<Word | null>(null);
  const [wordDetailLoading, setWordDetailLoading] = useState(false);
  const [aiDefining, setAiDefining] = useState(false);
  const [aiDefineError, setAiDefineError] = useState<string | null>(null);
  const detailRequest = useRef(0);

  // Debounced search across the whole published corpus (no level filter).
  // setState happens only inside the timer/fetch callbacks, never in the body.
  useEffect(() => {
    const term = query.trim();
    let cancelled = false;
    const timer = window.setTimeout(
      () => {
        if (!term) {
          setResults(null);
          setLoading(false);
          return;
        }
        fetchWords({ q: term, page: 1 })
          .then((res) => {
            if (cancelled) return;
            setResults(res.items);
            setLoading(false);
          })
          .catch(() => {
            if (!cancelled) setLoading(false);
          });
      },
      term ? 300 : 0
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  // Show the spinner immediately on typing (handler, not effect body).
  const onQueryChange = (value: string) => {
    setQuery(value);
    setLoading(value.trim().length > 0);
    setAiDefineError(null);
  };

  const onAdd = (word: WordListItem) => {
    flashcardsApi
      .createCard(word.id)
      .then(() => setAdded((prev) => new Set(prev).add(word.id)))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 409) {
          setAdded((prev) => new Set(prev).add(word.id));
        }
      });
  };

  const onOpenWord = (word: WordListItem) => {
    const request = ++detailRequest.current;
    setOpenWord(word);
    setWordDetail(null);
    setWordDetailLoading(true);
    fetchWord(word.slug)
      .then((result) => {
        if (detailRequest.current === request) setWordDetail(result);
      })
      .catch(() => {
        if (detailRequest.current === request) setWordDetail(null);
      })
      .finally(() => {
        if (detailRequest.current === request) setWordDetailLoading(false);
      });
  };

  const onDefineViaAi = () => {
    const term = query.trim();
    if (!term || aiDefining) return;
    setAiDefining(true);
    setAiDefineError(null);
    defineWordViaAi(term)
      .then((word) => {
        // Skip the results grid entirely — straight to the detail modal,
        // since the AI call already returned the full definition.
        setOpenWord(toListItem(word));
        setWordDetail(word);
        setWordDetailLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setAiDefineError(t.aiDefineNotRecognized);
        else if (err instanceof ApiError && err.status === 429) setAiDefineError(t.aiDefineQuotaExceeded);
        else setAiDefineError(t.aiDefineError);
      })
      .finally(() => setAiDefining(false));
  };

  const onCloseWord = useCallback(() => {
    detailRequest.current += 1;
    setOpenWord(null);
    setWordDetail(null);
    setWordDetailLoading(false);
  }, []);

  return (
    <section className="mt-8">
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t.searchAll}
          className="h-14 w-full rounded-2xl border border-line bg-card pl-12 pr-12 text-base text-ink shadow-sm placeholder:text-ink-soft/60 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="clear"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <span className="size-6 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
        </div>
      )}

      {results !== null && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-ink-soft">{t.noResults}</p>
              <Button variant="secondary" size="sm" loading={aiDefining} onClick={onDefineViaAi}>
                {aiDefining ? t.aiDefineLoading : t.aiDefineCta}
              </Button>
              {aiDefineError && (
                <Alert tone="error" className="max-w-sm">
                  {aiDefineError}
                </Alert>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              <AnimatePresence>
                {results.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    lang={lang}
                    accentText="text-brand-600 dark:text-brand-300"
                    added={added.has(word.id)}
                    onAdd={() => onAdd(word)}
                    onOpen={() => onOpenWord(word)}
                    labels={{
                      add: t.addWord,
                      addedLabel: t.addedWord,
                      listen: t.listen,
                      flip: t.flipCard,
                      unflip: t.flipBack,
                      details: t.viewDetails,
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {openWord && (
          <WordDetailModal
            summary={openWord}
            detail={wordDetail}
            loading={wordDetailLoading}
            lang={lang}
            labels={vocab}
            added={added.has(openWord.id)}
            onAdd={() => onAdd(openWord)}
            onClose={onCloseWord}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
