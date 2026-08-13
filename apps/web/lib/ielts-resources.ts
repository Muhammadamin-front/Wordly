import localizedIelts from "./ielts-localized.json";

export type IeltsSkill = "reading" | "listening" | "writing" | "speaking";

export interface IeltsResourceSection {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  steps?: string[];
  traps?: string[];
  example?: string;
  vocabulary?: string[];
}

export interface IeltsSkillContent {
  title: string;
  eyebrow: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  sections: IeltsResourceSection[];
}

export const SPEAKING_TOPICS: Record<string, string[]> = {
  "People & relationships": [
    "A person who inspires you",
    "A family member you admire",
    "A teacher who helped you",
    "An interesting neighbour",
    "A friend from childhood",
    "A person who speaks well",
    "Someone who is good at their job",
    "A person you recently met",
    "Someone you would like to work with",
    "A public figure you respect",
  ],
  "Places & travel": [
    "A city you would revisit",
    "A quiet place you enjoy",
    "A crowded place",
    "A historical building",
    "A beautiful natural place",
    "A memorable journey",
    "A long car trip",
    "A place near water",
    "A shop you often visit",
    "A country you want to explore",
  ],
  "Study & work": [
    "A useful course",
    "A difficult subject",
    "Your ideal workplace",
    "A skill you learned",
    "A group project",
    "A successful presentation",
    "A job that helps society",
    "A future career",
    "A productive routine",
    "A time you solved a problem",
  ],
  "Technology": [
    "A useful app",
    "A website you visit",
    "Technology at school",
    "A device you cannot live without",
    "A time technology failed",
    "Online communication",
    "Artificial intelligence",
    "Digital privacy",
    "Social media habits",
    "Future transport",
  ],
  "Culture & media": [
    "A film you recommend",
    "A book that changed your view",
    "A song you remember",
    "A traditional celebration",
    "A museum you visited",
    "A photograph you value",
    "A live performance",
    "A story from your culture",
    "A foreign language film",
    "A piece of art",
  ],
  "Daily life": [
    "Your morning routine",
    "A meal you can cook",
    "A useful household object",
    "A busy day",
    "A healthy habit",
    "A recent purchase",
    "A time you were late",
    "A difficult decision",
    "A promise you kept",
    "A pleasant surprise",
  ],
  "Nature & environment": [
    "Your favourite season",
    "An environmental problem",
    "A wild animal",
    "A park in your city",
    "A type of weather you enjoy",
    "Recycling at home",
    "Public green spaces",
    "Water conservation",
    "A natural disaster",
    "Sustainable travel",
  ],
  "Society": [
    "Public transport",
    "Life in big cities",
    "An important law",
    "Volunteering",
    "Equal opportunities",
    "Local businesses",
    "The generation gap",
    "Community events",
    "A social change",
    "The value of public libraries",
  ],
  "Health & sport": [
    "A sport you enjoy",
    "A healthy lifestyle",
    "A sports event",
    "A physical challenge",
    "Sleep habits",
    "Mental wellbeing",
    "Healthy food at school",
    "Team sports",
    "Walking in cities",
    "A fitness goal",
  ],
  "Ideas & experiences": [
    "A goal you achieved",
    "A mistake you learned from",
    "A difficult challenge",
    "A time you helped someone",
    "A useful piece of advice",
    "A time you changed your mind",
    "Something that made you proud",
    "A new experience",
    "A time you waited for something",
    "A memorable conversation",
  ],
  "Objects & possessions": [
    "A gift you received",
    "An old object at home",
    "A useful piece of clothing",
    "Something you made",
    "A photo on your phone",
    "A valuable possession",
    "A toy from childhood",
    "A piece of technology",
    "A book you own",
    "Something you borrowed",
  ],
  "Future & change": [
    "A skill you want to learn",
    "A city of the future",
    "Your plans for next year",
    "A habit you want to change",
    "A future invention",
    "A place you hope to live",
    "A subject you want to study",
    "A business idea",
    "A future celebration",
    "A positive change in society",
  ],
};

