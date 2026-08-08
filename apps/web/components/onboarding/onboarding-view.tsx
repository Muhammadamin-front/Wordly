"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Coffee,
  Dumbbell,
  GraduationCap,
  Landmark,
  Laptop,
  Map,
  MessageCircleMore,
  Plane,
  Rocket,
  ScanSearch,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { PlacementTest } from "@/components/onboarding/placement-test";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { onboardingApi, type OnboardingInput } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["onboarding"];
type Level = OnboardingInput["cefr_level"];
type Goal = OnboardingInput["learning_goal"];
type Minutes = OnboardingInput["daily_minutes"];

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const GOALS: { value: Goal; icon: LucideIcon }[] = [
  { value: "general", icon: Target },
  { value: "travel", icon: Plane },
  { value: "career", icon: BriefcaseBusiness },
  { value: "ielts", icon: GraduationCap },
];
const INTERESTS: { value: string; icon: LucideIcon }[] = [
  { value: "daily-life", icon: Coffee },
  { value: "travel", icon: Plane },
  { value: "work", icon: BriefcaseBusiness },
  { value: "education", icon: BookOpen },
  { value: "technology", icon: Laptop },
  { value: "culture", icon: Landmark },
];
const MINUTES: Minutes[] = [5, 10, 15, 20];

