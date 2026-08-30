import { describe, expect, it } from "vitest";

import { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL } from "@/lib/grammar";

describe("grammar course content", () => {
  it("has a full course across the five levels", () => {
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(69);
    expect(GRAMMAR_LEVELS.every((lv) => LESSONS_BY_LEVEL[lv].length >= 8)).toBe(true);
    expect(LESSONS_BY_LEVEL.IELTS.length).toBeGreaterThanOrEqual(32);
  });

  it("has unique slugs", () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(ALL_LESSONS.map((l) => [l.slug, l] as const))(
    "%s is complete and internally valid",
    (_slug, lesson) => {
      expect(lesson.explanation.length).toBeGreaterThanOrEqual(3);
      expect(lesson.examples.length).toBeGreaterThanOrEqual(5);
      expect(lesson.mistakes.length).toBeGreaterThanOrEqual(3);
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(4);
      if (lesson.level === "IELTS") {
        expect(lesson.explanation.length).toBeGreaterThanOrEqual(4);
        expect(lesson.examples.length).toBeGreaterThanOrEqual(6);
      }
      for (const ex of lesson.examples) {
        expect(ex.en.trim()).toBeTruthy();
        expect(ex.uz.trim()).toBeTruthy();
      }
      for (const item of lesson.quiz) {
        expect(item.options.length).toBeGreaterThanOrEqual(3);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(item.options.length);
      }
    }
  );

  it("keeps Uzbek fields free of Cyrillic", () => {
    const cyrillic = /[а-яА-ЯёЁ]/;
    for (const lesson of ALL_LESSONS) {
      expect(cyrillic.test(lesson.titleUz), lesson.slug).toBe(false);
      for (const ex of lesson.examples) {
        expect(cyrillic.test(ex.uz), `${lesson.slug}: ${ex.uz}`).toBe(false);
      }
    }
  });
});
