"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  Gauge,
  Lightbulb,
  Link2,
  ListChecks,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
  WandSparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Button } from "@/components/ui/button";
import {
  type WritingFeedbackCategory,
  type WritingFeedbackStatus,
  type WritingObservation,
  type WritingScore,
  type WritingSentenceFeedback,
} from "@/lib/ielts";
import { cn } from "@/lib/utils";

type Ielts = Dictionary["ielts"];
type FeedbackFilter = "all" | WritingFeedbackStatus;

const REPORT_COPY = {
  en: {
    title: "IELTS Writing Feedback",
    estimatedBand: "AI Estimated Band",
    disclaimer: "An AI estimate for practice — not an official IELTS result.",
    academicTask1: "Academic Writing Task 1",
    academicTask2: "Academic Writing Task 2",
    taskAchievement: "Task Achievement",
    taskResponse: "Task Response",
    coherenceCriterion: "Coherence & Cohesion",
    lexicalCriterion: "Lexical Resource",
    grammarCriterion: "Grammatical Range & Accuracy",
    overallAssessment: "Overall assessment",
    overview: "Overview",
    sentences: "Feedback",
    improve: "Improve",
    model: "Model answer",
    whatYouDidWell: "What you did well",
    areasToImprove: "Areas to improve",
    detailedFeedback: "Sentence-by-sentence feedback",
    meaningfulExamples: "Only meaningful phrases are marked — the rest of your sentence stays untouched.",
    all: "All",
    good: "Good",
    improveStatus: "Improve",
    errors: "Errors",
    explanation: "Explanation",
    useInstead: "Use instead",
    why: "Why",
    copy: "Copy suggestion",
    copied: "Copied",
    corrections: "Errors & corrections",
    upgradeLanguage: "Upgrade your language",
    userUsed: "You used",
    repetition: "Repetition analysis",
    times: "times",
    alternatives: "Natural alternatives",
    cohesion: "Cohesion analysis",
    grammarProfile: "Grammar profile",
    strongGrammar: "Strong grammar",
    needsAttention: "Needs attention",
    opportunities: "Smoother links to try",
    bandPlan: "How to improve your band",
    current: "Current estimate",
    target: "Next target",
    nextStep: "Your next step",
    emptyFeedback: "No examples match this filter.",
    noRepetition: "No excessive repetition was identified in this response.",
    noErrors: "No significant errors were identified in the selected examples.",
    reward: "practice XP earned",
  },
  uz: {
    title: "IELTS Writing tahlili",
    estimatedBand: "AI taxminiy band",
    disclaimer: "Bu mashq uchun AI taxmini — rasmiy IELTS natijasi emas.",
    academicTask1: "Academic Writing Task 1",
    academicTask2: "Academic Writing Task 2",
    taskAchievement: "Vazifani bajarish",
    taskResponse: "Vazifaga javob",
    coherenceCriterion: "Bog‘liqlik va yaxlitlik",
    lexicalCriterion: "Leksik resurs",
    grammarCriterion: "Grammatik diapazon va aniqlik",
    overallAssessment: "Umumiy baho",
    overview: "Umumiy",
    sentences: "Tahlil",
    improve: "Yaxshilash",
    model: "Namuna",
    whatYouDidWell: "Yaxshi bajargan jihatlaringiz",
    areasToImprove: "Yaxshilash kerak bo‘lgan jihatlar",
    detailedFeedback: "Gapma-gap tahlil",
    meaningfulExamples: "Faqat muhim iboralar belgilandi — gapning qolgan qismi o‘zgartirilmaydi.",
    all: "Barchasi",
    good: "Yaxshi",
    improveStatus: "Yaxshilang",
    errors: "Xatolar",
    explanation: "Izoh",
    useInstead: "Buning o‘rniga",
    why: "Nega",
    copy: "Taklifni nusxalash",
    copied: "Nusxalandi",
    corrections: "Xatolar va tuzatishlar",
    upgradeLanguage: "Tilni kuchaytiring",
    userUsed: "Siz ishlatdingiz",
    repetition: "Takrorlar tahlili",
    times: "marta",
    alternatives: "Tabiiy muqobillar",
    cohesion: "Bog‘liqlik tahlili",
    grammarProfile: "Grammatika profili",
    strongGrammar: "Kuchli grammatika",
    needsAttention: "E’tibor kerak",
    opportunities: "Ravonroq bog‘lash usullari",
    bandPlan: "Bandni qanday oshirish mumkin",
    current: "Hozirgi taxmin",
    target: "Keyingi maqsad",
    nextStep: "Keyingi qadamingiz",
    emptyFeedback: "Bu filtrga mos misol yo‘q.",
    noRepetition: "Bu javobda ortiqcha takror aniqlanmadi.",
    noErrors: "Tanlangan misollarda muhim xato aniqlanmadi.",
    reward: "mashq XP olindi",
  },
  ru: {
    title: "Разбор IELTS Writing",
    estimatedBand: "Оценочный band от ИИ",
    disclaimer: "Оценка ИИ для практики — не официальный результат IELTS.",
    academicTask1: "Academic Writing Task 1",
    academicTask2: "Academic Writing Task 2",
    taskAchievement: "Выполнение задания",
    taskResponse: "Ответ на задание",
    coherenceCriterion: "Связность и цельность",
    lexicalCriterion: "Лексический ресурс",
    grammarCriterion: "Диапазон и точность грамматики",
    overallAssessment: "Общая оценка",
    overview: "Обзор",
    sentences: "Разбор",
    improve: "Улучшить",
    model: "Образец",
    whatYouDidWell: "Что получилось хорошо",
    areasToImprove: "Что стоит улучшить",
    detailedFeedback: "Разбор по предложениям",
    meaningfulExamples: "Отмечены только значимые фразы — остальная часть предложения не окрашивается.",
    all: "Все",
    good: "Хорошо",
    improveStatus: "Улучшить",
    errors: "Ошибки",
    explanation: "Объяснение",
    useInstead: "Лучше написать",
    why: "Почему",
    copy: "Скопировать вариант",
    copied: "Скопировано",
    corrections: "Ошибки и исправления",
    upgradeLanguage: "Улучшите язык",
    userUsed: "Вы написали",
    repetition: "Анализ повторов",
    times: "раз",
    alternatives: "Естественные варианты",
    cohesion: "Анализ связности",
    grammarProfile: "Грамматический профиль",
    strongGrammar: "Сильные стороны",
    needsAttention: "Требует внимания",
    opportunities: "Более плавные связки",
    bandPlan: "Как повысить band",
    current: "Текущая оценка",
    target: "Следующая цель",
    nextStep: "Ваш следующий шаг",
    emptyFeedback: "Для этого фильтра примеров нет.",
    noRepetition: "В этом ответе не найдено чрезмерных повторов.",
    noErrors: "В выбранных примерах не найдено значимых ошибок.",
    reward: "XP за практику",
  },
} as const;

