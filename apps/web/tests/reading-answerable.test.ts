import { describe, expect, it } from "vitest";

import {
  READING_FULL_TESTS,
  READING_PRACTICE_TESTS,
  allReadingQuestions,
  defaultOptionsFor,
  type ReadingQuestion,
} from "@/lib/reading-practice";

/** Kinds the learner answers by choosing, not by typing. Each one must offer
 *  something to choose — 26 questions across the full tests shipped without
 *  options and rendered as an unanswerable prompt. */
const CHOICE_KINDS = new Set([
  "true-false-not-given",
  "yes-no-not-given",
  "multiple-choice",
  "multiple-answer",
]);

function choicesFor(question: ReadingQuestion) {
  return question.options?.length ? question.options : defaultOptionsFor(question.kind);
}

describe("every reading question can actually be answered", () => {
  const tests = [...READING_PRACTICE_TESTS, ...READING_FULL_TESTS];

  it("covers the whole shipped corpus", () => {
    expect(tests.length).toBeGreaterThan(10);
  });

  for (const test of tests) {
    it(`${test.id}: choice questions all offer choices`, () => {
      const unanswerable = allReadingQuestions(test)
        .filter((question) => CHOICE_KINDS.has(question.kind))
        .filter((question) => (choicesFor(question)?.length ?? 0) === 0)
        .map((question) => question.id);
      expect(unanswerable).toEqual([]);
    });

    it(`${test.id}: the marked answer is one of the choices`, () => {
      const mismatched = allReadingQuestions(test)
        .filter((question) => CHOICE_KINDS.has(question.kind))
        .filter((question) => {
          const values = (choicesFor(question) ?? []).map((option) => option.value);
          const answers = Array.isArray(question.answer) ? question.answer : [question.answer];
          return answers.some((answer) => !values.includes(String(answer)));
        })
        .map((question) => question.id);
      expect(mismatched).toEqual([]);
    });
  }
});
