"use client";

import {
  BookOpenCheck,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Coins,
  Flame,
  Gamepad2,
  LibraryBig,
  LogOut,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
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
  dict: Pick<Dictionary, "dashboard" | "nav" | "common" | "ai">;
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

  const reviewProgress = stats
    ? Math.min(100, Math.round((stats.reviews_today / stats.daily_goal) * 100))
    : 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel rounded-lg p-5 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">
                  {dict.dashboard.todayTitle}
                </p>
                <h1 className="mt-2 text-balance text-3xl font-black tracking-tight text-ink sm:text-5xl">
                  {dict.dashboard.welcome}, {user.profile.display_name}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  router.push(`/${lang}`);
                }}
              >
                <LogOut className="size-4" aria-hidden />
                {dict.nav.logout}
              </Button>
            </div>

            {!user.email_verified && (
              <Alert tone="info" className="mt-6">
                {dict.dashboard.verifyBanner}
              </Alert>
            )}

            {stats && (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={Flame} label={gam.streak} value={stats.current_streak} tone="text-orange-300" />
                <StatCard
                  icon={Zap}
                  label={`${stats.xp_into_level}/${stats.xp_for_next_level} XP`}
                  value={stats.level}
                  tone="text-brand-300"
                />
                <StatCard icon={Coins} label={gam.coins} value={stats.coins} tone="text-amber-300" />
                <Link href={`/${lang}/leaderboard`} className="block">
                  <StatCard icon={Trophy} label={stats.league_tier} value="" tone="text-rose-300" />
                </Link>
              </div>
            )}
          </div>

          <Card className="light-sweep flex h-full flex-col justify-between bg-linear-to-br from-brand-500/16 via-card to-accent-400/12 p-5">
            <div>
              <span className="icon-tile size-12 rounded-lg">
                <Target className="size-6 text-accent-300" aria-hidden />
              </span>
              <CardTitle className="mt-5 text-2xl">{dict.dashboard.reviewHeroTitle}</CardTitle>
              <CardDescription>
                {dueCount !== null && dueCount > 0
                  ? `${dueCount} ${dict.dashboard.dueToday}`
                  : dict.dashboard.reviewHeroBody}
              </CardDescription>
            </div>

            {stats && (
              <div className="mt-7">
                <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
                  <span>{gam.dailyGoal}</span>
                  <span>
                    {stats.reviews_today}/{stats.daily_goal} {gam.goalReviews}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-400 via-accent-400 to-rose-300 transition-all"
                    style={{ width: `${reviewProgress}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-bold text-ink-soft">{gam.setGoal}</span>
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => void changeGoal(goal)}
                      className={
                        "rounded-md border px-2.5 py-1 text-xs font-black transition-all " +
                        (stats.daily_goal === goal
                          ? "border-brand-400 bg-brand-600 text-white shadow-[0_10px_30px_rgba(40,135,115,0.22)]"
                          : "border-line text-ink-soft hover:-translate-y-0.5 hover:bg-card hover:text-ink")
                      }
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Link href={`/${lang}/review`} className="mt-6 inline-flex">
              <Button>
                <BookOpenCheck className="size-4" aria-hidden />
                {dict.dashboard.startReview}
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <ActionCard
          href={`/${lang}/vocabulary`}
          icon={LibraryBig}
          title={dict.dashboard.cardVocabulary}
          body={dict.dashboard.cardVocabularyDesc}
          tone="text-brand-300"
        />
        <ActionCard
          href={`/${lang}/decks`}
          icon={BookOpenCheck}
          title={dict.dashboard.cardReview}
          body={
            dueCount !== null && dueCount > 0
              ? `${dueCount} ${dict.dashboard.dueToday}`
              : dict.dashboard.cardReviewDesc
          }
          tone="text-accent-300"
        />
        <ActionCard
          href={`/${lang}/games`}
          icon={Gamepad2}
          title={dict.dashboard.cardGames}
          body={dict.dashboard.cardGamesDesc}
          tone="text-rose-300"
        />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <WideLink
          href={`/${lang}/statistics`}
          icon={ChartNoAxesColumnIncreasing}
          title={dict.dashboard.statsLink}
        />
        <WideLink href={`/${lang}/ai`} icon={Sparkles} title={dict.ai.title} accent />
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="premium-card rounded-lg p-4">
      <Icon className={`size-5 ${tone}`} aria-hidden />
      <p className="mt-4 text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold capitalize text-ink-soft">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
  tone,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
}) {
  return (
    <Link href={href} className="premium-card group block rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="icon-tile size-11 rounded-lg">
          <Icon className={`size-5 ${tone}`} aria-hidden />
        </span>
        <ChevronRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
    </Link>
  );
}

function WideLink({
  href,
  icon: Icon,
  title,
  accent = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="premium-card group flex items-center justify-between rounded-lg px-5 py-4"
    >
      <span className="flex items-center gap-3">
        <span className="icon-tile size-10 rounded-lg">
          <Icon className={`size-5 ${accent ? "text-accent-300" : "text-brand-300"}`} aria-hidden />
        </span>
        <span className="font-black text-ink">{title}</span>
      </span>
      <ChevronRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
