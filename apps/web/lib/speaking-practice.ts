import { CUE_CARD_DETAILS } from "./speaking-cue-cards";
import { PART1_COACHING } from "./speaking-part1-coaching";
import { PART1_CONTENT } from "./speaking-part1-content";
import { PART2_COACHING } from "./speaking-part2-coaching";
import { PART2_VOCABULARY } from "./speaking-part2-vocabulary";
import { PART3_COACHING } from "./speaking-part3-coaching";
import { PART3_CONTENT } from "./speaking-part3-content";
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
  /** Preparation prompts for the one-minute planning phase, shown under the
   *  cue card. Not exam questions — the label says so. */
  planning?: Array<{ question: string; answer: string }>;
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

// Phrases, tips and mistakes used to be three shared constants rendered
// identically on all 70 topics. They are now written per topic; see
// speaking-part{1,2,3}-coaching.ts.
export const SPEAKING_PRACTICE_TOPICS: SpeakingTopic[] = [
  ...EVERYDAY_TOPICS.map(([slug, title, description]) => ({
    slug,
    part: "part1" as const,
    title,
    description,
    questions: [...PART1_CONTENT[slug].questions],
    // One model answer per question, in the same order; see
    // speaking-part1-samples.ts for why they are no longer assembled from
    // shared sentence pools.
    sampleAnswers: buildPart1Samples(slug),
    vocabulary: [...PART1_CONTENT[slug].vocabulary],
    phrases: PART1_COACHING[slug].phrases,
    tips: [...PART1_COACHING[slug].tips],
    mistakes: [...PART1_COACHING[slug].mistakes],
  })),
  ...CUE_TOPICS.map(([slug, title]) => {
    const [longTurn, planNotes, planLanguage] = buildCueQuestionSamples(slug);
    const coaching = PART2_COACHING[slug];
    return {
      slug,
      part: "part2" as const,
      title,
      // Written per card. Every card used to share one template built from the
      // theme slug, so all twenty read "Cue-card practice about ...".
      description: coaching.description,
      // A cue card is one long turn, so there is a single question: the card.
      // The other two entries were preparation guidance sitting in a list the
      // cue-card view never renders, and they re-used the theme slug, producing
      // "this people story" and "this place story".
      questions: [title],
      sampleAnswers: [longTurn],
      cueSample: longTurn,
      planning: [
        {
          question: "What would you write in the one minute?",
          answer: planNotes,
        },
        {
          question: "Which language will help you describe it clearly?",
          answer: planLanguage,
        },
      ],
      cueCard: {
        instruction: title,
        // Bullets and follow-ups are written per card; see speaking-cue-cards.ts
        // for why they are no longer derived from the theme slug.
        prompts: [...CUE_CARD_DETAILS[slug].prompts],
        followUps: [...CUE_CARD_DETAILS[slug].followUps],
      },
      vocabulary: [...PART2_VOCABULARY[slug]],
      phrases: coaching.phrases,
      tips: [...coaching.tips],
      mistakes: [...coaching.mistakes],
    };
  }),
  ...DISCUSSION_TOPICS.map(([slug, title, description]) => ({
    slug,
    part: "part3" as const,
    title,
    description,
    questions: [...PART3_CONTENT[slug].questions],
    // One model answer per question, in the same order; see
    // speaking-part3-samples.ts.
    sampleAnswers: buildPart3Samples(slug),
    vocabulary: [...PART3_CONTENT[slug].vocabulary],
    phrases: PART3_COACHING[slug].phrases,
    tips: [...PART3_COACHING[slug].tips],
    mistakes: [...PART3_COACHING[slug].mistakes],
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
