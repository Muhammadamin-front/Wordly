"use client";

import { motion } from "framer-motion";

import { QuestionTimer } from "@/components/multiplayer/question-timer";
import type { QuizMode, ServerMessage } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Question = Extract<ServerMessage, { type: "question" }>;

const MODE_ICONS: Record<QuizMode, string> = {
  vocab: "📖",
  grammar: "🧩",
  pairs: "🔗",
  mixed: "🎲",
};

// Four controlled, distinct accents — deliberately not Kahoot's shapes/hues.
const ACCENTS = [
  { badge: "A", bar: "bg-quiz-orange", ring: "border-quiz-orange", wash: "bg-quiz-orange/8" },
  { badge: "B", bar: "bg-quiz-blue", ring: "border-quiz-blue", wash: "bg-quiz-blue/8" },
  { badge: "C", bar: "bg-quiz-green", ring: "border-quiz-green", wash: "bg-quiz-green/8" },
  { badge: "D", bar: "bg-quiz-purple", ring: "border-quiz-purple", wash: "bg-quiz-purple/8" },
] as const;

export function QuestionCard({
  mp,
  question,
  selected,
  revealed,
  revealAnswerIndex,
  onAnswer,
}: {
  mp: Dictionary["mp"];
  question: Question;
  selected: number | null;
  revealed: boolean;
  revealAnswerIndex: number | null;
  onAnswer: (option: number) => void;
}) {
  const locked = selected !== null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand-600/10 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-300">
          {MODE_ICONS[question.mode]} {mp[`mode_${question.mode}`]}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          {mp.question} {question.index + 1}/{question.total}
        </span>
      </div>

      {!revealed && (
        <QuestionTimer endsAt={question.ends_at} serverNow={question.server_now} className="mt-3" />
      )}

      <div className="mt-4 rounded-xl2 border border-line bg-card p-8 text-center">
        <p className="text-2xl font-extrabold text-ink">{question.prompt}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const isAnswer = revealed && i === revealAnswerIndex;
          const isWrongPick = revealed && i === selected && i !== revealAnswerIndex;
          const dimmed = revealed && !isAnswer && !isWrongPick;

          return (
            <motion.button
              key={opt}
              type="button"
              disabled={locked || revealed}
              onClick={() => onAnswer(i)}
              whileTap={!locked && !revealed ? { scale: 0.97 } : undefined}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors",
                !revealed && accent.ring,
                !revealed && !locked && accent.wash,
                !revealed && i === selected && "ring-2 ring-brand-500",
                isAnswer && "border-success bg-success/10 text-success",
                isWrongPick && "border-danger bg-danger/10 text-danger",
                dimmed && "border-line bg-card text-ink-soft opacity-60",
                locked && !revealed && i !== selected && "opacity-50"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white",
                  isAnswer ? "bg-success" : isWrongPick ? "bg-danger" : dimmed ? "bg-ink-soft" : accent.bar
                )}
              >
                {isAnswer ? "✓" : isWrongPick ? "✕" : accent.badge}
              </span>
              <span className="flex-1 text-ink">{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {locked && !revealed && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm font-bold text-success"
        >
          {mp.answerSubmitted} · {mp.waitingForOthers}
        </motion.p>
      )}
    </div>
  );
}
