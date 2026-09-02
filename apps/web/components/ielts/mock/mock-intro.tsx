"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Headphones,
  Lock,
  Mic2,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BAND_COLOR } from "@/lib/ielts";
import type { MockSessionListItem, MockTrack } from "@/lib/ielts-mock";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];

const SKILL_ROW = [
  { key: "legListening", icon: Headphones },
  { key: "legReading", icon: BookOpen },
  { key: "legWriting", icon: PenLine },
  { key: "legSpeaking", icon: Mic2 },
] as const;

export function MockIntro({
  t,
  history,
  paywalled,
  starting,
  error,
  lang,
  onStart,
  onViewAttempt,
}: {
  t: Copy;
  history: MockSessionListItem[];
  paywalled: boolean;
  starting: boolean;
  error: string | null;
  lang: string;
  onStart: (track: MockTrack) => void;
  onViewAttempt: (id: string) => void;
}) {
  const [track, setTrack] = useState<MockTrack>("academic");

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel relative overflow-hidden rounded-lg p-6 sm:p-10"
      >
        <span
          aria-hidden
          className="absolute -right-10 -top-16 font-display text-[9rem] leading-none tracking-wide text-brand-600/8 sm:text-[13rem]"
        >
          IELTS
        </span>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-black uppercase text-accent-text">
            <Sparkles className="size-4" aria-hidden />
            {t.eyebrow}
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
            {t.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-card/70 p-3">
            {SKILL_ROW.map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={row.key} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-600/8 px-2.5 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-200">
                    <Icon className="size-3.5" aria-hidden />
                    {t[row.key]}
                  </span>
                  {i < SKILL_ROW.length - 1 && <span className="text-ink-soft/50">→</span>}
                </div>
              );
            })}
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft">
              <Clock3 className="size-3.5" aria-hidden />
              {t.totalTime}
            </span>
          </div>
        </div>
      </motion.section>

      {error && (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      )}

      {paywalled ? (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-lg border border-brand-400/30 bg-[linear-gradient(135deg,#24130c,#54250f)] p-6 text-white shadow-[4px_5px_0_rgba(84,37,15,0.28)] dark:bg-[linear-gradient(135deg,#382015,#24130c)] sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/12">
              <Lock className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-black">{t.premiumRequired}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-brand-100/85">
                {t.premiumRequiredBody}
              </p>
              <Link href={`/${lang}/pricing`} className="mt-5 inline-block">
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-brand-900 transition-colors hover:bg-brand-50">
                  {t.upgradeCta}
                </span>
              </Link>
            </div>
          </div>
        </motion.section>
      ) : (
        <section className="mt-6">
          <p className="type-label text-accent-text">{t.trackLabel}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TrackCard
              active={track === "academic"}
              onClick={() => setTrack("academic")}
              title={t.academicTrack}
              body={t.academicTrackBody}
            />
            <TrackCard
              disabled
              active={false}
              onClick={() => {}}
              title={t.generalTrack}
              body={t.generalTrackBody}
              badge={t.comingSoon}
            />
          </div>
          <Button
            size="lg"
            className="mt-5 w-full sm:w-auto"
            loading={starting}
            onClick={() => onStart(track)}
          >
            {t.startCta}
          </Button>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-10">
          <p className="type-label text-accent-text">{t.pastAttempts}</p>
          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewAttempt(item.id)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-line bg-card px-4 py-3 text-left shadow-[2px_3px_0_rgba(84,37,15,0.1)] transition-all hover:-translate-y-0.5 hover:border-brand-400/55 hover:shadow-[4px_5px_0_rgba(84,37,15,0.16)]"
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {item.track === "academic" ? t.academicTrack : t.generalTrack}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {new Date(item.started_at).toLocaleDateString(lang)} ·{" "}
                    {item.status === "finished" ? t.statusFinished : t.statusAbandoned}
                  </p>
                </div>
                {item.overall_band !== null && (
                  <span className={cn("text-2xl font-black", BAND_COLOR(item.overall_band))}>
                    {item.overall_band.toFixed(1)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function TrackCard({
  active,
  disabled,
  onClick,
  title,
  body,
  badge,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-brand-400 bg-brand-600/8 shadow-[3px_4px_0_rgba(84,37,15,0.14)]"
          : disabled
            ? "border-line bg-card/60"
            : "border-line bg-card/60 hover:bg-hover"
      )}
    >
      <p className="font-black text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-ink-soft">{body}</p>
      {disabled && badge && (
        <span className="mt-3 inline-flex items-center rounded-full bg-line/60 px-2.5 py-1 text-[10px] font-bold uppercase text-ink-soft">
          {badge}
        </span>
      )}
    </button>
  );
}
