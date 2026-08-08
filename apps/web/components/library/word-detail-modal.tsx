"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Lightbulb,
  Plus,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Skeleton } from "@/components/ui/skeleton";
import { speak } from "@/lib/games";
import type { Sense, Word, WordListItem } from "@/lib/vocab";
import { cn } from "@/lib/utils";

type VocabLabels = Dictionary["vocab"];

export function WordDetailModal({
  summary,
  detail,
  loading,
  lang,
  labels,
  added,
  onAdd,
  onClose,
}: {
  summary: WordListItem;
  detail: Word | null;
  loading: boolean;
  lang: string;
  labels: VocabLabels;
  added: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copy = modalCopy[lang as keyof typeof modalCopy] ?? modalCopy.en;
  const firstSense = detail?.senses[0];
  const translation =
    localizedTranslation(firstSense, lang) ??
    (lang === "ru" ? summary.primary_translation_ru : summary.primary_translation_uz);
  const category = detail?.category ?? summary.category;
  const categoryName = category
    ? lang === "uz"
      ? category.name_uz
      : lang === "ru"
        ? category.name_ru
        : category.name_en
    : null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-brand-950/60 p-3 backdrop-blur-xl dark:bg-black/72 sm:p-6"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={summary.headword}
        initial={{ y: 22, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 22, opacity: 0, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        className="surface-panel flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg p-0 shadow-2xl sm:max-h-[calc(100dvh-48px)]"
      >
        <div className="shrink-0 border-b border-line/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                  {summary.headword}
                </h2>
                <button
                  type="button"
                  onClick={() => speak(summary.headword)}
                  title={copy.listen}
                  className="icon-tile flex size-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  <Volume2 className="size-4" aria-hidden />
                </button>
              </div>
              {translation && (
                <p className="mt-1 text-base font-bold text-brand-600 dark:text-brand-200">
                  {translation}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <Tag>{summary.cefr_level}</Tag>
                <Tag>{summary.pos}</Tag>
                {summary.ipa && <Tag>/{summary.ipa}/</Tag>}
                {categoryName && <Tag>{categoryName}</Tag>}
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={copy.close}
              onClick={onClose}
              className="icon-tile flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            disabled={added}
            onClick={onAdd}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-black transition-all",
              added
                ? "bg-success/10 text-success"
                : "bg-brand-600 text-white shadow-[0_18px_50px_rgba(40,135,115,0.24)] hover:-translate-y-0.5 hover:bg-brand-700"
            )}
          >
            {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            {added ? copy.added : copy.add}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pr-4 [overscroll-behavior:contain] sm:px-6 sm:py-6 sm:pr-5">
          {loading ? (
            <div className="space-y-5">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {detail.senses.map((sense, index) => (
                <section key={sense.id ?? index} className="border-b border-line/70 pb-6 last:border-0 last:pb-0">
                  {detail.senses.length > 1 && (
                    <p className="text-xs font-black uppercase text-brand-600 dark:text-brand-200">
                      {copy.meaning} {index + 1}
                    </p>
                  )}
                  <p className="mt-1 text-base font-bold text-ink">
                    {localizedTranslation(sense, lang)}
                  </p>
                  <Section title={labels.definition}>
                    <p>{sense.definition_en}</p>
                    {sense.usage_note && (
                      <p className="mt-2 flex gap-2 rounded-lg bg-amber-400/8 p-3 text-ink-soft">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
                        {sense.usage_note}
                      </p>
                    )}
                  </Section>

                  {sense.examples.length > 0 && (
                    <Section title={labels.examples}>
                      <ul className="space-y-2">
                        {sense.examples.slice(0, 3).map((example, exampleIndex) => {
                          const exampleTranslation =
                            lang === "uz"
                              ? example.text_uz
                              : lang === "ru"
                                ? example.text_ru
                                : null;
                          return (
                            <li
                              key={example.id ?? exampleIndex}
                              className="rounded-lg border border-line/70 bg-page/64 p-3"
                            >
                              <p className="font-semibold text-ink">{example.text_en}</p>
                              {exampleTranslation && (
                                <p className="mt-1 text-sm text-ink-soft">{exampleTranslation}</p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </Section>
                  )}
                </section>
              ))}

              <RelatedWords detail={detail} labels={labels} />

              {detail.word_family && (
                <Section title={labels.wordFamily}>
                  <p>{detail.word_family}</p>
                </Section>
              )}

              {detail.common_mistake && (
                <div className="rounded-lg border border-danger/25 bg-danger/6 p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase text-danger">
                    <AlertTriangle className="size-4" aria-hidden />
                    {labels.commonMistake}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink">{detail.common_mistake}</p>
                </div>
              )}

              <div className="rounded-lg border border-accent-500/25 bg-accent-500/8 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase text-accent-600 dark:text-accent-300">
                  <Sparkles className="size-4" aria-hidden />
                  {copy.promptTitle}
                </p>
                <p className="mt-2 text-sm leading-7 text-ink">
                  {copy.prompt(summary.headword, categoryName)}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-ink-soft">{copy.error}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function localizedTranslation(sense: Sense | undefined, lang: string): string | null {
  if (!sense) return null;
  if (lang === "ru") return sense.translation_ru;
  if (lang === "en") return sense.definition_en;
  return sense.translation_uz;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-ink/5 px-2 py-1 font-black text-ink-soft dark:bg-white/10">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-black uppercase text-ink-soft">{title}</p>
      <div className="mt-1 text-sm leading-7 text-ink">{children}</div>
    </div>
  );
}

function RelatedWords({ detail, labels }: { detail: Word; labels: VocabLabels }) {
  const synonyms = detail.relations
    .filter((relation) => relation.relation_type === "synonym")
    .map((relation) => relation.related_text);
  const antonyms = detail.relations
    .filter((relation) => relation.relation_type === "antonym")
    .map((relation) => relation.related_text);

  if (synonyms.length === 0 && antonyms.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {synonyms.length > 0 && (
        <Section title={labels.synonyms}>
          <p>{synonyms.join(", ")}</p>
        </Section>
      )}
      {antonyms.length > 0 && (
        <Section title={labels.antonyms}>
          <p>{antonyms.join(", ")}</p>
        </Section>
      )}
    </div>
  );
}

const modalCopy = {
  uz: {
    listen: "Tinglash",
    close: "Yopish",
    add: "Kartalarimga qo'shish",
    added: "Qo'shildi",
    meaning: "Ma'no",
    promptTitle: "Mashq prompti",
    error: "So'z tafsilotlarini yuklab bo'lmadi.",
    prompt: (word: string, category: string | null) =>
      `"${word}" so'zini ishlatib, ${category ? `${category.toLowerCase()} mavzusida ` : ""}ingliz tilida ikkita gap yozing. Birinchi gapda kundalik hayotingizdan, ikkinchisida esa kelajak rejangizdan misol keltiring.`,
  },
  ru: {
    listen: "Слушать",
    close: "Закрыть",
    add: "Добавить в мои карточки",
    added: "Добавлено",
    meaning: "Значение",
    promptTitle: "Задание",
    error: "Не удалось загрузить подробности слова.",
    prompt: (word: string, category: string | null) =>
      `Напишите два предложения на английском со словом "${word}"${category ? ` на тему «${category}»` : ""}. В первом приведите пример из повседневной жизни, во втором — из ваших планов на будущее.`,
  },
  en: {
    listen: "Listen",
    close: "Close",
    add: "Add to my cards",
    added: "Added",
    meaning: "Meaning",
    promptTitle: "Practice prompt",
    error: "Could not load the word details.",
    prompt: (word: string, category: string | null) =>
      `Write two English sentences using "${word}"${category ? ` in the context of ${category.toLowerCase()}` : ""}. Use one example from your daily life and one from your future plans.`,
  },
};
