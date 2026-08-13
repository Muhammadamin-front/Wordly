type Part1Points = readonly [string, string, string, string, string, string, string];
type Part3Points = readonly [string, string, string, string, string, string, string, string];

interface CueSampleProfile {
  subject: string;
  setting: string;
  details: string;
  development: string;
  reflection: string;
}

export const PART1_SAMPLE_POINTS: Record<string, Part1Points> = {
  "work-study": [
    "I genuinely enjoy studying software engineering because each project gives me a practical problem to solve, so the subject rarely feels purely theoretical.",
    "It shapes almost every weekday: I attend classes in the morning, review difficult concepts after lunch, and reserve the evening for independent practice.",
    "At school I studied mainly to pass exams, whereas now I am much more interested in understanding how knowledge can be applied in a real workplace.",
    "In Uzbekistan, families generally place a high value on education, although younger people are also paying more attention to practical skills and internships.",
    "Qualifications still matter, but employers now expect evidence of communication, digital ability, and problem-solving, so study has become more career-focused.",
    "I would like to specialise in product development and eventually lead a small technical team, which means I need both stronger English and deeper professional knowledge.",
    "Last semester my group built a simple learning app; presenting it to classmates showed me that a modest project can teach teamwork as effectively as a formal lecture.",
  ],
  hometown: [
    "I am fond of my hometown because it has a calm rhythm and familiar neighbourhoods, yet it is large enough to offer decent study and work opportunities.",
    "I think about it most when I am away; even ordinary things such as the local market and evening streets become surprisingly vivid after a few days elsewhere.",
    "As a child I saw it as an unremarkable place, but with age I have started to appreciate its history, community spirit, and slower pace of life.",
    "People in my region are usually proud of local food and hospitality, although they often complain that public spaces and transport could be improved.",
    "The city is more important to young residents now because new cafés, universities, and digital businesses have made it possible to build a future without immediately leaving.",
    "I would like to learn more about its older architecture and the stories behind several neighbourhoods, since residents often pass those places without knowing their significance.",
    "A recent walk with my grandfather changed my view of the city because he explained what the main avenue looked like before the modern buildings appeared.",
  ],
  home: [
    "I enjoy talking about my home because it is the place where I can be completely relaxed; the atmosphere matters to me far more than expensive furniture.",
    "I spend most evenings there, usually studying at a small desk and then having tea with my family, so it is closely connected with both work and rest.",
    "When I was younger, I wanted a huge modern house, whereas now I would prefer a smaller home that is bright, quiet, and easy to maintain.",
    "Many Uzbek families value a spacious kitchen and a welcoming guest room because meals and hospitality are central parts of everyday family life.",
    "A comfortable home has become more important as people study and work online, since one well-organised room can directly affect concentration and stress.",
    "In the future, I would like to learn more about simple interior design so that I can create useful storage and a calmer working area without spending excessively.",
    "During a recent exam period, I moved my desk beside the window and removed unnecessary items; that minor change made long study sessions noticeably easier.",
  ],
  friends: [
    "I value close friendships because a good friend can be honest without being unkind, and that kind of trust is difficult to replace with a large social circle.",
    "I speak to my closest friends several times a week, although we usually meet at weekends because our study and work schedules are quite different.",
    "As a teenager, I thought friendship depended on spending all your time together; now I understand that reliability matters more than constant contact.",
    "People in Uzbekistan tend to maintain long-term friendships and often include friends in family events, which makes the relationship feel broader than casual socialising.",
    "Friendship is especially important now because online communication creates many contacts but not necessarily the emotional support that comes from a genuine conversation.",
    "I would like to become a better listener and learn how to support friends without immediately trying to solve every problem they mention.",
    "When I was preparing for an important interview, a friend practised questions with me for two evenings; that practical support meant more than a motivational message.",
  ],
  music: [
    "Music is a genuine source of energy for me, particularly instrumental and acoustic tracks, because they improve my mood without demanding my full attention.",
    "I listen for about an hour a day, mainly while travelling or doing routine tasks, but I turn it off when I need to read something complex.",
    "I used to choose songs only because they were popular, whereas now I pay much more attention to lyrics, production, and the emotion in a singer's voice.",
    "Uzbek listeners enjoy both traditional melodies and international pop, and younger audiences often mix several languages and styles in the same playlist.",
    "Music feels more present than before because streaming services make almost every genre instantly available, although that convenience can make listening less deliberate.",
    "I would like to understand basic music theory and perhaps learn the piano, not to perform professionally but to hear structure more clearly.",
    "Last year I attended a small live performance where the audience was completely silent during one acoustic song; the shared concentration made the piece unforgettable.",
  ],
  movies: [
    "I enjoy discussing films that reveal something about ordinary people, because a convincing character stays in my mind longer than spectacular visual effects.",
    "I watch one or two films a week, usually at home, and I save the cinema for releases where the sound and scale genuinely improve the experience.",
    "When I was younger, I preferred simple action films, but now I am more patient with slower stories that leave some questions unanswered.",
    "International films are increasingly popular in Uzbekistan, although family comedies and historical dramas still attract a particularly broad audience.",
    "Films have become easier to access through streaming, but recommendations can create a narrow bubble in which people repeatedly watch the same type of story.",
    "I would like to learn more about screenwriting because I am curious about how a writer builds tension without making the plot feel artificial.",
    "A friend once recommended a quiet drama that I would never have selected myself; its ending led to a long conversation about responsibility and forgiveness.",
  ],
  food: [
    "I enjoy food most when it brings people together, so a simple home-cooked meal with good conversation appeals to me more than an elaborate restaurant dish.",
    "I eat with my family most evenings and try a new café perhaps twice a month, which gives me variety without making eating out an expensive habit.",
    "As a child I avoided unfamiliar flavours, whereas now I am willing to try regional dishes because travel and cooking videos have made me more curious.",
    "Uzbek people are understandably proud of dishes such as plov, but every region prepares them slightly differently and families often defend their own version.",
    "Healthy food matters more today because many people sit for long hours, yet convenience still pushes busy workers towards sugary drinks and fast meals.",
    "I would like to learn how to balance spices properly and prepare several lighter versions of traditional dishes without losing their character.",
    "I once helped my uncle cook plov for a large family gathering; coordinating the timing and quantities made me appreciate the skill behind a familiar meal.",
  ],
  shopping: [
    "Shopping is useful rather than entertaining for me; I enjoy finding a well-made item, but I dislike browsing for hours without a clear purpose.",
    "I buy groceries every few days and larger items only after comparing prices, reviews, and whether I genuinely need to replace something.",
    "I used to be influenced by packaging and brand names, whereas now durability and after-sales service have become much more important.",
    "Open markets remain popular in Uzbekistan because people can inspect fresh products and negotiate, while online stores are growing quickly among younger customers.",
    "Shopping is more convenient now, but instant payment and targeted advertising also make unnecessary purchases dangerously easy.",
    "I would like to understand consumer rights better, especially return policies and warranties, because a low price is meaningless if the product cannot be repaired.",
    "Before buying my headphones, I waited a week and tested two models in a shop; the pause prevented an impulsive choice and saved me money.",
  ],
  sports: [
    "I enjoy sport mainly for the discipline it creates; even a short training session gives the day a clearer structure and improves my concentration afterwards.",
    "I exercise three or four times a week and occasionally watch major football matches, although participating is more satisfying to me than being a spectator.",
    "At school I saw sport as a competition, but now I treat it as a sustainable way to protect my energy and mental health.",
    "Football is extremely popular in Uzbekistan, while gyms and running clubs are becoming more visible as adults look for flexible ways to stay active.",
    "Sport matters more because sedentary work is common, yet many people still approach exercise intensely for a month and then stop completely.",
    "I would like to improve my swimming technique because it trains the whole body and would give me an alternative when outdoor exercise is inconvenient.",
    "Completing my first five-kilometre run was memorable because I started slowly and nearly stopped halfway, but keeping a steady pace proved more useful than speed.",
  ],
  technology: [
    "I am interested in technology when it removes a real difficulty, such as making study material searchable, rather than when it adds features nobody needs.",
    "I use a laptop and phone throughout the day for study, communication, and planning, but I deliberately keep notifications off during focused work.",
    "As a child I treated every new device as exciting, whereas now I ask whether it saves time, protects privacy, and will remain useful for several years.",
    "Digital payments, messaging apps, and online education are widespread in Uzbekistan, although access and confidence still vary outside major cities.",
    "Technology is more important because services increasingly assume constant internet access, which is efficient for many people but can exclude others.",
    "I would like to learn more about data security so that I can make informed choices instead of accepting every permission screen automatically.",
    "When a shared calendar solved repeated scheduling mistakes in a group project, I saw how a very simple tool could improve teamwork more than an impressive gadget.",
  ],
  books: [
    "I enjoy books that combine a strong story with a fresh perspective, because they allow me to experience another person's reasoning at a slower pace.",
    "I read for twenty or thirty minutes most evenings and keep a longer book for weekends, although exam periods sometimes interrupt that routine.",
    "I used to read only what teachers assigned, but discovering contemporary non-fiction made reading feel like a personal choice rather than homework.",
    "Printed books are still respected in Uzbekistan, while audiobooks and digital editions are helping busy young people fit reading into daily travel.",
    "Reading is arguably more valuable in an age of short videos because it trains sustained attention and exposes people to arguments that cannot be reduced to a caption.",
    "I would like to explore more Central Asian literature in English translation and compare how cultural details are carried into another language.",
    "A biography I read last year changed my study habits because the author described progress as a series of small systems rather than dramatic bursts of motivation.",
  ],
  holidays: [
    "I prefer holidays that combine rest with one or two meaningful activities, because a completely packed schedule leaves me needing another break afterwards.",
    "I take short breaks around national celebrations and try to plan one longer trip each year, depending on study commitments and cost.",
    "When I was younger, holidays simply meant freedom from school; now I value the chance to slow down and spend uninterrupted time with family.",
    "Uzbek families often visit relatives and prepare generous meals during holidays, so the social side can be more important than travelling somewhere new.",
    "Breaks have become more carefully planned because transport and hotels are easy to compare online, although social media can create unrealistic expectations.",
    "I would like to organise a quiet mountain trip and learn basic route planning so that the experience is safe without feeling overly organised.",
    "One of my best holidays involved no famous attraction; my cousins and I stayed in a village, cooked together, and talked without checking the time.",
  ],
  weather: [
    "I prefer mild, bright weather because it makes travelling and outdoor exercise pleasant without the exhaustion caused by extreme heat.",
    "I check the forecast most mornings, especially when I have a long commute, but I do not let a small chance of rain cancel my plans.",
    "As a child I loved very hot summers because they meant freedom, whereas now I notice how heat affects sleep, concentration, and energy.",
    "People in Uzbekistan are accustomed to dry summers and cold winters, so conversations about weather often focus on sudden extremes rather than ordinary days.",
    "Weather feels more significant because heatwaves and water shortages are discussed as practical concerns, not distant environmental topics.",
    "I would like to understand local climate patterns better, particularly how cities can create shade and reduce heat around homes and public spaces.",
    "A sudden spring storm once stopped traffic near my university; it lasted less than an hour but showed how quickly routine plans can become unreliable.",
  ],
  neighbours: [
    "I appreciate friendly neighbours who are willing to help while still respecting privacy, because daily trust is built through small, considerate actions.",
    "We exchange greetings almost every day and have longer conversations a few times a month, usually when someone needs practical help or shares food.",
    "When I was younger, neighbours seemed like extended family; people still care, but busier schedules mean contact now requires more deliberate effort.",
    "Neighbourly relationships are traditionally strong in Uzbekistan, especially through the mahalla, although apartment living can make interaction less automatic.",
    "Good neighbours matter more in large cities because many residents live far from relatives and may need a nearby person in an emergency.",
    "I would like to take part in more local clean-up or planting activities, since working on a shared space creates conversation naturally.",
    "When our building lost water for several hours, one neighbour organised updates and helped an elderly resident carry bottles upstairs; the response created real trust.",
  ],
  clothes: [
    "I care more about comfort and fit than fashion labels, because clothes should let me move confidently instead of making me constantly adjust them.",
    "I choose clothes every day but shop only when something wears out or a particular event requires it, so the process is fairly practical.",
    "As a teenager I followed trends more closely, whereas now I prefer a smaller collection of neutral items that combine easily.",
    "People in Uzbekistan often balance modern styles with traditional expectations, and clothing becomes more formal at weddings and important family events.",
    "Clothes are discussed more because online fashion changes rapidly, but concern about waste is also encouraging some consumers to buy fewer, better items.",
    "I would like to learn basic alterations, such as shortening trousers or repairing a seam, because useful clothes should not be discarded for a minor problem.",
    "I once bought a cheap jacket online that looked excellent in photos but fitted badly; returning it taught me to check measurements rather than trust presentation.",
  ],
  pets: [
    "I like animals, particularly calm dogs, because their routines and uncomplicated affection can make a home feel more lively.",
    "I do not currently own a pet, but I help a relative with their dog at weekends and occasionally look after it when they travel.",
    "As a child I wanted several pets without understanding the responsibility, whereas now I think time, space, and veterinary costs must come first.",
    "Cats and birds are common pets in Uzbekistan, while attitudes to keeping larger animals indoors vary considerably between families.",
    "Pets may be more important now because some people live alone and value companionship, although ownership should never be treated as a temporary trend.",
    "Before getting an animal, I would like to learn more about training and long-term care so that affection is supported by consistent responsibility.",
    "Looking after my cousin's dog for a week taught me that feeding is the easy part; exercise, attention, and planning shape the entire day.",
  ],
  photography: [
    "I enjoy photography when it captures an atmosphere rather than a perfect pose, because small details often preserve a memory more honestly.",
    "I take a few photos each week, mainly during walks or family gatherings, but I try not to view every experience through a screen.",
    "I once photographed almost everything, whereas now I take fewer pictures and spend more time selecting one image that tells the story clearly.",
    "People in Uzbekistan photograph celebrations extensively, and scenic travel images are popular online, although older family photographs often carry deeper value.",
    "Photography is more accessible because phones produce excellent results, but easy editing also makes viewers question whether an image reflects reality.",
    "I would like to understand light and composition better so that my pictures improve through observation rather than heavy filters.",
    "An ordinary photo of my grandparents talking in the garden became precious after we noticed how naturally it captured their expressions and relationship.",
  ],
  "social-media": [
    "I find social media useful for keeping in touch and discovering specialised information, but only when I control the feed instead of scrolling automatically.",
    "I check two platforms briefly during the day and avoid them while studying, because even a quick notification can break concentration.",
    "When I first joined, I shared more personal updates and cared about reactions; now I use private messages and follow educational accounts instead.",
    "Social platforms are extremely common among young Uzbek users, while older people increasingly use them for family contact, news, and small businesses.",
    "Their influence is greater because recommendations shape what people buy and believe, which makes media literacy as important as technical access.",
    "I would like to understand recommendation systems and privacy settings better so that I can make intentional choices about what I see and share.",
    "During one exam week I removed social apps from my home screen; my usage fell sharply, showing that design and habit mattered more than willpower.",
  ],
  running: [
    "I enjoy running because it is simple, inexpensive, and mentally quiet; after the first difficult minutes, my thoughts usually become much clearer.",
    "I run two or three mornings a week for around half an hour, adjusting the distance rather than forcing the same pace every time.",
    "I disliked running at school because it was always timed, but training alone taught me to value consistency instead of comparison.",
    "Running groups are becoming more visible in Uzbek cities, although safe pavements, shade, and air quality still affect where people can train.",
    "It is more relevant now because many jobs involve long periods of sitting, and running offers an efficient counterbalance without complicated equipment.",
    "I would like to complete a ten-kilometre event comfortably, following a gradual plan so that progress does not come at the cost of injury.",
    "On my first early-morning run, the streets were unexpectedly peaceful; that atmosphere turned exercise from an obligation into personal time.",
  ],
  cooking: [
    "I enjoy cooking when I have enough time to do it calmly, because preparing a meal is both practical and a satisfying way to care for other people.",
    "I cook simple dishes several times a week and help with larger family meals, although experienced relatives still handle the most traditional recipes.",
    "As a child I saw cooking as repetitive housework, whereas now I appreciate the planning, timing, and judgement required to make several elements ready together.",
    "Home cooking remains important in Uzbekistan, and recipes are often learned from relatives rather than written instructions, which preserves subtle family variations.",
    "Cooking skills matter more as takeaway food becomes easier to order, because knowing a few reliable meals protects both health and budget.",
    "I would like to master bread and dough properly; the ingredients look simple, but temperature and patience make an enormous difference.",
    "The first soup I made alone was too salty, so I learned to season gradually; that small failure was more useful than following a recipe perfectly.",
  ],
  travelling: [
    "I enjoy travelling most when I can stay long enough to notice ordinary life, because rushing between famous places produces photographs but little understanding.",
    "I make several short domestic trips each year and plan longer journeys less often, mainly because cost and study schedules require advance organisation.",
    "When I was younger, the destination seemed to be everything; now I also value the route, local conversations, and the confidence gained from solving small problems.",
    "Domestic travel is growing in Uzbekistan as transport and online booking improve, while historic cities remain especially attractive to both locals and visitors.",
    "Travel feels more accessible through digital maps and reviews, although popular recommendations can concentrate everyone in the same crowded locations.",
    "I would like to visit a country where I can use English daily and learn enough local language to handle greetings and basic courtesy.",
    "On one train journey, a family shared food and explained the landscape to me; that unplanned conversation became more memorable than the scheduled attractions.",
  ],
  "daily-routine": [
    "I like having a flexible routine because a few stable habits protect my time, while some freedom prevents the day from feeling mechanical.",
    "On weekdays I start early, study or work in focused blocks, exercise before dinner, and keep the final hour relatively quiet.",
    "My routine used to depend on motivation, but missed deadlines taught me to prepare the next day in advance and begin with the hardest task.",
    "Many people around me organise life around family and work commitments, although students are increasingly using digital calendars and productivity methods.",
    "Routine is more valuable now because messages and entertainment compete constantly for attention, making unplanned time disappear surprisingly quickly.",
    "I would like to improve my sleep schedule and create a more reliable evening shutdown, since a productive morning usually begins the night before.",
    "Writing three priorities on paper once helped me finish a stressful week calmly; the method was basic, but it stopped minor tasks controlling the day.",
  ],
  teachers: [
    "I enjoy discussing good teachers because their influence often appears years later, especially when they make a difficult subject feel possible rather than frightening.",
    "I interact with teachers throughout the academic week and usually ask questions after attempting a problem myself, which makes the discussion more focused.",
    "As a child I thought the strictest teacher was the best one, but now I value clarity, fair feedback, and the ability to adapt an explanation.",
    "Teachers are highly respected in Uzbekistan, although expectations are changing as students gain access to online courses and compare different teaching styles.",
    "Their role is arguably more complex now because facts are easy to find, while judging sources, building confidence, and giving individual feedback remain difficult.",
    "I would like to learn how effective teachers design practice and feedback because those skills would help me mentor younger learners in the future.",
    "A mathematics teacher once asked me to explain my wrong answer instead of correcting it immediately; finding the error myself made the method unforgettable.",
  ],
  "public-transport": [
    "I appreciate public transport when it is predictable, because a reliable bus or train allows people to use travel time instead of concentrating on traffic.",
    "I use it several times a week for study and city errands, although I choose a taxi when connections are poor or I am carrying something heavy.",
    "I once considered buses a last resort, but better routes and digital payment have made them a practical first choice for many journeys.",
    "In Uzbek cities, buses and metro services carry large numbers of people, while residents still want clearer schedules and better links to outer districts.",
    "Public transport matters more as cities grow, since adding private cars eventually creates congestion that wider roads alone cannot solve.",
    "I would like to understand transport planning and how route data can reduce waiting times without making fares unaffordable.",
    "A new direct bus recently cut one of my regular journeys by twenty minutes; the change was small on a map but valuable every single week.",
  ],
  art: [
    "I enjoy art that rewards a second look, particularly illustration and architecture, because visual choices can communicate an idea before any explanation is given.",
    "I encounter design every day but visit a museum only a few times a year, usually when a particular exhibition gives the visit a clear purpose.",
    "As a child I judged art by how realistic it looked, whereas now I am more interested in intention, context, and the response it creates.",
    "Traditional crafts are valued in Uzbekistan, while contemporary galleries are gradually giving younger artists more space to address modern life.",
    "Art is increasingly important in digital communication because images shape public attention, although speed can encourage imitation instead of thoughtful work.",
    "I would like to learn basic drawing so that I become more observant; the goal is not professional skill but a better understanding of proportion and detail.",
    "A museum guide once explained how a pattern represented local history; after that, an object I had almost ignored became the most interesting piece in the room.",
  ],
  money: [
    "I think money is worth discussing because it affects freedom and stress, although treating it as the only measure of success creates a very narrow life.",
    "I review my spending each week and save automatically at the beginning of the month, which is easier than hoping something remains at the end.",
    "When I was younger, money simply meant buying things; now I see budgeting as a way to protect future choices and handle unexpected costs.",
    "Cash is still common in Uzbekistan, but digital payments are growing rapidly and younger people are more willing to compare financial services online.",
    "Financial knowledge matters more because credit and instant purchases are easy to access, while the long-term cost is not always obvious.",
    "I would like to learn more about low-risk investing and taxes before making any major decision, rather than following confident advice on social media.",
    "Tracking small food-delivery purchases for one month revealed a surprisingly large total; changing that single habit created savings without a dramatic sacrifice.",
  ],
  health: [
    "I am interested in health because energy, sleep, and concentration affect every other goal, so prevention seems more sensible than reacting only when something goes wrong.",
    "I exercise several times a week, try to keep meals regular, and protect seven or eight hours for sleep, although consistency is never perfect.",
    "I once associated health mainly with weight, whereas now I pay equal attention to stress, recovery, posture, and sustainable habits.",
    "People in Uzbekistan value home-cooked food, but long working hours and limited preventive check-ups can make healthy intentions difficult to maintain.",
    "Health feels more important as sedentary lifestyles spread, and public discussion of mental wellbeing is also becoming more open.",
    "I would like to learn basic first aid because calm, correct action in the first few minutes of an emergency can be genuinely valuable.",
    "After replacing late-night screen time with a short walk and earlier sleep, I noticed better concentration within a week; the result made the habit easier to continue.",
  ],
  "language-learning": [
    "I enjoy language learning because each improvement has an immediate use, whether I am reading documentation, watching an interview, or speaking to someone new.",
    "I study English every day in short sessions and add longer speaking or writing practice several times a week so that passive knowledge becomes usable.",
    "At first I memorised isolated word lists, but forgetting them repeatedly taught me to learn vocabulary through context, recall, and meaningful repetition.",
    "English is strongly associated with education and international work in Uzbekistan, while Russian and regional languages remain important in daily communication.",
    "Language skills matter more as remote study and employment cross borders, although clear communication is more valuable than imitating a particular accent.",
    "I would like to reach a level where I can lead a technical meeting naturally and explain a complex idea without mentally translating every sentence.",
    "The first time I solved a real problem using an English tutorial, the language stopped feeling like a school subject and became a practical tool.",
  ],
  childhood: [
    "I enjoy remembering childhood when a memory reveals how much my perspective has changed, rather than simply treating the past as automatically better.",
    "It comes up during family conversations, especially when old photographs or familiar places remind us of details that one person had forgotten.",
    "As a child I believed adults had clear answers to everything; growing older showed me that responsibility often means deciding despite uncertainty.",
    "Childhood in Uzbekistan is closely connected with extended family, outdoor play, and school friendships, although phones now shape leisure much earlier.",
    "Early experiences are discussed more because parents understand their long-term influence, but children also need freedom rather than constant optimisation.",
    "I would like to record more stories from older relatives so that family memories are not reduced to names and dates later.",
    "Finding a school notebook recently brought back not only the lessons but also my handwriting, worries, and ambitions; the small object made the past surprisingly immediate.",
  ],
  weekends: [
    "I value weekends because they give me enough distance from routine to recover, but I still prefer one useful plan so the time does not disappear entirely.",
    "I usually exercise, meet family or friends, and prepare for the next week, leaving at least one evening without a fixed schedule.",
    "When I was younger, a good weekend meant constant entertainment; now a quiet morning and an unhurried conversation can feel more restorative.",
    "Uzbek weekends often centre on family visits, markets, and shared meals, although younger people also use the time for courses and personal projects.",
    "Rest is more important as study and work remain connected through phones, making it easy for unfinished tasks to occupy every day.",
    "I would like to plan more short outdoor trips instead of assuming meaningful rest requires an expensive holiday.",
    "Last month I spent a Saturday walking, cooking with friends, and leaving my phone in another room; the simple day improved my mood for the whole week.",
  ],
};