export function OnboardingView({ lang, copy }: { lang: string; copy: Copy }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { user, ready, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<Level>("A1");
  const [placementOpen, setPlacementOpen] = useState(true);
  const [placementLevel, setPlacementLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState<Goal>("general");
  const [interests, setInterests] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<Minutes>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
    if (ready && user?.profile.onboarding_completed && !loading) {
      router.replace(`/${lang}/dashboard`);
    }
  }, [ready, user, loading, router, lang]);

  function toggleInterest(value: string) {
    setInterests((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (current.length >= 3) return current;
      return [...current, value];
    });
  }

  async function finish() {
    setLoading(true);
    setError(false);
    try {
      const result = await onboardingApi.complete({
        cefr_level: level,
        learning_goal: goal,
        daily_minutes: minutes,
        learning_interests: interests,
      });
      updateUser(result.user);
      router.replace(`/${lang}/review?deck=${result.starter_deck_id}&onboarding=1`);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return (
      <div className="relative flex min-h-[70dvh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const canContinue = step !== 3 || interests.length > 0;

  function applyPlacementLevel(value: Level) {
    setLevel(value);
    setPlacementLevel(value);
    setPlacementOpen(false);
  }

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-5xl items-center py-6 sm:py-10">
      <div className="surface-panel w-full overflow-hidden rounded-lg border border-line/80 shadow-[0_30px_100px_rgba(16,59,50,0.12)]">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <aside className="relative overflow-hidden bg-brand-950 p-6 text-white sm:p-8">
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(76,167,143,0.8),transparent_32%),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />
            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-xs font-bold text-brand-100">
                <Sparkles className="size-4 text-accent-300" />
                {copy.eyebrow}
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight text-white">{copy.title}</h1>
              <p className="mt-3 text-sm leading-6 text-brand-100/80">{copy.subtitle}</p>
              <div className="mt-8 lg:mt-auto">
                <p className="text-xs font-bold text-brand-100/70">
                  {copy.step} {step} / 4
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((item) => (
                    <span
                      key={item}
                      className={cn(
                        "h-1.5 rounded-full transition-colors",
                        item <= step ? "bg-accent-300" : "bg-white/15"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <MessageCircleMore className="size-4 text-brand-200" />
                  {copy.fiveWordNote}
                </p>
              </div>
            </div>
          </aside>

          <div className="flex min-h-[560px] flex-col p-5 sm:p-8 lg:p-10">
            {error && <Alert tone="error" className="mb-5">{copy.error}</Alert>}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex-1"
              >
                {step === 1 && (
                  <StepSection title={copy.levelTitle} body={copy.levelBody}>
                    {placementOpen ? (
                      <PlacementTest
                        copy={copy}
                        reducedMotion={Boolean(reducedMotion)}
                        onApply={applyPlacementLevel}
                        onCancel={() => setPlacementOpen(false)}
                      />
                    ) : (
                      <>
                        {placementLevel && (
                          <div className="mb-5 flex items-center gap-3 rounded-lg border border-brand-300/70 bg-brand-600/8 p-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-black text-white">
                              {placementLevel}
                            </span>
                            <div>
                              <p className="font-extrabold text-ink">
                                {copy.placementApplied.replace("{level}", placementLevel)}
                              </p>
                              <p className="mt-0.5 text-xs leading-5 text-ink-soft">
                                {copy.placementOverride}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {LEVELS.map((value) => (
                            <OptionButton
                              key={value}
                              selected={level === value}
                              onClick={() => setLevel(value)}
                              title={value}
                              body={copy[`level${value}`]}
                            />
                          ))}
                        </div>
                        {placementLevel && (
                          <RoadmapPreview
                            copy={copy}
                            level={level}
                            goal={goal}
                            interests={interests}
                            minutes={minutes}
                            compact
                          />
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          fullWidth
                          className="mt-4"
                          onClick={() => setPlacementOpen(true)}
                        >
                          <ScanSearch className="size-4" />
                          {copy.placementStartAgain}
                        </Button>
                      </>
                    )}
                  </StepSection>
                )}

                {step === 2 && (
                  <StepSection title={copy.goalTitle} body={copy.goalBody}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {GOALS.map(({ value, icon: Icon }) => (
                        <OptionButton
                          key={value}
                          selected={goal === value}
                          onClick={() => setGoal(value)}
                          title={copy[`goal${capitalize(value)}`]}
                          body={copy[`goal${capitalize(value)}Body`]}
                          icon={Icon}
                        />
                      ))}
                    </div>
                  </StepSection>
                )}

                {step === 3 && (
                  <StepSection title={copy.interestsTitle} body={copy.interestsBody}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {INTERESTS.map(({ value, icon: Icon }) => (
                        <OptionButton
                          key={value}
                          selected={interests.includes(value)}
                          onClick={() => toggleInterest(value)}
                          title={copy[`interest${interestKey(value)}`]}
                          icon={Icon}
                          compact
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-bold text-ink-soft">
                      {interests.length}/3 {copy.selected}
                    </p>
                  </StepSection>
                )}

                {step === 4 && (
                  <StepSection title={copy.timeTitle} body={copy.timeBody}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {MINUTES.map((value) => (
                        <OptionButton
                          key={value}
                          selected={minutes === value}
                          onClick={() => setMinutes(value)}
                          title={`${value}`}
                          body={copy.minutes}
                          compact
                        />
                      ))}
                    </div>
                    <RoadmapPreview
                      copy={copy}
                      level={level}
                      goal={goal}
                      interests={interests}
                      minutes={minutes}
                    />
                  </StepSection>
                )}
              </motion.div>
            </AnimatePresence>

            {!(step === 1 && placementOpen) && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1 || loading}
                >
                  <ArrowLeft className="size-4" />
                  {copy.back}
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setStep((current) => Math.min(4, current + 1))}
                    disabled={!canContinue}
                  >
                    {copy.continue}
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void finish()} loading={loading}>
                    {copy.startLesson}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


function RoadmapPreview({
  copy,
  level,
  goal,
  interests,
  minutes,
  compact = false,
}: {
  copy: Copy;
  level: Level;
  goal: Goal;
  interests: string[];
  minutes: Minutes;
  compact?: boolean;
}) {
  const goalLabel = copy[`goal${capitalize(goal)}`];
  const selectedInterests = interests.length
    ? interests.map((item) => copy[`interest${interestKey(item)}`]).join(" · ")
    : copy.roadmapInterestsFallback;
  const items = [
    {
      icon: Map,
      title: copy.roadmapStep1Title,
      body: copy.roadmapStep1Body.replace("{level}", level),
    },
    {
      icon: Rocket,
      title: copy.roadmapStep2Title,
      body: copy.roadmapStep2Body.replace("{goal}", goalLabel),
    },
    {
      icon: Dumbbell,
      title: copy.roadmapStep3Title,
      body: copy.roadmapStep3Body.replace("{minutes}", String(minutes)),
    },
    {
      icon: CalendarDays,
      title: copy.roadmapStep4Title,
      body: copy.roadmapStep4Body,
    },
  ];

  return (
    <div
      className={cn(
        "mt-7 overflow-hidden rounded-[24px] border border-brand-300/45 bg-[linear-gradient(145deg,rgba(23,107,92,0.12),rgba(210,168,79,0.08))] shadow-[0_20px_55px_rgba(7,58,53,0.10)]",
        compact && "mt-5"
      )}
    >
      <div className="border-b border-line/70 bg-card/58 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-brand-700 dark:text-brand-200">
              <Sparkles className="size-4" aria-hidden />
              {copy.roadmapEyebrow}
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-ink sm:text-2xl">
              {copy.roadmapTitle.replace("{level}", level)}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              {copy.roadmapBody
                .replace("{goal}", goalLabel)
                .replace("{minutes}", String(minutes))}
            </p>
          </div>
          <div className="grid min-w-[180px] grid-cols-3 gap-2 rounded-2xl border border-line/70 bg-raised/72 p-2 text-center shadow-inner shadow-brand-950/5">
            <Metric label={copy.roadmapLevelLabel} value={level} />
            <Metric label={copy.roadmapTimeLabel} value={`${minutes}`} />
            <Metric label={copy.roadmapGoalLabel} value={goalLabel} small />
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-line/70 bg-raised/58 px-3 py-2 text-xs font-bold leading-5 text-ink-soft">
          {copy.roadmapInterestsLabel}: <span className="text-ink">{selectedInterests}</span>
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {items.map(({ icon: Icon, title, body }, index) => (
          <div key={title} className="flex gap-3 rounded-2xl border border-line/70 bg-card/62 p-4 backdrop-blur-xl">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-sm font-black text-white shadow-[0_12px_28px_rgba(7,58,53,0.18)]">
              {index + 1}
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-ink">
                <Icon className="size-4 text-brand-600 dark:text-brand-300" aria-hidden />
                {title}
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="border-t border-line/70 bg-brand-950 px-4 py-3 text-sm font-bold text-brand-100 sm:px-5">
          {copy.readyBody.replace("{level}", level).replace("{count}", "5")}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <span className="min-w-0 rounded-xl bg-white/58 px-2 py-2 dark:bg-white/8">
      <span className="block text-[10px] font-black uppercase text-ink-soft">{label}</span>
      <span className={cn("mt-0.5 block truncate font-black text-ink", small ? "text-xs" : "text-lg")}>{value}</span>
    </span>
  );
}

function StepSection({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">{body}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  title,
  body,
  icon: Icon,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative flex min-h-24 w-full flex-col items-start justify-center rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-0.5",
        compact && "min-h-20",
        selected
          ? "border-brand-500 bg-brand-600/10 shadow-[0_12px_30px_rgba(40,135,115,0.12)]"
          : "border-line bg-card/55 hover:border-brand-300 hover:bg-raised"
      )}
    >
      <span className="flex w-full items-center gap-2">
        {Icon && <Icon className="size-5 shrink-0 text-brand-600 dark:text-brand-300" />}
        <strong className="text-base font-extrabold text-ink">{title}</strong>
        {selected && (
          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-brand-600 text-white">
            <Check className="size-3.5" />
          </span>
        )}
      </span>
      {body && <span className="mt-1.5 text-xs leading-5 text-ink-soft">{body}</span>}
    </button>
  );
}

function capitalize(value: string): "General" | "Travel" | "Career" | "Ielts" {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as
    | "General"
    | "Travel"
    | "Career"
    | "Ielts";
}

function interestKey(
  value: string
): "DailyLife" | "Travel" | "Work" | "Education" | "Technology" | "Culture" {
  if (value === "daily-life") return "DailyLife";
  return capitalize(value) as "Travel" | "Work" | "Education" | "Technology" | "Culture";
}
