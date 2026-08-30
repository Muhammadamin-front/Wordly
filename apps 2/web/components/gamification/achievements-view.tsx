"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{page.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{page.subtitle}</p>

      {/* Level / XP summary */}
      <Card className="mt-6 bg-linear-to-br from-brand-600/10 to-accent-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-soft">
              {gam.level} {stats.level}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-ink">
              {stats.xp} <span className="text-base font-semibold text-ink-soft">XP</span>
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-orange-500">🔥 {stats.current_streak}</p>
            <p className="mt-0.5 font-bold text-amber-500">🪙 {stats.coins}</p>
            <p className="mt-0.5 text-ink-soft">
              🏅 {unlockedCount}/{items.length}
            </p>
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
                "flex items-center gap-4 rounded-xl2 border p-4 transition-all",
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
                <p className="font-bold text-ink">{meta.t}</p>
                <p className="text-xs text-ink-soft">{meta.d}</p>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                  {page[CATEGORY_LABEL[item.category]]} · +{item.xp_reward} XP · +
                  {item.coin_reward} 🪙
                </p>
              </div>
              {item.unlocked && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
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