const SPEAKING_SECTIONS: IeltsResourceSection[] = [
  {
    id: "sample-answer",
    eyebrow: "Band 8 sample",
    title: "Describe a person who inspires you",
    description:
      "A natural answer follows a simple arc: identify the person, explain the connection, give one concrete story, then reflect on the influence.",
    steps: [
      "Open directly: “The person who has had the greatest influence on me is...”",
      "Anchor the answer in one specific memory instead of listing qualities.",
      "Use past tense for the story and present perfect for the continuing influence.",
      "Finish with reflection: “What I admire most is...”",
    ],
    example:
      "The person who has had the greatest influence on me is my secondary-school English teacher. What set her apart was her ability to make every student feel capable. I vividly remember struggling with my first presentation; rather than correcting every mistake, she helped me organise my ideas and speak with confidence. That experience completely changed the way I approach difficult tasks. What I admire most is that she was demanding without ever being discouraging, and I still draw on her advice whenever I have to speak in public.",
    vocabulary: [
      "have a lasting influence",
      "set someone apart",
      "draw on advice",
      "approach a challenge",
      "demanding but encouraging",
    ],
  },
  {
    id: "native-phrases",
    eyebrow: "Natural language",
    title: "Examiner's favourite expressions",
    description:
      "These phrases organise ideas and sound natural when they introduce real content. Use one or two, not all of them in every answer.",
    vocabulary: [
      "What immediately comes to mind is...",
      "The main reason I say that is...",
      "What set it apart was...",
      "Looking back, I realise that...",
      "I wouldn't go so far as to say..., but...",
      "It had a lasting impact on me.",
      "There is a lot to be said for...",
      "It is something I have grown to appreciate.",
    ],
  },
  {
    id: "say-this",
    eyebrow: "Lexical upgrade",
    title: "Stop saying... Say this instead",
    description:
      "Upgrade vague words only when the stronger phrase matches your meaning.",
    vocabulary: [
      "very good → genuinely impressive / highly effective",
      "very bad → deeply frustrating / seriously harmful",
      "I like it → I am particularly fond of it",
      "it is important → it plays a crucial role",
      "a lot of people → a broad cross-section of people",
      "I think → from my perspective / I would argue that",
      "it changed me → it reshaped the way I see...",
      "I was happy → I was genuinely delighted",
    ],
  },
  {
    id: "follow-ups",
    eyebrow: "Part 3",
    title: "Useful follow-up question patterns",
    description:
      "Part 3 rewards developed reasoning. Answer, explain why, give an example, then qualify your point.",
    steps: [
      "Why do you think this has changed over time?",
      "Who should be mainly responsible for this issue?",
      "Is this trend equally common among all age groups?",
      "What might happen if nothing is done?",
      "How does the situation differ between cities and rural areas?",
    ],
    example:
      "I would say local authorities bear most of the responsibility because they control planning and public services. That said, individuals still have a role to play, particularly through their daily choices.",
  },
  {
    id: "fluency",
    eyebrow: "Delivery",
    title: "Fluency, grammar and pronunciation",
    description:
      "Fluency is controlled continuity, not speaking as fast as possible. Give yourself small planning pauses and stress the content words.",
    steps: [
      "Use thought groups of 5–9 words and pause between ideas, not inside phrases.",
      "Mix simple sentences with relative clauses, conditionals and participle clauses.",
      "Practise contrastive stress: “I said Tuesday, not Thursday.”",
      "Record one two-minute answer daily and listen for repetition and unfinished sentences.",
    ],
    traps: [
      "Memorised openings that do not answer the question",
      "Using idioms in every sentence",
      "Restarting after every small grammar error",
      "Speaking quickly with flat intonation",
    ],
  },
];

