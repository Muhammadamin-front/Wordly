import { PART1_SAMPLES } from "./speaking-part1-samples";
import { PART3_SAMPLES } from "./speaking-part3-samples";


interface CueSampleProfile {
  subject: string;
  setting: string;
  details: string;
  development: string;
  reflection: string;
  /** What this candidate would actually write in the one-minute plan. */
  notes: string;
  /** The language worth reaching for on this specific card. */
  language: string;
}

export function buildPart1Samples(slug: string) {
  const samples = PART1_SAMPLES[slug];
  if (!samples) throw new Error(`Missing Part 1 sample content for ${slug}`);
  return [...samples];
}

export function buildPart3Samples(slug: string) {
  const samples = PART3_SAMPLES[slug];
  if (!samples) throw new Error(`Missing Part 3 sample content for ${slug}`);
  return [...samples];
}


const CUE_SAMPLE_PROFILES_1: Record<string, CueSampleProfile> = {
  "memorable-trip": {
    subject: "The journey I remember most clearly was a three-day trip to Samarkand with two university friends.",
    setting: "We travelled by early train at the end of spring, when the weather was warm but the main sites were not overwhelmingly crowded.",
    details: "Instead of rushing through a checklist, we walked between the Registan, smaller streets, and a family-run café where the owner explained how the neighbourhood had changed.",
    development: "The trip became difficult when one friend lost his wallet, so we retraced our route and eventually found it at the café. The owner had kept it safely without knowing whether we would return.",
    reflection: "That act of honesty gave the city a human meaning beyond its architecture. It also taught me that a little unplanned time creates better memories than an overfilled itinerary.",
    notes: "Samarkand, three days, two friends, spring, early train. Registan, side streets, the cafe. Lost wallet, returned. Lesson: unplanned time.",
    language: "Past simple for the sequence, past perfect for the wallet, and place vocabulary such as bustling, tiled facade and winding lanes.",
  },
  "helpful-person": {
    subject: "A person who made a real difference to me was my secondary-school English teacher, Ms Karimova.",
    setting: "I met her when I could understand grammar exercises but became extremely nervous whenever I had to speak in front of the class.",
    details: "She noticed the problem and asked me to record one-minute answers privately before giving short classroom presentations. Her feedback was precise: one pronunciation point and one idea to develop, never a list of every mistake.",
    development: "After several weeks, she invited me to help a younger student prepare for a school competition. Teaching someone else forced me to speak clearly and stopped me focusing entirely on myself.",
    reflection: "Her help was valuable because it created independence rather than dependence. I still use the same small-step approach when a difficult task feels too large to begin.",
    notes: "Ms Karimova, school English teacher. Problem: could not speak in class. Method: recorded answers, one point of feedback. Then helping a younger student. Lesson: independence.",
    language: "Verbs of support such as encourage, reassure and talk through, plus adjectives such as patient, precise and understated.",
  },
  "useful-app": {
    subject: "The digital tool I rely on most is a spaced-repetition application that I use for English vocabulary.",
    setting: "A classmate showed me his own deck in a break between lectures, and I installed it that afternoon. It was a busy semester and my handwritten word lists were getting longer without any of it actually reaching my speech.",
    details: "I open it twice a day, on the walk to campus and again before bed, and I save each word with its sentence, pronunciation, and one personal example. The app then schedules reviews just before I am likely to forget, so a ten-minute session has a clear purpose.",
    development: "At first I added too many cards and created an exhausting queue. Reducing the number and deleting vague examples made the system far more sustainable.",
    reflection: "Its real value is not clever technology but the consistency it supports. It has also taught me that a small tool works best when the user understands and controls the method behind it.",
    notes: "Spaced-repetition vocabulary app. A classmate showed me his deck between lectures. Twice a day, walk to campus and before bed. Word plus sentence plus my own example. Added too many cards, cut back.",
    language: "Technology vocabulary such as prompt, interface, schedule reviews and streak, and frequency adverbs such as daily and every few days.",
  },
  "special-meal": {
    subject: "A meal that stands out was the plov my family prepared for my grandmother's seventieth birthday.",
    setting: "We held the celebration in my uncle's courtyard in early autumn, and relatives arrived from several cities, some of whom I had not seen for years.",
    details: "My uncle managed the kazan while the rest of us cut vegetables, arranged fruit, and set a long table. The food itself was excellent, with tender meat and rice that remained separate rather than heavy.",
    development: "What made the meal special was the pause before eating, when my grandmother spoke briefly about the family members who had supported her throughout her life.",
    reflection: "The occasion reminded me that traditional food is often a structure for attention and gratitude. I remember the conversations and shared work even more clearly than the flavour.",
    notes: "Grandmother's seventieth, uncle's courtyard, early autumn. Kazan, plov, long table, relatives from other cities. Her speech before eating. Lesson: food as an occasion for attention.",
    language: "Food adjectives such as tender, fragrant and generous, and phrases for atmosphere such as the whole courtyard fell quiet.",
  },
  "important-decision": {
    subject: "One decision that changed my direction was choosing software engineering instead of a more familiar business degree.",
    setting: "I had to decide near the end of school, when relatives were giving confident but contradictory advice and I had very limited experience of either field.",
    details: "I compared course content, spoke to two current students, and completed a free introductory programming course. I enjoyed the frustration of debugging more than I expected because each error had an explanation I could eventually find.",
    development: "The risky part was accepting that the first year might be difficult and that interest alone would not replace disciplined mathematics and practice.",
    reflection: "I chose the technical route and have not regretted it. More importantly, the process taught me to test a major choice through small real experiences rather than opinions alone.",
    notes: "Software engineering instead of business. End of school, contradictory advice. Compared courses, spoke to students, tried a free course. Risk: hard first year. Lesson: test a choice in small ways.",
    language: "Decision vocabulary such as weigh up, talk it over, take the plunge and have second thoughts.",
  },
  "quiet-place": {
    subject: "My favourite quiet place is a small reading room on the upper floor of the city library.",
    setting: "It faces an inner courtyard, so traffic is barely audible, and I usually go there on weekday mornings when only a few other readers are present.",
    details: "The room has high windows, plain wooden desks, and no background music. I choose a seat near natural light, put my phone in my bag, and work in forty-minute blocks.",
    development: "I discovered it during an exam period after struggling to concentrate at home. Within one morning, I completed work that had remained unfinished for several days.",
    reflection: "The place matters because its simplicity changes my behaviour without requiring willpower. I leave feeling mentally lighter, even when the subject I studied was demanding.",
    notes: "Upper-floor reading room, city library. Faces a courtyard, weekday mornings. High windows, plain desks, phone in the bag, forty-minute blocks. Found it during exams.",
    language: "Sensory description such as hushed, still and bare, and phrases for concentration such as settle into work and lose track of time.",
  },
  "skill-learned": {
    subject: "A skill I am particularly pleased to have learned is giving a clear presentation in English.",
    setting: "I began practising before a university project because I knew the technical content but tended to speak too quickly and hide behind crowded slides.",
    details: "I reduced each slide to one idea, rehearsed with a timer, and recorded myself to identify unclear pronunciation. I also learned to pause after an important figure instead of filling every silence.",
    development: "My first rehearsal was uncomfortable, but feedback from a classmate showed that the structure was already improving even before my confidence caught up.",
    reflection: "The final presentation went smoothly and the questions felt like a conversation rather than a threat. The skill has helped me explain ideas more logically in everyday discussions as well.",
    notes: "Presenting in English. Before a university project. One idea per slide, rehearsed with a timer, recorded myself, learned to pause. First rehearsal uncomfortable.",
    language: "Learning vocabulary such as pick up, get the hang of, rehearse and refine, plus sequencing words like at first and eventually.",
  },
  "interesting-book": {
    subject: "A book that genuinely changed my thinking was James Clear's Atomic Habits.",
    setting: "I came across it in the university library, where a classmate slid his copy across the table and told me to stop rewriting my study plan and read the thing instead. That was fair: I was setting ambitious goals and abandoning them after a few intense days.",
    details: "The most useful idea was to make a behaviour obvious and easy rather than relying on motivation. I left my grammar workbook open on the desk instead of shelving it, and cut the daily target to ten focused minutes.",
    development: "The approach sounded almost too simple, but after a month the regular sessions had produced more progress than my previous weekend marathons.",
    reflection: "I would not treat the book as a perfect scientific rulebook, yet its practical framework was exactly what I needed. I have already recommended it to two classmates, and I would suggest it to anyone who blames willpower for something that is really a matter of arrangement.",
    notes: "Atomic Habits, James Clear. A classmate handed it to me in the library. Key idea: make it obvious and easy. Workbook left open, ten minutes. Recommended it to two people since.",
    language: "Book vocabulary such as premise, chapter, argue and take away, and hedging such as it is not a scientific rulebook, but.",
  },
  "family-celebration": {
    subject: "The family celebration I remember most warmly was my sister's wedding.",
    setting: "It was held in Namangan in early summer, in a wedding hall my parents booked almost a year ahead, and the preparation ran for months and involved relatives from both sides of the family.",
    details: "The hall itself was beautiful, but my favourite part was the quieter morning beforehand at my parents' flat, when close relatives shared breakfast and helped with the last details.",
    development: "One small problem occurred when a musician arrived late, yet an uncle kept the guests relaxed with stories until the programme continued. The delay actually made the event feel less staged.",
    reflection: "The day mattered because it joined tradition with the couple's own choices. I also saw how celebrations depend on invisible cooperation, not only the people standing in the centre.",
    notes: "Sister's wedding, a hall in Namangan, early summer. Booked a year ahead. Best part: the quiet morning at my parents' flat. Musician arrived late, uncle told stories. Lesson: invisible cooperation.",
    language: "Celebration vocabulary such as gather, toast, festivities and put on a spread, plus phrases for feeling such as it was oddly moving and I got quite emotional.",
  },
  "good-advice": {
    subject: "The most useful advice I have received was to show unfinished work earlier rather than waiting until it feels perfect.",
    setting: "A university mentor told me this after I spent too long developing the wrong feature for a group project without asking for feedback.",
    details: "He explained that a rough prototype gives other people something concrete to question, whereas a private idea can remain wrong for weeks.",
    development: "I did not follow it immediately. For about a month I nodded and carried on hiding my work, because showing something incomplete still felt like inviting judgement. It was only on the next project that I started sharing small versions at agreed checkpoints, and the early comments turned out to be gentler and far easier to act on than criticism near a deadline.",
    reflection: "I now apply the advice to writing and presentations as well as software. It has not lowered my standards; it has made the path to a strong result more efficient and collaborative.",
    notes: "Show unfinished work early. From a university mentor after I built the wrong feature. Rough prototype gives people something to question. Ignored it for a month, took it up on the next project.",
    language: "Advice vocabulary such as put it to me, take it on board and it stuck with me, and contrast markers such as whereas and in practice.",
  },
};