const PART1_ENDINGS: readonly (readonly string[])[] = [
  [
    "What appeals to me is the combination of personal value and a clear practical benefit.",
    "It is not an obsession, but it adds something worthwhile to an ordinary week.",
    "That is why my interest feels genuine rather than like a prepared answer.",
  ],
  [
    "That rhythm is regular enough to matter without taking over the rest of my life.",
    "I prefer that steady pattern to doing a great deal once and then forgetting about it.",
    "The frequency changes occasionally, but it remains a recognisable part of my routine.",
  ],
  [
    "The change was gradual, which is probably why it has lasted.",
    "Experience made my view more balanced rather than simply more positive.",
    "That contrast is a useful reminder that preferences develop with responsibility.",
  ],
  [
    "Attitudes naturally vary by generation and location, but that is the broad pattern I notice.",
    "There are exceptions, of course, yet the topic is familiar in most households.",
    "The exact form differs between families, although the underlying value is widely understood.",
  ],
  [
    "Convenience and changing lifestyles seem to be the main reasons for that shift.",
    "The trend brings clear benefits, provided people also recognise its limits.",
    "Its growing relevance is practical, not merely the result of publicity.",
  ],
  [
    "I would approach it gradually so the interest develops into a lasting skill.",
    "A realistic, consistent plan would be more useful than an ambitious promise.",
    "That goal feels achievable because it connects curiosity with a specific purpose.",
  ],
  [
    "It was a modest experience, but it changed an abstract idea into something personal.",
    "That small moment stays with me because the lesson was practical and immediate.",
    "The event was ordinary from the outside, yet it gave the topic real meaning for me.",
  ],
];

