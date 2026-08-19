"use client";

import Link from "next/link";
import { BarChart3, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { statisticsApi, type HeatmapDay, type Statistics } from "@/lib/statistics";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const HEATMAP_DAYS = 119; // 17 weeks

function intensityClass(count: number): string {
  if (count === 0) return "bg-line/50";
  if (count < 5) return "bg-brand-500/30";
  if (count < 10) return "bg-brand-500/60";
  return "bg-brand-500";
}

function buildWeeks(days: HeatmapDay[]): { date: string; count: number }[][] {
  const byDay = new Map(days.map((d) => [d.day, d.reviews_count]));
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - HEATMAP_DAYS);
  // Back up to Monday for a clean grid.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const weeks: { date: string; count: number }[][] = [];
  let current: { date: string; count: number }[] = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    current.push({ date: iso, count: byDay.get(iso) ?? 0 });
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) weeks.push(current);
  return weeks;
}

function formatTime(ms: number, min: string, hr: string): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} ${min}`;
  return `${(minutes / 60).toFixed(1)} ${hr}`;
}

const RATING_COLORS: Record<string, string> = {
  again: "bg-danger",
  hard: "bg-warning",
  good: "bg-brand-500",
  easy: "bg-success",
};

export function StatisticsView({
  lang,
  t,
  ratingLabels,
}: {
  lang: string;
  t: Dictionary["stats"];
  ratingLabels: Pick<Dictionary["review"], "again" | "hard" | "good" | "easy">;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([statisticsApi.statistics(), statisticsApi.heatmap(HEATMAP_DAYS + 1)])
      .then(([s, h]) => {
        if (cancelled) return;
        setError(false);
        setStats(s);
        setHeatmap(h.days);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  if (!ready || !user || (stats === null && !error)) {
    return (
      <main className="app-container flex-1 py-8">
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={t.title}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-[20px]" />
          ))}
        </section>
        <Skeleton className="mt-6 h-44 rounded-[24px]" />
        <Skeleton className="mt-4 h-36 rounded-[24px]" />
      </main>
    );
  }

  if (error || stats === null) {
    return (
      <main className="app-container flex-1 py-8">
        <PageHeader title={t.title} subtitle={t.subtitle} />
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

  const weeks = buildWeeks(heatmap);
  const maxDaily = Math.max(1, ...stats.reviews_by_day.map((d) => d.count));
  const ratingTotal =
    Object.values(stats.rating_breakdown).reduce((a, b) => a + b, 0) || 1;
  const categoryName = (c: { name_uz: string; name_ru: string; name_en: string }) =>
    lang === "uz" ? c.name_uz : lang === "ru" ? c.name_ru : c.name_en;

  return (
    <main className="app-container max-w-4xl flex-1 py-8">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* Stat tiles */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label={t.mastered} value={String(stats.cards.mastered)} accent="text-success" />
        <Tile label={t.accuracy} value={`${stats.accuracy_all}%`} accent="text-brand-600 dark:text-brand-300" />
        <Tile label={t.totalReviews} value={String(stats.total_reviews)} accent="text-ink" />
        <Tile
          label={t.timeSpent}
          value={formatTime(stats.time_spent_ms, t.minutes, t.hours)}
          accent="text-accent-600 dark:text-accent-300"
        />
      </section>

      {stats.total_reviews === 0 ? (
        <EmptyState
          className="mt-6"
          icon={BarChart3}
          title={t.emptyTitle}
          body={t.emptyBody}
          actionLabel={t.emptyAction}
          actionHref={`/${lang}/review`}
        />
      ) : (
        <>
          {/* Card state distribution */}
          <Card className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{t.cards}</span>
              <span className="text-ink-soft">{stats.cards.total}</span>
            </div>
            <div className="mt-3 flex gap-0.5 overflow-hidden rounded-full">
              {(
                [
                  ["new", stats.cards.new, "bg-[#c88a55]"],
                  ["learning", stats.cards.learning, "bg-brand-400"],
                  ["review", stats.cards.review, "bg-brand-500"],
                  ["mastered", stats.cards.mastered, "bg-success"],
                ] as const
              ).map(([key, count, color]) => (
                <div
                  key={key}
                  className={cn("h-3", color)}
                  style={{ width: `${(count / (stats.cards.total || 1)) * 100}%` }}
                  title={`${count}`}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
              <Legend color="bg-[#c88a55]" label={`${t.new} ${stats.cards.new}`} />
              <Legend color="bg-brand-400" label={`${t.learning} ${stats.cards.learning}`} />
              <Legend color="bg-brand-500" label={`${t.review} ${stats.cards.review}`} />
              <Legend color="bg-success" label={`${t.mastered} ${stats.cards.mastered}`} />
            </div>
          </Card>

          {/* Heatmap */}
          <Card className="mt-4 overflow-x-auto">
            <CardTitle className="text-base">{t.activity}</CardTitle>
            <div className="mt-3 flex gap-1">
              {weeks.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count}`}
                      className={cn("size-3 rounded-sm", intensityClass(day.count))}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews by day */}
          <Card className="mt-4">
            <CardTitle className="text-base">{t.reviewsByDay}</CardTitle>
            <p className="text-xs text-ink-soft">{t.last30}</p>
            <div className="mt-3 flex h-28 items-end gap-1">
              {stats.reviews_by_day.map((day) => (
                <div
                  key={day.day}
                  title={`${day.day}: ${day.count}`}
                  className="flex-1 rounded-t bg-brand-500 transition-all hover:bg-brand-400"
                  style={{ height: `${Math.max(4, (day.count / maxDaily) * 100)}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Rating breakdown */}
          <Card className="mt-4">
            <CardTitle className="text-base">{t.ratingBreakdown}</CardTitle>
            <div className="mt-3 flex gap-0.5 overflow-hidden rounded-full">
              {(["again", "hard", "good", "easy"] as const).map((rating) => (
                <div
                  key={rating}
                  className={cn("h-3", RATING_COLORS[rating])}
                  style={{
                    width: `${(stats.rating_breakdown[rating] / ratingTotal) * 100}%`,
                  }}
                  title={`${ratingLabels[rating]}: ${stats.rating_breakdown[rating]}`}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
              {(["again", "hard", "good", "easy"] as const).map((rating) => (
                <Legend
                  key={rating}
                  color={RATING_COLORS[rating]}
                  label={`${ratingLabels[rating]} ${stats.rating_breakdown[rating]}`}
                />
              ))}
            </div>
          </Card>

          {/* Weak categories + forgotten words */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardTitle className="text-base">{t.weakCategories}</CardTitle>
              {stats.weak_categories.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">{t.noWeakCategories}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {stats.weak_categories.map((c) => (
                    <li key={c.slug} className="flex items-center justify-between text-sm">
                      <span className="text-ink">
                        {c.emoji} {categoryName(c)}
                      </span>
                      <span className="text-ink-soft">
                        {c.lapses} {t.lapses}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardTitle className="text-base">{t.forgotten}</CardTitle>
              {stats.forgotten.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">{t.noWeakCategories}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {stats.forgotten.map((w) => (
                    <li key={w.slug}>
                      <Link
                        href={`/${lang}/words/${w.slug}`}
                        className="flex items-center justify-between text-sm hover:underline"
                      >
                        <span className="font-medium text-ink">{w.headword}</span>
                        <span className="text-danger">
                          {w.lapses} {t.lapses}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </main>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-4 text-center shadow-[2px_3px_0_rgb(84,37,15,0.12)]">
      <p className={cn("font-display text-4xl tracking-wide", accent)}>{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{label}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", color)} />
      {label}
    </span>
  );
}
