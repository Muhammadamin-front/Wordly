"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { markCompleted, type GrammarLesson, ALL_LESSONS } from "@/lib/grammar";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type T = Dictionary["grammar"];

/** One lesson: explanation → formula → examples → common mistakes → quiz.
 *  Passing the quiz (all answered, 60%+) marks the lesson complete. */
export function LessonView({
  lang,
  lesson,
  t,
}: {
  lang: string;
  lesson: GrammarLesson;
  t: T;
}) {
  const [answers, setAnswers] = useState<number[]>(() =>
    new Array(lesson.quiz.length).fill(-1)
  );
  const [checked, setChecked] = useState(false);

  const correct = useMemo(
    () => lesson.quiz.filter((item, i) => answers[i] === item.answer).length,
    [answers, lesson.quiz]
  );
  const passed = checked && correct >= Math.ceil(lesson.quiz.length * 0.6);

  const index = ALL_LESSONS.findIndex((l) => l.slug === lesson.slug);
  const next = ALL_LESSONS[index + 1];

  function check() {
    setChecked(true);
    if (correct >= Math.ceil(lesson.quiz.length * 0.6)) markCompleted(lesson.slug);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link href={`/${lang}/grammar`} className="text-sm font-medium text-ink-soft hover:text-ink">
          ← {t.title}
        </Link>
        <span className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-ink-soft">
          {lesson.level}
        </span>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {lesson.emoji} {lesson.title}
      </h1>
      <p className="mt-1 text-ink-soft">{lesson.titleUz}</p>

      {/* Explanation */}
      <section className="mt-6 space-y-3">
        {lesson.explanation.map((para, i) => (
          <p key={i} className="text-[15px] leading-7 text-ink">
            {para}
          </p>
        ))}
      </section>

      {lesson.formula && (
        <div className="mt-4 rounded-2xl border border-brand-400/40 bg-brand-600/5 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.formula}</p>
          <p className="mt-1 font-mono text-sm font-bold text-brand-600 dark:text-brand-300">
            {lesson.formula}
          </p>
        </div>
      )}

      {/* Examples */}
      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          💬 {t.examples}
        </h2>
        <div className="mt-2 space-y-2">
          {lesson.examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-line bg-card px-4 py-2.5">
              <p className="text-[15px] font-medium text-ink">{ex.en}</p>
              <p className="text-sm text-ink-soft">{ex.uz}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Common mistakes */}
      <section className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          ⚠️ {t.mistakes}
        </h2>
        <div className="mt-2 space-y-2">
          {lesson.mistakes.map((m, i) => (
            <div key={i} className="rounded-xl border border-line bg-card px-4 py-2.5">
              <p className="text-sm">
                <span className="text-danger line-through decoration-danger/60">{m.wrong}</span>
                <span className="mx-1.5 text-ink-soft">→</span>
                <span className="font-semibold text-success">{m.right}</span>
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          📝 {t.quiz}
        </h2>
        <div className="mt-2 space-y-3">
          {lesson.quiz.map((item, qi) => {
            const chosen = answers[qi];
            return (
              <div key={qi} className="rounded-2xl border border-line bg-card p-4">
                <p className="font-semibold text-ink">
                  {qi + 1}. {item.q}
                </p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {item.options.map((opt, oi) => {
                    const isAnswer = checked && oi === item.answer;
                    const isWrongChoice = checked && chosen === oi && oi !== item.answer;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={checked}
                        onClick={() =>
                          setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                        }
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          isAnswer && "border-success bg-success/10 font-semibold text-success",
                          isWrongChoice && "border-danger bg-danger/10 text-danger",
                          !checked && chosen === oi && "border-brand-500 bg-brand-600/10 text-ink",
                          !checked && chosen !== oi && "border-line text-ink hover:bg-line/40",
                          checked && !isAnswer && !isWrongChoice && "border-line text-ink-soft"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!checked ? (
          <Button
            fullWidth
            className="mt-4"
            disabled={answers.some((a) => a === -1)}
            onClick={check}
          >
            {t.check}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-line bg-card p-6 text-center"
          >
            <p className="text-4xl" aria-hidden>
              {passed ? "🎉" : "💪"}
            </p>
            <p className="mt-2 text-xl font-extrabold text-ink">
              {correct}/{lesson.quiz.length}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{passed ? t.passed : t.tryAgainHint}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {!passed && (
                <Button
                  onClick={() => {
                    setChecked(false);
                    setAnswers(new Array(lesson.quiz.length).fill(-1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t.retry}
                </Button>
              )}
              {passed && next && (
                <Link href={`/${lang}/grammar/${next.slug}`}>
                  <Button>
                    {t.nextLesson}: {next.title} →
                  </Button>
                </Link>
              )}
              <Link href={`/${lang}/grammar`}>
                <Button variant="secondary">{t.backToList}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