const CATEGORY_LABELS: Record<"en" | "uz" | "ru", Record<WritingFeedbackCategory, string>> = {
  en: {
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    collocation: "Collocation",
    articles: "Articles",
    prepositions: "Prepositions",
    word_form: "Word form",
    tense: "Tense",
    subject_verb_agreement: "Subject–verb agreement",
    sentence_structure: "Sentence structure",
    punctuation: "Punctuation",
    cohesion: "Cohesion",
    logic: "Logic",
    style: "Style",
    spelling: "Spelling",
  },
  uz: {
    grammar: "Grammatika",
    vocabulary: "Lug‘at",
    collocation: "So‘z birikmasi",
    articles: "Artikllar",
    prepositions: "Predloglar",
    word_form: "So‘z shakli",
    tense: "Zamon",
    subject_verb_agreement: "Ega-kesim mosligi",
    sentence_structure: "Gap tuzilishi",
    punctuation: "Tinish belgilari",
    cohesion: "Bog‘liqlik",
    logic: "Mantiq",
    style: "Uslub",
    spelling: "Imlo",
  },
  ru: {
    grammar: "Грамматика",
    vocabulary: "Лексика",
    collocation: "Сочетаемость",
    articles: "Артикли",
    prepositions: "Предлоги",
    word_form: "Форма слова",
    tense: "Время",
    subject_verb_agreement: "Согласование",
    sentence_structure: "Структура предложения",
    punctuation: "Пунктуация",
    cohesion: "Связность",
    logic: "Логика",
    style: "Стиль",
    spelling: "Орфография",
  },
};