const WRITING_SECTIONS: IeltsResourceSection[] = [
  {
    id: "task-2-opinion",
    eyebrow: "Band 9 model",
    title: "Task 2: Opinion essay",
    description:
      "A strong opinion essay gives a clear position in the introduction and develops two distinct reasons rather than repeating the thesis.",
    steps: [
      "Introduction: paraphrase the issue and state a precise position.",
      "Body 1: claim → explanation → specific example → link to the question.",
      "Body 2: develop a different reason or address the strongest counterargument.",
      "Conclusion: restate the position without introducing a new idea.",
    ],
    example:
      "Although remote work can weaken informal collaboration, its broader advantages are more significant. In particular, flexible working arrangements allow firms to recruit beyond their immediate location and enable employees to organise demanding tasks around periods of peak concentration. Provided that teams maintain clear communication routines, productivity and job satisfaction are therefore likely to improve.",
    vocabulary: [
      "flexible working arrangements",
      "informal collaboration",
      "a broader talent pool",
      "peak concentration",
      "maintain clear routines",
    ],
  },
  {
    id: "task-2-discussion",
    eyebrow: "Essay type",
    title: "Discussion + opinion",
    description:
      "Present both views fairly before making your own judgement. A discussion is not two unrelated opinion paragraphs.",
    steps: [
      "Explain why reasonable people support view A.",
      "Explain the logic and limits of view B.",
      "State your own position in the introduction and reinforce it in the conclusion.",
    ],
    example:
      "Those who favour free university education argue that tuition fees prevent capable students from low-income families from studying. Others contend that universal subsidies are costly and may benefit wealthy households unnecessarily. In my view, targeted financial support offers a fairer and more sustainable compromise.",
    vocabulary: ["advocates contend", "critics point out", "targeted support", "a sustainable compromise"],
  },
  {
    id: "task-2-problems",
    eyebrow: "Essay type",
    title: "Problems, solutions and double questions",
    description:
      "Match every solution to a cause you have already explained. Generic recommendations rarely score well.",
    steps: [
      "Name the problem precisely and show who is affected.",
      "Explain the mechanism that creates the problem.",
      "Propose an actor, an action and an expected result.",
      "For double questions, give each question a separate body paragraph.",
    ],
    example:
      "One practical response would be for city councils to introduce integrated ticketing across buses and trains. By making transfers cheaper and simpler, this measure would remove a major barrier to public-transport use.",
  },
  {
    id: "task-1-visuals",
    eyebrow: "Task 1",
    title: "Charts, tables and mixed visuals",
    description:
      "The overview carries the most value. Identify the dominant pattern and the most meaningful contrast before adding numbers.",
    steps: [
      "Introduction: paraphrase what the visual shows.",
      "Overview: report 2–3 major features with no detailed figures.",
      "Details: group similar trends; never describe every number in order.",
      "Compare with “whereas”, “by contrast”, “roughly twice as high” and “respectively”.",
    ],
    example:
      "Overall, car ownership rose in all three countries, although the increase was considerably sharper in Country A. By 2020, its figure had reached 68%, compared with just over half in the other two nations.",
    vocabulary: ["a marked increase", "remain broadly stable", "reach a peak", "respectively", "a widening gap"],
  },
  {
    id: "task-1-process",
    eyebrow: "Task 1",
    title: "Processes and maps",
    description:
      "Process reports need sequencing and passive structures; maps need location language and a clear account of change.",
    steps: [
      "Process: state the number of stages and where the sequence begins and ends.",
      "Use passive forms when the actor is irrelevant: “The material is heated...”",
      "Map: group changes by zone and distinguish additions, removals and conversions.",
      "Use “to the north of”, “adjacent to”, “was replaced by” and “was converted into”.",
    ],
    example:
      "Overall, the site was transformed from a largely industrial area into a mixed residential district. The warehouse in the north was demolished and replaced by apartment blocks, while the riverside was converted into public parkland.",
  },
  {
    id: "score-analysis",
    eyebrow: "Why Band 8–9",
    title: "What examiners reward",
    description:
      "High-band writing is clear before it is impressive. Vocabulary and grammar must sharpen meaning, not decorate it.",
    steps: [
      "Task response: every paragraph advances a clear answer.",
      "Coherence: progression is logical and referencing is easy to follow.",
      "Lexical resource: precise collocations, controlled paraphrase and few spelling errors.",
      "Grammar: a flexible range with most sentences error-free.",
    ],
    traps: [
      "Memorised template sentences",
      "Forced rare words",
      "A conclusion that introduces a new argument",
      "Long sentences with unclear control",
    ],
  },
];

