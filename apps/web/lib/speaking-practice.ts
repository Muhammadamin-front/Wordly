import { CUE_CARD_DETAILS } from "./speaking-cue-cards";
import {
  buildCueQuestionSamples,
  buildPart1Samples,
  buildPart3Samples,
} from "./speaking-sample-content";

export type SpeakingPart = "part1" | "part2" | "part3";

export interface SpeakingVocabularyItem {
  word: string;
  uz: string;
  definition: string;
  example: string;
}

export interface SpeakingTopic {
  slug: string;
  part: SpeakingPart;
  title: string;
  description: string;
  questions: string[];
  vocabulary: SpeakingVocabularyItem[];
  phrases: {
    starting: string[];
    extending: string[];
    concluding: string[];
  };
  tips: string[];
  mistakes: string[];
  sampleAnswers: string[];
  cueCard?: {
    instruction: string;
    prompts: string[];
    followUps: string[];
  };
  cueSample?: string;
  advanced?: boolean;
}

const EVERYDAY_TOPICS = [
  ["work-study", "Work / Study", "Talk about what you do, your routine, and your future plans."],
  ["hometown", "Hometown", "Describe where you are from and what makes it memorable."],
  ["home", "Home", "Speak about your house, room, and ideal place to live."],
  ["friends", "Friends", "Discuss friendship, social habits, and people you trust."],
  ["music", "Music", "Talk about songs, artists, concerts, and listening habits."],
  ["movies", "Movies", "Share opinions about films, cinemas, and stories you enjoy."],
  ["food", "Food", "Describe meals, restaurants, cooking, and local dishes."],
  ["shopping", "Shopping", "Discuss shopping habits, online stores, and street markets."],
  ["sports", "Sports", "Talk about fitness, competitions, and sports you watch or play."],
  ["technology", "Technology", "Discuss devices, apps, online learning, and digital habits."],
  ["books", "Books", "Talk about reading habits, favourite genres, and useful books."],
  ["holidays", "Holidays", "Describe trips, celebrations, and how you like to relax."],
  ["weather", "Weather", "Talk about seasons, climate, and how weather affects your mood."],
  ["neighbours", "Neighbours", "Discuss people living nearby and community life."],
  ["clothes", "Clothes", "Talk about style, comfortable clothes, and shopping for fashion."],
  ["pets", "Pets", "Describe animals, pet care, and why people keep pets."],
  ["photography", "Photography", "Discuss taking photos, memories, and social media pictures."],
  ["social-media", "Social Media", "Talk about online platforms, sharing, and screen time."],
  ["running", "Running", "Describe exercise habits, health benefits, and motivation."],
  ["cooking", "Cooking", "Talk about recipes, family meals, and learning to cook."],
  ["travelling", "Travelling", "Discuss journeys, transport, and places you want to visit."],
  ["daily-routine", "Daily Routine", "Explain your usual day, habits, and time management."],
  ["teachers", "Teachers", "Talk about teachers, learning style, and good explanations."],
  ["public-transport", "Public Transport", "Discuss buses, trains, commuting, and city movement."],
  ["art", "Art", "Share opinions about drawing, museums, design, and creativity."],
  ["money", "Money", "Talk about saving, spending, cash, and digital payments."],
  ["health", "Health", "Discuss healthy habits, sleep, stress, and exercise."],
  ["language-learning", "Language Learning", "Talk about English study, motivation, and progress."],
  ["childhood", "Childhood", "Describe memories, games, school days, and family life."],
  ["weekends", "Weekends", "Talk about free time, plans, rest, and social activities."],
] as const;

