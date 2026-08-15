/** Per-card bullet points and follow-up questions for Part 2.
 *
 *  These used to be generated: bullets 2-4 were the same three lines on every
 *  card ("when it happened", "who was with you", "why this memory is important"),
 *  which is wrong for a card about an object, a place, or a future job — and the
 *  follow-ups were built from the raw theme slug, producing questions like
 *  "Do people in your country often talk about people?".
 *
 *  Each card now states what an examiner would actually ask for.
 */
export interface CueCardDetail {
  prompts: readonly [string, string, string, string];
  followUps: readonly [string, string];
}

export const CUE_CARD_DETAILS: Record<string, CueCardDetail> = {
  "memorable-trip": {
    prompts: [
      "where you went",
      "when you went there and how long you stayed",
      "who you travelled with",
      "and explain why the trip was memorable for you",
    ],
    followUps: [
      "Why do you think travel appeals to so many young people today?",
      "Do people learn more from travelling independently or on organised tours?",
    ],
  },
  "helpful-person": {
    prompts: [
      "who this person is and how you know them",
      "what the situation was",
      "what they did to help you",
      "and explain how their help affected you",
    ],
    followUps: [
      "Why are some people more willing to help strangers than others?",
      "Should schools do more to teach young people to support each other?",
    ],
  },
  "useful-app": {
    prompts: [
      "what the app or website is and what it does",
      "how you first started using it",
      "how often you use it and what you use it for",
      "and explain why it is useful to you",
    ],
    followUps: [
      "Do you think people rely too heavily on apps for everyday tasks?",
      "How has the way people learn new skills changed because of the internet?",
    ],
  },
  "special-meal": {
    prompts: [
      "what the occasion was",
      "where you had the meal and who was there",
      "what food was served",
      "and explain why you enjoyed it so much",
    ],
    followUps: [
      "Why do so many celebrations around the world centre on food?",
      "Are family meals becoming less common in your country?",
    ],
  },
  "important-decision": {
    prompts: [
      "what the decision was",
      "what other options you were considering",
      "how you went about making it",
      "and explain what the result of the decision has been",
    ],
    followUps: [
      "Are young people today under more pressure when choosing a career?",
      "Is it better to make decisions quickly or to take a long time over them?",
    ],
  },
  "quiet-place": {
    prompts: [
      "where this place is",
      "what it looks like and what makes it quiet",
      "how often you go there and what you do",
      "and explain why you like spending time there",
    ],
    followUps: [
      "Why is it becoming harder to find quiet places in modern cities?",
      "Do people need silence, or have they simply got used to constant noise?",
    ],
  },
  "skill-learned": {
    prompts: [
      "what the skill is",
      "why you decided to learn it",
      "how you learned it and how difficult it was",
      "and explain how this skill has been useful to you",
    ],
    followUps: [
      "Is it better to learn practical skills at school or outside it?",
      "Why do many adults find it harder to learn new skills than children do?",
    ],
  },
  "interesting-book": {
    prompts: [
      "what the book was and what it was about",
      "how you came across it",
      "what you found most interesting about it",
      "and explain whether you would recommend it to others",
    ],
    followUps: [
      "Do you think reading habits are changing in your country?",
      "Can films and documentaries replace books as a way of learning?",
    ],
  },
  "family-celebration": {
    prompts: [
      "what the celebration was for",
      "how your family prepared for it",
      "what happened during the celebration",
      "and explain why this celebration is important to your family",
    ],
    followUps: [
      "How have traditional celebrations changed in your country recently?",
      "Is it important for families to keep old customs alive?",
    ],
  },
  "good-advice": {
    prompts: [
      "what the advice was",
      "who gave it to you and in what situation",
      "whether you followed it immediately or later",
      "and explain what difference the advice made",
    ],
    followUps: [
      "Why do people often ignore advice even when they know it is good?",
      "Who do young people in your country turn to for advice these days?",
    ],
  },
  "expensive-item": {
    prompts: [
      "what you bought and roughly what it cost",
      "why you decided to buy it",
      "how you paid for it or saved up for it",
      "and explain whether you think it was worth the money",
    ],
    followUps: [
      "Do you think young people today are careful with money?",
      "Why are some people willing to pay much more for well-known brands?",
    ],
  },
  "sport-event": {
    prompts: [
      "what the event was and which teams or people took part",
      "where you watched it and who you were with",
      "what happened during the event",
      "and explain why you remember it",
    ],
    followUps: [
      "Why do people become so emotionally involved in watching sport?",
      "Should governments spend public money on hosting major sporting events?",
    ],
  },
  "old-photo": {
    prompts: [
      "what can be seen in the photograph",
      "when and where it was taken",
      "how you came to have it",
      "and explain why this photograph means something to you",
    ],
    followUps: [
      "Has the meaning of photographs changed now that everyone carries a camera?",
      "Do you think future generations will keep printed photographs at all?",
    ],
  },
  "city-you-like": {
    prompts: [
      "which city it is and where it is located",
      "how you first heard about it",
      "what you would like to do and see there",
      "and explain why you particularly want to visit this city",
    ],
    followUps: [
      "Does international tourism generally benefit the cities that receive it?",
      "Do you think virtual tours could ever replace visiting a place in person?",
    ],
  },
  "difficult-task": {
    prompts: [
      "what the task was",
      "why it was difficult for you",
      "how you managed to complete it",
      "and explain how you felt after finishing it",
    ],
    followUps: [
      "Do people learn more from difficulties than from easy successes?",
      "Should young people be given more responsibility earlier than they are now?",
    ],
  },
  "creative-person": {
    prompts: [
      "who this person is",
      "what kind of creative work they do",
      "how they came to develop this talent",
      "and explain what you admire about their creativity",
    ],
    followUps: [
      "Is creativity something people are born with, or can it be taught?",
      "Do schools in your country give enough space to creative subjects?",
    ],
  },
  "useful-object": {
    prompts: [
      "what the object is and what it looks like",
      "how long you have had it and where it came from",
      "what you use it for",
      "and explain why it is so useful to you",
    ],
    followUps: [
      "Why do people in modern homes own far more possessions than in the past?",
      "Is it better to repair household items or to replace them?",
    ],
  },
  "film-recommendation": {
    prompts: [
      "what the film is about",
      "when and how you saw it",
      "what you liked most about it",
      "and explain who you would recommend it to and why",
    ],
    followUps: [
      "Why do some films become popular in many different countries?",
      "Do films influence the way people see other cultures?",
    ],
  },
  "environmental-problem": {
    prompts: [
      "what the problem is",
      "what you think is causing it",
      "how it affects local people",
      "and explain what you think could be done about it",
    ],
    followUps: [
      "Should responsibility for environmental problems lie with individuals or governments?",
      "Why do people often ignore environmental warnings until a problem becomes serious?",
    ],
  },
  "future-job": {
    prompts: [
      "what the job is and what it involves",
      "why this job appeals to you",
      "what qualifications or experience it requires",
      "and explain what you are doing now to prepare for it",
    ],
    followUps: [
      "Are young people in your country free to choose their own careers?",
      "How do you think the jobs available today will change in twenty years?",
    ],
  },
};