const PART1_FINISHERS = [
  "That is the aspect I would emphasise in a natural conversation.",
  "For me, that detail makes the answer specific rather than theoretical.",
  "It is a simple point, but it reflects my experience accurately.",
  "That is probably the clearest way to explain my view.",
  "Overall, the experience has given me a fairly balanced perspective.",
];

export function buildPart1Samples(slug: string, seed: number) {
  const points = PART1_SAMPLE_POINTS[slug];
  if (!points) throw new Error(`Missing Part 1 sample content for ${slug}`);
  return points.map((point, index) => {
    const endings = PART1_ENDINGS[index];
    return `${point} ${endings[seed % endings.length]} ${PART1_FINISHERS[(seed + index) % PART1_FINISHERS.length]}`;
  });
}

const PART3_SAMPLE_POINTS_1: Record<string, Part3Points> = {
  "travel-and-culture": [
    "Travel matters because direct contact makes another culture harder to reduce to a stereotype. A visitor who uses local transport and speaks to residents gains a more nuanced picture than someone relying on headlines.",
    "In the past, international travel was expensive and relatively rare, whereas budget flights and online booking have normalised short trips. The opportunity has widened, although many journeys have also become faster and more superficial.",
    "Tourism creates employment and funds heritage sites, but overcrowding can raise rents and turn living traditions into performances. The outcome depends heavily on visitor behaviour and how revenue is distributed.",
    "Governments should manage capacity in fragile areas, enforce environmental standards, and invest tourist income in local infrastructure. A blanket limit would be crude, but completely unmanaged growth is equally irresponsible.",
    "Young travellers often seek flexible, experience-based trips and share them online, while older people may prioritise comfort and organised itineraries. However, income and health probably explain more than age alone.",
    "Over the next decade, travellers will use better translation and planning tools, while cities may introduce timed access and visitor taxes. The central challenge will be making convenience compatible with cultural respect.",
    "Education can teach people to research local customs, question stereotypes, and understand the environmental cost of a journey. Even a short pre-travel module could prevent behaviour that residents experience as disrespectful.",
    "Individuals should behave responsibly, but authorities and travel companies shape the options available. A tourist cannot choose a sustainable service that does not exist, so responsibility has to be shared.",
  ],
  "education-systems": [
    "Education is significant because it affects not only employment but also a person's ability to evaluate evidence and participate confidently in society. Its value therefore extends far beyond examination results.",
    "Older systems relied more heavily on memorisation and teacher authority, while current classrooms increasingly emphasise projects, discussion, and digital resources. The change is positive when it adds depth rather than simply replacing textbooks with screens.",
    "Standard exams provide a comparable measure and can motivate systematic study, but they reward performance on one occasion and may narrow teaching. Practical assessment is richer, although it is harder to standardise fairly.",
    "Governments should fund teacher development, early support, and reliable basic facilities before purchasing fashionable technology. Reform succeeds when teachers can use a tool well, not when schools merely own it.",
    "Younger learners often expect immediate feedback and interactive material, whereas older students may be more accustomed to independent reading. Neither preference is automatically superior; strong courses should develop both concentration and collaboration.",
    "Future education will probably combine classroom relationships with adaptive digital practice. Teachers will spend less time delivering identical information and more time diagnosing misconceptions, guiding projects, and building judgement.",
    "Schools can improve decision-making by teaching financial, media, and health literacy through realistic cases. Knowledge becomes useful when students practise applying it under uncertainty rather than recalling a definition.",
    "The state must guarantee quality and access, while learners and families are responsible for effort and attendance. Assigning the whole burden to either side ignores how strongly outcomes depend on both opportunity and participation.",
  ],
  "technology-and-society": [
    "Digital technology is important because it now mediates work, public services, and personal relationships. People who lack access or confidence can therefore be excluded from opportunities that technically exist.",
    "Earlier technology mainly helped people complete specific tasks, whereas smartphones now compete continuously for attention. This has increased convenience but blurred the boundary between deliberate use and habitual checking.",
    "Automation removes repetitive work and gives small organisations powerful tools, yet it can displace roles and concentrate data in a few companies. The benefits are real, but they are not distributed automatically.",
    "Governments should enforce privacy, competition, and safety standards while avoiding rules so rigid that smaller innovators cannot comply. Transparent auditing is often more useful than vague promises of responsible technology.",
    "Young people usually adapt to new interfaces quickly, while older users may bring stronger caution and contextual judgement. Effective design should not force either group to trade dignity for access.",
    "Within ten years, AI assistants will become ordinary in education and administration, and verifying their output will be a basic skill. Human oversight will matter most in decisions affecting rights, health, or employment.",
    "Education should teach students how algorithms select information, how to protect accounts, and when an automated answer needs verification. Technical fluency without critical judgement leaves users highly vulnerable.",
    "Users are responsible for habits and basic security, but platforms design the environment and governments set enforceable limits. It is unreasonable to place the entire burden on an individual facing deliberately persuasive systems.",
  ],
  "cities-and-transport": [
    "Urban transport matters because it determines who can reach education, work, and healthcare within a reasonable time. A city may offer excellent services, but they are not genuinely accessible if the journey is unaffordable.",
    "Many cities were designed around private cars, whereas population growth has renewed interest in rail, buses, cycling, and walkable districts. Retrofitting those systems is far more difficult than planning them early.",
    "Cars provide flexibility and privacy, but widespread use creates congestion, noise, and unequal use of public space. Mass transit is efficient, although poor frequency can make a short distance take an unreasonable amount of time.",
    "Authorities should integrate fares, publish reliable live information, and give buses priority on congested routes. People change habits when the alternative is consistently convenient, not merely when driving becomes more expensive.",
    "Young adults may be comfortable combining apps, shared transport, and walking, while older residents often need simple routes and accessible stations. Inclusive planning should treat those needs as essential rather than exceptional.",
    "Cities will probably introduce more electric fleets and data-based route planning, but physical space will remain limited. The best systems will reduce unnecessary journeys and support mixed-use neighbourhoods, not only replace engines.",
    "Schools can teach road safety and the social cost of different travel choices, while universities can analyse local transport data. Practical projects help students see planning as a public question rather than a personal inconvenience.",
    "Individuals choose how to travel, but city design strongly shapes that choice. Governments carry the larger responsibility because only they can build connected networks and coordinate land use over decades.",
  ],
  "health-and-lifestyle": [
    "Lifestyle is significant because common conditions are influenced by sleep, movement, diet, and stress long before treatment is needed. Prevention also protects public resources as well as individual wellbeing.",
    "Daily life has become less physically demanding while food and entertainment are available instantly. Medical knowledge has improved, but the surrounding environment often makes the healthier choice less convenient.",
    "Public campaigns can spread useful information and screening can detect risk early, yet messages alone may blame people whose work, income, or neighbourhood limits their options. Effective prevention needs practical support.",
    "Governments should provide safe public spaces, clear food standards, and accessible primary care. Policies should make healthy behaviour easier without turning every personal choice into a legal matter.",
    "Young people face screen-related inactivity and online pressure, whereas older adults may manage chronic conditions and isolation. Both groups benefit from routines, but the kind of support they need is quite different.",
    "Healthcare will use more remote monitoring and personalised advice, which could identify problems earlier. The risk is that people without digital access or trust may receive a weaker service.",
    "Schools should teach sleep, nutrition, stress management, and first aid through practical habits rather than occasional lectures. A learner who can plan a realistic week is better prepared than one who memorises health vocabulary.",
    "People must make daily choices, while employers, businesses, and governments shape time, prices, and access. Responsibility is therefore shared, although public institutions should protect those with the fewest options.",
  ],
};

