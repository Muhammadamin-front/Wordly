import { describe, expect, it } from "vitest";

import { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL } from "@/lib/grammar";

describe("grammar course content", () => {
  it("has a full course across the five levels", () => {
    expect(ALL_LESSONS).toHaveLength(200);
    expect(Object.fromEntries(GRAMMAR_LEVELS.map((level) => [level, LESSONS_BY_LEVEL[level].length]))).toEqual({ A1: 30, A2: 35, B1: 45, B2: 50, C1: 40 });
  });

  it("has unique slugs", () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ships 3,000 varied exercises across all required interaction types", () => {
    const exercises = ALL_LESSONS.flatMap((lesson) => lesson.exercises ?? []);
    expect(exercises).toHaveLength(3000);
    expect(new Set(exercises.map((exercise) => exercise.type))).toEqual(new Set([
      "multiple-choice", "fill-blank", "error-correction", "sentence-builder", "rewrite", "context-choice",
    ]));
    for (const lesson of ALL_LESSONS) {
      expect(new Set((lesson.exercises ?? []).map((exercise) => exercise.prompt)).size).toBeGreaterThanOrEqual(10);
    }
  });

  it("does not duplicate a lesson title inside the same CEFR level", () => {
    const keys = ALL_LESSONS.map((lesson) => `${lesson.level}:${lesson.title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(ALL_LESSONS.map((l) => [l.slug, l] as const))(
    "%s is complete and internally valid",
    (_slug, lesson) => {
      expect(lesson.explanation.length).toBeGreaterThanOrEqual(3);
      expect(lesson.examples.length).toBeGreaterThanOrEqual(4);
      expect(lesson.mistakes.length).toBeGreaterThanOrEqual(2);
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(4);
      expect(lesson.exercises?.length).toBeGreaterThanOrEqual(15);
      expect(lesson.category).toBeTruthy();
      expect(lesson.introduction?.trim()).toBeTruthy();
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      if (lesson.level === "C1") {
        expect(lesson.explanation.length).toBeGreaterThanOrEqual(4);
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
      for (const exercise of lesson.exercises ?? []) {
        expect(exercise.prompt.trim()).toBeTruthy();
        expect(exercise.correctAnswer.trim()).toBeTruthy();
        expect(exercise.explanation.trim()).toBeTruthy();
        if (exercise.options) expect(exercise.options).toContain(exercise.correctAnswer);
      }
    }
  );

  it("has valid prerequisite and related lesson references", () => {
    const slugs = new Set(ALL_LESSONS.map((lesson) => lesson.slug));
    for (const lesson of ALL_LESSONS) {
      for (const reference of [...(lesson.prerequisites ?? []), ...(lesson.relatedLessons ?? [])]) {
        expect(slugs.has(reference), `${lesson.slug} -> ${reference}`).toBe(true);
      }
    }
  });

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
