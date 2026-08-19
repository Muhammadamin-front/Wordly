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
      // Part 1 answers are two or three sentences in the real exam, so the
      // floor is deliberately low. It used to be 35, a length only reachable
      // because two filler sentences were appended to every answer.
      const minimum = topic.part === "part2" ? 100 : topic.part === "part3" ? 28 : 20;
      const samples = topic.part === "part2" ? [topic.cueSample ?? ""] : topic.sampleAnswers;
      for (const answer of samples) {
        expect(words(answer), `${topic.slug} should contain at least ${minimum} words`).toBeGreaterThanOrEqual(minimum);
      }
    }
  });

  it("never reuses a sentence between two samples", () => {
    // Answers used to be assembled from shared pools: a topic-specific point
    // followed by one of seven generic endings and one of five finishers. Every
    // ending therefore appeared in about ten different topics, which is what
    // made the samples feel identical from card to card.
    const seen = new Map<string, string>();
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      const texts = [...topic.sampleAnswers, ...(topic.planning ?? []).map((item) => item.answer)];
      for (const text of texts) {
        for (const sentence of text.split(/(?<=[.?])\s+/)) {
          const trimmed = sentence.trim();
          if (trimmed.length < 25) continue;
          const previous = seen.get(trimmed);
          expect(previous, `${topic.slug} repeats a sentence from ${previous}: "${trimmed}"`).toBeUndefined();
          seen.set(trimmed, topic.slug);
        }
      }
    }
  });

  it("gives every topic its own phrases, tips and mistakes", () => {
    // These three panels used to render from shared `PHRASES`, `TIPS` and
    // `MISTAKES` constants, so all 70 topics showed identical coaching — the
    // same "everything looks the same" bug as the samples, one panel over.
    const owner = new Map<string, string>();
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      const strings = [
        ...topic.phrases.starting,
        ...topic.phrases.extending,
        ...topic.phrases.concluding,
        ...topic.tips,
        ...topic.mistakes,
      ];
      for (const line of strings) {
        const previous = owner.get(line);
        expect(previous, `${topic.slug} repeats coaching from ${previous}: "${line}"`).toBeUndefined();
        owner.set(line, topic.slug);
      }
    }
  });

  it("keeps the coaching panels a usable size on every topic", () => {
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      for (const group of ["starting", "extending", "concluding"] as const) {
        expect(topic.phrases[group].length, `${topic.slug} ${group}`).toBeGreaterThanOrEqual(3);
      }
      expect(topic.tips.length, `${topic.slug} tips`).toBeGreaterThanOrEqual(3);
      expect(topic.mistakes.length, `${topic.slug} mistakes`).toBeGreaterThanOrEqual(3);
      expect(topic.description.trim(), `${topic.slug} description`).not.toBe("");
      // Every cue card once shared one template built from its theme slug.
      expect(topic.description, topic.slug).not.toMatch(/^Cue-card practice about/);
    }
    const descriptions = SPEAKING_PRACTICE_TOPICS.map((topic) => topic.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("answers Part 1 and Part 3 questions rather than commenting on them", () => {
    // The samples once described how to answer ("That is the aspect I would
    // emphasise in a natural conversation") instead of answering.
    const meta = [
      /in a natural conversation/i,
      /prepared answer/i,
      /the answer specific rather than theoretical/i,
      /I would keep two concrete details/i,
      /that is probably the clearest way to explain my view/i,
    ];
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      for (const answer of topic.sampleAnswers) {
        for (const pattern of meta) {
          expect(pattern.test(answer), `${topic.slug}: "${answer}"`).toBe(false);
        }
      }
    }
  });
});
