"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Headphones,
  PenLine,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { ProgressBar } from "@/components/library/progress-bar";
import { WordCard } from "@/components/library/word-card";
import { WordDetailModal } from "@/components/library/word-detail-modal";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { flashcardsApi } from "@/lib/flashcards";
import { libraryApi, type Shelf, type ShelfMeta } from "@/lib/library";
import { fetchWord, fetchWords, type Word, type WordListItem } from "@/lib/vocab";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function LevelView({
  lang,
  meta,
  t,
  vocab,
}: {
  lang: string;
  meta: ShelfMeta;
  t: Dictionary["library"];
  vocab: Dictionary["vocab"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [words, setWords] = useState<WordListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [studying, setStudying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openWord, setOpenWord] = useState<WordListItem | null>(null);
  const [wordDetail, setWordDetail] = useState<Word | null>(null);
  const [wordDetailLoading, setWordDetailLoading] = useState(false);
  const detailRequest = useRef(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    libraryApi.overview().then((o) => {
      if (cancelled) return;
      setShelf(o.shelves.find((s) => s.key === meta.key) ?? null);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user, meta.key]);

  // Debounced word search + pagination. State updates happen in async
  // callbacks (timer + fetch), never synchronously in the effect body.
  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetchWords({
        page,
        level: meta.level,
        category: meta.category,
        q: query.trim() || undefined,
      }).then((result) => {
        if (cancelled) return;
        setWords((prev) => (page === 1 ? result.items : [...prev, ...result.items]));
        setTotal(result.total);
        setLoading(false);
      }).catch(() => {});
    }, query ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, user, meta.level, meta.category, page, query]);

  const onSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    setLoading(true);
  };

  const onStudy = async () => {
    setStudying(true);
    try {
      await flashcardsApi.addByLevel({ level: meta.level, category: meta.category, limit: 20 });
      router.push(`/${lang}/review`);
    } finally {
      setStudying(false);
    }
  };

  const onAdd = (word: WordListItem) => {
    flashcardsApi
      .createCard(word.id)
      .then(() => setAdded((prev) => new Set(prev).add(word.id)))
      .catch((err) => {
        // 409 = already in the user's cards — reflect that as added.
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
        if (detailRequest.current !== request) return;
        setWordDetail(result);
      })
      .catch(() => {
        if (detailRequest.current !== request) return;
        setWordDetail(null);
      })
      .finally(() => {
        if (detailRequest.current === request) setWordDetailLoading(false);
      });
  };

  const onCloseWord = useCallback(() => {
    detailRequest.current += 1;
    setOpenWord(null);
    setWordDetail(null);
    setWordDetailLoading(false);
  }, []);

  if (!ready || !user) return null;

  const shelfStrings = (t.shelves as Record<string, { name: string; desc: string }>)[meta.slug];
  const pct = shelf && shelf.total > 0 ? Math.round((shelf.learned / shelf.total) * 100) : 0;

  const actions = [
    { icon: GraduationCap, label: t.study, onClick: onStudy, primary: true },
    { icon: BookOpen, label: t.learn, href: `/${lang}/vocabulary` },
    { icon: Gamepad2, label: t.quiz, href: `/${lang}/games/speed_quiz` },
    { icon: PenLine, label: t.writing, href: `/${lang}/skills/writing` },
    { icon: Headphones, label: t.listening, href: `/${lang}/skills/listening` },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href={`/${lang}/decks`}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> {t.back}
      </Link>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("mt-4 rounded-2xl border border-line/60 bg-gradient-to-br p-6 sm:p-8", meta.gradient)}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {shelfStrings.name}
        </h1>
        <p className="mt-1 text-ink-soft">{shelfStrings.desc}</p>

        {shelf && (
          <div className="mt-5 max-w-md">
            <p className="text-sm font-semibold text-ink">
              {shelf.learned} / {shelf.total}{" "}
              <span className="font-normal text-ink-soft">{t.learned}</span>
              <span className={cn("float-right font-bold", meta.text)}>{pct}%</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={pct} barClass={meta.bar} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {actions.map(({ icon: Icon, label, onClick, href, primary }) =>
            href ? (
              <Link key={label} href={href}>
                <Button size="sm" variant="secondary">
                  <Icon className="mr-1.5 size-4" /> {label}
                </Button>
              </Link>
            ) : (
              <Button
                key={label}
                size="sm"
                variant={primary ? "primary" : "secondary"}
                loading={studying}
                onClick={onClick}
              >
                <Icon className="mr-1.5 size-4" /> {label}
              </Button>
            )
          )}
        </div>
      </motion.header>

      {/* Search + counter */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-line bg-card pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">{total}</strong> {t.words}
        </p>
      </div>

      {/* Word grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-3">
            <AnimatePresence>
              {words.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  lang={lang}
                  accentText={meta.text}
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

          {words.length < total && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
                {t.loadMore} ({words.length}/{total})
              </Button>
            </div>
          )}
          {words.length === 0 && (
            <p className="py-16 text-center text-ink-soft">{t.noResults}</p>
          )}
        </>
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
    </main>
  );
}