const PART3_SAMPLE_POINTS_2: Record<string, Part3Points> = {
  environment: [
    "Environmental action is important because damage accumulates gradually and often affects people who contributed least to it. Clean air, stable water, and healthy soil are economic foundations, not optional luxuries.",
    "Public awareness has increased and renewable technology is cheaper, yet consumption has also grown. Society is better at discussing sustainability than at reducing the total demand for energy and materials.",
    "Environmental regulation can stimulate cleaner innovation and prevent hidden public costs, but poorly designed rules may burden small firms without changing major polluters. Clear targets and consistent enforcement are crucial.",
    "Governments should price pollution, protect ecosystems, and invest in transport and energy systems that make low-carbon choices realistic. Short-term subsidies should support a long-term transition rather than isolated publicity projects.",
    "Young people may express greater urgency because they will live with future consequences, while older generations often hold practical knowledge about repair and reduced waste. Cooperation is more productive than blame.",
    "The next decade will bring more adaptation to heat, drought, and flooding alongside efforts to reduce emissions. Cities that plan early will avoid far greater costs than those responding after each emergency.",
    "Education can connect global science with local observation, such as water use or neighbourhood air quality. Students are more likely to act when they can measure a problem and evaluate competing solutions.",
    "Individuals influence demand, but governments and large producers control infrastructure and product design. Personal responsibility matters most when institutions provide honest information and credible alternatives.",
  ],
  "work-and-careers": [
    "Career choice matters because work occupies a large part of adult life and shapes identity, income, and health. A sustainable career should provide growth and dignity rather than salary alone.",
    "Careers were once expected to follow a stable ladder, whereas workers now change roles and update skills repeatedly. This flexibility creates opportunity but transfers more uncertainty to the individual.",
    "Remote work saves commuting time and widens recruitment, yet it can weaken informal learning and make boundaries difficult to maintain. Its success depends on management quality rather than location by itself.",
    "Governments should support vocational routes, portable benefits, and retraining for sectors affected by automation. Policies must reach mid-career workers, not only students preparing for their first job.",
    "Younger workers may prioritise flexibility and rapid development, while older employees may value stability after experiencing economic cycles. Organisations need not choose one group if expectations are discussed clearly.",
    "Routine tasks will increasingly be automated, while roles requiring judgement, care, and cross-disciplinary communication will grow. Workers will need to demonstrate learning ability rather than rely on one qualification indefinitely.",
    "Education can expose learners to real workplaces, teach collaboration, and explain basic employment rights. Career guidance is strongest when it tests assumptions instead of assigning a fashionable job title.",
    "Individuals should develop skills and make informed choices, but employers must provide fair conditions and governments must regulate minimum standards. Career resilience cannot mean accepting every risk alone.",
  ],
  "media-and-advertising": [
    "Media and advertising matter because they influence what people notice before they consciously evaluate it. Repeated framing can shape public priorities even when no single message appears decisive.",
    "Traditional advertising was visible and easy to identify, whereas digital promotion is personalised, embedded in entertainment, and sometimes presented by trusted individuals. That makes persuasion more precise but less transparent.",
    "Advertising helps consumers discover products and funds free content, but it can exploit insecurity and encourage unnecessary consumption. The line depends on truthful claims, clear labelling, and the vulnerability of the audience.",
    "Governments should require disclosure of sponsored content, restrict harmful targeting of children, and give researchers access to platform advertising data. Rules must follow the method of persuasion rather than only the medium.",
    "Young users may recognise online formats quickly but still respond strongly to social proof, while older audiences may trust familiar news-like presentation. Media literacy needs different examples for each group.",
    "Advertising will become more interactive and generated for individual users, making verification harder. Public pressure will grow for records showing why a person received a particular political or commercial message.",
    "Schools should let students analyse real campaigns, compare evidence with emotional technique, and design an ethical advertisement themselves. Active analysis reveals persuasion more clearly than a warning to be careful.",
    "Consumers must question claims, but platforms, advertisers, and regulators possess far more information and power. They carry the larger duty to prevent deception, especially where children or health are involved.",
  ],
  "family-and-generations": [
    "Generational relationships are important because families transfer care, values, and practical knowledge across different stages of life. They also provide a place where social change becomes personal and sometimes difficult.",
    "Families have become smaller and more geographically dispersed, while communication technology keeps relatives connected at a distance. Contact is easier, but shared daily experience may be weaker.",
    "Extended families can provide childcare, emotional support, and continuity, yet strong expectations may limit privacy or individual choice. Healthy support requires boundaries as well as loyalty.",
    "Governments should support affordable childcare, elder care, and flexible work rather than assuming families can absorb every responsibility. Public services strengthen families when they reduce exhaustion, not replace relationships.",
    "Younger relatives may bring digital knowledge and changing social attitudes, while older people offer memory and long-term perspective. Conflict arises when either side treats experience or novelty as automatic authority.",
    "More families will coordinate care across distance and use technology to remain involved. The challenge will be preserving meaningful attention rather than mistaking frequent messages for genuine support.",
    "Schools can teach communication, caregiving awareness, and financial planning that affect family life. Intergenerational projects also help students encounter older people as individuals rather than stereotypes.",
    "Family members have personal duties, but the state must protect people from poverty, abuse, and impossible care burdens. Strong relationships cannot substitute for a basic social safety net.",
  ],
  "friendship-and-community": [
    "Community matters because trust between people reduces isolation and makes cooperation possible during ordinary problems and emergencies. Belonging is difficult to create through services alone.",
    "Neighbourhood contact has declined in some places as work and entertainment move online, yet digital groups can also organise local help quickly. Connection has changed form rather than simply disappeared.",
    "Strong communities share information, support vulnerable residents, and create informal safety, but they can become exclusive if belonging depends on similarity. Openness is therefore as important as closeness.",
    "Local authorities should maintain welcoming public spaces, small cultural programmes, and transparent ways for residents to influence decisions. Community grows through repeated participation, not one large annual event.",
    "Young people may build communities around interests that cross geography, while older residents often rely more on place-based networks. Both forms can be valuable if they lead to reciprocal support.",
    "Hybrid communities will become normal, using digital tools to organise face-to-face activity. Places that preserve libraries, parks, and affordable meeting spaces will be better able to turn online contact into trust.",
    "Schools can require collaborative local projects in which students interview residents or solve a small neighbourhood problem. That experience teaches negotiation and responsibility more effectively than abstract civic language.",
    "Individuals must participate and treat others respectfully, while institutions should provide safe spaces and listen consistently. Neither friendly intentions nor public funding can build community in isolation.",
  ],
};

