"use client";

import { Coins, Flame, Zap } from "lucide-react";
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
        <Coins className="size-3.5 text-accent-500" aria-hidden />
        {stats.coins}
      </span>
    </Link>
  );
}
