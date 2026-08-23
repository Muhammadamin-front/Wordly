/**
 * Per-card descriptions, phrases, tips and mistakes for the twenty Part 2 cue
 * cards.
 *
 * All twenty cards used to share one templated description
 * (`Cue-card practice about ${theme}...`) and a tips list built by slicing the
 * generic Part 1 array, so every card gave the same advice. Each entry here is
 * written against that card's own four prompt bullets in
 * `speaking-cue-cards.ts`: the phrases move a candidate through those bullets,
 * and the tips name the tense and the trap that this particular card sets.
 */

import type { TopicCoaching } from "./speaking-part1-coaching";

export interface CueCoaching extends TopicCoaching {
  /** Shown on the topic list and at the top of the card. */
  description: string;
}

export const PART2_COACHING: Record<string, CueCoaching> = {
  "memorable-trip": {
    description:
      "A narrative card: one journey, told in the past, with a moment that made it worth remembering.",
    phrases: {
      starting: [
        "The trip that comes to mind straight away is...",
        "I'd like to talk about a few days I spent in...",
        "This was about... ago, when I went to... with...",
      ],
      extending: [
        "We'd planned to..., but in the end we...",
        "What I hadn't expected was...",
        "The part I remember most clearly is when...",
      ],
      concluding: [
        "So it stayed with me less for the sights and more because...",
        "I've been back since, but it wasn't the same.",
        "That's why it's still the trip I describe when anyone asks.",
      ],
    },
    tips: [
      "Give the destination and the timeframe in your first two sentences, then spend the rest of the two minutes on what happened. Candidates who describe the place for ninety seconds never reach the fourth bullet.",
      "This card needs a complication — something that went wrong, surprised you, or changed the plan. Without one you are describing an itinerary, not telling a story.",
      "Past perfect earns marks here: 'we had already booked', 'by the time we arrived'. Use it once or twice, not in every sentence.",
    ],
    mistakes: [
      "Listing every place you visited in order until the timer runs out.",
      "Answering 'why it was memorable' with 'because it was very beautiful'. The examiner needs a reason nobody else could give.",
      "Drifting into the present tense when the excitement builds.",
    ],
  },
  "helpful-person": {
    description:
      "A person card: who they are, what they actually did for you, and why it mattered more than ordinary kindness.",
    phrases: {
      starting: [
        "The person I'd choose is..., who was my...",
        "This is someone I met when...",
        "I want to talk about..., because without her I'd probably...",
      ],
      extending: [
        "What she did specifically was...",
        "It mattered because at that point I was...",
        "She never actually told me what to do; instead she...",
      ],
      concluding: [
        "So the help was practical, but the effect was mostly on my confidence.",
        "I still use the same approach when something feels too big to start.",
        "That's why I'd name her rather than anyone in my family.",
      ],
    },
    tips: [
      "Choose someone with one concrete act you can describe. A person you admire in general is much harder to fill two minutes with than a person who did one specific thing.",
      "The fourth bullet asks why the help mattered — that is where the marks are. Plan at least three sentences for it, not one.",
      "Relative clauses do a lot of work on this card: 'a teacher who noticed that...', 'the one person who was willing to...'",
    ],
    mistakes: [
      "Describing the person's appearance and personality for a minute before mentioning any help.",
      "Saying 'she helped me a lot' three times without ever saying what she actually did.",
      "Choosing a famous person you have never met — the card asks about help you received.",
    ],
  },
  "useful-app": {
    description:
      "A description-plus-habit card: explain in plain words what the tool actually does, then how it fits into your week.",
    phrases: {
      starting: [
        "The one I'd pick is..., which is essentially a...",
        "I use a fair number of apps, but the one I'd struggle without is...",
        "It's not the most exciting choice, but...",
      ],
      extending: [
        "I came across it when...",
        "I open it roughly..., usually while I'm...",
        "What it actually does is..., which sounds simple but...",
      ],
      concluding: [
        "So its value isn't the technology; it's that it removes a decision.",
        "I'd have given up on... long ago without it.",
        "That's the test for me: would I notice if it disappeared.",
      ],
    },
    tips: [
      "Explain what the app does in one plain sentence before any opinion. Assume the examiner has never used it.",
      "The third bullet asks how often — give a real frequency and a real situation: 'twice a day, on the walk to campus'.",
      "Technical vocabulary is available cheaply here: interface, notification, sync, schedule, log in, back up. Use four or five naturally.",
    ],
    mistakes: [
      "Choosing a famous app and then only being able to say that it is popular and useful.",
      "Skipping the 'how you started using it' bullet, which is the one candidates most often forget.",
      "Turning the card into an argument about whether technology is good for us. That is the follow-up question, not the card.",
    ],
  },
  "special-meal": {
    description:
      "A food card where the occasion matters more than the menu: who was there, what was eaten, and why it stands out.",
    phrases: {
      starting: [
        "The meal that stands out was...",
        "This was for..., so the whole family was there.",
        "It wasn't a restaurant meal — it was...",
      ],
      extending: [
        "The dish itself is..., cooked in...",
        "Everyone had a job: my uncle..., while the rest of us...",
        "The moment that made it was when...",
      ],
      concluding: [
        "So I remember the afternoon far more clearly than the food.",
        "That's the thing about a meal like that: it's really an excuse to sit down together.",
        "I'd struggle to recreate it, and I'm not sure I'd want to.",
      ],
    },
    tips: [
      "Describe the food through the senses — smell, texture, how it was served — but keep it to twenty or thirty seconds. The occasion is what the fourth bullet is really asking about.",
      "If the dish is local, explain it in English rather than only naming it: 'rice cooked slowly with lamb and carrot in a wide iron pan'.",
      "Passive forms fit naturally here: 'it's usually served with', 'the meat is cooked first'.",
    ],
    mistakes: [
      "Reciting a recipe for two minutes.",
      "Saying 'it was delicious' as the answer to why it was special.",
      "Forgetting to say who was there. Bullet two asks for it and it is the easiest one to skip.",
    ],
  },
  "important-decision": {
    description:
      "A reflective card: the choice, the alternatives you rejected, and whether it turned out to be right.",
    phrases: {
      starting: [
        "The decision I'd talk about is...",
        "This was at the end of..., when I had to choose between... and...",
        "It doesn't sound dramatic, but it changed...",
      ],
      extending: [
        "The argument for... was..., and against it...",
        "What tipped it was...",
        "I was warned that..., which turned out to be partly true.",
      ],
      concluding: [
        "So I don't regret it, though I understand why people advised against it.",
        "Looking back, the process mattered as much as the choice.",
        "That's how I've made every big decision since.",
      ],
    },
    tips: [
      "Name both options. A decision with only one visible side is not a decision, and the examiner cannot hear the difficulty.",
      "This card is built for conditional and hypothetical language: 'if I'd chosen...', 'I might well have ended up...'",
      "The final bullet asks what the result has been, so finish in the present perfect: 'it's meant that...', 'it's worked out better than I expected'.",
    ],
    mistakes: [
      "Describing the outcome without ever explaining what made the choice hard.",
      "Choosing something trivial and then struggling to justify calling it important.",
      "Mixing 'would' and 'will' when speculating about the path you did not take.",
    ],
  },
  "quiet-place": {
    description:
      "A description card that needs atmosphere: where it is, what it is like, and what it does for you.",
    phrases: {
      starting: [
        "The place I'd choose is..., on the... floor of...",
        "It's nowhere special, which is rather the point.",
        "It's about... minutes from where I live, so...",
      ],
      extending: [
        "What makes it quiet is..., rather than any rule about silence.",
        "I go there roughly..., usually to...",
        "When I'm there I tend to..., and I stay about...",
      ],
      concluding: [
        "So it works because it changes how I behave without any effort on my part.",
        "I leave feeling clearer than when I arrived, which is all I ask of it.",
        "That's why I've never told many people about it.",
      ],
    },
    tips: [
      "Use sensory detail: light, sound, temperature, texture. A quiet place is described by what is absent as much as what is there.",
      "The final bullet asks about the effect on you. Move from description to feeling explicitly — 'what it does for me is...'",
      "Bullet three is about habit, so it needs present simple and frequency adverbs: 'I tend to go', 'a couple of times a week', 'whenever I need to'.",
    ],
    mistakes: [
      "Describing your bedroom with no detail beyond 'it is quiet and comfortable'.",
      "Spending the whole two minutes on the location and none on why it matters.",
      "Repeating 'quiet', 'peaceful' and 'relaxing' in rotation instead of showing the atmosphere.",
    ],
  },
  "skill-learned": {
    description:
      "A learning card with a clear arc: what you could not do, what you did about it, and where you are now.",
    phrases: {
      starting: [
        "The skill I'd pick is..., which I started working on because...",
        "I wouldn't call myself expert, but I can now...",
        "This was about... ago, when I realised I couldn't...",
      ],
      extending: [
        "The method was fairly unglamorous: I...",
        "The hardest stage was..., and what got me past it was...",
        "I could tell it was working when...",
      ],
      concluding: [
        "So the skill itself is useful, but the bigger gain was learning how I learn.",
        "I still practise it, though far less deliberately now.",
        "That's the approach I'd use for anything difficult now.",
      ],
    },
    tips: [
      "Show a before and an after. Without the 'before', the examiner cannot measure the progress you are describing.",
      "Sequencing language carries this card: at first, after a few weeks, eventually, by the end.",
      "Name the method concretely — recording yourself, a timer, a teacher, repetition. 'I practised a lot' fills no time.",
    ],
    mistakes: [
      "Choosing a skill you learned as a small child, which leaves you nothing to say about the process.",
      "Saying 'I practised every day and then I could do it' — that is the whole card in one sentence.",
      "Using 'learn' when you mean 'teach', particularly when someone helped you.",
    ],
  },
  "interesting-book": {
    description:
      "A book card that is really about impact: what it said, how you found it, and whether you would pass it on.",
    phrases: {
      starting: [
        "The book I'd talk about is... by...",
        "It's non-fiction, which isn't what I usually read, but...",
        "I read it at a point when I was...",
      ],
      extending: [
        "I only picked it up because...",
        "The central idea is that..., which sounds obvious written down.",
        "What made it useful rather than just interesting was...",
      ],
      concluding: [
        "So I'd recommend it, though not to everyone — it suits someone who...",
        "I've given it to two people since, which is the real test.",
        "I don't agree with all of it, but the part that worked, worked.",
      ],
    },
    tips: [
      "Say what the book argues, not what happens in it — even for fiction, the examiner wants your reading of it, not a summary.",
      "The 'how you came across it' bullet is the one candidates skip. Give it a sentence: a friend, a shop, a recommendation, a course.",
      "The last bullet asks who you would recommend it to. Name a type of reader rather than saying 'everybody'.",
    ],
    mistakes: [
      "Summarising the plot chapter by chapter.",
      "Choosing a book you have not read because the title sounds impressive.",
      "Saying 'this book learned me a lot'. Books teach you; you learn from them.",
    ],
  },
  "family-celebration": {
    description:
      "An event card built on preparation and people: what was celebrated, how it was organised, and why it matters to the family.",
    phrases: {
      starting: [
        "The celebration I'd describe is...",
        "This was..., and the preparation took...",
        "It's the one occasion the whole family travels for.",
      ],
      extending: [
        "Everybody had something to do: my mother..., my uncle...",
        "The part I liked best was actually the quiet morning before...",
        "One thing did go wrong:..., and what saved it was...",
      ],
      concluding: [
        "So what makes it matter is the cooperation nobody sees, not the ceremony itself.",
        "It's also the only time some of these relatives are in the same room.",
        "That's why it's the day I'd describe rather than any birthday.",
      ],
    },
    tips: [
      "The preparation bullet is where the vocabulary range is. Describe the work: booking, cooking, borrowing, arranging, decorating.",
      "Explain any custom in plain English. Naming it is not enough if the examiner does not know it.",
      "A small problem that got solved gives the card a shape and gets you into the past perfect.",
    ],
    mistakes: [
      "Describing the traditions of your country in general instead of one celebration you attended.",
      "Answering the 'why it is important' bullet with 'because family is important'.",
      "Losing track of who is who. Introduce each relative once, clearly.",
    ],
  },
  "good-advice": {
    description:
      "A card about influence: the advice, the person who gave it, and how long it took you to act on it.",
    phrases: {
      starting: [
        "The advice I'd talk about is..., which I got from...",
        "It was one sentence, really:...",
        "This came at a point when I was...",
      ],
      extending: [
        "The reasoning was that...",
        "I didn't act on it straight away — for about a month I...",
        "What finally changed my mind was...",
      ],
      concluding: [
        "So the difference wasn't immediate, and that's partly why it stuck.",
        "I apply it now to things that have nothing to do with the original situation.",
        "It's the only piece of advice I can remember word for word.",
      ],
    },
    tips: [
      "Quote the advice in one short sentence. Advice that takes thirty seconds to state is not advice, it is a lecture.",
      "The third bullet asks whether you followed it immediately or later. Answering honestly — 'not at first' — is more interesting and gives you a whole section.",
      "Reported speech is natural here: 'he told me to', 'she said I should', 'his point was that'.",
    ],
    mistakes: [
      "Saying 'advices'. Advice is uncountable — 'a piece of advice'.",
      "Giving general life wisdom rather than something a specific person said to you.",
      "Skipping the last bullet, so the examiner never learns what difference it made.",
    ],
  },
  "expensive-item": {
    description:
      "A purchase card that wants judgement: what you bought, what it cost, and whether it was worth it.",
    phrases: {
      starting: [
        "The most expensive thing I've bought myself is...",
        "It cost somewhere around..., which for me at the time was...",
        "I saved for it for nearly...",
      ],
      extending: [
        "I compared... against..., and in the end I went for...",
        "I nearly didn't buy it — I waited another week because...",
        "I use it..., which is what justifies the price.",
      ],
      concluding: [
        "So judged by cost per use, it's been the best purchase I've made.",
        "I'd buy the same thing again, though I'd probably haggle harder.",
        "That's how I've decided on every big purchase since.",
      ],
    },
    tips: [
      "Give a figure. The card asks roughly what it cost and candidates routinely avoid it; a number makes the whole answer concrete.",
      "Say what you rejected. The comparison is where the comparative and superlative forms come from.",
      "'Worth it' is the natural phrase for the final bullet: worth every penny, not worth the money, worth waiting for.",
    ],
    mistakes: [
      "Refusing to name a price, which leaves one bullet unanswered.",
      "Describing the object's features like an advertisement instead of your decision to buy it.",
      "Saying 'it costs me 9 million so'm' in the present when the purchase was in the past.",
    ],
  },
  "sport-event": {
    description:
      "A live-event card: who was playing, where you watched, what happened, and why it stayed with you.",
    phrases: {
      starting: [
        "The one I'd describe is..., between... and..., last season.",
        "I watched it at..., with...",
        "I'm not a serious fan, but this one I remember.",
      ],
      extending: [
        "It started badly for the side I wanted to win, and for twenty minutes...",
        "The turning point was..., and the room...",
        "What impressed me was what they did after that:...",
      ],
      concluding: [
        "So I remember it for the atmosphere in the room as much as the result.",
        "It's also the game that made me pay attention to tactics.",
        "That's the closest I've come to caring about a result.",
      ],
    },
    tips: [
      "Name both teams or both players. The first bullet asks who took part and it is easy to describe a whole match without ever saying.",
      "Use the present tense for describing action only if you are deliberately telling it dramatically — otherwise stay in the past and stay consistent.",
      "Sport collocations are worth having ready: concede a goal, level the score, hold on, keep their shape, in the closing minutes.",
    ],
    mistakes: [
      "Giving a minute-by-minute commentary that never reaches why you remember it.",
      "Saying 'we won' without ever establishing which side you support.",
      "Confusing 'win' and 'beat'. You win a match; you beat an opponent.",
    ],
  },
  "old-photo": {
    description:
      "A memory card anchored in one image: what is in it, when it was taken, and how it came to be yours.",
    phrases: {
      starting: [
        "The photograph I'd describe shows...",
        "It's more than twenty years old, taken on...",
        "It's not a good photograph technically, and that's part of why I like it.",
      ],
      extending: [
        "In it, ... is..., while ... is...",
        "The colours have faded and one corner is..., so you can tell it's been handled.",
        "I only came to have it because...",
      ],
      concluding: [
        "So what I value is that nobody was posing.",
        "It's the only picture I have of them looking like themselves.",
        "That's what a printed photograph does that a phone gallery never will.",
      ],
    },
    tips: [
      "Describe the image in the present tense — 'he is holding a cup of tea' — even though it was taken long ago. That is what native speakers do with photographs.",
      "Position language is easy range here: in the background, on the left, just out of frame, in the foreground.",
      "The third bullet asks how you came to have it. Give it a small story: inherited, found, given, kept.",
    ],
    mistakes: [
      "Describing the people's lives instead of what the photograph actually shows.",
      "Choosing a recent phone photo when the card specifies an old one.",
      "Saying 'in the photo I can see my grandfather and my grandmother and a tree' and running out of material.",
    ],
  },
  "city-you-like": {
    description:
      "A future-facing card: which city, why it appeals, and what you would actually do there.",
    phrases: {
      starting: [
        "The city at the top of my list is...",
        "I became interested in it after...",
        "I've never been, which is exactly why...",
      ],
      extending: [
        "I'd want to go in..., when...",
        "Rather than the famous sites, I'd rather...",
        "I'd prepare by..., because...",
      ],
      concluding: [
        "So it's not really a sightseeing trip I'm imagining.",
        "I'd want to come back with a changed idea of the place, not just photographs.",
        "That's what draws me to it over anywhere closer.",
      ],
    },
    tips: [
      "This card is entirely hypothetical, so the grammar is 'would' throughout: I'd like to, I'd probably, I'd want to. Consistency here is very visible.",
      "Say why this city rather than another. A reason that could apply to any city is a weak answer.",
      "Give one specific plan — a season, a district, a way of travelling. Specifics are what fill the second minute.",
    ],
    mistakes: [
      "Reciting facts about the city's population and history like a guidebook.",
      "Slipping into 'I will go' when you mean 'I'd like to go'.",
      "Choosing a city you have already visited when the card asks about one you would like to visit.",
    ],
  },
  "difficult-task": {
    description:
      "A problem-solving card: what made it hard, how you got through it, and how you felt at the end.",
    phrases: {
      starting: [
        "The task I'd describe is...",
        "It was difficult mainly because...",
        "We had..., which sounds like enough time until you...",
      ],
      extending: [
        "The first thing I did was..., which made...",
        "Two days before the deadline,...",
        "Rather than..., we decided to...",
      ],
      concluding: [
        "So what I felt first was relief rather than pride.",
        "The lesson was that cutting scope is a decision, not a failure.",
        "That's how I'd approach the same problem now.",
      ],
    },
    tips: [
      "Be specific about the difficulty: time, people, skill, or pressure. 'It was very difficult' explains nothing.",
      "The final bullet asks how you felt afterwards. Relief, exhaustion, quiet satisfaction — a mixed feeling is more convincing than pure triumph.",
      "Problem-and-solution language does well here: it came down to, we ended up, what saved us was, in the end.",
    ],
    mistakes: [
      "Describing the task in so much technical detail that the examiner loses the thread.",
      "Answering the feelings bullet with 'I was very happy' and nothing more.",
      "Making yourself the sole hero of a task that clearly involved other people.",
    ],
  },
  "creative-person": {
    description:
      "A person card about process, not talent: what they make, how they got good, and what you take from it.",
    phrases: {
      starting: [
        "The person I'd choose is..., who works as...",
        "What they make is..., mostly for...",
        "They're largely self-taught, which is part of why I admire them.",
      ],
      extending: [
        "They developed it by..., long before any formal training.",
        "The project that made me notice was...",
        "What surprised me was how many versions they threw away.",
      ],
      concluding: [
        "So their creativity looks like discipline rather than inspiration.",
        "That's the part people miss when they call someone talented.",
        "It changed what I think creative work actually involves.",
      ],
    },
    tips: [
      "The bullet about how they developed the talent is the one candidates skip. Answer it: self-taught, a course, years of copying, a mentor.",
      "Describe one piece of their work in detail rather than their whole career.",
      "Avoid 'creative' as your only adjective. Try inventive, meticulous, original, resourceful, disciplined.",
    ],
    mistakes: [
      "Choosing a famous artist and describing their Wikipedia page.",
      "Saying 'she is very creative and talented' four times without an example.",
      "Talking only about the finished work and never about how it was made.",
    ],
  },
  "useful-object": {
    description:
      "The one card that asks you to describe a physical thing. Choose something ordinary you can picture in detail.",
    phrases: {
      starting: [
        "The object I'd pick is..., which sounds unexciting.",
        "I've had it about..., and I bought it from...",
        "It's the least impressive thing in the room and the one I'd replace first.",
      ],
      extending: [
        "It has..., and the useful part is...",
        "I bought it because...",
        "I use it for..., and also for...",
      ],
      concluding: [
        "So it solves one problem quietly, every single day.",
        "It's a reminder that usefulness comes from design, not price.",
        "That's why I'd notice its absence more than most things I own.",
      ],
    },
    tips: [
      "Bullet two asks two things — how long you have had it and where it came from. Answer both in one sentence, then move on.",
      "Physical description is the vocabulary opportunity: adjustable, sturdy, compact, flexible, portable, lightweight.",
      "Choose something ordinary. A phone or a laptop gives you nothing distinctive to say.",
    ],
    mistakes: [
      "Choosing an object you cannot describe physically.",
      "Saying 'it is very useful because I use it a lot', which is circular.",
      "Forgetting the 'where it came from' bullet entirely.",
    ],
  },
  "film-recommendation": {
    description:
      "A recommendation card: what the film is about, how you saw it, and who you would send to it.",
    phrases: {
      starting: [
        "The film I'd recommend is..., directed by...",
        "I saw it at home rather than at the cinema, during...",
        "I went in expecting..., and it turned out to be...",
      ],
      extending: [
        "The premise is that...",
        "What I liked most was...",
        "It has its weaknesses — ... — but they didn't spoil it for me.",
      ],
      concluding: [
        "So I'd recommend it particularly to someone who...",
        "It's the film I suggest when somebody wants something not too heavy.",
        "The idea it leaves you with is what makes it worth two hours.",
      ],
    },
    tips: [
      "The 'when and how you saw it' bullet is easy to miss — cinema, streaming, television, on a flight, with whom.",
      "Give the premise in two sentences, not the plot in ten. The examiner is not marking your summary skills.",
      "Name the audience for your recommendation. 'Everyone would like it' is the weakest possible answer to the final bullet.",
    ],
    mistakes: [
      "Telling the whole story including the ending.",
      "Saying 'it is a very interesting movie with good actors' as the entire opinion.",
      "Saying 'I looked a film'. You watch a film, or you see one — 'look' needs 'at' and does not work here.",
    ],
  },
  "environmental-problem": {
    description:
      "The one Part 2 card that is nearly Part 3: a local problem, its causes, its effects, and what could be done.",
    phrases: {
      starting: [
        "The problem I'd talk about is...",
        "It's most visible in..., when...",
        "It isn't dramatic, but it affects everybody here.",
      ],
      extending: [
        "The causes seem to be a mixture of..., and...",
        "For people living nearby it means...",
        "Telling individuals to... doesn't address any of that.",
      ],
      concluding: [
        "So it needs several measures at once rather than one solution.",
        "What's missing most is reliable data, so people can see what's actually causing it.",
        "That's why I've started thinking of it as a health issue rather than an environmental one.",
      ],
    },
    tips: [
      "This card asks for causes and solutions, so it needs Part 3 language: contributes to, is largely down to, would go some way towards.",
      "Hedge your causal claims — 'it seems to be', 'part of the problem is' — rather than stating figures you cannot support.",
      "Keep it local and concrete. A general speech about climate change ignores the wording of the card.",
    ],
    mistakes: [
      "Describing global warming instead of a problem in your own area.",
      "Proposing 'people should be more aware' as the solution, which says nothing.",
      "Confusing 'affect' (the verb) and 'effect' (the noun), which is very audible in this topic.",
    ],
  },
  "future-job": {
    description:
      "An ambition card grounded in specifics: the role, its appeal, its requirements, and what you are doing now.",
    phrases: {
      starting: [
        "The role I'd like is...",
        "It appeals to me because it combines... with...",
        "It's a fairly specific job, rather than just 'something in technology'.",
      ],
      extending: [
        "Day to day it would involve..., working alongside...",
        "The advertisements I've read ask for...",
        "So at the moment I'm..., and I still need...",
      ],
      concluding: [
        "So it's demanding for exactly the reason it appeals to me.",
        "I'd rather do that than something better paid with no visible effect.",
        "That's the direction, even if the job title turns out differently.",
      ],
    },
    tips: [
      "The qualifications bullet needs a named qualification — a degree, a certificate, a number of years' experience — not just 'you need to study hard'.",
      "Keep the modality consistent: 'I'd be responsible for', 'the role would involve', 'I'd need to'.",
      "Say what you are doing now in the present continuous. It is the only present-tense part of the card and it is worth signalling clearly.",
    ],
    mistakes: [
      "Choosing a job so vague ('businessman', 'engineer') that the requirements bullet becomes impossible.",
      "Describing your dream salary and lifestyle instead of the work itself.",
      "Saying 'I want to be a doctor because it is a good job' — the second bullet needs a personal reason.",
    ],
  },
};
