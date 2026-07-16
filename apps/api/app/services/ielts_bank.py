"""Built-in IELTS practice bank — original passages and scripts, no AI needed.

Every item is written for this app in authentic IELTS style (Academic Reading
passages ~300-380 words with 6 MCQs; Listening scripts ~220-280 words with 5
MCQs). Real Cambridge past papers are copyrighted, so the bank mirrors their
format and difficulty without reproducing them. Answer keys stay server-side:
starting a bank item creates a normal IeltsTest row, so grading, XP and band
history reuse the existing pipeline.
"""
from typing import Any, Dict, List, Optional

Item = Dict[str, Any]

READING_BANK: List[Item] = [
    {
        "id": "r1",
        "title": "The Quiet Rise of Urban Beekeeping",
        "body": (
            "City rooftops are not the first place most people would look for honey, yet urban "
            "beekeeping has grown steadily over the past two decades. Paris, London and New York "
            "now host thousands of registered hives, kept on hotels, office towers and even opera "
            "houses. The trend began partly as a response to alarming reports of bee decline in "
            "the countryside, where intensive agriculture, pesticide use and the loss of wildflower "
            "meadows have made survival difficult for pollinators.\n\n"
            "Counter-intuitively, cities can be surprisingly good habitats for bees. Urban parks, "
            "gardens and balcony flower boxes provide a diverse, almost year-round supply of "
            "nectar, in contrast to rural areas dominated by a single crop that blooms only for a "
            "few weeks. City authorities also restrict pesticide spraying more tightly than farms "
            "do. Studies in Berlin found that urban colonies often produced more honey than their "
            "rural counterparts and survived winters at higher rates.\n\n"
            "The movement is not without critics. Some ecologists warn that honeybees, which are "
            "essentially managed livestock, can out-compete wild pollinators such as bumblebees "
            "and solitary bees when hive densities rise too high. A single honeybee colony can "
            "contain fifty thousand workers, all foraging within the same few kilometres as their "
            "wild cousins. In response, several cities have begun licensing hives and encouraging "
            "residents to plant pollinator-friendly flowers rather than simply adding more bees.\n\n"
            "For many urban beekeepers, however, the appeal goes beyond honey or even "
            "conservation. Schools use observation hives to teach biology; companies report that "
            "rooftop apiaries improve staff morale; and city dwellers describe beekeeping as a "
            "rare, calming connection to the natural world. Whether the bees need cities is still "
            "debated — but many city residents, it seems, need the bees."
        ),
        "questions": [
            {"prompt": "Why did urban beekeeping originally become popular?", "options": ["Because honey prices rose sharply", "As a reaction to reports of declining bees in rural areas", "Because governments paid people to keep hives", "As a way to reduce pesticide use in cities"], "answer_index": 1},
            {"prompt": "According to the passage, why can cities suit bees well?", "options": ["Cities are warmer than the countryside all year", "There are no other pollinators to compete with", "Varied plants provide nectar for much of the year", "Urban honey sells for more money"], "answer_index": 2},
            {"prompt": "What did the Berlin studies find?", "options": ["Urban colonies often out-performed rural ones", "Rural bees produced more honey", "City bees suffered more in winter", "Berlin banned rooftop hives"], "answer_index": 0},
            {"prompt": "What concern do some ecologists raise?", "options": ["Honeybees may spread disease to humans", "Managed honeybees can crowd out wild pollinators", "Rooftop hives are dangerous for residents", "Urban honey is unsafe to eat"], "answer_index": 1},
            {"prompt": "The phrase 'managed livestock' suggests honeybees are…", "options": ["wild animals in danger of extinction", "animals kept and controlled by people", "a species that cannot survive outdoors", "illegal in most cities"], "answer_index": 1},
            {"prompt": "What is the writer's overall conclusion?", "options": ["Bees would be better off without cities", "Beekeeping should be limited to schools", "City people gain something valuable from beekeeping", "Honey production is the main benefit of urban hives"], "answer_index": 2},
        ],
    },
    {
        "id": "r2",
        "title": "A Short History of Tea",
        "body": (
            "Few drinks have shaped world history as quietly and thoroughly as tea. According to "
            "Chinese tradition, the beverage was discovered more than four thousand years ago when "
            "leaves from a wild tree drifted into a pot of boiling water. Whatever the truth of the "
            "legend, tea was being cultivated in China's Yunnan region well over two thousand years "
            "ago, first as a medicine and only later as a daily drink.\n\n"
            "Tea reached Japan in the ninth century with returning Buddhist monks, who valued its "
            "power to keep them alert during long meditation. There it evolved into the elaborate "
            "tea ceremony, a ritual of hospitality that continues today. Europe, by contrast, met "
            "tea remarkably late: Dutch traders carried the first chests to Amsterdam in 1610, and "
            "for decades it remained an expensive curiosity, locked in special boxes by wealthy "
            "households.\n\n"
            "It was Britain that turned tea into a mass habit. By the late eighteenth century tea "
            "had overtaken beer as the national drink, helped by falling prices and the new custom "
            "of adding milk and sugar. Demand had dramatic consequences. To pay for its imports, "
            "the British East India Company grew opium in India and sold it in China, provoking "
            "two wars. Later, to break China's monopoly, the company smuggled tea plants and "
            "expert growers out of the country and established vast plantations in India and "
            "Ceylon, transforming those economies permanently.\n\n"
            "Today tea is the world's most consumed drink after water, with global production "
            "exceeding six million tonnes a year. Its story — of monks and merchants, ritual and "
            "empire — is a reminder that even the most ordinary items on our kitchen shelves can "
            "carry an extraordinary past."
        ),
        "questions": [
            {"prompt": "How was tea first used in ancient China?", "options": ["As a religious offering", "As a medicine", "As a trade currency", "As a cooking ingredient"], "answer_index": 1},
            {"prompt": "Why did Buddhist monks value tea?", "options": ["It helped them stay awake during meditation", "It was part of their religious texts", "It could be traded for food", "It grew inside their temples"], "answer_index": 0},
            {"prompt": "When did tea first arrive in Europe?", "options": ["In the ninth century", "In the fourteenth century", "In 1610", "In the late eighteenth century"], "answer_index": 2},
            {"prompt": "What helped tea become Britain's national drink?", "options": ["A government campaign", "Falling prices and adding milk and sugar", "The invention of the teabag", "A ban on coffee"], "answer_index": 1},
            {"prompt": "Why did the East India Company sell opium in China?", "options": ["To fund its tea purchases", "To weaken the Chinese army", "Because tea sales were banned", "To support Indian farmers"], "answer_index": 0},
            {"prompt": "What is the main idea of the final paragraph?", "options": ["Tea is losing popularity to coffee", "Everyday products can have remarkable histories", "Water remains the world's favourite drink", "Tea production must increase further"], "answer_index": 1},
        ],
    },
    {
        "id": "r3",
        "title": "Why We Sleep in Cycles",
        "body": (
            "Sleep feels like a single, uniform state — a nightly switch from 'on' to 'off'. In "
            "reality, the sleeping brain moves through a repeating cycle of distinct stages, each "
            "with its own electrical signature and, scientists increasingly believe, its own job.\n\n"
            "A typical cycle lasts about ninety minutes and repeats four to six times a night. It "
            "begins with light sleep, when muscles relax and heart rate slows, then deepens into "
            "slow-wave sleep, the stage from which people are hardest to wake. Slow-wave sleep "
            "dominates the first half of the night, and research links it to physical recovery and "
            "to the consolidation of factual memories: the brain appears to replay the day's "
            "learning, transferring it from temporary to long-term storage.\n\n"
            "The cycle ends with REM sleep — rapid eye movement — when brain activity looks almost "
            "identical to waking and most vivid dreaming occurs. The body, meanwhile, is "
            "temporarily paralysed, presumably to stop us acting out our dreams. REM periods "
            "lengthen as the night goes on, which is why alarm clocks so often interrupt an "
            "elaborate dream. REM sleep is thought to support emotional processing and creative "
            "problem-solving; volunteers deprived of it become irritable and score worse on tasks "
            "requiring flexible thinking.\n\n"
            "The practical lesson of sleep science is that duration is not everything: timing and "
            "completeness of cycles matter too. Waking mid-cycle from deep sleep produces the "
            "groggy heaviness known as sleep inertia, which can impair judgement for half an hour "
            "or more. This is why some researchers recommend planning sleep in ninety-minute "
            "multiples, and why a twenty-minute nap — too short to enter deep sleep — often "
            "refreshes more than an hour-long one."
        ),
        "questions": [
            {"prompt": "What is the main point of the first paragraph?", "options": ["Sleep is a single uniform state", "Sleep consists of distinct repeating stages", "Scientists cannot measure sleep", "Dreams occur all night long"], "answer_index": 1},
            {"prompt": "How long does a typical sleep cycle last?", "options": ["Twenty minutes", "Half an hour", "About ninety minutes", "Four to six hours"], "answer_index": 2},
            {"prompt": "Slow-wave sleep is linked to…", "options": ["vivid dreaming", "physical recovery and factual memory", "emotional problems", "acting out dreams"], "answer_index": 1},
            {"prompt": "Why is the body paralysed during REM sleep?", "options": ["To conserve energy", "Because muscles are exhausted", "Probably to prevent us acting out dreams", "To keep the heart rate low"], "answer_index": 2},
            {"prompt": "What happens to REM periods through the night?", "options": ["They become longer", "They become shorter", "They disappear after midnight", "They stay exactly the same"], "answer_index": 0},
            {"prompt": "Why can a 20-minute nap beat an hour-long one?", "options": ["It is easier to schedule", "It avoids entering deep sleep, so no sleep inertia", "It includes more REM sleep", "It lowers heart rate further"], "answer_index": 1},
        ],
    },
    {
        "id": "r4",
        "title": "The Sea That Disappeared",
        "body": (
            "Sixty years ago the Aral Sea, straddling the border of Kazakhstan and Uzbekistan, was "
            "the fourth-largest lake on Earth, supporting a fishing fleet that supplied a sixth of "
            "the Soviet Union's catch. Today most of its bed is a salt desert, and the story of how "
            "this happened has become a textbook warning about unintended consequences.\n\n"
            "The sea was fed by two great rivers, the Amu Darya and the Syr Darya. In the 1960s "
            "planners diverted both to irrigate enormous new cotton fields, fully aware that the "
            "lake would shrink but expecting the trade to be worthwhile. The scale of the loss, "
            "however, outran every prediction. By the 1990s the shoreline had retreated up to a "
            "hundred kilometres, stranding harbour cranes and fishing boats in open desert. As the "
            "water withdrew it grew saltier, killing the native fish and, with them, forty thousand "
            "jobs.\n\n"
            "The consequences spread far beyond fishing. Winds lifted an estimated forty-five "
            "million tonnes of salt and pesticide-laden dust from the exposed seabed each year, "
            "damaging crops and raising rates of respiratory disease in surrounding regions. The "
            "shrunken sea also stopped moderating the local climate: summers became hotter, "
            "winters colder, and the growing season shorter — ironically harming the very cotton "
            "the diversions were meant to serve.\n\n"
            "Yet the story has a partial counter-example. In 2005 Kazakhstan completed a dam that "
            "retains the Syr Darya's flow in the sea's northern basin. Within years the North Aral "
            "rose several metres, salinity fell, fish returned, and villages that had lost their "
            "livelihoods began fishing again. The larger southern basin is likely lost, but the "
            "north shows that even severe environmental damage need not always be final."
        ),
        "questions": [
            {"prompt": "What was the Aral Sea sixty years ago?", "options": ["A salt desert", "The world's fourth-largest lake", "A small fishing pond", "An artificial reservoir"], "answer_index": 1},
            {"prompt": "Why was river water diverted in the 1960s?", "options": ["To supply drinking water to cities", "To generate electricity", "To irrigate cotton fields", "To prevent flooding"], "answer_index": 2},
            {"prompt": "Did planners expect the sea to shrink?", "options": ["No, it was a complete surprise", "Yes, but the loss exceeded predictions", "Yes, and their predictions were accurate", "The passage does not say"], "answer_index": 1},
            {"prompt": "What killed the native fish?", "options": ["Overfishing by the Soviet fleet", "Rising water temperature", "Increasing saltiness of the water", "Pesticides sprayed on the water"], "answer_index": 2},
            {"prompt": "How did the shrinking sea affect local climate?", "options": ["Summers cooled and winters warmed", "The growing season became longer", "Summers grew hotter and winters colder", "Rainfall increased sharply"], "answer_index": 2},
            {"prompt": "What does the North Aral example demonstrate?", "options": ["Environmental damage is always permanent", "Dams inevitably cause harm", "Severe damage can sometimes be partly reversed", "Fishing should be banned in recovering lakes"], "answer_index": 2},
        ],
    },
    {
        "id": "r5",
        "title": "The Infinite Life of Glass",
        "body": (
            "Of all everyday materials, glass comes closest to true immortality. A glass bottle "
            "can be melted down and reformed into a new one indefinitely, with no loss of clarity "
            "or strength — something neither paper, which weakens each cycle, nor plastic, which "
            "degrades quickly, can claim. Yet global recycling rates for glass remain stubbornly "
            "uneven: above ninety per cent in countries such as Slovenia and Belgium, below "
            "one-third in others.\n\n"
            "The economics explain much of the gap. Recycled crushed glass, known in the industry "
            "as cullet, melts at a lower temperature than the raw mixture of sand, soda ash and "
            "limestone. Every ten per cent of cullet added to a furnace cuts its energy use by "
            "roughly three per cent and its carbon emissions by nearly five. Manufacturers "
            "therefore want cullet — but only if it is clean and sorted by colour. A single "
            "ceramic coffee mug in a load of bottles can weaken an entire batch, and green glass "
            "mixed into clear ruins its value. Where collection systems are careless, cullet "
            "becomes worthless and ends up as landfill or road filler.\n\n"
            "Policy design turns out to matter more than public enthusiasm. The highest-recycling "
            "countries almost all use deposit-return schemes: customers pay a small surcharge on "
            "each bottle and get it back on return, converting rubbish into something with a "
            "price. Separate collection bins for each colour of glass, common across parts of "
            "Europe, solve the sorting problem before it starts.\n\n"
            "Campaigners argue the ultimate goal should be reuse rather than recycling: a returned "
            "bottle that is simply washed and refilled uses a fraction of the energy of one that "
            "must be melted. Several countries once ran exactly such systems — and abandoned them "
            "not because they failed, but because single-use packaging was cheaper to administer."
        ),
        "questions": [
            {"prompt": "In what way is glass superior to paper and plastic?", "options": ["It is lighter to transport", "It can be recycled endlessly without degrading", "It is cheaper to produce", "It cannot break"], "answer_index": 1},
            {"prompt": "What is 'cullet'?", "options": ["A type of furnace", "Raw sand for glassmaking", "Recycled crushed glass", "A brand of bottle"], "answer_index": 2},
            {"prompt": "Why do manufacturers value cullet?", "options": ["It melts at lower temperature, saving energy", "It is stronger than new glass", "It is easier to colour", "Governments require its use"], "answer_index": 0},
            {"prompt": "What problem can a ceramic mug cause?", "options": ["It blocks collection trucks", "It can weaken a whole batch of recycled glass", "It changes the colour of the furnace", "It raises the melting temperature of sand"], "answer_index": 1},
            {"prompt": "What do the most successful recycling countries have in common?", "options": ["Larger landfill sites", "Deposit-return schemes", "Bans on green glass", "Cheaper electricity"], "answer_index": 1},
            {"prompt": "Why were old bottle-reuse systems abandoned?", "options": ["They failed to work properly", "Customers refused to return bottles", "Single-use packaging was cheaper to manage", "Washed bottles were unsafe"], "answer_index": 2},
        ],
    },
    {
        "id": "r6",
        "title": "Gutenberg's Unintended Revolution",
        "body": (
            "When Johannes Gutenberg assembled his printing press in Mainz around 1450, his "
            "ambitions were commercial, not revolutionary. A goldsmith by training, he wanted to "
            "mass-produce Bibles and prayer books that could compete with the work of manuscript "
            "copyists. He almost certainly never imagined that his machine would reorganise "
            "European knowledge within two generations.\n\n"
            "The core insight was not the press itself — screw presses had crushed grapes and "
            "olives for centuries — but movable metal type: individual letters, cast in a durable "
            "alloy, that could be arranged, inked, printed and then reused endlessly. Combined "
            "with oil-based ink and paper, which had recently become affordable, the system could "
            "produce in a week what a copyist produced in a year, at a fraction of the cost.\n\n"
            "The consequences arrived faster than any authority could manage. Within fifty years, "
            "printing shops operated in more than two hundred European towns, and historians "
            "estimate that more books were produced in that half-century than in the previous "
            "thousand years. Prices collapsed, and reading spread from clergy and nobles to "
            "merchants, craftsmen and eventually their children. Scholars in different countries "
            "could finally consult identical texts, complete with page numbers, making precise "
            "citation — and therefore systematic criticism — possible for the first time.\n\n"
            "Not everyone welcomed the change. Rulers and church authorities, alarmed by the "
            "speed at which ideas now travelled, responded with licensing laws, censorship and "
            "lists of forbidden books — the first information regulations in history. They "
            "largely failed. As one historian has observed, the printing press did not simply "
            "spread information: it broke the monopoly on deciding what information was worth "
            "spreading. Every debate about the internet today has a fifteenth-century echo."
        ),
        "questions": [
            {"prompt": "What was Gutenberg's original goal?", "options": ["To start a political revolution", "To profit from mass-produced religious books", "To replace paper with parchment", "To teach Europeans to read"], "answer_index": 1},
            {"prompt": "What was truly new in Gutenberg's system?", "options": ["The screw press", "Oil-based ink", "Reusable movable metal type", "Cheap paper"], "answer_index": 2},
            {"prompt": "What does the passage say about book production after 1450?", "options": ["It fell due to censorship", "More books appeared in 50 years than in the previous 1000", "Only Bibles were printed", "Prices rose sharply"], "answer_index": 1},
            {"prompt": "Why did page numbers matter to scholars?", "options": ["They made books heavier", "They enabled precise citation and criticism", "They were required by law", "They helped printers charge more"], "answer_index": 1},
            {"prompt": "How did authorities react to printing?", "options": ["They ignored it completely", "They funded more printing shops", "They introduced censorship and licensing", "They banned paper production"], "answer_index": 2},
            {"prompt": "What comparison does the passage end with?", "options": ["Printing and the internet raise similar debates", "Gutenberg was richer than modern publishers", "Books are better than websites", "Censorship works better today"], "answer_index": 0},
        ],
    },
]

