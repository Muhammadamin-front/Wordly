"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { GRAMMAR_LEVELS, LESSONS_BY_LEVEL, type GrammarLevel } from "@/lib/grammar";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type T = Dictionary["grammar"];

const LEVEL_ACCENT: Record<GrammarLevel, string> = {
  A1: "border-green-400/50 text-green-600 dark:text-green-400",
  A2: "border-emerald-400/50 text-emerald-600 dark:text-emerald-400",
  B1: "border-blue-400/50 text-blue-600 dark:text-blue-400",
  B2: "border-indigo-400/50 text-indigo-600 dark:text-indigo-400",
  IELTS: "border-orange-400/50 text-orange-600 dark:text-orange-400",
};

const DONE_KEY = "wordly:grammar-done";

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
    () => window.localStorage.getItem(DONE_KEY) ?? "[]",
    () => "[]"
  );
  const done = useMemo(() => {
    try {
      return new Set(JSON.parse(doneJson) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [doneJson]);

  const lessons = LESSONS_BY_LEVEL[level];
  const totalDone = [...done].length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">📘 {t.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p>
        </div>
        <div className="shrink-0 rounded-xl border border-line bg-card px-3 py-2 text-center">
          <p className="text-lg font-extrabold text-brand-600 dark:text-brand-300">
            {totalDone}/45
          </p>
          <p className="text-[10px] font-semibold uppercase text-ink-soft">{t.completed}</p>
        </div>
      </div>

      {/* Level tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {GRAMMAR_LEVELS.map((lv) => {
          const doneInLevel = LESSONS_BY_LEVEL[lv].filter((l) => done.has(l.slug)).length;
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              className={cn(
                "shrink-0 rounded-xl border-2 bg-card px-4 py-2 text-sm font-bold transition-all",
                lv === level ? `${LEVEL_ACCENT[lv]} shadow-sm` : "border-line text-ink-soft hover:text-ink"
              )}
            >
              {lv === "IELTS" ? "🎓 IELTS" : lv}
              <span className="ml-1.5 text-xs font-semibold opacity-70">
                {doneInLevel}/{LESSONS_BY_LEVEL[lv].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lesson list */}
      <div className="mt-4 space-y-2">
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/${lang}/grammar/${lesson.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden>
                {lesson.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">
                  {i + 1}. {lesson.title}
                </p>
                <p className="truncate text-sm text-ink-soft">{lesson.titleUz}</p>
              </div>
              {done.has(lesson.slug) ? (
                <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  ✓ {t.done}
                </span>
              ) : (
                <span className="shrink-0 text-sm font-bold text-ink-soft">→</span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
