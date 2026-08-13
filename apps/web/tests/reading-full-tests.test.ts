import { describe, expect, it } from "vitest";

import { READING_FULL_TESTS, allReadingQuestions } from "@/lib/reading-practice";

describe("IELTS Reading full mock bank", () => {
  it("offers at least ten complete Academic-style tests", () => {
    expect(READING_FULL_TESTS.length).toBeGreaterThanOrEqual(10);

    for (const test of READING_FULL_TESTS) {
      expect(test.track).toBe("Cambridge-style");
      expect(test.minutes).toBe(60);
      expect(test.passages).toHaveLength(3);
      expect(allReadingQuestions(test)).toHaveLength(40);
      expect(allReadingQuestions(test).map((question) => question.number)).toEqual(
        Array.from({ length: 40 }, (_, index) => index + 1)
      );
    }
  });

  it("keeps passage and question identifiers unique across the full mock bank", () => {
    const passageIds = READING_FULL_TESTS.flatMap((test) => test.passages.map((passage) => passage.id));
    const questionIds = READING_FULL_TESTS.flatMap((test) =>
      allReadingQuestions(test).map((question) => question.id)
    );

    expect(new Set(passageIds).size).toBe(passageIds.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });
});
