"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Compass, Footprints, Lightbulb, Map, Shield, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ChoiceItem, GameProps } from "@/components/games/game-player";
import { cn } from "@/lib/utils";

type PathMood = "brave" | "curious";

export function StoryGame({
  items,
  games,
  onAnswer,
  onComplete,
}: GameProps & { items: ChoiceItem[] }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [path, setPath] = useState<PathMood[]>([]);
  const shownAt = useRef(0);
  const item = items[index];
  const previousMood = path.at(-1);

  useEffect(() => {
    shownAt.current = Date.now();
  }, [index]);

  function choose(event: React.MouseEvent<HTMLButtonElement>) {
    if (picked) return;
    const option = event.currentTarget.dataset.option ?? "";
    setPicked(option);
    onAnswer(
      item.question.card_id,
      option === item.question.answer,
      Date.now() - shownAt.current,
      option
    );
  }

  function continuePath(mood: PathMood) {
    setPath((current) => [...current, mood]);
    if (index + 1 >= items.length) {
      onComplete();
      return;
    }
    setPicked(null);
    setIndex((current) => current + 1);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card/70 shadow-[0_24px_70px_rgba(7,58,53,0.12)] backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-line bg-brand-950 px-5 py-6 text-white sm:px-7">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(76,167,143,.55),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(210,168,79,.4),transparent_28%)]" />
        <div className="relative flex items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-brand-200">
              <Map className="size-4" aria-hidden />
              {games.storyChapter} {index + 1}
            </div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {previousMood === "brave"
                ? games.storyBraveScene
                : previousMood === "curious"
                  ? games.storyCuriousScene
                  : games.storyOpeningScene}
            </h2>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex" aria-label={games.storyPath}>
            {items.map((_, step) => (
              <span
                key={step}
                className={cn(
                  "h-1.5 w-7 rounded-full",
                  step < index ? "bg-accent-400" : step === index ? "bg-white" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          className="p-5 sm:p-7"
        >
          <div className="flex items-start gap-3">
            <span className="icon-tile mt-0.5 size-10 shrink-0 rounded-lg">
              <Sparkles className="size-5 text-accent-600 dark:text-accent-300" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-ink-soft">{games.storyScene}</p>
              <p className="mt-2 text-lg font-bold leading-8 text-ink sm:text-xl">
                {item.question.prompt}
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs font-black uppercase text-ink-soft">
            {games.storyChooseWord}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {item.options.map((option) => {
              const isAnswer = option === item.question.answer;
              const state = picked
                ? isAnswer
                  ? "correct"
                  : option === picked
                    ? "wrong"
                    : "idle"
                : "idle";
              return (
                <motion.button
                  key={option}
                  type="button"
                  data-option={option}
                  disabled={!!picked}
                  onClick={choose}
                  whileHover={!picked ? { y: -2 } : undefined}
                  whileTap={!picked ? { scale: 0.98 } : undefined}
                  animate={state === "wrong" ? { x: [0, -5, 5, 0] } : undefined}
                  className={cn(
                    "flex min-h-14 items-center justify-between rounded-lg border px-4 py-3 text-left font-bold transition-colors",
                    state === "idle" && "border-line bg-raised/70 text-ink hover:border-brand-400",
                    state === "correct" && "border-success bg-success/10 text-success",
                    state === "wrong" && "border-danger bg-danger/10 text-danger"
                  )}
                >
                  {option}
                  {state === "correct" && <Check className="size-5" aria-hidden />}
                  {state === "wrong" && <X className="size-5" aria-hidden />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border-t border-line pt-5"
              >
                <div className="flex items-center gap-2">
                  <Compass className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                  <p className="font-black text-ink">{games.storyChooseDirection}</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => continuePath("brave")}
                    className="group flex min-h-20 items-center gap-3 rounded-lg border border-brand-400/30 bg-brand-600/8 px-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-400"
                  >
                    <Shield className="size-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
                    <span>
                      <span className="block font-black text-ink">{games.storyBrave}</span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{games.storyBraveDesc}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => continuePath("curious")}
                    className="group flex min-h-20 items-center gap-3 rounded-lg border border-accent-400/30 bg-accent-400/8 px-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent-400"
                  >
                    <Lightbulb className="size-5 shrink-0 text-accent-600 dark:text-accent-300" aria-hidden />
                    <span>
                      <span className="block font-black text-ink">{games.storyCurious}</span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{games.storyCuriousDesc}</span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {path.length > 0 && (
            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-ink-soft">
              <Footprints className="size-4" aria-hidden />
              {games.storyPath}: {path.map((mood) => (mood === "brave" ? games.storyBrave : games.storyCurious)).join(" · ")}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
