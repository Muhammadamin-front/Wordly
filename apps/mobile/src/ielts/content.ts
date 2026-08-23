import type { Locale } from "@/i18n";

import englishIelts from "./ielts-en.json";
import localizedIelts from "./ielts-localized.json";

export type IeltsSkill = "writing" | "reading" | "speaking" | "listening";

export type IeltsGuideSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  steps?: string[];
  example?: string;
  vocabulary?: string[];
  traps?: string[];
};

export type IeltsSkillContent = {
  eyebrow: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  sections: IeltsGuideSection[];
};

export type IeltsVocabularyResource = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  items?: { basic: string; advanced: string; example: string }[];
  groups?: { title: string; note: string; items: { basic: string; advanced: string; example: string }[] }[];
};

type IeltsContent = {
  skills: Record<IeltsSkill, IeltsSkillContent>;
  resources: IeltsVocabularyResource[];
};

export const IELTS_SKILLS: IeltsSkill[] = ["writing", "reading", "speaking", "listening"];

const localized = localizedIelts as unknown as Record<"uz" | "ru", IeltsContent>;
const english = englishIelts as unknown as IeltsContent;

function contentFor(locale: Locale): IeltsContent {
  return locale === "uz" || locale === "ru" ? localized[locale] : english;
}

export function getIeltsSkill(locale: Locale, skill: IeltsSkill) {
  return contentFor(locale).skills[skill];
}

export function getIeltsResources(locale: Locale) {
  return contentFor(locale).resources;
}

export function getIeltsResource(locale: Locale, slug: string) {
  return getIeltsResources(locale).find((resource) => resource.slug === slug);
}
