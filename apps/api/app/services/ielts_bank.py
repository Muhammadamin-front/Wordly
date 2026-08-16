"""Built-in IELTS practice bank — original passages and scripts, no AI needed.

Every item is written for this app in authentic IELTS style (Academic Reading
passages ~300-380 words with 6 MCQs; Listening scripts ~220-280 words with 5
MCQs). Real Cambridge past papers are copyrighted, so the bank mirrors their
format and difficulty without reproducing them. Answer keys stay server-side:
starting a bank item creates a normal IeltsTest row, so grading, XP and band
history reuse the existing pipeline.

Each item carries an approximate difficulty ``band`` (guidance only), so the
practice list can be sorted easy → hard as the bank grows.
"""
from typing import Any, Dict, List, Optional

Item = Dict[str, Any]

READING_BANK: List[Item] = [
    {
        "id": "r1",
        "band": 6.5,
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
            {"prompt": "Why did urban beekeeping originally become popular?", "options": ["Because honey prices rose sharply", "As a reaction to reports of declining bees in rural areas", "Because governments paid people to keep hives", "As a way to reduce pesticide use in cities"], "answer_index": 1, "explanation": "Paragraph 1: the trend began 'partly as a response to alarming reports of bee decline in the countryside'."},
            {"prompt": "According to the passage, why can cities suit bees well?", "options": ["Cities are warmer than the countryside all year", "There are no other pollinators to compete with", "Varied plants provide nectar for much of the year", "Urban honey sells for more money"], "answer_index": 2, "explanation": "Paragraph 2: urban parks, gardens and balcony flower boxes give 'a diverse, almost year-round supply of nectar', unlike a single rural crop."},
            {"prompt": "What did the Berlin studies find?", "options": ["Urban colonies often out-performed rural ones", "Rural bees produced more honey", "City bees suffered more in winter", "Berlin banned rooftop hives"], "answer_index": 0, "explanation": "Paragraph 2: the Berlin studies found urban colonies 'often produced more honey than their rural counterparts and survived winters at higher rates'."},
            {"prompt": "What concern do some ecologists raise?", "options": ["Honeybees may spread disease to humans", "Managed honeybees can crowd out wild pollinators", "Rooftop hives are dangerous for residents", "Urban honey is unsafe to eat"], "answer_index": 1, "explanation": "Paragraph 3: ecologists warn that honeybees 'can out-compete wild pollinators such as bumblebees and solitary bees'."},
            {"prompt": "The phrase 'managed livestock' suggests honeybees are…", "options": ["wild animals in danger of extinction", "animals kept and controlled by people", "a species that cannot survive outdoors", "illegal in most cities"], "answer_index": 1, "explanation": "Paragraph 3 calls honeybees 'essentially managed livestock' — animals people keep and control, not wild ones."},
            {"prompt": "What is the writer's overall conclusion?", "options": ["Bees would be better off without cities", "Beekeeping should be limited to schools", "City people gain something valuable from beekeeping", "Honey production is the main benefit of urban hives"], "answer_index": 2, "explanation": "The final line — 'many city residents, it seems, need the bees' — puts the value on what people gain."},
        ],
    },
    {
        "id": "r2",
        "band": 6.0,
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
            {"prompt": "How was tea first used in ancient China?", "options": ["As a religious offering", "As a medicine", "As a trade currency", "As a cooking ingredient"], "answer_index": 1, "explanation": "Paragraph 1: tea was cultivated in Yunnan 'first as a medicine and only later as a daily drink'."},
            {"prompt": "Why did Buddhist monks value tea?", "options": ["It helped them stay awake during meditation", "It was part of their religious texts", "It could be traded for food", "It grew inside their temples"], "answer_index": 0, "explanation": "Paragraph 2: monks 'valued its power to keep them alert during long meditation'."},
            {"prompt": "When did tea first arrive in Europe?", "options": ["In the ninth century", "In the fourteenth century", "In 1610", "In the late eighteenth century"], "answer_index": 2, "explanation": "Paragraph 2: 'Dutch traders carried the first chests to Amsterdam in 1610'."},
            {"prompt": "What helped tea become Britain's national drink?", "options": ["A government campaign", "Falling prices and adding milk and sugar", "The invention of the teabag", "A ban on coffee"], "answer_index": 1, "explanation": "Paragraph 3: the shift was 'helped by falling prices and the new custom of adding milk and sugar'."},
            {"prompt": "Why did the East India Company sell opium in China?", "options": ["To fund its tea purchases", "To weaken the Chinese army", "Because tea sales were banned", "To support Indian farmers"], "answer_index": 0, "explanation": "Paragraph 3: 'To pay for its imports, the British East India Company grew opium in India and sold it in China'."},
            {"prompt": "What is the main idea of the final paragraph?", "options": ["Tea is losing popularity to coffee", "Everyday products can have remarkable histories", "Water remains the world's favourite drink", "Tea production must increase further"], "answer_index": 1, "explanation": "The closing sentence: 'even the most ordinary items on our kitchen shelves can carry an extraordinary past'."},
        ],
    },
    {
        "id": "r3",
        "band": 6.5,
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
            {"prompt": "What is the main point of the first paragraph?", "options": ["Sleep is a single uniform state", "Sleep consists of distinct repeating stages", "Scientists cannot measure sleep", "Dreams occur all night long"], "answer_index": 1, "explanation": "Paragraph 1 contrasts the feeling of one uniform state with the reality: the brain 'moves through a repeating cycle of distinct stages'."},
            {"prompt": "How long does a typical sleep cycle last?", "options": ["Twenty minutes", "Half an hour", "About ninety minutes", "Four to six hours"], "answer_index": 2, "explanation": "Paragraph 2: 'A typical cycle lasts about ninety minutes and repeats four to six times a night.'"},
            {"prompt": "Slow-wave sleep is linked to…", "options": ["vivid dreaming", "physical recovery and factual memory", "emotional problems", "acting out dreams"], "answer_index": 1, "explanation": "Paragraph 2 links slow-wave sleep 'to physical recovery and to the consolidation of factual memories'."},
            {"prompt": "Why is the body paralysed during REM sleep?", "options": ["To conserve energy", "Because muscles are exhausted", "Probably to prevent us acting out dreams", "To keep the heart rate low"], "answer_index": 2, "explanation": "Paragraph 3: the body is paralysed 'presumably to stop us acting out our dreams'."},
            {"prompt": "What happens to REM periods through the night?", "options": ["They become longer", "They become shorter", "They disappear after midnight", "They stay exactly the same"], "answer_index": 0, "explanation": "Paragraph 3: 'REM periods lengthen as the night goes on'."},
            {"prompt": "Why can a 20-minute nap beat an hour-long one?", "options": ["It is easier to schedule", "It avoids entering deep sleep, so no sleep inertia", "It includes more REM sleep", "It lowers heart rate further"], "answer_index": 1, "explanation": "Paragraph 4: a twenty-minute nap is 'too short to enter deep sleep', so it avoids the sleep inertia that follows waking mid-cycle."},
        ],
    },
    {
        "id": "r4",
        "band": 7.0,
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
            {"prompt": "What was the Aral Sea sixty years ago?", "options": ["A salt desert", "The world's fourth-largest lake", "A small fishing pond", "An artificial reservoir"], "answer_index": 1, "explanation": "Paragraph 1: the Aral Sea 'was the fourth-largest lake on Earth'."},
            {"prompt": "Why was river water diverted in the 1960s?", "options": ["To supply drinking water to cities", "To generate electricity", "To irrigate cotton fields", "To prevent flooding"], "answer_index": 2, "explanation": "Paragraph 2: planners 'diverted both to irrigate enormous new cotton fields'."},
            {"prompt": "Did planners expect the sea to shrink?", "options": ["No, it was a complete surprise", "Yes, but the loss exceeded predictions", "Yes, and their predictions were accurate", "The passage does not say"], "answer_index": 1, "explanation": "Paragraph 2: they were 'fully aware that the lake would shrink', but 'the scale of the loss... outran every prediction'."},
            {"prompt": "What killed the native fish?", "options": ["Overfishing by the Soviet fleet", "Rising water temperature", "Increasing saltiness of the water", "Pesticides sprayed on the water"], "answer_index": 2, "explanation": "Paragraph 2: 'As the water withdrew it grew saltier, killing the native fish'."},
            {"prompt": "How did the shrinking sea affect local climate?", "options": ["Summers cooled and winters warmed", "The growing season became longer", "Summers grew hotter and winters colder", "Rainfall increased sharply"], "answer_index": 2, "explanation": "Paragraph 3: once the sea stopped moderating the climate, 'summers became hotter, winters colder'."},
            {"prompt": "What does the North Aral example demonstrate?", "options": ["Environmental damage is always permanent", "Dams inevitably cause harm", "Severe damage can sometimes be partly reversed", "Fishing should be banned in recovering lakes"], "answer_index": 2, "explanation": "Paragraph 4: the North Aral shows 'that even severe environmental damage need not always be final'."},
        ],
    },
    {
        "id": "r5",
        "band": 7.0,
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
            {"prompt": "In what way is glass superior to paper and plastic?", "options": ["It is lighter to transport", "It can be recycled endlessly without degrading", "It is cheaper to produce", "It cannot break"], "answer_index": 1, "explanation": "Paragraph 1: glass reforms 'with no loss of clarity or strength — something neither paper... nor plastic... can claim'."},
            {"prompt": "What is 'cullet'?", "options": ["A type of furnace", "Raw sand for glassmaking", "Recycled crushed glass", "A brand of bottle"], "answer_index": 2, "explanation": "Paragraph 2 defines it: 'Recycled crushed glass, known in the industry as cullet'."},
            {"prompt": "Why do manufacturers value cullet?", "options": ["It melts at lower temperature, saving energy", "It is stronger than new glass", "It is easier to colour", "Governments require its use"], "answer_index": 0, "explanation": "Paragraph 2: cullet 'melts at a lower temperature', and every ten per cent added 'cuts its energy use by roughly three per cent'."},
            {"prompt": "What problem can a ceramic mug cause?", "options": ["It blocks collection trucks", "It can weaken a whole batch of recycled glass", "It changes the colour of the furnace", "It raises the melting temperature of sand"], "answer_index": 1, "explanation": "Paragraph 2: 'A single ceramic coffee mug in a load of bottles can weaken an entire batch'."},
            {"prompt": "What do the most successful recycling countries have in common?", "options": ["Larger landfill sites", "Deposit-return schemes", "Bans on green glass", "Cheaper electricity"], "answer_index": 1, "explanation": "Paragraph 3: 'The highest-recycling countries almost all use deposit-return schemes'."},
            {"prompt": "Why were old bottle-reuse systems abandoned?", "options": ["They failed to work properly", "Customers refused to return bottles", "Single-use packaging was cheaper to manage", "Washed bottles were unsafe"], "answer_index": 2, "explanation": "Paragraph 4: they were abandoned 'not because they failed, but because single-use packaging was cheaper to administer'."},
        ],
    },
    {
        "id": "r6",
        "band": 7.5,
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
            {"prompt": "What was Gutenberg's original goal?", "options": ["To start a political revolution", "To profit from mass-produced religious books", "To replace paper with parchment", "To teach Europeans to read"], "answer_index": 1, "explanation": "Paragraph 1: 'his ambitions were commercial, not revolutionary' — he wanted to mass-produce Bibles and prayer books."},
            {"prompt": "What was truly new in Gutenberg's system?", "options": ["The screw press", "Oil-based ink", "Reusable movable metal type", "Cheap paper"], "answer_index": 2, "explanation": "Paragraph 2: 'The core insight was not the press itself... but movable metal type', which could be reused endlessly."},
            {"prompt": "What does the passage say about book production after 1450?", "options": ["It fell due to censorship", "More books appeared in 50 years than in the previous 1000", "Only Bibles were printed", "Prices rose sharply"], "answer_index": 1, "explanation": "Paragraph 3: 'more books were produced in that half-century than in the previous thousand years'."},
            {"prompt": "Why did page numbers matter to scholars?", "options": ["They made books heavier", "They enabled precise citation and criticism", "They were required by law", "They helped printers charge more"], "answer_index": 1, "explanation": "Paragraph 3: identical texts 'complete with page numbers' made 'precise citation — and therefore systematic criticism — possible'."},
            {"prompt": "How did authorities react to printing?", "options": ["They ignored it completely", "They funded more printing shops", "They introduced censorship and licensing", "They banned paper production"], "answer_index": 2, "explanation": "Paragraph 4: authorities 'responded with licensing laws, censorship and lists of forbidden books'."},
            {"prompt": "What comparison does the passage end with?", "options": ["Printing and the internet raise similar debates", "Gutenberg was richer than modern publishers", "Books are better than websites", "Censorship works better today"], "answer_index": 0, "explanation": "The final line: 'Every debate about the internet today has a fifteenth-century echo.'"},
        ],
    },
    {
        "id": "r7",
        "band": 6.5,
        "title": "The Return of the Wolf",
        "body": (
            "When the last wolves were shot in Yellowstone National Park in the 1920s, few "
            "Americans mourned them. Wolves were seen as vicious pests, and their removal was "
            "official policy. For seventy years the park had none. Yet their absence, it turned "
            "out, had quietly reshaped the entire landscape — a lesson ecologists are still "
            "learning from today.\n\n"
            "Without wolves, the park's elk population exploded. Great herds grazed freely along "
            "rivers and streams, eating young willow, aspen and cottonwood faster than the plants "
            "could regrow. As the trees vanished, so did the beavers that depended on them and the "
            "songbirds that nested in them. Riverbanks, no longer held together by roots, crumbled "
            "and widened. A missing predator had, step by step, changed even the shape of the "
            "rivers.\n\n"
            "In 1995 biologists reintroduced fourteen wolves, brought from Canada. The results "
            "astonished even the scientists who had argued for the plan. The wolves did not merely "
            "reduce elk numbers; they changed elk behaviour, keeping the herds moving and away "
            "from the exposed valleys where they were easy to hunt. Freed from constant grazing, "
            "willows and aspens shot up. Beavers returned to build dams, which created ponds for "
            "fish and amphibians. Birds came back to the recovering woodland.\n\n"
            "Scientists call this a 'trophic cascade' — a chain of effects that spreads downward "
            "from a top predator through an entire ecosystem. The Yellowstone story became its "
            "most famous example, cited in classrooms around the world. Some researchers caution "
            "that the tale is often told too simply: weather, rising bear numbers and other "
            "factors also played a part, and the recovery is patchy rather than complete.\n\n"
            "Still, the broad lesson stands. Removing a single species can unravel connections no "
            "one had noticed, and returning it can begin, slowly, to knit them back together. The "
            "wolves of Yellowstone are now among the most studied animals on Earth — living proof "
            "that in nature, nothing exists alone."
        ),
        "questions": [
            {"prompt": "How were wolves regarded before the 1920s?", "options": ["As protected symbols", "As a valuable tourist attraction", "As harmful pests to be removed", "As sacred animals"], "answer_index": 2, "explanation": "Paragraph 1: 'Wolves were seen as vicious pests, and their removal was official policy.'"},
            {"prompt": "What happened to the park after the wolves were gone?", "options": ["The elk population grew and overgrazed the trees", "Elk numbers fell sharply", "Beavers multiplied rapidly", "The rivers became deeper"], "answer_index": 0, "explanation": "Paragraph 2: 'the park's elk population exploded', eating young trees 'faster than the plants could regrow'."},
            {"prompt": "Besides reducing their numbers, how did the wolves affect the elk?", "options": ["They made the elk breed faster", "They drove the elk out of the park entirely", "They had no effect on elk behaviour", "They changed the elk's behaviour and movements"], "answer_index": 3, "explanation": "Paragraph 3: the wolves 'did not merely reduce elk numbers; they changed elk behaviour, keeping the herds moving'."},
            {"prompt": "What is a 'trophic cascade'?", "options": ["A sudden collapse of a riverbank", "Effects spreading down from a top predator through an ecosystem", "A method of counting wolves", "A type of waterfall"], "answer_index": 1, "explanation": "Paragraph 4 defines it as 'a chain of effects that spreads downward from a top predator through an entire ecosystem'."},
            {"prompt": "What caution do some researchers add?", "options": ["The wolves should be removed again", "The whole story is completely false", "Other factors also contributed and the recovery is incomplete", "Elk were never really a problem"], "answer_index": 2, "explanation": "Paragraph 4: 'weather, rising bear numbers and other factors also played a part, and the recovery is patchy rather than complete'."},
            {"prompt": "What is the main message of the passage?", "options": ["Wolves are dangerous to humans", "Species are connected, and losing one can affect many others", "National parks should ban all predators", "Rivers cannot change their shape"], "answer_index": 1, "explanation": "The closing line: 'in nature, nothing exists alone'."},
        ],
    },
    {
        "id": "r8",
        "band": 7.0,
        "title": "Why Tall Buildings Sway",
        "body": (
            "Visitors to the observation deck of a supertall skyscraper are sometimes unnerved to "
            "feel the floor move gently beneath them on a windy day. Their instinct is that a "
            "building should be rigid, and that any movement signals danger. In fact the opposite "
            "is true: a tall tower that could not sway would be far more likely to fail. "
            "Flexibility, not stiffness, is what keeps modern skyscrapers standing.\n\n"
            "Wind is the main challenge for very tall structures. A steady breeze is not the "
            "problem; the danger comes from gusts and, more subtly, from the way wind forms "
            "swirling eddies as it passes a building. These eddies can push the tower rhythmically "
            "from side to side. If that rhythm happens to match the building's own natural "
            "frequency — the rate at which it would rock back and forth on its own — the movements "
            "can reinforce one another and grow alarmingly large, a phenomenon known as "
            "resonance.\n\n"
            "Engineers use several tricks to prevent this. The simplest is to shape the tower so "
            "that wind cannot organise itself into a regular rhythm: many recent skyscrapers taper "
            "towards the top, twist as they rise, or have rounded corners and openings that break "
            "up the airflow. A more dramatic solution sits near the summit of some towers: a tuned "
            "mass damper, a huge weight — sometimes hundreds of tonnes — suspended so that it "
            "swings in the opposite direction to the building, cancelling much of the motion. "
            "Taipei 101 famously houses a golden steel sphere weighing 660 tonnes for exactly this "
            "purpose.\n\n"
            "The goal is never to eliminate movement completely, which would be impossibly "
            "expensive, but to keep it small enough that occupants do not notice or feel unwell. "
            "Comfort, oddly, is a stricter limit than safety: a building can be structurally fine "
            "yet sway enough to make people on the upper floors queasy. So the next time a tower "
            "trembles in the wind, there is no need to worry. It is simply doing its job — bending "
            "a little, precisely so that it never has to break."
        ),
        "questions": [
            {"prompt": "Why are visitors sometimes alarmed on windy days?", "options": ["The lift moves too fast", "The observation deck is very high", "The windows are left open", "They feel the building move and assume it is unsafe"], "answer_index": 3, "explanation": "Paragraph 1: 'Their instinct is that a building should be rigid, and that any movement signals danger.'"},
            {"prompt": "What is the main source of danger from wind?", "options": ["A steady, constant breeze", "Rain combined with wind", "Gusts and swirling eddies that push the tower rhythmically", "Cold temperatures at height"], "answer_index": 2, "explanation": "Paragraph 2: 'the danger comes from gusts and, more subtly, from the way wind forms swirling eddies'."},
            {"prompt": "What is 'resonance' in this context?", "options": ["A method of measuring wind speed", "When wind's rhythm matches the building's natural frequency and enlarges its motion", "A type of building material", "The stiffness of steel beams"], "answer_index": 1, "explanation": "Paragraph 2: resonance is when the wind's rhythm matches the tower's own natural frequency, so 'the movements can reinforce one another and grow alarmingly large'."},
            {"prompt": "How does tapering or twisting a tower help?", "options": ["It stops wind forming a regular rhythm around the tower", "It makes the building cheaper to build", "It increases the building's weight", "It blocks out sunlight"], "answer_index": 0, "explanation": "Paragraph 3: shaping the tower means 'wind cannot organise itself into a regular rhythm'."},
            {"prompt": "What does a tuned mass damper do?", "options": ["It generates electricity for the tower", "It measures the sway for engineers", "It swings opposite to the building to cancel much of the motion", "It supports the weight of the roof"], "answer_index": 2, "explanation": "Paragraph 3: the damper is 'suspended so that it swings in the opposite direction to the building, cancelling much of the motion'."},
            {"prompt": "Why is comfort described as a stricter limit than safety?", "options": ["Safety rules are ignored in tall towers", "A structurally safe building can still sway enough to make people feel ill", "Comfort is cheaper to achieve than safety", "People never notice a building swaying"], "answer_index": 1, "explanation": "Paragraph 4: 'a building can be structurally fine yet sway enough to make people on the upper floors queasy'."},
        ],
    },
    {
        "id": "r9",
        "band": 7.5,
        "title": "The Economics of Happiness",
        "body": (
            "For most of its history, economics measured success in a single currency: money. A "
            "country was doing well if its output grew; a person was better off if their income "
            "rose. In recent decades, however, a growing number of economists have begun to ask a "
            "more awkward question — does more money actually make people happier? The answer, it "
            "turns out, is: up to a point.\n\n"
            "The puzzle was first sharpened in the 1970s by the economist Richard Easterlin. He "
            "noticed that although richer people within a country tend to report being happier "
            "than poorer ones, entire nations do not necessarily grow happier as they get richer "
            "over time. The United States, for example, became far wealthier after the Second "
            "World War without any lasting rise in reported life satisfaction. This apparent "
            "contradiction became known as the Easterlin Paradox.\n\n"
            "One explanation is that much of the satisfaction money brings is relative rather than "
            "absolute. What matters is not how much you have, but how much you have compared with "
            "the people around you. If everyone's income doubles, nobody feels richer, because "
            "their position in the ranking is unchanged. Another factor is adaptation: people "
            "quickly grow used to a higher standard of living, so a pay rise that feels wonderful "
            "in January is taken for granted by June.\n\n"
            "None of this means money is irrelevant. For those in poverty, more income reliably "
            "improves well-being, because it removes real hardship — hunger, insecurity, the "
            "stress of unpaid bills. The gains simply shrink as wealth increases. Beyond a "
            "comfortable level, studies suggest, further income adds little, while factors such as "
            "health, close relationships and a sense of purpose matter far more.\n\n"
            "These findings have begun to influence policy. Some governments now track measures of "
            "national well-being alongside economic output, arguing that a country's job is to "
            "increase happiness, not merely wealth. Critics reply that happiness is too vague and "
            "personal to measure reliably. Yet the underlying question — what, in the end, is an "
            "economy for? — is one that pure income figures were never able to answer."
        ),
        "questions": [
            {"prompt": "What awkward question have some economists begun to ask?", "options": ["Whether the economy will keep growing", "How to measure national output", "Whether more money actually makes people happier", "Why prices rise over time"], "answer_index": 2, "explanation": "Paragraph 1: economists began asking 'does more money actually make people happier?'"},
            {"prompt": "What did Easterlin observe?", "options": ["Richer people are always unhappy", "Nations do not necessarily get happier as they grow richer over time", "Money has no effect on anyone", "Poor countries are the happiest"], "answer_index": 1, "explanation": "Paragraph 2: Easterlin noticed that 'entire nations do not necessarily grow happier as they get richer over time'."},
            {"prompt": "What does 'relative' satisfaction mean here?", "options": ["The exact amount of money you earn", "The total wealth of a nation", "The price of everyday goods", "How much you have compared with the people around you"], "answer_index": 3, "explanation": "Paragraph 3: 'What matters is not how much you have, but how much you have compared with the people around you.'"},
            {"prompt": "What is 'adaptation'?", "options": ["People get used to a higher standard of living", "People give away their extra money", "Incomes tend to fall over time", "Happiness can never change"], "answer_index": 0, "explanation": "Paragraph 3: adaptation is that 'people quickly grow used to a higher standard of living'."},
            {"prompt": "For whom does more income reliably improve well-being?", "options": ["Wealthy business owners", "Retired people", "People living in poverty", "Government officials"], "answer_index": 2, "explanation": "Paragraph 4: 'For those in poverty, more income reliably improves well-being'."},
            {"prompt": "How have the findings influenced policy?", "options": ["All governments have banned income statistics", "Some governments now track well-being alongside economic output", "Economists have stopped studying happiness", "Wealth is no longer measured at all"], "answer_index": 1, "explanation": "Paragraph 5: 'Some governments now track measures of national well-being alongside economic output'."},
        ],
    },
    {
        "id": "r10",
        "band": 6.5,
        "title": "How Coral Reefs Build Themselves",
        "body": (
            "A coral reef looks like rock, but it is one of the busiest living structures on the "
            "planet. What appears to be colourful stone is in fact built by millions of tiny "
            "animals called polyps, each no larger than a grain of rice. Understanding how these "
            "fragile creatures create the largest structures ever made by living things helps "
            "explain why reefs are now in such danger.\n\n"
            "Each polyp is a soft, tube-shaped animal that draws calcium and carbonate from "
            "seawater and lays down a hard skeleton of limestone beneath itself. As generations of "
            "polyps live, die and are built over, their skeletons accumulate into the vast ridges "
            "we call reefs. The Great Barrier Reef, stretching more than two thousand kilometres, "
            "has grown this way over hundreds of thousands of years, and can be seen from space.\n\n"
            "The polyps could not do this alone. Inside their tissues live microscopic algae, "
            "which use sunlight to make sugars and share them with their hosts. In return, the "
            "algae get shelter and the polyp's waste as nutrients. This partnership is so "
            "productive that reefs flourish even in the clear, nutrient-poor tropical waters where "
            "little else can grow. It is also what gives coral its brilliant colour — the algae, "
            "not the polyps, supply most of the hue.\n\n"
            "That same partnership is the reef's weak point. When the water grows too warm, even "
            "by a degree or two for a few weeks, the algae produce harmful chemicals and the "
            "polyps expel them. Without the algae the coral turns ghostly white — an event called "
            "bleaching — and, robbed of its main food supply, begins to starve. If cooler "
            "conditions return quickly, the algae can recolonise and the coral recovers; if not, "
            "it dies.\n\n"
            "Because reefs shelter a quarter of all marine species while covering less than one "
            "per cent of the ocean floor, their fate matters far beyond their own beauty. "
            "Protecting them means, above all, keeping the seas from warming."
        ),
        "questions": [
            {"prompt": "What actually builds a coral reef?", "options": ["Ocean currents piling up sand", "Millions of tiny animals called polyps", "Volcanic rock rising from the seabed", "Fish depositing shells"], "answer_index": 1, "explanation": "Paragraph 1: what looks like stone 'is in fact built by millions of tiny animals called polyps'."},
            {"prompt": "What does each polyp make from seawater?", "options": ["A soft outer shell", "A cloud of eggs", "A hard limestone skeleton beneath itself", "A layer of algae"], "answer_index": 2, "explanation": "Paragraph 2: each polyp 'draws calcium and carbonate from seawater and lays down a hard skeleton of limestone beneath itself'."},
            {"prompt": "What do the algae inside coral provide?", "options": ["Oxygen for breathing", "Protection from predators", "Sugars made from sunlight", "Calcium for the skeleton"], "answer_index": 2, "explanation": "Paragraph 3: the algae 'use sunlight to make sugars and share them with their hosts'."},
            {"prompt": "What gives coral most of its colour?", "options": ["The limestone rock", "The surrounding seawater", "The polyps themselves", "The algae living inside the polyps"], "answer_index": 3, "explanation": "Paragraph 3: 'the algae, not the polyps, supply most of the hue'."},
            {"prompt": "What causes coral bleaching?", "options": ["Pollution washed in from rivers", "Water becoming too warm, so the polyps expel the algae", "Too many fish eating the coral", "A lack of sunlight"], "answer_index": 1, "explanation": "Paragraph 4: when water grows too warm 'the algae produce harmful chemicals and the polyps expel them'."},
            {"prompt": "Why do reefs matter beyond their beauty?", "options": ["They produce most of the world's oxygen", "They shelter about a quarter of all marine species", "They are made of valuable minerals", "They slow down ocean currents"], "answer_index": 1, "explanation": "Paragraph 5: 'reefs shelter a quarter of all marine species while covering less than one per cent of the ocean floor'."},
        ],
    },
    {
        "id": "r11",
        "band": 7.0,
        "title": "The Wayfinders",
        "body": (
            "Long before Europeans crossed the oceans with compasses and charts, the peoples of "
            "the Pacific were settling islands scattered across an expanse of water larger than "
            "all the world's landmasses combined. They did so in open canoes, without instruments "
            "of any kind, guided only by a detailed reading of the natural world. For a long time "
            "European scholars refused to believe it was deliberate, insisting the islands must "
            "have been reached by accident, by canoes blown off course. They were wrong.\n\n"
            "Polynesian navigators, it is now understood, carried an immense body of knowledge in "
            "memory alone. They read the positions of the rising and setting stars, using a mental "
            "'star compass' of dozens of points around the horizon. By day, when the stars were "
            "hidden, they steered by the direction of the ocean swells — the long, regular waves "
            "generated by distant weather systems, which hold their direction for days and can be "
            "felt through the hull of a canoe even when the wind shifts.\n\n"
            "They also learned to detect land long before it appeared. Certain seabirds fly out to "
            "fish each morning and return to land at dusk, so their flight path in the evening "
            "points the way to an island. Clouds pile up and take on a greenish tinge above a "
            "lagoon; a distinctive pattern of waves, reflected and bent by an island, can reveal "
            "its presence far over the horizon. A skilled navigator wove these signs together into "
            "a continuous sense of position.\n\n"
            "This knowledge was almost lost. As colonial rule spread and Western navigation took "
            "over, the old skills fell into disuse, surviving with only a handful of "
            "practitioners. In the 1970s, however, a voyage aboard a reconstructed canoe named "
            "Hokule'a — sailed across thousands of kilometres of open ocean using traditional "
            "methods alone — proved to a doubting world that the ancient techniques worked. The "
            "voyage helped spark a wider revival of Pacific culture that continues today."
        ),
        "questions": [
            {"prompt": "What did the peoples of the Pacific achieve?", "options": ["They deliberately settled islands across a vast ocean without instruments", "They built the first compasses", "They mapped the whole Pacific on charts", "They traded regularly with Europe"], "answer_index": 0, "explanation": "Paragraph 1: they settled islands across a vast ocean 'in open canoes, without instruments of any kind'."},
            {"prompt": "What did European scholars wrongly believe?", "options": ["That the voyages were carefully planned", "That the islands were reached only by accident", "That no one ever lived on the islands", "That the canoes carried secret instruments"], "answer_index": 1, "explanation": "Paragraph 1: scholars insisted the islands 'must have been reached by accident' — and the passage answers, 'They were wrong.'"},
            {"prompt": "How did navigators steer when the stars were hidden?", "options": ["By using a hidden compass", "By waiting for the stars to return", "By following other canoes", "By the direction of the ocean swells"], "answer_index": 3, "explanation": "Paragraph 2: 'By day, when the stars were hidden, they steered by the direction of the ocean swells'."},
            {"prompt": "How could seabirds help the navigators?", "options": ["They frightened away storms", "Their morning song predicted the weather", "Their evening flight pointed the way toward land", "They carried messages between islands"], "answer_index": 2, "explanation": "Paragraph 3: seabirds 'return to land at dusk, so their flight path in the evening points the way to an island'."},
            {"prompt": "Why did the knowledge almost disappear?", "options": ["The canoes were too small", "A series of storms destroyed them", "Colonial rule and Western navigation replaced the old skills", "The navigators forgot on purpose"], "answer_index": 2, "explanation": "Paragraph 4: 'As colonial rule spread and Western navigation took over, the old skills fell into disuse'."},
            {"prompt": "What did the Hokule'a voyage demonstrate?", "options": ["That Europeans had invented navigation", "That the traditional methods really worked", "That the islands were uninhabited", "That compasses are unnecessary anywhere"], "answer_index": 1, "explanation": "Paragraph 4: the Hokule'a voyage 'proved to a doubting world that the ancient techniques worked'."},
        ],
    },
    {
        "id": "r12",
        "band": 8.0,
        "title": "The Science of Forgetting",
        "body": (
            "We tend to think of forgetting as a failure — a fault in an otherwise reliable "
            "machine. The memory we cannot retrieve feels like a file that has been corrupted or "
            "lost. Yet a growing body of research suggests that forgetting is not a flaw in the "
            "system but a feature of it: an active, useful process without which the mind would "
            "work far worse, not better.\n\n"
            "The evidence begins with rare individuals who cannot forget. A handful of people "
            "possess what is called highly superior autobiographical memory, recalling the details "
            "of almost every day of their lives. One might expect them to be formidably capable, "
            "yet many describe their gift as a burden. Unable to let go of the trivial and the "
            "painful alike, they can become trapped in the past, and there is little sign that "
            "their extraordinary recall makes them better at reasoning or solving problems.\n\n"
            "The reason, researchers argue, is that intelligence depends on generalisation, and "
            "generalisation depends on discarding detail. To recognise that many different "
            "four-legged animals are all 'dogs', the brain must throw away the specifics that make "
            "each one unique. A memory system that preserved every particular would drown in "
            "noise, unable to see the pattern for the exceptions. Forgetting, on this view, is how "
            "the brain decides what matters.\n\n"
            "Sleep appears to be when much of this pruning happens. During deep sleep the brain "
            "seems to strengthen important connections while weakening others, clearing space and "
            "consolidating the day's most useful lessons. Forgetting also keeps knowledge current: "
            "an old phone number or a former address, once useful, becomes clutter, and letting it "
            "fade allows newer, relevant information to take its place.\n\n"
            "This reframing has practical implications. Techniques that feel like failures of "
            "memory — struggling to recall something, or spacing study out until we have "
            "half-forgotten it — often produce stronger, more durable learning than smooth, "
            "effortless review. The difficulty is the point. Far from being memory's enemy, a "
            "certain amount of forgetting may be the price, and even the mechanism, of thinking "
            "well."
        ),
        "questions": [
            {"prompt": "What is the passage's central claim about forgetting?", "options": ["It is a serious medical disorder", "It only affects older people", "It is a useful, active process rather than merely a failure", "It can always be prevented"], "answer_index": 2, "explanation": "Paragraph 1: 'forgetting is not a flaw in the system but a feature of it: an active, useful process'."},
            {"prompt": "What do people who cannot forget often report?", "options": ["That their perfect recall is often a burden", "That it makes them excellent problem-solvers", "That they actually forget more than others", "That they enjoy reliving every day"], "answer_index": 0, "explanation": "Paragraph 2: although they recall almost every day, 'many describe their gift as a burden'."},
            {"prompt": "Why is discarding detail important for intelligence?", "options": ["Because detail takes up physical space", "Because generalisation requires throwing away specifics", "Because the brain dislikes information", "Because memories are always false"], "answer_index": 1, "explanation": "Paragraph 3: 'intelligence depends on generalisation, and generalisation depends on discarding detail'."},
            {"prompt": "What role does deep sleep appear to play?", "options": ["It erases all memories equally", "It has no effect on memory", "It only stores phone numbers", "It strengthens important connections while weakening others"], "answer_index": 3, "explanation": "Paragraph 4: 'During deep sleep the brain seems to strengthen important connections while weakening others'."},
            {"prompt": "How does forgetting keep knowledge current?", "options": ["By repeating information endlessly", "By allowing outdated information to fade so newer information can take its place", "By preventing any new learning", "By copying memories exactly"], "answer_index": 1, "explanation": "Paragraph 4: an outdated phone number 'becomes clutter, and letting it fade allows newer, relevant information to take its place'."},
            {"prompt": "What practical point does the passage end on?", "options": ["Smooth, effortless review is always best", "Studying is essentially pointless", "Effortful, half-forgotten study can produce stronger, lasting learning", "Memory cannot be improved at all"], "answer_index": 2, "explanation": "Paragraph 5: techniques that feel like failures 'often produce stronger, more durable learning' — 'The difficulty is the point.'"},
        ],
    },
]