const PART3_SAMPLE_POINTS_3: Record<string, Part3Points> = {
  "money-and-success": [
    "Money is important because it provides security and choice, but success also involves health, useful work, and relationships. A high income cannot compensate indefinitely for a life with no control over time.",
    "Previous generations often associated success with one stable profession and visible possessions, whereas younger adults discuss flexibility and purpose more openly. Economic uncertainty, however, still makes financial stability extremely attractive.",
    "Ambition can encourage discipline and innovation, but constant comparison may turn every achievement into evidence that something else is missing. The healthiest ambition has a personal definition and clear limits.",
    "Governments should teach financial literacy, protect consumers from misleading credit, and maintain fair opportunity. They cannot guarantee equal outcomes, but they can prevent avoidable exploitation and extreme barriers.",
    "Young people may accept more risk because they have fewer commitments, while older adults often prioritise savings and dependants. These tendencies are understandable, although personality and income can reverse them completely.",
    "Digital finance will make saving and investing easier, but persuasive interfaces may also encourage speculation. People will need better judgement about risk, fees, and the difference between confidence and evidence.",
    "Schools should teach budgeting, compound interest, tax, and consumer rights through realistic decisions. Students need to compare trade-offs, not simply memorise the definition of a bank account.",
    "Individuals decide how to spend and save, while institutions shape wages, prices, and access to trustworthy products. Responsibility is shared, but financial companies should be accountable for deliberately confusing design.",
  ],
  "art-and-creativity": [
    "Creativity matters because societies need people who can imagine alternatives, communicate emotion, and interpret experience. It contributes to problem-solving as well as cultural expression.",
    "Art was once accessed mainly through formal venues and trained gatekeepers, whereas digital tools now let almost anyone publish work. Access has widened, though visibility is increasingly controlled by platform algorithms.",
    "Public art and creative industries can strengthen identity, tourism, and employment, but commercial pressure may reward imitation and rapid output. Creative freedom needs space where immediate profit is not the only test.",
    "Governments should fund arts education, preserve heritage, and support transparent grants for independent work. Funding should widen participation without requiring artists to produce official messages.",
    "Young creators often combine digital formats and global influences, while older practitioners may hold deep craft knowledge. Collaboration can prevent innovation from becoming rootless and tradition from becoming static.",
    "Generative tools will change design workflows and make technical production faster. Human value will shift towards direction, judgement, originality, and the ability to explain why a creative choice matters.",
    "Schools can treat creativity as a process of observation, experimentation, critique, and revision. Students should learn that a strong idea usually improves through disciplined work rather than sudden inspiration.",
    "Artists are responsible for their choices, while institutions decide whose work receives space, education, and funding. A healthy creative culture requires both personal courage and fair access.",
  ],
  "food-and-globalisation": [
    "Food is significant because it carries memory and identity while meeting a basic need. Global exchange can enrich diets, but it can also weaken local knowledge if convenience becomes the only value.",
    "Ingredients and restaurant styles now travel rapidly, whereas older diets depended more on season and region. Variety has increased, although highly processed food has spread just as efficiently as healthy options.",
    "Global brands provide consistent standards and employment, but they can displace small businesses and normalise uniform tastes. Local producers compete best when quality and origin are made visible.",
    "Governments should enforce clear nutrition labels, protect food safety, and support local agriculture and markets. They should inform choice rather than dictate one acceptable cuisine.",
    "Young consumers may experiment with international flavours, while older relatives preserve seasonal methods and family recipes. The two approaches can complement each other instead of competing.",
    "Future diets will include more plant-based alternatives and technology-assisted farming as climate pressure grows. Price and taste will determine adoption more strongly than moral slogans alone.",
    "Schools can teach children to cook a few affordable meals and understand where ingredients come from. Practical food knowledge supports health, budgeting, and respect for cultural traditions simultaneously.",
    "Individuals choose meals, but producers and retailers shape price, availability, and marketing. Public policy has the larger role where safety and misleading claims are concerned.",
  ],
  "sports-and-discipline": [
    "Sport is important because it develops physical health, cooperation, and the ability to respond to failure. Its educational value is strongest when participation matters alongside winning.",
    "Recreational sport was often organised through schools and local clubs, whereas fitness apps and private gyms now offer more individual choice. Flexibility has grown, but community participation can be weaker.",
    "Competition gives training a clear purpose and can reveal excellence, yet excessive pressure encourages injury, cheating, and fear of mistakes. Rules and coaching culture determine which effect dominates.",
    "Governments should maintain safe public facilities, support youth coaches, and fund broad participation before prestige projects. Elite success is valuable, but it should not consume the entire sports budget.",
    "Young athletes may recover quickly but need protection from pressure, while older adults often exercise for mobility and social connection. Programmes should reflect those different goals.",
    "Wearable data and video analysis will become ordinary even in amateur sport. The tools can improve training, provided numbers support body awareness rather than replace it.",
    "Schools should expose learners to varied activities, teach recovery and teamwork, and assess effort fairly. A child who dislikes one competitive game should not conclude that all movement is unpleasant.",
    "Athletes are responsible for effort and conduct, while coaches and organisations control safety, selection, and incentives. Adults carry a particular duty when young people are involved.",
  ],
  "books-and-reading": [
    "Reading matters because it develops sustained attention and allows complex ideas to unfold without constant interruption. It also gives readers access to experiences far beyond their immediate environment.",
    "Printed books once dominated, whereas readers now move between paper, screens, and audio. The format has diversified, but competition from short-form entertainment has made concentration more deliberate.",
    "Digital books are portable, searchable, and accessible, yet ownership can be restricted and screens invite distraction. Printed books offer focus and permanence but cost more to store and distribute.",
    "Governments should maintain libraries, support translation, and ensure schools have inviting collections. A reading campaign is ineffective if suitable books are unavailable or treated only as examination material.",
    "Young readers may discover books through online communities, while older readers often rely on established habits and recommendations. Both groups respond to relevance and a sense of choice.",
    "Audio and interactive formats will keep growing, and recommendation systems will become more precise. The risk is that readers remain inside familiar genres unless libraries and teachers introduce productive surprise.",
    "Schools should allow some choice, discuss interpretation openly, and connect reading with writing and debate. Testing every chapter can turn curiosity into anxiety.",
    "Individuals must make time to read, while families, schools, publishers, and libraries shape access and early experience. A strong reading culture is clearly a collective achievement.",
  ],
};

