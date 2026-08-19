"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Gauge, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PLACEMENT_QUESTIONS,
  recommendPlacementLevel,
  type PlacementLevel,
  type PlacementResult,
} from "@/lib/placement-test";
import { cn } from "@/lib/utils";

export type PlacementCopy = {
  placementEyebrow: string;
  placementIntroTitle: string;
  placementIntroBody: string;
  placementBegin: string;
  placementSkip: string;
  placementQuestion: string;
  placementChoose: string;
  placementPrevious: string;
  placementResultTitle: string;
  placementResultBody: string;
  placementScore: string;
  placementPracticeCap: string;
  placementUseLevel: string;
  placementRetake: string;
};

export function PlacementTest({
  copy,
  reducedMotion,
  onApply,
  onCancel,
}: {
  copy: PlacementCopy;
  reducedMotion: boolean;
  onApply: (level: PlacementLevel) => void;
  onCancel: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<PlacementResult | null>(null);

  function answer(optionIndex: number) {
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = optionIndex;
    setAnswers(nextAnswers);

    if (questionIndex === PLACEMENT_QUESTIONS.length - 1) {
      setResult(recommendPlacementLevel(nextAnswers));
      return;
    }
    setQuestionIndex((current) => current + 1);
  }

  function previous() {
    setQuestionIndex((current) => Math.max(0, current - 1));
  }

  function restart() {
    setAnswers([]);
    setQuestionIndex(0);
    setResult(null);
    setStarted(true);
  }

  if (!started) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-brand-300/70 bg-brand-950 px-5 py-6 text-white shadow-[0_24px_60px_rgba(7,58,53,0.18)] sm:px-7 sm:py-8">
        <div className="absolute inset-y-0 right-0 w-2/5 opacity-35 [background-image:radial-gradient(circle_at_65%_30%,rgba(98,214,181,0.5),transparent_42%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.08)_36%,transparent_36%)]" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-accent-300">
            <Gauge className="size-4" />
            {copy.placementEyebrow}
          </span>
          <h3 className="mt-3 text-xl font-black text-white sm:text-2xl">
            {copy.placementIntroTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-brand-100/80">
            {copy.placementIntroBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="accent" onClick={() => setStarted(true)}>
              <Sparkles className="size-4" />
              {copy.placementBegin}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-brand-100 hover:bg-white/10 hover:text-white"
              onClick={onCancel}
            >
              {copy.placementSkip}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-lg border border-brand-300/70 bg-brand-600/8 p-5 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-brand-700 dark:text-brand-200">
          <Sparkles className="size-4" />
          {copy.placementResultTitle}
        </div>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-4xl font-black text-white shadow-[0_18px_44px_rgba(7,58,53,0.22)]">
            {result.level}
          </div>
          <div>
            <p className="text-lg font-extrabold text-ink">
              {copy.placementResultBody.replace("{level}", result.level)}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {copy.placementScore
                .replace("{score}", String(result.score))
                .replace("{total}", String(result.total))}
            </p>
            {result.practiceLevel !== result.level && (
              <p className="mt-2 text-sm text-ink-soft">
                {copy.placementPracticeCap.replace("{level}", result.practiceLevel)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => onApply(result.level)}>
            <Check className="size-4" />
            {copy.placementUseLevel.replace("{level}", result.level)}
          </Button>
          <Button type="button" variant="secondary" onClick={restart}>
            <RotateCcw className="size-4" />
            {copy.placementRetake}
          </Button>
        </div>
      </div>
    );
  }

  const question = PLACEMENT_QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / PLACEMENT_QUESTIONS.length) * 100;

  return (
    <div aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-extrabold uppercase text-brand-700 dark:text-brand-200">
          {copy.placementQuestion
            .replace("{current}", String(questionIndex + 1))
            .replace("{total}", String(PLACEMENT_QUESTIONS.length))}
        </span>
        <span className="rounded-md bg-brand-600/10 px-2.5 py-1 text-xs font-black text-brand-700 dark:text-brand-200">
          {question.level}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-900/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-brand-600"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
          className="mt-7"
        >
          <p className="text-xs font-bold uppercase text-ink-soft">{copy.placementChoose}</p>
          <h3 className="mt-2 text-xl font-black leading-snug text-ink sm:text-2xl">
            {question.prompt}
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers[questionIndex] === optionIndex}
                onClick={() => answer(optionIndex)}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-600/8",
                  answers[questionIndex] === optionIndex
                    ? "border-brand-500 bg-brand-600/10"
                    : "border-line bg-card/55"
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-900 text-xs font-black text-white">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={previous}
          disabled={questionIndex === 0}
        >
          <ArrowLeft className="size-4" />
          {copy.placementPrevious}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {copy.placementSkip}
        </Button>
      </div>
    </div>
  );
}
