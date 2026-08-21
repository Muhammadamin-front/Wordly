"use client";

import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleAlert,
  Gauge,
  Map,
  RefreshCw,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { learningApi, type LearningPlan } from "@/lib/learning";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type StepKey = "review" | "mistakes" | "adaptive" | "story";

interface RouteStep {
  key: StepKey;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  meta: string;
}

export function TodayView({
  lang,
  t,
  common,
}: {
  lang: string;
  t: Dictionary["learning"];
  common: Dictionary["common"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [error, setError] = useState(false);
  const [manualDone, setManualDone] = useState<StepKey[]>([]);

  const storageKey = useMemo(
    () =>
      user
        ? `vocora:daily-path:${user.id}:${new Date().toISOString().slice(0, 10)}`
        : "",
    [user]
  );

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    learningApi
      .plan()
      .then(setPlan)
      .catch(() => setError(true));
  }, [ready, user]);

  useEffect(() => {
    if (!storageKey) return;
    let saved: StepKey[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as StepKey[];
    } catch {}
    const timer = window.setTimeout(() => setManualDone(saved), 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  if (!ready || !user || !plan) {
    return (
      <main className="app-container flex-1 py-8">
        {error ? (
          <EmptyState
            className="mx-auto max-w-lg"
            icon={RefreshCw}
            title={t.loadError}
            body={common.error}
            actionLabel={t.retry}
            onAction={() => window.location.reload()}
          />
        ) : (
          <section aria-label={common.loading}>
            <Skeleton className="h-64 rounded-[28px]" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-3xl" />
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  const autoDone: StepKey[] = [];
  const availableReviews = plan.due_count + plan.new_count;
  const reviewTarget = Math.min(plan.daily_target, availableReviews);
  if (reviewTarget === 0 || plan.reviewed_today >= reviewTarget) {
    autoDone.push("review");
  }
  if (plan.mistake_count === 0) autoDone.push("mistakes");
  const done = new Set([...manualDone, ...autoDone]);

  const steps: RouteStep[] = [
    {
      key: "review",
      icon: BookOpenCheck,
      title: t.reviewStep,
      description: t.reviewStepDesc,
      href: `/${lang}/review`,
      meta: `${plan.reviewed_today}/${reviewTarget} ${t.reviewedToday.toLowerCase()}`,
    },
    {
      key: "mistakes",
      icon: CircleAlert,
      title: t.mistakesStep,
      description: t.mistakesStepDesc,
      href: `/${lang}/mistakes`,
      meta: `${plan.mistake_count} ${t.mistakesCount}`,
    },
    {
      key: "adaptive",
      icon: Gauge,
      title: t.adaptiveStep,
      description: t.adaptiveStepDesc,
      href: `/${lang}/games/${plan.recommended_game}`,
      meta: `${t.adaptiveLevel}: ${t[plan.difficulty]}`,
    },
    {
      key: "story",
      icon: Map,
      title: t.storyStep,
      description: t.storyStepDesc,
      href: `/${lang}/games/story_mode`,
      meta: t.storyMeta,
    },
  ];
  const completed = steps.filter((step) => done.has(step.key)).length;
  const nextStep = steps.find((step) => !done.has(step.key)) ?? steps[0];

  function toggleDone(key: StepKey) {
    if (autoDone.includes(key)) return;
    setManualDone((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel rounded-[18px] p-5 sm:p-7 lg:p-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="icon-tile size-12 rounded-lg">
              <Target className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
            </span>
            <p className="print-label mt-5 inline-flex border-accent-500 bg-accent-400/10 text-accent-600 dark:text-accent-300">
              {t.todayEyebrow}
            </p>
            <h1 className="type-h1 mt-3 max-w-3xl text-ink">
              {t.todayTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {t.todaySubtitle}
            </p>
          </div>
          <Link
            href={nextStep.href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border-2 border-brand-950 bg-brand-600 px-6 text-sm font-black text-white shadow-[4px_5px_0_#54250f] transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[6px_7px_0_#54250f]"
          >
            {completed === steps.length ? t.startAgain : t.continue}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
          <Metric label={t.due} value={plan.due_count} />
          <Metric label={t.newWords} value={plan.new_count} />
          <Metric label={t.reviewedToday} value={plan.reviewed_today} />
          <Metric label={t.recentAccuracy} value={`${plan.recent_accuracy}%`} />
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl tracking-wide text-ink">{t.todaysRoute}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t.routeDescription}</p>
          </div>
          <span className="text-sm font-black text-brand-700 dark:text-brand-200">
            {completed}/4
          </span>
        </div>
        <Progress
          className="mt-4"
          value={(completed / steps.length) * 100}
          label={t.todaysRoute}
          barClassName="bg-brand-600"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDone = done.has(step.key);
            return (
              <motion.article
                key={step.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="premium-card rounded-[14px] p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="icon-tile size-11 rounded-lg">
                    <Icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDone(step.key)}
                    disabled={autoDone.includes(step.key)}
                    aria-label={isDone ? t.markIncomplete : t.markComplete}
                    className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${
                      isDone
                        ? "border-success/30 bg-success/12 text-success"
                        : "border-line bg-card text-ink-soft hover:text-ink"
                    }`}
                  >
                    <Check className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="print-label mt-5 inline-flex border-accent-500 bg-accent-400/10 text-accent-600 dark:text-accent-300">
                  {index + 1}. {step.meta}
                </p>
                <h3 className="mt-3 font-display text-3xl tracking-wide text-ink">{step.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-ink-soft">{step.description}</p>
                <Link
                  href={step.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-brand-700 transition-colors hover:text-brand-500 dark:text-brand-200"
                >
                  {isDone ? t.repeat : t.start}
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-display text-4xl tracking-wide text-ink sm:text-5xl">{value}</p>
      <p className="mt-1 text-xs font-bold text-ink-soft">{label}</p>
    </div>
  );
}
