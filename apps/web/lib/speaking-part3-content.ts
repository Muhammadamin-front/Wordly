/** Per-topic Part 3 material.
 *
 *  Part 3 questions came from one eight-slot template, and five of the eight
 *  slots did not even name the topic — "Do you think governments should do more
 *  in this area?" was asked about books, sport and friendship alike. Examiners
 *  do the opposite: Part 3 questions are abstract but firmly tied to the theme.
 *  Each set below moves from definition to cause, comparison, consequence and
 *  prediction, which is the progression a real discussion follows.
 */
import type { Part1Vocabulary } from "./speaking-part1-content";

export interface Part3Content {
  questions: [string, string, string, string, string, string, string, string];
  vocabulary: [Part1Vocabulary, Part1Vocabulary, Part1Vocabulary, Part1Vocabulary];
}

export const PART3_CONTENT: Record<string, Part3Content> = {
  "travel-and-culture": {
    questions: [
      "Why do people travel to places very different from their own country?",
      "Does tourism help a culture survive, or does it change it?",
      "How has cheap air travel changed the way people see the world?",
      "Do tourists have a responsibility towards the places they visit?",
      "Is it possible to understand a culture without speaking its language?",
      "Should popular destinations limit the number of visitors?",
      "What do young travellers look for that older generations did not?",
      "Will virtual travel ever replace visiting a place in person?",
    ],
    vocabulary: [
      { word: "cultural exchange", uz: "madaniy almashinuv", definition: "the sharing of ideas and customs between groups", example: "Student programmes are a genuine cultural exchange." },
      { word: "to commodify", uz: "tovarga aylantirmoq", definition: "to turn something into a product to be sold", example: "Mass tourism can commodify religious festivals." },
      { word: "authenticity", uz: "asllik", definition: "the quality of being genuine", example: "Travellers increasingly value authenticity over comfort." },
      { word: "footfall", uz: "tashrif buyuruvchilar oqimi", definition: "the number of visitors to a place", example: "Heavy footfall damages fragile heritage sites." },
    ],
  },
  "education-systems": {
    questions: [
      "What should be the main purpose of school education?",
      "Are examinations a fair way to measure ability?",
      "Should practical skills be taught alongside academic subjects?",
      "Why do some students lose motivation as they get older?",
      "How much should parents be involved in a child's schooling?",
      "Is a university degree still worth the cost?",
      "Do online courses offer the same value as classroom teaching?",
      "How might schools be different in twenty years?",
    ],
    vocabulary: [
      { word: "rote learning", uz: "yodlab o'rganish", definition: "memorising without understanding", example: "Rote learning produces marks but little insight." },
      { word: "curriculum", uz: "o'quv dasturi", definition: "the subjects taught in a school or course", example: "The curriculum leaves little room for creativity." },
      { word: "critical thinking", uz: "tanqidiy fikrlash", definition: "judging information carefully rather than accepting it", example: "Critical thinking is harder to test than recall." },
      { word: "vocational", uz: "kasb-hunarga oid", definition: "related to training for a specific job", example: "Vocational courses lead directly into employment." },
    ],
  },
  "technology-and-society": {
    questions: [
      "In what ways has technology changed how people work together?",
      "Do digital tools make us more productive or simply busier?",
      "Should there be limits on how much data companies collect?",
      "Is constant connectivity good for family life?",
      "Why do some people resist new technology?",
      "Will automation create more jobs than it removes?",
      "How should children be prepared for a more automated world?",
      "What responsibilities do technology companies have to society?",
    ],
    vocabulary: [
      { word: "digital divide", uz: "raqamli tafovut", definition: "the gap between those with and without access to technology", example: "The digital divide widened during remote schooling." },
      { word: "surveillance", uz: "kuzatuv", definition: "close observation of people", example: "Cameras have normalised everyday surveillance." },
      { word: "to automate", uz: "avtomatlashtirmoq", definition: "to make a process run by machine", example: "Firms automate routine tasks first." },
      { word: "obsolete", uz: "eskirgan", definition: "no longer useful because something newer exists", example: "Some skills become obsolete within a decade." },
    ],
  },
  "cities-and-transport": {
    questions: [
      "Why do people continue to move from villages to cities?",
      "What makes a city pleasant to live in?",
      "Should private cars be discouraged in city centres?",
      "How can governments reduce traffic congestion?",
      "Is public transport valued differently by rich and poor residents?",
      "Do green spaces matter as much as housing in urban planning?",
      "How does a long commute affect quality of life?",
      "What will cities need to change to cope with growing populations?",
    ],
    vocabulary: [
      { word: "urban sprawl", uz: "shaharning tarqoq kengayishi", definition: "the uncontrolled spread of a city outwards", example: "Urban sprawl makes public transport expensive to run." },
      { word: "congestion", uz: "tirbandlik", definition: "too much traffic in one place", example: "Congestion charges cut traffic in the centre." },
      { word: "infrastructure", uz: "infratuzilma", definition: "the basic systems a place needs, such as roads and water", example: "The infrastructure has not kept pace with the population." },
      { word: "pedestrianised", uz: "piyodalar uchun ajratilgan", definition: "made for walking, with cars banned", example: "The pedestrianised square is far livelier now." },
    ],
  },
  "health-and-lifestyle": {
    questions: [
      "Is staying healthy mainly an individual responsibility?",
      "Why do people find it hard to keep healthy habits?",
      "Should governments regulate what food companies advertise?",
      "How has modern work affected physical health?",
      "Is mental health taken as seriously as physical health?",
      "Do public health campaigns actually change behaviour?",
      "Should healthcare be free for everyone?",
      "What health problems do you expect to grow in the coming years?",
    ],
    vocabulary: [
      { word: "sedentary", uz: "harakatsiz", definition: "involving a lot of sitting", example: "A sedentary job needs deliberate exercise." },
      { word: "preventive", uz: "profilaktik", definition: "aimed at stopping illness before it starts", example: "Preventive care costs less than treatment." },
      { word: "life expectancy", uz: "o'rtacha umr ko'rish davomiyligi", definition: "how long people typically live", example: "Life expectancy has risen steadily for decades." },
      { word: "to take its toll", uz: "salbiy ta'sir ko'rsatmoq", definition: "to cause gradual damage", example: "Long shifts take their toll on sleep." },
    ],
  },
  environment: {
    questions: [
      "How much difference can individual action make to the environment?",
      "Why do people continue habits they know are harmful to the planet?",
      "Should richer countries carry more of the cost of climate action?",
      "Is recycling an effective solution or a distraction?",
      "How can cities be designed to produce less waste?",
      "What role should schools play in environmental awareness?",
      "Are environmental laws better than voluntary agreements?",
      "How optimistic are you about the next fifty years?",
    ],
    vocabulary: [
      { word: "carbon footprint", uz: "uglerod izi", definition: "the amount of carbon dioxide an activity produces", example: "Flying dominates most people's carbon footprint." },
      { word: "sustainable", uz: "barqaror", definition: "able to continue without damaging resources", example: "Sustainable farming protects the soil." },
      { word: "to offset", uz: "qoplamoq", definition: "to balance a harm with an equal benefit", example: "Planting trees does not fully offset heavy emissions." },
      { word: "landfill", uz: "chiqindixona", definition: "a place where rubbish is buried", example: "Most packaging still ends up in landfill." },
    ],
  },
  "work-and-careers": {
    questions: [
      "What motivates people most in their work: money, status or interest?",
      "Has remote work changed what employees expect?",
      "Should people expect to change career several times in life?",
      "Why is there often a gap between qualifications and available jobs?",
      "Do long working hours actually produce better results?",
      "How important is it to enjoy your job?",
      "Should employers be responsible for retraining staff?",
      "What kinds of work do you think will disappear soon?",
    ],
    vocabulary: [
      { word: "job security", uz: "ish kafolati", definition: "the confidence that you will keep your job", example: "Young workers value flexibility over job security." },
      { word: "work-life balance", uz: "ish va hayot muvozanati", definition: "the division between working and personal time", example: "Remote work blurred our work-life balance." },
      { word: "to retrain", uz: "qayta o'qitmoq", definition: "to learn skills for a different job", example: "Older employees may need to retrain twice." },
      { word: "burnout", uz: "kasbiy charchash", definition: "exhaustion caused by prolonged stress at work", example: "Burnout costs companies more than absence does." },
    ],
  },
  "media-and-advertising": {
    questions: [
      "How does advertising influence what people buy?",
      "Should advertising aimed at children be restricted?",
      "Do people still trust traditional news sources?",
      "Why does misleading information spread so quickly online?",
      "Is it possible to avoid advertising in daily life?",
      "How should social media platforms handle false claims?",
      "Do influencers have more effect than conventional advertisements?",
      "How might advertising change as technology develops?",
    ],
    vocabulary: [
      { word: "target audience", uz: "maqsadli auditoriya", definition: "the group an advertisement is aimed at", example: "The target audience here is clearly teenagers." },
      { word: "misleading", uz: "chalg'ituvchi", definition: "giving a false impression", example: "The claim was technically true but misleading." },
      { word: "brand loyalty", uz: "brendga sodiqlik", definition: "the habit of always buying the same brand", example: "Brand loyalty is built long before adulthood." },
      { word: "to bombard", uz: "ko'plab yog'dirmoq", definition: "to direct a very large amount at someone", example: "We are bombarded with adverts from morning to night." },
    ],
  },
  "family-and-generations": {
    questions: [
      "How have family roles changed in your country?",
      "Why do older and younger generations often disagree?",
      "Should adult children be responsible for their elderly parents?",
      "Is the extended family less important than it used to be?",
      "How does living far from family affect people?",
      "What can younger people learn from older relatives?",
      "Do smaller families change how children grow up?",
      "How do you expect family life to look in thirty years?",
    ],
    vocabulary: [
      { word: "extended family", uz: "katta oila", definition: "relatives beyond parents and children", example: "The extended family still gathers every holiday." },
      { word: "generation gap", uz: "avlodlar farqi", definition: "the difference in outlook between age groups", example: "The generation gap shows most clearly online." },
      { word: "to pass down", uz: "avloddan avlodga o'tkazmoq", definition: "to give to younger generations", example: "Recipes are passed down without being written." },
      { word: "upbringing", uz: "tarbiya", definition: "the way a child is raised", example: "Their upbringing was far stricter than mine." },
    ],
  },
  "friendship-and-community": {
    questions: [
      "What makes a community strong?",
      "Is it harder to make close friends as an adult?",
      "Has online contact changed the meaning of friendship?",
      "Why do some people feel lonely even in large cities?",
      "Should neighbours be expected to help one another?",
      "Do people volunteer less than they used to?",
      "How do shared spaces affect how well people know each other?",
      "What could be done to reduce isolation among older people?",
    ],
    vocabulary: [
      { word: "sense of belonging", uz: "o'ziniki his qilish", definition: "the feeling of being accepted in a group", example: "A local club gives people a sense of belonging." },
      { word: "isolation", uz: "yolg'izlik, ajralganlik", definition: "the state of being alone and separated", example: "Isolation affects health as much as smoking." },
      { word: "to volunteer", uz: "ko'ngilli bo'lib ishlamoq", definition: "to work without pay to help others", example: "Students volunteer at the community centre." },
      { word: "tight-knit", uz: "jipslashgan", definition: "closely connected and supportive", example: "It remains a tight-knit community despite the new buildings." },
    ],
  },
  "money-and-success": {
    questions: [
      "How do people in your country define success?",
      "Does more money reliably make people happier?",
      "Should schools teach children how to manage money?",
      "Why do attitudes to saving differ between generations?",
      "Is a large income gap harmful to a society?",
      "Do wealthy people have obligations to the wider community?",
      "Has social media changed what people think they need?",
      "Will cash disappear completely in the future?",
    ],
    vocabulary: [
      { word: "financial literacy", uz: "moliyaviy savodxonlik", definition: "the ability to manage money well", example: "Financial literacy should start in secondary school." },
      { word: "disposable income", uz: "erkin sarflanadigan daromad", definition: "money left after essential costs", example: "Rising rents have squeezed disposable income." },
      { word: "materialistic", uz: "moddiy narsalarga berilgan", definition: "caring greatly about possessions", example: "Advertising encourages a materialistic outlook." },
      { word: "inequality", uz: "tengsizlik", definition: "an unequal distribution of wealth or chances", example: "Inequality tends to reduce social trust." },
    ],
  },
  "art-and-creativity": {
    questions: [
      "Why does every society produce art?",
      "Should governments fund artists and museums?",
      "Is creativity something that can be taught?",
      "Do creative subjects deserve as much school time as science?",
      "How has technology changed who can make and share art?",
      "Is street art vandalism or a legitimate form of expression?",
      "Why do some works of art remain valuable for centuries?",
      "What role will artificial intelligence play in creative work?",
    ],
    vocabulary: [
      { word: "self-expression", uz: "o'zini ifodalash", definition: "showing your own thoughts and feelings", example: "For teenagers, music is pure self-expression." },
      { word: "heritage", uz: "meros", definition: "the traditions and objects inherited from the past", example: "Restoring the tilework protects national heritage." },
      { word: "patronage", uz: "homiylik", definition: "financial support given to artists", example: "Public patronage keeps small theatres alive." },
      { word: "to commission", uz: "buyurtma bermoq", definition: "to pay someone to create a work", example: "The city commissioned a mural for the station." },
    ],
  },
  "food-and-globalisation": {
    questions: [
      "Why has fast food spread so widely around the world?",
      "Are traditional dishes disappearing in your country?",
      "Should governments tax unhealthy food?",
      "How does importing food all year round affect local farmers?",
      "Do people cook less than previous generations?",
      "Is eating together as a family still important?",
      "How do international restaurants change local taste?",
      "What will diets look like in fifty years?",
    ],
    vocabulary: [
      { word: "processed food", uz: "qayta ishlangan oziq-ovqat", definition: "food changed from its natural state before sale", example: "Processed food is cheap and heavily marketed." },
      { word: "locally sourced", uz: "mahalliy yetishtirilgan", definition: "produced near where it is sold", example: "Locally sourced produce cuts transport emissions." },
      { word: "culinary tradition", uz: "oshpazlik an'anasi", definition: "the established cooking practices of a place", example: "Plov is central to our culinary tradition." },
      { word: "to dilute", uz: "susaytirmoq", definition: "to make something weaker or less distinct", example: "Global chains can dilute regional cooking." },
    ],
  },
  "sports-and-discipline": {
    questions: [
      "What do children learn from team sports that they cannot learn elsewhere?",
      "Are professional athletes paid too much?",
      "Should sport be compulsory in schools?",
      "Why do people follow teams so passionately?",
      "Does competition help or harm young players?",
      "How do sporting role models influence behaviour?",
      "Should countries spend public money on hosting major events?",
      "How might technology change the way sport is played and watched?",
    ],
    vocabulary: [
      { word: "teamwork", uz: "jamoaviy ish", definition: "working together towards a shared goal", example: "Teamwork matters more than individual talent here." },
      { word: "perseverance", uz: "matonat", definition: "continuing despite difficulty", example: "Training teaches perseverance better than lectures do." },
      { word: "role model", uz: "o'rnak", definition: "a person others try to imitate", example: "Athletes are role models whether they choose to be or not." },
      { word: "grassroots", uz: "quyi bosqich, oddiy darajadagi", definition: "at the local, ordinary level rather than professional", example: "Grassroots clubs produce most national players." },
    ],
  },
  "books-and-reading": {
    questions: [
      "Why do people read less than they used to?",
      "Does reading fiction have any practical value?",
      "Are libraries still necessary?",
      "How do e-books change the experience of reading?",
      "Should children be required to read certain books at school?",
      "Does reading improve the way people write and speak?",
      "Why do some books stay popular across generations?",
      "What will reading look like for the next generation?",
    ],
    vocabulary: [
      { word: "literacy", uz: "savodxonlik", definition: "the ability to read and write", example: "Literacy rates rose sharply in one generation." },
      { word: "to immerse oneself", uz: "sho'ng'ib ketmoq", definition: "to become completely absorbed", example: "A good novel lets you immerse yourself entirely." },
      { word: "attention span", uz: "diqqat davomiyligi", definition: "how long someone can concentrate", example: "Short videos may be shortening our attention span." },
      { word: "timeless", uz: "abadiy, eskirmaydigan", definition: "not affected by the passing of time", example: "The themes are timeless, which is why it survives." },
    ],
  },
  "language-and-identity": {
    questions: [
      "Why do people feel strongly about their mother tongue?",
      "Does learning a foreign language change how you think?",
      "Should minority languages be protected by law?",
      "Is English becoming too dominant internationally?",
      "Do accents affect how people are judged?",
      "What is lost when a language disappears?",
      "Should children learn a second language from an early age?",
      "Will translation technology reduce the need to learn languages?",
    ],
    vocabulary: [
      { word: "mother tongue", uz: "ona tili", definition: "the first language a person learns", example: "He writes poetry only in his mother tongue." },
      { word: "bilingual", uz: "ikki tilli", definition: "able to speak two languages well", example: "Bilingual children switch languages effortlessly." },
      { word: "to preserve", uz: "saqlab qolmoq", definition: "to keep something from being lost", example: "Recordings help preserve endangered languages." },
      { word: "linguistic diversity", uz: "til xilma-xilligi", definition: "the range of different languages in a place", example: "Central Asia has remarkable linguistic diversity." },
    ],
  },
  "shopping-and-consumption": {
    questions: [
      "Why do people buy things they do not need?",
      "Has online shopping changed high streets for the better?",
      "Should products be designed to last longer?",
      "Do sales and discounts encourage waste?",
      "How much responsibility do consumers have for how goods are made?",
      "Is second-hand shopping becoming more acceptable?",
      "Do people in your country repair things or replace them?",
      "How might shopping habits change in the next decade?",
    ],
    vocabulary: [
      { word: "consumerism", uz: "iste'molchilik", definition: "a culture of buying more and more goods", example: "Consumerism is sustained by constant advertising." },
      { word: "disposable", uz: "bir martalik", definition: "designed to be thrown away after use", example: "Disposable products create enormous waste." },
      { word: "durable", uz: "chidamli", definition: "lasting a long time without breaking", example: "People will pay more for durable goods." },
      { word: "to phase out", uz: "bosqichma-bosqich to'xtatmoq", definition: "to stop using gradually", example: "Shops are phasing out plastic bags." },
    ],
  },
  "crime-and-safety": {
    questions: [
      "What makes people feel safe in a neighbourhood?",
      "Is prevention more effective than punishment?",
      "Should cameras be used widely in public places?",
      "Why does crime tend to be higher in some areas than others?",
      "Do harsher sentences reduce crime?",
      "How does poverty relate to crime?",
      "What role can schools play in preventing crime?",
      "How is online crime different from traditional crime?",
    ],
    vocabulary: [
      { word: "deterrent", uz: "to'sqinlik qiluvchi omil", definition: "something that discourages an action", example: "Lighting is a cheap and effective deterrent." },
      { word: "rehabilitation", uz: "qayta ijtimoiylashtirish", definition: "helping an offender return to normal life", example: "Rehabilitation lowers the chance of reoffending." },
      { word: "petty crime", uz: "mayda jinoyat", definition: "a minor offence", example: "Petty crime rose while the factory was closed." },
      { word: "to report", uz: "xabar bermoq", definition: "to tell the authorities about an incident", example: "Many victims never report what happened." },
    ],
  },
  "science-and-innovation": {
    questions: [
      "Why do some countries invest far more in research than others?",
      "Should scientists decide the limits of their own work?",
      "How can complex research be explained to the public?",
      "Is medical research given enough funding compared with other fields?",
      "Do people trust scientific advice?",
      "Should there be ethical limits on artificial intelligence?",
      "How important is international cooperation in science?",
      "Which scientific advance do you expect to matter most in your lifetime?",
    ],
    vocabulary: [
      { word: "breakthrough", uz: "yorqin kashfiyot", definition: "an important discovery that solves a problem", example: "The vaccine was a genuine breakthrough." },
      { word: "funding", uz: "moliyalashtirish", definition: "money provided for a purpose", example: "Basic research depends on long-term funding." },
      { word: "ethical", uz: "axloqiy", definition: "relating to what is morally right", example: "Gene editing raises difficult ethical questions." },
      { word: "peer review", uz: "mutaxassislar ekspertizasi", definition: "checking of research by other experts", example: "Peer review is slow but it catches errors." },
    ],
  },
  "tradition-and-modern-life": {
    questions: [
      "Which traditions are most worth keeping?",
      "Why do young people sometimes reject old customs?",
      "Can a tradition survive if its original meaning is forgotten?",
      "How do celebrations change when they become commercial?",
      "Should traditional crafts be supported by the state?",
      "Does modern life leave enough time for traditional practices?",
      "How do families pass traditions on today?",
      "What will remain of today's customs in a hundred years?",
    ],
    vocabulary: [
      { word: "custom", uz: "urf-odat", definition: "a way of behaving that a group has followed for a long time", example: "The custom of visiting elders at Navruz continues." },
      { word: "to hand down", uz: "meros qilib qoldirmoq", definition: "to pass to the next generation", example: "The embroidery patterns were handed down for centuries." },
      { word: "modernisation", uz: "zamonaviylashtirish", definition: "the process of adopting newer methods", example: "Modernisation need not erase local identity." },
      { word: "ritual", uz: "marosim", definition: "a set of actions performed in a fixed order", example: "The wedding ritual has barely changed." },
    ],
  },
};
