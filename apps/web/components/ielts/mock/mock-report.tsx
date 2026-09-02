"use client";

import { motion } from "framer-motion";
import { BookOpen, Headphones, Mic2, PenLine, Trophy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BAND_COLOR } from "@/lib/ielts";
import type { MockLeg, MockSession, MockSkill } from "@/lib/ielts-mock";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];

const SKILL_ICON: Record<MockSkill, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic2,
};

const SKILL_LEG_KEY: Record<MockSkill, keyof Copy> = {
  listening: "legListening",
  reading: "legReading",
  writing: "legWriting",
  speaking: "legSpeaking",
};

export function MockReport({
  t,
  session,
  onRetake,
  lang,
}: {
  t: Copy;
  session: MockSession;
  onRetake: () => void;
  lang: string;
}) {
  const abandoned = session.status === "abandoned";

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden rounded-lg p-6 text-center sm:p-10"
      >
        {abandoned ? (
          <>
            <p className="text-sm font-black uppercase text-ink-soft">{t.statusAbandoned}</p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{t.exitConfirmBody}</p>
          </>
        ) : (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-400/12 text-accent-text">
              <Trophy className="size-8" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-black uppercase tracking-wide text-ink-soft">
              {t.overallBand}
            </p>
            <p className={cn("mt-1 text-7xl font-black tracking-tight", BAND_COLOR(session.overall_band ?? 0))}>
              {(session.overall_band ?? 0).toFixed(1)}
            </p>
          </>
        )}
      </motion.section>

      {!abandoned && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {session.legs.map((leg, i) => (
            <LegRow key={leg.skill} t={t} leg={leg} index={i} />
          ))}
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onRetake} className="flex-1">
          {t.reportRetake}
        </Button>
        <Link href={`/${lang}/ielts`} className="flex-1">
          <span className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-md border border-line bg-raised px-7 text-base font-bold text-ink shadow-[2px_3px_0_rgb(84,37,15,0.16)] transition-all hover:-translate-y-0.5 hover:bg-hover hover:text-primary">
            {t.reportBackToHub}
          </span>
        </Link>
      </div>
    </main>
  );
}

function LegRow({ t, leg, index }: { t: Copy; leg: MockLeg; index: number }) {
  const Icon = SKILL_ICON[leg.skill];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 rounded-lg border border-line bg-card p-4 shadow-[2px_3px_0_rgba(84,37,15,0.1)]"
    >
      <span className="icon-tile size-11 shrink-0 rounded-lg text-brand-500">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{t[SKILL_LEG_KEY[leg.skill]]}</p>
        <p className="text-xs text-ink-soft">{leg.status === "done" ? t.legDone : t.legPending}</p>
      </div>
      {leg.band !== null && (
        <span className={cn("shrink-0 text-3xl font-black", BAND_COLOR(leg.band))}>
          {leg.band.toFixed(1)}
        </span>
      )}
    </motion.div>
  );
}
