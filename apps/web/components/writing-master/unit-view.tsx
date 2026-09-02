"use client";

import { ArrowRight, BookOpenText, CheckCircle2, Lock, PenLine, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { usePremiumStatus } from "@/components/billing/use-premium-status";
import { WritingFeedbackReport } from "@/components/ielts/writing-feedback-report";
import { WritingTaskVisual } from "@/components/ielts/writing-task-visual";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { ieltsApi, type WritingScore, type WritingTask } from "@/lib/ielts";
import { vocabularyResourceBySlug } from "@/lib/ielts-resources";
import { FREE_WRITING_MASTER_UNITS, passBand, tasksForUnit, type MasterUnit } from "@/lib/writing-master/curriculum";
import Link from "next/link";
import { writingMasterApi, type DrillFeedback } from "@/lib/writing-master/api";
import { recordLocalAttempt, submitAttempt } from "@/lib/writing-master/progress";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];
type Step = "vocab" | "paraphrase" | "overview" | "practice" | "done";
const STEP_SCORE: Record<Step, number> = { vocab: 25, paraphrase: 50, overview: 75, practice: 100, done: 100 };

function DrillPanel({
  quality, feedback, modelExample, label,
}: { quality: DrillFeedback["quality"]; feedback: string; modelExample: string; label: string }) {
  const tone = quality === "excellent" ? "success" : "info";
  return (
    <Alert tone={tone} className="mt-4">
      <p className="font-bold">{label}</p>
      <p className="mt-1 text-sm">{feedback}</p>
      <p className="mt-2 text-sm"><span className="font-bold">Model:</span> {modelExample}</p>
    </Alert>
  );
}

/** A brief "+N XP" pill after every drill/practice call that awards XP —
 *  server-authoritative (echoes reward.xp_gained from the response, never a
 *  client-guessed constant). Fades via the animate-xp-toast keyframe
 *  (app/globals.css), keyed by toastKey — no internal effect/timer, the
 *  caller clears xpToast itself after the same duration. */
function XpToast({ xp, leveledUp, toastKey }: { xp: number; leveledUp: boolean; toastKey: number }) {
  return (
    <div key={toastKey} className="pointer-events-none fixed left-1/2 top-6 z-50 animate-xp-toast">
      <div className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-black text-white shadow-xl dark:bg-brand-600">
        <Sparkles className="size-4 text-brand-300" />
        +{xp} XP
        {leveledUp && <span className="text-brand-300">· Level up!</span>}
      </div>
    </div>
  );
}

