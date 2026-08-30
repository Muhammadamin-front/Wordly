import { describe, expect, it } from "vitest";

import {
  READING_QUESTION_TYPE_GUIDES,
  getQuestionsForReadingQuestionType,
} from "@/lib/reading-practice";

describe("IELTS Reading question-type drills", () => {
  it("exposes a focused drill for every supported core question type", () => {
    expect(READING_QUESTION_TYPE_GUIDES.map((guide) => guide.id)).toEqual([
      "matching-headings",
      "multiple-choice",
      "true-false-not-given",
      "sentence-completion",
      "matching-information",
      "summary-completion",
    ]);

    for (const guide of READING_QUESTION_TYPE_GUIDES) {
      const items = getQuestionsForReadingQuestionType(guide.id);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => guide.kinds.includes(item.question.kind))).toBe(true);
    }
  });

  it("does not repeat the same question because it appears in a full test and a focused test", () => {
    const items = getQuestionsForReadingQuestionType("matching-headings");
    expect(items.map((item) => item.question.id)).toHaveLength(new Set(items.map((item) => item.question.id)).size);
  });
});
