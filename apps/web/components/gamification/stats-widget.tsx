"use client";

import { Coins, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { gamificationApi } from "@/lib/gamification";
import { apiKeys, useApi } from "@/lib/use-api";

/** Compact streak / level / coins pill shown in the header when signed in. */
export function StatsWidget({ lang }: { lang: string }) {
  const { user, ready } = useAuth();
  // Shares one request and one cache entry with the dashboard and the
  // achievements page; SwrProvider revalidates it after every session.
  const { data: stats } = useApi(
    ready && user ? apiKeys.stats : null,
    () => gamificationApi.stats()
  );

  if (!ready || !user || !stats) return null;

  return (
    <Link
      href={`/${lang}/achievements`}
      className="hidden items-center gap-3 rounded-full border border-line/70 bg-sand-50/80 px-3.5 py-2 text-xs font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-raised sm:flex"
      title="XP · streak · coins"
    >
      <span className="inline-flex items-center gap-1.5">
        <Flame
          className={stats.current_streak > 0 ? "size-3.5 text-brand-500" : "size-3.5 text-ink-soft/60"}
          aria-hidden
        />
        {stats.current_streak}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Zap className="size-3.5 text-brand-600" aria-hidden />
        {stats.level}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Coins className="size-3.5 text-accent-text" aria-hidden />
        {stats.coins}
      </span>
    </Link>
  );
}