LISTENING_BANK: List[Item] = [
    {
        "id": "l1",
        "title": "Enrolling at the Language Centre",
        "body": (
            "Receptionist: Good morning, City Language Centre. How can I help you? "
            "Student: Hi, I'd like to ask about the evening English courses. "
            "Receptionist: Of course. We run three levels — intermediate on Mondays and "
            "Wednesdays, upper-intermediate on Tuesdays and Thursdays, and an advanced class on "
            "Friday evenings only. All classes run from six thirty to eight thirty. "
            "Student: How much is the upper-intermediate course? "
            "Receptionist: It's two hundred and forty dollars for the ten-week term, but if you "
            "enrol before the twentieth of September you get the early-bird rate of two hundred. "
            "Student: That's good. Is there a placement test? "
            "Receptionist: Yes, it's free and takes about forty-five minutes — thirty minutes of "
            "grammar and vocabulary on a computer, then a short speaking interview with one of "
            "our teachers. You can take it any weekday between two and five in the afternoon. "
            "Student: Do I need to book the test? "
            "Receptionist: You don't need an appointment, but do bring some photo identification "
            "— a passport or a driving licence is fine. And one more thing: bring your own "
            "headphones for the computer section, we no longer provide them. "
            "Student: Great. And where exactly are you located? "
            "Receptionist: We're at forty-two Riverside Road, on the third floor, directly above "
            "the public library. The nearest bus stop is called Museum Corner."
        ),
        "questions": [
            {"prompt": "When does the upper-intermediate class meet?", "options": ["Mondays and Wednesdays", "Tuesdays and Thursdays", "Friday evenings", "Every weekday"], "answer_index": 1},
            {"prompt": "What is the early-bird price?", "options": ["$240", "$200", "$220", "$245"], "answer_index": 1},
            {"prompt": "How long is the placement test in total?", "options": ["Thirty minutes", "About forty-five minutes", "Two hours", "Fifteen minutes"], "answer_index": 1},
            {"prompt": "What must students bring to the test?", "options": ["A booking confirmation", "Photo ID and headphones", "Two photographs", "A previous certificate"], "answer_index": 1},
            {"prompt": "Where is the language centre?", "options": ["Above the public library", "Inside the museum", "Next to the bus station", "On Riverside Road's ground floor"], "answer_index": 0},
        ],
    },
    {
        "id": "l2",
        "title": "Museum Audio Tour: The Silk Road Gallery",
        "body": (
            "Welcome to the Silk Road gallery. Before we begin, please note that photography is "
            "allowed everywhere in this room except at the manuscript case by the far wall, where "
            "flash damages the thousand-year-old inks. The gallery is arranged as a journey from "
            "east to west. We start beside the camel caravan model on your left. A full caravan "
            "could include five hundred animals, and a healthy camel carried around two hundred "
            "kilograms of goods — silk and porcelain travelling west, glass, wool and silver "
            "moving east. In the central case you'll see the gallery's most famous object: a "
            "small bronze mirror made in the eighth century. It was found not in China but four "
            "thousand kilometres away in Samarkand, proof of how far single objects travelled. "
            "Notice that trade carried more than goods. The display on your right shows how paper-"
            "making spread from China through Central Asia to Europe, taking almost seven hundred "
            "years to complete the journey. Ideas, religions and even recipes moved the same way. "
            "At the end of the room you can try our interactive map: place your hand on a city "
            "and the screen shows what was bought and sold there. The tour continues upstairs in "
            "the textile room, but please visit the manuscripts first, as that section closes "
            "early today, at three o'clock, for conservation work."
        ),
        "questions": [
            {"prompt": "Where is photography forbidden?", "options": ["In the whole gallery", "At the manuscript case", "Near the camel model", "In the textile room"], "answer_index": 1},
            {"prompt": "How much could one camel carry?", "options": ["About 500 kilograms", "About 200 kilograms", "About 50 kilograms", "About 700 kilograms"], "answer_index": 1},
            {"prompt": "Why is the bronze mirror significant?", "options": ["It is the oldest mirror ever found", "It was found far from where it was made", "It belonged to a famous emperor", "It is made of pure silver"], "answer_index": 1},
            {"prompt": "How long did paper-making take to reach Europe?", "options": ["About seventy years", "About four hundred years", "Almost seven hundred years", "One thousand years"], "answer_index": 2},
            {"prompt": "Why should visitors see the manuscripts first?", "options": ["That section closes at 3 pm today", "The queue grows in the afternoon", "The textile room is closed", "The interactive map is broken"], "answer_index": 0},
        ],
    },
    {
        "id": "l3",
        "title": "Podcast: Getting Started with Running",
        "body": (
            "Welcome back to Health in Ten. Today: how to start running when you've never run "
            "before. The biggest mistake beginners make is simple — they run too fast, too soon. "
            "Your first goal isn't speed; it's building the habit. For the first month, forget "
            "distance completely and think only about time on your feet. Start with twenty "
            "minutes, three times a week, alternating one minute of gentle jogging with ninety "
            "seconds of walking. Each week, make the running intervals a little longer and the "
            "walking a little shorter. Most people can jog twenty minutes without stopping after "
            "six to eight weeks. Second tip: the talk test. If you can't speak a full sentence "
            "while jogging, you're going too fast — slow down, even if the pace feels "
            "embarrassingly gentle. Third: don't run on consecutive days at the beginning. "
            "Muscles and tendons adapt during rest, not during exercise, and beginners who run "
            "daily are the ones who end up injured by week three. What about equipment? Ignore "
            "the gadgets. The only purchase that genuinely matters is a proper pair of running "
            "shoes fitted at a specialist shop — worn-out trainers are behind a remarkable share "
            "of beginner knee pain. And finally, sign up for a five-kilometre event about three "
            "months ahead. Nothing protects a new habit like a date in the calendar."
        ),
        "questions": [
            {"prompt": "What is the biggest beginner mistake?", "options": ["Running too fast too soon", "Buying cheap shoes", "Running in the morning", "Skipping breakfast"], "answer_index": 0},
            {"prompt": "What should beginners focus on in month one?", "options": ["Distance covered", "Time on their feet", "Running speed", "Calories burned"], "answer_index": 1},
            {"prompt": "What does failing the 'talk test' mean?", "options": ["You should stop for the day", "You are running too fast", "You need water", "You are ready to race"], "answer_index": 1},
            {"prompt": "Why avoid running on consecutive days at first?", "options": ["Muscles adapt during rest", "It becomes boring", "Shoes need to dry out", "The weather may change"], "answer_index": 0},
            {"prompt": "Which purchase does the speaker recommend?", "options": ["A fitness watch", "Properly fitted running shoes", "A treadmill", "Compression clothing"], "answer_index": 1},
        ],
    },
    {
        "id": "l4",
        "title": "Student Services: Finding a Part-Time Job",
        "body": (
            "Adviser: Come in, have a seat. So, you're looking for part-time work this semester? "
            "Student: Yes, ideally something on campus, ten or fifteen hours a week. "
            "Adviser: Good timing. The library is hiring evening shelving assistants — that's "
            "twelve hours a week, spread over three evenings, and they pay fourteen dollars an "
            "hour. The nice thing is they let you study at the desk once the shelving is done. "
            "Student: That sounds ideal. What else is there? "
            "Adviser: The sports centre needs reception staff on weekend mornings, Saturday and "
            "Sunday, seven till noon. It pays a little more, sixteen an hour, but weekends don't "
            "suit everyone. There's also the campus café, but I'll be honest — the shifts there "
            "finish at eleven at night, and first-year students often find that hurts their "
            "morning classes. "
            "Student: I'd rather keep my evenings free for the library one, actually. How do I "
            "apply? "
            "Adviser: Everything goes through the student portal — no paper forms any more. "
            "You'll need your CV as a PDF and the names of two referees. One must be academic; "
            "your personal tutor is fine for that. Applications for the library close this "
            "Friday at five, so don't leave it late. They usually interview the following "
            "Wednesday, just fifteen minutes, very relaxed. "
            "Student: Perfect. I'll get my CV updated tonight."
        ),
        "questions": [
            {"prompt": "How many hours a week is the library job?", "options": ["Ten", "Twelve", "Fifteen", "Sixteen"], "answer_index": 1},
            {"prompt": "What is a benefit of the library job?", "options": ["Free meals", "Studying at the desk after shelving", "Higher pay than other jobs", "Working from home"], "answer_index": 1},
            {"prompt": "Why does the adviser warn about the café job?", "options": ["It pays the least", "Late shifts can harm morning classes", "It requires experience", "It is far from campus"], "answer_index": 1},
            {"prompt": "How must students apply?", "options": ["Through the student portal", "By paper form", "By visiting each employer", "By email to the adviser"], "answer_index": 0},
            {"prompt": "When do library applications close?", "options": ["Wednesday morning", "Friday at 5 pm", "Sunday at noon", "Monday at 9 am"], "answer_index": 1},
        ],
    },
    {
        "id": "l5",
        "title": "Lecture Extract: The Secret Life of Ants",
        "body": (
            "Today I want to challenge how you think about intelligence. Consider the ant colony. "
            "A single ant is, frankly, not impressive: it has a brain of perhaps a quarter of a "
            "million neurons and follows a handful of simple rules. Yet a colony of half a "
            "million ants builds ventilated cities, farms fungus, wages organised war and finds "
            "the shortest route to food — with nobody in charge. The queen, despite her title, "
            "gives no orders; she is simply the colony's egg-layer. So where does the "
            "intelligence come from? The answer is chemical communication. Ants deposit scent "
            "trails — pheromones — as they walk. A successful forager returning with food lays a "
            "trail; others follow it and reinforce it if they succeed too. Shorter routes get "
            "completed faster, so they receive more traffic and therefore more scent, while "
            "longer routes fade away. The colony, in effect, computes the best path without any "
            "individual understanding the problem. Scientists call this emergence: complex "
            "behaviour arising from many simple parts interacting. And it has proved remarkably "
            "useful to us. Telephone networks and delivery companies now route traffic using "
            "so-called ant algorithms, and robotics engineers build swarms of cheap, simple "
            "robots rather than one expensive intelligent machine, precisely because a swarm "
            "keeps working when individual members fail. The humble ant, in other words, taught "
            "us a new way to think about thinking itself."
        ),
        "questions": [
            {"prompt": "What does the lecturer say about a single ant?", "options": ["It is surprisingly intelligent", "It is not impressive on its own", "It can solve complex problems alone", "It gives orders to others"], "answer_index": 1},
            {"prompt": "What is the queen's actual role?", "options": ["Commanding the workers", "Choosing food routes", "Laying eggs", "Defending the nest"], "answer_index": 2},
            {"prompt": "Why do shorter routes end up with more scent?", "options": ["Ants prefer cooler paths", "They are completed faster, so get more traffic", "The queen marks them", "Longer routes are blocked"], "answer_index": 1},
            {"prompt": "What is 'emergence'?", "options": ["Complex behaviour from simple interacting parts", "The birth of new queens", "A type of pheromone", "An ant war strategy"], "answer_index": 0},
            {"prompt": "Why do engineers build robot swarms?", "options": ["Swarms look more natural", "A swarm keeps working when members fail", "Single robots are illegal", "Swarms need no programming"], "answer_index": 1},
        ],
    },
]


def bank_for(kind: str) -> List[Item]:
    return READING_BANK if kind == "reading" else LISTENING_BANK


def bank_item(kind: str, item_id: str) -> Optional[Item]:
    for item in bank_for(kind):
        if item["id"] == item_id:
            return item
    return None
