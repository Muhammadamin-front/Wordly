/**
 * Per-topic phrases, tips and mistakes for the thirty Part 1 topics.
 *
 * These three panels used to be a single shared constant each, so all thirty
 * topics rendered identical "Useful phrases", "Tips" and "Common mistakes"
 * boxes — the same problem the sample answers had. Everything here is written
 * against the actual questions in `speaking-part1-content.ts`: the phrases are
 * frames a candidate could open, extend and close *these* questions with, the
 * tips name the grammar each question set is really testing, and the mistakes
 * are the ones learners make on this topic specifically.
 */

export interface TopicCoaching {
  phrases: {
    starting: string[];
    extending: string[];
    concluding: string[];
  };
  tips: string[];
  mistakes: string[];
}

export const PART1_COACHING: Record<string, TopicCoaching> = {
  "work-study": {
    phrases: {
      starting: [
        "I'm still studying — I'm in my third year of...",
        "I work as a..., which mostly involves...",
        "A bit of both, actually: I study full time and...",
      ],
      extending: [
        "The part I enjoy most is..., mainly because...",
        "A typical week involves..., though it varies.",
        "If I could change one thing, it would be...",
      ],
      concluding: [
        "So for now I'm happy with it, even though...",
        "In five years I'd hope to be..., but nothing is fixed.",
        "That's really why I chose it over...",
      ],
    },
    tips: [
      "The opening question is a fact question. Say 'student' or 'I work' in your first three words, then add detail — a long wind-up before the answer costs you fluency marks.",
      "Two questions here ask you to choose (morning or later, alone or in a team). Pick a side and give one reason. 'Both are fine' throws away the chance to use comparative language.",
      "'Would you change anything' and 'in five years' both want hypothetical forms: I'd rather, I'd hope to be, I might end up.",
    ],
    mistakes: [
      "Listing every subject on your timetable instead of choosing one and saying why it interests you.",
      "Describing your university for thirty seconds before saying whether you work or study.",
      "Saying 'I work as a student'. You study, or you are a student — only a job takes 'work as'.",
    ],
  },
  hometown: {
    phrases: {
      starting: [
        "I'm from..., which is in the eastern part of the country.",
        "Originally I'm from..., though I've been living in... for a few years now.",
        "It's not a big place, but...",
      ],
      extending: [
        "It's probably best known for...",
        "When I was a child there was no..., and now...",
        "What visitors usually notice first is...",
      ],
      concluding: [
        "So it's a comfortable place to grow up, if not the easiest place to build a career.",
        "I'd like to come back eventually, but not straight away.",
        "That mix is what makes it hard to sum up in one sentence.",
      ],
    },
    tips: [
      "'Where is your hometown' wants a location, not a description. Name the region or the nearest large city so the examiner can place it, then move on.",
      "'How long have you lived there' is a present perfect question — answer with 'for' or 'since'. If you have moved away, switch to the past: 'I lived there for eighteen years'.",
      "The change question is where past-versus-present grammar earns marks. Contrast one concrete thing: a road, a building, a shop that did not exist before.",
    ],
    mistakes: [
      "Confusing your hometown with the city you live in now. If you have moved, say so in one clause and the examiner will follow you.",
      "Calling it 'very beautiful and very famous' with nothing after it. One landmark or one local dish is worth more than three adjectives.",
      "Saying 'I am living there since 2010'. With 'since' you need 'I have lived' or 'I have been living'.",
    ],
  },
  home: {
    phrases: {
      starting: [
        "I live in a flat, on the fourth floor of...",
        "It's a rented place I share with...",
        "We're in an apartment now, but I grew up in a house with...",
      ],
      extending: [
        "The room I use most is..., partly because...",
        "The one thing I'd change is...",
        "From the window you can see...",
      ],
      concluding: [
        "It suits me for now, though I wouldn't want to stay forever.",
        "Eventually I'd like somewhere with...",
        "So it's small, but it does everything I need it to.",
      ],
    },
    tips: [
      "Describe your home through what you do in it, not its floor plan. 'I study at the kitchen table because the light is better' says more than 'there are three rooms'.",
      "The future-home question invites the second conditional. 'If I could choose, I'd have...' is worth more than 'I want big house'.",
      "'Did you share a room' is past simple. Keep the whole answer in the past — learners often slip into the present halfway through.",
    ],
    mistakes: [
      "Reciting a list of rooms and furniture. The examiner wants opinion and preference, not an inventory.",
      "Saying 'I live in a flat with my brother' and stopping. Add one detail: how long, whose flat, what it's near.",
      "Using 'comfortable' for every feature. Try spacious, cramped, airy, cosy, or well lit.",
    ],
  },
  friends: {
    phrases: {
      starting: [
        "I'd say a few close ones rather than a big circle.",
        "My closest friend is someone I met at...",
        "It depends what you mean by friend, but...",
      ],
      extending: [
        "We usually end up..., which sounds ordinary but...",
        "What I look for is..., more than anything else.",
        "Since school it's changed: we used to..., and now...",
      ],
      concluding: [
        "So quality matters far more to me than numbers.",
        "We've stayed close mostly because...",
        "That's the kind of friendship I'd want to keep.",
      ],
    },
    tips: [
      "The opening question offers you two options. Choose one openly — 'a few close ones' — and the reason gives you your second sentence for free.",
      "'How did you meet' is a story question in miniature. Past simple, one place, one moment: 'We were put in the same group in first year'.",
      "The qualities question is your chance for adjective range: loyal, easy-going, blunt, reliable, patient. Pick two and illustrate one.",
    ],
    mistakes: [
      "Saying 'I have many friends' and then naming none of them or what you do together.",
      "Using 'friend' for everyone. Distinguish a close friend, a classmate, and someone you know from work.",
      "Answering the face-to-face-or-online question with a lecture about technology. Say which you prefer, and why, in your own life.",
    ],
  },
  music: {
    phrases: {
      starting: [
        "Mostly..., though it depends on my mood.",
        "I'm not especially fussy — I listen to...",
        "My taste has narrowed over the years to...",
      ],
      extending: [
        "I usually put something on when I'm...",
        "I did try learning..., but I gave it up because...",
        "Traditional music comes back at weddings, but day to day...",
      ],
      concluding: [
        "So it's more background than something I sit and concentrate on.",
        "I'd like to learn properly one day, though I say that every year.",
        "That's probably why my playlist hasn't changed much.",
      ],
    },
    tips: [
      "Name a genre and then one artist. A genre alone sounds rehearsed; an artist makes the answer yours.",
      "'When do you listen' wants habits and frequency adverbs: on the way to class, while I cook, hardly ever in the evening.",
      "The 'has your taste changed' question is built for used to: 'I used to listen to a lot of..., but now...'",
    ],
    mistakes: [
      "Saying 'I like all kinds of music'. It sounds like avoidance, and the follow-up will be harder.",
      "Confusing 'listen' and 'hear'. You listen to music on purpose; you hear it by accident.",
      "Saying 'I play guitar since two years' instead of 'I've been playing the guitar for two years'.",
    ],
  },
  movies: {
    phrases: {
      starting: [
        "Not as often as I'd like — maybe...",
        "Quite regularly, usually at home rather than...",
        "It goes in phases: some weeks..., other weeks nothing.",
      ],
      extending: [
        "The one genre I avoid is..., because...",
        "There's one film I've watched three or four times:...",
        "As a child I mostly watched..., dubbed into...",
      ],
      concluding: [
        "So the cinema is for the occasional big film, and everything else is at home.",
        "I'd recommend it even to someone who doesn't normally watch films, because...",
        "That's really the difference for me: atmosphere versus convenience.",
      ],
    },
    tips: [
      "'How often' needs a real frequency: once a fortnight, a couple of times a month. 'Sometimes' is the weakest answer available.",
      "Cinema versus home is a comparison question. Use comparative structures: bigger screen, cheaper, less interrupted, more comfortable.",
      "The question about the language of films is an easy place to use 'subtitled', 'dubbed' and 'the original version' accurately.",
    ],
    mistakes: [
      "Retelling a whole plot. The examiner asked whether you'd rewatch it, not what happens in it.",
      "Saying 'I watched this film yesterday' when you mean you've seen it several times — that needs the present perfect.",
      "Using 'film' and 'cinema' interchangeably. The cinema is the building; the film is what plays in it.",
    ],
  },
  food: {
    phrases: {
      starting: [
        "It has to be..., which is...",
        "Mostly at home, partly because...",
        "My mother does most of it, though when I'm here I...",
      ],
      extending: [
        "There's one thing I refused to eat as a child:...",
        "For a visitor I'd probably make..., because it's...",
        "I do pay some attention to it, mainly by...",
      ],
      concluding: [
        "So nothing complicated, but I eat better than I did a year ago.",
        "That's the dish I'd want someone to try first.",
        "It's less about dieting and more about not eating the same thing every night.",
      ],
    },
    tips: [
      "Describe a dish by its ingredients and method, not just its name: the examiner may never have heard of it. 'Rice cooked with carrot and lamb in a wide pan' is instantly clear.",
      "Use taste and texture adjectives — rich, greasy, tender, fragrant, filling — rather than repeating 'delicious'.",
      "'Have your eating habits changed' is present perfect. Anchor it with a time phrase: 'since I moved out', 'over the last couple of years'.",
    ],
    mistakes: [
      "Saying 'delicious' four times. It is the single most overused word in this topic.",
      "Answering 'who cooks' with one word. Add why: they're better at it, they're home earlier, you never learned.",
      "Saying 'I eat healthy food' as the whole answer to the health question. Name one thing you cut down on.",
    ],
  },
  shopping: {
    phrases: {
      starting: [
        "Honestly, not much — I find it...",
        "It depends what for: clothes I'd rather..., but groceries...",
        "I've become much more of an online shopper since...",
      ],
      extending: [
        "The last thing I bought was..., which I'd been putting off.",
        "I'm more of a planner: I usually...",
        "There's a market near us where...",
      ],
      concluding: [
        "So I do spend on things I don't strictly need, but less than I used to.",
        "That's why online works better for me.",
        "The markets are still cheaper, and that's what keeps them going.",
      ],
    },
    tips: [
      "'Do you enjoy shopping' is a yes/no question that needs a reason and a qualification: 'Not really, unless it's for...'",
      "The last-purchase question wants a concrete object and a small story. Vague answers here are very noticeable.",
      "Use shopping collocations rather than plain verbs: browse, pick something up, splash out, hunt for a bargain, window-shop.",
    ],
    mistakes: [
      "Saying 'I go to shopping'. It is 'go shopping' or 'go to the shops'.",
      "Answering the online question with general facts about e-commerce instead of your own habits.",
      "Treating 'do you spend too much' as a trap and denying everything. A small honest admission sounds far more natural.",
    ],
  },
  sports: {
    phrases: {
      starting: [
        "Not competitively, but I do...",
        "I used to play... at school, and these days I mostly...",
        "I'm more of a watcher than a player, to be honest.",
      ],
      extending: [
        "Football is easily the biggest here — you can see it in...",
        "I keep fit mainly by..., which isn't really a sport but...",
        "One I'd like to try is..., though I've never had the chance.",
      ],
      concluding: [
        "So it's more about staying active than about the sport itself.",
        "That's why I follow the league without ever playing.",
        "If there were a court nearby I'd probably play far more.",
      ],
    },
    tips: [
      "Get the verbs right: you play football, you go swimming or running, you do yoga or athletics. Examiners notice this immediately.",
      "'Do you prefer watching or taking part' is a comparison. Give one advantage of the side you reject before choosing.",
      "The school question is past simple and a good place for 'used to' and 'we were made to'.",
    ],
    mistakes: [
      "Saying 'I play running' or 'I do football'.",
      "Naming a sport with no detail at all — where you play, who with, how often.",
      "Answering 'how do you keep fit' with 'I am healthy'. Describe an actual activity and its frequency.",
    ],
  },
  technology: {
    phrases: {
      starting: [
        "My phone, without question — probably too much.",
        "It'd be my laptop, since almost everything I study runs on it.",
        "I use both, but for different things:...",
      ],
      extending: [
        "It's changed how I study completely: instead of..., I now...",
        "I pick new apps up quickly, though I don't enjoy...",
        "The first one I remember was..., which by today's standards was...",
      ],
      concluding: [
        "So it saves me time and costs me attention in roughly equal measure.",
        "In ten years I'd guess the difference will be..., but that's only a guess.",
        "That's the one piece of technology I could genuinely do without.",
      ],
    },
    tips: [
      "The 'in ten years' question needs future and speculative forms: will probably, might well, I'd imagine, by then we'll be.",
      "The first-computer question is a memory question. Past simple plus one specific detail beats a general comment about progress.",
      "'Is there any technology you'd rather live without' expects a real choice. Naming one thing and explaining the cost is far stronger than 'no, I need everything'.",
    ],
    mistakes: [
      "Saying 'technologies' when you mean technology in general. It is uncountable in that sense.",
      "Turning every answer into a speech about how technology has advantages and disadvantages.",
      "Saying 'I am good in computers'. It is 'good at' or 'good with'.",
    ],
  },
  books: {
    phrases: {
      starting: [
        "Less than I'd like, honestly — mostly...",
        "I read most days, though usually...",
        "It's almost all non-fiction these days:...",
      ],
      extending: [
        "I prefer paper for..., but a screen is easier when...",
        "I was read to a lot as a child — mainly...",
        "The one I'd press on people is..., because...",
      ],
      concluding: [
        "So the habit is there, it's just competing with a phone.",
        "Writing one myself feels unlikely, but I like the idea.",
        "That's the book I always come back to.",
      ],
    },
    tips: [
      "Name a genre and a title. 'I like books' is unmarkable; 'mostly popular science, things like...' is instantly better.",
      "Paper versus screen is a comparison question — use 'whereas', 'on the other hand', and one practical reason each way.",
      "For the childhood question, 'read' needs a 'to': 'my mother read to me', or the passive 'I was read to as a child'.",
    ],
    mistakes: [
      "Saying 'I read many books' without ever naming one.",
      "Confusing 'read' past and present. Say the past as 'red' — examiners hear the difference.",
      "Answering the recommendation question with a summary of the plot instead of who would enjoy it and why.",
    ],
  },
  holidays: {
    phrases: {
      starting: [
        "Usually somewhere fairly close — we tend to...",
        "We don't go far, but...",
        "It varies, but the last few have all been...",
      ],
      extending: [
        "I'd take several short breaks over one long trip, because...",
        "Normally it's with..., which changes how you travel.",
        "I'm a planner, though not to the point of...",
      ],
      concluding: [
        "So the ideal for me is somewhere quiet with one thing worth seeing.",
        "With a free month I'd..., which I'll probably never actually do.",
        "That's the holiday I'd repeat tomorrow.",
      ],
    },
    tips: [
      "In British English 'holiday' covers a trip, a public day off and a school break, so 'on holiday in Samarkand' and 'the summer holidays' are both right. American English uses 'vacation' for the first two.",
      "The 'if you had a month free' question is a second conditional. Keep it consistent: 'If I had..., I'd...'",
      "The last-holiday question is past simple and needs three or four actions in sequence, not one sentence.",
    ],
    mistakes: [
      "Saying 'I went to holiday'. It is 'on holiday'.",
      "Answering with a destination and nothing else. Add who with, how long, and one thing you did.",
      "Mixing 'travel', 'trip' and 'journey'. Travel is general, a trip is the whole visit, a journey is the movement itself.",
    ],
  },
  weather: {
    phrases: {
      starting: [
        "Continental, really: very hot summers and...",
        "It's a climate of extremes rather than...",
        "Right now we're in..., which is the best part of the year.",
      ],
      extending: [
        "It definitely affects me — on grey days I...",
        "I check it, but mostly just to decide whether...",
        "It has shifted since I was a child: the summers...",
      ],
      concluding: [
        "So I'd take four clear seasons over constant sunshine.",
        "Somewhere milder would suit me, though I'd miss the heat.",
        "That's why spring is the season everyone here waits for.",
      ],
    },
    tips: [
      "Build a stock of weather adjectives beyond hot and cold: humid, crisp, stifling, mild, bitter, unsettled.",
      "The climate-change question needs careful comparison of past and present, plus hedging: 'it seems to have', 'people say that'.",
      "'Does the weather affect your mood' invites cause-and-effect language: it makes me, I tend to, it puts me in the mood for.",
    ],
    mistakes: [
      "Confusing weather and climate. Weather is today; climate is the long-term pattern.",
      "Saying 'the weather is very good' repeatedly instead of describing it.",
      "Saying 'in the winter it makes cold'. It is 'it gets cold' or 'it's cold'.",
    ],
  },
  neighbours: {
    phrases: {
      starting: [
        "Some of them, yes — mainly the family who...",
        "Not really, which is fairly normal in a block of flats.",
        "Better than I expected, actually, considering...",
      ],
      extending: [
        "A good neighbour, to me, is someone who...",
        "I did ask once, when...",
        "It was different growing up: in a courtyard everyone...",
      ],
      concluding: [
        "So it's friendly without being intrusive, which suits me.",
        "I'd choose somewhere quieter, even if it meant knowing fewer people.",
        "That balance is harder to find in a big city.",
      ],
    },
    tips: [
      "Two questions here contrast now and childhood. Signal the shift clearly with 'back then' and 'these days'.",
      "The 'good neighbour' question wants a defining relative clause: 'someone who doesn't make noise late at night but will take a parcel for you'.",
      "'Have you ever asked a neighbour for help' is present perfect for the question, past simple for the story. Switch tense when you give the example.",
    ],
    mistakes: [
      "Mispronouncing the key word all the way through. 'Neighbour' is two syllables, NAY-ber — the 'gh' is silent.",
      "Answering only with 'yes, they are very kind people' and no example.",
      "Saying 'my neighbours are noise'. Noise is the thing; noisy is the adjective.",
    ],
  },
  clothes: {
    phrases: {
      starting: [
        "Fairly plain things — jeans, a shirt, nothing...",
        "It depends entirely on where I'm going:...",
        "I've got a sort of uniform, honestly:...",
      ],
      extending: [
        "For university I'd dress a bit smarter, mostly because...",
        "I buy things maybe..., and usually only when...",
        "Traditional clothes come out for..., but not day to day.",
      ],
      concluding: [
        "So comfort wins, though I'd rather not look scruffy.",
        "Following fashion closely has never really appealed to me.",
        "That's why my wardrobe barely changes from year to year.",
      ],
    },
    tips: [
      "'Clothes' has no singular and no 'a'. Say 'a piece of clothing' or 'an item of clothing' if you need one.",
      "The comfort-versus-appearance question is a straight comparison — commit to one and concede something to the other.",
      "The childhood question needs past simple plus 'let' or 'allowed to': 'my mother chose most of it until I was about twelve'.",
    ],
    mistakes: [
      "Saying 'I wear a cloth'. A cloth is a rag for cleaning.",
      "Saying 'I like fashion' with nothing after it. Name a style, a colour, or a brand you avoid.",
      "Saying 'I dress a jacket'. You wear a jacket, or you put it on — 'dress' takes no clothing object.",
    ],
  },
  pets: {
    phrases: {
      starting: [
        "Not at the moment, though we did have...",
        "We had... for about ten years when I was younger.",
        "No, mainly because the flat is...",
      ],
      extending: [
        "They're common enough here, though more...",
        "The best part is probably..., which sounds sentimental but...",
        "For children I think they're useful because...",
      ],
      concluding: [
        "So I'd like one eventually, once I'm somewhere more settled.",
        "It's a bigger commitment than people expect.",
        "That's the one animal I could never keep indoors.",
      ],
    },
    tips: [
      "If you have no pet, say so and pivot to a past one or a relative's. A flat 'no' ends the answer and wastes the question.",
      "The 'are pets good for children' question is mildly abstract — it is a preview of Part 3. Give a reason, not just an opinion.",
      "Use 'keep', 'look after' and 'take care of' rather than 'have' four times.",
    ],
    mistakes: [
      "Saying 'I have a pet cat named...' in the present when the animal died years ago.",
      "Answering 'which animal would you never keep' with a joke and no reason.",
      "Confusing 'animal' and 'pet'. Every pet is an animal; not every animal is a pet.",
    ],
  },
  photography: {
    phrases: {
      starting: [
        "I take a lot, but I wouldn't call it photography.",
        "Only casually — mostly...",
        "More than I used to, since the phone camera got good enough.",
      ],
      extending: [
        "It's usually..., rarely people.",
        "Almost nothing gets printed now, which is a bit of a shame because...",
        "I'm happier behind the camera than in front of it.",
      ],
      concluding: [
        "So they pile up on the phone and I look at them once a year.",
        "Learning it properly is on the list, somewhere below...",
        "That's what old printed photos have that a gallery of thousands doesn't.",
      ],
    },
    tips: [
      "Use 'take a photo', never 'make a photo' or 'do a photo'.",
      "The print-or-phone question is a natural place for a then-and-now contrast and for 'hardly anyone... any more'.",
      "'Do you like being in photographs' asks about you, not about photos. Answer with a feeling and a reason.",
    ],
    mistakes: [
      "Saying 'I like photo'. It needs a plural or an article: photos, a photo, photography.",
      "Talking about social media instead of answering the question about your own habits.",
      "Confusing 'photograph' (the picture), 'photographer' (the person) and 'photography' (the activity).",
    ],
  },
  "social-media": {
    phrases: {
      starting: [
        "Mainly..., and I have an account on... that I never use.",
        "Fewer than most people my age, I think:...",
        "It's really just... for me, and that's mostly for messaging.",
      ],
      extending: [
        "Probably around... a day, which is more than I'd admit to.",
        "I read far more than I post — I'd guess...",
        "It has changed how we keep in touch: instead of..., now...",
      ],
      concluding: [
        "So a week without it would be uncomfortable for a day and then fine.",
        "People do overshare, though I'd rather that than nobody saying anything.",
        "That's really the trade-off: convenience against attention.",
      ],
    },
    tips: [
      "Give a real number for screen time. A specific figure with a comment on it is much stronger than 'too much'.",
      "'Do people share too much' is an opinion question in Part 1 clothing — one clear position plus one reason is enough. Save the analysis for Part 3.",
      "The 'could you manage without it' question needs a conditional: 'I could, though I'd probably...'",
    ],
    mistakes: [
      "Saying 'social medias'. Media is already plural; the phrase does not take an -s.",
      "Listing every platform you have heard of instead of the two or three you actually use.",
      "Turning the answer into a warning about the dangers of the internet. The question was about you.",
    ],
  },
  running: {
    phrases: {
      starting: [
        "Occasionally — I go through phases of...",
        "I try to, maybe... a week when the weather allows.",
        "I've started recently, mostly because...",
      ],
      extending: [
        "Most people here run in..., since there aren't many...",
        "What keeps me going is..., rather than any real discipline.",
        "I'd rather go alone, honestly, because...",
      ],
      concluding: [
        "So it's the cheapest exercise available, and that's most of the appeal.",
        "A race would probably be the thing that made me train properly.",
        "That's why it's the habit I keep restarting.",
      ],
    },
    tips: [
      "'Go running' and 'go for a run' are the natural forms. 'Do running' and 'play running' are both wrong.",
      "The motivation question suits gerunds: 'seeing the numbers improve', 'having someone waiting for me'.",
      "If you do not run, say so quickly and answer about the exercise you actually do — the examiner will accept the redirect.",
    ],
    mistakes: [
      "Saying 'I am running every morning' when you mean it as a habit. Habits take the present simple.",
      "Giving one word and stopping, which is very common when the topic does not apply to you.",
      "Confusing 'exercise' (uncountable, general) with 'exercises' (specific movements).",
    ],
  },
  cooking: {
    phrases: {
      starting: [
        "Enough to feed myself, though nothing ambitious.",
        "Yes, out of necessity more than interest — since I moved...",
        "Reasonably well, actually; I picked it up from...",
      ],
      extending: [
        "The first thing I learned was..., which is almost impossible to ruin.",
        "I follow a recipe the first time and then...",
        "During the week it's maybe..., and more at the weekend.",
      ],
      concluding: [
        "So it's a routine rather than a hobby, but I don't mind it.",
        "The dish I'd like to master is..., mostly because...",
        "That's the one thing I'd want to be able to cook properly.",
      ],
    },
    tips: [
      "Use cooking verbs precisely: fry, boil, bake, roast, stew, steam. They are easy marks for vocabulary range.",
      "'Who taught you' is a short past-simple question — answer the person, then add how, or the answer will be two words long.",
      "The frequency question wants a number, and a contrast between weekdays and weekends gives you a second sentence.",
    ],
    mistakes: [
      "Saying 'I cook a food'. Food is uncountable — cook a meal, a dish, or dinner.",
      "Confusing 'cook' (the person or the verb) with 'cooker' (the appliance). You are a good cook, not a good cooker.",
      "Answering 'do you know how to cook' with yes or no and nothing else.",
    ],
  },
  travelling: {
    phrases: {
      starting: [
        "Not as much as I'd like — mostly within the country.",
        "A fair amount, though almost all of it for...",
        "Twice abroad, and quite a bit inside...",
      ],
      extending: [
        "Overland, usually: the train is...",
        "The furthest I've been is..., which took...",
        "I'd take a city over the countryside, though...",
      ],
      concluding: [
        "So the list of places I want to see keeps growing faster than the list I've been to.",
        "The one country I'd choose is..., because...",
        "That's the thing I never leave without.",
      ],
    },
    tips: [
      "'Travel' is uncountable as a noun. Say 'a trip', 'a journey' or 'travelling' — not 'a travel'.",
      "The furthest-you-have-been question is present perfect with a superlative: 'the furthest I've ever been'.",
      "The packing question is a chance for concrete nouns. Two specific objects and why beats a general list.",
    ],
    mistakes: [
      "Saying 'I like travel to other countries'. Use 'travelling to' or 'to travel to'.",
      "Answering the transport question with 'by car' and nothing more.",
      "Confusing 'been' and 'gone'. 'I've been to Kazakhstan' means you came back; 'he's gone' means he is still there.",
    ],
  },
  "daily-routine": {
    phrases: {
      starting: [
        "Around..., though it slips later at the weekend.",
        "Earlier than I'd choose to, because...",
        "It depends on whether I have a morning class:...",
      ],
      extending: [
        "A normal weekday runs... then... and by the evening I'm usually...",
        "I'm sharpest in..., so I try to put the difficult work there.",
        "It changed quite a lot when I...",
      ],
      concluding: [
        "So the shape is fixed even if the details move around.",
        "The thing I'd add is..., if I could find the time for it.",
        "That's really the part of the day I'd protect first.",
      ],
    },
    tips: [
      "This topic is built on the present simple and frequency adverbs. Vary them: usually, normally, tend to, more often than not, hardly ever.",
      "'Describe a typical weekday' asks for a sequence. Use first, then, after that, by the time — but only three or four steps, not the whole day.",
      "Prepositions of time cost easy marks: at seven, in the morning, on Fridays, around midday.",
    ],
    mistakes: [
      "Reciting every hour of the day. Three stages and a comment is a better answer than a timetable.",
      "Saying 'I wake up at 7 o'clock in the morning every day' — 'in the morning' and 'every day' are both redundant there.",
      "Confusing 'wake up' with 'get up'. You wake up, then you get up.",
    ],
  },
  teachers: {
    phrases: {
      starting: [
        "That'd be..., who taught me...",
        "There were two, but the one who mattered most was...",
        "I had a teacher in the last two years of school who...",
      ],
      extending: [
        "What made her good was..., rather than...",
        "I'd take a demanding teacher over a relaxed one, as long as...",
        "It's still a respected job here, though...",
      ],
      concluding: [
        "So the explaining mattered more than the discipline.",
        "I might teach at some point, but not as a career.",
        "That's the hardest part of the job, I think: doing it for thirty people at once.",
      ],
    },
    tips: [
      "Name the teacher and the subject in your first sentence. The rest of the topic hangs on that one person.",
      "'What made them good' wants character adjectives plus behaviour: patient, but also 'she made us explain the answer back to her'.",
      "Keep school memories in the past simple, and use 'would' for repeated past behaviour: 'she'd always start with a question'.",
    ],
    mistakes: [
      "Saying 'she learned us English'. Teachers teach; students learn.",
      "Describing teaching in general instead of one teacher you actually had.",
      "Using 'strict' as if it were negative and 'relaxed' as if it were positive. The question invites you to weigh both.",
    ],
  },
  "public-transport": {
    phrases: {
      starting: [
        "Mostly the metro, with a bus at either end.",
        "I walk where I can and take... when I can't.",
        "It varies, but the fastest option is usually...",
      ],
      extending: [
        "It's reliable enough — the metro certainly is, though the buses...",
        "Door to door it's about..., which I've stopped resenting.",
        "It has improved: they've added...",
      ],
      concluding: [
        "So I'd rather not drive, even if I could afford to.",
        "The time isn't wasted, as long as I've got something to listen to.",
        "That's the trade-off: cheaper and slower against faster and stuck in traffic.",
      ],
    },
    tips: [
      "Transport prepositions are a frequent error: on the bus, on the metro, in a car, in a taxi, by bus, on foot.",
      "'Has it improved' needs the present perfect plus a concrete change: a new line, a card system, more frequent services.",
      "Give the commute in minutes. A number makes the whole answer sound real.",
    ],
    mistakes: [
      "Saying 'I go by foot'. It is 'on foot'.",
      "Saying 'transports'. Transport is uncountable in British English.",
      "Answering 'do you prefer buses or the metro' without saying why — the reason is where the marks are.",
    ],
  },
  art: {
    phrases: {
      starting: [
        "Mildly — I wouldn't seek it out, but...",
        "More than I expected to be, since...",
        "Not really, though I do like...",
      ],
      extending: [
        "At school it was..., which put me off rather than...",
        "The last gallery I went to was..., and what stayed with me was...",
        "I think children should study it, if only because...",
      ],
      concluding: [
        "So I'm a visitor rather than someone who makes anything.",
        "Design interests me far more than painting, honestly.",
        "That's why the craft traditions here matter more to me than fine art.",
      ],
    },
    tips: [
      "If art does not interest you, say so honestly and explain what does — design, architecture, embroidery, calligraphy. Feigned enthusiasm is obvious.",
      "'Should children study art' is an opinion question. One reason, one example, and stop.",
      "Use the right verbs: you draw a picture, paint a portrait, make something, and go to an exhibition.",
    ],
    mistakes: [
      "Saying 'I like the art'. In a general statement art takes no article — 'I like art', 'art is important'.",
      "Confusing 'draw' and 'paint', or 'painting' (the object) and 'painting' (the activity).",
      "Answering only about school art lessons when the question was about your interest now.",
    ],
  },
  money: {
    phrases: {
      starting: [
        "Not particularly — I manage, but...",
        "Easier now than it was, mostly because...",
        "It comes in waves: I save well for a month and then...",
      ],
      extending: [
        "Almost everything goes by card now, which makes it...",
        "I did get pocket money, and I spent all of it on...",
        "The biggest single thing is..., which I can't really avoid.",
      ],
      concluding: [
        "So I'd rather save for one big thing than spend it in small pieces.",
        "Keeping track is the habit that actually made the difference.",
        "That's the change I've noticed most: nobody carries cash any more.",
      ],
    },
    tips: [
      "Money is uncountable — 'a lot of money', not 'many moneys'. If you need a figure, count the currency: 'about fifty thousand so'm'.",
      "The cash-versus-card question is a then-and-now comparison and a good place for the present perfect: 'it's become almost impossible to'.",
      "Use the natural collocations: save up, spend on, put money aside, get by, be short of money.",
    ],
    mistakes: [
      "Saying 'moneys' or 'many money'.",
      "Answering the pocket-money question in the present tense when it is asking about your childhood.",
      "Being so vague about spending that the answer says nothing. One category and one example is enough.",
    ],
  },
  health: {
    phrases: {
      starting: [
        "Reasonably, with a few obvious gaps.",
        "Healthier than I was a year ago, though that's a low bar.",
        "Physically yes, but my sleep is...",
      ],
      extending: [
        "Around... hours, which isn't enough and I know it.",
        "When I'm stressed I usually..., which helps more than...",
        "My diet has changed since I started cooking for myself:...",
      ],
      concluding: [
        "So the one habit I'd fix is sleep, before anything else.",
        "People here take advice seriously when it comes from a doctor, less so from an app.",
        "Check-ups aren't really the culture here, which is probably a mistake.",
      ],
    },
    tips: [
      "Be honest. A candidate who admits to poor sleep and explains why sounds far more natural than one who claims perfect habits.",
      "Use 'do exercise', 'take exercise' or 'get some exercise' — never 'make exercise' or 'make sport'.",
      "The stress question invites gerunds after prepositions: 'I deal with it by walking', 'I relax by cooking'.",
    ],
    mistakes: [
      "Saying 'I am healthy person' without the article.",
      "Using the noun where the adjective belongs: 'my health habits are good' should be 'my habits are healthy'.",
      "Listing what you eat instead of answering whether your habits have changed.",
    ],
  },
  "language-learning": {
    phrases: {
      starting: [
        "About... years in total, on and off.",
        "Since I was..., though the useful part started much later.",
        "Formally since school, but properly only in the last couple of years.",
      ],
      extending: [
        "The hardest part for me is..., far more than grammar.",
        "I practise mainly by..., which isn't ideal but it's what's available.",
        "My first lesson I barely remember, except that...",
      ],
      concluding: [
        "So progress came from using it, not from studying it.",
        "The advice I'd give a beginner is..., because that's what I got wrong.",
        "That's the one thing I'd do differently if I started again.",
      ],
    },
    tips: [
      "This topic invites you to talk about English while being assessed on it. Keep it simple and accurate rather than reaching for clever vocabulary.",
      "'How long have you been learning' takes the present perfect continuous: 'I've been learning English for about nine years'.",
      "The advice question needs modals: you should, it's worth, I'd suggest, try to.",
    ],
    mistakes: [
      "Saying 'I learn English since 2015'. It must be 'I've been learning' or 'I've learned'.",
      "Confusing 'learn' and 'study', or 'teach' and 'learn'.",
      "Answering 'how do you practise speaking' with 'I practise every day' and no method. Name the actual thing you do.",
    ],
  },
  childhood: {
    phrases: {
      starting: [
        "Mostly outdoors — we'd be out until...",
        "In..., in a house with...",
        "The usual things, though what I remember best is...",
      ],
      extending: [
        "I was closest to..., probably because...",
        "The games were all improvised: we played...",
        "My first school I remember as..., mainly the...",
      ],
      concluding: [
        "So it was a freer childhood than children get now, for better and worse.",
        "The thing I miss is..., which you can't really recreate.",
        "That's the difference I notice most with my younger cousins.",
      ],
    },
    tips: [
      "This whole topic is past tense. 'Used to' and 'would' both express repeated past habits — use both for range.",
      "'Do you think childhood is different today' is the one present-tense question. Signal the switch: 'These days, though...'",
      "Concrete nouns carry this topic: the name of a game, a street, a tree, a bicycle.",
    ],
    mistakes: [
      "Drifting into the present halfway through a childhood memory.",
      "Saying 'when I was child' — it needs 'a child'.",
      "Using 'used to' for a single past event. It is only for repeated habits or past states.",
    ],
  },
  weekends: {
    phrases: {
      starting: [
        "Fairly quiet ones, usually — I catch up on...",
        "Saturday is for..., and Sunday is...",
        "It depends how much work has piled up, but generally...",
      ],
      extending: [
        "I'd rather be at home, honestly, after a week of...",
        "Sunday we normally..., which is more or less fixed.",
        "Last weekend I..., which was more eventful than most.",
      ],
      concluding: [
        "So it's rest first and plans second.",
        "An ideal one would be..., though that almost never happens.",
        "That's the routine I'd keep even if I had more free time.",
      ],
    },
    tips: [
      "British English says 'at the weekend'; American English says 'on the weekend'. Either is accepted, but be consistent.",
      "'What did you do last weekend' is past simple and needs three actions, not one. The examiner is checking narrative tense.",
      "The 'ideal weekend' question is hypothetical: 'I'd start with...', 'there'd be no...'",
    ],
    mistakes: [
      "Answering the last-weekend question in the present tense.",
      "Saying 'I stay at home and rest' as the entire answer to every question in the topic.",
      "Saying 'in the weekend', which is not a natural form in either variety.",
    ],
  },
};
