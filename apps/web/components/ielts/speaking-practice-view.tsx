"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  SPEAKING_PRACTICE_TOPICS,
  sampleAnswer,
  speakingTopicsByPart,
  type SpeakingPart,
  type SpeakingTopic,
} from "@/lib/speaking-practice";
import { cn } from "@/lib/utils";

type Copy = Dictionary["speakingPractice"];

/** Part tabs. Labels stay as "Part 1/2/3" in every locale — that is what the
 *  exam calls them — while the helper line is translated. */
function partTabs(t: Copy): Array<{ key: SpeakingPart; label: string; helper: string }> {
  return [
    { key: "part1", label: "Part 1", helper: t.part1Helper },
    { key: "part2", label: "Part 2", helper: t.part2Helper },
    { key: "part3", label: "Part 3", helper: t.part3Helper },
  ];
}

export function SpeakingPracticeView({ t }: { t: Copy }) {
  const { user, ready } = useAuth();
  // Progress is namespaced per account, so the practice UI only mounts once we
  // know whose progress to read. Remounting on `key` also clears in-memory
  // state when the signed-in user changes.
  if (!ready) return <SpeakingPracticeSkeleton />;
  const scope = user?.id ?? "guest";
  return <SpeakingPractice key={scope} scope={scope} t={t} />;
}

function SpeakingPracticeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <div className="h-64 animate-pulse rounded-lg border border-line bg-card/60" />
    </main>
  );
}