const PART3_SAMPLE_POINTS_4: Record<string, Part3Points> = {
  "language-and-identity": [
    "Language is significant because it carries humour, memory, and social belonging as well as information. The language a person chooses can signal intimacy, professionalism, or cultural connection.",
    "Migration, media, and education have increased multilingual communication, while some smaller languages face declining daily use. People switch languages more easily, but not always on equal terms.",
    "A global language expands access to work and research, yet excessive pressure to use it can devalue local knowledge and make speakers self-conscious about accent. Multilingualism should add capacity rather than replace identity.",
    "Governments should provide strong education in both widely useful and local languages, support translation, and document vulnerable varieties. Protection works best when a language has modern uses, not only ceremonial status.",
    "Young people often mix languages naturally online, while older generations may defend clearer boundaries. Mixing can be creative, although learners still need control of formal registers.",
    "Real-time translation will remove some practical barriers, but people will continue learning languages for trust, nuance, and belonging. Technology may change the reason for learning rather than eliminate it.",
    "Schools can compare how ideas are expressed across languages and teach students not to confuse accent with intelligence. Such awareness improves both communication and cultural confidence.",
    "Individuals keep a language alive through daily use, while institutions determine whether it appears in education, media, and public services. Long-term protection therefore requires both personal commitment and structural support.",
  ],
  "shopping-and-consumption": [
    "Consumption matters because millions of ordinary purchases determine resource use, working conditions, and waste. The low price visible to a buyer may hide costs elsewhere in the system.",
    "Shopping has moved from local, limited choice towards global catalogues and near-instant delivery. Convenience is extraordinary, although the pause that once discouraged unnecessary purchases has largely disappeared.",
    "Online shopping saves time and improves price comparison, but it encourages returns, packaging waste, and decisions based on incomplete information. Physical shops offer inspection and human service but have higher operating costs.",
    "Governments should enforce product durability, repair rights, truthful reviews, and producer responsibility for waste. Consumers need comparable information rather than vague green labels.",
    "Young shoppers may value speed and online discovery, while older consumers often prefer inspecting products and speaking to staff. Trust and digital confidence explain much of that difference.",
    "Rental, resale, and repair platforms will grow as environmental and financial pressure increases. Successful services will need convenience close to that of buying new.",
    "Schools can teach budgeting, advertising analysis, and the lifecycle of common products. A project comparing total cost over several years makes responsible consumption concrete.",
    "Consumers should pause and choose carefully, but manufacturers and retailers control design, repairability, and information. They carry greater responsibility for waste that buyers cannot see.",
  ],
  "crime-and-safety": [
    "Public safety is important because fear can restrict education, work, and community life even when a person is never directly harmed. Trust in institutions is therefore part of safety itself.",
    "Some traditional crimes have declined in monitored spaces, while fraud and harassment have moved online. Technology changes where risk appears rather than removing it.",
    "Surveillance can help investigate serious offences and protect crowded places, but uncontrolled monitoring threatens privacy and may be used unfairly. Clear necessity, limited retention, and independent oversight are essential.",
    "Governments should invest in professional policing, youth support, well-designed public spaces, and efficient courts. Prevention and credible consequences are more effective together than either approach alone.",
    "Young people may face online exploitation and peer violence, while older adults can be targeted by financial scams. Safety advice must reflect actual exposure rather than treating everyone identically.",
    "Cybercrime will become more personalised through stolen data and synthetic media. Verification systems and rapid reporting will matter as much as locks and street lighting.",
    "Schools can teach consent, conflict resolution, digital security, and how to seek help. Practical scenarios are more useful than frightening learners with unlikely dangers.",
    "Individuals should take reasonable precautions, but public authorities and companies control policing, secure design, and response systems. Victims should never carry blame for sophisticated exploitation.",
  ],
  "science-and-innovation": [
    "Scientific innovation matters because it expands what society can prevent, measure, and build. Its value depends not only on discovery but on whether benefits become reliable and accessible.",
    "Research once moved mainly through universities and slow publication, whereas international teams and private firms now share data and develop products rapidly. Speed has increased both opportunity and the need for verification.",
    "Private investment can turn ideas into useful products quickly, but commercial incentives may neglect rare conditions or public goods. Public research provides balance, although it also requires accountability.",
    "Governments should fund basic research, require safety evidence, and create clear pathways for responsible trials. Regulation should focus on measurable risk rather than reacting to novelty itself.",
    "Young researchers may adopt new tools quickly, while experienced scientists bring methodological caution and knowledge of past failures. Strong teams need both qualities.",
    "AI-assisted discovery, personalised medicine, and cleaner materials will advance rapidly. The difficult questions will concern data, ownership, and who can afford the results.",
    "Education should teach how evidence is produced, challenged, and revised, not present science as a list of final facts. Students who design a fair test understand uncertainty more accurately.",
    "Scientists must communicate limits honestly, while institutions and governments decide funding, approval, and access. Ethical innovation is a chain of responsibilities rather than one heroic decision.",
  ],
  "tradition-and-modern-life": [
    "Tradition matters because it gives people continuity and a shared language for important events. It remains valuable when participants understand its meaning rather than follow it through fear.",
    "Customs once changed slowly within local communities, whereas migration and digital media now expose people to alternatives immediately. Some traditions weaken, while others are revived and presented to new audiences.",
    "Tradition can strengthen identity and intergenerational bonds, but it can also preserve unfair expectations. Respect should not prevent honest discussion about who benefits and who carries the burden.",
    "Governments should protect historic sites, crafts, and languages while avoiding control over private belief. Funding documentation and education is more legitimate than forcing participation.",
    "Young people may adapt customs to fit modern schedules and values, while older relatives worry that change will empty them of meaning. Conversation can separate essential values from replaceable form.",
    "Traditions will continue through smaller, more flexible practices and online communities. Those that explain their purpose and welcome participation are more likely to survive.",
    "Schools can invite community practitioners, compare sources, and let students document a custom critically. This approach creates informed respect rather than romanticising the past.",
    "Individuals decide what to practise, while families and institutions shape pressure and access. Preservation is healthiest when participation remains meaningful and voluntary.",
  ],
};

