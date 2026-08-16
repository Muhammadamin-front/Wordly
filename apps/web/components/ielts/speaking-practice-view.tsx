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

const PARTS: Array<{ key: SpeakingPart; label: string; helper: string }> = [
  { key: "part1", label: "Part 1", helper: "Everyday questions" },
  { key: "part2", label: "Part 2", helper: "Cue cards + timer" },
  { key: "part3", label: "Part 3", helper: "Deeper discussion" },
];

export function SpeakingPracticeView() {
  const { user, ready } = useAuth();
  // Progress is namespaced per account, so the practice UI only mounts once we
  // know whose progress to read. Remounting on `key` also clears in-memory
  // state when the signed-in user changes.
  if (!ready) return <SpeakingPracticeSkeleton />;
  const scope = user?.id ?? "guest";
  return <SpeakingPractice key={scope} scope={scope} />;
}

function SpeakingPracticeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <div className="h-64 animate-pulse rounded-lg border border-line bg-card/60" />
    </main>
  );
}

function SpeakingPractice({ scope }: { scope: string }) {
  const [activePart, setActivePart] = useState<SpeakingPart>("part1");
  const [selected, setSelected] = useState<SpeakingTopic | null>(null);
  const [completed, setCompleted] = useState<string[]>(() =>
    readStoredList("vocora-speaking-completed", scope)
  );
  const [saved, setSaved] = useState<string[]>(() =>
    readStoredList("vocora-speaking-saved", scope)
  );

  const topics = useMemo(() => speakingTopicsByPart(activePart), [activePart]);
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
              IELTS Speaking Practice
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-ink sm:text-5xl">
              Speak clearly with real IELTS-style topics.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              Part 1, Part 2 cue cards, and Part 3 discussion questions built for Uzbek learners:
              vocabulary, phrases, sample answers, mistakes, and practical tips in one calm practice flow.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-ink-soft">Completed topics</p>
                <p className="mt-1 text-3xl font-black text-ink">
                  {completedCount}
                  <span className="text-ink-soft">/{SPEAKING_PRACTICE_TOPICS.length}</span>
                </p>
              </div>
              <span className="icon-tile size-12 text-brand-600">
                <Target className="size-5" aria-hidden />
              </span>
            </div>
            <Progress value={progress} label="Speaking topic progress" className="mt-4 h-2.5" />
            <p className="mt-3 text-xs leading-5 text-ink-soft">
              Finish a topic after practising the questions and reviewing the vocabulary.
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-[4.5rem] z-20 mt-5 rounded-full border border-line bg-raised/88 p-1 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1">
          {PARTS.map((part) => (
            <button
              key={part.key}
              type="button"
              onClick={() => setActivePart(part.key)}
              className={cn(
                "rounded-full px-3 py-2 text-center transition-all",
                activePart === part.key
                  ? "bg-primary text-white shadow-[0_10px_24px_rgba(7,58,53,0.18)]"
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
}: {
  topic: SpeakingTopic;
  completed: boolean;
  saved: boolean;
  onOpen: () => void;
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
          {topic.part === "part2" ? "cue card + timer" : `${topic.questions.length} questions`}
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
}: {
  topic: SpeakingTopic;
  scope: string;
  isSaved: boolean;
  isCompleted: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onComplete: () => void;
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
        Back to topics
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
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button
              type="button"
              onClick={onComplete}
              disabled={isCompleted || !canComplete}
              title={
                canComplete || isCompleted
                  ? undefined
                  : topic.cueCard
                    ? "Record an attempt and rate it first"
                    : "Work through all the questions first"
              }
            >
              <CheckCircle2 className="size-4" />
              {isCompleted ? "Completed" : "Complete"}
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-panel rounded-lg p-5 sm:p-6">
          {topic.cueCard ? (
            <CueCard topic={topic} />
          ) : (
            <QuestionPractice
              topic={topic}
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
          {topic.part === "part2" && <Part2Timer rating={rating} onRate={rate} />}
          <VocabularyPanel topic={topic} />
        </aside>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <InfoPanel title="Useful phrases" icon={<Sparkles className="size-4" />}>
          <PhraseGroup title="Starting" items={topic.phrases.starting} />
          <PhraseGroup title="Extending" items={topic.phrases.extending} />
          <PhraseGroup title="Concluding" items={topic.phrases.concluding} />
        </InfoPanel>
        <InfoPanel title="Speaking tips" icon={<Target className="size-4" />}>
          <ul className="space-y-2">
            {topic.tips.map((tip) => (
              <li key={tip} className="text-sm leading-6 text-ink-soft">{tip}</li>
            ))}
          </ul>
        </InfoPanel>
        <InfoPanel title="Common mistakes" icon={<RotateCcw className="size-4" />}>
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
  question,
  questionIndex,
  progress,
  showSample,
  onShowSample,
  onPrevious,
  onNext,
}: {
  topic: SpeakingTopic;
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
          Question {questionIndex + 1} / {topic.questions.length}
        </p>
        <span className="rounded-full bg-brand-600/8 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-200">
          Speak 25-40 seconds
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
            Answer naturally: direct answer → reason → example → short final idea.
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious} disabled={questionIndex === 0}>
          <ArrowLeft className="size-4" />
          Previous
        </Button>
        <Button type="button" variant="ghost" onClick={onShowSample}>
          {showSample ? "Hide sample answer" : "Show sample answer"}
        </Button>
        <Button type="button" onClick={onNext} disabled={questionIndex === topic.questions.length - 1}>
          Next
          <ArrowRight className="size-4" />
        </Button>
      </div>
      {showSample && (
        <div className="mt-5 rounded-lg border border-accent-400/25 bg-accent-400/8 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">Band 8+ sample answer</p>
            <span className="rounded-full bg-card/75 px-2.5 py-1 text-[10px] font-bold text-ink-soft">Study the structure — do not memorise</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-ink">{sampleAnswer(topic, question)}</p>
        </div>
      )}
    </>
  );
}

function CueCard({ topic }: { topic: SpeakingTopic }) {
  const cue = topic.cueCard;
  const [showSample, setShowSample] = useState(false);
  if (!cue) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase text-ink-soft">Cue card instruction</p>
      <h2 className="mt-2 text-2xl font-black text-ink">{cue.instruction}</h2>
      <div className="mt-5 rounded-lg border border-line bg-page/64 p-5">
        <p className="font-bold text-ink">You should say:</p>
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
        <p className="text-xs font-black uppercase text-ink-soft">Follow-up questions</p>
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
          <p className="text-xs font-black uppercase text-ink-soft">Planning notes</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Not exam questions — use these during the one minute of preparation.
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
          {showSample ? "Hide model answer" : "Show model answer"}
        </Button>
        {showSample && (
          <div className="mt-3 rounded-lg border border-accent-400/25 bg-accent-400/8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">Band 8+ sample answer</p>
              <span className="rounded-full bg-card/75 px-2.5 py-1 text-[10px] font-bold text-ink-soft">2-minute model</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink">{sampleAnswer(topic, cue.instruction)}</p>
            <p className="mt-3 border-t border-accent-400/20 pt-3 text-xs leading-5 text-ink-soft">
              Notice how the answer works through all four bullet points in order. Try your own
              version first — the timer is on the right.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type RatingValue = "needs-work" | "good" | "strong";

const RATINGS: Array<{ value: RatingValue; label: string; advice: string }> = [
  {
    value: "needs-work",
    label: "Needs work",
    advice:
      "Run it again and focus on one bullet you rushed. Speaking the same card twice is the fastest way to improve fluency.",
  },
  {
    value: "good",
    label: "Good",
    advice:
      "Solid. Next time, add one specific detail — a name, a number, a place — to each bullet. Detail is what moves an answer past band 6.",
  },
  {
    value: "strong",
    label: "Band 8 energy",
    advice:
      "Now compare with the model answer and note any phrase you could reuse. Then move on to a new cue card.",
  },
];

function Part2Timer({
  rating,
  onRate,
}: {
  rating: RatingValue | null;
  onRate: (value: RatingValue) => void;
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
          <p className="text-xs font-black uppercase text-ink-soft">Part 2 timer</p>
          <h2 className="mt-1 text-xl font-black text-ink">
            {phase === "prep" ? "Preparation" : phase === "speak" ? "Speaking" : phase === "finished" ? "Finished" : "Ready"}
          </h2>
        </div>
        <Timer className="size-5 text-brand-600" aria-hidden />
      </div>

      <div className="mx-auto mt-5 grid size-40 place-items-center rounded-full bg-card">
        <div
          className="grid size-36 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#1b7f6f ${Math.round(ratio * 360)}deg, rgba(28, 55, 49, 0.14) 0deg)`,
          }}
        >
          <div className="grid size-28 place-items-center rounded-full bg-raised text-center">
            <p className="text-3xl font-black text-ink">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            <p className="text-[10px] font-black uppercase text-ink-soft">
              {phase === "speak" ? "speak" : "prepare"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-brand-600/8 p-3 text-center text-sm font-semibold leading-6 text-ink-soft">
        {phase === "prep"
          ? "Use this minute to write keywords."
          : phase === "speak"
            ? "Keep speaking until the timer ends."
            : phase === "finished"
              ? "Great. Rate your performance and repeat once if needed."
              : "Start with one minute of planning, then speak for two minutes."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {phase === "idle" || phase === "finished" ? (
          <Button type="button" className="col-span-2" onClick={startPrep}>
            <Clock3 className="size-4" />
            Start preparation
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? "Pause" : "Resume"}
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button type="button" className="col-span-2" onClick={() => {
              setPhase("finished");
              setRunning(false);
              setSecondsLeft(0);
            }}>
              <Square className="size-4" />
              Finish
            </Button>
          </>
        )}
      </div>

      {phase === "finished" && (
        <div className="mt-4">
          <p className="text-center text-xs font-black uppercase text-ink-soft">
            How did that attempt feel?
          </p>
          <div className="mt-2 flex justify-center gap-2">
            {RATINGS.map((option) => (
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
              {RATINGS.find((option) => option.value === rating)?.advice}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function VocabularyPanel({ topic }: { topic: SpeakingTopic }) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <p className="text-xs font-black uppercase text-ink-soft">Useful vocabulary</p>
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
  return RATINGS.some((option) => option.value === stored) ? (stored as RatingValue) : null;
}

function storeRating(slug: string, value: RatingValue, scope: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedKey(`vocora-speaking-rating:${slug}`, scope), value);
}