const READING_SECTIONS: IeltsResourceSection[] = [
  {
    id: "matching-headings",
    eyebrow: "Question guide",
    title: "Matching headings",
    description:
      "Match the central purpose of a paragraph, not one repeated keyword.",
    steps: [
      "Read the first and last sentence, then identify the paragraph's main move.",
      "Reduce each heading to its core idea.",
      "Eliminate headings that describe only a detail.",
      "Confirm the match by checking the whole paragraph.",
    ],
    traps: ["A heading repeats one noun from the paragraph", "Two headings share vocabulary but only one matches the purpose"],
    example: "Paragraph: several failed attempts followed by a successful trial. Best heading: “A breakthrough after early setbacks.”",
  },
  {
    id: "tfng",
    eyebrow: "Question guide",
    title: "True / False / Not Given",
    description:
      "True agrees with the text; False contradicts it; Not Given cannot be proved or disproved.",
    steps: [
      "Underline the claim's subject, verb and limiting words.",
      "Locate the relevant sentence through synonyms.",
      "Compare meaning, especially quantities and degree.",
      "Choose Not Given when the text is silent about one essential part.",
    ],
    traps: ["Assuming a statement is true from general knowledge", "Treating a partial match as True"],
  },
  {
    id: "ynng",
    eyebrow: "Question guide",
    title: "Yes / No / Not Given",
    description:
      "This version tests the writer's views rather than factual information. Find the author's judgement.",
    steps: [
      "Identify opinion markers such as argues, doubts, supports and warns.",
      "Separate the writer's view from a quoted researcher's view.",
      "Check whether the strength of the opinion matches.",
    ],
  },
  {
    id: "completion",
    eyebrow: "Question guide",
    title: "Sentence and summary completion",
    description:
      "Grammar predicts the missing word type; the text supplies the exact answer.",
    steps: [
      "Check the word limit before reading.",
      "Predict noun, verb, adjective or number from the gap.",
      "Scan for paraphrases of the words around the gap.",
      "Copy the answer exactly and check singular/plural agreement.",
    ],
    traps: ["Exceeding the word limit", "Changing a word from the passage", "Ignoring grammar around the gap"],
  },
  {
    id: "multiple-choice",
    eyebrow: "Question guide",
    title: "Multiple choice",
    description:
      "Treat each option as a claim to verify. Distractors are often partly true but answer a different question.",
    steps: [
      "Read the stem without the options and predict the answer area.",
      "Find evidence before comparing options.",
      "Eliminate answers with wrong scope, cause or time.",
      "Choose the option supported by the whole sentence, not one matching word.",
    ],
  },
  {
    id: "paragraph-information",
    eyebrow: "Question guide",
    title: "Matching paragraph information",
    description:
      "You are locating a specific detail, example, comparison or explanation. Paragraphs may be used more than once.",
    steps: [
      "Circle distinctive names, dates and technical phrases.",
      "Convert abstract statements into likely synonyms.",
      "Scan paragraph by paragraph and record used letters carefully.",
    ],
  },
  {
    id: "short-answer",
    eyebrow: "Question guide",
    title: "Short answer questions",
    description:
      "Answer with words from the passage and obey the word limit exactly.",
    steps: [
      "Turn the question into a keyword map.",
      "Locate the answer area using names or paraphrases.",
      "Check that your phrase answers who, what, where, when or why.",
    ],
  },
  {
    id: "synonyms",
    eyebrow: "Vocabulary",
    title: "High-frequency reading synonyms",
    description:
      "IELTS rarely repeats the question wording in the passage. Build synonym families, not isolated pairs.",
    vocabulary: [
      "increase ↔ rise / grow / climb",
      "important ↔ significant / crucial",
      "buy ↔ purchase / acquire",
      "begin ↔ commence / initiate",
      "show ↔ demonstrate / indicate",
      "difficult ↔ challenging / demanding",
      "young ↔ adolescent / juvenile",
      "old ↔ elderly / ageing",
      "dangerous ↔ hazardous / risky",
      "help ↔ assist / facilitate",
      "reduce ↔ curb / diminish",
      "change ↔ alter / transform",
    ],
  },
];

