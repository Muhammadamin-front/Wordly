import "server-only";

import type en from "./dictionaries/en.json";

export type Dictionary = typeof en;

const dictionaries = {
  uz: () => import("./dictionaries/uz.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const locales: Locale[] = ["uz", "ru", "en"];
export const defaultLocale: Locale = "uz";

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
