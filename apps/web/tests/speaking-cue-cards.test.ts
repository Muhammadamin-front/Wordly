import { describe, expect, it } from "vitest";

import { CUE_CARD_DETAILS } from "@/lib/speaking-cue-cards";
import { speakingTopicsByPart } from "@/lib/speaking-practice";

const part2 = speakingTopicsByPart("part2");

/** The sample answers were rewritten separately; these tests cover the cue card
 *  itself, which kept two generated defects:
 *
 *  - bullets 2-4 were the same three lines on every card, so an object card
 *    asked "who was with you" and a future-job card asked "when it happened";
 *  - follow-ups were interpolated from the raw theme slug, producing
 *    "Do people in your country often talk about people?".
 */
describe("Part 2 cue cards", () => {
  it("has details for every cue topic", () => {
    expect(part2.length).toBe(20);
    for (const topic of part2) {
      expect(CUE_CARD_DETAILS[topic.slug], topic.slug).toBeDefined();
      expect(topic.cueCard).toBeDefined();
    }
  });

  it("does not reuse the old shared bullets", () => {
    const boilerplate = [
      "when it happened or when you experienced it",
      "who was with you or who was involved",
      "and explain why this memory or idea is important to you",
    ];
    for (const topic of part2) {
      for (const prompt of topic.cueCard!.prompts) {
        expect(boilerplate, topic.slug).not.toContain(prompt);
      }
    }
  });

  it("gives every card four distinct bullets", () => {
    for (const topic of part2) {
      const prompts = topic.cueCard!.prompts;
      expect(prompts.length, topic.slug).toBe(4);
      expect(new Set(prompts).size, topic.slug).toBe(4);
      for (const prompt of prompts) expect(prompt.trim()).not.toBe("");
    }
  });

  it("keeps bullets largely unique across cards", () => {
    const all = part2.flatMap((topic) => topic.cueCard!.prompts);
    const counts = new Map<string, number>();
    for (const prompt of all) counts.set(prompt, (counts.get(prompt) ?? 0) + 1);
    const reused = [...counts.values()].filter((n) => n > 1).length;
    expect(reused).toBeLessThan(all.length / 3);
  });

  it("writes follow-ups as real discussion questions", () => {
    const themeEcho = /talk about (people|place|life|work|events|memories|learning|communication)\?/;
    for (const topic of part2) {
      const followUps = topic.cueCard!.followUps;
      expect(followUps.length, topic.slug).toBe(2);
      for (const followUp of followUps) {
        expect(followUp, topic.slug).toMatch(/\?$/);
        expect(followUp, topic.slug).not.toMatch(themeEcho);
        expect(followUp.split(/\s+/).length, topic.slug).toBeGreaterThan(5);
      }
    }
  });

  it("asks something different in each follow-up pair", () => {
    for (const topic of part2) {
      const [first, second] = topic.cueCard!.followUps;
      expect(first, topic.slug).not.toBe(second);
    }
  });
});