function SpeakingPractice({ scope, t }: { scope: string; t: Copy }) {
  const [activePart, setActivePart] = useState<SpeakingPart>("part1");
  const [selected, setSelected] = useState<SpeakingTopic | null>(null);
  const [completed, setCompleted] = useState<string[]>(() =>
    readStoredList("vocora-speaking-completed", scope)
  );
  const [saved, setSaved] = useState<string[]>(() =>
    readStoredList("vocora-speaking-saved", scope)
  );

  const topics = useMemo(() => speakingTopicsByPart(activePart), [activePart]);
  const parts = useMemo(() => partTabs(t), [t]);
  const completedCount = SPEAKING_PRACTICE_TOPICS.filter((topic) =>
    completed.includes(topic.slug)
  ).length;
  const progress = (completedCount / SPEAKING_PRACTICE_TOPICS.length) * 100;

  function toggleSaved(slug: string) {
    const next = saved.includes(slug)
      ? saved.filter((item) => item !== slug)
      : [...saved, slug];
    setSaved(next);
    storeList("vocora-speaking-saved", next, scope);
  }

  function completeTopic(slug: string) {
    if (completed.includes(slug)) return;
    const next = [...completed, slug];
    setCompleted(next);
    storeList("vocora-speaking-completed", next, scope);
  }

  if (selected) {
    return (
      <SpeakingTopicDetail
        topic={selected}
        scope={scope}
        isSaved={saved.includes(selected.slug)}
        isCompleted={completed.includes(selected.slug)}
        onBack={() => setSelected(null)}
        onToggleSave={() => toggleSaved(selected.slug)}
        onComplete={() => completeTopic(selected.slug)}
        t={t}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <section className="surface-panel overflow-hidden rounded-lg p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-600/8 px-3 py-1.5 text-xs font-black uppercase text-brand-700 dark:text-brand-200">
              <Mic2 className="size-4" aria-hidden />
              {t.eyebrow}
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-ink sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {t.intro}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-ink-soft">{t.completedTopics}</p>
                <p className="mt-1 text-3xl font-black text-ink">
                  {completedCount}
                  <span className="text-ink-soft">/{SPEAKING_PRACTICE_TOPICS.length}</span>
                </p>
              </div>
              <span className="icon-tile size-12 text-brand-600">
                <Target className="size-5" aria-hidden />
              </span>
            </div>
            <Progress value={progress} label={t.progressLabel} className="mt-4 h-2.5" />
            <p className="mt-3 text-xs leading-5 text-ink-soft">
              {t.progressHint}
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-[6.25rem] z-20 mt-5 rounded-full border border-line bg-raised/88 p-1 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1">
          {parts.map((part) => (
            <button
              key={part.key}
              type="button"
              onClick={() => setActivePart(part.key)}
              className={cn(
                "rounded-full px-3 py-2 text-center transition-all",
                activePart === part.key
                  ? "bg-primary text-white shadow-[0_10px_24px_rgba(12,46,20,0.22)] dark:text-brand-950"
                  : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              <span className="block text-sm font-black">{part.label}</span>
              <span className="hidden text-[10px] font-bold opacity-80 sm:block">{part.helper}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="mt-5 grid gap-3">
        {topics.map((topic) => (
          <TopicCard
            key={topic.slug}
            topic={topic}
            completed={completed.includes(topic.slug)}
            saved={saved.includes(topic.slug)}
            onOpen={() => setSelected(topic)}
            t={t}
          />
        ))}
      </section>
    </main>
  );
}

function TopicCard({
  topic,
  completed,
  saved,
  onOpen,
  t,
}: {
  topic: SpeakingTopic;
  completed: boolean;
  saved: boolean;
  onOpen: () => void;
  t: Copy;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-lg border border-line bg-card/78 p-4 text-left shadow-[0_10px_28px_rgba(27,64,55,0.055)] transition-all hover:-translate-y-0.5 hover:border-brand-400/55 hover:bg-raised hover:shadow-[0_18px_46px_rgba(27,64,55,0.095)]"
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg border",
          completed
            ? "border-success/25 bg-success/10 text-success"
            : "border-brand-400/20 bg-brand-600/8 text-brand-600"
        )}
      >
        {completed ? <CheckCircle2 className="size-5" /> : <Mic2 className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-black text-ink">{topic.title}</span>
          {saved && <BookmarkCheck className="size-4 text-accent-500" aria-hidden />}
        </span>
        <span className="mt-1 block text-sm leading-6 text-ink-soft">{topic.description}</span>
        <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-600/8 px-2.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-200">
          {topic.part === "part2"
            ? t.cueCardBadge
            : t.questionsBadge.replace("{count}", String(topic.questions.length))}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-ink" />
    </button>
  );
}

function SpeakingTopicDetail({
  topic,
  scope,
  isSaved,
  isCompleted,
  onBack,
  onToggleSave,
  onComplete,
  t,
}: {
  topic: SpeakingTopic;
  scope: string;
  isSaved: boolean;
  isCompleted: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onComplete: () => void;
  t: Copy;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [rating, setRating] = useState<RatingValue | null>(() =>
    readStoredRating(topic.slug, scope)
  );
  const question = topic.questions[questionIndex];
  const progress = ((questionIndex + 1) / topic.questions.length) * 100;

  // A topic counts as practised once the learner has actually worked through
  // it: every question seen for Part 1/3, or a rated attempt for a cue card.
  // "Complete" could previously be pressed on arrival, so the progress figure
  // on the hub measured button presses rather than practice.
  const canComplete = topic.cueCard
    ? rating !== null
    : furthestIndex >= topic.questions.length - 1;

  function rate(value: RatingValue) {
    setRating(value);
    storeRating(topic.slug, value, scope);
  }

  function goToQuestion(next: number) {
    setShowSample(false);
    setQuestionIndex(next);
    setFurthestIndex((value) => Math.max(value, next));
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card/70 px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.back}
      </button>

      <section className="surface-panel mt-5 rounded-lg p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-brand-600/8 px-3 py-1 text-xs font-black uppercase text-brand-700 dark:text-brand-200">
              {topic.part.replace("part", "Part ")}
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-5xl">{topic.title}</h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{topic.description}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onToggleSave}>
              {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
              {isSaved ? t.saved : t.save}
            </Button>
            <Button
              type="button"
              onClick={onComplete}
              disabled={isCompleted || !canComplete}
              title={
                canComplete || isCompleted
                  ? undefined
                  : topic.cueCard
                    ? t.completeHintCue
                    : t.completeHintQuestions
              }
            >
              <CheckCircle2 className="size-4" />
              {isCompleted ? t.completed : t.complete}
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-panel rounded-lg p-5 sm:p-6">
          {topic.cueCard ? (
            <CueCard topic={topic} t={t} />
          ) : (
            <QuestionPractice
              topic={topic}
              t={t}
              question={question}
              questionIndex={questionIndex}
              progress={progress}
              showSample={showSample}
              onShowSample={() => setShowSample((value) => !value)}
              onPrevious={() => goToQuestion(Math.max(0, questionIndex - 1))}
              onNext={() =>
                goToQuestion(Math.min(topic.questions.length - 1, questionIndex + 1))
              }
            />
          )}
        </section>

        <aside className="space-y-5">
          {topic.part === "part2" && <Part2Timer rating={rating} onRate={rate} t={t} />}
          <VocabularyPanel topic={topic} t={t} />
        </aside>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <InfoPanel title={t.phrases} icon={<Sparkles className="size-4" />}>
          <PhraseGroup title={t.phrasesStarting} items={topic.phrases.starting} />
          <PhraseGroup title={t.phrasesExtending} items={topic.phrases.extending} />
          <PhraseGroup title={t.phrasesConcluding} items={topic.phrases.concluding} />
        </InfoPanel>
        <InfoPanel title={t.tips} icon={<Target className="size-4" />}>
          <ul className="space-y-2">
            {topic.tips.map((tip) => (
              <li key={tip} className="text-sm leading-6 text-ink-soft">{tip}</li>
            ))}
          </ul>
        </InfoPanel>
        <InfoPanel title={t.mistakes} icon={<RotateCcw className="size-4" />}>
          <ul className="space-y-2">
            {topic.mistakes.map((mistake) => (
              <li key={mistake} className="text-sm leading-6 text-ink-soft">{mistake}</li>
            ))}
          </ul>
        </InfoPanel>
      </div>
    </main>
  );
}

function QuestionPractice({
  topic,
  t,
  question,
  questionIndex,
  progress,
  showSample,
  onShowSample,
  onPrevious,
  onNext,
}: {
  topic: SpeakingTopic;
  t: Copy;
  question: string;
  questionIndex: number;
  progress: number;
  showSample: boolean;
  onShowSample: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase text-ink-soft">
          {t.questionCounter.replace("{current}", String(questionIndex + 1)).replace("{total}", String(topic.questions.length))}
        </p>
        <span className="rounded-full bg-brand-600/8 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-200">
          {t.speakFor}
        </span>
      </div>
      <Progress value={progress} className="mt-3" />
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-6 rounded-lg border border-line bg-page/64 p-5"
        >
          <p className="text-2xl font-black leading-tight text-ink">{question}</p>
          <p className="mt-3 text-sm leading-7 text-ink-soft">
            {t.answerShape}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious} disabled={questionIndex === 0}>
          <ArrowLeft className="size-4" />
          {t.previous}
        </Button>
        <Button type="button" variant="ghost" onClick={onShowSample}>
          {showSample ? t.hideSample : t.showSample}
        </Button>
        <Button type="button" onClick={onNext} disabled={questionIndex === topic.questions.length - 1}>
          {t.next}
          <ArrowRight className="size-4" />
        </Button>
      </div>
      {showSample && (
        <div className="mt-5 rounded-lg border border-accent-400/25 bg-accent-400/8 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">{t.modelAnswer}</p>
            <span className="rounded-full bg-card/75 px-2.5 py-1 text-[10px] font-bold text-ink-soft">Study the structure — do not memorise</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-ink">{sampleAnswer(topic, question)}</p>
        </div>
      )}
    </>
  );
}

function CueCard({ topic, t }: { topic: SpeakingTopic; t: Copy }) {
  const cue = topic.cueCard;
  const [showSample, setShowSample] = useState(false);
  if (!cue) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase text-ink-soft">{t.cueInstruction}</p>
      <h2 className="mt-2 text-2xl font-black text-ink">{cue.instruction}</h2>
      <div className="mt-5 rounded-lg border border-line bg-page/64 p-5">
        <p className="font-bold text-ink">{t.youShouldSay}</p>
        <ul className="mt-3 space-y-2">
          {cue.prompts.map((prompt) => (
            <li key={prompt} className="flex gap-2 text-sm leading-6 text-ink-soft">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {prompt}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <p className="text-xs font-black uppercase text-ink-soft">{t.followUps}</p>
        <ul className="mt-2 space-y-2">
          {cue.followUps.map((question) => (
            <li key={question} className="rounded-lg border border-line bg-card/70 p-3 text-sm font-semibold text-ink">
              {question}
            </li>
          ))}
        </ul>
      </div>
      {topic.planning && topic.planning.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-black uppercase text-ink-soft">{t.planningNotes}</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            {t.planningHint}
          </p>
          <div className="mt-3 space-y-3">
            {topic.planning.map((item) => (
              <div key={item.question} className="rounded-lg border border-line bg-card/70 p-3">
                <p className="text-sm font-bold text-ink">{item.question}</p>
                <p className="mt-1.5 text-sm leading-6 text-ink-soft">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5">
        <Button type="button" variant="ghost" onClick={() => setShowSample((value) => !value)}>
          {showSample ? t.hideModel : t.showModel}
        </Button>
        {showSample && (
          <div className="mt-3 rounded-lg border border-accent-400/25 bg-accent-400/8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">{t.modelAnswer}</p>
              <span className="rounded-full bg-card/75 px-2.5 py-1 text-[10px] font-bold text-ink-soft">{t.modelBadge}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink">{sampleAnswer(topic, cue.instruction)}</p>
            <p className="mt-3 border-t border-accent-400/20 pt-3 text-xs leading-5 text-ink-soft">
              {t.modelHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type RatingValue = "needs-work" | "good" | "strong";

const RATING_VALUES: RatingValue[] = ["needs-work", "good", "strong"];

function ratingOptions(t: Copy) {
  return [
    { value: "needs-work" as const, label: t.rateNeedsWork, advice: t.adviceNeedsWork },
    { value: "good" as const, label: t.rateGood, advice: t.adviceGood },
    { value: "strong" as const, label: t.rateStrong, advice: t.adviceStrong },
  ];
}

function Part2Timer({
  rating,
  onRate,
  t,
}: {
  rating: RatingValue | null;
  onRate: (value: RatingValue) => void;
  t: Copy;
}) {
  const [phase, setPhase] = useState<"idle" | "prep" | "speak" | "finished">("idle");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const total = phase === "speak" ? 120 : 60;
  const ratio = secondsLeft / total;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (!running || phase === "idle" || phase === "finished") return;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value > 1) return value - 1;
        if (phase === "prep") {
          setPhase("speak");
          return 120;
        }
        setPhase("finished");
        setRunning(false);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, running]);

  function startPrep() {
    setPhase("prep");
    setSecondsLeft(60);
    setRunning(true);
  }

  function reset() {
    setPhase("idle");
    setRunning(false);
    setSecondsLeft(60);
  }

  return (
    <section className="surface-panel rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-ink-soft">{t.timerTitle}</p>
          <h2 className="mt-1 text-xl font-black text-ink">
            {phase === "prep" ? t.phasePreparation : phase === "speak" ? t.phaseSpeaking : phase === "finished" ? t.phaseFinished : t.phaseReady}
          </h2>
        </div>
        <Timer className="size-5 text-brand-600" aria-hidden />
      </div>

      <div className="mx-auto mt-5 grid size-40 place-items-center rounded-full bg-card">
        <div
          className="grid size-36 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#467878 ${Math.round(ratio * 360)}deg, rgba(84, 37, 15, 0.16) 0deg)`,
          }}
        >
          <div className="grid size-28 place-items-center rounded-full bg-raised text-center">
            <p className="text-3xl font-black text-ink">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            <p className="text-[10px] font-black uppercase text-ink-soft">
              {phase === "speak" ? t.labelSpeak : t.labelPrepare}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-brand-600/8 p-3 text-center text-sm font-semibold leading-6 text-ink-soft">
        {phase === "prep" ? t.hintPrep : phase === "speak" ? t.hintSpeak : phase === "finished" ? t.hintFinished : t.hintIdle}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {phase === "idle" || phase === "finished" ? (
          <Button type="button" className="col-span-2" onClick={startPrep}>
            <Clock3 className="size-4" />
            {t.startPreparation}
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? t.pause : t.resume}
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              <RotateCcw className="size-4" />
              {t.reset}
            </Button>
            <Button type="button" className="col-span-2" onClick={() => {
              setPhase("finished");
              setRunning(false);
              setSecondsLeft(0);
            }}>
              <Square className="size-4" />
              {t.finish}
            </Button>
          </>
        )}
      </div>

      {phase === "finished" && (
        <div className="mt-4">
          <p className="text-center text-xs font-black uppercase text-ink-soft">
            {t.rateQuestion}
          </p>
          <div className="mt-2 flex justify-center gap-2">
            {ratingOptions(t).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={rating === option.value}
                onClick={() => onRate(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                  rating === option.value
                    ? "border-brand-400 bg-brand-600/10 text-brand-700 dark:text-brand-200"
                    : "border-line bg-card text-ink-soft hover:border-brand-400 hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {rating && (
            <p className="mt-3 rounded-lg bg-brand-600/8 p-3 text-center text-xs leading-5 text-ink-soft">
              {ratingOptions(t).find((option) => option.value === rating)?.advice}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function VocabularyPanel({ topic, t }: { topic: SpeakingTopic; t: Copy }) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <p className="text-xs font-black uppercase text-ink-soft">{t.vocabulary}</p>
      <div className="mt-3 space-y-3">
        {topic.vocabulary.map((item) => (
          <div key={item.word} className="rounded-lg border border-line bg-card/70 p-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-black text-ink">{item.word}</p>
              <p className="text-xs font-bold text-brand-700 dark:text-brand-200">{item.uz}</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{item.definition}</p>
            <p className="mt-2 border-l-2 border-brand-400/30 pl-3 text-xs leading-5 text-ink">
              {item.example}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-ink">
        <span className="icon-tile size-8 text-brand-600">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PhraseGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-black uppercase text-ink-soft">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-brand-400/20 bg-brand-600/8 px-3 py-1.5 text-xs font-bold leading-5 text-ink"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Progress is namespaced per account. Without the scope, two people sharing a
 *  browser inherited each other's completed topics and saved cards. */
function scopedKey(key: string, scope: string) {
  return `${key}:${scope}`;
}

function readStoredList(key: string, scope: string) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(scopedKey(key, scope)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function storeList(key: string, value: string[], scope: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedKey(key, scope), JSON.stringify(value));
}

function readStoredRating(slug: string, scope: string): RatingValue | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(scopedKey(`vocora-speaking-rating:${slug}`, scope));
  return RATING_VALUES.includes(stored as RatingValue) ? (stored as RatingValue) : null;
}

function storeRating(slug: string, value: RatingValue, scope: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedKey(`vocora-speaking-rating:${slug}`, scope), value);
}
