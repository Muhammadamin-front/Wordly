import { describe, expect, it } from "vitest";

import { combineWritingBand, halfBand, overallBand } from "@/lib/ielts-mock";

/** Mirrors app/services/ielts_scoring.py's test suite — these two
 *  implementations must agree, or a mock exam could show a different overall
 *  band than the one the backend actually recorded. */
describe("ielts-mock band math (mirrors ielts_scoring.py)", () => {
  it("rounds a .25/.75 remainder UP, unlike JS's normal rounding", () => {
    expect(halfBand(6.25)).toBe(6.5);
    expect(halfBand(6.75)).toBe(7);
    expect(halfBand(6.24)).toBe(6);
    expect(halfBand(6.26)).toBe(6.5);
  });

  it("clamps to the 0-9 scale", () => {
    expect(halfBand(9.4)).toBe(9);
    expect(halfBand(-1)).toBe(0);
  });

  it("weights Task 2 double toward the combined Writing band", () => {
    // (6 + 2*7) / 3 = 6.667 -> rounds up to 6.5? No: 6.667*2=13.33+0.5=13.83, floor=13 -> 6.5
    expect(combineWritingBand(6, 7)).toBe(6.5);
    // Equal tasks: combined band equals the task band itself.
    expect(combineWritingBand(7, 7)).toBe(7);
    // A stronger Task 2 pulls the combined band up more than a stronger Task 1 would.
    expect(combineWritingBand(5, 7)).toBeGreaterThan(combineWritingBand(7, 5));
  });

  it("averages the four skills unweighted for the overall band", () => {
    expect(overallBand(7, 6.5, 6, 7.5)).toBe(7);
    expect(overallBand(6, 6, 6, 6)).toBe(6);
    expect(overallBand(9, 9, 9, 9)).toBe(9);
    expect(overallBand(0, 0, 0, 0)).toBe(0);
  });
});
