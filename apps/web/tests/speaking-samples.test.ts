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
    // 30 Part 1 topics x 7 questions, 20 cue cards (one question each — the
    // card), 20 Part 3 topics x 8 questions.
    expect(
      SPEAKING_PRACTICE_TOPICS.reduce((total, topic) => total + topic.questions.length, 0)
    ).toBe(30 * 7 + 20 * 1 + 20 * 8);

    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      expect(topic.sampleAnswers, topic.slug).toHaveLength(topic.questions.length);
      topic.questions.forEach((question, index) => {
        expect(topic.sampleAnswers[index].trim(), `${topic.slug} question ${index + 1}`).not.toBe("");
      });
      if (topic.part === "part2") {
        expect(topic.cueSample, topic.slug).toBe(topic.sampleAnswers[0]);
        // The planning prompts moved out of `questions`, where the cue-card
        // view never rendered them, into their own labelled section.
        expect(topic.planning, topic.slug).toHaveLength(2);
        for (const item of topic.planning ?? []) {
          expect(item.question.trim(), topic.slug).not.toBe("");
          expect(item.answer.trim(), topic.slug).not.toBe("");
          // They used to be built from the theme slug: "this people story".
          expect(item.question, topic.slug).not.toMatch(/this \w+ story/);
        }
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
