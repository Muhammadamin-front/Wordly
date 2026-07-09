"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { flashcardsApi } from "@/lib/flashcards";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function DashboardView({
  lang,
  dict,
}: {
  lang: string;
  dict: Pick<Dictionary, "dashboard" | "nav" | "common">;
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [dueCount, setDueCount] = useState<number | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    flashcardsApi
      .queue()
      .then((queue) => {
        if (!cancelled) setDueCount(queue.due_count + queue.new_count);
      })
      .catch(() => {
        // Non-blocking: the dashboard renders without the badge.
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

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

      {/* Today's review hero */}
      <section className="mt-8">
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
