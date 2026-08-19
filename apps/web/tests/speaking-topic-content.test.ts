import { describe, expect, it } from "vitest";

import { SPEAKING_PRACTICE_TOPICS, speakingTopicsByPart } from "@/lib/speaking-practice";

/** Part 1 and Part 3 questions were generated from one shared template with the
 *  topic name interpolated, so every card opened with the same sentence and the
 *  vocabulary panel showed the same four words on all seventy topics. These
 *  tests fail if that ever comes back. */
describe("speaking topic content", () => {
  it("gives every topic its own opening question", () => {
    for (const part of ["part1", "part3"] as const) {
      const openers = speakingTopicsByPart(part).map((topic) => topic.questions[0]);
      expect(new Set(openers).size, `${part} openers repeat`).toBe(openers.length);
    }
  });

  it("never repeats a question inside a topic", () => {
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      expect(new Set(topic.questions).size, `${topic.slug} repeats a question`).toBe(
        topic.questions.length
      );
    }
  });

  it("shares no question between two topics of the same part", () => {
    for (const part of ["part1", "part3"] as const) {
      const seen = new Map<string, string>();
      for (const topic of speakingTopicsByPart(part)) {
        for (const question of topic.questions) {
          const owner = seen.get(question);
          expect(owner, `"${question}" is used by both ${owner} and ${topic.slug}`).toBeUndefined();
          seen.set(question, topic.slug);
        }
      }
    }
  });

  it("gives every topic its own vocabulary set", () => {
    const byWords = new Map<string, string>();
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      expect(topic.vocabulary.length, `${topic.slug} vocabulary`).toBeGreaterThanOrEqual(4);
      const key = topic.vocabulary.map((item) => item.word).join("|");
      const owner = byWords.get(key);
      expect(owner, `${topic.slug} reuses the vocabulary of ${owner}`).toBeUndefined();
      byWords.set(key, topic.slug);
    }
  });

  it("keeps every vocabulary entry complete, with an Uzbek gloss", () => {
    for (const topic of SPEAKING_PRACTICE_TOPICS) {
      for (const item of topic.vocabulary) {
        const where = `${topic.slug}/${item.word}`;
        expect(item.word.trim(), where).not.toBe("");
        expect(item.uz.trim(), `${where} uz`).not.toBe("");
        expect(item.definition.trim(), `${where} definition`).not.toBe("");
        // Verbs inflect in the example ("be into" -> "am into"), so accept any
        // part of the headword: for a phrasal verb the particle never changes.
        const parts = item.word
          .replace(/^to /, "")
          .split(/\s+/)
          .filter((part) => part.length >= 2)
          .map((part) => part.slice(0, 4).toLowerCase());
        const example = item.example.toLowerCase();
        expect(
          parts.some((part) => example.includes(part)),
          `${where} example does not use the entry: "${item.example}"`
        ).toBe(true);
      }
    }
  });
});