LISTENING_BANK: List[Item] = [
    {
        "id": "l1",
        "band": 5.5,
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
            {"prompt": "When does the upper-intermediate class meet?", "options": ["Mondays and Wednesdays", "Tuesdays and Thursdays", "Friday evenings", "Every weekday"], "answer_index": 1, "explanation": "The receptionist lists 'upper-intermediate on Tuesdays and Thursdays'."},
            {"prompt": "What is the early-bird price?", "options": ["$240", "$200", "$220", "$245"], "answer_index": 1, "explanation": "'If you enrol before the twentieth of September you get the early-bird rate of two hundred' — the full price is $240."},
            {"prompt": "How long is the placement test in total?", "options": ["Thirty minutes", "About forty-five minutes", "Two hours", "Fifteen minutes"], "answer_index": 1, "explanation": "The test 'takes about forty-five minutes — thirty minutes of grammar and vocabulary... then a short speaking interview'."},
            {"prompt": "What must students bring to the test?", "options": ["A booking confirmation", "Photo ID and headphones", "Two photographs", "A previous certificate"], "answer_index": 1, "explanation": "'Bring some photo identification' and 'bring your own headphones for the computer section, we no longer provide them'."},
            {"prompt": "Where is the language centre?", "options": ["Above the public library", "Inside the museum", "Next to the bus station", "On Riverside Road's ground floor"], "answer_index": 0, "explanation": "'Forty-two Riverside Road, on the third floor, directly above the public library.'"},
        ],
    },
    {
        "id": "l2",
        "band": 6.0,
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
            {"prompt": "Where is photography forbidden?", "options": ["In the whole gallery", "At the manuscript case", "Near the camel model", "In the textile room"], "answer_index": 1, "explanation": "'Photography is allowed everywhere in this room except at the manuscript case by the far wall'."},
            {"prompt": "How much could one camel carry?", "options": ["About 500 kilograms", "About 200 kilograms", "About 50 kilograms", "About 700 kilograms"], "answer_index": 1, "explanation": "'A healthy camel carried around two hundred kilograms of goods'."},
            {"prompt": "Why is the bronze mirror significant?", "options": ["It is the oldest mirror ever found", "It was found far from where it was made", "It belonged to a famous emperor", "It is made of pure silver"], "answer_index": 1, "explanation": "The mirror 'was found not in China but four thousand kilometres away in Samarkand, proof of how far single objects travelled'."},
            {"prompt": "How long did paper-making take to reach Europe?", "options": ["About seventy years", "About four hundred years", "Almost seven hundred years", "One thousand years"], "answer_index": 2, "explanation": "Paper-making spread from China to Europe, 'taking almost seven hundred years to complete the journey'."},
            {"prompt": "Why should visitors see the manuscripts first?", "options": ["That section closes at 3 pm today", "The queue grows in the afternoon", "The textile room is closed", "The interactive map is broken"], "answer_index": 0, "explanation": "'Please visit the manuscripts first, as that section closes early today, at three o'clock.'"},
        ],
    },
    {
        "id": "l3",
        "band": 6.0,
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
            {"prompt": "What is the biggest beginner mistake?", "options": ["Running too fast too soon", "Buying cheap shoes", "Running in the morning", "Skipping breakfast"], "answer_index": 0, "explanation": "'The biggest mistake beginners make is simple — they run too fast, too soon.'"},
            {"prompt": "What should beginners focus on in month one?", "options": ["Distance covered", "Time on their feet", "Running speed", "Calories burned"], "answer_index": 1, "explanation": "'For the first month, forget distance completely and think only about time on your feet.'"},
            {"prompt": "What does failing the 'talk test' mean?", "options": ["You should stop for the day", "You are running too fast", "You need water", "You are ready to race"], "answer_index": 1, "explanation": "'If you can't speak a full sentence while jogging, you're going too fast.'"},
            {"prompt": "Why avoid running on consecutive days at first?", "options": ["Muscles adapt during rest", "It becomes boring", "Shoes need to dry out", "The weather may change"], "answer_index": 0, "explanation": "'Muscles and tendons adapt during rest, not during exercise'."},
            {"prompt": "Which purchase does the speaker recommend?", "options": ["A fitness watch", "Properly fitted running shoes", "A treadmill", "Compression clothing"], "answer_index": 1, "explanation": "'The only purchase that genuinely matters is a proper pair of running shoes fitted at a specialist shop'."},
        ],
    },
    {
        "id": "l4",
        "band": 6.0,
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
            {"prompt": "How many hours a week is the library job?", "options": ["Ten", "Twelve", "Fifteen", "Sixteen"], "answer_index": 1, "explanation": "The library job is 'twelve hours a week, spread over three evenings'."},
            {"prompt": "What is a benefit of the library job?", "options": ["Free meals", "Studying at the desk after shelving", "Higher pay than other jobs", "Working from home"], "answer_index": 1, "explanation": "'They let you study at the desk once the shelving is done.'"},
            {"prompt": "Why does the adviser warn about the café job?", "options": ["It pays the least", "Late shifts can harm morning classes", "It requires experience", "It is far from campus"], "answer_index": 1, "explanation": "'The shifts there finish at eleven at night, and first-year students often find that hurts their morning classes.'"},
            {"prompt": "How must students apply?", "options": ["Through the student portal", "By paper form", "By visiting each employer", "By email to the adviser"], "answer_index": 0, "explanation": "'Everything goes through the student portal — no paper forms any more.'"},
            {"prompt": "When do library applications close?", "options": ["Wednesday morning", "Friday at 5 pm", "Sunday at noon", "Monday at 9 am"], "answer_index": 1, "explanation": "'Applications for the library close this Friday at five'."},
        ],
    },
    {
        "id": "l5",
        "band": 7.0,
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
            {"prompt": "What does the lecturer say about a single ant?", "options": ["It is surprisingly intelligent", "It is not impressive on its own", "It can solve complex problems alone", "It gives orders to others"], "answer_index": 1, "explanation": "'A single ant is, frankly, not impressive' — a small brain following a handful of simple rules."},
            {"prompt": "What is the queen's actual role?", "options": ["Commanding the workers", "Choosing food routes", "Laying eggs", "Defending the nest"], "answer_index": 2, "explanation": "'The queen, despite her title, gives no orders; she is simply the colony's egg-layer.'"},
            {"prompt": "Why do shorter routes end up with more scent?", "options": ["Ants prefer cooler paths", "They are completed faster, so get more traffic", "The queen marks them", "Longer routes are blocked"], "answer_index": 1, "explanation": "'Shorter routes get completed faster, so they receive more traffic and therefore more scent'."},
            {"prompt": "What is 'emergence'?", "options": ["Complex behaviour from simple interacting parts", "The birth of new queens", "A type of pheromone", "An ant war strategy"], "answer_index": 0, "explanation": "Emergence is 'complex behaviour arising from many simple parts interacting'."},
            {"prompt": "Why do engineers build robot swarms?", "options": ["Swarms look more natural", "A swarm keeps working when members fail", "Single robots are illegal", "Swarms need no programming"], "answer_index": 1, "explanation": "'A swarm keeps working when individual members fail' — unlike one expensive machine."},
        ],
    },
    {
        "id": "l6",
        "band": 5.5,
        "title": "Booking a Campsite",
        "body": (
            "Assistant: Good afternoon, Pinewood Campsite, how can I help? "
            "Caller: Hello, I'd like to book a pitch for the last weekend of July, please. "
            "Assistant: Certainly. Is that for a tent or a caravan? "
            "Caller: A tent — there'll be four of us. "
            "Assistant: No problem. A standard tent pitch is eighteen pounds a night, or we have "
            "larger pitches nearer the lake for twenty-five. "
            "Caller: We'll take a standard one. Two nights, so Friday and Saturday. "
            "Assistant: That's thirty-six pounds altogether. Now, a few things to note. Check-in "
            "is from two o'clock in the afternoon, and we ask everyone to leave by eleven on the "
            "morning you depart. "
            "Caller: Fine. Are campfires allowed? "
            "Assistant: Not open fires on the ground, I'm afraid — too risky in summer. But you "
            "can hire a raised fire bowl from reception for five pounds, and we sell firewood "
            "there too. "
            "Caller: Good to know. And is there anything for children? "
            "Assistant: There's a playground next to the shower block, and on Saturday mornings we "
            "run a free nature walk for kids at ten. One more thing — the nearest shop is two "
            "miles away and closes early, so bring what you need for the evening. "
            "Caller: Thanks, that's really helpful. "
            "Assistant: You're welcome. Could I take a name to hold the booking?"
        ),
        "questions": [
            {"prompt": "What type of pitch does the caller book?", "options": ["A caravan pitch", "A standard tent pitch", "A large pitch by the lake", "A cabin"], "answer_index": 1, "explanation": "The caller says 'We'll take a standard one' after asking for a tent pitch for four people."},
            {"prompt": "How much will the caller pay in total?", "options": ["£18", "£25", "£36", "£50"], "answer_index": 2, "explanation": "A standard pitch is 'eighteen pounds a night' for two nights: 'That's thirty-six pounds altogether.'"},
            {"prompt": "By what time must guests leave on their departure day?", "options": ["2 in the afternoon", "10 in the morning", "11 in the morning", "Midday"], "answer_index": 2, "explanation": "'We ask everyone to leave by eleven on the morning you depart.'"},
            {"prompt": "What is the rule about campfires?", "options": ["All fires are completely forbidden", "Open ground fires are banned, but fire bowls can be hired", "Fires are allowed anywhere on the site", "Only wood fires are permitted"], "answer_index": 1, "explanation": "'Not open fires on the ground' — but 'you can hire a raised fire bowl from reception for five pounds'."},
            {"prompt": "What does the assistant advise the caller to bring?", "options": ["Extra tent pegs", "Warm clothing", "Evening food and supplies, since the shop is far and closes early", "Swimming gear"], "answer_index": 2, "explanation": "'The nearest shop is two miles away and closes early, so bring what you need for the evening.'"},
        ],
    },
    {
        "id": "l7",
        "band": 6.0,
        "title": "Volunteering at the Food Festival",
        "body": (
            "Thanks, everyone, for signing up to help at this year's River City Food Festival. Let "
            "me run through the essentials. The festival runs across the whole weekend, but as a "
            "volunteer you're only asked to do one shift of four hours, either Saturday or Sunday "
            "— you told us your preference on the form, and we'll email your exact time by "
            "Thursday. Please arrive fifteen minutes before your shift to collect your T-shirt and "
            "pass. The T-shirt is bright yellow so visitors can spot you easily, and you'll need "
            "to wear it all day; do keep it afterwards as a thank-you. Now, roles. Most of you "
            "will be on information points, directing people to stalls, toilets and first aid. A "
            "few will help the stallholders set up in the morning — that's more physical, so wear "
            "sturdy shoes. Whatever your role, the golden rule is simple: if you don't know the "
            "answer to a visitor's question, don't guess — radio the supervisor. Lunch isn't "
            "provided, but every volunteer gets five pounds of festival tokens to spend at any "
            "food stall, which is honestly the best part. Finally, a safety note: the site can get "
            "very crowded by midday, so familiarise yourself with the two emergency exits marked "
            "on the map in your welcome pack before your shift begins. Any questions, find me — "
            "I'm in the green tent by the main gate all weekend."
        ),
        "questions": [
            {"prompt": "How long is a single volunteer shift?", "options": ["The whole weekend", "Four hours", "Two hours", "One full day"], "answer_index": 1, "explanation": "'As a volunteer you're only asked to do one shift of four hours.'"},
            {"prompt": "Why is the T-shirt bright yellow?", "options": ["It is the festival's official colour", "So visitors can easily spot the volunteers", "To keep volunteers warm", "It was the cheapest option available"], "answer_index": 1, "explanation": "'The T-shirt is bright yellow so visitors can spot you easily'."},
            {"prompt": "What should volunteers do if they can't answer a question?", "options": ["Guess politely", "Send the visitor away", "Radio the supervisor rather than guess", "Close the information point"], "answer_index": 2, "explanation": "'If you don't know the answer to a visitor's question, don't guess — radio the supervisor.'"},
            {"prompt": "What do volunteers receive instead of a free lunch?", "options": ["A free hot meal", "A small cash payment", "Five pounds of tokens to spend at food stalls", "A second T-shirt"], "answer_index": 2, "explanation": "'Lunch isn't provided, but every volunteer gets five pounds of festival tokens'."},
            {"prompt": "What are volunteers told to do before their shift?", "options": ["Test all the radios", "Locate the two emergency exits on the map", "Count the stalls", "Meet all the other volunteers"], "answer_index": 1, "explanation": "'Familiarise yourself with the two emergency exits marked on the map... before your shift begins.'"},
        ],
    },
    {
        "id": "l8",
        "band": 6.5,
        "title": "Lecture: The History of Chocolate",
        "body": (
            "Right, let's turn to chocolate, which has a far longer and stranger history than the "
            "sweet bars in the shops might suggest. The cacao tree is native to the rainforests of "
            "Central and South America, and its beans were being used at least three thousand "
            "years ago. But here's the first surprise: for most of that history, chocolate was not "
            "eaten at all — it was drunk, and it was bitter. The Maya and later the Aztecs ground "
            "roasted cacao beans into a frothy, spiced drink, often flavoured with chilli rather "
            "than sugar, which of course they did not have. It was valued so highly that the beans "
            "themselves were used as money; you could, quite literally, buy goods with chocolate. "
            "When Spanish colonisers brought cacao back to Europe in the sixteenth century, it "
            "remained a drink, but Europeans added sugar and honey to soften the bitterness, and "
            "for two hundred years it stayed an expensive luxury for the wealthy. The chocolate we "
            "recognise today is surprisingly recent. It was only in the nineteenth century that "
            "manufacturers, mostly in Britain and Switzerland, worked out how to press cacao and "
            "recombine it into a smooth solid bar, and later how to blend in milk. So the everyday "
            "chocolate bar, far from being ancient, is younger than the railway. Next week we'll "
            "look at how that transformation turned a sacred drink into one of the world's biggest "
            "industries."
        ),
        "questions": [
            {"prompt": "How was chocolate mostly consumed for most of its history?", "options": ["As a solid sweet bar", "As a bitter drink", "As a medicine only", "As a baked cake"], "answer_index": 1, "explanation": "'For most of that history, chocolate was not eaten at all — it was drunk, and it was bitter.'"},
            {"prompt": "What did the Maya and Aztecs often add to it?", "options": ["Sugar", "Milk", "Chilli", "Honey"], "answer_index": 2, "explanation": "The drink was 'often flavoured with chilli rather than sugar, which of course they did not have'."},
            {"prompt": "What surprising use did cacao beans have?", "options": ["They were burned as fuel", "They were used as money", "They were planted only for decoration", "They were fed to animals"], "answer_index": 1, "explanation": "'It was valued so highly that the beans themselves were used as money'."},
            {"prompt": "What did Europeans add to chocolate?", "options": ["Chilli and spices", "Sugar and honey", "Salt", "Nothing at all"], "answer_index": 1, "explanation": "'Europeans added sugar and honey to soften the bitterness'."},
            {"prompt": "When was the solid chocolate bar developed?", "options": ["Three thousand years ago", "In the sixteenth century", "In the nineteenth century", "In the twentieth century"], "answer_index": 2, "explanation": "'It was only in the nineteenth century that manufacturers... worked out how to press cacao and recombine it into a smooth solid bar'."},
        ],
    },
    {
        "id": "l9",
        "band": 6.5,
        "title": "Field Trip Briefing: The Wetlands",
        "body": (
            "Before we set off for the wetlands tomorrow, a few practical points so the day runs "
            "smoothly. We'll meet at the college car park at eight sharp — the coach won't wait, "
            "so please be early rather than on time. The reserve is about an hour away. Now, the "
            "ground out there is genuinely wet, so waterproof boots are essential, not trainers; "
            "anyone in trainers will have to stay on the visitor path and will miss the best part. "
            "Bring a packed lunch and, crucially, a full water bottle, because there's nowhere to "
            "buy anything once we're inside the reserve. In terms of what we'll do: the morning is "
            "a guided walk with a ranger who'll show you how the reserve manages water levels to "
            "protect nesting birds. After lunch, you'll work in pairs on the pond-dipping survey — "
            "that's the data you'll need for your coursework, so don't leave your recording sheet "
            "on the coach. A word on the wildlife: this is the breeding season, so we must keep "
            "noise down and stay well back from the nesting areas; a single disturbance can make "
            "birds abandon their eggs. And please, no picking plants or taking anything home — "
            "everything stays where it is. The weather looks changeable, so pack a raincoat "
            "whatever the forecast says. Right — any questions before tomorrow?"
        ),
        "questions": [
            {"prompt": "What are students told about arrival time?", "options": ["Arrive exactly on time", "Be early, because the coach won't wait", "Arrive after the ranger", "Meet at the reserve directly"], "answer_index": 1, "explanation": "'The coach won't wait, so please be early rather than on time.'"},
            {"prompt": "Why are waterproof boots essential?", "options": ["The reserve requires a uniform", "Boots are simply warmer", "Those in trainers must stay on the path and miss the best part", "Trainers are not allowed on the coach"], "answer_index": 2, "explanation": "'Anyone in trainers will have to stay on the visitor path and will miss the best part.'"},
            {"prompt": "Why must students bring a full water bottle?", "options": ["The water there is unsafe to drink", "Nothing can be bought inside the reserve", "To share with the ranger", "It is expected to be very hot"], "answer_index": 1, "explanation": "'There's nowhere to buy anything once we're inside the reserve.'"},
            {"prompt": "What will the afternoon activity provide?", "options": ["A free souvenir", "A second guided walk", "The data needed for their coursework", "A packed lunch"], "answer_index": 2, "explanation": "The pond-dipping survey is 'the data you'll need for your coursework'."},
            {"prompt": "Why must students keep noise down?", "options": ["Loud noise damages the equipment", "It is breeding season and disturbance can make birds abandon their eggs", "The ranger simply dislikes noise", "Other visitors are studying nearby"], "answer_index": 1, "explanation": "'This is the breeding season... a single disturbance can make birds abandon their eggs.'"},
        ],
    },
    {
        "id": "l10",
        "band": 7.0,
        "title": "Radio Feature: The Return of the Bicycle",
        "body": (
            "And now for our city feature. The bicycle, that Victorian invention many had written "
            "off as old-fashioned, is enjoying a remarkable comeback in cities around the world — "
            "and the reasons are more interesting than you might think. For most of the twentieth "
            "century, urban planning was built around the car. Roads widened, city centres emptied "
            "of homes, and cycling came to seem both dangerous and slightly eccentric. What "
            "changed? Partly it was congestion: as traffic thickened, the bicycle quietly became "
            "the fastest way to cross many city centres at rush hour, often quicker than a car or "
            "bus. Partly it was health, as governments grappling with the costs of inactive "
            "lifestyles began to see cycling as cheap preventive medicine. But the real turning "
            "point, most experts agree, was infrastructure. Cities that simply told people to "
            "cycle achieved very little; cities that built physically separated bike lanes — "
            "protected from traffic by a kerb, not just a painted line — saw cycling numbers "
            "double or triple within a few years. Copenhagen and Amsterdam are the famous "
            "examples, but the striking thing is how fast newer converts like Paris and Seville "
            "have caught up, essentially by copying what worked. There are limits, of course. "
            "Hilly cities, extreme climates and long distances all reduce the appeal, though "
            "electric bikes are steadily eroding those barriers too. The lesson, planners say, is "
            "simple but easily forgotten: people cycle not when they are lectured, but when they "
            "are given a safe and convenient way to do so."
        ),
        "questions": [
            {"prompt": "Why did cycling decline during the twentieth century?", "options": ["Bicycles became too expensive", "People forgot how to ride", "Cities were planned around the car", "The weather grew worse"], "answer_index": 2, "explanation": "'For most of the twentieth century, urban planning was built around the car.'"},
            {"prompt": "How did congestion help the bicycle's comeback?", "options": ["Cycling became the fastest way across many city centres at rush hour", "Cycling became fashionable", "Cars were banned", "Buses stopped running"], "answer_index": 0, "explanation": "'As traffic thickened, the bicycle quietly became the fastest way to cross many city centres at rush hour'."},
            {"prompt": "Why did governments start to favour cycling?", "options": ["It raised tax revenue", "They saw it as cheap preventive medicine", "It reduced traffic noise", "It was a long tradition"], "answer_index": 1, "explanation": "Governments 'began to see cycling as cheap preventive medicine'."},
            {"prompt": "What does the speaker say made the biggest difference?", "options": ["Telling people to cycle more", "Lowering the price of bikes", "Banning cars from city centres", "Building physically separated bike lanes"], "answer_index": 3, "explanation": "'The real turning point, most experts agree, was infrastructure' — 'physically separated bike lanes'."},
            {"prompt": "What is the overall lesson?", "options": ["Cycling suits every city equally", "Only flat cities can succeed", "People cycle when given a safe, convenient way, not when lectured", "Electric bikes have failed"], "answer_index": 2, "explanation": "'People cycle not when they are lectured, but when they are given a safe and convenient way to do so.'"},
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
