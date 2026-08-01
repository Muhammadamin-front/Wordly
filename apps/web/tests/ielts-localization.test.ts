import { describe, expect, it } from "vitest";

import {
  IELTS_SKILL_CONTENT,
  ieltsSkillContent,
  ieltsVocabularyResources,
  speakingTopicGroups,
} from "@/lib/ielts-resources";

describe("IELTS localized learning content", () => {
  it.each(["uz", "ru"])("localizes strategy guidance for %s", (lang) => {
    const localized = ieltsSkillContent(lang, "reading");
    const english = IELTS_SKILL_CONTENT.reading;

    expect(localized.title).not.toBe(english.title);
    expect(localized.description).not.toBe(english.description);
    expect(localized.sections[0].description).not.toBe(english.sections[0].description);
    expect(localized.sections[0].steps?.[0]).not.toBe(english.sections[0].steps?.[0]);
    expect(localized.sections[0].example).toBe(english.sections[0].example);
  });

  it("localizes resource guidance while keeping target vocabulary in English", () => {
    const english = ieltsVocabularyResources("en")[0];
    const russian = ieltsVocabularyResources("ru")[0];

    expect(russian.description).not.toBe(english.description);
    expect(russian.groups[0].note).not.toBe(english.groups[0].note);
    expect(russian.groups[0].items).toEqual(english.groups[0].items);
  });

  it("localizes topic families but keeps speaking prompts in English", () => {
    const english = speakingTopicGroups("en")[0];
    const uzbek = speakingTopicGroups("uz")[0];

    expect(uzbek.group).not.toBe(english.group);
    expect(uzbek.topics).toEqual(english.topics);
  });
});
