"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { notifyStatsChanged } from "@/lib/gamification";
import {
  skillsApi,
  type Passage,
  type PassageListItem,
  type ReadingResult,
} from "@/lib/skills";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export function ReadingView({ lang, skills }: { lang: string; skills: Dictionary["skills"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<PassageListItem[] | null>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ReadingResult | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    skillsApi.passages().then((list) => {
      if (!cancelled) setItems(list);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const open = (slug: string) => {
    skillsApi.passage(slug).then((p) => {
      setPassage(p);
      setAnswers(Array(p.questions.length).fill(-1));
      setResult(null);
    }).catch(() => {});
  };

  const close = () => {
    setPassage(null);
    setResult(null);
  };

  const submit = () => {
    if (!passage) return;
    skillsApi.submitReading(passage.slug, answers).then((r) => {
      setResult(r);
      notifyStatsChanged();
    }).catch(() => {});
  };

  if (!ready || !user || items === null) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </div>
    );
  }

  // --- Passage detail ---
  if (passage) {
    const allAnswered = answers.every((a) => a >= 0);
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <button type="button" onClick={close} className="text-sm font-medium text-ink-soft hover:text-ink">
          ← {skills.reading.name}
        </button>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-ink">{passage.title_en}</h1>
          <span className="rounded-full bg-brand-600/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-300">
            {passage.cefr_level}
          </span>
        </div>

        <article className="mt-4 rounded-xl2 border border-line bg-card p-6 leading-relaxed text-ink">
          {passage.body_en}
        </article>
        {result && passage.summary_uz && (
          <p className="mt-3 rounded-xl bg-brand-600/5 px-4 py-3 text-sm text-ink-soft">
            🇺🇿 {passage.summary_uz}
          </p>
        )}

        <div className="mt-6 space-y-6">
          {passage.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-semibold text-ink">
                {qi + 1}. {q.prompt_en}
                {result && (
                  <span className={cn("ml-2", result.results[qi] ? "text-success-text" : "text-danger-text")}>
                    {result.results[qi] ? "✓" : "✗"}
                  </span>
                )}
              </p>
              <div className="mt-2 grid gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    disabled={!!result}
                    onClick={() =>
                      setAnswers(answers.map((a, i) => (i === qi ? oi : a)))
                    }
                    className={cn(
                      "rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors",
                      answers[qi] === oi
                        ? result
                          ? result.results[qi]
                            ? "border-success bg-success/10 text-success-text"
                            : "border-danger bg-danger/10 text-danger-text"
                          : "border-brand-400 bg-brand-500/5 text-ink"
                        : "border-line bg-card text-ink hover:border-brand-400",
                      result && answers[qi] !== oi && "opacity-60"
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
              {result.correct === result.total ? "🏆" : result.correct > 0 ? "🎉" : "💪"}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {result.correct}/{result.total}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
              +{result.xp_gained} XP
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={close}>
              {skills.backToList}
            </Button>
          </div>
        ) : (
          <Button fullWidth className="mt-8" disabled={!allAnswered} onClick={submit}>
            {skills.submitAnswers}
          </Button>
        )}
      </main>
    );
  }

  // --- Passage list ---
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        📖 {skills.reading.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{skills.reading.desc}</p>

      {LEVELS.map((level) => {
        const group = items.filter((p) => p.cefr_level === level);
        if (group.length === 0) return null;
        return (
          <section key={level} className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{level}</h2>
            <div className="mt-3 space-y-2">
              {group.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-slug={p.slug}
                  onClick={(e) => open(e.currentTarget.dataset.slug ?? "")}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-left transition-colors hover:border-brand-400"
                >
                  <span className="font-semibold text-ink">{p.title_en}</span>
                  <span className="text-xs text-ink-soft">
                    {p.question_count} {skills.questions}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
