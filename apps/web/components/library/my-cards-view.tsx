"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Layers, Play, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedWordCard } from "@/components/library/saved-word-card";
import { Button } from "@/components/ui/button";
import { flashcardsApi, type CardOut } from "@/lib/flashcards";
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
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
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
            className="h-11 w-full rounded-xl border border-line bg-card pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">{total}</strong> {t.cards}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          className="my-10"
          icon={Layers}
          title={query ? t.noResults : t.noCards}
          body={query ? t.noResultsBody : t.noCardsBody}
          actionLabel={query ? undefined : t.browseLevels}
          actionHref={query ? undefined : `/${lang}/decks`}
        />
      ) : (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {cards.map((card) => (
                <motion.li
                  key={card.id}
                  layout
                  exit={{ opacity: 0, x: -32, rotateY: -18, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 250, damping: 24 }}
                  className="h-full [perspective:1200px]"
                >
                  <SavedWordCard
                    card={card}
                    lang={lang}
                    labels={t}
                    onDelete={() => onDelete(card.id)}
                  />
                </motion.li>
              ))}
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