const STATUS_STYLE: Record<
  WritingFeedbackStatus,
  {
    icon: LucideIcon;
    labelKey: "good" | "improveStatus" | "errors";
    card: string;
    badge: string;
    mark: string;
    replacement: string;
  }
> = {
  good: {
    icon: CheckCircle2,
    labelKey: "good",
    card: "border-emerald-700/25 bg-emerald-500/[0.04] dark:border-emerald-300/20",
    badge: "text-emerald-800 dark:text-emerald-200",
    mark: "bg-emerald-200/85 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100",
    replacement: "bg-emerald-500/10",
  },
  improve: {
    icon: TriangleAlert,
    labelKey: "improveStatus",
    card: "border-amber-700/25 bg-amber-500/[0.05] dark:border-amber-300/20",
    badge: "text-amber-900 dark:text-amber-200",
    mark: "bg-amber-200/90 text-amber-950 dark:bg-amber-900 dark:text-amber-100",
    replacement: "bg-amber-500/10",
  },
  error: {
    icon: XCircle,
    labelKey: "errors",
    card: "border-red-700/25 bg-red-500/[0.04] dark:border-red-300/20",
    badge: "text-red-800 dark:text-red-200",
    mark: "bg-red-200/90 text-red-950 dark:bg-red-950 dark:text-red-100",
    replacement: "bg-red-500/10",
  },
};

