"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Lock,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { usePremiumStatus } from "@/components/billing/use-premium-status";
import {
  FREE_GRAMMAR_LEVELS,
  GRAMMAR_LEVELS,
  GRAMMAR_PROGRESS_EVENT,
  PROGRESS_STORAGE_KEY,
  masteryStatus,
  type CefrGrammarLevel,
  type GrammarLessonSummary,
  type GrammarMasteryStatus,
  type GrammarProgressEntry,
} from "@/lib/grammar";
import { cn } from "@/lib/utils";

type T = Dictionary["grammar"];
type StatusFilter = "all" | GrammarMasteryStatus;

const DONE_KEY = "vocora:grammar-done";
const LEGACY_DONE_KEY = "wordly:grammar-done";

const LEVEL_ACCENT: Record<CefrGrammarLevel, string> = {
  A1: "border-accent-400/60 bg-accent-400/10 text-accent-600 dark:text-accent-300",
  A2: "border-success/50 bg-success/10 text-success",
  B1: "border-brand-400/60 bg-brand-500/10 text-brand-600 dark:text-brand-300",
  B2: "border-accent-400/60 bg-accent-500/10 text-accent-600 dark:text-accent-300",
  C1: "border-warning/50 bg-warning/10 text-warning",
};

const STATUS_STYLE: Record<GrammarMasteryStatus, string> = {
  "not-started": "border-line bg-card/70 text-ink-soft",
  weak: "border-danger/30 bg-danger/10 text-danger",
  "needs-review": "border-warning/30 bg-warning/10 text-warning",
  good: "border-brand-400/30 bg-brand-500/10 text-brand-600 dark:text-brand-300",
  mastered: "border-success/30 bg-success/10 text-success",
};

const COPY = {
  uz: {
    search: "Grammar mavzusini qidiring...",
    allCategories: "Barcha kategoriyalar",
    allStatuses: "Barcha holatlar",
    weak: "Zaif grammatikangiz",
    weakHint: "Eng past natijali mavzularni avval takrorlang.",
    noWeak: "Hali natija yo‘q. Birinchi darsni ishlab ko‘ring.",
    noResults: "Bu filtr bo‘yicha dars topilmadi.",
    minutes: "daq",
    statuses: { "not-started": "Boshlanmagan", weak: "Zaif", "needs-review": "Takrorlash kerak", good: "Yaxshi", mastered: "O‘zlashtirilgan" },
    premiumLocked: "Premium kerak",
  },
  ru: {
    search: "Найти тему грамматики...",
    allCategories: "Все категории",
    allStatuses: "Все статусы",
    weak: "Слабые темы",
    weakHint: "Сначала повторите темы с самым низким результатом.",
    noWeak: "Результатов пока нет. Пройдите первый урок.",
    noResults: "По этим фильтрам уроки не найдены.",
    minutes: "мин",
    statuses: { "not-started": "Не начато", weak: "Слабо", "needs-review": "Повторить", good: "Хорошо", mastered: "Освоено" },
    premiumLocked: "Нужен Премиум",
  },
  en: {
    search: "Search grammar topics...",
    allCategories: "All categories",
    allStatuses: "All statuses",
    weak: "Your weak grammar",
    weakHint: "Review your lowest-scoring topics first.",
    noWeak: "No results yet. Complete your first lesson.",
    noResults: "No lessons match these filters.",
    minutes: "min",
    statuses: { "not-started": "Not started", weak: "Weak", "needs-review": "Needs review", good: "Good", mastered: "Mastered" },
    premiumLocked: "Premium required",
  },
} as const;

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(GRAMMAR_PROGRESS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(GRAMMAR_PROGRESS_EVENT, callback);
  };
}

function progressSnapshot(): string {
  return `${window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}"}\n${window.localStorage.getItem(DONE_KEY) ?? window.localStorage.getItem(LEGACY_DONE_KEY) ?? "[]"}`;
}

