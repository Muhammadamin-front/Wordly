"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { flashcardsApi } from "@/lib/flashcards";
import { gamificationApi, STATS_CHANGED_EVENT, type Stats } from "@/lib/gamification";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const GOAL_OPTIONS = [10, 20, 30, 50];

export function DashboardView({
  lang,
  dict,
  gam,
}: {
  lang: string;
  dict: Pick<Dictionary, "dashboard" | "nav" | "common">;
  gam: Dictionary["gam"];
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const loadStats = () =>
      gamificationApi.stats().then((s) => !cancelled && setStats(s)).catch(() => {});
    flashcardsApi
      .queue()
      .then((queue) => {
        if (!cancelled) setDueCount(queue.due_count + queue.new_count);
      })
      .catch(() => {});
    loadStats();
    window.addEventListener(STATS_CHANGED_EVENT, loadStats);
    return () => {
      cancelled = true;
      window.removeEventListener(STATS_CHANGED_EVENT, loadStats);
    };
  }, [ready, user]);

  async function changeGoal(goal: number) {
    const updated = await gamificationApi.setDailyGoal(goal);
    setStats(updated);
  }

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span
          aria-label={dict.common.loading}
          className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {dict.dashboard.welcome}, {user.profile.display_name}! 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{dict.dashboard.todayTitle}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logout();
            router.push(`/${lang}`);
          }}
        >
          {dict.nav.logout}
        </Button>
      </div>

      {!user.email_verified && (
        <Alert tone="info" className="mt-6">
          {dict.dashboard.verifyBanner}
        </Alert>
      )}

      {/* Stats strip */}
      {stats && (
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl2 border border-line bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-orange-500">🔥 {stats.current_streak}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{gam.streak}</p>
          </div>
          <div className="rounded-xl2 border border-line bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-300">
              ⚡ {stats.level}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {stats.xp_into_level}/{stats.xp_for_next_level} XP
            </p>
          </div>
          <div className="rounded-xl2 border border-line bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-500">🪙 {stats.coins}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{gam.coins}</p>
          </div>
          <Link
            href={`/${lang}/leaderboard`}
            className="rounded-xl2 border border-line bg-card p-4 text-center transition-colors hover:border-brand-400/60"
          >
            <p className="text-2xl font-extrabold text-ink">🏆</p>
            <p className="mt-0.5 text-xs capitalize text-ink-soft">{stats.league_tier}</p>
          </Link>
        </section>
      )}

      {/* Today's review hero */}
      <section className="mt-4">
        <Card className="bg-linear-to-br from-brand-600/10 to-accent-500/5 text-center">
          <p className="text-4xl" aria-hidden>
            🐆
          </p>
          <CardTitle className="mt-3">{dict.dashboard.reviewHeroTitle}</CardTitle>
          <CardDescription className="mx-auto max-w-md">
            {dueCount !== null && dueCount > 0
              ? `${dueCount} ${dict.dashboard.dueToday}`
              : dict.dashboard.reviewHeroBody}
          </CardDescription>

          {stats && (
            <div className="mx-auto mt-4 max-w-xs">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>{gam.dailyGoal}</span>
                <span>
                  {stats.reviews_today}/{stats.daily_goal} {gam.goalReviews}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-500 to-accent-500 transition-all"
                  style={{
                    width: `${Math.min(100, (stats.reviews_today / stats.daily_goal) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-xs text-ink-soft">{gam.setGoal}:</span>
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => void changeGoal(goal)}
                    className={
                      "rounded-md px-2 py-0.5 text-xs font-bold transition-colors " +
                      (stats.daily_goal === goal
                        ? "bg-brand-600 text-white"
                        : "text-ink-soft hover:bg-line")
                    }
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link href={`/${lang}/review`} className="mt-5 inline-block">
            <Button>{dict.dashboard.startReview}</Button>
          </Link>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href={`/${lang}/vocabulary`}
          className="block rounded-xl2 border border-brand-400/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span aria-hidden className="text-2xl">
            📚
          </span>
          <CardTitle className="mt-2 text-base text-brand-600 dark:text-brand-300">
            {dict.dashboard.cardVocabulary} →
          </CardTitle>
          <CardDescription className="text-xs">
            {dict.dashboard.cardVocabularyDesc}
          </CardDescription>
        </Link>

        <Link
          href={`/${lang}/decks`}
          className="relative block rounded-xl2 border border-accent-500/40 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          {dueCount !== null && dueCount > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {dueCount}
            </span>
          )}
          <span aria-hidden className="text-2xl">
            🃏
          </span>
          <CardTitle className="mt-2 text-base text-accent-600 dark:text-accent-300">
            {dict.dashboard.cardReview} →
          </CardTitle>
          <CardDescription className="text-xs">{dict.dashboard.cardReviewDesc}</CardDescription>
        </Link>

        <Card className="relative overflow-hidden opacity-80">
          <span className="absolute right-3 top-3 rounded-full bg-line/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            {dict.dashboard.comingSoon}
          </span>
          <span aria-hidden className="text-2xl">
            🎮
          </span>
          <CardTitle className="mt-2 text-base">{dict.dashboard.cardGames}</CardTitle>
          <CardDescription className="text-xs">{dict.dashboard.cardGamesDesc}</CardDescription>
        </Card>
      </section>
    </main>
  );
}
