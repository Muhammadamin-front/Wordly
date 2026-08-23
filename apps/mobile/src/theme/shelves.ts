import type { Ionicons } from "@expo/vector-icons";

import type { Locale } from "@/i18n";
import { colors } from "@/theme/tokens";

/** Mirrors apps/web/lib/library.ts's SHELVES — same shelves, same order,
 *  same CEFR/category filters. "expressions" is dropped: it reads from a
 *  separate corpus (not /words) that this client doesn't wire up yet. */
export interface ShelfMeta {
  slug: string; // matches the [key] route param
  key: string; // /library/overview key ("A1", "ielts")
  level?: string;
  category?: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  strings: Record<Locale, { name: string; desc: string }>;
}

export const SHELVES: ShelfMeta[] = [
  {
    slug: "a1", key: "A1", level: "A1", color: colors.brand500, icon: "leaf-outline",
    strings: {
      uz: { name: "A1 · Boshlang'ich", desc: "Ilk zarur inglizcha so'zlaringiz." },
      ru: { name: "A1 · Начальный", desc: "Ваши первые необходимые слова." },
      en: { name: "A1 · Beginner", desc: "Your first essential English words." },
    },
  },
  {
    slug: "a2", key: "A2", level: "A2", color: colors.gold500, icon: "book-outline",
    strings: {
      uz: { name: "A2 · Elementar", desc: "Kundalik hayot uchun so'zlar." },
      ru: { name: "A2 · Элементарный", desc: "Слова для повседневной жизни." },
      en: { name: "A2 · Elementary", desc: "Everyday words for daily life." },
    },
  },
  {
    slug: "b1", key: "B1", level: "B1", color: colors.brand500, icon: "bookmark-outline",
    strings: {
      uz: { name: "B1 · O'rta", desc: "Erkin suhbat uchun so'zlar." },
      ru: { name: "B1 · Средний", desc: "Слова для уверенного общения." },
      en: { name: "B1 · Intermediate", desc: "Words for confident conversation." },
    },
  },
  {
    slug: "b2", key: "B2", level: "B2", color: colors.gold500, icon: "school-outline",
    strings: {
      uz: { name: "B2 · O'rtadan yuqori", desc: "Ravon nutq uchun boy lug'at." },
      ru: { name: "B2 · Выше среднего", desc: "Богатый словарь для беглой речи." },
      en: { name: "B2 · Upper-Intermediate", desc: "Rich vocabulary for fluent speech." },
    },
  },
  {
    slug: "c1", key: "C1", level: "C1", color: colors.brand600, icon: "bulb-outline",
    strings: {
      uz: { name: "C1 · Ilg'or", desc: "Akademik va professional ingliz tili." },
      ru: { name: "C1 · Продвинутый", desc: "Академический и деловой английский." },
      en: { name: "C1 · Advanced", desc: "Academic and professional English." },
    },
  },
  {
    slug: "c2", key: "C2", level: "C2", color: colors.brand800, icon: "ribbon-outline",
    strings: {
      uz: { name: "C2 · Mukammal", desc: "Ona tili darajasidagi aniqlik." },
      ru: { name: "C2 · Владение", desc: "Точность уровня носителя." },
      en: { name: "C2 · Mastery", desc: "Native-level precision." },
    },
  },
  {
    slug: "ielts", key: "ielts", category: "ielts", color: colors.brand700, icon: "locate-outline",
    strings: {
      uz: { name: "IELTS Akademik", desc: "Har bir IELTS nomzodiga kerak so'zlar." },
      ru: { name: "IELTS Academic", desc: "Слова для каждого кандидата IELTS." },
      en: { name: "IELTS Academic", desc: "The words every IELTS candidate needs." },
    },
  },
  {
    slug: "toefl", key: "toefl", category: "toefl", color: colors.brand600, icon: "school-outline",
    strings: {
      uz: { name: "TOEFL", desc: "Kampus va akademik lug'at." },
      ru: { name: "TOEFL", desc: "Кампусная и академическая лексика." },
      en: { name: "TOEFL", desc: "Campus and academic vocabulary." },
    },
  },
  {
    slug: "sat", key: "sat", category: "sat", color: colors.gold500, icon: "pencil-outline",
    strings: {
      uz: { name: "SAT", desc: "Yuqori ball uchun lug'at." },
      ru: { name: "SAT", desc: "Лексика для высокого балла." },
      en: { name: "SAT", desc: "High-score verbal vocabulary." },
    },
  },
  {
    slug: "phrasal", key: "phrasal", category: "phrasal", color: colors.brand400, icon: "link-outline",
    strings: {
      uz: { name: "Frazeologik fe'llar", desc: "Get up, carry on, figure out…" },
      ru: { name: "Фразовые глаголы", desc: "Get up, carry on, figure out…" },
      en: { name: "Phrasal Verbs", desc: "Get up, carry on, figure out…" },
    },
  },
  {
    slug: "idioms", key: "idioms", category: "idioms", color: colors.gold500, icon: "bulb-outline",
    strings: {
      uz: { name: "Idiomalar", desc: "Ona tilidagidek gapiring." },
      ru: { name: "Идиомы", desc: "Говорите как носитель." },
      en: { name: "Idioms", desc: "Speak like a native." },
    },
  },
  {
    slug: "business", key: "business", category: "business", color: colors.gold500, icon: "briefcase-outline",
    strings: {
      uz: { name: "Biznes ingliz tili", desc: "Uchrashuvlar, xatlar, muzokaralar." },
      ru: { name: "Деловой английский", desc: "Встречи, письма, переговоры." },
      en: { name: "Business English", desc: "Meetings, emails, negotiations." },
    },
  },
];

export const shelfBySlug = (slug: string): ShelfMeta | undefined =>
  SHELVES.find((s) => s.slug === slug);
