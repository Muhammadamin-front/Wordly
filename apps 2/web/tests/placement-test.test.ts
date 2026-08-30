import { describe, expect, it } from "vitest";

import {
  HIGHEST_PRACTICE_LEVEL,
  PLACEMENT_QUESTIONS,
  practiceLevelFor,
  recommendPlacementLevel,
} from "@/lib/placement-test";

describe("recommendPlacementLevel", () => {
  it("recommends C2 only when every band is demonstrated", () => {
    const answers = PLACEMENT_QUESTIONS.map((question) => question.correctIndex);

    expect(recommendPlacementLevel(answers)).toEqual({ level: "C2", score: 12, total: 12, practiceLevel: "B2" });
  });

  it("places an early learner at A1", () => {
    const answers = PLACEMENT_QUESTIONS.map((question, index) =>
      index < 2 ? question.correctIndex : (question.correctIndex + 1) % question.options.length
    );

    expect(recommendPlacementLevel(answers).level).toBe("A1");
  });

  it("does not promote a learner who missed the target band foundation", () => {
    const answers = PLACEMENT_QUESTIONS.map((question) => question.correctIndex);
    const b2Questions = PLACEMENT_QUESTIONS.map((question, index) => ({ question, index })).filter(
      ({ question }) => question.level === "B2"
    );
    for (const { question, index } of b2Questions) {
      answers[index] = (question.correctIndex + 1) % question.options.length;
    }

    expect(recommendPlacementLevel(answers).level).toBe("B1");
  });
});

describe("practice level", () => {
  it("caps the practice level at the highest one with drills", () => {
    // The placement test reaches C2 and the vocabulary library has C1/C2
    // shelves, but Reading, Writing and Grammar drills stop at B2. Reporting
    // that is better than placing someone at C1 and quietly serving B2 work.
    const perfect = PLACEMENT_QUESTIONS.map((question) => question.correctIndex);
    const result = recommendPlacementLevel(perfect);

    expect(result.level).toBe("C2");
    expect(result.practiceLevel).toBe("B2");
  });

  it("leaves levels at or below the cap untouched", () => {
    for (const level of ["A1", "A2", "B1", "B2"] as const) {
      expect(practiceLevelFor(level)).toBe(level);
    }
    expect(practiceLevelFor("C1")).toBe(HIGHEST_PRACTICE_LEVEL);
    expect(practiceLevelFor("C2")).toBe(HIGHEST_PRACTICE_LEVEL);
  });
});
