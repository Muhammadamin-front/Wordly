"use client";

import { RefreshCw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { gamificationApi, type Leaderboard } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function LeaderboardView({
  lang,
  t,
}: {
  lang: string;
  t: Dictionary["leaderboard"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    gamificationApi
      .leaderboard()
      .then((b) => {
        if (cancelled) return;
        setError(false);
        setBoard(b);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  if (!ready || !user || (board === null && !error)) {
    return (
      <main className="app-container max-w-2xl flex-1 py-8">
        <PageHeader centered title={t.title} subtitle={t.subtitle} />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-[18px]" />
          ))}
        </div>
      </main>
    );
  }

  if (error || board === null) {
    return (
      <main className="app-container max-w-2xl flex-1 py-8">
        <PageHeader centered title={t.title} subtitle={t.subtitle} />
        <EmptyState
          className="mt-6"
          icon={RefreshCw}
          title={t.loadError}
          body={t.emptyBody}
          actionLabel={t.retry}
          onAction={() => window.location.reload()}
        />
      </main>
    );
  }

  const tierName = t.tiers[board.tier as keyof Dictionary["leaderboard"]["tiers"]] ?? board.tier;
  const relegationStart = board.members.length - board.relegate_bottom;

  return (
    <main className="app-container max-w-2xl flex-1 py-8">
      <PageHeader centered eyebrow={t.thisWeek} title={tierName} subtitle={t.subtitle} />

      {board.members.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Trophy}
          title={t.emptyTitle}
          body={t.emptyBody}
          actionLabel={t.emptyAction}
          actionHref={`/${lang}/today`}
        />
      ) : (
        <ol className="mt-6 space-y-1.5">
          {board.members.map((member, i) => {
            const inPromotion = i < board.promote_top;
            const inRelegation =
              board.members.length >= board.promote_top + board.relegate_bottom &&
              i >= relegationStart;
            return (
              <li key={member.user_id}>
                {i === 0 && (
                  <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-success">
                    ▲ {t.promotionZone}
                  </p>
                )}
                {i === relegationStart && inRelegation && (
                  <p className="mb-1 mt-3 px-2 text-[11px] font-bold uppercase tracking-wide text-danger">
                    ▼ {t.relegationZone}
                  </p>
                )}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-2.5",
                    member.is_me
                      ? "border-brand-400 bg-brand-600/10"
                      : "border-line bg-card",
                    inPromotion && "border-success/45 bg-success/8 ring-1 ring-success/20",
                    inRelegation && "border-danger/45 bg-danger/8 ring-1 ring-danger/20"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 text-center text-sm font-extrabold",
                      i === 0 && "text-amber-500",
                      i === 1 && "text-slate-400",
                      i === 2 && "text-orange-700",
                      i > 2 && "text-ink-soft"
                    )}
                  >
                    {member.rank}
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-600/15 text-sm font-bold text-brand-600 dark:text-brand-300">
                    {member.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                    {member.display_name}
                    {member.is_me && (
                      <span className="ml-1.5 text-xs font-normal text-brand-600 dark:text-brand-300">
                        ({t.you})
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-ink-soft">{member.xp} XP</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