const CUE_SAMPLE_PROFILES_2: Record<string, CueSampleProfile> = {
  "expensive-item": {
    subject: "The most expensive personal item I have bought is the laptop I use for study and development work, which cost me somewhere around nine million so'm.",
    setting: "I saved for nearly a year and purchased it shortly before starting university, when my old computer could no longer run the tools required for class.",
    details: "I compared performance, battery life, repair options, and price instead of choosing the most impressive model. Eventually I selected a mid-range machine and upgraded the memory rather than paying for features I would not use.",
    development: "Spending that amount made me nervous, so I waited an extra week before ordering. The delay confirmed that the purchase solved a long-term problem rather than a temporary desire.",
    reflection: "It has been worthwhile because I use it every day and it has supported several real projects. The experience taught me to judge an expensive item by cost per use and reliability.",
    notes: "Laptop, around nine million so'm. Saved almost a year, bought before university. Compared performance, battery, repairs. Mid-range plus a memory upgrade. Waited an extra week.",
    language: "Money vocabulary such as save up, splash out, worth every penny and cost per use, and comparatives for the alternatives I rejected.",
  },
  "sport-event": {
    subject: "A sporting event I found genuinely exciting was a league match last season between Navbahor, the club from my home city, and Pakhtakor, who are the big Tashkent side.",
    setting: "I watched it at a friend's flat here in Tashkent with a mixed group: two serious fans, and three people who normally pay no attention to football at all.",
    details: "Navbahor conceded early but stayed organised and gradually created better chances. Their equaliser came from a quick passing move down the left, and the room went from tense silence to complete chaos in about two seconds.",
    development: "What impressed me most was their discipline after scoring. Instead of becoming reckless they kept their shape, defended the point sensibly, and held on for a draw that felt like a win given where they had started.",
    reflection: "I remember it partly because I was the only person in the room supporting the away side, so the whole evening was good-natured argument. It also showed me the tactical side of football, particularly how patience can be as decisive as individual talent.",
    notes: "Navbahor, my home city's club, away at Pakhtakor last season. Friend's flat in Tashkent, mixed group. Conceded early, equaliser down the left, held on for a draw. I was the only away fan in the room.",
    language: "Sport vocabulary such as concede, equaliser, keep their shape and hold on for a draw, plus dramatic time phrases like in the closing minutes.",
  },
  "old-photo": {
    subject: "An old photograph I treasure shows my grandparents sitting beside a fruit tree in their garden.",
    setting: "It was taken more than twenty years ago with a simple film camera, before posed digital photographs became part of every family gathering.",
    details: "My grandfather is holding a cup of tea while my grandmother is laughing at something outside the frame. The colours are slightly faded, and a corner is bent, but those imperfections make it feel handled and real.",
    development: "I came to have it by accident. We were clearing out a cupboard last year, it fell out of an envelope of documents, and my mother said I should keep it since I was the one who noticed it. She also explained that it was taken on an ordinary afternoon rather than a special occasion.",
    reflection: "That detail is exactly why I value it. It preserves their natural relationship and reminds me that everyday moments often become more meaningful than carefully planned pictures.",
    notes: "Grandparents beside a fruit tree in their garden. Twenty years old, film camera. Grandfather with tea, grandmother laughing off-frame. Faded, bent corner. Fell out of an envelope while clearing a cupboard; mother let me keep it.",
    language: "Visual description such as faded, creased, off to one side and mid-laugh, and phrases for memory like it takes me straight back.",
  },
  "city-you-like": {
    subject: "The city at the top of my travel list is Kyoto in Japan.",
    setting: "I became interested after seeing a documentary that followed residents through ordinary neighbourhoods rather than showing only the most famous temples.",
    details: "I would like to visit in late autumn, use public transport, walk through older districts, and spend time in both traditional gardens and contemporary design spaces.",
    development: "What attracts me is the visible coexistence of careful tradition and advanced urban life. I would prepare by learning basic Japanese courtesy and researching times when major sites are less crowded.",
    reflection: "The trip would be more than a collection of photographs. I hope it would challenge my assumptions about modernisation and show how a city can change without erasing every trace of its past.",
    notes: "Kyoto. Interested after a documentary about ordinary neighbourhoods. Late autumn, public transport, older districts, gardens and design spaces. Prepare with basic Japanese courtesy.",
    language: "Future forms throughout: I would like to, I am hoping to, I would probably. Plus city vocabulary such as district, preserved and low-rise.",
  },
  "difficult-task": {
    subject: "A demanding task I completed was coordinating the final release of a group software project at university.",
    setting: "We had four weeks, five team members, and a feature list that was clearly too ambitious, while nobody initially wanted to remove their favourite idea.",
    details: "I divided the work into essential and optional parts, created a shared board, and introduced short progress meetings twice a week. This made delays visible before they became emergencies.",
    development: "Two days before submission, a major login bug appeared. We stopped adding features, reproduced the error carefully, and fixed the underlying state problem rather than hiding it with a quick patch.",
    reflection: "We submitted a stable, smaller product and received strong feedback for clarity. Honestly, what I felt first was relief rather than pride, and I slept for most of the following day; the satisfaction arrived later, when I realised the thing we had handed in actually worked. The task taught me that leadership often means reducing scope and protecting focus, not simply asking people to work faster.",
    notes: "Final release of a university group project. Four weeks, five people, too many features. Split essential from optional, shared board, two meetings a week. Login bug two days out. Afterwards: relief first, pride later.",
    language: "Project vocabulary such as scope, deadline, prioritise and roll out, and problem phrasing such as it came down to and we ended up.",
  },
  "creative-person": {
    subject: "A creative person I admire is my cousin, who works as an independent graphic designer.",
    setting: "She did not train formally at first. She spent years copying suzani and tilework patterns into notebooks, taught herself the software from free tutorials, and only took a design course once she already had paying clients.",
    details: "I became interested in her work when she redesigned the packaging for a small family bakery on a very limited budget. She observed customers, photographed traditional patterns, and reduced the colour palette to make printing affordable, so the result felt modern without pretending the business had no history.",
    development: "What surprised me was the number of discarded versions behind the simple result. She treated criticism as information, asked precise questions, and revised the concept several times.",
    reflection: "Her creativity is disciplined rather than mysterious. She has shown me that original work comes from careful observation, constraints, and the willingness to improve an idea after the first excitement disappears.",
    notes: "My cousin, independent graphic designer. Self-taught: copied suzani and tilework patterns, learned the software from tutorials, took a course later. Bakery packaging on a small budget. Many discarded versions.",
    language: "Design vocabulary such as palette, motif, brief and draft, plus phrases for process like she kept refining it.",
  },
  "useful-object": {
    subject: "One of the most useful objects in my home is a compact adjustable desk lamp.",
    setting: "I have had it for about two years. I bought it from a small shop near the bazaar when evening study started causing eye strain, because the ceiling light threw shadows across my notebook and keyboard.",
    details: "It has a flexible metal arm, a heavy round base, three brightness levels, and a warm setting that is comfortable late at night. I use it for reading and for anything I have to write by hand, and it occupies very little space on the desk.",
    development: "I initially thought such a basic object could not matter much, but better lighting helped me remain focused and made video calls look clearer as well.",
    reflection: "I value it because it solves one problem quietly every day. It is a good reminder that usefulness often comes from thoughtful design rather than complexity or a high price.",
    notes: "Compact adjustable desk lamp, two years, shop near the bazaar. Flexible arm, heavy base, three brightness levels, warm setting. Bought it because of eye strain.",
    language: "Object description such as sturdy, adjustable, compact and unobtrusive, and purpose phrases such as it comes in handy when.",
  },
  "film-recommendation": {
    subject: "A film I regularly recommend is The Martian, directed by Ridley Scott.",
    setting: "I saw it at home on a streaming service the week before an exam period, mostly as an excuse not to study, expecting straightforward science fiction. It turned out to be a surprisingly optimistic story about problem-solving.",
    details: "The main character is stranded on Mars and survives by breaking an impossible situation into smaller technical challenges. The film balances tension with humour and gives supporting scientists meaningful roles.",
    development: "I particularly liked that intelligence is shown as collaborative and methodical rather than magical. Some science is simplified, but the logic feels consistent enough to support the drama.",
    reflection: "I would recommend it to people who dislike overly dark films. It is entertaining, visually strong, and leaves the viewer with a memorable idea: persistence is often a sequence of ordinary solutions.",
    notes: "The Martian, Ridley Scott. Streamed it at home before an exam period. Stranded on Mars, breaks the problem into small technical steps. Humour, real roles for the scientists.",
    language: "Film vocabulary such as plot, lead, pace and premise, and recommendation phrasing such as I would say it is worth watching if.",
  },
  "environmental-problem": {
    subject: "The most visible environmental problem where I live is air quality, which drops badly for weeks at a time.",
    setting: "It is worst near the major roads in winter, when traffic and household heating run at full volume and the cold, still air traps everything close to the ground, so the horizon develops a flat grey layer.",
    details: "Residents complain about dust and irritation, yet the sources are not always explained clearly. More reliable monitoring would help distinguish transport emissions, construction dust, and seasonal conditions.",
    development: "The issue cannot be solved by telling individuals to stay indoors. Better buses, enforcement at construction sites, cleaner heating, and public data would address several causes together.",
    reflection: "I find the problem worrying because polluted air affects everyone regardless of personal lifestyle. It has made me see environmental policy as an immediate health question rather than an abstract global discussion.",
    notes: "Air quality, bad for weeks at a time. Worst near major roads in winter: traffic, heating, cold still air trapping it, grey horizon. Causes unclear without monitoring. Buses, construction rules, cleaner heating.",
    language: "Environment vocabulary such as emissions, particulates, monitoring and enforcement, plus cautious phrasing like it appears to be and part of the problem.",
  },
  "future-job": {
    subject: "The role I would like to have in the future is product engineer for an education-technology company.",
    setting: "The idea appeals to me because it combines software development with a problem I understand personally: helping learners practise consistently and receive useful feedback.",
    details: "I would want to work with designers, teachers, and researchers rather than build features in isolation. My responsibility would include testing whether a tool actually improves learning, not only whether users click it.",
    development: "The job advertisements I have read all ask for the same three things: a computer science degree, two or three years of commercial experience, and a portfolio of products that have actually shipped. So I am finishing the degree, tightening up my programming fundamentals and my English, and learning how to read user data without drawing dishonest conclusions from it. Honestly I think the portfolio counts for more than the certificate, but I would need both.",
    reflection: "The job would be demanding because educational outcomes are difficult to measure, but that is part of its appeal. I want technical work whose quality has a clear human consequence.",
    notes: "Product engineer at an education-technology company. Combines software with a problem I understand. Needs a CS degree, a couple of years of experience, a portfolio of shipped work. Test whether a tool improves learning.",
    language: "Job-application vocabulary such as ship a product, build a portfolio, entry-level and work my way up, and conditional forms like I would be responsible for and the role would involve.",
  },
};

export const CUE_SAMPLE_PROFILES: Record<string, CueSampleProfile> = {
  ...CUE_SAMPLE_PROFILES_1,
  ...CUE_SAMPLE_PROFILES_2,
};

/** The five parts already run subject to reflection in order, so the answer
 *  ends on its own reflection. A shared closing line used to be appended here,
 *  which meant twenty different stories finished with one of three identical
 *  sentences. */
export function buildCueSample(slug: string) {
  const profile = CUE_SAMPLE_PROFILES[slug];
  if (!profile) throw new Error(`Missing cue-card sample content for ${slug}`);
  return `${profile.subject} ${profile.setting} ${profile.details} ${profile.development} ${profile.reflection}`;
}

/** The long turn, plus the two planning notes shown under the cue card.
 *  The planning notes used to be the profile's own sentences wrapped in the
 *  same boilerplate on every card, so all twenty read "Those elements create a
 *  clear sequence". They are written per card now. */
export function buildCueQuestionSamples(slug: string) {
  const profile = CUE_SAMPLE_PROFILES[slug];
  if (!profile) throw new Error(`Missing cue-card sample content for ${slug}`);
  return [buildCueSample(slug), profile.notes, profile.language];
}