export function WritingFeedbackReport({
  lang,
  taskType,
  score,
  t,
  onRetry,
}: {
  lang: string;
  taskType: "task1" | "task2";
  score: WritingScore;
  t: Ielts;
  onRetry: () => void;
}) {
  const locale = lang === "uz" || lang === "ru" ? lang : "en";
  const copy = REPORT_COPY[locale];
  const categoryLabels = CATEGORY_LABELS[locale];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [filter, setFilter] = useState<FeedbackFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const feedback = score.analysis.sentence_feedback;
  const visibleFeedback = useMemo(
    () => (filter === "all" ? feedback : feedback.filter((item) => item.status === filter)),
    [feedback, filter]
  );

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const criteria = [
    {
      label: taskType === "task1" ? copy.taskAchievement : copy.taskResponse,
      band: score.task.band,
      comment: score.task.comment,
      icon: ClipboardCheck,
    },
    {
      label: copy.coherenceCriterion,
      band: score.coherence.band,
      comment: score.coherence.comment,
      icon: Link2,
    },
    { label: copy.lexicalCriterion, band: score.lexical.band, comment: score.lexical.comment, icon: BookOpenCheck },
    {
      label: copy.grammarCriterion,
      band: score.grammar.band,
      comment: score.grammar.comment,
      icon: PenLine,
    },
  ];

  const filters: { key: FeedbackFilter; label: string; count: number }[] = [
    { key: "all", label: copy.all, count: feedback.length },
    { key: "good", label: copy.good, count: feedback.filter((item) => item.status === "good").length },
    {
      key: "improve",
      label: copy.improveStatus,
      count: feedback.filter((item) => item.status === "improve").length,
    },
    { key: "error", label: copy.errors, count: feedback.filter((item) => item.status === "error").length },
  ];

  function jumpTo(id: string) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  async function copySuggestion(value: string, id: string) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="writing-feedback-title"
      className="mt-4 space-y-5"
    >
      <section id="feedback-overview" className="surface-panel scroll-mt-28 overflow-hidden rounded-xl">
        <header className="border-b border-line px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                ref={titleRef}
                id="writing-feedback-title"
                tabIndex={-1}
                className="font-display text-4xl tracking-wide text-ink outline-none sm:text-5xl"
              >
                {copy.title}
              </h2>
              <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-300">
                {taskType === "task1" ? copy.academicTask1 : copy.academicTask2}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-ink-soft">
              <FileCheck2 className="size-4 text-accent-text" aria-hidden />
              +{score.reward.xp_gained} {copy.reward}
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-brand-950 p-6 text-brand-50 sm:p-8">
            <span aria-hidden className="absolute -right-3 -top-8 font-display text-[10rem] leading-none tracking-wide text-brand-50/[0.05]">
              BAND
            </span>
            <div className="relative">
              <p className="max-w-32 text-xs font-extrabold uppercase tracking-[0.16em] text-sand-200">
                {copy.estimatedBand}
              </p>
              <p className="mt-4 font-display text-[6rem] leading-[0.78] tracking-wide tabular-nums text-brand-50 sm:text-[7.5rem]">
                {score.band_overall.toFixed(1)}
              </p>
            </div>
            <p className="relative mt-8 max-w-xs text-xs leading-5 text-sand-200">{copy.disclaimer}</p>
          </div>

          <div className="divide-y divide-line bg-card/60">
            {criteria.map((criterion) => {
              const Icon = criterion.icon;
              return (
                <div key={criterion.label} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto] sm:px-6">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-300">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-ink">{criterion.label}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">{criterion.comment}</p>
                    </div>
                  </div>
                  <p className="pl-12 font-display text-3xl tracking-wide tabular-nums text-brand-600 dark:text-brand-300 sm:pl-4">
                    {criterion.band.toFixed(1)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line bg-raised/55 px-4 py-5 sm:px-6">
          <h3 className="flex items-center gap-2 text-sm font-black text-ink">
            <Gauge className="size-4 text-brand-500" aria-hidden />
            {copy.overallAssessment}
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-ink">{score.feedback}</p>
        </div>
      </section>

      <nav
        aria-label="Writing feedback sections"
        className="sticky top-[5.75rem] z-20 -mx-1 border-y border-line bg-page/95 px-1 py-2 backdrop-blur-sm"
      >
        <div className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-0.5 sm:gap-1">
          {[
            ["feedback-overview", copy.overview, Gauge],
            ["sentence-feedback", copy.sentences, ListChecks],
            ["improvement-workbench", copy.improve, Target],
            ["model-answer", copy.model, Sparkles],
          ].map(([id, label, Icon]) => {
            const NavIcon = Icon as LucideIcon;
            return (
              <button
                key={id as string}
                type="button"
                onClick={() => jumpTo(id as string)}
                className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-extrabold leading-tight text-ink-soft transition-colors hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-xs"
              >
                <NavIcon className="size-4" aria-hidden />
                {label as string}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-emerald-700/25 bg-emerald-500/[0.04] p-5 dark:border-emerald-300/20 sm:p-6">
          <SectionTitle icon={CheckCircle2} title={copy.whatYouDidWell} tone="good" />
          <div className="mt-4 divide-y divide-emerald-800/15 dark:divide-emerald-200/15">
            {score.analysis.good_points.map((point, index) => (
              <div key={`${point.title}-${index}`} className="py-3 first:pt-0 last:pb-0">
                <h4 className="flex gap-2 text-sm font-black text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
                  {point.title}
                </h4>
                {point.evidence && <blockquote className="mt-1 pl-6 text-sm font-semibold text-ink">“{point.evidence}”</blockquote>}
                <p className="mt-1 pl-6 text-sm leading-6 text-ink-soft">{point.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-amber-700/25 bg-amber-500/[0.04] p-5 dark:border-amber-300/20 sm:p-6">
          <SectionTitle icon={Target} title={copy.areasToImprove} tone="improve" />
          <div className="mt-4 divide-y divide-amber-900/15 dark:divide-amber-200/15">
            {score.analysis.areas_to_improve.map((area, index) => (
              <div key={`${area.title}-${index}`} className="py-3 first:pt-0 last:pb-0">
                <h4 className="flex gap-2 text-sm font-black text-ink">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-amber-800 dark:text-amber-300" aria-hidden />
                  {area.title}
                </h4>
                {area.evidence && <blockquote className="mt-1 pl-6 text-sm font-semibold text-ink">“{area.evidence}”</blockquote>}
                <p className="mt-1 pl-6 text-sm leading-6 text-ink-soft">{area.action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section id="sentence-feedback" className="scroll-mt-28 rounded-xl border border-line bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">{copy.detailedFeedback}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">{copy.meaningfulExamples}</p>
          </div>
          <div className="grid grid-cols-4 gap-1" aria-label="Feedback filters">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "min-h-11 rounded-lg border px-2 text-xs font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  filter === item.key
                    ? "border-brand-700 bg-brand-700 text-white dark:border-brand-300 dark:bg-brand-200 dark:text-brand-950"
                    : "border-line bg-raised/60 text-ink-soft hover:bg-hover hover:text-ink"
                )}
              >
                <span className="block">{item.label}</span>
                <span className="mt-0.5 block text-[10px] tabular-nums opacity-75">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3" aria-live="polite">
          {visibleFeedback.length > 0 ? (
            visibleFeedback.map((item, index) => (
              <SentenceFeedbackCard
                key={`${item.sentence_number}-${item.highlight}-${index}`}
                item={item}
                categoryLabel={categoryLabels[item.category]}
                copy={copy}
                copied={copiedId === `sentence-${index}`}
                onCopy={() => copySuggestion(item.use_instead, `sentence-${index}`)}
              />
            ))
          ) : (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-line bg-raised/40 px-4 text-center text-sm text-ink-soft">
              {copy.emptyFeedback}
            </div>
          )}
        </div>
      </section>

      <section id="improvement-workbench" className="scroll-mt-28 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-red-700/25 bg-red-500/[0.04] p-5 dark:border-red-300/20 sm:p-6">
            <SectionTitle icon={AlertCircle} title={copy.corrections} tone="error" />
            <div className="mt-4 space-y-3">
              {score.analysis.sentence_feedback.filter((item) => item.status === "error").length > 0 ? (
                score.analysis.sentence_feedback
                  .filter((item) => item.status === "error")
                  .map((item, index) => (
                    <CorrectionRow
                      key={`${item.highlight}-${index}`}
                      item={item}
                      categoryLabel={categoryLabels[item.category]}
                      useInsteadLabel={copy.useInstead}
                      whyLabel={copy.why}
                      copyLabel={copy.copy}
                      copiedLabel={copy.copied}
                      copied={copiedId === `error-${index}`}
                      onCopy={() => copySuggestion(item.use_instead, `error-${index}`)}
                    />
                  ))
              ) : (
                <p className="text-sm leading-6 text-ink-soft">{copy.noErrors}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <SectionTitle icon={WandSparkles} title={copy.upgradeLanguage} />
            <div className="mt-4 divide-y divide-line">
              {score.analysis.language_upgrades.map((upgrade, index) => (
                <div key={`${upgrade.used}-${index}`} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{copy.userUsed}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <p className="rounded-lg bg-line/45 px-3 py-2 text-sm text-ink">{upgrade.used}</p>
                    <ArrowRight className="hidden size-4 text-brand-500 sm:block" aria-hidden />
                    <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-brand-500/10 px-3 py-2">
                      <p className="min-w-0 text-sm font-bold text-brand-800 dark:text-brand-200">{upgrade.use_instead}</p>
                      <CopyButton
                        label={copy.copy}
                        copiedLabel={copy.copied}
                        copied={copiedId === `upgrade-${index}`}
                        onClick={() => copySuggestion(upgrade.use_instead, `upgrade-${index}`)}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{upgrade.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <SectionTitle icon={RefreshCw} title={copy.repetition} />
            <div className="mt-4 space-y-3">
              {score.analysis.repetitions.length > 0 ? (
                score.analysis.repetitions.map((item) => (
                  <div key={item.word} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-lg font-black text-ink">“{item.word}”</p>
                      <p className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-300">
                        {item.frequency} {copy.times}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">{item.problem}</p>
                    {item.alternatives.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{copy.alternatives}</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-ink">{item.alternatives.join(" · ")}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-ink-soft">{copy.noRepetition}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AnalysisPanel
              icon={Link2}
              title={copy.cohesion}
              positiveTitle={copy.whatYouDidWell}
              negativeTitle={copy.needsAttention}
              positives={score.analysis.cohesion.strengths}
              negatives={score.analysis.cohesion.issues}
              opportunityTitle={copy.opportunities}
              opportunities={score.analysis.cohesion.opportunities}
            />
            <AnalysisPanel
              icon={PenLine}
              title={copy.grammarProfile}
              positiveTitle={copy.strongGrammar}
              negativeTitle={copy.needsAttention}
              positives={score.analysis.grammar_profile.strengths}
              negatives={score.analysis.grammar_profile.weaknesses}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-xl border border-line bg-brand-950 text-brand-50">
            <div className="grid sm:grid-cols-[0.72fr_1.28fr]">
              <div className="border-b border-brand-50/15 p-5 sm:border-b-0 sm:border-r sm:p-6">
                <Target className="size-6 text-sand-200" aria-hidden />
                <h3 className="mt-4 font-display text-3xl tracking-wide">{copy.bandPlan}</h3>
                <div className="mt-5 flex items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sand-200">{copy.current}</p>
                    <p className="mt-1 font-display text-4xl tabular-nums">{score.analysis.band_plan.current_band.toFixed(1)}</p>
                  </div>
                  <ArrowRight className="size-5 text-brand-300" aria-hidden />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sand-200">{copy.target}</p>
                    <p className="mt-1 font-display text-4xl tabular-nums text-brand-200">
                      {score.analysis.band_plan.target_band.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              <ol className="divide-y divide-brand-50/12 p-5 sm:p-6">
                {score.analysis.band_plan.actions.map((action, index) => (
                  <li key={`${action}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="font-display text-2xl leading-none tabular-nums text-brand-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-6 text-sand-50">{action}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="rounded-xl border border-accent-600/25 bg-accent-500/[0.06] p-5 dark:border-accent-300/20 sm:p-6">
            <SectionTitle icon={Lightbulb} title={copy.nextStep} />
            <ol className="mt-4 space-y-3">
              {score.analysis.next_steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-ink">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-600 text-xs font-black tabular-nums text-white dark:bg-accent-300 dark:text-brand-950">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      <section id="model-answer" className="scroll-mt-28 rounded-xl border border-line bg-card p-5 sm:p-6">
        <details>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-display text-3xl tracking-wide text-ink marker:hidden">
            <span className="flex items-center gap-3">
              <Sparkles className="size-5 text-brand-500" aria-hidden />
              {t.improved}
            </span>
            <span className="text-sm font-sans font-bold text-ink-soft">+</span>
          </summary>
          <div className="mt-4 border-t border-line pt-4">
            <p className="max-w-[75ch] whitespace-pre-line text-sm leading-7 text-ink">{score.improved}</p>
          </div>
        </details>
      </section>

      <Button fullWidth onClick={onRetry} className="min-h-12">
        <RefreshCw className="size-4" aria-hidden />
        {t.tryAgain}
      </Button>
    </motion.article>
  );
}

function SentenceFeedbackCard({
  item,
  categoryLabel,
  copy,
  copied,
  onCopy,
}: {
  item: WritingSentenceFeedback;
  categoryLabel: string;
  copy: (typeof REPORT_COPY)[keyof typeof REPORT_COPY];
  copied: boolean;
  onCopy: () => void;
}) {
  const style = STATUS_STYLE[item.status];
  const Icon = style.icon;

  return (
    <article className={cn("rounded-xl border p-4 sm:p-5", style.card)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black tabular-nums", style.replacement, style.badge)}>
          {String(item.sentence_number).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-7 text-ink">
            <HighlightedSentence item={item} />
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-black", style.badge)}>
              <Icon className="size-4" aria-hidden />
              {copy[style.labelKey]}
            </span>
            <span className="text-xs font-bold text-ink-soft">{categoryLabel}</span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{copy.explanation}</p>
            <p className="mt-1 text-sm leading-6 text-ink">{item.explanation}</p>
          </div>
          {item.status !== "good" && item.use_instead && (
            <div className={cn("mt-4 rounded-lg p-3", style.replacement)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{copy.useInstead}</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-ink">{item.use_instead}</p>
                </div>
                <CopyButton label={copy.copy} copiedLabel={copy.copied} copied={copied} onClick={onCopy} />
              </div>
              {item.why && (
                <div className="mt-3 border-t border-current/10 pt-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{copy.why}</p>
                  <p className="mt-1 text-sm leading-6 text-ink">{item.why}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function HighlightedSentence({ item }: { item: WritingSentenceFeedback }) {
  const index = item.sentence.indexOf(item.highlight);
  if (index < 0 || !item.highlight) return item.sentence;
  const style = STATUS_STYLE[item.status];

  return (
    <>
      {item.sentence.slice(0, index)}
      <mark className={cn("rounded-sm px-0.5 py-0.5", style.mark)}>{item.highlight}</mark>
      {item.sentence.slice(index + item.highlight.length)}
    </>
  );
}

function CorrectionRow({
  item,
  categoryLabel,
  useInsteadLabel,
  whyLabel,
  copyLabel,
  copiedLabel,
  copied,
  onCopy,
}: {
  item: WritingSentenceFeedback;
  categoryLabel: string;
  useInsteadLabel: string;
  whyLabel: string;
  copyLabel: string;
  copiedLabel: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="border-b border-red-900/15 pb-4 last:border-0 last:pb-0 dark:border-red-100/15">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-red-800 dark:text-red-200">“{item.highlight}”</p>
        <span className="text-xs font-bold text-ink-soft">{categoryLabel}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{item.explanation}</p>
      <div className="mt-3 rounded-lg bg-red-500/10 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{useInsteadLabel}</p>
            <p className="mt-1 text-sm font-bold leading-6 text-ink">{item.use_instead}</p>
          </div>
          <CopyButton label={copyLabel} copiedLabel={copiedLabel} copied={copied} onClick={onCopy} />
        </div>
        {item.why && (
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            <strong className="font-black text-ink">{whyLabel}:</strong> {item.why}
          </p>
        )}
      </div>
    </article>
  );
}

function AnalysisPanel({
  icon: Icon,
  title,
  positiveTitle,
  negativeTitle,
  positives,
  negatives,
  opportunityTitle,
  opportunities = [],
}: {
  icon: LucideIcon;
  title: string;
  positiveTitle: string;
  negativeTitle: string;
  positives: WritingObservation[];
  negatives: WritingObservation[];
  opportunityTitle?: string;
  opportunities?: string[];
}) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <SectionTitle icon={Icon} title={title} />
      <ObservationList title={positiveTitle} items={positives} tone="good" />
      <ObservationList title={negativeTitle} items={negatives} tone="error" />
      {opportunities.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{opportunityTitle}</p>
          <ul className="mt-2 space-y-2">
            {opportunities.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-ink">
                <ArrowRight className="mt-1 size-3.5 shrink-0 text-brand-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ObservationList({ title, items, tone }: { title: string; items: WritingObservation[]; tone: "good" | "error" }) {
  if (items.length === 0) return null;
  const Icon = tone === "good" ? CheckCircle2 : AlertCircle;
  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{title}</p>
      <div className="mt-2 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.quote}-${index}`} className="flex gap-2">
            <Icon
              className={cn(
                "mt-1 size-3.5 shrink-0",
                tone === "good" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
              )}
              aria-hidden
            />
            <p className="text-sm leading-6 text-ink">
              {item.quote && <strong className="font-black">“{item.quote}” — </strong>}
              {item.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, tone }: { icon: LucideIcon; title: string; tone?: WritingFeedbackStatus }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-2xl tracking-wide text-ink sm:text-3xl">
      <Icon
        className={cn(
          "size-5",
          tone === "good" && "text-emerald-700 dark:text-emerald-300",
          tone === "improve" && "text-amber-800 dark:text-amber-300",
          tone === "error" && "text-red-700 dark:text-red-300",
          !tone && "text-brand-500"
        )}
        aria-hidden
      />
      {title}
    </h3>
  );
}

function CopyButton({
  label,
  copiedLabel,
  copied,
  onClick,
}: {
  label: string;
  copiedLabel: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className="flex size-11 shrink-0 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-500/10 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-brand-200 dark:hover:text-brand-50"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  );
}
