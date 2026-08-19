import { describe, expect, it } from "vitest";

import {
  READING_PRACTICE_TESTS,
  READING_FULL_TESTS,
  allReadingQuestions,
} from "@/lib/reading-practice";

const normalise = (value: string) =>
  value.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

/** Nine of the fourteen reading tests are generated from a shared template.
 *  That is fine as long as the generator varies what the learner is actually
 *  assessed on. Previously it did not: all 27 generated passages carried the
 *  same key (i, ii, iii, iv then TRUE, FALSE, NOT GIVEN, FALSE), so finishing
 *  one test revealed the answers to the other eight. */
describe("reading answer keys", () => {
  it("quotes evidence that appears in the passage", () => {
    for (const test of READING_PRACTICE_TESTS) {
      for (const passage of test.passages) {
        const text = normalise(passage.paragraphs.map((p) => p.text).join(" "));
        for (const question of passage.questions) {
          expect(
            text.includes(normalise(question.evidence)),
            `${test.id}/${passage.id}/${question.id}: "${question.evidence}"`
          ).toBe(true);
        }
      }
    }
  });

  it("numbers every test from 1 without gaps", () => {
    for (const test of READING_PRACTICE_TESTS) {
      const numbers = allReadingQuestions(test).map((question) => question.number);
      expect(numbers, test.id).toEqual(
        Array.from({ length: numbers.length }, (_, index) => index + 1)
      );
    }
  });

  it("keeps every answer inside its own option list", () => {
    for (const test of READING_PRACTICE_TESTS) {
      for (const question of allReadingQuestions(test)) {
        if (!question.options?.length) continue;
        const values = question.options.map((option) => option.value);
        for (const answer of [question.answer].flat()) {
          expect(values, `${test.id}/${question.id}`).toContain(answer);
        }
      }
    }
  });

  /** The generated passages present one shared heading list across the whole
   *  group, so each heading can be used only once. The hand-written passages
   *  give every question its own four options, where a repeated numeral is
   *  perfectly valid — these checks only apply to the shared-list style. */
  const sharedHeadingGroups = READING_FULL_TESTS.flatMap((test) =>
    test.passages.flatMap((passage) => {
      const questions = passage.questions.filter((q) => q.kind === "matching-headings");
      if (questions.length < 2) return [];
      const signature = JSON.stringify(questions[0].options);
      const shared = questions.every((q) => JSON.stringify(q.options) === signature);
      return shared ? [{ id: `${test.id}/${passage.id}`, questions }] : [];
    })
  );

  it("does not map matching headings in paragraph order", () => {
    // A key of i, ii, iii, iv means four marks without reading anything.
    expect(sharedHeadingGroups.length).toBeGreaterThan(20);
    for (const group of sharedHeadingGroups) {
      const answers = group.questions.map((question) => question.answer).join(",");
      expect(answers, group.id).not.toBe("i,ii,iii,iv");
    }
  });

  it("uses each shared heading at most once per group", () => {
    for (const group of sharedHeadingGroups) {
      const answers = group.questions.map((question) => question.answer);
      expect(new Set(answers).size, group.id).toBe(answers.length);
    }
  });

  it("offers more headings than paragraphs to match", () => {
    for (const group of sharedHeadingGroups) {
      expect(group.questions[0].options!.length, group.id).toBeGreaterThan(
        group.questions.length
      );
    }
  });

  it("uses all three verdicts in a full True/False/Not Given group", () => {
    for (const test of READING_FULL_TESTS) {
      for (const passage of test.passages) {
        const answers = passage.questions
          .filter((question) => question.kind === "true-false-not-given")
          .map((question) => String(question.answer));
        if (answers.length < 4) continue;
        expect(new Set(answers), `${test.id}/${passage.id}`).toEqual(
          new Set(["TRUE", "FALSE", "NOT GIVEN"])
        );
      }
    }
  });

  it("varies the answer key between generated passages", () => {
    const keys = READING_FULL_TESTS.flatMap((test) =>
      test.passages.map((passage) =>
        passage.questions
          .filter((q) => q.kind === "matching-headings" || q.kind === "true-false-not-given")
          .map((q) => String(q.answer))
          .join("|")
      )
    ).filter(Boolean);

    const counts = new Map<string, number>();
    for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);

    // No key may cover more than a small fraction of the bank.
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(3);
    expect(counts.size).toBeGreaterThan(keys.length * 0.7);
  });

  it("gives full-test passages enough text to be worth 60 minutes", () => {
    for (const test of READING_FULL_TESTS) {
      for (const passage of test.passages) {
        const words = passage.paragraphs
          .map((paragraph) => paragraph.text)
          .join(" ")
          .split(/\s+/).length;
        expect(words, `${test.id}/${passage.id}`).toBeGreaterThan(280);
      }
    }
  });
});
