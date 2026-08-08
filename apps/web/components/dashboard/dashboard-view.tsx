"use client";

import {
  ArrowRight,
  CircleAlert,
  Flame,
  GraduationCap,
  LibraryBig,
  Map,
  Route,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { DailyQuestsPanel } from "@/components/gamification/daily-quests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { gamificationApi, STATS_CHANGED_EVENT, type Stats } from "@/lib/gamification";
import { learningApi, type LearningPlan } from "@/lib/learning";

const GOAL_OPTIONS = [10, 20, 30, 50];

type DashboardCopy = {
  commandEyebrow: string;
  commandTitle: string;
  commandBody: string;
  continueLearning: string;
  reviewNow: string;
  noDueBody: string;
  focusTitle: string;
  focusBody: string;
  goalTitle: string;
  due: string;
  newWords: string;
  accuracy: string;
  reviewed: string;
  recommendations: string;
  libraryTitle: string;
  libraryBody: string;
  ieltsTitle: string;
  ieltsBody: string;
  progressTitle: string;
  progressBody: string;
  mistakesTitle: string;
  mistakesBody: string;
  level: string;
};

export function DashboardView({
  lang,
  dict,
  gam,
}: {
  lang: string;
  dict: Pick<Dictionary, "dashboard" | "nav" | "common" | "ai" | "mastery">;
  gam: Dictionary["gam"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const copy = dashboardCopy(lang);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
    if (ready && user && !user.profile.onboarding_completed) {
      router.replace(`/${lang}/onboarding`);
    }
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const loadStats = () =>
      gamificationApi.stats().then((s) => !cancelled && setStats(s)).catch(() => {});
    learningApi
      .plan()
      .then((plan) => {
        if (!cancelled) setLearningPlan(plan);
      })
      .catch(() => {});
    loadStats();
    window.addEventListener(STATS_CHANGED_EVENT, loadStats);
    return () => {
      cancelled = true;
      window.removeEventListener(STATS_CHANGED_EVENT, loadStats);
    };
  }, [ready, user]);

  async function changeGoal(goal: number) {
    const updated = await gamificationApi.setDailyGoal(goal);
    setStats(updated);
  }

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span
          aria-label={dict.common.loading}
          className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent"
        />
      </main>
    );
  }

  const dueTotal = (learningPlan?.due_count ?? 0) + (learningPlan?.new_count ?? 0);
  const reviewProgress = stats
    ? Math.min(100, Math.round((stats.reviews_today / stats.daily_goal) * 100))
    : 0;
  const nextHref = dueTotal > 0 ? `/${lang}/review` : `/${lang}/today`;
  const nextLabel = dueTotal > 0 ? copy.reviewNow : copy.continueLearning;
  const nextBody = learningPlan
    ? dueTotal > 0
      ? `${learningPlan.due_count} ${copy.due} · ${learningPlan.new_count} ${copy.newWords.toLowerCase()}`
      : copy.noDueBody
    : dict.dashboard.dailyPathDesc;

  return (
    <main className="app-container page-stack flex-1">
      <section className="surface-panel rounded-[28px] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-black uppercase text-accent-600 dark:text-accent-300">
              <Sparkles className="size-4" aria-hidden />
              {copy.commandEyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-balance text-3xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {dict.dashboard.welcome}, {user.profile.display_name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {copy.commandBody}
            </p>

            {!user.email_verified && (
              <Alert tone="info" className="mt-6">
                {dict.dashboard.verifyBanner}
              </Alert>
            )}

            <div className="premium-card light-sweep mt-6 rounded-[24px] p-5 sm:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="icon-tile size-12 rounded-lg">
                    <Route className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
                  </span>
                  <p className="mt-5 text-xs font-black uppercase text-accent-600 dark:text-accent-300">
                    {copy.focusTitle}
                  </p>
                  <h2 className="mt-2 max-w-xl text-2xl font-black tracking-tight text-ink sm:text-3xl">
                    {copy.commandTitle}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
                    {nextBody}
                  </p>
                </div>
                <Link href={nextHref} className="shrink-0">
                  <Button size="lg">
                    <Target className="size-4" aria-hidden />
                    {nextLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line/70 pt-5">
                <CommandMetric label={copy.due} value={learningPlan?.due_count ?? "—"} />
                <CommandMetric label={copy.newWords} value={learningPlan?.new_count ?? "—"} />
                <CommandMetric
                  label={copy.accuracy}
                  value={learningPlan ? `${learningPlan.recent_accuracy}%` : "—"}
                />
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="premium-card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-ink-soft">{copy.goalTitle}</p>
                  <p className="mt-1 text-2xl font-black text-ink">
                    {stats ? `${stats.reviews_today}/${stats.daily_goal}` : "—"}
                  </p>
                </div>
                <span className="icon-tile size-12 rounded-lg">
                  <Zap className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-600 via-brand-400 to-accent-400 transition-all"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
              {stats && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-bold text-ink-soft">{gam.setGoal}</span>
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => void changeGoal(goal)}
                      className={
                        "rounded-md border px-2.5 py-1 text-xs font-black transition-all " +
                        (stats.daily_goal === goal
                          ? "border-brand-400 bg-brand-600 text-white shadow-[0_10px_30px_rgba(40,135,115,0.22)]"
                          : "border-line text-ink-soft hover:-translate-y-0.5 hover:bg-card hover:text-ink")
                      }
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SideStat
                icon={Flame}
                label={gam.streak}
                value={stats?.current_streak ?? "—"}
                tone="text-orange-600 dark:text-orange-300"
              />
              <SideStat
                icon={Trophy}
                label={stats?.league_tier ?? gam.level}
                value={stats ? copy.level + " " + stats.level : "—"}
                tone="text-accent-600 dark:text-accent-300"
              />
            </div>
          </aside>
        </div>
      </section>

      <DailyQuestsPanel lang={lang} gam={gam} />

      <section className="section-stack">
        <div>
          <p className="text-xs font-black uppercase text-accent-600 dark:text-accent-300">
            {copy.recommendations}
          </p>
          <h2 className="mt-1 text-2xl font-black text-ink">{copy.focusBody}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ContextCard
            href={learningPlan && learningPlan.mistake_count > 0 ? `/${lang}/mistakes` : `/${lang}/decks`}
            icon={learningPlan && learningPlan.mistake_count > 0 ? CircleAlert : LibraryBig}
            title={learningPlan && learningPlan.mistake_count > 0 ? copy.mistakesTitle : copy.libraryTitle}
            body={learningPlan && learningPlan.mistake_count > 0 ? copy.mistakesBody : copy.libraryBody}
          />
          <ContextCard
            href={`/${lang}/ielts`}
            icon={GraduationCap}
            title={copy.ieltsTitle}
            body={copy.ieltsBody}
          />
          <ContextCard
            href={`/${lang}/mastery`}
            icon={Map}
            title={copy.progressTitle}
            body={copy.progressBody}
          />
        </div>
      </section>
    </main>
  );
}

function CommandMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-black text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase text-ink-soft">{label}</p>
    </div>
  );
}

function SideStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="premium-card rounded-[20px] p-4">
      <Icon className={`size-5 ${tone}`} aria-hidden />
      <p className="mt-4 text-xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold capitalize text-ink-soft">{label}</p>
    </div>
  );
}

function ContextCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="premium-card group flex min-h-44 flex-col rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="icon-tile size-11 rounded-lg">
          <Icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
        </span>
        <ArrowRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
      </div>
      <div className="mt-auto pt-8">
        <h3 className="text-lg font-black text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
      </div>
    </Link>
  );
}

function dashboardCopy(lang: string): DashboardCopy {
  if (lang === "ru") {
    return {
      commandEyebrow: "Командный центр",
      commandTitle: "Продолжите самый важный шаг на сегодня",
      commandBody:
        "Vocora показывает один главный путь: повторите нужные слова, закрепите слабые места и возвращайтесь к прогрессу без лишнего поиска.",
      continueLearning: "Продолжить обучение",
      reviewNow: "Начать повторение",
      noDueBody: "Повторения закрыты. Откройте сегодняшний путь для короткой тренировки и новых слов.",
      focusTitle: "Следующее действие",
      focusBody: "Полезные shortcuts",
      goalTitle: "Дневная цель",
      due: "К повторению",
      newWords: "Новые слова",
      accuracy: "Точность",
      reviewed: "Повторено",
      recommendations: "Контекстно",
      libraryTitle: "Библиотека",
      libraryBody: "Найдите слова по уровню, теме или IELTS и добавьте их в SRS.",
      ieltsTitle: "IELTS",
      ieltsBody: "Используйте лексику в форматах reading, writing, listening и speaking.",
      progressTitle: "Прогресс",
      progressBody: "Посмотрите, какие слова стали сильными и какие требуют повторения.",
      mistakesTitle: "Слабые слова",
      mistakesBody: "Сначала восстановите слова, в которых недавно ошибались.",
      level: "Ур.",
    };
  }
  if (lang === "en") {
    return {
      commandEyebrow: "Learning command center",
      commandTitle: "Continue the one step that matters today",
      commandBody:
        "Vocora keeps the path focused: review what is due, repair weak words, and return to progress without hunting through menus.",
      continueLearning: "Continue learning",
      reviewNow: "Start review",
      noDueBody: "Your due reviews are clear. Open today's path for a short practice round and fresh words.",
      focusTitle: "Next action",
      focusBody: "Useful shortcuts",
      goalTitle: "Daily goal",
      due: "Due",
      newWords: "New words",
      accuracy: "Accuracy",
      reviewed: "Reviewed",
      recommendations: "Contextual",
      libraryTitle: "Library",
      libraryBody: "Find words by level, topic, or IELTS focus and add them to SRS.",
      ieltsTitle: "IELTS",
      ieltsBody: "Practice vocabulary inside reading, writing, listening, and speaking contexts.",
      progressTitle: "Progress",
      progressBody: "See which words are strong, mastered, or ready for another review.",
      mistakesTitle: "Weak words",
      mistakesBody: "Repair the words you recently missed before adding more.",
      level: "Lv.",
    };
  }
  return {
    commandEyebrow: "O'rganish markazi",
    commandTitle: "Bugun eng muhim bitta qadamni davom ettiring",
    commandBody:
      "Vocora yo'lni aniq tutadi: navbati kelgan so'zlarni takrorlang, zaif joylarni tuzating va menyular orasida adashmasdan progressga qayting.",
    continueLearning: "O'rganishni davom ettirish",
    reviewNow: "Takrorlashni boshlash",
    noDueBody: "Bugungi review yopilgan. Qisqa mashq va yangi so'zlar uchun bugungi yo'lni oching.",
    focusTitle: "Keyingi action",
    focusBody: "Foydali qisqa yo'llar",
    goalTitle: "Kunlik maqsad",
    due: "Takrorlash",
    newWords: "Yangi so'z",
    accuracy: "Aniqlik",
    reviewed: "Takrorlandi",
    recommendations: "Kontekst",
    libraryTitle: "Kutubxona",
    libraryBody: "So'zlarni daraja, mavzu yoki IELTS bo'yicha topib SRS'ga qo'shing.",
    ieltsTitle: "IELTS",
    ieltsBody: "Vocabulary'ni reading, writing, listening va speaking kontekstida ishlating.",
    progressTitle: "Progress",
    progressBody: "Qaysi so'zlar mustahkam, o'zlashtirilgan yoki qayta ko'rilishi kerakligini ko'ring.",
    mistakesTitle: "Zaif so'zlar",
    mistakesBody: "Yangi so'z qo'shishdan oldin yaqinda adashgan so'zlarni tuzating.",
    level: "Lv.",
  };
}
