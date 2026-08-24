import { describe, expect, it } from "vitest";

import { ALL_LESSONS, LESSONS_BY_LEVEL } from "@/lib/grammar";
import { localiseLesson } from "@/lib/grammar/localise";

const LOCALES = ["ru", "en"] as const;

/** The lesson text is written in Uzbek and translations are added level by
 *  level. These tests guard the two things that can silently go wrong:
 *  a translation drifting out of step with the base arrays, and an untranslated
 *  lesson rendering blanks instead of falling back. */
describe("grammar translations", () => {
  it("keeps every translation aligned with its lesson", () => {
    for (const lesson of ALL_LESSONS) {
      for (const locale of LOCALES) {
        const translation = lesson.translations?.[locale];
        if (!translation) continue;
        const where = `${lesson.slug}/${locale}`;

        expect(translation.name.trim(), where).not.toBe("");
        expect(translation.explanation.length, `${where} explanation`).toBe(
          lesson.explanation.length
        );
        expect(translation.mistakeNotes.length, `${where} mistakes`).toBe(
          lesson.mistakes.length
        );
        if (translation.quizPrompts) {
          expect(translation.quizPrompts.length, `${where} quiz`).toBe(lesson.quiz.length);
        }
        if (translation.exampleTranslations) {
          expect(translation.exampleTranslations.length, `${where} examples`).toBe(
            lesson.examples.length
          );
        }
        for (const paragraph of translation.explanation) {
          expect(paragraph.trim(), `${where} has an empty paragraph`).not.toBe("");
        }
        for (const note of translation.mistakeNotes) {
          expect(note.trim(), `${where} has an empty mistake note`).not.toBe("");
        }
      }
    }
  });

  it("keeps the original translated A1 lessons in both locales", () => {
    for (const lesson of LESSONS_BY_LEVEL.A1.slice(0, 10)) {
      expect(lesson.translations?.ru, `${lesson.slug} ru`).toBeDefined();
      expect(lesson.translations?.en, `${lesson.slug} en`).toBeDefined();
    }
  });

  it("returns the Uzbek base untouched for uz", () => {
    const lesson = LESSONS_BY_LEVEL.A1[0];
    expect(localiseLesson(lesson, "uz").explanation).toEqual(lesson.explanation);
    expect(localiseLesson(lesson, "uz").translations).toBeUndefined();
  });

  it("swaps the teaching text for a translated lesson", () => {
    const lesson = LESSONS_BY_LEVEL.A1[0];
    const ru = localiseLesson(lesson, "ru");

    expect(ru.explanation).toEqual(lesson.translations!.ru!.explanation);
    expect(ru.explanation[0]).not.toBe(lesson.explanation[0]);
    expect(ru.mistakes[0].note).toBe(lesson.translations!.ru!.mistakeNotes[0]);
    // The English sentences being taught are never translated away.
    expect(ru.examples.map((e) => e.en)).toEqual(lesson.examples.map((e) => e.en));
    expect(ru.mistakes.map((m) => m.wrong)).toEqual(lesson.mistakes.map((m) => m.wrong));
    expect(ru.quiz.map((q) => q.answer)).toEqual(lesson.quiz.map((q) => q.answer));
  });

  it("drops the translation row for English, which needs none", () => {
    const lesson = LESSONS_BY_LEVEL.A1[0];
    const en = localiseLesson(lesson, "en");
    expect(en.examples.every((example) => example.uz === "")).toBe(true);
  });

  it("keeps an English gap-fill prompt when the translation leaves it blank", () => {
    const plurals = LESSONS_BY_LEVEL.A1.find((l) => l.slug === "pronouns-possessives")!;
    const ru = localiseLesson(plurals, "ru");
    // Every prompt in this lesson is already an English gap fill.
    expect(ru.quiz.map((q) => q.q)).toEqual(plurals.quiz.map((q) => q.q));
  });

  it("falls back to Uzbek where a level is not translated yet", () => {
    const untranslated = ALL_LESSONS.find((lesson) => !lesson.translations);
    expect(untranslated, "expected some levels to be untranslated so far").toBeDefined();
    const ru = localiseLesson(untranslated!, "ru");
    expect(ru.explanation).toEqual(untranslated!.explanation);
    expect(ru.translations).toBeUndefined();
  });
});
