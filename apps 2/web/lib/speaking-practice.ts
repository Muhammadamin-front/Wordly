import { PART1_TOPICS } from "./speaking/part1";
import { PART2_TOPICS } from "./speaking/part2";
import { PART3_TOPICS } from "./speaking/part3";
import type {
  SpeakingCueCard,
  SpeakingExchange,
  SpeakingPart,
  SpeakingTopic,
  SpeakingVocabularyItem,
} from "./speaking/types";

export type {
  SpeakingCueCard,
  SpeakingExchange,
  SpeakingPart,
  SpeakingTopic,
  SpeakingVocabularyItem,
};

/** Cross-topic phrases. These are deliberately generic — they are the connective
 *  language a candidate reuses across every Part 1 answer, not topic vocabulary. */
const GENERAL_VOCABULARY: SpeakingVocabularyItem[] = [
  {
    word: "meaningful",
    uz: "mazmunli, ahamiyatli",
    definition: "important because it has personal value or purpose",
    example: "Learning English became more meaningful when I connected it with my career goals.",
  },
  {
    word: "habit",
    uz: "odat",
    definition: "something you do regularly, often without thinking much",
    example: "I have built a habit of reviewing new vocabulary every evening.",
  },
  {
    word: "convenient",
    uz: "qulay",
    definition: "easy to use or suitable for your situation",
    example: "Online lessons are convenient because I can study after work.",
  },
  {
    word: "memorable",
    uz: "eslab qolishga arzigulik",
    definition: "special enough to be remembered",
    example: "The trip was memorable because I met people from different cultures.",
  },
];

const DISCUSSION_VOCABULARY: SpeakingVocabularyItem[] = [
  {
    word: "significant",
    uz: "muhim, sezilarli",
    definition: "large or important enough to be noticed",
    example: "Public transport has a significant impact on the quality of city life.",
  },
  {
    word: "long-term impact",
    uz: "uzoq muddatli ta'sir",
    definition: "an effect that continues for a long time",
    example: "A good education can have a long-term impact on someone's confidence.",
  },
  {
    word: "balanced approach",
    uz: "muvozanatli yondashuv",
    definition: "a way of dealing with something that considers different sides",
    example: "A balanced approach is needed when children use technology.",
  },
  {
    word: "widely regarded",
    uz: "keng tan olingan",
    definition: "believed by many people to be true or important",
    example: "Reading is widely regarded as one of the best ways to improve vocabulary.",
  },
];

const EVERYDAY_PHRASES = {
  starting: [
    "To be honest, I would say...",
    "That's an interesting question because...",
    "From my personal experience...",
  ],
  extending: [
    "The main reason is that...",
    "For example, a lot of people in Uzbekistan...",
    "Another point worth mentioning is...",
  ],
  concluding: [
    "So overall, I think...",
    "That's why I would describe it as...",
    "In the long run, this can...",
  ],
};

const DISCUSSION_PHRASES = {
  starting: [
    "Broadly speaking, I would argue that...",
    "It depends on the context, but in many cases...",
    "There are two sides to this issue.",
  ],
  extending: [
    "One possible explanation is that...",
    "This can be seen in the way...",
    "At the same time, we should not ignore...",
  ],
  concluding: [
    "For that reason, I believe...",
    "So a balanced approach would be...",
    "Ultimately, the long-term impact depends on...",
  ],
};

const EVERYDAY_TIPS = [
  "Answer directly first, then add a reason and a small example. Uzbek: avval qisqa javob, keyin sabab va misol.",
  "Use natural fillers only when needed: 'Well', 'Let me think', 'I suppose'. Do not repeat them too often.",
  "Compare past and present when possible: this shows range and makes your answer longer naturally.",
  "Avoid memorised speeches. Use flexible phrases and adapt them to the exact question.",
];

const EVERYDAY_MISTAKES = [
  "Giving only one sentence with no reason or example.",
  "Translating directly from Uzbek and making the sentence sound unnatural.",
  "Using advanced words without knowing the exact meaning.",
  "Speaking too fast and losing pronunciation clarity.",
];

const CUE_CARD_TIPS = [
  "Use the first minute to write keywords only, not full sentences.",
  "Work through the four bullets in order — the examiner is checking that you cover all of them.",
  "Spend the most time on the final bullet: 'explain why' is where band 7+ answers separate themselves.",
  "Avoid memorised speeches. Use flexible phrases and adapt them to the exact card.",
];

const CUE_CARD_MISTAKES = [
  "Reading your notes like a script instead of speaking naturally.",
  "Finishing after 40 seconds because you give only basic facts.",
  "Skipping a bullet — this caps Task Response no matter how good the English is.",
  "Translating directly from Uzbek and making the sentence sound unnatural.",
];

const DISCUSSION_TIPS = [
  "Part 3 needs analysis, not personal stories only. Explain causes, effects, and comparisons.",
  "Use cautious language: 'tends to', 'can be', 'in many cases', 'to some extent'.",
  "Develop both sides briefly before giving your final opinion.",
  "Use examples from society, education, technology, or Uzbekistan when relevant.",
];

const DISCUSSION_MISTAKES = [
  "Answering Part 3 like Part 1 with short personal comments only.",
  "Giving a strong opinion without explaining the reason.",
  "Using memorised linking phrases that do not match the question.",
  "Ignoring the plural or abstract wording of the question.",
];

export const SPEAKING_PRACTICE_TOPICS: SpeakingTopic[] = [
  ...PART1_TOPICS.map((topic) => ({
    slug: topic.slug,
    part: "part1" as const,
    title: topic.title,
    description: topic.description,
    exchanges: topic.exchanges,
    vocabulary: GENERAL_VOCABULARY,
    phrases: EVERYDAY_PHRASES,
    tips: EVERYDAY_TIPS,
    mistakes: EVERYDAY_MISTAKES,
  })),
  ...PART2_TOPICS.map((topic) => ({
    slug: topic.slug,
    part: "part2" as const,
    title: topic.title,
    description: topic.description,
    // A cue card is a single long turn, so the question list is the card itself.
    exchanges: [{ question: topic.cueCard.instruction, answer: topic.cueCard.sample }],
    cueCard: topic.cueCard,
    vocabulary: GENERAL_VOCABULARY,
    phrases: EVERYDAY_PHRASES,
    tips: CUE_CARD_TIPS,
    mistakes: CUE_CARD_MISTAKES,
  })),
  ...PART3_TOPICS.map((topic) => ({
    slug: topic.slug,
    part: "part3" as const,
    title: topic.title,
    description: topic.description,
    exchanges: topic.exchanges,
    vocabulary: DISCUSSION_VOCABULARY,
    phrases: DISCUSSION_PHRASES,
    tips: DISCUSSION_TIPS,
    mistakes: DISCUSSION_MISTAKES,
    advanced: true,
  })),
];

export function speakingTopicsByPart(part: SpeakingPart) {
  return SPEAKING_PRACTICE_TOPICS.filter((topic) => topic.part === part);
}