const LISTENING_SECTIONS: IeltsResourceSection[] = [
  {
    id: "distractors",
    eyebrow: "Core strategy",
    title: "Recognise common distractors",
    description:
      "Speakers often mention one answer, correct themselves, then give the final answer.",
    steps: [
      "Listen for correction signals: actually, rather, I mean, sorry, instead.",
      "Keep listening after the first matching word.",
      "Write the final confirmed information only.",
    ],
    example: "“The meeting is on Thursday — sorry, I mean Tuesday the thirteenth.” Answer: Tuesday 13th.",
  },
  {
    id: "numbers-dates",
    eyebrow: "Section 1",
    title: "Numbers, dates and addresses",
    description:
      "Train sound contrasts and formatting before full tests.",
    vocabulary: [
      "thirteen / thirty",
      "fifteen / fifty",
      "double six / zero / oh",
      "14 March / March the 14th",
      "£4.50 / four pounds fifty",
      "B as in Bravo",
    ],
    traps: ["Writing a currency symbol when only a number is required", "Missing plural -s in dates or units"],
  },
  {
    id: "maps",
    eyebrow: "Visual task",
    title: "Maps and directions",
    description:
      "Orient yourself before the audio starts and follow movement from the stated entrance.",
    steps: [
      "Mark the compass, entrance and fixed landmarks.",
      "Track phrases such as opposite, beyond, at the far end and immediately to your left.",
      "Move your pencil with the speaker instead of relying on memory.",
    ],
    vocabulary: ["adjacent to", "at the junction", "past the reception", "in the north-west corner", "directly opposite"],
  },
  {
    id: "sections",
    eyebrow: "Test map",
    title: "Section 1–4 strategy",
    description:
      "Difficulty rises because context, speaker count and academic density change.",
    steps: [
      "Section 1: forms, names, prices and everyday arrangements.",
      "Section 2: one speaker, public information, maps and facilities.",
      "Section 3: student discussion; track who agrees, doubts or changes position.",
      "Section 4: academic lecture; predict note structure and listen for signposting.",
    ],
  },
  {
    id: "accents",
    eyebrow: "Pronunciation",
    title: "British, American and Australian variation",
    description:
      "Learn sound families rather than trying to imitate every accent.",
    vocabulary: [
      "schedule: /ˈʃedjuːl/ ↔ /ˈskedʒuːl/",
      "advertisement: /ədˈvɜːtɪsmənt/ ↔ /ˌædvərˈtaɪzmənt/",
      "route: /ruːt/ ↔ /raʊt/",
      "mobile: /ˈməʊbaɪl/ ↔ /ˈmoʊbəl/",
      "can't: /kɑːnt/ ↔ /kænt/",
    ],
  },
  {
    id: "confused",
    eyebrow: "Vocabulary",
    title: "Frequently confused words",
    description:
      "Meaning and spelling both matter in gap-fill tasks.",
    vocabulary: [
      "weather / whether",
      "price / prize",
      "quiet / quite",
      "accept / except",
      "affect / effect",
      "desert / dessert",
      "personal / personnel",
      "stationery / stationary",
      "lose / loose",
      "principal / principle",
    ],
  },
  {
    id: "prediction",
    eyebrow: "Before listening",
    title: "Predict grammar and topic",
    description:
      "The words around a gap reveal what kind of answer is possible.",
    steps: [
      "An article usually predicts a singular countable noun.",
      "A number may predict a unit, date, price or plural noun.",
      "An adjective before the gap may predict a noun.",
      "Read headings to activate likely vocabulary before the recording begins.",
    ],
  },
  {
    id: "daily",
    eyebrow: "10-minute routine",
    title: "Daily listening challenge",
    description:
      "Short, focused repetition is more effective than passively completing many tests.",
    steps: [
      "Listen once for the main idea without writing.",
      "Listen again and transcribe 30–45 seconds.",
      "Compare with the transcript and mark reductions or linked sounds.",
      "Shadow the same extract twice, copying stress and pauses.",
    ],
  },
];

