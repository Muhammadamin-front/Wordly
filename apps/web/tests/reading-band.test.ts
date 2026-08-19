import { describe, expect, it } from "vitest";

import { readingBand, RELIABLE_QUESTION_COUNT } from "@/lib/reading-practice";

/** One hand-made curve used to score every test: 58% read as band "6.0-6.5"
 *  whether it came from a 40-question Academic paper or a 10-question General
 *  Training set. Academic needs 23/40 for a 6.0 and General Training is
 *  stricter again, so both tracks were flattered. */
describe("reading band conversion", () => {
  it("matches the published Academic reference points", () => {
    expect(readingBand(23, 40, "Academic").band).toBe(6);
    expect(readingBand(20, 40, "Academic").band).toBe(5.5);
    expect(readingBand(30, 40, "Academic").band).toBe(7);
    expect(readingBand(35, 40, "Academic").band).toBe(8);
    expect(readingBand(40, 40, "Academic").band).toBe(9);
  });

  it("marks General Training at or below Academic for the same raw score", () => {
    for (const score of [15, 20, 25, 30, 34, 38]) {
      expect(
        readingBand(score, 40, "General Training").band,
        `${score}/40`
      ).toBeLessThanOrEqual(readingBand(score, 40, "Academic").band);
    }
  });

  it("no longer awards a 6.0 for half marks", () => {
    expect(readingBand(20, 40, "Academic").band).toBeLessThan(6);
  });

  it("rises monotonically with the score", () => {
    let previous = 0;
    for (let score = 0; score <= 40; score += 1) {
      const { band } = readingBand(score, 40, "Academic");
      expect(band).toBeGreaterThanOrEqual(previous);
      previous = band;
    }
  });

  it("flags short sets as approximate", () => {
    expect(readingBand(8, 13, "Academic").approximate).toBe(true);
    expect(readingBand(9, 10, "General Training").approximate).toBe(true);
    expect(readingBand(30, 40, "Academic").approximate).toBe(false);
    expect(RELIABLE_QUESTION_COUNT).toBeGreaterThan(10);
  });

  it("handles an empty test without dividing by zero", () => {
    expect(readingBand(0, 0, "Academic").band).toBeGreaterThan(0);
  });
});
