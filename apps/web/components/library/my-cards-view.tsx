"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, Search, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { flashcardsApi, type CardOut } from "@/lib/flashcards";
import { speak } from "@/lib/games";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function MyCardsView({ lang, t }: { lang: string; t: Dictionary["library"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [cards, setCards] = useState<CardOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  // Debounced search + pagination; state updates happen in async callbacks.
  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      flashcardsApi.listCards({ q: query.trim() || undefined, page }).then((res) => {
        if (cancelled) return;
        setCards((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setLoading(false);
      }).catch(() => {});
    }, query ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, user, page, query]);

  const onSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    setLoading(true);
  };

  const onDelete = (cardId: string) => {
    // Optimistic removal; the list count follows.
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setTotal((n) => Math.max(0, n - 1));
    flashcardsApi.deleteCard(cardId).catch(() => {});
  };

  if (!ready || !user) return null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href={`/${lang}/decks`}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> {t.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">🃏 {t.myCards}</h1>
        <Link href={`/${lang}/review`}>
          <Button>
            <Play className="mr-1.5 size-4" /> {t.review}
          </Button>
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.searchMyCards}
            className="h-11 w-full rounded-xl border border-line bg-card pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">{total}</strong> {t.cards}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
        </div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl" aria-hidden>🃏</p>
          <p className="mt-4 text-ink-soft">{query ? t.noResults : t.noCards}</p>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-2">
            <AnimatePresence initial={false}>
              {cards.map((card) => {
                const sense = card.word?.senses[0];
                const translation = lang === "ru" ? sense?.translation_ru : sense?.translation_uz;
                return (
                  <motion.li
                    key={card.id}
                    layout
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-line/60 bg-card/70 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => card.word && speak(card.word.headword)}
                      aria-label={t.listen}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-soft transition-colors hover:bg-brand-600/10 hover:text-brand-600 dark:bg-white/10 dark:hover:text-brand-300"
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">
                        {card.word?.headword ?? card.front_text}
                      </p>
                      <p className="truncate text-sm text-ink-soft">
                        {translation ?? card.back_text}
                        {card.word && (
                          <span className="ml-2 rounded bg-ink/5 px-1.5 py-0.5 text-xs font-medium dark:bg-white/10">
                            {card.word.cefr_level}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(card.id)}
                      aria-label={t.delete}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {cards.length < total && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
                {t.loadMore} ({cards.length}/{total})
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
