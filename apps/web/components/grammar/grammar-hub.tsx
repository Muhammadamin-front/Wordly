"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpenCheck, CheckCircle2, CircleDot, GraduationCap, Layers3 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { GRAMMAR_LEVELS, LESSONS_BY_LEVEL, type GrammarLevel } from "@/lib/grammar";
import { localiseLesson } from "@/lib/grammar/localise";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type T = Dictionary["grammar"];

const LEVEL_ACCENT: Record<GrammarLevel, string> = {
  A1: "border-accent-400/60 bg-accent-400/10 text-accent-600 dark:text-accent-300",
  A2: "border-success/50 bg-success/10 text-success",
  B1: "border-brand-400/60 bg-brand-500/10 text-brand-600 dark:text-brand-300",
  B2: "border-accent-400/60 bg-accent-500/10 text-accent-600 dark:text-accent-300",
  IELTS: "border-warning/50 bg-warning/10 text-warning",
};

const DONE_KEY = "vocora:grammar-done";
const LEGACY_DONE_KEY = "wordly:grammar-done";

function subscribeToDone(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/** Grammar course hub: level tabs → lesson list with completion marks. */
export function GrammarHub({ lang, t }: { lang: string; t: T }) {
  const [level, setLevel] = useState<GrammarLevel>("A1");
  // Hydration-safe localStorage read: the server snapshot renders empty, the
  // client re-renders with real progress right after hydration.
  const doneJson = useSyncExternalStore(
    subscribeToDone,
    () => (window.localStorage.getItem(DONE_KEY) ?? window.localStorage.getItem(LEGACY_DONE_KEY)) ?? "[]",
    () => "[]"
  );
  const done = useMemo(() => {
    try {
      return new Set(JSON.parse(doneJson) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [doneJson]);

  const lessons = LESSONS_BY_LEVEL[level].map((lesson) => localiseLesson(lesson, lang));
  const totalLessons = GRAMMAR_LEVELS.reduce((sum, lv) => sum + LESSONS_BY_LEVEL[lv].length, 0);
  const totalDone = [...done].length;
  const progress = Math.round((totalDone / totalLessons) * 100);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <section className="surface-panel light-sweep rounded-lg p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
              <Layers3 className="size-4" aria-hidden />
              {t.studio}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
              {t.subtitle}
            </p>
          </div>
          <div className="premium-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="icon-tile size-12 rounded-lg text-brand-500">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-ink">
                  {totalDone}/{totalLessons}
                </p>
                <p className="text-[11px] font-extrabold uppercase text-ink-soft">{t.completed}</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand-500 via-brand-300 to-accent-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-ink-soft">{t.cefrPath}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {level} · {lessons.length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {GRAMMAR_LEVELS.map((lv) => {
          const doneInLevel = LESSONS_BY_LEVEL[lv].filter((l) => done.has(l.slug)).length;
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              className={cn(
                "shrink-0 rounded-lg border px-4 py-2 text-sm font-extrabold transition-all hover:-translate-y-0.5",
                lv === level ? `${LEVEL_ACCENT[lv]} shadow-lg` : "border-line bg-card/60 text-ink-soft hover:text-ink"
              )}
            >
              {lv}
              <span className="ml-1.5 text-xs font-semibold opacity-70">
                {doneInLevel}/{LESSONS_BY_LEVEL[lv].length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/${lang}/grammar/${lesson.slug}`}
              className="premium-card group flex items-center gap-4 rounded-lg p-4"
            >
              <span className="icon-tile size-12 shrink-0 rounded-lg text-brand-500 transition-transform group-hover:rotate-3 group-hover:scale-105">
                <BookOpenCheck className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-ink">
                  {i + 1}. {lesson.title}
                </p>
                <p className="truncate text-sm text-ink-soft">{lesson.titleUz}</p>
              </div>
              {done.has(lesson.slug) ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {t.done}
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-ink-soft">
                  <CircleDot className="size-4 text-accent-500" aria-hidden />
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
