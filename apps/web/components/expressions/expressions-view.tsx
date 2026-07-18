"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
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
import type { Dictionary } from "@/app/[lang]/dictionaries";

type T = Dictionary["expressions"];

const CEFR_LEVELS = ["A2", "B1", "B2", "C1", "C2"];

export function ExpressionsView({ t }: { lang: string; t: T }) {
  const { user } = useAuth();
  // Slugs the user has added to their SRS deck this session (best-effort UI).
  const [added, setAdded] = useState<Set<string>>(new Set());

  const addToCards = useCallback(
    async (e: ExpressionDetail | ExpressionListItem) => {
      if (added.has(e.slug)) return;
      setAdded((prev) => new Set(prev).add(e.slug));
      try {
        await flashcardsApi.createCustomCard(e.expression, e.uzbek);
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

  const [meta, setMeta] = useState<ExpressionMeta | null>(null);
  const [items, setItems] = useState<ExpressionListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [cefr, setCefr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ExpressionDetail | null>(null);

  useEffect(() => {
    expressionsApi.meta().then(setMeta).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setItems(null);
    expressionsApi
      .list({ page, category: category ?? undefined, cefr: cefr ?? undefined, q: q || undefined })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setItems([]));
  }, [page, category, cefr, q]);

  useEffect(() => {
    const id = window.setTimeout(load, q ? 300 : 0); // debounce search only
    return () => window.clearTimeout(id);
  }, [load, q]);

  function reset(next: () => void) {
    setPage(1);
    next();
  }

  const pageCount = Math.max(1, Math.ceil(total / 24));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">💬 {t.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p>
        </div>
        {meta && (
          <span className="shrink-0 rounded-xl border border-line bg-card px-3 py-2 text-center">
            <span className="block text-lg font-extrabold text-brand-600 dark:text-brand-300">
              {meta.total}
            </span>
            <span className="text-[10px] font-semibold uppercase text-ink-soft">{t.total}</span>
          </span>
        )}
      </div>

      {/* Search + CEFR filters */}
      <div className="mt-6 space-y-3">
        <input
          value={q}
          onChange={(e) => reset(() => setQ(e.target.value))}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
        />
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

      {/* Category chips */}
      {meta && meta.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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

      {/* Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items === null
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : items.map((e, i) => (
              <motion.button
                key={e.slug}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => expressionsApi.detail(e.slug).then(setOpen).catch(() => {})}
                className="flex flex-col rounded-2xl border border-line bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-ink">{e.expression}</p>
                  <span className={cn("shrink-0 text-xs font-bold", CEFR_COLOR(e.cefr))}>
                    {e.cefr}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{e.uzbek}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <Tag>{e.category}</Tag>
                  <Tag>IELTS {e.ielts_band}</Tag>
                  <Tag>{e.formality}</Tag>
                </div>
              </motion.button>
            ))}
      </div>

      {items && items.length === 0 && (
        <p className="mt-10 text-center text-ink-soft">{t.empty}</p>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink disabled:opacity-40"
          >
            ← {t.prev}
          </button>
          <span className="text-ink-soft">
            {page} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink disabled:opacity-40"
          >
            {t.next} →
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
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-brand-500 bg-brand-600/10 text-brand-600 dark:text-brand-300"
          : "border-line text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium text-ink-soft dark:bg-white/10">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</p>
      <div className="mt-1 text-sm text-ink">{children}</div>
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-card p-6 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-ink">{expr.expression}</h2>
              <button
                type="button"
                onClick={() => speak(expr.expression)}
                title={t.listen}
                className="text-ink-soft transition-colors hover:text-brand-600"
              >
                🔊
              </button>
            </div>
            <p className="mt-0.5 font-semibold text-brand-600 dark:text-brand-300">{expr.uzbek}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-ink-soft">
            ×
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <Tag>{expr.category}</Tag>
          <span className={cn("rounded-full bg-ink/5 px-2 py-0.5 font-bold dark:bg-white/10", CEFR_COLOR(expr.cefr))}>
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
              "mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              isAdded
                ? "bg-success/10 text-success"
                : "bg-brand-600 text-white hover:bg-brand-700"
            )}
          >
            {isAdded ? `✓ ${t.addedToCards}` : `➕ ${t.addToCards}`}
          </button>
        )}

        <div className="mt-5 space-y-4">
          <Section title={t.usage}>{expr.usage}</Section>
          <Section title={t.grammar}>
            <code className="rounded bg-ink/5 px-1.5 py-0.5 text-[13px] dark:bg-white/10">
              {expr.grammar_pattern}
            </code>
          </Section>
          {expr.example_sentences.length > 0 && (
            <Section title={t.examples}>
              <ul className="space-y-1.5">
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
              <ul className="space-y-1">
                {expr.common_mistakes.map((m, i) => (
                  <li key={i} className="text-danger">
                    ⚠ {m}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {expr.native_notes && (
            <div className="rounded-2xl bg-brand-600/5 p-3">
              <Section title={`💡 ${t.nativeNotes}`}>{expr.native_notes}</Section>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
