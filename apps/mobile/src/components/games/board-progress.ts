export function boardPlayableTotal(
  type: string,
  sessionQuestions: number,
  board: { wordSearchTargets: number; crosswordPlacements: number },
) {
  if (type === "word_search") return board.wordSearchTargets;
  if (type === "crossword") return board.crosswordPlacements;
  return sessionQuestions;
}
