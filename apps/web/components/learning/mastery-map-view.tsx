"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleDot,
  Map,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { learningApi, type MasteryLevel, type MasteryMap } from "@/lib/learning";
import { cn } from "@/lib/utils";

type StageKey = "new" | "learning" | "strong" | "mastered";

const LEVEL_STYLE: Record<MasteryLevel["level"], { badge: string; glow: string }> = {
  A1: { badge: "bg-brand-500/14 text-brand-700 dark:text-brand-300", glow: "from-brand-500/18" },
  A2: { badge: "bg-accent-500/14 text-accent-600 dark:text-accent-300", glow: "from-accent-500/18" },
  B1: { badge: "bg-sand-200/70 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200", glow: "from-sand-200/70" },
  B2: { badge: "bg-brand-700/14 text-brand-800 dark:text-brand-200", glow: "from-brand-700/18" },
  C1: { badge: "bg-brand-400/14 text-brand-700 dark:text-brand-200", glow: "from-brand-400/18" },
  C2: { badge: "bg-brand-800/14 text-brand-800 dark:text-brand-200", glow: "from-brand-800/18" },
};

const STAGES: { key: StageKey; icon: LucideIcon; dot: string; bar: string }[] = [
  { key: "new", icon: CircleDot, dot: "bg-ink/25", bar: "bg-ink/16 dark:bg-white/18" },
  { key: "learning", icon: BookOpen, dot: "bg-accent-500", bar: "bg-accent-500" },
  { key: "strong", icon: Brain, dot: "bg-brand-500", bar: "bg-brand-500" },
  { key: "mastered", icon: CheckCircle2, dot: "bg-success", bar: "bg-success" },
];

export function MasteryMapView({
  lang,
  t,
  loadingLabel,
}: {
  lang: string;
  t: Dictionary["mastery"];
  loadingLabel: string;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MasteryMap | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [lang, ready, router, user]);

  const load = useCallback(() => {
    if (!ready || !user) return;
    setError(false);
    learningApi
      .masteryMap()
      .then(setData)
      .catch(() => setError(true));
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    learningApi
      .masteryMap()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const number = useMemo(() => new Intl.NumberFormat(lang), [lang]);

  if (!ready || !user || (!data && !error)) {
    return <MasteryLoading label={loadingLabel} />;
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16 sm:px-6">
        <Alert tone="error" className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>{t.loadError}</span>
            <Button size="sm" variant="ghost" onClick={load}>
              {t.retry}
            </Button>
          </div>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
      <section className="surface-panel rounded-lg px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase text-accent-700 dark:text-accent-300">
              <Map className="size-4" aria-hidden />
              {t.eyebrow}
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl tracking-wide text-ink sm:text-6xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {t.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-line/80 pt-5">
              <SummaryStat label={t.currentLevel} value={data.current_level} />
              <SummaryStat label={t.startedWords} value={number.format(data.started_words)} />
              <SummaryStat label={t.masteredWords} value={number.format(data.mastered_words)} />
            </div>
          </div>

          <div
            className="relative mx-auto flex size-44 shrink-0 items-center justify-center rounded-full p-3 sm:size-52"
            style={{
              background: `conic-gradient(var(--color-brand-500) ${data.overall_percent}%, color-mix(in srgb, var(--ink) 10%, transparent) 0)`,
            }}
            role="progressbar"
            aria-valuenow={data.overall_percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t.overall}
          >
            <div className="flex size-full flex-col items-center justify-center rounded-full border border-line bg-card text-center shadow-inner">
              <Sparkles className="size-5 text-accent-600 dark:text-accent-300" aria-hidden />
              <strong className="mt-2 text-4xl font-black text-ink">{data.overall_percent}%</strong>
              <span className="mt-1 max-w-28 text-xs font-bold leading-4 text-ink-soft">{t.overall}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="mastery-map-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="mastery-map-title" className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
              {t.mapTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">{t.mapSubtitle}</p>
          </div>
          <p className="text-sm font-bold text-ink-soft">
            {number.format(data.total_words)} {t.words} · {t.ofCorpus}
          </p>
        </div>

        <div className="relative mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.levels.map((level, index) => (
            <LevelCard
              key={level.level}
              level={level}
              current={level.level === data.current_level}
              index={index}
              lang={lang}
              t={t}
              number={number}
            />
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-7" aria-labelledby="mastery-legend-title">
        <h2 id="mastery-legend-title" className="text-sm font-black uppercase text-ink">
          {t.legendTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map(({ key, icon: Icon, dot }) => (
            <div key={key} className="flex items-start gap-3">
              <span className={cn("mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-white", dot)}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-black text-ink">{t[key]}</p>
                <p className="mt-0.5 text-xs leading-5 text-ink-soft">{t[`legend${capitalize(key)}`]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function LevelCard({
  level,
  current,
  index,
  lang,
  t,
  number,
}: {
  level: MasteryLevel;
  current: boolean;
  index: number;
  lang: string;
  t: Dictionary["mastery"];
  number: Intl.NumberFormat;
}) {
  const style = LEVEL_STYLE[level.level];
  const started = level.started > 0;

  return (
    <motion.article
      className={cn(
        "premium-card group overflow-hidden rounded-lg p-5",
        current && "border-brand-400 shadow-[0_24px_70px_rgba(30,120,99,0.16)]"
      )}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b to-transparent", style.glow)} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-12 items-center justify-center rounded-lg text-lg font-black", style.badge)}>
            {level.level}
          </span>
          <div>
            <p className="text-xs font-bold text-ink-soft">
              {number.format(level.total)} {t.words}
            </p>
            {current && (
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-black uppercase text-brand-700 dark:text-brand-300">
                <Sparkles className="size-3" aria-hidden /> {t.active}
              </span>
            )}
          </div>
        </div>
        <strong className="text-2xl font-black text-ink">{level.progress_percent}%</strong>
      </div>

      <div
        className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-ink/8 dark:bg-white/8"
        role="progressbar"
        aria-valuenow={level.progress_percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${level.level} ${t.overall}`}
      >
        {STAGES.map(({ key, bar }) => (
          <motion.span
            key={key}
            className={bar}
            initial={{ width: 0 }}
            animate={{ width: `${(level[key] / Math.max(1, level.total)) * 100}%` }}
            transition={{ duration: 0.7, delay: 0.15 + index * 0.05 }}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
        {STAGES.map(({ key, dot }) => (
          <div key={key} className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
            <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-ink-soft">
              <span className={cn("size-2 shrink-0 rounded-full", dot)} />
              <span className="truncate">{t[key]}</span>
            </span>
            <strong className="text-sm text-ink">{number.format(level[key])}</strong>
          </div>
        ))}
      </div>

      <Link
        href={`/${lang}/library/${level.level.toLowerCase()}`}
        className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-black text-brand-700 transition-colors hover:text-brand-500 dark:text-brand-200"
      >
        {started ? t.continue : t.start}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
    </motion.article>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong className="block text-xl font-black text-ink">{value}</strong>
      <span className="mt-1 block text-xs font-bold text-ink-soft">{label}</span>
    </div>
  );
}

function MasteryLoading({ label }: { label: string }) {
  return (
    <main className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6" aria-label={label}>
      <div className="surface-panel h-72 animate-pulse rounded-lg bg-card/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-lg border border-line bg-card/60" />
        ))}
      </div>
    </main>
  );
}

function capitalize(value: StageKey): "New" | "Learning" | "Strong" | "Mastered" {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as
    | "New"
    | "Learning"
    | "Strong"
    | "Mastered";
}