export const IELTS_SKILL_CONTENT: Record<IeltsSkill, IeltsSkillContent> = {
  speaking: {
    eyebrow: "Speaking vocabulary lab",
    title: "Speak naturally, not mechanically",
    description:
      "120 common topics, band 8–9 answer models, native-like phrases and examiner guidance without AI scoring.",
    stats: [
      { value: "120", label: "common topics" },
      { value: "12", label: "topic families" },
      { value: "30+", label: "natural phrases" },
    ],
    sections: SPEAKING_SECTIONS,
  },
  writing: {
    eyebrow: "Writing model library",
    title: "Study what high-band writing does",
    description:
      "Model structures for every major Task 1 and Task 2 type, with vocabulary, grammar and scoring analysis.",
    stats: [
      { value: "12", label: "essay types" },
      { value: "8–9", label: "target band" },
      { value: "50+", label: "academic phrases" },
    ],
    sections: WRITING_SECTIONS,
  },
  reading: {
    eyebrow: "Reading strategy library",
    title: "Find meaning behind the wording",
    description:
      "Step-by-step guides for every common question type, built around traps, paraphrase and high-frequency synonyms.",
    stats: [
      { value: "8", label: "question guides" },
      { value: "100", label: "core synonyms" },
      { value: "4", label: "strategy stages" },
    ],
    sections: READING_SECTIONS,
  },
  listening: {
    eyebrow: "Listening language lab",
    title: "Hear the answer after the distractor",
    description:
      "Practical guidance for sections 1–4, accents, numbers, maps and the vocabulary that causes avoidable errors.",
    stats: [
      { value: "4", label: "section strategies" },
      { value: "40+", label: "confusing forms" },
      { value: "10m", label: "daily routine" },
    ],
    sections: LISTENING_SECTIONS,
  },
};

export interface VocabularyResource {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  groups: Array<{
    title: string;
    note: string;
    items: Array<{ basic: string; advanced: string; example: string }>;
  }>;
}

