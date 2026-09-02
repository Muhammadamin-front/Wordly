"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleDollarSign, Flame, Medal } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { gamificationApi, type Achievement, type Stats } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const CATEGORY_LABEL: Record<string, keyof Dictionary["achievementsPage"]> = {
  volume: "catVolume",
  streak: "catStreak",
  mastery: "catMastery",
  level: "catLevel",
  goal: "catGoal",
};

export function AchievementsView({
  lang,
  page,
  ach,
  gam,
}: {
  lang: string;
  page: Dictionary["achievementsPage"];
  ach: Dictionary["ach"];
  gam: Dictionary["gam"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Achievement[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([gamificationApi.achievements(), gamificationApi.stats()]).then(([a, s]) => {
      if (cancelled) return;
      setItems(a);
      setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  if (!ready || !user || items === null || stats === null) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="type-h1 text-ink">{page.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{page.subtitle}</p>

      {/* Level / XP summary */}
      <Card className="mt-6 border-brand-400/45 bg-brand-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-soft">
              {gam.level} {stats.level}
            </p>
            <p className="mt-0.5 font-display text-4xl tracking-wide text-ink">
              {stats.xp} <span className="text-base font-semibold text-ink-soft">XP</span>
            </p>
          </div>
          <div className="space-y-1 text-right text-sm">
            <p className="flex items-center justify-end gap-1 font-bold text-brand-600"><Flame className="size-4" aria-hidden /> {stats.current_streak}</p>
            <p className="flex items-center justify-end gap-1 font-bold text-accent-600"><CircleDollarSign className="size-4" aria-hidden /> {stats.coins}</p>
            <p className="flex items-center justify-end gap-1 text-ink-soft"><Medal className="size-4" aria-hidden /> {unlockedCount}/{items.length}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-500 to-accent-500"
            style={{ width: `${(stats.xp_into_level / stats.xp_for_next_level) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-ink-soft">
          {stats.xp_into_level}/{stats.xp_for_next_level} {gam.xpToNext}
        </p>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const meta = ach[item.code as keyof Dictionary["ach"]];
          return (
            <div
              key={item.code}
              className={cn(
                "flex items-center gap-4 rounded-[14px] border p-4 shadow-[2px_3px_0_rgb(84,37,15,0.1)] transition-all",
                item.unlocked
                  ? "border-brand-400/50 bg-card"
                  : "border-line bg-card opacity-60"
              )}
            >
              <span
                className={cn("text-3xl", !item.unlocked && "grayscale")}
                aria-hidden
              >
                {meta.i}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl tracking-wide text-ink">{meta.t}</p>
                <p className="text-xs text-ink-soft">{meta.d}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ink-soft">
                  {page[CATEGORY_LABEL[item.category]]} · +{item.xp_reward} XP · +
                  {item.coin_reward} <CircleDollarSign className="size-3" aria-hidden />
                </p>
              </div>
              {item.unlocked && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success-text">
                  ✓ {page.unlocked}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