function parseProgress(snapshot: string): Record<string, GrammarProgressEntry> {
  const [progressJson = "{}", doneJson = "[]"] = snapshot.split("\n");
  try {
    const progress = JSON.parse(progressJson) as Record<string, GrammarProgressEntry>;
    const done = JSON.parse(doneJson) as unknown;
    if (Array.isArray(done)) {
      for (const slug of done) {
        if (typeof slug === "string") progress[slug] ??= { attempts: 1, bestScore: 100, lastScore: 100, updatedAt: new Date(0).toISOString() };
      }
    }
    return progress;
  } catch {
    return {};
  }
}

export function GrammarHub({ lang, t, lessons }: { lang: string; t: T; lessons: GrammarLessonSummary[] }) {
  const copy = COPY[lang === "ru" ? "ru" : lang === "en" ? "en" : "uz"];
  const [level, setLevel] = useState<CefrGrammarLevel>("A1");
  const isPremium = usePremiumStatus();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const snapshot = useSyncExternalStore(subscribe, progressSnapshot, () => "{}\n[]");
  const progressBySlug = useMemo(() => parseProgress(snapshot), [snapshot]);

  const levelLessons = useMemo(() => lessons.filter((lesson) => lesson.level === level), [lessons, level]);
  const categories = useMemo(() => [...new Set(levelLessons.map((lesson) => lesson.category))], [levelLessons]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return levelLessons.filter((lesson) => {
      const lessonStatus = masteryStatus(progressBySlug[lesson.slug]?.bestScore);
      return (!needle || `${lesson.title} ${lesson.titleUz} ${lesson.category}`.toLocaleLowerCase().includes(needle))
        && (category === "all" || lesson.category === category)
        && (status === "all" || lessonStatus === status);
    });
  }, [category, levelLessons, progressBySlug, query, status]);
  const grouped = useMemo(() => Object.entries(Object.groupBy(visible, (lesson) => lesson.category)), [visible]);
  const completed = lessons.filter((lesson) => masteryStatus(progressBySlug[lesson.slug]?.bestScore) === "mastered").length;
  const overall = Math.round((completed / lessons.length) * 100);
  const weak = useMemo(() => lessons
    .map((lesson) => ({ lesson, score: progressBySlug[lesson.slug]?.bestScore }))
    .filter((item): item is { lesson: GrammarLessonSummary; score: number } => typeof item.score === "number" && item.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3), [lessons, progressBySlug]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <section className="surface-panel light-sweep rounded-lg p-5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500"><Layers3 className="size-4" aria-hidden />{t.studio}</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{t.subtitle}</p>
          </div>
          <div className="premium-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-4"><span className="icon-tile size-12 rounded-lg text-brand-500"><GraduationCap className="size-5" aria-hidden /></span><div className="text-right"><p className="text-3xl font-extrabold text-ink">{completed}/{lessons.length}</p><p className="text-xs font-extrabold uppercase text-ink-soft">{t.completed}</p></div></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10"><div className="h-full rounded-full bg-linear-to-r from-brand-500 via-brand-300 to-accent-400 transition-[width]" style={{ width: `${overall}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 lg:grid-cols-3">
        <label className="relative lg:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-soft" aria-hidden /><span className="sr-only">{copy.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="min-h-12 w-full rounded-lg border border-line bg-card/80 py-3 pl-11 pr-4 text-base text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /></label>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label={copy.allCategories} value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 min-w-0 rounded-lg border border-line bg-card/80 px-3 text-base text-ink outline-none focus:border-brand-500"><option value="all">{copy.allCategories}</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label={copy.allStatuses} value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="min-h-12 min-w-0 rounded-lg border border-line bg-card/80 px-3 text-base text-ink outline-none focus:border-brand-500"><option value="all">{copy.allStatuses}</option>{Object.entries(copy.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-warning/25 bg-warning/5 p-4 sm:p-5">
        <div className="flex items-start gap-3"><span className="icon-tile size-10 shrink-0 rounded-lg text-warning"><Target className="size-4" aria-hidden /></span><div className="min-w-0"><h2 className="font-extrabold text-ink">{copy.weak}</h2><p className="mt-0.5 text-sm text-ink-soft">{copy.weakHint}</p></div></div>
        {weak.length ? <div className="mt-3 grid gap-2 sm:grid-cols-3">{weak.map(({ lesson, score }) => <Link key={lesson.slug} href={`/${lang}/grammar/${lesson.slug}`} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-line bg-card/70 px-3 py-2.5"><span className="truncate text-sm font-bold text-ink">{lesson.title}</span><span className="shrink-0 text-sm font-black text-warning">{score}%</span></Link>)}</div> : <p className="mt-3 text-sm text-ink-soft">{copy.noWeak}</p>}
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t.cefrPath}>
        {GRAMMAR_LEVELS.map((item) => {
          const levelItems = lessons.filter((lesson) => lesson.level === item);
          const mastered = levelItems.filter((lesson) => masteryStatus(progressBySlug[lesson.slug]?.bestScore) === "mastered").length;
          // Only lock once the subscription check has actually answered, so a
          // premium learner never sees a lock flash and then vanish.
          const locked = isPremium === false && !FREE_GRAMMAR_LEVELS.includes(item);
          if (locked) {
            return <Link key={item} href={`/${lang}/pricing`} role="tab" aria-selected={false} aria-label={`${item} — ${copy.premiumLocked}`} className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-card/40 px-4 py-2 text-sm font-extrabold text-ink-soft opacity-70 transition hover:opacity-100 active:translate-y-px">{item}<Lock className="size-3.5" aria-hidden /></Link>;
          }
          return <button key={item} type="button" role="tab" aria-selected={item === level} onClick={() => { setLevel(item); setCategory("all"); }} className={cn("min-h-11 shrink-0 rounded-lg border px-4 py-2 text-sm font-extrabold transition active:translate-y-px", item === level ? `${LEVEL_ACCENT[item]} shadow-lg` : "border-line bg-card/60 text-ink-soft hover:text-ink")}>{item}<span className="ml-1.5 text-xs font-semibold opacity-70">{mastered}/{levelItems.length}</span></button>;
        })}
      </div>

      <div className="mt-6 space-y-7">
        {grouped.length ? grouped.map(([group, items]) => items?.length ? <section key={group}>
          <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wide text-accent-500">{level}</p><h2 className="text-xl font-extrabold text-ink">{group}</h2></div><span className="text-sm font-semibold text-ink-soft">{items.length}</span></div>
          <div className="grid gap-3 md:grid-cols-2">{items.map((lesson, index) => {
            const entry = progressBySlug[lesson.slug];
            const lessonStatus = masteryStatus(entry?.bestScore);
            return <motion.div key={lesson.slug} className="min-w-0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .02, .16) }}><Link href={`/${lang}/grammar/${lesson.slug}`} className="premium-card group flex min-h-28 items-start gap-3 rounded-lg p-4"><span className="icon-tile size-11 shrink-0 rounded-lg text-brand-500"><BookOpenCheck className="size-5" aria-hidden /></span><div className="min-w-0 flex-1"><p className="line-clamp-2 text-base font-extrabold leading-6 text-ink">{lesson.title}</p><p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{lesson.titleUz}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className={cn("rounded-md border px-2 py-0.5 text-xs font-bold", STATUS_STYLE[lessonStatus])}>{copy.statuses[lessonStatus]}{entry ? ` · ${entry.bestScore}%` : ""}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft"><Clock3 className="size-3.5" aria-hidden />{lesson.estimatedMinutes} {copy.minutes}</span></div></div>{lessonStatus === "mastered" ? <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden /> : <ArrowUpRight className="size-5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />}</Link></motion.div>;
          })}</div>
        </section> : null) : <div className="surface-panel rounded-lg p-8 text-center"><Sparkles className="mx-auto size-7 text-accent-500" aria-hidden /><p className="mt-3 font-bold text-ink">{copy.noResults}</p></div>}
      </div>
    </main>
  );
}
