"use client";

import { CalendarClock, Target, TrendingDown, Trophy } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { ieltsApi } from "@/lib/ielts";
import { ieltsMockApi } from "@/lib/ielts-mock";
import { apiKeys, useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

export type GoalStripCopy = {
  goal: string;
  lastMock: string;
  weeksLeft: string;
  daysLeft: string;
  weakest: string;
  noMockYet: string;
  takeMock: string;
  setGoal: string;
  skills: Record<string, string>;
};

/** Ties daily work to the only number an IELTS learner cares about.
 *
 *  Everything here is already recorded: the goal comes from onboarding, the
 *  last band from the learner's own mock sessions, and the weakest skill from
 *  the best band per skill the practice pages already report. Nothing is
 *  estimated or invented — a missing piece is shown as missing. */
export function GoalStrip({ lang, t }: { lang: string; t: GoalStripCopy }) {
  const { user, ready } = useAuth();
  const profile = user?.profile;
  const isIelts = profile?.learning_goal === "ielts";

  const { data: sessions } = useApi(
    ready && isIelts ? "ielts:mock-sessions" : null,
    () => ieltsMockApi.listSessions()
  );
  const { data: overview } = useApi(
    ready && isIelts ? apiKeys.ieltsOverview : null,
    () => ieltsApi.overview()
  );

  if (!isIelts || !profile) return null;

  const target = profile.target_band_score;
  const lastBand = sessions?.find((session) => session.overall_band !== null)?.overall_band ?? null;
  const weakest = weakestSkill(overview?.best_bands);
  const days = daysUntil(profile.exam_date);

  // Nothing to anchor to yet: point at the one action that creates the whole
  // strip rather than rendering a row of dashes.
  if (target === null && lastBand === null) {
    return (
      <Link
        href={`/${lang}/ielts/writing/master`}
        className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-400 hover:text-ink"
      >
        <Target className="size-4" aria-hidden />
        {t.setGoal}
      </Link>
    );
  }

  return (
    <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-line bg-card/70 px-4 py-3">
      {target !== null && (
        <Item icon={Target} label={t.goal} value={target.toFixed(1)} tone="brand" />
      )}
      {lastBand === null ? (
        <Item
          icon={Trophy}
          label={t.lastMock}
          value={t.noMockYet}
          href={`/${lang}/ielts/mock`}
          action={t.takeMock}
        />
      ) : (
        <Item
          icon={Trophy}
          label={t.lastMock}
          value={lastBand.toFixed(1)}
          // Behind the goal is the state worth noticing, so it is the only
          // one that changes colour.
          tone={target !== null && lastBand < target ? "warn" : "good"}
        />
      )}
      {days !== null && (
        <Item
          icon={CalendarClock}
          label={days >= 14 ? t.weeksLeft : t.daysLeft}
          value={String(days >= 14 ? Math.round(days / 7) : Math.max(0, days))}
          tone={days <= 21 ? "warn" : undefined}
        />
      )}
      {weakest && (
        <Item
          icon={TrendingDown}
          label={t.weakest}
          value={t.skills[weakest] ?? weakest}
          href={`/${lang}/ielts/${weakest}`}
        />
      )}
    </dl>
  );
}

function Item({
  icon: Icon,
  label,
  value,
  tone,
  href,
  action,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone?: "brand" | "good" | "warn";
  href?: string;
  action?: string;
}) {
  const body = (
    <>
      <dt className="flex items-center gap-1.5 text-[0.68rem] font-black uppercase tracking-wide text-ink-soft">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 text-lg font-black tabular-nums",
          tone === "brand" && "text-brand-700 dark:text-brand-200",
          tone === "good" && "text-success-text",
          tone === "warn" && "text-danger-text",
          !tone && "text-ink"
        )}
      >
        {value}
        {action && <span className="ml-2 text-xs font-bold text-brand-700 dark:text-brand-200">{action}</span>}
      </dd>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="min-w-0 rounded-md transition-opacity hover:opacity-80">
        {body}
      </Link>
    );
  }
  return <div className="min-w-0">{body}</div>;
}

/** Lowest recorded band across the four skills. Skills with no attempt yet
 *  are not "weak", they are unmeasured, so they are excluded. */
function weakestSkill(bands: Record<string, number> | undefined): string | null {
  if (!bands) return null;
  const scored = Object.entries(bands).filter(([, band]) => band > 0);
  if (scored.length === 0) return null;
  return scored.reduce((lowest, entry) => (entry[1] < lowest[1] ? entry : lowest))[0];
}

function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const exam = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(exam.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((exam.getTime() - today.getTime()) / 86_400_000);
  return days < 0 ? null : days;
}
