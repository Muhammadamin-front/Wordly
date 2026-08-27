import { describe, expect, it } from "vitest";

import { isListeningCorrect, listeningBand } from "@/lib/listening-practice";

describe("listening band conversion", () => {
  it("matches the published Academic Listening reference points (out of 40)", () => {
    expect(listeningBand(39, 40).band).toBe(9);
    expect(listeningBand(35, 40).band).toBe(8);
    expect(listeningBand(30, 40).band).toBe(7);
    expect(listeningBand(23, 40).band).toBe(6);
    expect(listeningBand(16, 40).band).toBe(5);
    expect(listeningBand(10, 40).band).toBe(4);
  });

  it("flags results from fewer than 20 questions as approximate", () => {
    expect(listeningBand(9, 10).approximate).toBe(true);
    expect(listeningBand(30, 40).approximate).toBe(false);
  });
});

describe("isListeningCorrect", () => {
  const base = {
    id: "q1",
    number: 1,
    section: 1 as const,
    prompt: "prompt",
    explanation: "explanation",
  };

  it("matches text answers case/whitespace/period-insensitively, including accepted alternates", () => {
    const question = { ...base, kind: "short-answer" as const, answer: "Rivera", acceptedAnswers: ["rivera."] };
    expect(isListeningCorrect(question, "  rivera  ")).toBe(true);
    expect(isListeningCorrect(question, "RIVERA.")).toBe(true);
    expect(isListeningCorrect(question, "wrong")).toBe(false);
    expect(isListeningCorrect(question, undefined)).toBe(false);
  });

  it("treats multiple-answer as order-independent set equality", () => {
    const question = { ...base, kind: "multiple-answer" as const, answer: ["B", "C"] };
    expect(isListeningCorrect(question, ["C", "B"])).toBe(true);
    expect(isListeningCorrect(question, ["B"])).toBe(false);
    expect(isListeningCorrect(question, "B")).toBe(false);
  });

  it("matches multiple-choice by option value", () => {
    const question = { ...base, kind: "multiple-choice" as const, answer: "B" };
    expect(isListeningCorrect(question, "B")).toBe(true);
    expect(isListeningCorrect(question, "A")).toBe(false);
  });
});