const CUE_TOPICS = [
  ["memorable-trip", "Describe a memorable trip you took", "travel", "where you went"],
  ["helpful-person", "Describe a person who helped you", "people", "who the person was"],
  ["useful-app", "Describe an app or website you often use", "technology", "what it does"],
  ["special-meal", "Describe a special meal you enjoyed", "food", "where you ate it"],
  ["important-decision", "Describe an important decision you made", "life", "what the decision was"],
  ["quiet-place", "Describe a quiet place you like", "place", "where it is"],
  ["skill-learned", "Describe a skill you learned", "learning", "what the skill was"],
  ["interesting-book", "Describe an interesting book you read", "books", "what it was about"],
  ["family-celebration", "Describe a family celebration", "events", "what you celebrated"],
  ["good-advice", "Describe a piece of advice you received", "communication", "what the advice was"],
  ["expensive-item", "Describe something expensive you bought", "shopping", "what you bought"],
  ["sport-event", "Describe a sports event you watched", "sports", "what happened"],
  ["old-photo", "Describe an old photo you like", "memories", "what is in the photo"],
  ["city-you-like", "Describe a city you would like to visit", "travel", "which city it is"],
  ["difficult-task", "Describe a difficult task you completed", "work", "what the task was"],
  ["creative-person", "Describe a creative person you know", "people", "what they create"],
  ["useful-object", "Describe a useful object at home", "home", "what it is"],
  ["film-recommendation", "Describe a film you would recommend", "movies", "what the film is about"],
  ["environmental-problem", "Describe an environmental problem in your area", "environment", "what the problem is"],
  ["future-job", "Describe a job you would like to do in the future", "work", "what the job is"],
] as const;

const DISCUSSION_TOPICS = [
  ["travel-and-culture", "Travel and Culture", "Discuss how travel changes people and societies."],
  ["education-systems", "Education Systems", "Compare modern education, exams, and practical skills."],
  ["technology-and-society", "Technology and Society", "Discuss how digital tools affect work, learning, and relationships."],
  ["cities-and-transport", "Cities and Transport", "Explore urban life, commuting, pollution, and planning."],
  ["health-and-lifestyle", "Health and Lifestyle", "Discuss responsibility, prevention, stress, and public health."],
  ["environment", "Environment", "Talk about climate, waste, conservation, and individual action."],
  ["work-and-careers", "Work and Careers", "Discuss motivation, remote work, salaries, and career choice."],
  ["media-and-advertising", "Media and Advertising", "Explore influence, trust, online ads, and consumer behaviour."],
  ["family-and-generations", "Family and Generations", "Discuss family roles, age differences, and social change."],
  ["friendship-and-community", "Friendship and Community", "Talk about trust, loneliness, neighbours, and belonging."],
  ["money-and-success", "Money and Success", "Discuss wealth, ambition, happiness, and financial education."],
  ["art-and-creativity", "Art and Creativity", "Explore culture, design, museums, and creative industries."],
  ["food-and-globalisation", "Food and Globalisation", "Discuss diets, traditional food, fast food, and global brands."],
  ["sports-and-discipline", "Sports and Discipline", "Talk about teamwork, competition, health, and role models."],
  ["books-and-reading", "Books and Reading", "Discuss reading habits, digital books, libraries, and imagination."],
  ["language-and-identity", "Language and Identity", "Explore English learning, culture, accents, and communication."],
  ["shopping-and-consumption", "Shopping and Consumption", "Talk about online shopping, waste, brands, and needs."],
  ["crime-and-safety", "Crime and Safety", "Discuss public safety, prevention, technology, and responsibility."],
  ["science-and-innovation", "Science and Innovation", "Explore research, medicine, AI, and ethical limits."],
  ["tradition-and-modern-life", "Tradition and Modern Life", "Discuss customs, change, heritage, and young people."],
] as const;