const PART3_ENDINGS: readonly (readonly string[])[] = [
  ["The deeper point is that its influence is structural as well as personal.", "That makes it a long-term social question rather than a passing preference."],
  ["The shift has widened choice, but it has also created a new form of responsibility.", "Progress is clear, although it should not be confused with an entirely positive outcome."],
  ["A balanced judgement therefore depends on design, access, and who absorbs the cost.", "Neither side can be evaluated fairly without considering the conditions around it."],
  ["The priority should be a measurable improvement rather than a highly visible announcement.", "Policy will work only if implementation is consistent and the public can evaluate results."],
  ["The distinction is useful, but broad age stereotypes would hide major individual differences.", "Their needs overlap more than public debate sometimes suggests."],
  ["The direction is plausible, although affordability and public trust will decide the speed.", "The most successful change will probably be gradual rather than dramatic."],
  ["That kind of applied learning develops judgement instead of providing another slogan.", "The aim should be independent reasoning, not teaching one approved opinion."],
  ["Shared responsibility does not mean equal power, so the strongest institutions should carry the clearest duties.", "Personal action matters, but it becomes effective only when systems make responsible choices realistic."],
];

const PART3_FINISHERS = [
  "That distinction is essential if the debate is to remain realistic.",
  "Any serious judgement should therefore consider both evidence and context.",
  "Without that balance, even a well-intentioned response may create new problems.",
  "The practical outcome matters more than the simplicity of the slogan.",
];

export const PART3_SAMPLE_POINTS: Record<string, Part3Points> = {
  ...PART3_SAMPLE_POINTS_1,
  ...PART3_SAMPLE_POINTS_2,
  ...PART3_SAMPLE_POINTS_3,
  ...PART3_SAMPLE_POINTS_4,
};

export function buildPart3Samples(slug: string, seed: number) {
  const points = PART3_SAMPLE_POINTS[slug];
  if (!points) throw new Error(`Missing Part 3 sample content for ${slug}`);
  return points.map((point, index) => {
    const endings = PART3_ENDINGS[index];
    return `${point} ${endings[seed % endings.length]} ${PART3_FINISHERS[(seed + index) % PART3_FINISHERS.length]}`;
  });
}

const CUE_SAMPLE_PROFILES_1: Record<string, CueSampleProfile> = {
  "memorable-trip": {
    subject: "The journey I remember most clearly was a three-day trip to Samarkand with two university friends.",
    setting: "We travelled by early train at the end of spring, when the weather was warm but the main sites were not overwhelmingly crowded.",
    details: "Instead of rushing through a checklist, we walked between the Registan, smaller streets, and a family-run café where the owner explained how the neighbourhood had changed.",
    development: "The trip became difficult when one friend lost his wallet, so we retraced our route and eventually found it at the café. The owner had kept it safely without knowing whether we would return.",
    reflection: "That act of honesty gave the city a human meaning beyond its architecture. It also taught me that a little unplanned time creates better memories than an overfilled itinerary.",
  },
  "helpful-person": {
    subject: "A person who made a real difference to me was my secondary-school English teacher, Ms Karimova.",
    setting: "I met her when I could understand grammar exercises but became extremely nervous whenever I had to speak in front of the class.",
    details: "She noticed the problem and asked me to record one-minute answers privately before giving short classroom presentations. Her feedback was precise: one pronunciation point and one idea to develop, never a list of every mistake.",
    development: "After several weeks, she invited me to help a younger student prepare for a school competition. Teaching someone else forced me to speak clearly and stopped me focusing entirely on myself.",
    reflection: "Her help was valuable because it created independence rather than dependence. I still use the same small-step approach when a difficult task feels too large to begin.",
  },
  "useful-app": {
    subject: "The digital tool I rely on most is a spaced-repetition application that I use for English vocabulary.",
    setting: "I started using it during a busy semester because ordinary word lists were growing longer while very little vocabulary remained available in conversation.",
    details: "I save a word with its sentence, pronunciation, and one personal example. The app then schedules reviews just before I am likely to forget, so a ten-minute session has a clear purpose.",
    development: "At first I added too many cards and created an exhausting queue. Reducing the number and deleting vague examples made the system far more sustainable.",
    reflection: "Its real value is not clever technology but the consistency it supports. It has also taught me that a small tool works best when the user understands and controls the method behind it.",
  },
  "special-meal": {
    subject: "A meal that stands out was the plov my family prepared for my grandmother's seventieth birthday.",
    setting: "We held the celebration in my uncle's courtyard in early autumn, and relatives arrived from several cities, some of whom I had not seen for years.",
    details: "My uncle managed the kazan while the rest of us cut vegetables, arranged fruit, and set a long table. The food itself was excellent, with tender meat and rice that remained separate rather than heavy.",
    development: "What made the meal special was the pause before eating, when my grandmother spoke briefly about the family members who had supported her throughout her life.",
    reflection: "The occasion reminded me that traditional food is often a structure for attention and gratitude. I remember the conversations and shared work even more clearly than the flavour.",
  },
  "important-decision": {
    subject: "One decision that changed my direction was choosing software engineering instead of a more familiar business degree.",
    setting: "I had to decide near the end of school, when relatives were giving confident but contradictory advice and I had very limited experience of either field.",
    details: "I compared course content, spoke to two current students, and completed a free introductory programming course. I enjoyed the frustration of debugging more than I expected because each error had an explanation I could eventually find.",
    development: "The risky part was accepting that the first year might be difficult and that interest alone would not replace disciplined mathematics and practice.",
    reflection: "I chose the technical route and have not regretted it. More importantly, the process taught me to test a major choice through small real experiences rather than opinions alone.",
  },
  "quiet-place": {
    subject: "My favourite quiet place is a small reading room on the upper floor of the city library.",
    setting: "It faces an inner courtyard, so traffic is barely audible, and I usually go there on weekday mornings when only a few other readers are present.",
    details: "The room has high windows, plain wooden desks, and no background music. I choose a seat near natural light, put my phone in my bag, and work in forty-minute blocks.",
    development: "I discovered it during an exam period after struggling to concentrate at home. Within one morning, I completed work that had remained unfinished for several days.",
    reflection: "The place matters because its simplicity changes my behaviour without requiring willpower. I leave feeling mentally lighter, even when the subject I studied was demanding.",
  },
  "skill-learned": {
    subject: "A skill I am particularly pleased to have learned is giving a clear presentation in English.",
    setting: "I began practising before a university project because I knew the technical content but tended to speak too quickly and hide behind crowded slides.",
    details: "I reduced each slide to one idea, rehearsed with a timer, and recorded myself to identify unclear pronunciation. I also learned to pause after an important figure instead of filling every silence.",
    development: "My first rehearsal was uncomfortable, but feedback from a classmate showed that the structure was already improving even before my confidence caught up.",
    reflection: "The final presentation went smoothly and the questions felt like a conversation rather than a threat. The skill has helped me explain ideas more logically in everyday discussions as well.",
  },
  "interesting-book": {
    subject: "A book that genuinely changed my thinking was James Clear's Atomic Habits.",
    setting: "I read it during a period when I was setting ambitious study goals but repeatedly abandoning them after a few intense days.",
    details: "The most useful idea was to make a behaviour obvious and easy rather than relying on motivation. I placed my vocabulary notebook on my desk and reduced the target to ten focused minutes.",
    development: "The approach sounded almost too simple, but after a month the regular sessions had produced more progress than my previous weekend marathons.",
    reflection: "I would not treat the book as a perfect scientific rulebook, yet its practical framework was exactly what I needed. It made consistency feel like a design problem rather than a character flaw.",
  },
  "family-celebration": {
    subject: "The family celebration I remember most warmly was my sister's wedding.",
    setting: "It took place in Tashkent in early summer after months of preparation involving relatives from both sides of the family.",
    details: "The formal ceremony was beautiful, but my favourite part was the quieter morning at home when close relatives shared breakfast and helped with final details.",
    development: "One small problem occurred when a musician arrived late, yet an uncle kept the guests relaxed with stories until the programme continued. The delay actually made the event feel less staged.",
    reflection: "The day mattered because it joined tradition with the couple's own choices. I also saw how celebrations depend on invisible cooperation, not only the people standing in the centre.",
  },
  "good-advice": {
    subject: "The most useful advice I have received was to show unfinished work earlier rather than waiting until it feels perfect.",
    setting: "A university mentor told me this after I spent too long developing the wrong feature for a group project without asking for feedback.",
    details: "He explained that a rough prototype gives other people something concrete to question, whereas a private idea can remain wrong for weeks. I began sharing small versions at agreed checkpoints.",
    development: "The change felt uncomfortable because feedback on incomplete work seemed like judgement. In practice, early comments were gentler and much easier to act on than criticism near a deadline.",
    reflection: "I now apply the advice to writing and presentations as well as software. It has not lowered my standards; it has made the path to a strong result more efficient and collaborative.",
  },
};

