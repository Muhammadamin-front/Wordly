"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

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

  const modules = [
    { icon: "📚", title: dict.dashboard.cardVocabulary, desc: dict.dashboard.cardVocabularyDesc },
    { icon: "🃏", title: dict.dashboard.cardReview, desc: dict.dashboard.cardReviewDesc },
    { icon: "🎮", title: dict.dashboard.cardGames, desc: dict.dashboard.cardGamesDesc },
  ];

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

      <section className="mt-8">
        <Card className="bg-gradient-to-br from-brand-600/10 to-accent-500/5 text-center">
          <p className="text-4xl" aria-hidden>
            🐆
          </p>
          <CardTitle className="mt-3">{dict.dashboard.emptyTitle}</CardTitle>
          <CardDescription className="mx-auto max-w-md">
            {dict.dashboard.emptyBody}
          </CardDescription>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="relative overflow-hidden opacity-80">
            <span className="absolute right-3 top-3 rounded-full bg-line/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              {dict.dashboard.comingSoon}
            </span>
            <span aria-hidden className="text-2xl">
              {module.icon}
            </span>
            <CardTitle className="mt-2 text-base">{module.title}</CardTitle>
            <CardDescription className="text-xs">{module.desc}</CardDescription>
          </Card>
        ))}
      </section>
    </main>
  );
}