const BASE_VOCABULARY: SpeakingVocabularyItem[] = [
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

const ADVANCED_VOCABULARY: SpeakingVocabularyItem[] = [
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

const PHRASES = {
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

const TIPS = [
  "Answer directly first, then add a reason and a small example. Uzbek: avval qisqa javob, keyin sabab va misol.",
  "Use natural fillers only when needed: 'Well', 'Let me think', 'I suppose'. Do not repeat them too often.",
  "Compare past and present when possible: this shows range and makes your answer longer naturally.",
  "Avoid memorised speeches. Use flexible phrases and adapt them to the exact question.",
];

const MISTAKES = [
  "Giving only one sentence with no reason or example.",
  "Translating directly from Uzbek and making the sentence sound unnatural.",
  "Using advanced words without knowing the exact meaning.",
  "Speaking too fast and losing pronunciation clarity.",
];

function everydayQuestions(topic: string): string[] {
  return [
    `Do you enjoy talking about ${topic.toLowerCase()}? Why or why not?`,
    `How often does ${topic.toLowerCase()} appear in your daily life?`,
    `Did you feel differently about ${topic.toLowerCase()} when you were younger?`,
    `What do people in your country usually think about ${topic.toLowerCase()}?`,
    `Is ${topic.toLowerCase()} more important now than in the past?`,
    `Would you like to learn more about ${topic.toLowerCase()} in the future?`,
    `Can you give an example related to ${topic.toLowerCase()} from your own life?`,
  ];
}

function discussionQuestions(topic: string): string[] {
  return [
    `Why do some people consider ${topic.toLowerCase()} important in modern life?`,
    `How has ${topic.toLowerCase()} changed compared with the past?`,
    `What are the advantages and disadvantages connected with ${topic.toLowerCase()}?`,
    `Do you think governments should do more in this area? Why?`,
    `How might this topic affect young people differently from older people?`,
    `What changes do you expect to see in the next ten years?`,
    `Can education help people make better decisions about this issue?`,
    `Is this mostly an individual responsibility or a social responsibility?`,
  ];
}

export const SPEAKING_PRACTICE_TOPICS: SpeakingTopic[] = [
  ...EVERYDAY_TOPICS.map(([slug, title, description], topicIndex) => ({
    slug,
    part: "part1" as const,
    title,
    description,
    questions: everydayQuestions(title),
    sampleAnswers: buildPart1Samples(slug, topicIndex),
    vocabulary: BASE_VOCABULARY,
    phrases: PHRASES,
    tips: TIPS,
    mistakes: MISTAKES,
  })),
  ...CUE_TOPICS.map(([slug, title, theme], topicIndex) => {
    const sampleAnswers = buildCueQuestionSamples(slug, topicIndex);
    return {
      slug,
      part: "part2" as const,
      title,
      description: `Cue-card practice about ${theme}, with a one-minute plan and a two-minute answer.`,
      questions: [
        title,
        `What details would make this ${theme} story more personal?`,
        `Which vocabulary can help you describe this ${theme} clearly?`,
      ],
      sampleAnswers,
      cueSample: sampleAnswers[0],
      cueCard: {
        instruction: title,
        // Bullets and follow-ups are written per card; see speaking-cue-cards.ts
        // for why they are no longer derived from the theme slug.
        prompts: [...CUE_CARD_DETAILS[slug].prompts],
        followUps: [...CUE_CARD_DETAILS[slug].followUps],
      },
      vocabulary: BASE_VOCABULARY,
      phrases: PHRASES,
      tips: [
        "Use the first minute to write keywords only, not full sentences.",
        "Organise your answer as past → details → feelings → final reflection.",
        ...TIPS.slice(1, 3),
      ],
      mistakes: [
        "Reading your notes like a script instead of speaking naturally.",
        "Finishing after 40 seconds because you give only basic facts.",
        ...MISTAKES.slice(1, 3),
      ],
    };
  }),
  ...DISCUSSION_TOPICS.map(([slug, title, description], topicIndex) => ({
    slug,
    part: "part3" as const,
    title,
    description,
    questions: discussionQuestions(title),
    sampleAnswers: buildPart3Samples(slug, topicIndex),
    vocabulary: ADVANCED_VOCABULARY,
    phrases: {
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
    },
    tips: [
      "Part 3 needs analysis, not personal stories only. Explain causes, effects, and comparisons.",
      "Use cautious language: 'tends to', 'can be', 'in many cases', 'to some extent'.",
      "Develop both sides briefly before giving your final opinion.",
      "Use examples from society, education, technology, or Uzbekistan when relevant.",
    ],
    mistakes: [
      "Answering Part 3 like Part 1 with short personal comments only.",
      "Giving a strong opinion without explaining the reason.",
      "Using memorised linking phrases that do not match the question.",
      "Ignoring the plural or abstract wording of the question.",
    ],
    advanced: true,
  })),
];

export function speakingTopicsByPart(part: SpeakingPart) {
  return SPEAKING_PRACTICE_TOPICS.filter((topic) => topic.part === part);
}

export function sampleAnswer(topic: SpeakingTopic, question: string) {
  if (topic.part === "part2" && question === topic.cueCard?.instruction) {
    return topic.cueSample ?? topic.sampleAnswers[0];
  }
  const questionIndex = topic.questions.indexOf(question);
  return topic.sampleAnswers[questionIndex >= 0 ? questionIndex : 0];
}
