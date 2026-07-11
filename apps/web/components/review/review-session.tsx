"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { flashcardsApi, type CardOut, type Queue, type Rating } from "@/lib/flashcards";
import { speak } from "@/lib/games";
import { notifyStatsChanged, type Reward } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Phase = "loading" | "empty" | "front" | "back" | "done";

const RATING_KEYS: Record<string, Rating> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };

const RATING_STYLES: Record<Rating, string> = {
  again: "bg-danger/10 text-danger hover:bg-danger/20",
  hard: "bg-warning/10 text-warning hover:bg-warning/20",
  good: "bg-brand-600/10 text-brand-600 hover:bg-brand-600/20 dark:text-brand-300",
  easy: "bg-success/10 text-success hover:bg-success/20",
};

export function ReviewSession({
  lang,
  review,
  gam,
  ach,
  deckId,
}: {
  lang: string;
  review: Dictionary["review"];
  gam: Dictionary["gam"];
  ach: Dictionary["ach"];
  deckId?: string;
}) {
  const { user, ready } = useAuth();
  const reduced = useReducedMotion();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionAchievements, setSessionAchievements] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef<number>(0);
  const submitting = useRef(false);

  const card: CardOut | undefined = queue?.cards[index];

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    flashcardsApi
      .queue(deckId)
      .then((q) => {
        if (cancelled) return;
        setQueue(q);
        setPhase(q.cards.length ? "front" : "empty");
        shownAt.current = Date.now();
      })
      .catch(() => {
        if (!cancelled) setError("queue");
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, deckId]);

  const flip = useCallback(() => {
    setPhase((current) => (current === "front" ? "back" : current));
  }, []);

  // Hear every word as its card appears — pronunciation is part of learning.
  useEffect(() => {
    if (phase !== "front") return;
    const headword = queue?.cards[index]?.word?.headword;
    if (headword) speak(headword);
  }, [phase, index, queue]);

  const announce = useCallback(
    (reward: Reward) => {
      if (reward.leveled_up) setToast(`⚡ ${gam.levelUp} ${reward.level}`);
      else if (reward.new_achievements.length > 0) {
        const meta = ach[reward.new_achievements[0] as keyof Dictionary["ach"]];
        setToast(`${meta.i} ${gam.newAchievement}`);
      } else if (reward.freeze_used) setToast(`🧊 ${gam.freezeUsed}`);
      else if (reward.goal_reached) setToast(`🎯 ${gam.goalDone}`);
      else setToast(`+${reward.xp_gained} XP`);
      window.setTimeout(() => setToast(null), 1600);
    },
    [gam, ach]
  );

  const rate = useCallback(
    async (rating: Rating) => {
      if (!card || submitting.current) return;
      submitting.current = true;
      try {
        const { reward } = await flashcardsApi.review(
          card.id,
          rating,
          Date.now() - shownAt.current
        );
        setReviewedCount((count) => count + 1);
        setSessionXp((xp) => xp + reward.xp_gained);
        if (reward.new_achievements.length > 0) {
          setSessionAchievements((prev) => [...prev, ...reward.new_achievements]);
        }
        announce(reward);
        notifyStatsChanged();
        setNote("");
        if (queue && index + 1 < queue.cards.length) {
          setIndex(index + 1);
          setPhase("front");
          shownAt.current = Date.now();
        } else {
          setPhase("done");
        }
      } catch {
        setError("review");
      } finally {
        submitting.current = false;
      }
    },
    [card, queue, index, announce]
  );

  // Keyboard: Space/Enter flips; 1-4 rate when the back is visible.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)
        return;
      if (event.code === "Space" || event.key === "Enter") {
        event.preventDefault();
        flip();
      } else if (phase === "back" && RATING_KEYS[event.key]) {
        event.preventDefault();
        void rate(RATING_KEYS[event.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, rate, phase]);

  async function saveNote() {
    if (!card) return;
    await flashcardsApi.updateCard(card.id, { memory_note: note });
  }

  if (!ready || phase === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span
          aria-label={review.loading}
          className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Alert tone="error">{error === "queue" ? review.loading : review.title}</Alert>
      </div>
    );
  }

  if (phase === "empty" || phase === "done") {
    const isDone = phase === "done";
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-5xl" aria-hidden>
          {isDone ? "🎉" : "🐆"}
        </p>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">
          {isDone ? review.doneTitle : review.emptyTitle}
        </h2>
        <p className="mt-2 text-ink-soft">
          {isDone ? review.doneBody : review.emptyBody}
        </p>

        {isDone && reviewedCount > 0 && (
          <div className="mx-auto mt-5 max-w-xs rounded-xl2 border border-line bg-card p-5">
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">
              +{sessionXp} XP
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {reviewedCount} {review.reviewedCount}
            </p>
            {sessionAchievements.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-line pt-3">
                {sessionAchievements.map((code) => {
                  const meta = ach[code as keyof Dictionary["ach"]];
                  return (
                    <span
                      key={code}
                      className="rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-600 dark:text-accent-300"
                    >
                      {meta.i} {meta.t}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Link href={isDone ? `/${lang}/dashboard` : `/${lang}/decks`} className="mt-8 inline-block">
          <Button>{isDone ? review.title : review.addWords}</Button>
        </Link>
      </div>
    );
  }

  if (!card || !queue) return null;

  const isBack = phase === "back";
  const word = card.word;
  const sense = word?.senses[0];
  const examples = sense?.examples.slice(0, 3) ?? [];
  const progress = queue.cards.length ? (index / queue.cards.length) * 100 : 0;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Reward toast */}
      {toast && (
        <motion.div
          key={toast}
          initial={reduced ? false : { opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg"
        >
          {toast}
        </motion.div>
      )}

      {/* Progress */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={review.progress}
        className="h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 to-accent-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs text-ink-soft">
        {index + 1} / {queue.cards.length}
      </p>

      {/* Card: drag right = good, left = again (only when answer shown) */}
      <motion.div
        key={card.id + phase}
        drag={isBack && !reduced ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (info.offset.x > 120) void rate("good");
          else if (info.offset.x < -120) void rate("again");
        }}
        initial={reduced ? false : { rotateY: isBack ? -90 : 0, opacity: isBack ? 0 : 1 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        style={{ transformPerspective: 1000 }}
        className="mt-4 cursor-pointer select-none rounded-xl2 border border-line bg-card p-8 text-center shadow-lg shadow-brand-950/5"
        onClick={() => (isBack ? undefined : flip())}
      >
        {word ? (
          <>
            <p className="flex items-center justify-center gap-3 text-4xl font-extrabold tracking-tight text-ink">
              {word.headword}
              <button
                type="button"
                aria-label="🔊"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.headword);
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-xl text-brand-600 transition-transform hover:scale-110 dark:text-brand-300"
              >
                🔊
              </button>
            </p>
            <p className="mt-2 text-ink-soft">
              <em>{word.pos}</em>
              {word.ipa && <span className="ml-2 font-mono text-sm">/{word.ipa}/</span>}
            </p>
          </>
        ) : (
          <p className="text-3xl font-extrabold text-ink">{card.front_text}</p>
        )}

        {isBack && (
          <div className="mt-6 border-t border-line pt-6 text-left">
            {word && sense ? (
              <>
                {word.image_url && (
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={word.image_url}
                      alt={word.headword}
                      width={112}
                      height={112}
                      unoptimized
                      className="size-28 rounded-2xl object-cover shadow-sm"
                    />
                  </div>
                )}
                <p className="text-center text-2xl font-bold text-ink">
                  🇺🇿 {sense.translation_uz}
                  <span className="ml-3 text-lg font-semibold text-ink-soft">
                    🇷🇺 {sense.translation_ru}
                  </span>
                </p>
                <p className="mt-3 text-center text-sm text-ink-soft">{sense.definition_en}</p>
                {examples.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {examples.map((ex) => (
                      <div key={ex.text_en} className="flex items-start gap-2 rounded-lg bg-page px-4 py-3">
                        <button
                          type="button"
                          aria-label="🔊"
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(ex.text_en);
                          }}
                          className="mt-0.5 shrink-0 text-sm opacity-70 transition-opacity hover:opacity-100"
                        >
                          🔊
                        </button>
                        <div>
                          <p className="text-sm font-medium text-ink">{ex.text_en}</p>
                          {ex.text_uz && (
                            <p className="mt-0.5 text-xs text-ink-soft">{ex.text_uz}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-2xl font-bold text-ink">{card.back_text}</p>
            )}

            {card.memory_note && (
              <p className="mt-4 rounded-lg bg-accent-500/10 px-4 py-2 text-sm text-accent-600 dark:text-accent-300">
                💡 {card.memory_note}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      {isBack ? (
        <>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {(["again", "hard", "good", "easy"] as Rating[]).map((rating, i) => (
              <button
                key={rating}
                type="button"
                onClick={() => void rate(rating)}
                className={cn(
                  "rounded-xl px-2 py-3 text-sm font-bold transition-colors",
                  RATING_STYLES[rating]
                )}
              >
                {review[rating]}
                <span className="mt-0.5 block text-[10px] font-normal opacity-60">{i + 1}</span>
              </button>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-medium text-ink-soft">
              💡 {review.memoryNote}
            </summary>
            <div className="mt-2 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={review.notePlaceholder}
                className="h-10 flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={() => void saveNote()}>
                {review.noteSave}
              </Button>
            </div>
          </details>
        </>
      ) : (
        <Button fullWidth className="mt-5" onClick={flip}>
          {review.showAnswer}
        </Button>
      )}

      <p className="mt-4 hidden text-center text-xs text-ink-soft sm:block">
        {review.keyboardHint}
      </p>
    </div>
  );
}
