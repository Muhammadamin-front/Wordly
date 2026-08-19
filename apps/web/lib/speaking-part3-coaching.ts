/**
 * Per-topic phrases, tips and mistakes for the twenty Part 3 discussion topics.
 *
 * These were previously three constants shared by all twenty topics, so the
 * advice on crime was identical to the advice on art. Each entry is written
 * against the questions in `speaking-part3-content.ts`: the phrases are moves
 * that fit these particular arguments, and the tips name the abstraction each
 * topic demands and the point at which candidates usually collapse back into
 * Part 1 answers.
 */

import type { TopicCoaching } from "./speaking-part1-coaching";

export const PART3_COACHING: Record<string, TopicCoaching> = {
  "travel-and-culture": {
    phrases: {
      starting: [
        "It depends enormously on the kind of travel we mean.",
        "There's a difference between tourism and travel here.",
        "Broadly, I'd say it does both at the same time.",
      ],
      extending: [
        "Tourism can preserve a craft and hollow it out simultaneously, because...",
        "Cheap flights changed the scale rather than the nature of it...",
        "The pressure falls unevenly: on a small town...",
      ],
      concluding: [
        "So the honest answer is that it protects the form and changes the meaning.",
        "Limiting numbers is unpopular but I can't see an alternative for the worst-affected places.",
        "Ultimately it comes down to who captures the money.",
      ],
    },
    tips: [
      "Distinguish the tourist from the traveller and from the resident early — most of these questions turn on whose perspective you take.",
      "The 'does tourism help or change a culture' question wants both at once. 'It does both, but in different areas' is a stronger opening than picking a side.",
      "Use concession structures: while it's true that, admittedly, that said, even so.",
    ],
    mistakes: [
      "Describing your own last holiday. Part 3 wants the general case, not your trip.",
      "Treating culture as a single fixed thing that can only be preserved or destroyed.",
      "Saying 'tourists' when you mean the tourism industry — the responsibility question depends on the difference.",
    ],
  },
  "education-systems": {
    phrases: {
      starting: [
        "The purpose has always been contested, but I'd argue...",
        "Exams measure something real; the question is whether it's the right thing.",
        "There are two separate issues here: access and quality.",
      ],
      extending: [
        "What an exam actually rewards is..., which correlates with ability but isn't the same as it.",
        "Motivation tends to fall at the point where...",
        "The value of a degree has shifted from the knowledge to the signal it sends.",
      ],
      concluding: [
        "So I'd keep exams but stop treating the result as a complete measure of a person.",
        "The honest answer is that it depends heavily on the subject and the country.",
        "In twenty years I'd expect the assessment to change long before the teaching does.",
      ],
    },
    tips: [
      "Separate what schools are for from how well they do it. Most of these questions collapse if you mix the two.",
      "The 'is a degree still worth the cost' question needs qualification by field. An answer that treats all degrees alike is easy to challenge.",
      "Use measured comparatives: rather more, somewhat less, considerably better, not nearly as.",
    ],
    mistakes: [
      "Answering with your own school experience. That is a Part 1 answer wearing a Part 3 question.",
      "Saying exams are 'not fair' without saying fair to whom or compared with what alternative.",
      "Confusing 'education' (the system) with 'studies' (what one person does).",
    ],
  },
  "technology-and-society": {
    phrases: {
      starting: [
        "The change has been less in what we do than in how it's coordinated.",
        "I'd separate productivity from the feeling of being busy.",
        "It depends whether we're talking about tools or platforms.",
      ],
      extending: [
        "The gain in speed has been offset by...",
        "Resistance is often rational rather than nostalgic, because...",
        "Automation historically created work, but not for the same people who lost it.",
      ],
      concluding: [
        "So the net effect is probably positive and very unevenly distributed.",
        "The obligation should sit with whoever profits from the design.",
        "That's what makes the retraining question the important one.",
      ],
    },
    tips: [
      "Avoid the flat 'advantages and disadvantages' structure. Take a position and then concede the strongest point against it.",
      "The automation question invites hedged prediction: it's likely that, I'd expect, on balance it seems.",
      "Naming a mechanism beats naming an example — 'because attention is the product being sold' explains more than 'for example, Instagram'.",
    ],
    mistakes: [
      "Listing devices you own. The question is about society, not your desk.",
      "Saying 'technology is a double-edged sword' and stopping there.",
      "Treating 'the internet' and 'social media' as the same thing across a whole answer.",
    ],
  },
  "cities-and-transport": {
    phrases: {
      starting: [
        "People move for work first, and everything else follows from that.",
        "A pleasant city is mostly one where you don't need a car.",
        "It depends whether the aim is speed or liveability.",
      ],
      extending: [
        "Discouraging cars only works if the alternative already exists, otherwise...",
        "The poorest residents usually have the least choice about how they travel...",
        "A long commute swallows hours a week that nobody counts as working time, which...",
      ],
      concluding: [
        "So the sequence matters: build the alternative, then restrict the car.",
        "Green space isn't a luxury competing with housing; it's part of what makes density tolerable.",
        "Growing populations will force the choice whether cities plan for it or not.",
      ],
    },
    tips: [
      "Congestion questions reward a mechanism: induced demand, pricing, density, land use. One named mechanism lifts the whole answer.",
      "Be careful with quantities. 'A long commute costs several hundred hours a year' is defensible; specific percentages are not.",
      "Use conditional structures for policy: if cities were to, unless there's, provided that.",
    ],
    mistakes: [
      "Describing the bus service in your own city for the whole answer.",
      "Proposing 'the government should build more roads' without addressing why that has not worked elsewhere.",
      "Saying 'traffic jam' when you mean congestion as a general condition.",
    ],
  },
  "health-and-lifestyle": {
    phrases: {
      starting: [
        "Partly individual, but the environment does most of the work.",
        "The gap between knowing and doing is the real question here.",
        "It depends which health outcome we mean.",
      ],
      extending: [
        "Habits fail because the healthy option is slower, dearer or less available...",
        "Regulation tends to work where individual willpower doesn't, for example...",
        "Mental health is taken more seriously in language than in funding.",
      ],
      concluding: [
        "So I'd put the responsibility on individuals only once the choice is genuinely available.",
        "Free healthcare is less a moral question than a question of what a society can sustain.",
        "The problems I'd expect to grow are the slow ones: inactivity, sleep, isolation.",
      ],
    },
    tips: [
      "Separate responsibility from blame. That distinction alone answers half the questions in this topic.",
      "Public health claims need hedging: 'the evidence tends to suggest', 'in most studies I've seen'.",
      "The regulation questions invite modal verbs of obligation: ought to, should be required to, could reasonably be expected to.",
    ],
    mistakes: [
      "Describing your own diet and exercise. That belongs in Part 1.",
      "Stating invented statistics. A hedged general claim scores better than a confident false number.",
      "Confusing 'healthy' and 'healthily' — people eat healthily, food is healthy.",
    ],
  },
  environment: {
    phrases: {
      starting: [
        "Individually very little, but that's the wrong way to measure it.",
        "The gap between belief and behaviour is the interesting part.",
        "It depends whether we mean emissions or waste — they behave differently.",
      ],
      extending: [
        "People continue because the cost is distant and the convenience is immediate...",
        "Recycling is useful and it also functions as a distraction, because...",
        "Voluntary agreements work where reputation matters and fail where it doesn't.",
      ],
      concluding: [
        "So individual action matters mainly as a signal that regulation is acceptable.",
        "Richer countries emitted the stock, so the cost argument is hard to escape.",
        "I'd say cautiously pessimistic about the next fifty years, but not fatalistic.",
      ],
    },
    tips: [
      "Distinguish individual, corporate and government action explicitly. Nearly every question in this topic hinges on which one you mean.",
      "The optimism question wants a position with a reason, not a mood. Name what would have to happen for you to be more hopeful.",
      "Use cause-and-effect connectives precisely: consequently, which in turn, as a result of, at the expense of.",
    ],
    mistakes: [
      "Listing what you personally recycle.",
      "Saying 'we must save our planet' as a substitute for an argument.",
      "Treating 'environment' as countable. It takes 'the' in this sense and no plural.",
    ],
  },
  "work-and-careers": {
    phrases: {
      starting: [
        "Interest, until the pay is inadequate — then money dominates everything.",
        "Expectations have shifted more than the work itself has.",
        "It varies enormously by profession, so I'd generalise carefully.",
      ],
      extending: [
        "Remote work changed the default: the burden of justification moved from...",
        "The mismatch exists because qualifications are slow and industries are fast...",
        "Long hours produce more output for a while, and then measurably less.",
      ],
      concluding: [
        "So I'd say several careers is already the norm rather than a prediction.",
        "Retraining is cheaper for employers than replacement, which is the argument most likely to work.",
        "The work most at risk is routine work, not necessarily unskilled work.",
      ],
    },
    tips: [
      "The motivation question lists three options. Address all three briefly, then rank them — the ranking is the answer.",
      "Distinguish 'work' from 'a job' and from 'a career'. The vocabulary distinction is worth marks in this topic.",
      "Use frequency and probability hedges: typically, as a rule, in most sectors, more often than not.",
    ],
    mistakes: [
      "Talking about the job you want. Part 3 asks about employment in general.",
      "Saying 'money is not important' — an answer nobody finds credible without qualification.",
      "Confusing 'salary', 'wage' and 'income', which are not interchangeable.",
    ],
  },
  "media-and-advertising": {
    phrases: {
      starting: [
        "Less by persuading and more by deciding what feels normal.",
        "Trust has fragmented rather than simply fallen.",
        "There's a difference between an advertisement and a recommendation you didn't know was paid for.",
      ],
      extending: [
        "Children can't distinguish content from advertising until roughly..., which is the basis for restricting it.",
        "False claims spread quickly because outrage is cheaper to produce than accuracy...",
        "Influencers work precisely because they don't look like advertising.",
      ],
      concluding: [
        "So disclosure matters more than volume, in my view.",
        "Platforms will only act where liability follows, which is why the legal question comes first.",
        "The direction of travel is towards advertising you can't identify as advertising.",
      ],
    },
    tips: [
      "Distinguish advertising from marketing from news. The trust questions and the influence questions are about different things.",
      "This topic tempts overstatement. Hedge: 'tends to', 'in many cases', 'for certain audiences'.",
      "The regulation questions want a mechanism — disclosure rules, watersheds, age limits, liability — not just approval or disapproval.",
    ],
    mistakes: [
      "Saying advertising 'brainwashes' people, which is easy to dismiss.",
      "Describing an advert you saw recently instead of answering the general question.",
      "Confusing 'advertisement' (the item), 'advertising' (the activity) and 'advert' or 'ad' (the informal short forms).",
    ],
  },
  "family-and-generations": {
    phrases: {
      starting: [
        "The roles have changed faster than the expectations have.",
        "The disagreement is usually about timing rather than values.",
        "It depends whether we mean the household or the wider family.",
      ],
      extending: [
        "Each generation grew up under different constraints, so what looks like...",
        "Distance changes obligation into a scheduled thing rather than a daily one...",
        "Smaller families mean more attention per child and less negotiation between them.",
      ],
      concluding: [
        "So responsibility for elderly parents is being renegotiated rather than abandoned.",
        "What older relatives offer is mostly perspective on what turned out not to matter.",
        "In thirty years I'd expect the form to change and the obligation to survive.",
      ],
    },
    tips: [
      "Avoid nostalgia. 'Families were closer before' is an assertion the examiner has heard hundreds of times — give a mechanism instead.",
      "Talk about generations as products of circumstance rather than character. It is both more accurate and better argued.",
      "Use 'tend to' and 'on the whole' — family generalisations are the easiest to overstate.",
    ],
    mistakes: [
      "Describing your own family for the entire answer.",
      "Saying 'in my country' and then describing something universal.",
      "Confusing 'relatives' with 'relations' with 'parents' — 'parents' means mother and father only.",
    ],
  },
  "friendship-and-community": {
    phrases: {
      starting: [
        "A strong community is mostly one where people meet without planning to.",
        "It is harder as an adult, and the reason is structural rather than personal.",
        "Online contact has added a layer rather than replacing anything.",
      ],
      extending: [
        "Friendship needs repeated unplanned contact, which adult life removes...",
        "Loneliness in cities happens because proximity isn't the same as contact...",
        "Shared spaces matter because they create the low-stakes encounters that...",
      ],
      concluding: [
        "So designing for encounter does more than encouraging people to be sociable.",
        "Isolation among older people is largely a transport and mobility problem.",
        "Obligation between neighbours works best when it's light and reciprocal.",
      ],
    },
    tips: [
      "The strongest answers here name a mechanism: repeated contact, shared space, low-stakes encounters. It lifts the topic out of platitude immediately.",
      "'Should neighbours be expected to help' asks about obligation. Distinguish what is admirable from what should be expected.",
      "Use abstract nouns confidently: proximity, reciprocity, belonging, isolation, cohesion.",
    ],
    mistakes: [
      "Telling the story of how you met your best friend.",
      "Saying 'people are on their phones too much' as the explanation for everything.",
      "Confusing 'lonely' (a feeling) with 'alone' (a situation) — the distinction matters throughout this topic.",
    ],
  },
  "money-and-success": {
    phrases: {
      starting: [
        "Publicly it's defined by visible things; privately I think it's mostly security.",
        "Money reliably removes misery and unreliably adds happiness.",
        "It depends where you're starting from, which is what most answers miss.",
      ],
      extending: [
        "Above a certain income the relationship flattens, largely because...",
        "Attitudes to saving differ because one generation lived through...",
        "Comparison is the mechanism social media changed, not the desire itself.",
      ],
      concluding: [
        "So teaching money in school addresses a gap that families no longer fill.",
        "Large income gaps damage trust before they damage anything measurable.",
        "Cash will survive as a fallback long after it stops being the default.",
      ],
    },
    tips: [
      "The money-and-happiness question has a well-known shape: it helps a lot at low incomes and much less at high ones. Say that, and you have a defensible position.",
      "Distinguish wealth, income and security. Most confusion in this topic comes from using them interchangeably.",
      "Hedge the inequality claims — 'there's reasonable evidence that', 'it seems to be associated with'.",
    ],
    mistakes: [
      "Saying 'money can't buy happiness' with nothing after it.",
      "Talking about your own spending habits.",
      "Confusing 'rich' and 'wealthy' with 'successful' — the first question is precisely about the difference.",
    ],
  },
  "art-and-creativity": {
    phrases: {
      starting: [
        "Every society produces it, which suggests it isn't optional.",
        "Creativity can be taught as a method, if not as an instinct.",
        "It depends whether we're funding artists or funding access.",
      ],
      extending: [
        "Art seems to do something that language alone doesn't, namely...",
        "Technology has changed distribution far more than it's changed making...",
        "Street art becomes legitimate roughly at the point where property owners...",
      ],
      concluding: [
        "So public funding is easier to justify for access than for individual artists.",
        "The works that last tend to be the ones each generation can re-read differently.",
        "These systems recombine what exists, which is a real skill and a different one.",
      ],
    },
    tips: [
      "'Can creativity be taught' rewards a distinction: technique and process can be taught, taste and drive less so.",
      "The artificial intelligence question is where candidates overreach. A careful claim about what these systems actually do beats a prediction.",
      "Use evaluative language: derivative, original, accomplished, formulaic, striking.",
    ],
    mistakes: [
      "Saying 'art is very important for our soul' as the whole argument.",
      "Describing a painting you like instead of answering the general question.",
      "Treating 'art' as meaning only painting, when the questions clearly include music, design and writing.",
    ],
  },
  "food-and-globalisation": {
    phrases: {
      starting: [
        "It spread because it solved a real problem: speed, price and consistency.",
        "Traditional dishes aren't disappearing so much as becoming occasional.",
        "It depends whether we're talking about everyday eating or celebration food.",
      ],
      extending: [
        "A tax changes behaviour at the margin, mostly among people who...",
        "Year-round imports lower prices and remove the seasonal premium that...",
        "People cook less because time has become the scarce resource, not skill.",
      ],
      concluding: [
        "So the tradition survives as an event and disappears as a habit.",
        "Family meals matter for the conversation more than the food.",
        "In fifty years I'd expect more substitution than anyone currently finds appetising.",
      ],
    },
    tips: [
      "Distinguish everyday eating from special-occasion eating. It resolves the 'are traditions disappearing' question cleanly.",
      "The tax question wants an effect, not an opinion: who changes behaviour, by how much, and who bears the cost.",
      "Food vocabulary is easy range: processed, seasonal, staple, imported, convenience food.",
    ],
    mistakes: [
      "Naming your favourite national dish and describing it.",
      "Saying 'fast food is unhealthy' as though that answered why it spread.",
      "Treating globalisation as only a threat, when the same trade brought most of the ingredients people now call traditional.",
    ],
  },
  "sports-and-discipline": {
    phrases: {
      starting: [
        "Mainly losing, which is difficult to teach any other way.",
        "Their pay is a symptom of the broadcasting money, not a decision anyone made.",
        "Compulsory sport and compulsory competition are two different proposals.",
      ],
      extending: [
        "Team sport teaches you to be dependent on people you didn't choose...",
        "Competition helps where the child is roughly matched and harms where...",
        "Role models influence behaviour most in the details: how they lose, how they train.",
      ],
      concluding: [
        "So I'd make participation compulsory and competition optional.",
        "Hosting a major event pays off for cities that needed the infrastructure anyway.",
        "Technology has already changed watching more than it's changed playing.",
      ],
    },
    tips: [
      "'Should sport be compulsory' is best answered by splitting it: physical activity yes, competitive team sport less obviously.",
      "The pay question rewards an economic explanation over a moral one. Explain where the money comes from.",
      "Use qualification: for most children, at that age, in a well-run programme.",
    ],
    mistakes: [
      "Describing the sport you play or the team you support.",
      "Saying athletes 'deserve' or 'don't deserve' their pay without explaining the market.",
      "Confusing 'sport' (uncountable, the activity in general) with 'a sport' (a particular one).",
    ],
  },
  "books-and-reading": {
    phrases: {
      starting: [
        "They read constantly — just not books, which is a different claim.",
        "Fiction has a practical value, though it's indirect.",
        "Libraries have changed function rather than become unnecessary.",
      ],
      extending: [
        "Reading a novel requires sustained attention, and that's what's genuinely scarce...",
        "E-books removed friction and also removed the reminder that a physical book...",
        "Required reading works when the discussion is good and backfires when...",
      ],
      concluding: [
        "So libraries survive as public space, which may matter more than the lending.",
        "The books that last tend to be the ones that don't resolve neatly.",
        "The next generation will read more words and fewer long things.",
      ],
    },
    tips: [
      "Challenge the premise of the first question. People read enormous amounts; the decline is in sustained reading. That distinction is the strongest answer available.",
      "The 'value of fiction' question invites careful claims about attention and perspective rather than grand statements about imagination.",
      "Use 'literacy', 'attention span', 'sustained reading' and 'skimming' precisely.",
    ],
    mistakes: [
      "Listing your favourite books.",
      "Saying 'books are better than films' without saying better for what.",
      "Confusing 'literature' (the artistic body of work) with 'books' in general.",
    ],
  },
  "language-and-identity": {
    phrases: {
      starting: [
        "Because a mother tongue carries relationships, not just meanings.",
        "It changes what you notice, which isn't quite the same as how you think.",
        "There's a difference between protecting a language and preserving it.",
      ],
      extending: [
        "A language dies when it stops being used at home, which legislation can't easily...",
        "Accents are judged as proxies for class and region rather than clarity...",
        "English dominance is a practical convenience with a real cost in...",
      ],
      concluding: [
        "So what's lost isn't vocabulary, it's a set of things that were easy to say.",
        "Early second languages help most with pronunciation and least with grammar.",
        "Translation tools will reduce the need to learn and not the reason to.",
      ],
    },
    tips: [
      "You are being assessed in English while discussing English dominance. Handle it evenhandedly — advocacy in either direction sounds rehearsed.",
      "The 'does language change how you think' question has real research behind it and it is more modest than most candidates claim. Hedge accordingly.",
      "Use precise terms: mother tongue, second language, bilingual, dialect, accent, register.",
    ],
    mistakes: [
      "Describing your own English learning journey.",
      "Saying a language 'is more beautiful' or 'more logical' than another.",
      "Confusing 'language', 'dialect' and 'accent' — the accent question specifically depends on the difference.",
    ],
  },
  "shopping-and-consumption": {
    phrases: {
      starting: [
        "Mostly because buying resolves a feeling that owning doesn't.",
        "It's transferred activity from high streets rather than destroying it.",
        "There's a design question here and a legal one, and they have different answers.",
      ],
      extending: [
        "Products last as long as the business model requires, which is why...",
        "Discounts move purchases forward in time and increase the total...",
        "Consumers can't reasonably audit a supply chain, so responsibility has to sit...",
      ],
      concluding: [
        "So repair rights change manufacturer behaviour more than consumer behaviour.",
        "Second-hand became acceptable when it stopped signalling poverty and started signalling taste.",
        "The next decade will probably be defined by returns and delivery costs.",
      ],
    },
    tips: [
      "The durability question is strongest when framed around incentives — who benefits from a shorter lifespan — rather than around blaming manufacturers.",
      "Be careful with claims about planned obsolescence; hedge them rather than asserting them as established fact.",
      "Use the vocabulary of consumption: disposable, durable, repairable, second-hand, supply chain, impulse purchase.",
    ],
    mistakes: [
      "Describing your own shopping habits.",
      "Saying 'people are too materialistic' as an explanation.",
      "Confusing 'cheap' (low price, often low quality) with 'inexpensive' and 'good value'.",
    ],
  },
  "crime-and-safety": {
    phrases: {
      starting: [
        "Feeling safe and being safe come apart more often than people expect.",
        "Prevention is cheaper, but punishment is what the public can see.",
        "It depends heavily on which kind of crime we mean.",
      ],
      extending: [
        "What makes a street feel safe is mostly other people using it...",
        "Cameras work well in defined spaces like car parks and much less well...",
        "The evidence on sentence length is weaker than the public debate suggests, because...",
      ],
      concluding: [
        "So certainty of being caught does more than severity of punishment.",
        "Poverty correlates with crime without determining it, and the distinction matters for policy.",
        "Online crime is different mainly because distance and scale change the economics.",
      ],
    },
    tips: [
      "This topic rewards accuracy over strong opinion. Where the evidence is contested, say so — 'the research I've seen tends to suggest'.",
      "Distinguish deterrence, incapacitation and rehabilitation. Precise nouns like these are exactly what the lexical resource criterion rewards.",
      "Avoid invented crime statistics entirely; a hedged qualitative claim is safer and scores better.",
    ],
    mistakes: [
      "Telling a story about something that happened in your neighbourhood.",
      "Asserting that harsher sentences obviously reduce crime, which the evidence does not support.",
      "Confusing 'crime' (uncountable, in general), 'a crime' (a single act) and 'criminal' (the person).",
    ],
  },
  "science-and-innovation": {
    phrases: {
      starting: [
        "Investment follows both wealth and expectation of return, which aren't the same.",
        "Scientists can identify the limits; deciding them is a political act.",
        "It depends whether we mean basic research or applied work.",
      ],
      extending: [
        "Explaining research to the public fails when uncertainty is presented as weakness...",
        "Medical funding follows disease burden in rich countries rather than globally...",
        "Trust in science is high in the abstract and conditional in specifics.",
      ],
      concluding: [
        "So ethical limits need to be set outside the field but informed by it.",
        "International cooperation is not optional for anything at planetary scale.",
        "The advance I'd expect to matter most is unglamorous: better diagnostics.",
      ],
    },
    tips: [
      "Distinguish basic from applied research early — the funding questions depend entirely on it.",
      "Do not invent findings or figures. Attribute cautiously: 'as I understand it', 'the general finding seems to be'.",
      "The ethics questions want a decision procedure — who decides, and how — not just a list of concerns.",
    ],
    mistakes: [
      "Saying 'science has advantages and disadvantages'.",
      "Treating artificial intelligence as either magic or a con. A specific, modest claim is far stronger.",
      "Saying 'scientists prove' when they test, suggest or find evidence for something. Proof is a word for mathematics.",
    ],
  },
  "tradition-and-modern-life": {
    phrases: {
      starting: [
        "The ones worth keeping are the ones people still want to do.",
        "Young people reject the obligation more often than the custom itself.",
        "A tradition can survive its original meaning; it just becomes something else.",
      ],
      extending: [
        "Commercialisation changes who a celebration is for, which is why...",
        "State support keeps a craft alive and can also freeze it at a particular...",
        "Traditions now pass through fewer occasions, so each one carries more weight...",
      ],
      concluding: [
        "So the ones that survive will be the ones that adapt rather than the ones that are protected.",
        "What's really scarce isn't interest, it's the extended time these practices assume.",
        "In a hundred years I'd expect the form to remain and the reason to have changed entirely.",
      ],
    },
    tips: [
      "Avoid arguing that all traditions must be preserved. A selective position — which ones, and why — is far more defensible.",
      "The 'original meaning forgotten' question is the most interesting one here. Take it seriously rather than answering yes or no.",
      "Use the language of change: erode, adapt, revive, dilute, hand down, fall out of use.",
    ],
    mistakes: [
      "Describing a festival in your country in detail instead of arguing about tradition.",
      "Framing every answer as young people being disrespectful.",
      "Confusing 'tradition', 'custom' and 'habit' — a habit is individual, a custom is social, a tradition is inherited.",
    ],
  },
};
