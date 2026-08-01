import { describe, expect, it } from "vitest";

import { buildCrossword, maskAnswer } from "@/components/games/crossword-game";
import type { GameQuestion } from "@/lib/games";

const q = (answer: string, i: number): GameQuestion => ({
  card_id: `card-${i}`,
  prompt: `clue for ${answer}`,
  answer,
  distractors: [],
  audio_text: null,
});

const WORDS = ["planet", "nature", "energy", "travel", "school", "yellow", "garden", "friend"];

describe("buildCrossword", () => {
  const crossword = buildCrossword(WORDS.map(q));

  it("places every usable word exactly once", () => {
    expect(crossword.placements).toHaveLength(WORDS.length);
    const ids = crossword.placements.map((p) => p.cardId);
    expect(new Set(ids).size).toBe(WORDS.length);
  });

  it("writes each placement's letters into the solution grid consistently", () => {
    for (const p of crossword.placements) {
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.dir === "down" ? p.row + i : p.row;
        const c = p.dir === "across" ? p.col + i : p.col;
        expect(crossword.solution[r][c]).toBe(p.answer[i]);
      }
    }
  });

  it("starts with every answer hidden", () => {
    expect(crossword.revealed.flat().every((cell) => !cell)).toBe(true);
  });

  it("numbers placements in reading order starting from 1", () => {
    const numbers = crossword.placements.map((p) => p.number);
    expect(Math.min(...numbers)).toBe(1);
    expect(Math.max(...numbers)).toBeLessThanOrEqual(WORDS.length);
  });

  it("skips multi-word and over-long answers instead of breaking", () => {
    const mixed = [q("give up", 0), q("uncharacteristically", 1), q("planet", 2), q("nature", 3)];
    const built = buildCrossword(mixed);
    expect(built.placements.map((p) => p.answer)).toEqual(
      expect.arrayContaining(["GIVEUP", "PLANET", "NATURE"])
    );
    expect(built.placements).toHaveLength(3);
    expect(built.placements.find((p) => p.answer === "GIVEUP")?.submission).toBe("give up");
  });

  it("masks an answer if a stale API clue accidentally includes it", () => {
    expect(maskAnswer("A planet that supports life", "planet")).toBe(
      "A ___ that supports life"
    );
  });
});