export function UnitView({ lang, t, unit }: { lang: string; t: Ielts; unit: MasterUnit }) {
  const { user, ready } = useAuth();
  const isPremium = usePremiumStatus();
  const locked = isPremium === false && !FREE_WRITING_MASTER_UNITS.includes(unit.slug);

  const [tasks, setTasks] = useState<Record<string, WritingTask[]> | null>(null);
  const [step, setStep] = useState<Step>("vocab");
  const [paraphraseText, setParaphraseText] = useState("");
  const [paraphraseResult, setParaphraseResult] = useState<DrillFeedback | null>(null);
  const [overviewText, setOverviewText] = useState("");
  const [overviewResult, setOverviewResult] = useState<DrillFeedback | null>(null);
  const [essay, setEssay] = useState("");
  const [score, setScore] = useState<WritingScore | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<{ xp: number; leveledUp: boolean; key: number } | null>(null);
  const pass = passBand(user?.profile.target_band_score ?? null);

  function fireXp(xp: number, leveledUp: boolean) {
    if (xp <= 0) return;
    setXpToast({ xp, leveledUp, key: Date.now() });
    window.setTimeout(() => setXpToast(null), 2400);
  }

  useEffect(() => {
    if (locked) return;
    ieltsApi.writingTasks().then(setTasks).catch(() => setError(t.error));
  }, [locked, t.error]);

  const unitTasks = useMemo(() => (tasks ? tasksForUnit(unit, tasks) : []), [tasks, unit]);
  const task = unitTasks[0]; // deterministic per visit; "new prompt" not needed for a guided drill
  const vocabulary = vocabularyResourceBySlug(unit.vocabularySlug, lang);

  async function record(newStep: Step) {
    if (!user) return;
    const s = STEP_SCORE[newStep];
    recordLocalAttempt(unit.slug, s);
    await submitAttempt(unit.slug, s);
  }

  async function checkParaphrase() {
    if (!task || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await writingMasterApi.checkParaphrase(unit.slug, task.prompt, paraphraseText, lang);
      setParaphraseResult(result);
      fireXp(result.xp_gained, result.leveled_up);
      if (result.quality !== "needs_work") await record("overview");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t.quotaOut : t.error);
    } finally {
      setPending(false);
    }
  }

  async function checkOverview() {
    if (!task?.visual || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await writingMasterApi.checkOverview(unit.slug, task.visual, overviewText, lang);
      setOverviewResult(result);
      fireXp(result.xp_gained, result.leveled_up);
      if (result.quality !== "needs_work") await record("practice");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t.quotaOut : t.error);
    } finally {
      setPending(false);
    }
  }

  async function submitPractice() {
    if (!task || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await ieltsApi.scoreWriting("task1", task.prompt, essay, lang);
      setScore(result);
      fireXp(result.reward.xp_gained, result.reward.leveled_up);
      if (result.band_overall >= pass) await record("done");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t.quotaOut : t.error);
    } finally {
      setPending(false);
    }
  }

  if (!ready) return null;

  if (locked) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <Lock className="size-8 text-ink-soft" />
        <p className="text-lg font-black text-ink">{unit.title}</p>
        <p className="text-sm text-ink-soft">Premium required for this unit.</p>
        <Link href={`/${lang}/pricing`} className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">Upgrade</Link>
      </main>
    );
  }

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const stepOrder: Step[] = ["vocab", "paraphrase", "overview", "practice"];
  const stepIndex = stepOrder.indexOf(step);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      {xpToast && <XpToast xp={xpToast.xp} leveledUp={xpToast.leveledUp} toastKey={xpToast.key} />}
      <h1 className="font-display text-3xl text-ink">{lang === "uz" ? unit.titleUz : unit.title}</h1>

      {/* step rail */}
      <ol className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        {stepOrder.map((s, i) => {
          const done = i < stepIndex || (i === stepIndex && score !== null);
          return (
            <li
              key={s}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 ${
                step === s
                  ? "border-brand-500 bg-brand-500/10 text-brand-700"
                  : done
                    ? "border-success/40 bg-success/10 text-success-text"
                    : "border-line text-ink-soft"
              }`}
            >
              {done ? <CheckCircle2 className="size-3.5" /> : <span>{i + 1}.</span>} {s}
            </li>
          );
        })}
      </ol>

      {error && <Alert tone="error" className="mt-4">{error}</Alert>}

      {step === "vocab" && vocabulary && (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-brand-700"><BookOpenText className="size-5" /><h2 className="font-black">{vocabulary.title}</h2></div>
          <p className="text-sm text-ink-soft">{vocabulary.description}</p>
          {vocabulary.groups.map((g) => (
            <div key={g.title} className="mt-4">
              <p className="text-xs font-black uppercase text-ink-soft">{g.title}</p>
              <ul className="mt-2 space-y-2">
                {g.items.map((item) => (
                  <li key={item.advanced} className="rounded-lg border border-line/70 bg-raised/50 p-3 text-sm">
                    <span className="text-ink-soft line-through">{item.basic}</span>{" "}
                    <ArrowRight className="inline size-3" />{" "}
                    <span className="font-bold text-ink">{item.advanced}</span>
                    <p className="mt-1 text-ink-soft">{item.example}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Button className="mt-5" onClick={() => { void record("paraphrase"); setStep("paraphrase"); }}>
            Continue <ArrowRight className="ml-1 size-4" />
          </Button>
        </section>
      )}

      {step === "paraphrase" && task && (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-brand-700"><PenLine className="size-5" /><h2 className="font-black">Paraphrase the title</h2></div>
          <p className="text-sm text-ink-soft">{task.prompt}</p>
          <textarea
            className="mt-3 w-full rounded-lg border border-line bg-raised/40 p-3 text-sm"
            rows={3}
            maxLength={400}
            value={paraphraseText}
            onChange={(e) => setParaphraseText(e.target.value)}
            placeholder="Write your paraphrased introduction sentence..."
          />
          {paraphraseResult && (
            <DrillPanel quality={paraphraseResult.quality} feedback={paraphraseResult.feedback} modelExample={paraphraseResult.model_example} label={paraphraseResult.quality} />
          )}
          <div className="mt-4 flex gap-2">
            <Button loading={pending} disabled={paraphraseText.trim().length < 5} onClick={() => void checkParaphrase()}>Check</Button>
            {paraphraseResult && paraphraseResult.quality !== "needs_work" && (
              <Button variant="secondary" onClick={() => setStep("overview")}>Continue <ArrowRight className="ml-1 size-4" /></Button>
            )}
          </div>
        </section>
      )}

      {step === "overview" && task?.visual && (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-brand-700"><Sparkles className="size-5" /><h2 className="font-black">Write the overview</h2></div>
          <WritingTaskVisual visual={task.visual} />
          <textarea
            className="mt-3 w-full rounded-lg border border-line bg-raised/40 p-3 text-sm"
            rows={3}
            maxLength={600}
            value={overviewText}
            onChange={(e) => setOverviewText(e.target.value)}
            placeholder="State the single most important overall pattern, no numbers..."
          />
          {overviewResult && (
            <DrillPanel quality={overviewResult.quality} feedback={overviewResult.feedback} modelExample={overviewResult.model_example} label={overviewResult.quality} />
          )}
          <div className="mt-4 flex gap-2">
            <Button loading={pending} disabled={overviewText.trim().length < 10} onClick={() => void checkOverview()}>Check</Button>
            {overviewResult && overviewResult.quality !== "needs_work" && (
              <Button variant="secondary" onClick={() => setStep("practice")}>Continue <ArrowRight className="ml-1 size-4" /></Button>
            )}
          </div>
        </section>
      )}

      {step === "practice" && task && !score && (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-3 font-black text-ink">Full practice</h2>
          <p className="text-sm text-ink-soft">{task.prompt}</p>
          {task.visual && <WritingTaskVisual visual={task.visual} />}
          <textarea
            id="master-writing-essay"
            className="mt-3 w-full rounded-lg border border-line bg-raised/40 p-3 text-sm"
            rows={12}
            maxLength={6000}
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
            <span>{words} / 150 {t.words}</span>
            <Button loading={pending} disabled={words < 20} onClick={() => void submitPractice()}>{t.getBand}</Button>
          </div>
        </section>
      )}

      {score && (
        <div className="mt-6">
          {score.band_overall >= pass ? (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
              <Trophy className="size-8 shrink-0 text-success-text" />
              <div>
                <p className="font-black text-success-text">Unit mastered!</p>
                <p className="text-sm text-ink-soft">
                  Band {score.band_overall.toFixed(1)}, at or above your {pass.toFixed(1)} pass mark for this unit.
                </p>
              </div>
            </div>
          ) : (
            <Alert tone="info" className="mb-4">
              Band {score.band_overall.toFixed(1)} — keep practicing this unit, the pass mark is {pass.toFixed(1)}.
            </Alert>
          )}
          <WritingFeedbackReport lang={lang} taskType="task1" score={score} t={t} onRetry={() => { setScore(null); setEssay(""); }} />
        </div>
      )}
    </main>
  );
}
