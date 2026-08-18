import type { Locale } from "@/lib/locales";

/** Shared between the global header and the landing card's own navigation, so
 *  the two never drift apart. Kept out of the header module because that one is
 *  a client component and the landing page renders on the server. */
export function getHomeLabel(lang: Locale): string {
  return { uz: "Bosh sahifa", ru: "Главная", en: "Home" }[lang];
}

export function getWordsLabel(lang: Locale): string {
  return { uz: "So'zlar", ru: "Слова", en: "Words" }[lang];
}
