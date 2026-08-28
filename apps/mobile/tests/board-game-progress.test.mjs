import assert from "node:assert/strict";
import test from "node:test";

import { boardPlayableTotal } from "../src/components/games/board-progress.ts";

test("word search progress uses only words that were actually placed", () => {
  assert.equal(boardPlayableTotal("word_search", 10, { wordSearchTargets: 6, crosswordPlacements: 0 }), 6);
});

test("crossword progress excludes entries the grid builder could not place", () => {
  assert.equal(boardPlayableTotal("crossword", 10, { wordSearchTargets: 0, crosswordPlacements: 7 }), 7);
});

test("memory and matching use the full server session", () => {
  assert.equal(boardPlayableTotal("memory", 10, { wordSearchTargets: 0, crosswordPlacements: 0 }), 10);
  assert.equal(boardPlayableTotal("word_match", 10, { wordSearchTargets: 0, crosswordPlacements: 0 }), 10);
});