const CUE_SAMPLE_PROFILES_2: Record<string, CueSampleProfile> = {
  "expensive-item": {
    subject: "The most expensive personal item I have bought is the laptop I use for study and development work.",
    setting: "I saved for nearly a year and purchased it shortly before starting university, when my old computer could no longer run the tools required for class.",
    details: "I compared performance, battery life, repair options, and price instead of choosing the most impressive model. Eventually I selected a mid-range machine and upgraded the memory rather than paying for features I would not use.",
    development: "Spending that amount made me nervous, so I waited an extra week before ordering. The delay confirmed that the purchase solved a long-term problem rather than a temporary desire.",
    reflection: "It has been worthwhile because I use it every day and it has supported several real projects. The experience taught me to judge an expensive item by cost per use and reliability.",
  },
  "sport-event": {
    subject: "A sporting event I found genuinely exciting was Uzbekistan's match during an international football tournament.",
    setting: "I watched it at a friend's home with a mixed group of serious fans and people who normally pay little attention to football.",
    details: "The team conceded early but remained organised, gradually creating better chances. The equalising goal came from a quick passing move, and the room went from tense silence to complete chaos in seconds.",
    development: "What impressed me most was the players' discipline after scoring; instead of becoming reckless, they kept their shape and earned a narrow victory late in the match.",
    reflection: "The event showed why live sport creates such strong shared emotion. I also appreciated the tactical side more than before, particularly how patience can be as decisive as individual talent.",
  },
  "old-photo": {
    subject: "An old photograph I treasure shows my grandparents sitting beside a fruit tree in their garden.",
    setting: "It was taken more than twenty years ago with a simple film camera, before posed digital photographs became part of every family gathering.",
    details: "My grandfather is holding a cup of tea while my grandmother is laughing at something outside the frame. The colours are slightly faded, and a corner is bent, but those imperfections make it feel handled and real.",
    development: "I noticed the photograph only recently when we organised a cupboard. My mother explained that it was taken on an ordinary afternoon rather than a special occasion.",
    reflection: "That detail is exactly why I value it. It preserves their natural relationship and reminds me that everyday moments often become more meaningful than carefully planned pictures.",
  },
  "city-you-like": {
    subject: "The city at the top of my travel list is Kyoto in Japan.",
    setting: "I became interested after seeing a documentary that followed residents through ordinary neighbourhoods rather than showing only the most famous temples.",
    details: "I would like to visit in late autumn, use public transport, walk through older districts, and spend time in both traditional gardens and contemporary design spaces.",
    development: "What attracts me is the visible coexistence of careful tradition and advanced urban life. I would prepare by learning basic Japanese courtesy and researching times when major sites are less crowded.",
    reflection: "The trip would be more than a collection of photographs. I hope it would challenge my assumptions about modernisation and show how a city can change without erasing every trace of its past.",
  },
  "difficult-task": {
    subject: "A demanding task I completed was coordinating the final release of a group software project at university.",
    setting: "We had four weeks, five team members, and a feature list that was clearly too ambitious, while nobody initially wanted to remove their favourite idea.",
    details: "I divided the work into essential and optional parts, created a shared board, and introduced short progress meetings twice a week. This made delays visible before they became emergencies.",
    development: "Two days before submission, a major login bug appeared. We stopped adding features, reproduced the error carefully, and fixed the underlying state problem rather than hiding it with a quick patch.",
    reflection: "We submitted a stable, smaller product and received strong feedback for clarity. The task taught me that leadership often means reducing scope and protecting focus, not simply asking people to work faster.",
  },
  "creative-person": {
    subject: "A creative person I admire is my cousin, who works as an independent graphic designer.",
    setting: "I became interested in her work when she redesigned the packaging for a small family bakery with a very limited budget.",
    details: "She observed customers, photographed traditional patterns, and reduced the colour palette to make printing affordable. The final design felt modern without pretending the business had no history.",
    development: "What surprised me was the number of discarded versions behind the simple result. She treated criticism as information, asked precise questions, and revised the concept several times.",
    reflection: "Her creativity is disciplined rather than mysterious. She has shown me that original work comes from careful observation, constraints, and the willingness to improve an idea after the first excitement disappears.",
  },
  "useful-object": {
    subject: "One of the most useful objects in my home is a compact adjustable desk lamp.",
    setting: "I bought it when evening study was causing eye strain because the ceiling light created shadows across my notebook and keyboard.",
    details: "The lamp has a flexible arm, three brightness levels, and a warm setting that is comfortable late at night. It occupies very little space and uses an ordinary replaceable bulb.",
    development: "I initially thought such a basic object could not matter much, but better lighting helped me remain focused and made video calls look clearer as well.",
    reflection: "I value it because it solves one problem quietly every day. It is a good reminder that usefulness often comes from thoughtful design rather than complexity or a high price.",
  },
  "film-recommendation": {
    subject: "A film I regularly recommend is The Martian, directed by Ridley Scott.",
    setting: "I first watched it before an exam period, expecting straightforward science fiction, but it turned out to be a surprisingly optimistic story about problem-solving.",
    details: "The main character is stranded on Mars and survives by breaking an impossible situation into smaller technical challenges. The film balances tension with humour and gives supporting scientists meaningful roles.",
    development: "I particularly liked that intelligence is shown as collaborative and methodical rather than magical. Some science is simplified, but the logic feels consistent enough to support the drama.",
    reflection: "I would recommend it to people who dislike overly dark films. It is entertaining, visually strong, and leaves the viewer with a memorable idea: persistence is often a sequence of ordinary solutions.",
  },
  "environmental-problem": {
    subject: "A visible environmental problem in my area is the decline in air quality during busy, dry periods.",
    setting: "It is most noticeable near major roads in winter, when traffic, heating, and still weather combine and the horizon develops a grey layer.",
    details: "Residents complain about dust and irritation, yet the sources are not always explained clearly. More reliable monitoring would help distinguish transport emissions, construction dust, and seasonal conditions.",
    development: "The issue cannot be solved by telling individuals to stay indoors. Better buses, enforcement at construction sites, cleaner heating, and public data would address several causes together.",
    reflection: "I find the problem worrying because polluted air affects everyone regardless of personal lifestyle. It has made me see environmental policy as an immediate health question rather than an abstract global discussion.",
  },
  "future-job": {
    subject: "The role I would like to have in the future is product engineer for an education-technology company.",
    setting: "The idea appeals to me because it combines software development with a problem I understand personally: helping learners practise consistently and receive useful feedback.",
    details: "I would want to work with designers, teachers, and researchers rather than build features in isolation. My responsibility would include testing whether a tool actually improves learning, not only whether users click it.",
    development: "To prepare, I am strengthening programming fundamentals, English communication, and my ability to analyse user behaviour ethically. I also need experience shipping smaller products before aiming for a senior role.",
    reflection: "The job would be demanding because educational outcomes are difficult to measure, but that is part of its appeal. I want technical work whose quality has a clear human consequence.",
  },
};

export const CUE_SAMPLE_PROFILES: Record<string, CueSampleProfile> = {
  ...CUE_SAMPLE_PROFILES_1,
  ...CUE_SAMPLE_PROFILES_2,
};

const CUE_CLOSINGS = [
  "Looking back, the experience remains vivid because it changed how I think, not merely because the event itself was unusual.",
  "Overall, it is a memory I can describe naturally because the details, difficulty, and lesson are all connected.",
  "What stays with me is the practical lesson behind the story, which is why it still feels relevant rather than nostalgic.",
];

export function buildCueSample(slug: string, seed: number) {
  const profile = CUE_SAMPLE_PROFILES[slug];
  if (!profile) throw new Error(`Missing cue-card sample content for ${slug}`);
  return `${profile.subject} ${profile.setting} ${profile.details} ${profile.development} ${profile.reflection} ${CUE_CLOSINGS[seed % CUE_CLOSINGS.length]}`;
}

export function buildCueQuestionSamples(slug: string, seed: number) {
  const profile = CUE_SAMPLE_PROFILES[slug];
  if (!profile) throw new Error(`Missing cue-card sample content for ${slug}`);
  return [
    buildCueSample(slug, seed),
    `${profile.setting} I would keep two concrete details from that setting and one moment of difficulty from the story. ${profile.development} Those elements create a clear sequence and make the answer personal without filling it with unrelated facts.`,
    `I would prioritise precise verbs for the main actions, sensory language for the setting, and one reflective phrase for the final idea. ${profile.reflection} That vocabulary supports meaning naturally, which is safer than forcing rare words into every sentence.`,
  ];
}
