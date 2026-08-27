import { describe, expect, it } from "vitest";

import { LISTENING_FULL_TESTS } from "@/lib/listening-practice";

describe("IELTS Full Mock listening tests", () => {
  it("has at least one test, each with unique, sequential question numbers", () => {
    expect(LISTENING_FULL_TESTS.length).toBeGreaterThanOrEqual(1);

    for (const test of LISTENING_FULL_TESTS) {
      const questions = test.sections.flatMap((section) => section.questions);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.map((q) => q.number)).toEqual(
        Array.from({ length: questions.length }, (_, index) => index + 1)
      );
      // Every question belongs to a section that actually exists on the test.
      for (const question of questions) {
        expect(test.sections.some((section) => section.number === question.section)).toBe(true);
      }
    }
  });

  it("keeps section, turn, and question data non-empty and every turn's role valid", () => {
    for (const test of LISTENING_FULL_TESTS) {
      for (const section of test.sections) {
        expect(section.turns.length).toBeGreaterThan(0);
        for (const turn of section.turns) {
          expect(["a", "b", "narrator"]).toContain(turn.role);
          expect(turn.text.trim()).not.toBe("");
        }
      }
    }
  });

  it("keeps test slugs and question ids unique", () => {
    const slugs = LISTENING_FULL_TESTS.map((test) => test.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const questionIds = LISTENING_FULL_TESTS.flatMap((test) =>
      test.sections.flatMap((section) => section.questions.map((q) => q.id))
    );
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it("gives multiple-answer questions an array answer and every other kind a string", () => {
    for (const test of LISTENING_FULL_TESTS) {
      for (const section of test.sections) {
        for (const question of section.questions) {
          if (question.kind === "multiple-answer") {
            expect(Array.isArray(question.answer)).toBe(true);
          } else {
            expect(typeof question.answer).toBe("string");
          }
        }
      }
    }
  });
});
