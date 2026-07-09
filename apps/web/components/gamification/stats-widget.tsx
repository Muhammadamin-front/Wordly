"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { gamificationApi, STATS_CHANGED_EVENT, type Stats } from "@/lib/gamification";

/** Compact streak / level / coins pill shown in the header when signed in. */
export function StatsWidget({ lang }: { lang: string }) {
  const { user, ready } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const load = () =>
      gamificationApi
        .stats()
        .then((s) => !cancelled && setStats(s))
        .catch(() => {});
    load();
    window.addEventListener(STATS_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(STATS_CHANGED_EVENT, load);
    };
  }, [ready, user]);

  if (!ready || !user || !stats) return null;

  return (
    <Link
      href={`/${lang}/achievements`}
      className="flex items-center gap-2.5 rounded-lg px-1.5 text-sm font-bold"
      title="XP · streak · coins"
    >
      <span
        className={stats.current_streak > 0 ? "text-orange-500" : "text-ink-soft opacity-60"}
      >
        🔥 {stats.current_streak}
      </span>
      <span className="text-brand-600 dark:text-brand-300">⚡ {stats.level}</span>
      <span className="hidden text-amber-500 sm:inline">🪙 {stats.coins}</span>
    </Link>
  );
}
