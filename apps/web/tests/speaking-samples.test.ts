import { describe, expect, it } from "vitest";

import {
  SPEAKING_PRACTICE_TOPICS,
  sampleAnswer,
} from "@/lib/speaking-practice";

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

describe("IELTS Speaking Band 8+ samples", () => {
  it("provides a dedicated answer for every question and cue card", () => {
    expect(SPEAKING_PRACTICE_TOPICS).toHaveLength(70);
    expect(
      SPEAKING_PRACTICE_TOPICS.reduce((total, topic) => total + topic.questions.length, 0)
    ).toBe(430);

    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      expect(topic.sampleAnswers, topic.slug).toHaveLength(topic.questions.length);
      topic.questions.forEach((question, index) => {
        expect(topic.sampleAnswers[index].trim(), `${topic.slug} question ${index + 1}`).not.toBe("");
      });
      if (topic.part === "part2") {
        expect(topic.cueSample, topic.slug).toBe(topic.sampleAnswers[0]);
      }
    }
  });

  it("never turns the question itself into the sample answer", () => {
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      topic.questions.forEach((question) => {
        const answer = sampleAnswer(topic, question);
        expect(normalise(answer), `${topic.slug}: ${question}`).not.toContain(normalise(question));
      });
    }
  });

  it("keeps every visible sample unique and long enough for its speaking part", () => {
    const visibleSamples = SPEAKING_PRACTICE_TOPICS.flatMap((topic) =>
      topic.part === "part2" ? [topic.cueSample ?? ""] : topic.sampleAnswers
    );
    expect(new Set(visibleSamples).size).toBe(visibleSamples.length);

    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      const minimum = topic.part === "part2" ? 100 : topic.part === "part3" ? 45 : 35;
      const samples = topic.part === "part2" ? [topic.cueSample ?? ""] : topic.sampleAnswers;
      for (const answer of samples) {
        expect(words(answer), `${topic.slug} should contain at least ${minimum} words`).toBeGreaterThanOrEqual(minimum);
      }
    }
  });
});
