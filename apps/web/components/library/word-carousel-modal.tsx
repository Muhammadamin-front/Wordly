"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  localizedTranslation,
  WordDetailContent,
} from "@/components/library/word-detail-modal";
import { speak } from "@/lib/games";
import type { Word, WordListItem } from "@/lib/vocab";
import { cn } from "@/lib/utils";

type VocabLabels = Dictionary["vocab"];

export function WordCarouselModal({
  words,
  activeWord,
  detail,
  loading,
  lang,
  labels,
  addedIds,
  onAdd,
  onSelect,
  onClose,
}: {
  words: readonly WordListItem[];
  activeWord: WordListItem;
  detail: Word | null;
  loading: boolean;
  lang: string;
  labels: VocabLabels;
  addedIds: ReadonlySet<string>;
  onAdd: (word: WordListItem) => void;
  onSelect: (word: WordListItem) => void;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const initialIndexRef = useRef(Math.max(0, words.findIndex((word) => word.id === activeWord.id)));
  const settleTimerRef = useRef<number | null>(null);
  const copy = carouselCopy[lang as keyof typeof carouselCopy] ?? carouselCopy.en;
  const activeIndex = Math.max(0, words.findIndex((word) => word.id === activeWord.id));
  const added = addedIds.has(activeWord.id);
  const categoryName = getCategoryName(activeWord, lang);
  const translation =
    localizedTranslation(detail?.senses[0], lang) ?? getSummaryTranslation(activeWord, lang);

  const scrollToIndex = useCallback(
    (index: number, immediate = false) => {
      const track = trackRef.current;
      const item = track?.children.item(index) as HTMLElement | null;
      if (!track || !item) return;
      const left = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
      track.scrollTo({
        left,
        behavior: immediate || reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion]
  );

  const selectIndex = useCallback(
    (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), words.length - 1);
      const nextWord = words[nextIndex];
      if (!nextWord) return;
      if (nextWord.id !== activeWord.id) onSelect(nextWord);
      scrollToIndex(nextIndex);
    },
    [activeWord.id, onSelect, scrollToIndex, words]
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      const item = track?.children.item(initialIndexRef.current) as HTMLElement | null;
      if (!track || !item) return;
      const left = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left, behavior: "auto" });
      } else {
        // JSDOM and a few embedded browsers do not implement Element.scrollTo.
        track.scrollLeft = left;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = document.documentElement.clientWidth > 0
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    dialogRef.current?.focus();

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
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus();
    };
  }, [onClose]);

  const settleSelection = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((child, index) => {
      const item = child as HTMLElement;
      const distance = Math.abs(item.offsetLeft + item.clientWidth / 2 - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const closestWord = words[closestIndex];
    if (closestWord && closestWord.id !== activeWord.id) onSelect(closestWord);
  }, [activeIndex, activeWord.id, onSelect, words]);

  const onTrackScroll = () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(settleSelection, 90);
  };

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectIndex(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(activeIndex + 1);
    }
  };

  const detailKey = `${activeWord.id}-${loading ? "loading" : detail?.id ?? "error"}`;
  const statusText = copy.position(activeIndex + 1, words.length, activeWord.headword);
  const activeTags = useMemo(
    () => [activeWord.cefr_level, activeWord.pos, activeWord.ipa ? `/${activeWord.ipa}/` : null].filter(Boolean),
    [activeWord.cefr_level, activeWord.ipa, activeWord.pos]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/66 px-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-md dark:bg-black/78 sm:px-5 sm:py-5"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-carousel-title"
        tabIndex={-1}
        initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onDialogKeyDown}
        className="surface-panel min-h-svh w-full overflow-hidden rounded-none p-0 outline-none sm:my-auto sm:min-h-0 sm:max-w-5xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-line/70 bg-raised/96 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <h2 id="word-carousel-title" className="font-display text-xl tracking-wide text-ink sm:text-2xl">
              {copy.title}
            </h2>
            <p className="truncate text-xs font-bold text-ink-soft" aria-live="polite">
              {statusText}
            </p>
          </div>
          <button
            type="button"
            aria-label={copy.close}
            title={copy.close}
            onClick={onClose}
            className="icon-tile flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain pb-8 sm:max-h-[calc(100svh-7.5rem)]">
          <section aria-label={copy.title} aria-roledescription="carousel" className="border-b border-line/70 bg-page/54 py-5 sm:py-7">
            <div className="word-carousel-viewport">
              <ul
                ref={trackRef}
                onScroll={onTrackScroll}
                className="word-carousel-track"
                aria-label={copy.hint}
              >
                {words.map((word, index) => (
                  <WordCarouselSlide
                    key={word.id}
                    word={word}
                    lang={lang}
                    active={word.id === activeWord.id}
                    index={index}
                    total={words.length}
                    selectLabel={copy.select(word.headword)}
                    onSelect={() => selectIndex(index)}
                  />
                ))}
              </ul>
            </div>

            <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 px-4">
              <button
                type="button"
                aria-label={copy.previous}
                title={copy.previous}
                disabled={activeIndex <= 0}
                onClick={() => selectIndex(activeIndex - 1)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-card px-0 text-sm font-black text-ink transition-colors hover:border-brand-400/60 disabled:cursor-not-allowed disabled:opacity-35 sm:px-3"
              >
                <ArrowLeft className="size-4" aria-hidden />
                <span className="hidden sm:inline">{copy.previous}</span>
              </button>
              <span className="min-w-16 text-center text-sm font-black tabular-nums text-ink-soft">
                {activeIndex + 1} / {words.length}
              </span>
              <button
                type="button"
                aria-label={copy.next}
                title={copy.next}
                disabled={activeIndex >= words.length - 1}
                onClick={() => selectIndex(activeIndex + 1)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-card px-0 text-sm font-black text-ink transition-colors hover:border-brand-400/60 disabled:cursor-not-allowed disabled:opacity-35 sm:px-3"
              >
                <span className="hidden sm:inline">{copy.next}</span>
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-3 px-4 text-center text-xs text-ink-soft">{copy.hint}</p>
          </section>

          <section className="mx-auto max-w-3xl px-4 py-6 sm:px-7 sm:py-8" aria-labelledby="word-carousel-active-word">
            <div className="flex flex-col gap-5 border-b border-line/70 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="word-carousel-active-word"
                    className="word-carousel-headword min-w-0 flex-1 font-display text-[clamp(2rem,10vw,3rem)] leading-[0.96] tracking-wide text-ink sm:text-5xl"
                  >
                    {activeWord.headword}
                  </h3>
                  <button
                    type="button"
                    onClick={() => speak(activeWord.headword)}
                    aria-label={copy.listen(activeWord.headword)}
                    title={copy.listen(activeWord.headword)}
                    className="icon-tile flex size-11 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    <Volume2 className="size-4" aria-hidden />
                  </button>
                </div>
                {translation && (
                  <p className="mt-1 text-lg font-black text-brand-600 dark:text-brand-200">
                    {translation}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeTags.map((tag) => (
                    <span key={tag} className="rounded-md bg-ink/5 px-2 py-1 text-[11px] font-black text-ink-soft dark:bg-white/10">
                      {tag}
                    </span>
                  ))}
                  {activeWord.ai_generated && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent-500/10 px-2 py-1 text-[11px] font-black text-accent-600 dark:text-accent-300">
                      <Sparkles className="size-3" aria-hidden /> {copy.aiGenerated}
                    </span>
                  )}
                  {categoryName && (
                    <span className="rounded-md bg-ink/5 px-2 py-1 text-[11px] font-black text-ink-soft dark:bg-white/10">
                      {categoryName}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={added}
                onClick={() => onAdd(activeWord)}
                className={cn(
                  "flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition-all",
                  added
                    ? "bg-success/10 text-success-text"
                    : "border border-brand-950 bg-brand-600 text-white shadow-[3px_4px_0_rgb(84,37,15,0.32)] hover:-translate-y-0.5 hover:bg-brand-700"
                )}
              >
                {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                {added ? copy.added : copy.add}
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={detailKey}
                initial={reducedMotion ? false : { opacity: 0, clipPath: "inset(0 0 12% 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="pt-6"
              >
                <WordDetailContent
                  summary={activeWord}
                  detail={detail}
                  loading={loading}
                  lang={lang}
                  labels={labels}
                  categoryName={categoryName}
                />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WordCarouselSlide({
  word,
  lang,
  active,
  index,
  total,
  selectLabel,
  onSelect,
}: {
  word: WordListItem;
  lang: string;
  active: boolean;
  index: number;
  total: number;
  selectLabel: string;
  onSelect: () => void;
}) {
  const translation = getSummaryTranslation(word, lang);

  return (
    <li
      className="word-carousel-slide"
      data-active={active}
      aria-current={active ? "true" : undefined}
      aria-label={`${index + 1} / ${total}: ${word.headword}`}
    >
      <button
        type="button"
        tabIndex={active ? 0 : -1}
        aria-label={selectLabel}
        onClick={onSelect}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-line bg-card text-left shadow-[5px_7px_0_rgb(84,37,15,0.2)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      >
        <span className="relative block h-28 w-full overflow-hidden border-b border-line/70 bg-sand-100 sm:h-36">
          {word.image_url ? (
            <Image
              src={word.image_url}
              alt=""
              fill
              sizes="(max-width: 639px) 220px, 336px"
              unoptimized
              draggable={false}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgb(255_248_234_/_0.9),transparent_28%),linear-gradient(145deg,rgb(108_147_144_/_0.34),rgb(185_78_40_/_0.2))] text-brand-800/75">
              <ImageIcon className="size-8" strokeWidth={1.6} aria-hidden />
            </span>
          )}
          <span className="absolute left-3 top-3 rounded-md border border-brand-950/20 bg-sand-100/92 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-brand-950">
            {word.cefr_level} · {word.pos}
          </span>
        </span>
        <span className="flex min-h-36 flex-1 flex-col p-4">
          <span className="word-carousel-slide-title font-display text-[clamp(1.75rem,8vw,2.25rem)] leading-[0.96] tracking-wide text-ink sm:text-4xl">
            {word.headword}
          </span>
          {word.ipa && <span className="mt-0.5 text-xs text-ink-soft">/{word.ipa}/</span>}
          {translation && <span className="mt-2 line-clamp-2 text-sm font-black text-brand-600 dark:text-brand-200">{translation}</span>}
          {word.primary_example_en && (
            <span className="mt-auto line-clamp-2 border-l-2 border-accent-400/50 pl-2 text-xs leading-5 text-ink-soft">
              {word.primary_example_en}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function getSummaryTranslation(word: WordListItem, lang: string) {
  if (lang === "ru") return word.primary_translation_ru;
  if (lang === "en") return null;
  return word.primary_translation_uz;
}

function getCategoryName(word: WordListItem, lang: string) {
  if (!word.category) return null;
  if (lang === "uz") return word.category.name_uz;
  if (lang === "ru") return word.category.name_ru;
  return word.category.name_en;
}

const carouselCopy = {
  uz: {
    title: "So'zlar karuseli",
    close: "Karuselni yopish",
    previous: "Oldingi",
    next: "Keyingi",
    hint: "So'zlar orasida suring yoki chap va o'ng tugmalaridan foydalaning.",
    add: "Kartalarimga qo'shish",
    added: "Qo'shildi",
    aiGenerated: "AI tomonidan yaratilgan",
    select: (word: string) => `${word} so'zini ochish`,
    listen: (word: string) => `${word} so'zini tinglash`,
    position: (current: number, total: number, word: string) => `${current} / ${total} · ${word}`,
  },
  ru: {
    title: "Карусель слов",
    close: "Закрыть карусель",
    previous: "Назад",
    next: "Далее",
    hint: "Листайте слова или используйте клавиши со стрелками влево и вправо.",
    add: "Добавить в мои карточки",
    added: "Добавлено",
    aiGenerated: "Создано AI",
    select: (word: string) => `Открыть слово ${word}`,
    listen: (word: string) => `Прослушать слово ${word}`,
    position: (current: number, total: number, word: string) => `${current} / ${total} · ${word}`,
  },
  en: {
    title: "Word carousel",
    close: "Close word carousel",
    previous: "Previous",
    next: "Next",
    hint: "Swipe through the words or use the left and right arrow keys.",
    add: "Add to my cards",
    added: "Added",
    aiGenerated: "AI-generated",
    select: (word: string) => `Open ${word}`,
    listen: (word: string) => `Listen to ${word}`,
    position: (current: number, total: number, word: string) => `${current} / ${total} · ${word}`,
  },
} as const;
