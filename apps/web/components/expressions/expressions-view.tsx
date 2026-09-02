"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  Plus,
  Search,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CEFR_COLOR,
  expressionsApi,
  type ExpressionDetail,
  type ExpressionListItem,
  type ExpressionMeta,
} from "@/lib/expressions";
import { flashcardsApi } from "@/lib/flashcards";
import { speak } from "@/lib/games";
import { cn } from "@/lib/utils";

type T = Dictionary["expressions"];

const CEFR_LEVELS = ["A2", "B1", "B2", "C1", "C2"];

export function ExpressionsView({ lang, t }: { lang: string; t: T }) {
  const { user } = useAuth();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState<ExpressionMeta | null>(null);
  const [items, setItems] = useState<ExpressionListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [cefr, setCefr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ExpressionDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const addToCards = useCallback(
    async (e: ExpressionDetail | ExpressionListItem) => {
      if (added.has(e.slug)) return;
      setAdded((prev) => new Set(prev).add(e.slug));
      try {
        // Never the usage note or the English expression itself — the card back
        // has to be a real translation, since it is what SRS drills the learner on.
        await flashcardsApi.createCustomCard(e.expression, e.flashcard_back);
      } catch {
        setAdded((prev) => {
          const next = new Set(prev);
          next.delete(e.slug);
          return next;
        });
      }
    },
    [added]
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    expressionsApi.meta().then(setMeta).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setItems(null);
    setLoadError(false);
    expressionsApi
      .list({
        page,
        category: category ?? undefined,
        cefr: cefr ?? undefined,
        q: q || undefined,
        locale: lang,
      })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setLoadError(true));
  }, [page, category, cefr, q, lang]);

  useEffect(() => {
    const id = window.setTimeout(load, q ? 300 : 0);
    return () => window.clearTimeout(id);
  }, [load, q]);

  function reset(next: () => void) {
    setPage(1);
    next();
  }

  const pageCount = Math.max(1, Math.ceil(total / 24));

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel rounded-lg p-5 sm:p-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="icon-tile size-12 rounded-lg">
              <MessageCircle className="size-6 text-accent-600 dark:text-accent-300" aria-hidden />
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">{t.subtitle}</p>
          </div>
          {meta && (
            <span className="premium-card shrink-0 rounded-lg px-4 py-3 text-center">
              <span className="block text-2xl font-black text-brand-600 dark:text-brand-200">
                {meta.total}
              </span>
              <span className="text-[10px] font-black uppercase text-ink-soft">{t.total}</span>
            </span>
          )}
        </div>

        <div className="mt-7 space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
              aria-hidden
            />
            <input
              aria-label={t.searchPlaceholder}
              value={q}
              onChange={(e) => reset(() => setQ(e.target.value))}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-lg border border-line bg-card/72 pl-11 pr-4 text-sm font-medium text-ink shadow-inner shadow-brand-950/5 backdrop-blur-xl placeholder:text-ink-soft/55 transition-all focus:-translate-y-0.5 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={!cefr} onClick={() => reset(() => setCefr(null))}>
              {t.allLevels}
            </Chip>
            {CEFR_LEVELS.map((lv) => (
              <Chip key={lv} active={cefr === lv} onClick={() => reset(() => setCefr(lv))}>
                {lv}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {detailError && (
        <Alert tone="error" className="mt-5">
          {t.detailLoadError}
        </Alert>
      )}

      {meta && meta.categories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          <Chip active={!category} onClick={() => reset(() => setCategory(null))}>
            {t.allCategories}
          </Chip>
          {meta.categories.map((c) => (
            <Chip
              key={c.category}
              active={category === c.category}
              onClick={() => reset(() => setCategory(c.category))}
            >
              {c.category} <span className="opacity-60">{c.count}</span>
            </Chip>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loadError ? (
          <div className="surface-panel col-span-full rounded-lg p-6 text-center">
            <Alert tone="error">{t.loadError}</Alert>
            <button
              type="button"
              onClick={load}
              className="mt-4 min-h-11 rounded-lg border border-line bg-raised px-4 text-sm font-black text-ink transition-colors hover:border-brand-500"
            >
              {t.retry}
            </button>
          </div>
        ) : items === null
          ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)
          : items.map((e, i) => (
              <motion.button
                key={e.slug}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => {
                  setDetailError(false);
                  expressionsApi.detail(e.slug, lang).then(setOpen).catch(() => setDetailError(true));
                }}
                className="premium-card group flex min-h-36 flex-col rounded-lg p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-black leading-tight text-ink">{e.expression}</p>
                  <span className={cn("shrink-0 text-xs font-black", CEFR_COLOR(e.cefr))}>
                    {e.cefr}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{e.translation ?? e.usage}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4 text-[11px]">
                  <Tag>{e.category}</Tag>
                  <Tag>IELTS {e.ielts_band}</Tag>
                  <Tag>{e.formality}</Tag>
                </div>
              </motion.button>
            ))}
      </div>

      {!loadError && items && items.length === 0 && (
        <p className="surface-panel mt-10 rounded-lg p-6 text-center text-ink-soft">{t.empty}</p>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="icon-tile flex items-center gap-1 rounded-lg px-3 py-2 font-bold text-ink disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t.prev}
          </button>
          <span className="rounded-lg border border-line bg-card/70 px-3 py-2 font-bold text-ink-soft">
            {page} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="icon-tile flex items-center gap-1 rounded-lg px-3 py-2 font-bold text-ink disabled:opacity-40"
          >
            {t.next}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <DetailModal
            expr={open}
            t={t}
            canAdd={!!user}
            isAdded={added.has(open.slug)}
            onAdd={() => addToCards(open)}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 min-w-11 rounded-lg border px-3 py-1.5 text-xs font-black transition-all",
        active
          ? "border-brand-400 bg-brand-600/12 text-brand-600 shadow-[0_10px_26px_rgba(40,135,115,0.1)] dark:text-brand-200"
          : "border-line bg-card/42 text-ink-soft hover:-translate-y-0.5 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-ink/5 px-2 py-0.5 font-bold text-ink-soft dark:bg-white/10">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-ink-soft">{title}</p>
      <div className="mt-1 text-sm leading-7 text-ink">{children}</div>
    </div>
  );
}

function DetailModal({
  expr,
  t,
  canAdd,
  isAdded,
  onAdd,
  onClose,
}: {
  expr: ExpressionDetail;
  t: T;
  canAdd: boolean;
  isAdded: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    (focusable()[0] ?? dialog).focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/60 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl dark:bg-black/72 sm:items-center sm:p-6"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={expr.expression}
        initial={{ y: 22, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 22, opacity: 0, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="surface-panel my-auto flex max-h-[calc(100svh-1.5rem)] w-full max-w-2xl touch-pan-y flex-col overflow-hidden rounded-lg p-0 shadow-2xl sm:max-h-[calc(100svh-3rem)]"
      >
        <div className="sticky top-0 z-10 shrink-0 border-b border-line/70 bg-raised/94 p-5 backdrop-blur-md sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-ink">{expr.expression}</h2>
                <button
                  type="button"
                  onClick={() => speak(expr.expression)}
                  aria-label={t.listen}
                  title={t.listen}
                  className="icon-tile flex size-11 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-brand-600"
                >
                  <Volume2 className="size-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1 font-bold text-brand-600 dark:text-brand-200">
                {expr.translation ?? expr.usage}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              title={t.close}
              className="icon-tile flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
            <Tag>{expr.category}</Tag>
            <span className={cn("rounded-md bg-ink/5 px-2 py-0.5 font-black dark:bg-white/10", CEFR_COLOR(expr.cefr))}>
              {expr.cefr}
            </span>
            <Tag>IELTS {expr.ielts_band}</Tag>
            <Tag>{expr.formality}</Tag>
          </div>

          {canAdd && (
            <button
              type="button"
              onClick={onAdd}
              disabled={isAdded}
              className={cn(
                "mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-black transition-all",
                isAdded
                  ? "bg-success/10 text-success-text"
                  : "bg-brand-600 text-white shadow-[0_18px_50px_rgba(40,135,115,0.24)] hover:-translate-y-0.5 hover:bg-brand-700"
              )}
            >
              {isAdded ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              {isAdded ? t.addedToCards : t.addToCards}
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto px-5 py-5 pr-4 [overscroll-behavior:contain] sm:px-6 sm:py-6 sm:pr-5">
          <div className="space-y-5">
            <Section title={t.usage}>{expr.usage}</Section>
            <Section title={t.grammar}>
              <code className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[13px] dark:bg-white/10">
                {expr.grammar_pattern}
              </code>
            </Section>
            {expr.example_sentences.length > 0 && (
              <Section title={t.examples}>
                <ul className="space-y-2">
                  {expr.example_sentences.map((s, i) => (
                    <li key={i} className="border-l-2 border-line pl-3 italic text-ink-soft">
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {expr.collocations.length > 0 && (
              <Section title={t.collocations}>{expr.collocations.join(" · ")}</Section>
            )}
            {expr.alternatives.length > 0 && (
              <Section title={t.alternatives}>{expr.alternatives.join(", ")}</Section>
            )}
            {expr.synonyms.length > 0 && (
              <Section title={t.synonyms}>{expr.synonyms.join(", ")}</Section>
            )}
            {expr.opposites.length > 0 && (
              <Section title={t.opposites}>{expr.opposites.join(", ")}</Section>
            )}
            {expr.common_mistakes.length > 0 && (
              <Section title={t.mistakes}>
                <ul className="space-y-2">
                  {expr.common_mistakes.map((m, i) => (
                    <li key={i} className="flex gap-2 text-danger-text">
                      <AlertTriangle className="mt-1 size-4 shrink-0" aria-hidden />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {expr.native_notes && (
              <div className="rounded-lg border border-brand-400/20 bg-brand-600/5 p-4">
                <Section title={t.nativeNotes}>
                  <span className="mb-2 flex items-center gap-2">
                    <Lightbulb className="size-4 text-accent-600 dark:text-accent-300" aria-hidden />
                  </span>
                  {expr.native_notes}
                </Section>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