export const IELTS_VOCABULARY_RESOURCES: VocabularyResource[] = [
  {
    slug: "use-this-instead",
    eyebrow: "Lexical upgrade",
    title: "Use This Instead",
    description: "Replace vague vocabulary with precise alternatives that fit a real sentence.",
    groups: [
      {
        title: "Evaluation",
        note: "Choose by meaning; these words are not interchangeable in every context.",
        items: [
          { basic: "important", advanced: "crucial · pivotal · fundamental", example: "Trust plays a pivotal role in effective leadership." },
          { basic: "good", advanced: "beneficial · advantageous · favourable", example: "Flexible hours can be beneficial for working parents." },
          { basic: "bad", advanced: "detrimental · adverse · harmful", example: "Air pollution has an adverse effect on public health." },
          { basic: "big", advanced: "substantial · considerable · significant", example: "The policy produced a substantial reduction in waste." },
          { basic: "many", advanced: "numerous · a wide range of", example: "Numerous studies have examined this relationship." },
        ],
      },
      {
        title: "Academic actions",
        note: "Strong verbs make cause, evidence and change clearer.",
        items: [
          { basic: "help", advanced: "facilitate · foster · contribute to", example: "Public libraries foster lifelong learning." },
          { basic: "show", advanced: "demonstrate · illustrate · indicate", example: "The figures indicate a gradual recovery." },
          { basic: "cause", advanced: "trigger · lead to · result in", example: "Poor planning can lead to unnecessary delays." },
          { basic: "change", advanced: "alter · transform · reshape", example: "Digital tools have transformed the workplace." },
          { basic: "people", advanced: "individuals · residents · citizens", example: "Residents were invited to comment on the proposal." },
        ],
      },
    ],
  },
  {
    slug: "examiner-loves",
    eyebrow: "Precision bank",
    title: "Examiner Loves These Words",
    description: "High-value words that express common IELTS ideas with precision.",
    groups: [
      {
        title: "Policy and society",
        note: "Useful across education, health, cities and the environment.",
        items: [
          { basic: "fair", advanced: "equitable", example: "An equitable system gives support according to need." },
          { basic: "possible to continue", advanced: "sustainable", example: "Cities need a sustainable approach to transport." },
          { basic: "able to recover", advanced: "resilient", example: "Resilient communities recover more quickly from disruption." },
          { basic: "available to everyone", advanced: "accessible", example: "Public services should be accessible to rural residents." },
          { basic: "responsible for actions", advanced: "accountable", example: "Companies must be held accountable for pollution." },
        ],
      },
      {
        title: "Change and impact",
        note: "Use these to describe scale, pace and consequence.",
        items: [
          { basic: "make worse", advanced: "exacerbate", example: "Long commutes can exacerbate stress." },
          { basic: "make less serious", advanced: "mitigate", example: "Trees help mitigate the urban heat-island effect." },
          { basic: "prevent growth", advanced: "hinder", example: "High costs may hinder innovation." },
          { basic: "encourage growth", advanced: "stimulate", example: "Investment can stimulate local employment." },
          { basic: "spread through", advanced: "permeate", example: "Technology now permeates almost every aspect of daily life." },
        ],
      },
    ],
  },
  {
    slug: "band-9-vocabulary",
    eyebrow: "Band 9 vocabulary",
    title: "Precise, Controlled, Natural",
    description: "Band 9 vocabulary is accurate collocation and flexible paraphrase, not rare words.",
    groups: [
      {
        title: "Argument",
        note: "Frame claims with an appropriate degree of certainty.",
        items: [
          { basic: "clearly true", advanced: "compelling", example: "There is compelling evidence that early intervention works." },
          { basic: "can be defended", advanced: "justifiable", example: "Temporary restrictions may be justifiable during an emergency." },
          { basic: "not clear", advanced: "ambiguous", example: "The long-term effect remains ambiguous." },
          { basic: "seems opposite but true", advanced: "paradoxical", example: "It may seem paradoxical that greater choice can reduce satisfaction." },
          { basic: "careful distinction", advanced: "nuanced", example: "The issue requires a more nuanced response." },
        ],
      },
    ],
  },
  {
    slug: "academic-collocations",
    eyebrow: "Collocation library",
    title: "Academic Collocations",
    description: "Learn words in combinations that examiners expect to see together.",
    groups: [
      {
        title: "Evidence and research",
        note: "Build sentences around complete word partnerships.",
        items: [
          { basic: "evidence", advanced: "compelling evidence · empirical evidence", example: "Empirical evidence supports the proposed approach." },
          { basic: "research", advanced: "conduct research · extensive research", example: "Further research should be conducted before implementation." },
          { basic: "result", advanced: "yield results · preliminary findings", example: "The trial yielded encouraging results." },
          { basic: "difference", advanced: "a marked disparity · a marginal difference", example: "A marked disparity remains between urban and rural access." },
          { basic: "effect", advanced: "a profound impact · far-reaching consequences", example: "The reform may have far-reaching consequences." },
        ],
      },
      {
        title: "Trends and solutions",
        note: "Useful in Task 1 overviews and Task 2 recommendations.",
        items: [
          { basic: "increase", advanced: "a sharp rise · grow steadily", example: "Participation grew steadily throughout the period." },
          { basic: "problem", advanced: "a pressing issue · pose a challenge", example: "Housing affordability poses a serious challenge." },
          { basic: "solution", advanced: "a viable solution · a targeted measure", example: "Subsidised transport is a viable short-term solution." },
          { basic: "responsibility", advanced: "assume responsibility · bear the cost", example: "Major polluters should bear the cost of restoration." },
          { basic: "attention", advanced: "draw attention to · address a concern", example: "The report draws attention to regional inequality." },
        ],
      },
    ],
  },
  {
    slug: "universal-phrases",
    eyebrow: "Reusable structures",
    title: "Universal IELTS Phrases",
    description: "Flexible sentence frames for analysis, examples, contrast and qualification.",
    groups: [
      {
        title: "Develop an argument",
        note: "Complete every frame with a specific idea.",
        items: [
          { basic: "main reason", advanced: "One of the primary reasons is that...", example: "One of the primary reasons is that public transport remains unreliable." },
          { basic: "result", advanced: "This, in turn, can lead to...", example: "This, in turn, can lead to lower employee retention." },
          { basic: "example", advanced: "A clear illustration of this can be seen in...", example: "A clear illustration of this can be seen in cities with integrated rail networks." },
          { basic: "contrast", advanced: "This is not to suggest that...", example: "This is not to suggest that individual choices are irrelevant." },
          { basic: "condition", advanced: "Provided that..., it is likely that...", example: "Provided that funding is maintained, the scheme is likely to succeed." },
        ],
      },
    ],
  },
];

