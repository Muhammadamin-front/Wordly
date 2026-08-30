import type { WritingScore } from "@/lib/ielts";

export const WRITING_ESSAY =
  "Digital technology can improve access to education. " +
  "Technology also helps students find useful resources. " +
  "However, young people sometimes uses technology without clear limits.";

export const WRITING_SCORE: WritingScore = {
  band_overall: 6.5,
  task: { band: 6, comment: "The position is relevant but needs fuller development." },
  coherence: { band: 6.5, comment: "The progression is clear, with one mechanical link." },
  lexical: { band: 7, comment: "Vocabulary is clear and mostly precise." },
  grammar: { band: 6, comment: "A subject–verb agreement error reduces accuracy." },
  errors: [
    {
      quote: "people sometimes uses",
      fix: "people sometimes use",
      note: "People is plural, so the verb must be use.",
      type: "grammar",
    },
  ],
  strengths: ["Academic collocation: improve access"],
  feedback:
    "Your response is easy to follow and uses some natural academic language. Develop the explanation further and check agreement before submitting.",
  improved:
    "Digital technology can broaden access to education. It also enables students to find useful resources. However, young people may use these tools without appropriate limits.",
  analysis: {
    sentence_feedback: [
      {
        sentence_number: 1,
        sentence: "Digital technology can improve access to education.",
        highlight: "improve access",
        status: "good",
        category: "collocation",
        explanation: "This is a concise and natural academic collocation.",
        use_instead: "",
        why: "",
      },
      {
        sentence_number: 2,
        sentence: "Technology also helps students find useful resources.",
        highlight: "helps students",
        status: "improve",
        category: "vocabulary",
        explanation: "The verb is correct, but it is fairly basic here.",
        use_instead: "enables students",
        why: "The alternative expresses the relationship more precisely.",
      },
      {
        sentence_number: 3,
        sentence: "However, young people sometimes uses technology without clear limits.",
        highlight: "people sometimes uses",
        status: "error",
        category: "subject_verb_agreement",
        explanation: "The plural subject does not agree with uses.",
        use_instead: "people sometimes use",
        why: "People is plural, so use the base verb form.",
      },
    ],
    good_points: [
      {
        title: "Natural academic collocation",
        evidence: "improve access",
        explanation: "The phrase communicates a benefit precisely.",
      },
      {
        title: "Clear contrast",
        evidence: "However",
        explanation: "This makes the change in direction easy to follow.",
      },
    ],
    areas_to_improve: [
      {
        title: "Check agreement",
        evidence: "people sometimes uses",
        action: "Use a plural verb with people.",
      },
      {
        title: "Develop the benefit",
        evidence: "useful resources",
        action: "Explain how those resources improve learning outcomes.",
      },
    ],
    language_upgrades: [
      {
        used: "helps students",
        use_instead: "enables students",
        why: "It is more precise without sounding forced.",
      },
    ],
    repetitions: [
      {
        word: "technology",
        frequency: 3,
        problem: "It is repeated often in a very short response.",
        alternatives: ["digital tools", "these systems"],
      },
    ],
    cohesion: {
      strengths: [{ quote: "However", explanation: "It introduces contrast clearly." }],
      issues: [
        {
          quote: "Technology also",
          explanation: "Repeating the noun makes this link sound mechanical.",
        },
      ],
      opportunities: ["Use these tools when the reference is unambiguous."],
    },
    grammar_profile: {
      strengths: [
        {
          quote: "can improve access",
          explanation: "The modal verb is followed by the correct base form.",
        },
      ],
      weaknesses: [
        {
          quote: "people sometimes uses",
          explanation: "The verb does not agree with the plural subject.",
        },
      ],
    },
    band_plan: {
      current_band: 6.5,
      target_band: 7,
      actions: [
        "Check every present-simple verb against its subject.",
        "Extend each main claim with a clear result or example.",
        "Replace repeated nouns only when the reference stays clear.",
        "Keep precise collocations such as improve access.",
      ],
    },
    next_steps: [
      "Rewrite sentence 3 with correct agreement.",
      "Add one sentence explaining how useful resources improve education.",
      "Read the response aloud once to catch mechanical repetition.",
    ],
  },
  reward: { xp_gained: 25, total_xp: 125, level: 3, leveled_up: false },
};
