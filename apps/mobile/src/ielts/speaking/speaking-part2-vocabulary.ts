/** Per-card Part 2 vocabulary.
 *
 *  All twenty cue cards shared one list of four words, so the vocabulary panel
 *  offered the same language whether the learner was describing a quiet place,
 *  an expensive purchase or a future job. Each card gets words it can actually
 *  use in the two-minute turn.
 */
import type { Part1Vocabulary } from "./speaking-part1-content";

export const PART2_VOCABULARY: Record<string, readonly Part1Vocabulary[]> = {
  "memorable-trip": [
    { word: "breathtaking", uz: "hayratlanarli", definition: "extremely beautiful or impressive", example: "The view from the pass was breathtaking." },
    { word: "to stumble upon", uz: "tasodifan topib olmoq", definition: "to find something by chance", example: "We stumbled upon a tiny teahouse in the old quarter." },
    { word: "packed itinerary", uz: "zich safar rejasi", definition: "a schedule full of activities", example: "We had a packed itinerary and barely rested." },
    { word: "to stand out", uz: "ajralib turmoq", definition: "to be clearly more memorable than the rest", example: "That one evening still stands out for me." },
  ],
  "helpful-person": [
    { word: "to go out of one's way", uz: "alohida harakat qilmoq", definition: "to make a special effort to help", example: "She went out of her way to find me a tutor." },
    { word: "selfless", uz: "beg'araz", definition: "caring about others more than yourself", example: "It was a completely selfless thing to do." },
    { word: "to talk through", uz: "batafsil muhokama qilmoq", definition: "to discuss something carefully with someone", example: "He talked me through every option." },
    { word: "turning point", uz: "burilish nuqtasi", definition: "the moment when a situation changes", example: "That conversation was a turning point for me." },
  ],
  "useful-app": [
    { word: "intuitive", uz: "tushunarli, oson", definition: "easy to use without instructions", example: "The interface is completely intuitive." },
    { word: "to streamline", uz: "soddalashtirmoq", definition: "to make a process simpler and faster", example: "It streamlines everything I used to do on paper." },
    { word: "feature", uz: "funksiya", definition: "a particular function of a program", example: "The offline feature is what sold me on it." },
    { word: "to rely on", uz: "tayanmoq", definition: "to depend on something regularly", example: "I rely on it every single morning." },
  ],
  "special-meal": [
    { word: "mouth-watering", uz: "og'iz suvini keltiradigan", definition: "looking or smelling extremely good", example: "The smell alone was mouth-watering." },
    { word: "to savour", uz: "maza qilib yemoq", definition: "to enjoy slowly and fully", example: "We savoured every course." },
    { word: "generous portion", uz: "to'yimli ulush", definition: "a large serving of food", example: "The portions were unusually generous." },
    { word: "occasion", uz: "tantana, munosabat", definition: "a special event", example: "It was my grandmother's birthday, so it was a real occasion." },
  ],
  "important-decision": [
    { word: "to weigh up", uz: "chamalab ko'rmoq", definition: "to consider the advantages and disadvantages", example: "I weighed up the cost against the experience." },
    { word: "at a crossroads", uz: "chorrahada", definition: "at a point where an important choice must be made", example: "I was at a crossroads after finishing school." },
    { word: "to have second thoughts", uz: "ikkilanmoq", definition: "to begin to doubt a decision", example: "I had second thoughts the night before." },
    { word: "in hindsight", uz: "orqaga qarab baholaganda", definition: "looking back with the knowledge you have now", example: "In hindsight it was clearly the right call." },
  ],
  "quiet-place": [
    { word: "secluded", uz: "chekka, xilvat", definition: "private and away from other people", example: "It is a secluded corner of the park." },
    { word: "tranquil", uz: "osoyishta", definition: "calm and peaceful", example: "Early mornings there are utterly tranquil." },
    { word: "to clear one's head", uz: "fikrni tiniqlashtirmoq", definition: "to stop feeling confused or stressed", example: "I go there to clear my head before exams." },
    { word: "hustle and bustle", uz: "shovqin-suron", definition: "the noisy activity of a busy place", example: "It is a refuge from the hustle and bustle." },
  ],
  "skill-learned": [
    { word: "trial and error", uz: "sinov va xato yo'li", definition: "learning by trying and failing repeatedly", example: "I learned mostly through trial and error." },
    { word: "to get the hang of", uz: "uddasidan chiqmoq", definition: "to learn how to do something with practice", example: "It took a month to get the hang of it." },
    { word: "steep learning curve", uz: "qiyin o'zlashtirish bosqichi", definition: "a difficult early stage of learning", example: "There was a steep learning curve at the start." },
    { word: "rewarding", uz: "qoniqarli", definition: "giving satisfaction for the effort spent", example: "It was slow but genuinely rewarding." },
  ],
  "interesting-book": [
    { word: "compelling", uz: "o'ziga tortadigan", definition: "so interesting that you must keep reading", example: "The narrator's voice was compelling." },
    { word: "to relate to", uz: "o'zini yaqin his qilmoq", definition: "to understand and share a character's feelings", example: "I related to the main character immediately." },
    { word: "thought-provoking", uz: "o'ylantiradigan", definition: "making you think seriously", example: "It is a thought-provoking book about memory." },
    { word: "to devour", uz: "yutib yubormoq (o'qib)", definition: "to read very quickly and eagerly", example: "I devoured it in two evenings." },
  ],
  "family-celebration": [
    { word: "to gather", uz: "yig'ilmoq", definition: "to come together in one place", example: "The whole family gathers at my aunt's house." },
    { word: "festive", uz: "bayramona", definition: "cheerful, as at a celebration", example: "The atmosphere was completely festive." },
    { word: "to look forward to", uz: "intiqlik bilan kutmoq", definition: "to feel excited about something coming", example: "We look forward to it all year." },
    { word: "get-together", uz: "davra, uchrashuv", definition: "an informal social gathering", example: "It started as a small get-together." },
  ],
  "good-advice": [
    { word: "to take on board", uz: "hisobga olmoq", definition: "to accept and act on what you are told", example: "I took her advice on board straight away." },
    { word: "sound advice", uz: "oqilona maslahat", definition: "sensible, trustworthy guidance", example: "It was the soundest advice I ever received." },
    { word: "to put into practice", uz: "amalda qo'llamoq", definition: "to actually use what you have learned", example: "Putting it into practice was the hard part." },
    { word: "perspective", uz: "qarash, nuqtai nazar", definition: "a particular way of viewing something", example: "It gave me a completely new perspective." },
  ],
  "expensive-item": [
    { word: "to splash out", uz: "ko'p pul sarflamoq", definition: "to spend a lot of money on something", example: "I splashed out on a proper camera." },
    { word: "worth every penny", uz: "sarflangan pulga arziydi", definition: "fully justifying its cost", example: "It was expensive, but worth every penny." },
    { word: "to save up for", uz: "pul yig'moq", definition: "to collect money over time for a purchase", example: "I saved up for almost a year." },
    { word: "investment", uz: "sarmoya", definition: "a purchase expected to bring long-term value", example: "I treat it as an investment, not a treat." },
  ],
  "sport-event": [
    { word: "atmosphere", uz: "muhit, kayfiyat", definition: "the mood created by a place and its crowd", example: "The atmosphere in the stadium was electric." },
    { word: "nail-biting", uz: "asabiy, keskin", definition: "extremely tense and exciting", example: "The last ten minutes were nail-biting." },
    { word: "to cheer on", uz: "qo'llab-quvvatlamoq", definition: "to shout encouragement at a team", example: "We cheered them on until the final whistle." },
    { word: "underdog", uz: "kuchsizroq raqib", definition: "the competitor expected to lose", example: "Everyone was supporting the underdog." },
  ],
  "old-photo": [
    { word: "faded", uz: "rangi o'chgan", definition: "with colours that have lost their strength", example: "The print is faded but still clear." },
    { word: "to bring back memories", uz: "xotiralarni jonlantirmoq", definition: "to make you remember the past", example: "It brings back memories every time I see it." },
    { word: "candid", uz: "tabiiy, sun'iy emas", definition: "taken without the subject posing", example: "It is a candid shot, which is why I like it." },
    { word: "nostalgic", uz: "sog'inch bilan eslaydigan", definition: "feeling fondness for the past", example: "I get nostalgic looking through the album." },
  ],
  "city-you-like": [
    { word: "vibrant", uz: "jonli, sertashvish", definition: "full of energy and life", example: "It looks like a vibrant, walkable city." },
    { word: "architecture", uz: "me'morchilik", definition: "the design and style of buildings", example: "The architecture is what draws me there." },
    { word: "to soak up", uz: "shimib olmoq (kayfiyatni)", definition: "to enjoy and absorb an atmosphere", example: "I want to soak up the street life." },
    { word: "cosmopolitan", uz: "ko'pmillatli, jahonshumul", definition: "containing people and influences from many countries", example: "It is famously cosmopolitan." },
  ],
  "difficult-task": [
    { word: "daunting", uz: "qo'rqinchli, og'ir", definition: "seeming very difficult to face", example: "The deadline alone was daunting." },
    { word: "to break down", uz: "bo'laklarga ajratmoq", definition: "to divide into smaller parts", example: "I broke the work down into daily steps." },
    { word: "to persevere", uz: "sabot bilan davom etmoq", definition: "to keep going despite difficulty", example: "I persevered even when the data kept failing." },
    { word: "sense of achievement", uz: "yutuq hissi", definition: "the satisfaction of completing something hard", example: "The sense of achievement was enormous." },
  ],
  "creative-person": [
    { word: "imaginative", uz: "tasavvuri boy", definition: "full of new and original ideas", example: "She is the most imaginative person I know." },
    { word: "to come up with", uz: "o'ylab topmoq", definition: "to think of an idea", example: "He comes up with three ideas before breakfast." },
    { word: "flair", uz: "iste'dod, did", definition: "a natural talent for something", example: "She has a real flair for colour." },
    { word: "original", uz: "o'ziga xos", definition: "not copied from anyone else", example: "His work is genuinely original." },
  ],
  "useful-object": [
    { word: "handy", uz: "qulay, asqotadigan", definition: "useful and easy to use", example: "It is the handiest thing in the kitchen." },
    { word: "to come in useful", uz: "asqotmoq", definition: "to turn out to be helpful", example: "It comes in useful almost every day." },
    { word: "sturdy", uz: "mustahkam", definition: "strong and not easily broken", example: "It is sturdy enough to last years." },
    { word: "multipurpose", uz: "ko'p vazifali", definition: "able to be used for several things", example: "It is a multipurpose tool, which is why I keep it." },
  ],
  "film-recommendation": [
    { word: "to be worth watching", uz: "ko'rishga arziydi", definition: "to deserve the time it takes", example: "It is genuinely worth watching twice." },
    { word: "performance", uz: "ijro, rol", definition: "the way an actor plays a part", example: "The lead performance carries the film." },
    { word: "plot twist", uz: "syujet burilishi", definition: "an unexpected change in the story", example: "The plot twist near the end surprised everyone." },
    { word: "to hold up", uz: "eskirmaslik", definition: "to remain good over time", example: "It still holds up twenty years later." },
  ],
  "environmental-problem": [
    { word: "pollution", uz: "ifloslanish", definition: "harmful substances in air, water or soil", example: "Air pollution rises sharply every winter." },
    { word: "to tackle", uz: "hal qilishga kirishmoq", definition: "to start dealing with a problem", example: "The council is finally tackling the waste issue." },
    { word: "waste disposal", uz: "chiqindini yo'q qilish", definition: "the way rubbish is collected and treated", example: "Waste disposal here has not kept up with growth." },
    { word: "to raise awareness", uz: "xabardorlikni oshirmoq", definition: "to make more people understand an issue", example: "Students raised awareness with a clean-up day." },
  ],
  "future-job": [
    { word: "fulfilling", uz: "qoniqish beradigan", definition: "giving a feeling of satisfaction and purpose", example: "I want work that is genuinely fulfilling." },
    { word: "to pursue a career", uz: "kasb yo'lini tanlamoq", definition: "to work towards a particular profession", example: "I intend to pursue a career in public health." },
    { word: "qualification", uz: "malaka, diplom", definition: "an official record of training passed", example: "The qualification takes two more years." },
    { word: "prospects", uz: "istiqbol", definition: "the chances of future success", example: "The prospects in that field look strong." },
  ],
};
