/** Per-topic Part 1 material.
 *
 *  Part 1 questions used to come from one seven-slot template with the topic
 *  name interpolated, so every card in the app opened with "Do you enjoy
 *  talking about <topic>?" and asked whether the topic "is more important now
 *  than in the past" — a question that means nothing about a daily routine or a
 *  hometown. The vocabulary was one shared list of four words for all thirty
 *  topics. Both are written per topic here.
 *
 *  Questions follow the real Part 1 shape: short, personal, present-tense
 *  first, then one past and one future question, three to four sentences of
 *  answer each.
 */
export interface Part1Vocabulary {
  word: string;
  uz: string;
  definition: string;
  example: string;
}

export interface Part1Content {
  questions: [string, string, string, string, string, string, string];
  vocabulary: [Part1Vocabulary, Part1Vocabulary, Part1Vocabulary, Part1Vocabulary];
}

export const PART1_CONTENT: Record<string, Part1Content> = {
  "work-study": {
    questions: [
      "Do you work, or are you a student?",
      "What is the most interesting part of your work or course?",
      "Is there anything you would like to change about your studies or your job?",
      "Do you prefer working in the morning or later in the day?",
      "What subject did you enjoy most at school?",
      "Do you think you will still be doing the same thing in five years?",
      "Would you rather work alone or as part of a team?",
    ],
    vocabulary: [
      { word: "workload", uz: "ish yuki", definition: "the amount of work a person has to do", example: "My workload gets heavier towards the end of the term." },
      { word: "deadline", uz: "muddat", definition: "the time by which something must be finished", example: "I work best when there is a clear deadline." },
      { word: "hands-on", uz: "amaliy", definition: "involving doing something rather than only studying it", example: "I prefer hands-on tasks to long lectures." },
      { word: "to specialise in", uz: "ixtisoslashmoq", definition: "to focus on one particular area", example: "I would like to specialise in data analysis." },
    ],
  },
  hometown: {
    questions: [
      "Where is your hometown?",
      "How long have you lived there?",
      "What is your hometown known for?",
      "Has your hometown changed much since you were a child?",
      "What do visitors usually enjoy most about it?",
      "Is it a good place for young people to live?",
      "Would you like to move somewhere else in the future?",
    ],
    vocabulary: [
      { word: "outskirts", uz: "chekka, atrof", definition: "the outer parts of a town or city", example: "We live on the outskirts, about twenty minutes from the centre." },
      { word: "bustling", uz: "gavjum", definition: "full of busy activity", example: "The old bazaar is bustling every Sunday morning." },
      { word: "landmark", uz: "diqqatga sazovor joy", definition: "a building or place that is easy to recognise", example: "The blue-domed mosque is the main landmark here." },
      { word: "close-knit", uz: "ahil, jipslashgan", definition: "with people who know and support each other well", example: "It is a close-knit neighbourhood where everyone knows your name." },
    ],
  },
  home: {
    questions: [
      "Do you live in a house or an apartment?",
      "Which room do you spend the most time in?",
      "What would you change about your home if you could?",
      "Do you prefer to have guests at home or meet people outside?",
      "Did you share a room when you were younger?",
      "What kind of home would you like to have in the future?",
      "Is there a view from your window?",
    ],
    vocabulary: [
      { word: "spacious", uz: "keng", definition: "with plenty of room", example: "The kitchen is small, but the living room is quite spacious." },
      { word: "cosy", uz: "shinam", definition: "warm and comfortable in a small way", example: "I made my room cosy with a rug and a reading lamp." },
      { word: "to do up", uz: "ta'mirlamoq", definition: "to repair or redecorate a place", example: "We are doing up the balcony this spring." },
      { word: "clutter", uz: "tartibsiz narsalar", definition: "too many things left lying around", example: "I clear the clutter off my desk before I study." },
    ],
  },
  friends: {
    questions: [
      "Do you have a large group of friends or a few close ones?",
      "How did you meet your closest friend?",
      "What do you usually do when you meet up?",
      "Is it easy to make new friends where you live?",
      "Have your friendships changed since you left school?",
      "What qualities do you look for in a friend?",
      "Do you prefer to talk to friends face to face or online?",
    ],
    vocabulary: [
      { word: "to get on with", uz: "chiqishib ketmoq", definition: "to have a good relationship with someone", example: "I get on with almost everyone in my group." },
      { word: "reliable", uz: "ishonchli", definition: "someone you can depend on", example: "She is the most reliable friend I have." },
      { word: "to lose touch", uz: "aloqani yo'qotmoq", definition: "to stop contacting each other", example: "It is easy to lose touch once people move abroad." },
      { word: "mutual friend", uz: "umumiy do'st", definition: "a person two people both know", example: "We met through a mutual friend at university." },
    ],
  },
  music: {
    questions: [
      "What kind of music do you listen to?",
      "When do you usually listen to music?",
      "Have you ever learned to play an instrument?",
      "Do you prefer live concerts or recordings?",
      "Has your taste in music changed over the years?",
      "Is traditional music popular among young people in your country?",
      "Would you like to learn an instrument in the future?",
    ],
    vocabulary: [
      { word: "catchy", uz: "yodda qoladigan", definition: "easy to remember and pleasant to hear", example: "The chorus is so catchy that I hum it all day." },
      { word: "lyrics", uz: "qo'shiq matni", definition: "the words of a song", example: "I listen to English songs and read the lyrics." },
      { word: "to be into", uz: "qiziqmoq", definition: "to be interested in something", example: "I am really into acoustic music at the moment." },
      { word: "upbeat", uz: "quvnoq, jonli", definition: "cheerful and fast in rhythm", example: "I put on something upbeat when I go running." },
    ],
  },
  movies: {
    questions: [
      "How often do you watch films?",
      "Do you prefer watching films at home or at the cinema?",
      "What type of film do you enjoy least?",
      "Is there a film you have watched more than once?",
      "Did you watch many films when you were a child?",
      "Do you like films in their original language or dubbed?",
      "Would you ever recommend a film to someone who does not usually watch them?",
    ],
    vocabulary: [
      { word: "plot", uz: "syujet", definition: "the main story of a film or book", example: "The plot was slow at first but became gripping." },
      { word: "gripping", uz: "maroqli, ushlab turadigan", definition: "so interesting that you cannot stop watching", example: "It was a gripping thriller from the first scene." },
      { word: "subtitles", uz: "subtitrlar", definition: "translated text shown at the bottom of the screen", example: "I watch with English subtitles to catch new words." },
      { word: "far-fetched", uz: "ishonarsiz", definition: "hard to believe", example: "The ending was a bit far-fetched for me." },
    ],
  },
  food: {
    questions: [
      "What is your favourite dish?",
      "Do you usually eat at home or eat out?",
      "Who does most of the cooking in your family?",
      "Have your eating habits changed in recent years?",
      "Is there any food you disliked as a child but enjoy now?",
      "What would you cook for a visitor from another country?",
      "Do you pay attention to how healthy your meals are?",
    ],
    vocabulary: [
      { word: "hearty", uz: "to'yimli", definition: "large and satisfying, said of a meal", example: "Winter calls for a hearty soup." },
      { word: "home-cooked", uz: "uyda tayyorlangan", definition: "prepared at home rather than bought", example: "Nothing beats a home-cooked meal after a long day." },
      { word: "to have a sweet tooth", uz: "shirinlikka o'ch bo'lmoq", definition: "to like sugary food a lot", example: "I have a sweet tooth, so I always order dessert." },
      { word: "staple", uz: "asosiy taom", definition: "a food eaten very often and in large amounts", example: "Bread is a staple at every meal here." },
    ],
  },
  shopping: {
    questions: [
      "Do you enjoy shopping?",
      "Do you shop online or in physical stores?",
      "What was the last thing you bought for yourself?",
      "Do you usually plan your purchases or decide on the spot?",
      "Are there any markets near where you live?",
      "Has the way people shop in your country changed recently?",
      "Do you think you spend too much on things you do not need?",
    ],
    vocabulary: [
      { word: "bargain", uz: "arzon narx, yaxshi savdo", definition: "something bought for less than its usual price", example: "I got these shoes for half price — a real bargain." },
      { word: "to browse", uz: "ko'zdan kechirmoq", definition: "to look at goods without planning to buy", example: "I often browse without buying anything." },
      { word: "impulse buy", uz: "o'ylamay qilingan xarid", definition: "something bought suddenly without planning", example: "That jacket was an impulse buy I regret." },
      { word: "to haggle", uz: "savdolashmoq", definition: "to argue about the price", example: "At the bazaar you are expected to haggle a little." },
    ],
  },
  sports: {
    questions: [
      "Do you play any sports?",
      "Which sport is most popular in your country?",
      "Do you prefer watching sport or taking part?",
      "Did you do much sport at school?",
      "How do you keep fit these days?",
      "Is there a sport you would like to try?",
      "Do you follow any team or athlete?",
    ],
    vocabulary: [
      { word: "to work out", uz: "mashq qilmoq", definition: "to exercise, usually in a gym", example: "I work out three times a week before class." },
      { word: "stamina", uz: "chidamlilik", definition: "the strength to keep going for a long time", example: "Running has really improved my stamina." },
      { word: "competitive", uz: "raqobatbardosh, g'alabani yaxshi ko'radigan", definition: "wanting very much to win", example: "I am too competitive to enjoy losing." },
      { word: "to take up", uz: "boshlamoq (mashg'ulotni)", definition: "to start a new hobby or activity", example: "I took up swimming last summer." },
    ],
  },
  technology: {
    questions: [
      "What device do you use most often?",
      "How do you use the internet in your daily life?",
      "Are you good at learning to use new apps?",
      "Has technology changed the way you study?",
      "Do you remember the first computer or phone you used?",
      "Is there any technology you would rather live without?",
      "What kind of technology do you think you will use in ten years?",
    ],
    vocabulary: [
      { word: "user-friendly", uz: "qulay, oson", definition: "easy to use", example: "The app is user-friendly even for beginners." },
      { word: "to back up", uz: "zaxira nusxa olmoq", definition: "to save a copy of your files", example: "I back up my notes to the cloud every week." },
      { word: "glitch", uz: "nosozlik", definition: "a small fault in a system", example: "There was a glitch, so the app kept freezing." },
      { word: "screen time", uz: "ekran oldida o'tgan vaqt", definition: "the hours spent looking at a phone or computer", example: "I am trying to cut down my screen time in the evening." },
    ],
  },
  books: {
    questions: [
      "Do you read much in your free time?",
      "What kind of books do you prefer?",
      "Do you read on paper or on a screen?",
      "Were you read to as a child?",
      "Is there a book you would recommend to a friend?",
      "Do people in your country read as much as they used to?",
      "Would you like to write a book yourself one day?",
    ],
    vocabulary: [
      { word: "page-turner", uz: "qo'ldan qo'ymaydigan kitob", definition: "a book so exciting you keep reading", example: "It was a real page-turner — I finished it in two days." },
      { word: "to skim", uz: "yuzaki o'qib chiqmoq", definition: "to read quickly to get the main idea", example: "I skim the introduction before reading properly." },
      { word: "non-fiction", uz: "badiiy bo'lmagan adabiyot", definition: "writing about real facts and events", example: "I mostly read non-fiction about history." },
      { word: "to get through", uz: "o'qib tugatmoq", definition: "to finish reading something long", example: "It took me a month to get through that novel." },
    ],
  },
  holidays: {
    questions: [
      "Where do you usually go on holiday?",
      "Do you prefer short breaks or long trips?",
      "Who do you normally travel with?",
      "What did you do on your last holiday?",
      "Do you like planning a trip in advance?",
      "Are there public holidays you particularly enjoy?",
      "Where would you go if you had a month free?",
    ],
    vocabulary: [
      { word: "getaway", uz: "qisqa dam olish safari", definition: "a short holiday away from home", example: "We had a weekend getaway to the mountains." },
      { word: "to unwind", uz: "dam olmoq, bo'shashmoq", definition: "to relax after being busy", example: "I need two days just to unwind." },
      { word: "itinerary", uz: "safar rejasi", definition: "a plan of a journey", example: "Our itinerary was packed with museums." },
      { word: "off the beaten track", uz: "odam kam boradigan joy", definition: "away from the places tourists usually visit", example: "We stayed somewhere off the beaten track." },
    ],
  },
  weather: {
    questions: [
      "What is the weather like where you live?",
      "Which season do you prefer?",
      "Does the weather affect your mood?",
      "Do you check the forecast before going out?",
      "What do you usually do on a rainy day?",
      "Has the climate changed since you were a child?",
      "Would you like to live somewhere with a different climate?",
    ],
    vocabulary: [
      { word: "scorching", uz: "jazirama", definition: "extremely hot", example: "July here is absolutely scorching." },
      { word: "mild", uz: "mo'tadil", definition: "neither too hot nor too cold", example: "We had a surprisingly mild winter." },
      { word: "downpour", uz: "jala", definition: "a sudden heavy fall of rain", example: "We got caught in a downpour on the way home." },
      { word: "to brighten up", uz: "ochilib ketmoq (ob-havo)", definition: "to become sunnier", example: "It usually brightens up by the afternoon." },
    ],
  },
  neighbours: {
    questions: [
      "Do you know your neighbours well?",
      "How often do you speak to them?",
      "What makes someone a good neighbour?",
      "Have you ever asked a neighbour for help?",
      "Were your neighbours different when you were growing up?",
      "Do neighbours in your country help each other?",
      "Would you like to live somewhere quieter or livelier?",
    ],
    vocabulary: [
      { word: "considerate", uz: "e'tiborli, andishali", definition: "careful not to disturb other people", example: "Our neighbours are considerate about noise." },
      { word: "to keep to oneself", uz: "o'zi bilan o'zi bo'lmoq", definition: "to avoid mixing with other people", example: "The family upstairs keep to themselves." },
      { word: "to look out for", uz: "g'amxo'rlik qilmoq", definition: "to take care of someone", example: "Neighbours here look out for each other's children." },
      { word: "communal", uz: "umumiy", definition: "shared by a group of people", example: "We share a communal courtyard." },
    ],
  },
  clothes: {
    questions: [
      "What kind of clothes do you usually wear?",
      "Do you dress differently at work or university than at home?",
      "How often do you buy new clothes?",
      "Do you follow fashion?",
      "Did you choose your own clothes as a child?",
      "Are traditional clothes still worn in your country?",
      "Is comfort or appearance more important to you?",
    ],
    vocabulary: [
      { word: "casual", uz: "kundalik, erkin uslub", definition: "informal and relaxed in style", example: "I wear something casual at the weekend." },
      { word: "to suit", uz: "yarashmoq", definition: "to look good on someone", example: "That colour really suits you." },
      { word: "hand-me-down", uz: "kattadan qolgan kiyim", definition: "clothing passed on from an older person", example: "Most of my winter coats were hand-me-downs." },
      { word: "to dress up", uz: "chiroyli kiyinmoq", definition: "to wear smart clothes for an occasion", example: "We dressed up for my cousin's wedding." },
    ],
  },
  pets: {
    questions: [
      "Do you have a pet?",
      "Did you have any animals at home when you were a child?",
      "Are pets common in your country?",
      "What is the best thing about keeping an animal?",
      "Do you think pets are good for children?",
      "Which animal would you never keep at home?",
      "Would you like to have a pet in the future?",
    ],
    vocabulary: [
      { word: "loyal", uz: "sodiq", definition: "always faithful to its owner", example: "Dogs are famously loyal animals." },
      { word: "to look after", uz: "qaramoq", definition: "to take care of", example: "I look after my sister's cat when she travels." },
      { word: "well-behaved", uz: "yaxshi tarbiyalangan", definition: "calm and obedient", example: "Their dog is remarkably well-behaved." },
      { word: "companionship", uz: "hamrohlik", definition: "the comfort of having company", example: "For older people a pet offers real companionship." },
    ],
  },
  photography: {
    questions: [
      "Do you like taking photographs?",
      "What do you usually photograph?",
      "Do you print your photos or keep them on your phone?",
      "Has taking pictures become easier than it used to be?",
      "Do you like being in photographs yourself?",
      "Do you look back at old photos often?",
      "Would you like to learn photography properly?",
    ],
    vocabulary: [
      { word: "snapshot", uz: "tezkor surat", definition: "a quick, informal photograph", example: "It is only a snapshot, but I love it." },
      { word: "to capture", uz: "suratga tushirmoq, aks ettirmoq", definition: "to record a moment or feeling", example: "That picture captures the whole evening." },
      { word: "scenery", uz: "manzara", definition: "the natural features of a landscape", example: "The scenery in the mountains is worth photographing." },
      { word: "to edit", uz: "tahrirlamoq", definition: "to change a photo on a computer or phone", example: "I only edit the brightness a little." },
    ],
  },
  "social-media": {
    questions: [
      "Which social media platforms do you use?",
      "How much time do you spend on them each day?",
      "Do you post often or mostly read what others share?",
      "Has social media changed how you keep in touch with friends?",
      "Did you use these apps when you were at school?",
      "Do you think people share too much online?",
      "Could you manage without social media for a week?",
    ],
    vocabulary: [
      { word: "to scroll", uz: "varaqlamoq", definition: "to move through content on a screen", example: "I scroll for far longer than I intend to." },
      { word: "feed", uz: "lenta", definition: "the stream of posts you see", example: "My feed is mostly football and cooking." },
      { word: "to post", uz: "joylashtirmoq", definition: "to put something online", example: "I rarely post photos of myself." },
      { word: "digital detox", uz: "gadjetlardan dam olish", definition: "a period of staying away from screens", example: "I did a short digital detox during exams." },
    ],
  },
  running: {
    questions: [
      "Do you ever go running?",
      "Where do people usually run in your area?",
      "How do you stay motivated to exercise?",
      "Do you prefer exercising alone or with others?",
      "Did you run at school?",
      "Is running becoming more popular in your country?",
      "Would you consider entering a race?",
    ],
    vocabulary: [
      { word: "pace", uz: "sur'at", definition: "the speed at which you move", example: "I keep a slow, steady pace." },
      { word: "to build up", uz: "asta oshirmoq", definition: "to increase gradually", example: "I built up to five kilometres over a month." },
      { word: "out of breath", uz: "hansiragan", definition: "breathing hard after effort", example: "I was out of breath after the first hill." },
      { word: "to stick with it", uz: "tashlamay davom etmoq", definition: "to continue despite difficulty", example: "The first week is hard, but I stuck with it." },
    ],
  },
  cooking: {
    questions: [
      "Do you know how to cook?",
      "Who taught you?",
      "What is the first dish you learned to make?",
      "Do you follow recipes or cook from memory?",
      "How often do you cook during the week?",
      "Is cooking a common hobby among young people here?",
      "Is there a dish you would like to learn?",
    ],
    vocabulary: [
      { word: "from scratch", uz: "boshidan, tayyor mahsulotsiz", definition: "using basic ingredients, nothing ready-made", example: "I make the dough from scratch." },
      { word: "recipe", uz: "retsept", definition: "a set of instructions for a dish", example: "I follow my grandmother's recipe exactly." },
      { word: "to season", uz: "ziravor qo'shmoq", definition: "to add salt, pepper or spices", example: "Season it well before it goes in the oven." },
      { word: "leftovers", uz: "ortib qolgan ovqat", definition: "food remaining after a meal", example: "I take the leftovers to work the next day." },
    ],
  },
  travelling: {
    questions: [
      "Do you travel much?",
      "How do you usually get around when you travel?",
      "What is the furthest you have been from home?",
      "Do you prefer cities or the countryside when you visit somewhere?",
      "Did your family travel when you were young?",
      "What do you always pack?",
      "Which country would you most like to visit?",
    ],
    vocabulary: [
      { word: "to set off", uz: "yo'lga chiqmoq", definition: "to start a journey", example: "We set off before sunrise to avoid traffic." },
      { word: "sightseeing", uz: "sayr, diqqatga sazovor joylarni ko'rish", definition: "visiting interesting places as a tourist", example: "We spent two days sightseeing in the old town." },
      { word: "jet lag", uz: "vaqt farqidan charchash", definition: "tiredness after a long flight across time zones", example: "The jet lag took me three days to shake off." },
      { word: "to travel light", uz: "kam yuk bilan sayohat qilmoq", definition: "to take very little luggage", example: "I always travel light — one small bag." },
    ],
  },
  "daily-routine": {
    questions: [
      "What time do you usually get up?",
      "Describe a typical weekday for you.",
      "Is your routine the same every day?",
      "When are you most productive?",
      "Has your routine changed in the last year?",
      "Do you plan your day in advance?",
      "Is there anything you would like to add to your routine?",
    ],
    vocabulary: [
      { word: "to get into a routine", uz: "tartibga kirishmoq", definition: "to establish a regular pattern", example: "It took a month to get into a proper routine." },
      { word: "hectic", uz: "shiddatli, notinch", definition: "very busy and rushed", example: "Mornings are hectic in our house." },
      { word: "to squeeze in", uz: "ulgurmoq, joy topmoq", definition: "to find time for something in a full schedule", example: "I squeeze in half an hour of reading at lunch." },
      { word: "night owl", uz: "kechqurun faol odam", definition: "someone who is active late at night", example: "I am a night owl, so early classes are hard." },
    ],
  },
  teachers: {
    questions: [
      "Who was your favourite teacher at school?",
      "What made them a good teacher?",
      "Do you prefer strict teachers or relaxed ones?",
      "Have you ever learned something from an online teacher?",
      "Is teaching a respected profession in your country?",
      "What is the hardest part of a teacher's job?",
      "Would you ever consider teaching?",
    ],
    vocabulary: [
      { word: "patient", uz: "sabrli", definition: "able to stay calm and keep explaining", example: "She was patient with students who fell behind." },
      { word: "to explain clearly", uz: "aniq tushuntirmoq", definition: "to make something easy to understand", example: "He explained grammar clearly with real examples." },
      { word: "supportive", uz: "qo'llab-quvvatlaydigan", definition: "encouraging and helpful", example: "A supportive teacher makes mistakes feel safe." },
      { word: "to keep the class engaged", uz: "sinf e'tiborini ushlab turmoq", definition: "to hold students' attention", example: "She kept the class engaged with short tasks." },
    ],
  },
  "public-transport": {
    questions: [
      "How do you usually travel around your city?",
      "Is public transport reliable where you live?",
      "How long does your journey to work or university take?",
      "Do you prefer buses or the metro?",
      "Has public transport improved in recent years?",
      "What do you do while you are travelling?",
      "Would you like to drive instead?",
    ],
    vocabulary: [
      { word: "commute", uz: "qatnov", definition: "the regular journey to work or study", example: "My commute is about forty minutes each way." },
      { word: "rush hour", uz: "tirbandlik vaqti", definition: "the busiest travelling time of day", example: "I avoid the metro at rush hour." },
      { word: "fare", uz: "yo'l haqi", definition: "the price of a journey", example: "The fare went up at the start of the year." },
      { word: "to catch", uz: "ulgurmoq (transportga)", definition: "to get on a bus or train in time", example: "I catch the 7:40 bus every morning." },
    ],
  },
  art: {
    questions: [
      "Are you interested in art?",
      "Did you enjoy art lessons at school?",
      "Have you been to a gallery or museum recently?",
      "Do you think children should study art?",
      "Is there any artwork you particularly like?",
      "Do you ever draw or make things yourself?",
      "Is art important in your country's culture?",
    ],
    vocabulary: [
      { word: "exhibition", uz: "ko'rgazma", definition: "a public display of art", example: "There is a photography exhibition downtown." },
      { word: "craftsmanship", uz: "hunarmandchilik mahorati", definition: "skill in making things by hand", example: "The craftsmanship in these tiles is extraordinary." },
      { word: "to appreciate", uz: "qadrlamoq", definition: "to understand and enjoy the value of something", example: "I appreciate art more now than at school." },
      { word: "striking", uz: "ta'sirchan", definition: "very noticeable and impressive", example: "The colours in that painting are striking." },
    ],
  },
  money: {
    questions: [
      "Do you find it easy to save money?",
      "Do you prefer paying in cash or by card?",
      "Did you receive pocket money as a child?",
      "What do you usually spend most of your money on?",
      "Has the way people pay changed in your country?",
      "Do you keep track of what you spend?",
      "Would you rather save for something big or enjoy small treats?",
    ],
    vocabulary: [
      { word: "to save up", uz: "pul yig'moq", definition: "to keep money for a future purchase", example: "I am saving up for a laptop." },
      { word: "to be on a budget", uz: "tejamkorlik bilan yashamoq", definition: "to have limited money to spend", example: "As a student I am always on a budget." },
      { word: "affordable", uz: "arzon, ko'tara oladigan", definition: "cheap enough to pay for", example: "The rent there is more affordable." },
      { word: "to make ends meet", uz: "kun kechirmoq", definition: "to have just enough money to live", example: "Many families struggle to make ends meet." },
    ],
  },
  health: {
    questions: [
      "Do you consider yourself a healthy person?",
      "How many hours do you sleep on a typical night?",
      "What do you do to relax when you are stressed?",
      "Has your diet changed in recent years?",
      "Do people in your country pay attention to health advice?",
      "Do you visit the doctor for check-ups?",
      "What one habit would you like to improve?",
    ],
    vocabulary: [
      { word: "to keep fit", uz: "sog'lom bo'lib turmoq", definition: "to stay in good physical condition", example: "I walk everywhere to keep fit." },
      { word: "well-being", uz: "farovonlik, sog'lomlik", definition: "general health and happiness", example: "Sleep affects my well-being more than anything." },
      { word: "to burn out", uz: "charchab qolmoq", definition: "to become exhausted from overwork", example: "I burned out during exam season." },
      { word: "balanced diet", uz: "muvozanatli ovqatlanish", definition: "eating the right variety of food", example: "A balanced diet matters more than any supplement." },
    ],
  },
  "language-learning": {
    questions: [
      "How long have you been learning English?",
      "What is the hardest part of learning a language?",
      "How do you practise speaking?",
      "Do you use any apps or websites to study?",
      "Do you remember your first English lesson?",
      "Would you like to learn another language?",
      "What advice would you give a beginner?",
    ],
    vocabulary: [
      { word: "fluency", uz: "ravonlik", definition: "the ability to speak smoothly and easily", example: "Fluency comes from speaking, not memorising." },
      { word: "to pick up", uz: "o'zlashtirib olmoq", definition: "to learn something without formal study", example: "I picked up a lot of vocabulary from films." },
      { word: "to brush up on", uz: "takrorlab yangilamoq", definition: "to improve something you learned before", example: "I need to brush up on my grammar." },
      { word: "immersion", uz: "til muhitiga sho'ng'ish", definition: "surrounding yourself with the language", example: "Immersion works faster than one lesson a week." },
    ],
  },
  childhood: {
    questions: [
      "What did you enjoy doing as a child?",
      "Where did you grow up?",
      "Who were you closest to in your family?",
      "What games did children play in your area?",
      "Do you remember your first school?",
      "Do you think childhood is different for children today?",
      "Is there something from your childhood you miss?",
    ],
    vocabulary: [
      { word: "to grow up", uz: "voyaga yetmoq", definition: "to spend your childhood somewhere", example: "I grew up in a small town near Samarkand." },
      { word: "upbringing", uz: "tarbiya", definition: "the way you were raised", example: "I had a fairly strict upbringing." },
      { word: "fond memory", uz: "yoqimli xotira", definition: "a happy thing you remember", example: "I have fond memories of summers at my grandparents'." },
      { word: "carefree", uz: "g'amsiz", definition: "without worries", example: "Those years were completely carefree." },
    ],
  },
  weekends: {
    questions: [
      "What do you usually do at the weekend?",
      "Do you prefer staying at home or going out?",
      "Do you spend weekends with family or friends?",
      "Is your weekend routine different from your weekdays?",
      "What did you do last weekend?",
      "Do you ever work or study at the weekend?",
      "What would your ideal weekend look like?",
    ],
    vocabulary: [
      { word: "to catch up on", uz: "orqada qolganini bajarmoq", definition: "to do something you did not have time for", example: "I catch up on sleep at the weekend." },
      { word: "to have a lie-in", uz: "kech turmoq", definition: "to stay in bed longer than usual", example: "Saturday is the one day I have a lie-in." },
      { word: "leisurely", uz: "shoshilmasdan", definition: "slow and relaxed", example: "We had a leisurely breakfast." },
      { word: "to make plans", uz: "reja tuzmoq", definition: "to arrange what you will do", example: "We usually make plans on Friday evening." },
    ],
  },
};
