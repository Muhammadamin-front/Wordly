import { describe, expect, it } from "vitest";

import {
  PLACEMENT_QUESTIONS,
  recommendPlacementLevel,
} from "@/lib/placement-test";

describe("recommendPlacementLevel", () => {
  it("recommends C2 only when every band is demonstrated", () => {
    const answers = PLACEMENT_QUESTIONS.map((question) => question.correctIndex);

    expect(recommendPlacementLevel(answers)).toEqual({
      level: "C2",
      score: 12,
      total: 12,
    });
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
