import type { Locale } from "@/i18n";

import {
  ieltsSkillContent,
  ieltsVocabularyResources,
  type IeltsResourceSection,
  type IeltsSkill,
  type IeltsSkillContent,
  type VocabularyResource,
} from "../../../web/lib/ielts-resources";

/**
 * IELTS guides and vocabulary articles have one authored source: the web
 * workspace. Native screens render this content with their own components,
 * while every new web edit ships in the next mobile build without a manual
 * copy step.
 */
export type { IeltsSkill, IeltsSkillContent };
export type IeltsGuideSection = IeltsResourceSection;
export type IeltsVocabularyResource = VocabularyResource;

export const IELTS_SKILLS: IeltsSkill[] = ["writing", "reading", "speaking", "listening"];

export function getIeltsSkill(locale: Locale, skill: IeltsSkill) {
  return ieltsSkillContent(locale, skill);
}

export function getIeltsResources(locale: Locale) {
  return ieltsVocabularyResources(locale);
}

export function getIeltsResource(locale: Locale, slug: string) {
  return getIeltsResources(locale).find((resource) => resource.slug === slug);
}
