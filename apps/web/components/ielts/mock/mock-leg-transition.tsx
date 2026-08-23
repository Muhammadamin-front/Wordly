"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Headphones, Mic2, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BAND_COLOR } from "@/lib/ielts";
import type { MockSkill } from "@/lib/ielts-mock";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];

const NEXT_ICON: Record<MockSkill, typeof Headphones> = {
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

export function MockLegTransition({
  t,
  completed,
  nextSkill,
  onContinue,
}: {
  t: Copy;
  completed: { skill: MockSkill; band: number };
  nextSkill: MockSkill;
  onContinue: () => void;
}) {
  const NextIcon = NEXT_ICON[nextSkill];
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success"
      >
        <CheckCircle2 className="size-8" aria-hidden />
      </motion.div>

      <p className="mt-5 text-lg font-black text-ink">
        {t[SKILL_LEG_KEY[completed.skill]]} {t.legCompleteTitle}
      </p>
      <p className="mt-1 text-xs font-bold uppercase text-ink-soft">{t.legCompleteBand}</p>
      <p className={cn("mt-1 text-6xl font-black", BAND_COLOR(completed.band))}>
        {completed.band.toFixed(1)}
      </p>
      <p className="mt-4 max-w-xs text-sm leading-6 text-ink-soft">{t.legCompleteBody}</p>

      <Button size="lg" className="mt-8" onClick={onContinue}>
        <NextIcon className="size-4" aria-hidden />
        {t.continueTo} {t[SKILL_LEG_KEY[nextSkill]]}
      </Button>
    </main>
  );
}
