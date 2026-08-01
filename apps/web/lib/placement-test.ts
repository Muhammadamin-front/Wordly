export const PLACEMENT_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type PlacementLevel = (typeof PLACEMENT_LEVELS)[number];

export type PlacementQuestion = {
  id: string;
  level: PlacementLevel;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
};

export const PLACEMENT_QUESTIONS: readonly PlacementQuestion[] = [
  {
    id: "a1-be",
    level: "A1",
    prompt: "My name ___ Anna.",
    options: ["am", "is", "are", "be"],
    correctIndex: 1,
  },
  {
    id: "a1-present",
    level: "A1",
    prompt: "I ___ coffee every morning.",
    options: ["drink", "drinks", "drank", "drinking"],
    correctIndex: 0,
  },
  {
    id: "a2-past",
    level: "A2",
    prompt: "Yesterday we ___ to the museum.",
    options: ["go", "went", "gone", "going"],
    correctIndex: 1,
  },
  {
    id: "a2-comparative",
    level: "A2",
    prompt: "This bag is ___ than mine.",
    options: ["cheap", "cheapest", "cheaper", "more cheap"],
    correctIndex: 2,
  },
  {
    id: "b1-present-perfect",
    level: "B1",
    prompt: "I ___ here since 2022.",
    options: ["live", "lived", "have lived", "am living"],
    correctIndex: 2,
  },
  {
    id: "b1-conditional",
    level: "B1",
    prompt: "If it rains, we ___ at home.",
    options: ["stay", "stayed", "will stay", "would stay"],
    correctIndex: 2,
  },
  {
    id: "b2-past-perfect",
    level: "B2",
    prompt: "By the time I arrived, the meeting ___.",
    options: ["starts", "has started", "had started", "was starting"],
    correctIndex: 2,
  },
  {
    id: "b2-phrasal-verb",
    level: "B2",
    prompt: "The new policy is expected to ___ positive change.",
    options: ["bring about", "bring up", "bring out", "bring in"],
    correctIndex: 0,
  },
  {
    id: "c1-inversion",
    level: "C1",
    prompt: "Rarely ___ such a convincing argument.",
    options: ["I heard", "have I heard", "I have heard", "did I heard"],
    correctIndex: 1,
  },
  {
    id: "c1-precision",
    level: "C1",
    prompt: "Her explanation was so ___ that experts interpreted it differently.",
    options: ["ambiguous", "ordinary", "brief", "accurate"],
    correctIndex: 0,
  },
  {
    id: "c2-inversion",
    level: "C2",
    prompt: "Had the evidence been disclosed earlier, the outcome ___ different.",
    options: ["will be", "would be", "would have been", "had been"],
    correctIndex: 2,
  },
  {
    id: "c2-nuance",
    level: "C2",
    prompt: "His apology was carefully worded but ultimately ___.",
    options: ["magnanimous", "perfunctory", "meticulous", "fortuitous"],
    correctIndex: 1,
  },
];

export type PlacementResult = {
  level: PlacementLevel;
  score: number;
  total: number;
};

export function recommendPlacementLevel(answers: readonly number[]): PlacementResult {
  const correctByLevel = Object.fromEntries(
    PLACEMENT_LEVELS.map((level) => [level, 0])
  ) as Record<PlacementLevel, number>;

  let score = 0;
  PLACEMENT_QUESTIONS.forEach((question, index) => {
    if (answers[index] === question.correctIndex) {
      score += 1;
      correctByLevel[question.level] += 1;
    }
  });

  let level: PlacementLevel;
  if (score <= 2) level = "A1";
  else if (score <= 4) level = "A2";
  else if (score <= 7) level = "B1";
  else if (score <= 9) level = "B2";
  else if (score <= 11) level = "C1";
  else level = "C2";

  // A lucky answer at an advanced level should not skip a missing foundation.
  const guards: Array<[PlacementLevel, PlacementLevel]> = [
    ["C2", "C1"],
    ["C1", "B2"],
    ["B2", "B1"],
    ["B1", "A2"],
    ["A2", "A1"],
  ];
  for (const [guardLevel, fallback] of guards) {
    if (
      PLACEMENT_LEVELS.indexOf(level) >= PLACEMENT_LEVELS.indexOf(guardLevel) &&
      correctByLevel[guardLevel] === 0
    ) {
      level = fallback;
    }
  }

  if (level === "C2" && correctByLevel.C2 < 2) level = "C1";

  return { level, score, total: PLACEMENT_QUESTIONS.length };
}