type SupportedLocale = "uz" | "ru" | "en";
type LocalizedIelts = Record<
  "uz" | "ru",
  {
    skills: Record<IeltsSkill, IeltsSkillContent>;
    resources: VocabularyResource[];
    topicGroups: Record<string, string>;
  }
>;

const LOCALIZED_IELTS = localizedIelts as unknown as LocalizedIelts;

export function ieltsSkillContent(lang: string, skill: IeltsSkill): IeltsSkillContent {
  if (lang === "uz" || lang === "ru") return LOCALIZED_IELTS[lang].skills[skill];
  return IELTS_SKILL_CONTENT[skill];
}

const WRITING_SECTION_IDS = {
  task1: new Set(["task-1-visuals", "task-1-process", "score-analysis"]),
  task2: new Set(["task-2-opinion", "task-2-discussion", "task-2-problems", "score-analysis"]),
};

export function writingSectionsForTask(
  sections: IeltsResourceSection[],
  task: "task1" | "task2"
) {
  return sections.filter((section) => WRITING_SECTION_IDS[task].has(section.id));
}

export function ieltsVocabularyResources(lang: string): VocabularyResource[] {
  if (lang === "uz" || lang === "ru") return LOCALIZED_IELTS[lang].resources;
  return IELTS_VOCABULARY_RESOURCES;
}

export function speakingTopicGroups(lang: string) {
  const locale = (lang === "uz" || lang === "ru" ? lang : "en") as SupportedLocale;
  return Object.entries(SPEAKING_TOPICS).map(([group, topics]) => ({
    group:
      locale === "en" ? group : LOCALIZED_IELTS[locale].topicGroups[group] ?? group,
    topics,
  }));
}

export function vocabularyResourceBySlug(
  slug: string,
  lang = "en"
): VocabularyResource | undefined {
  return ieltsVocabularyResources(lang).find((resource) => resource.slug === slug);
}
