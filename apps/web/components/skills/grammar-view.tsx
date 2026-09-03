"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notifyStatsChanged } from "@/lib/gamification";
import { skillsApi, type GrammarQuestion, type ReadingResult } from "@/lib/skills";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export function GrammarView({ lang, skills }: { lang: string; skills: Dictionary["skills"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [level, setLevel] = useState<string>("A1");
  const [questions, setQuestions] = useState<GrammarQuestion[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ReadingResult | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    skillsApi.grammarRound(level).then((qs) => {
      if (cancelled) return;
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(""));
      setResult(null);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user, level]);

  // Resets happen in the click handler (not the effect) to keep it fetch-only.
  const pickLevel = (l: string) => {
    if (l === level) return;
    setQuestions(null);
    setResult(null);
    setLevel(l);
  };

  const submit = () => {
    if (!questions) return;
    skillsApi
      .submitGrammar(
        level,
        questions.map((q, i) => ({ prompt: q.prompt, answer: answers[i] }))
      )
      .then((r) => {
        setResult(r);
        notifyStatsChanged();
      })
      .catch(() => {});
  };

  const again = () => {
    setResult(null);
    setQuestions(null);
    skillsApi.grammarRound(level).then((qs) => {
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(""));
    }).catch(() => {});
  };

  if (!ready || !user) return null;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        🧩 {skills.grammar.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{skills.grammar.desc}</p>

      <div className="mt-6 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => pickLevel(l)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
              level === l ? "bg-brand-600 text-white" : "bg-card text-ink-soft hover:text-ink"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {questions === null ? (
        <div className="flex flex-col gap-3 py-6" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-6">
            {questions.map((q, qi) => (
              <div key={q.prompt}>
                <p className="font-semibold text-ink">
                  {qi + 1}. {q.prompt}
                  {result && (
                    <span className={cn("ml-2", result.results[qi] ? "text-success-text" : "text-danger-text")}>
                      {result.results[qi] ? "✓" : "✗"}
                    </span>
                  )}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!!result}
                      onClick={() =>
                        setAnswers(answers.map((a, i) => (i === qi ? opt : a)))
                      }
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-left text-sm font-medium transition-colors",
                        answers[qi] === opt
                          ? result
                            ? result.results[qi]
                              ? "border-success bg-success/10 text-success-text"
                              : "border-danger bg-danger/10 text-danger-text"
                            : "border-brand-400 bg-brand-500/5 text-ink"
                          : "border-line bg-card text-ink hover:border-brand-400",
                        result && answers[qi] !== opt && "opacity-60"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {result ? (
            <div className="mt-8 rounded-xl2 border border-line bg-card p-6 text-center">
              <p className="text-4xl" aria-hidden>
                {result.correct === result.total ? "🏆" : result.correct >= result.total / 2 ? "🎉" : "💪"}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-ink">
                {result.correct}/{result.total}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
                +{result.xp_gained} XP
              </p>
              <Button className="mt-4" onClick={again}>
                {skills.tryAgain}
              </Button>
            </div>
          ) : (
            <Button
              fullWidth
              className="mt-8"
              disabled={answers.some((a) => !a)}
              onClick={submit}
            >
              {skills.submitAnswers}
            </Button>
          )}
        </>
      )}
    </main>
  );
}
