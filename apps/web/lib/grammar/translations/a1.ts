import type { GrammarLessonTranslation } from "../types";

/** Russian and English text for the A1 lessons.
 *
 *  Arrays line up index for index with the Uzbek base in `../a1.ts`; the test
 *  suite fails if they drift. Quiz prompts that are already English gap fills
 *  are left as an empty string, which keeps the base prompt.
 */
type Pair = { ru: GrammarLessonTranslation; en: GrammarLessonTranslation };

export const A1_TRANSLATIONS: Record<string, Pair> = {
  "to-be": {
    ru: {
      name: "Глагол «to be» (am/is/are)",
      explanation: [
        "Самый важный глагол английского языка — «to be» (быть). По-русски мы говорим «Я учитель» и обходимся без глагола. В английском он обязателен: «I am a teacher». Сказать «I a teacher» — самая частая ошибка.",
        "«To be» имеет три формы в настоящем времени: с I — am, с he/she/it — is, с you/we/they — are. Выучите их до автоматизма: на них держатся тысячи предложений.",
        "Отрицание образуется через «not»: I am not, he is not (isn't), they are not (aren't). Вопрос — перестановкой: глагол выходит ВПЕРЁД подлежащего: Are you tired? Is she a doctor?",
      ],
      formula: "I am · he/she/it is · you/we/they are",
      exampleTranslations: [
        "Я студент Ташкентского университета.",
        "Она моя старшая сестра.",
        "Мы из Узбекистана.",
        "Сегодня очень жарко.",
        "Их сейчас нет дома.",
        "Вы готовы? — Да, готов.",
      ],
      mistakeNotes: [
        "В русском глагол-связка опускается, в английском am/is/are ОБЯЗАТЕЛЕН.",
        "С he/she/it всегда употребляется «is».",
        "С «you» всегда «are» — даже когда обращаются к одному человеку.",
      ],
      quizPrompts: ["", "", "", "", "Выберите правильное предложение:"],
    },
    en: {
      name: "The verb 'to be' (am/is/are)",
      explanation: [
        "'To be' is the most important verb in English. Many languages leave it out — you can say the equivalent of 'I teacher' and be understood. English cannot: it needs 'I am a teacher'. Dropping it is the single most common beginner mistake.",
        "'To be' has three present forms: am with I, is with he/she/it, are with you/we/they. Learn them until they are automatic — thousands of sentences are built on these three words.",
        "Negatives add 'not': I am not, he is not (isn't), they are not (aren't). Questions move the verb IN FRONT of the subject: Are you tired? Is she a doctor?",
      ],
      formula: "I am · he/she/it is · you/we/they are",
      mistakeNotes: [
        "The verb cannot be dropped — am/is/are is required in English.",
        "He/she/it always takes 'is'.",
        "'You' always takes 'are', even when speaking to one person.",
      ],
      quizPrompts: ["", "", "", "", "Choose the correct sentence:"],
    },
  },

  articles: {
    ru: {
      name: "Артикли: a / an / the",
      explanation: [
        "В русском языке артиклей нет, поэтому эта тема одна из самых трудных. Правило само по себе простое: исчисляемое существительное в единственном числе не стоит в одиночку — перед ним нужен a/an или the.",
        "«A/an» — неопределённый артикль: предмет упоминается впервые или это «какой-то один». «A» перед согласным звуком (a book, a university — звучит «ю»), «an» перед гласным (an apple, an hour — «h» не читается).",
        "«The» — определённый артикль: собеседник знает, о каком именно предмете речь. Употребляется со вторым упоминанием, с единственными в мире объектами (the sun, the internet) и с конкретно указанными предметами.",
        "В обобщениях существительные во множественном числе идут без артикля: «I like apples» (яблоки вообще), но «I like the apples from our garden» (именно те, из нашего сада).",
      ],
      formula: "a + согласный звук · an + гласный звук · the = конкретный предмет",
      exampleTranslations: [
        "Вчера я купил телефон. (Этот) телефон очень быстрый.",
        "Она инженер.",
        "Солнце встаёт на востоке.",
        "Вы можете открыть окно? (мы оба знаем, какое именно)",
        "Мне нужен зонт (какой-нибудь).",
        "Собаки — преданные животные. (обобщение — без артикля)",
      ],
      mistakeNotes: [
        "С названием профессии всегда нужен a/an.",
        "«University» начинается со звука «ю» (согласный) — поэтому «a».",
        "Абстрактные понятия в общем значении идут без артикля.",
      ],
      quizPrompts: ["", "", "", "Я люблю ___ книги. (в общем)", ""],
    },
    en: {
      name: "Articles: a / an / the",
      explanation: [
        "Many languages have no articles at all, which makes this one of the hardest topics for learners. The rule itself is simple: a singular countable noun cannot stand alone — it needs a/an or the in front of it.",
        "'A/an' is the indefinite article: something mentioned for the first time, or 'one of many'. Use 'a' before a consonant sound (a book, a university — which starts with a 'yu' sound) and 'an' before a vowel sound (an apple, an hour — the 'h' is silent).",
        "'The' is the definite article: your listener knows which one you mean. Use it for something mentioned a second time, for things there is only one of (the sun, the internet), and for anything clearly specified.",
        "In general statements, plural nouns take no article: 'I like apples' (apples in general), but 'I like the apples from our garden' (those specific ones).",
      ],
      formula: "a + consonant sound · an + vowel sound · the = a specific thing",
      mistakeNotes: [
        "A job title always needs a/an.",
        "'University' begins with a 'yu' (consonant) sound, so it takes 'a'.",
        "Abstract nouns used in a general sense take no article.",
      ],
      quizPrompts: ["", "", "", "I like ___ books. (in general)", ""],
    },
  },

  "plural-nouns": {
    ru: {
      name: "Множественное число существительных",
      explanation: [
        "Множественное число обычно образуется через -s: book → books, car → cars. Но есть несколько важных групп исключений, без которых говорить правильно не получится.",
        "К словам на -s/-sh/-ch/-x добавляется -es: bus → buses, watch → watches. А -y после согласной превращается в -ies: city → cities (но day → days, потому что перед «y» стоит гласная).",
        "Самые частые неправильные формы заучиваются: man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth. «Childs» или «peoples» — грубая ошибка.",
      ],
      formula: "+s · -es (s/sh/ch/x) · -y → -ies · исключения: men, women, children, people",
      exampleTranslations: [
        "Два кофе и три пирожных, пожалуйста.",
        "В городе много старых зданий.",
        "Дети быстро учат языки.",
        "Большинство людей здесь дружелюбные.",
        "После долгой прогулки у меня болят ноги.",
        "У неё двое детей — мальчик и девочка.",
      ],
      mistakeNotes: [
        "Множественное от «child» — children, никакого -s.",
        "«People» уже множественное число — второе -s не нужно.",
        "После согласной -y переходит в -ies.",
      ],
      quizPrompts: [
        "Множественное число слова «watch»:",
        "Множественное число слова «woman»:",
        "Множественное число слова «baby»:",
        "Выберите правильный вариант:",
        "Множественное число слова «foot»:",
      ],
    },
    en: {
      name: "Plural nouns",
      explanation: [
        "Plurals are usually formed with -s: book → books, car → cars. But several groups of exceptions matter enough that you cannot speak accurately without them.",
        "Words ending in -s/-sh/-ch/-x take -es: bus → buses, watch → watches. A -y after a consonant becomes -ies: city → cities (but day → days, because a vowel comes before the y).",
        "The most common irregular plurals have to be learned: man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth. 'Childs' and 'peoples' are clear errors.",
      ],
      formula: "+s · -es (s/sh/ch/x) · -y → -ies · irregulars: men, women, children, people",
      mistakeNotes: [
        "The plural of 'child' is children — no -s is added.",
        "'People' is already plural, so it takes no second -s.",
        "After a consonant, -y changes to -ies.",
      ],
      quizPrompts: [
        "The plural of 'watch' is:",
        "The plural of 'woman' is:",
        "The plural of 'baby' is:",
        "Choose the correct option:",
        "The plural of 'foot' is:",
      ],
    },
  },

  "pronouns-possessives": {
    ru: {
      name: "Местоимения и притяжательные формы",
      explanation: [
        "В английском четыре ряда местоимений, и их смешение полностью ломает предложение: I/me/my/mine, he/him/his/his, she/her/her/hers, we/us/our/ours, they/them/their/theirs.",
        "Первый ряд (I, he, she...) — подлежащее: кто делает. Второй (me, him, her...) — дополнение: кому/кого. Не «Me went home», а «I went home»; не «She called I», а «She called me».",
        "После «my/your/his...» ВСЕГДА идёт существительное: my phone. «Mine/yours/his...» стоят самостоятельно: This phone is mine.",
        "Внимание: «its» (притяжательное — его/её) и «it's» (= it is) — совершенно разные вещи. Если есть апостроф, это всегда сокращение «it is».",
      ],
      formula: "I→me→my→mine · he→him→his→his · she→her→her→hers · they→them→their→theirs",
      exampleTranslations: [
        "Она дала мне свою книгу.",
        "Эта сумка моя, а та — ваша.",
        "Мы пригласили их к себе домой.",
        "Собака виляла хвостом.",
        "Скажите ему правду.",
        "Их машина быстрее нашей.",
      ],
      mistakeNotes: [
        "В роли подлежащего употребляется «I», а не «me».",
        "После «my» нужно существительное; отдельно стоит «mine».",
        "«It's» = it is. Для принадлежности — «its», без апострофа.",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
    en: {
      name: "Pronouns & possessives",
      explanation: [
        "English has four sets of pronouns, and mixing them up breaks the sentence completely: I/me/my/mine, he/him/his/his, she/her/her/hers, we/us/our/ours, they/them/their/theirs.",
        "The first set (I, he, she...) is the subject: who does the action. The second (me, him, her...) is the object: to whom or whom. Not 'Me went home' but 'I went home'; not 'She called I' but 'She called me'.",
        "'My/your/his...' is ALWAYS followed by a noun: my phone. 'Mine/yours/his...' stands alone: This phone is mine.",
        "Watch out: 'its' (possessive) and 'it's' (= it is) are completely different. If there is an apostrophe, it is always the contraction of 'it is'.",
      ],
      formula: "I→me→my→mine · he→him→his→his · she→her→her→hers · they→them→their→theirs",
      mistakeNotes: [
        "Use 'I' as the subject, not 'me'.",
        "'My' needs a noun after it; 'mine' stands alone.",
        "'It's' = it is. The possessive is 'its', with no apostrophe.",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
  },

  "present-simple": {
    ru: {
      name: "Простое настоящее время",
      explanation: [
        "Present Simple — время привычек, постоянных состояний и общих истин: то, что делается каждый день, профессия, вкусы. «Я каждый день хожу на работу», «Он живёт в Ташкенте» — всё это Present Simple.",
        "ЗОЛОТОЕ ПРАВИЛО: с he/she/it к глаголу добавляется -s: I work → He works. Эта маленькая -s забывается чаще всего — следите за ней особо.",
        "Отрицание и вопрос строятся через do/does: I don't like tea. Does she work here? Важно: при «does» основной глагол остаётся без -s — не «does he works», а «does he work».",
        "Маркеры времени: every day, usually, often, sometimes, never, on Mondays.",
      ],
      formula: "I/you/we/they + V · he/she/it + V-s · вопрос: Do/Does + подлежащее + V?",
      exampleTranslations: [
        "Я каждое утро пью зелёный чай.",
        "Мой отец работает в банке.",
        "Она не ест мясо.",
        "Вы говорите по-английски?",
        "Магазин открывается в девять?",
        "Вода кипит при 100 градусах. (общая истина)",
      ],
      mistakeNotes: [
        "С he/she/it к глаголу добавляется -s.",
        "При «does» глагол остаётся без -s — эта -s уже внутри «does».",
        "Отрицание строится через «don't/doesn't».",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
    en: {
      name: "Present Simple",
      explanation: [
        "The present simple is the tense of habits, permanent states and general truths: things you do every day, your job, what you like. 'I go to work every day', 'He lives in Tashkent' — all present simple.",
        "THE GOLDEN RULE: with he/she/it the verb takes -s: I work → He works. That small -s is the most frequently forgotten thing in English — give it special attention.",
        "Negatives and questions use do/does: I don't like tea. Does she work here? Important: after 'does' the main verb loses its -s — not 'does he works' but 'does he work'.",
        "Time markers: every day, usually, often, sometimes, never, on Mondays.",
      ],
      formula: "I/you/we/they + V · he/she/it + V-s · question: Do/Does + subject + V?",
      mistakeNotes: [
        "With he/she/it the verb takes -s.",
        "After 'does' the verb drops its -s — the -s is already inside 'does'.",
        "Negatives are formed with 'don't/doesn't'.",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
  },

  "present-continuous": {
    ru: {
      name: "Настоящее продолженное время",
      explanation: [
        "Present Continuous — действие, происходящее ПРЯМО СЕЙЧАС: «Я сейчас читаю книгу». Образование: am/is/are + глагол-ing. Обе части обязательны!",
        "Отличие от Present Simple: «I read books» (вообще, привычка) против «I am reading a book» (сейчас, в эту минуту).",
        "Также употребляется для конкретных планов на ближайшее будущее: «I am meeting Aziz tomorrow» (завтра встречаюсь с Азизом — договорено).",
        "Некоторые глаголы не употребляются в форме -ing (глаголы состояния): know, like, love, want, need, understand. Не «I am knowing», а всегда «I know».",
      ],
      formula: "am/is/are + V-ing",
      exampleTranslations: [
        "Я сейчас пишу эссе.",
        "Она готовит плов на ужин.",
        "Они ждут автобус.",
        "Почему вы смеётесь?",
        "В пятницу мы летим в Стамбул. (план)",
        "Дождь больше не идёт.",
      ],
      mistakeNotes: [
        "«To be» (am/is/are) нельзя опускать.",
        "К глаголу обязательно добавляется -ing.",
        "«Want» — глагол состояния, в continuous не употребляется.",
      ],
      quizPrompts: ["", "", "", "Какое предложение ОШИБОЧНО?", ""],
    },
    en: {
      name: "Present Continuous",
      explanation: [
        "The present continuous describes an action happening RIGHT NOW: 'I am reading a book at the moment.' It is formed with am/is/are + verb-ing. Both parts are required.",
        "The difference from the present simple: 'I read books' (in general, a habit) versus 'I am reading a book' (now, at this minute).",
        "It is also used for definite plans in the near future: 'I am meeting Aziz tomorrow' (it is arranged).",
        "Some verbs are not used in the -ing form (state verbs): know, like, love, want, need, understand. Not 'I am knowing' but always 'I know'.",
      ],
      formula: "am/is/are + V-ing",
      mistakeNotes: [
        "'To be' (am/is/are) cannot be left out.",
        "The verb must take -ing.",
        "'Want' is a state verb and is not used in the continuous.",
      ],
      quizPrompts: ["", "", "", "Which sentence is WRONG?", ""],
    },
  },

  "there-is-are": {
    ru: {
      name: "There is / There are (есть, имеется)",
      explanation: [
        "Чтобы сказать, что где-то что-то ЕСТЬ, английский использует конструкцию «there is/are». Русское «В комнате есть стол» — это «There is a table in the room».",
        "С единственным числом — «there is», с множественным — «there are»: There is a mosque near my house. There are two universities in this city.",
        "Отрицание: There isn't / There aren't. Вопрос: Is there...? / Are there...? Ответ: Yes, there is. / No, there aren't.",
        "Не путайте с «it is»: «There is a book» — о наличии книги; «It is a book» — о том, что этот предмет является книгой.",
      ],
      formula: "There is + единственное число · There are + множественное",
      exampleTranslations: [
        "Рядом с нашей школой есть парк.",
        "На этой улице много кафе.",
        "В холодильнике нет молока.",
        "Есть вопросы?",
        "У двери кто-то есть.",
        "В году 12 месяцев.",
      ],
      mistakeNotes: [
        "В значении «есть, имеется» предложение начинается с «there is».",
        "«People» — множественное число, нужно «there are».",
        "«Есть проблема» = There is a problem (не «have»).",
      ],
      quizPrompts: ["", "", "", "", "«На столе две книги» — правильный перевод:"],
    },
    en: {
      name: "There is / There are",
      explanation: [
        "To say that something EXISTS somewhere, English uses 'there is/are'. Many languages express this differently — 'In the room is a table' — but English needs 'There is a table in the room'.",
        "Use 'there is' with a singular noun and 'there are' with a plural: There is a mosque near my house. There are two universities in this city.",
        "Negative: There isn't / There aren't. Question: Is there...? / Are there...? Short answers: Yes, there is. / No, there aren't.",
        "Do not confuse it with 'it is': 'There is a book' says a book exists; 'It is a book' says what the thing is.",
      ],
      formula: "There is + singular · There are + plural",
      mistakeNotes: [
        "To say something exists, start the sentence with 'there is'.",
        "'People' is plural, so it needs 'there are'.",
        "'There is a problem' — not 'have a problem' — for stating that a problem exists.",
      ],
      quizPrompts: ["", "", "", "", "'Two books are on the table' — the correct version is:"],
    },
  },

  "can-cant": {
    ru: {
      name: "Can / Can't (мочь, уметь)",
      explanation: [
        "«Can» — модальный глагол, выражающий умение («умею»), разрешение («можно ли») и просьбу. Удобство модальных глаголов: форма ОДНА для всех лиц — he can, I can, they can. Никакого -s!",
        "После «can» глагол всегда в начальной форме (инфинитив без «to»): can swim, can speak. «Can to swim» или «can swimming» — ошибка.",
        "Отрицание: can't (cannot). Вопрос: Can + подлежащее + глагол? — Can you help me? Ответ: Yes, I can / No, I can't.",
      ],
      formula: "подлежащее + can/can't + V (начальная форма)",
      exampleTranslations: [
        "Я умею водить машину.",
        "Она говорит на трёх языках.",
        "Мы не сможем прийти на вечеринку сегодня вечером.",
        "Можно я открою окно?",
        "Передайте, пожалуйста, соль.",
        "Мой дедушка не умеет пользоваться смартфоном.",
      ],
      mistakeNotes: [
        "К модальным глаголам -s не добавляется.",
        "После «can» не употребляется «to».",
        "«Can» образует вопрос сам — «do» не нужен.",
      ],
      quizPrompts: ["", "", "", "", "Какое предложение ПРАВИЛЬНОЕ?"],
    },
    en: {
      name: "Can / Can't",
      explanation: [
        "'Can' is a modal verb used for ability ('I can'), permission ('may I') and requests. Modal verbs are convenient: the form is THE SAME for every person — he can, I can, they can. No -s at all.",
        "After 'can', the verb is always in its base form (infinitive without 'to'): can swim, can speak. 'Can to swim' and 'can swimming' are both wrong.",
        "Negative: can't (cannot). Question: Can + subject + verb? — Can you help me? Short answers: Yes, I can / No, I can't.",
      ],
      formula: "subject + can/can't + V (base form)",
      mistakeNotes: [
        "Modal verbs never take -s.",
        "'To' is not used after 'can'.",
        "'Can' forms its own question — no 'do' is needed.",
      ],
      quizPrompts: ["", "", "", "", "Which sentence is CORRECT?"],
    },
  },

  "prepositions-time-place": {
    ru: {
      name: "Предлоги: in / on / at",
      explanation: [
        "In/on/at — три главных предлога времени и места. Их логика такая: IN — внутри чего-то большого, ON — на поверхности, AT — в конкретной точке.",
        "ВРЕМЯ: in — месяцы, годы, времена года (in May, in 2025, in winter); on — дни и даты (on Monday, on 12 March); at — часы и устойчивые выражения (at 7 o'clock, at night, at the weekend).",
        "МЕСТО: in — город, страна, внутри помещения (in Tashkent, in the kitchen); on — на поверхности, на улице, на этаже (on the table, on the second floor); at — конкретная точка или учреждение (at home, at school, at the bus stop).",
        "Запомните: in the morning/afternoon/evening, НО at night — это исключение спрашивают чаще всего.",
      ],
      formula: "in = внутри/большой период · on = на поверхности/день · at = точка/час",
      exampleTranslations: [
        "Мой день рождения в сентябре.",
        "Урок начинается в 9 часов в понедельник.",
        "Она живёт в Намангане.",
        "Ваши ключи на столе.",
        "Встретимся у станции метро.",
        "Обычно мы отдыхаем в выходные.",
      ],
      mistakeNotes: [
        "С годами употребляется «in».",
        "С днями недели — «on».",
        "С «home» — «at»: устойчивое выражение.",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
    en: {
      name: "Prepositions: in / on / at",
      explanation: [
        "In/on/at are the three key prepositions of time and place. The logic behind them: IN — inside something large, ON — on a surface, AT — at a specific point.",
        "TIME: in — months, years, seasons (in May, in 2025, in winter); on — days and dates (on Monday, on 12 March); at — clock times and set phrases (at 7 o'clock, at night, at the weekend).",
        "PLACE: in — a city, country or enclosed space (in Tashkent, in the kitchen); on — a surface, street or floor (on the table, on the second floor); at — a specific point or institution (at home, at school, at the bus stop).",
        "Remember: in the morning/afternoon/evening, BUT at night — this exception is asked about more than any other.",
      ],
      formula: "in = inside/long period · on = surface/day · at = point/clock time",
      mistakeNotes: [
        "Years take 'in'.",
        "Days of the week take 'on'.",
        "'Home' takes 'at' — it is a fixed expression.",
      ],
      quizPrompts: ["", "", "", "", ""],
    },
  },

  "questions-word-order": {
    ru: {
      name: "Вопросы и порядок слов",
      explanation: [
        "Порядок слов в английском предложении СТРОГИЙ: Подлежащее + Глагол + Дополнение. По-русски можно сказать «Книгу я прочитал», в английском — только «I read the book».",
        "Вопросительные слова: What (что), Where (где), When (когда), Who (кто), Why (почему), How (как), How many/much (сколько).",
        "Формула вопроса: вопросительное слово + вспомогательный глагол (do/does/is/are/can) + подлежащее + глагол: Where do you live? What is she doing? Пропуск вспомогательного глагола — классическая ошибка: «Where you live?» неверно.",
        "Когда «who» само является подлежащим, вспомогательный глагол не нужен: Who lives here?",
      ],
      formula: "Вопросительное слово + do/does/is/are + подлежащее + глагол?",
      exampleTranslations: [
        "Где вы работаете?",
        "Во сколько отправляется поезд?",
        "Почему вы расстроены?",
        "Сколько у вас братьев?",
        "Кто этот человек?",
        "Как мне добраться до аэропорта?",
      ],
      mistakeNotes: [
        "В вопросе вспомогательный глагол (do/does) обязателен.",
        "Вспомогательный глагол стоит ПЕРЕД подлежащим.",
        "«Very much» ставится в конце предложения.",
      ],
      quizPrompts: ["", "", "Выберите правильный вопрос:", "", "___ написал это письмо? (кто написал?)"],
    },
    en: {
      name: "Questions & word order",
      explanation: [
        "Word order in an English sentence is STRICT: Subject + Verb + Object. Many languages allow 'The book I read'; English allows only 'I read the book'.",
        "Question words: What, Where, When, Who, Why, How, How many/much.",
        "The question formula: question word + auxiliary (do/does/is/are/can) + subject + verb: Where do you live? What is she doing? Dropping the auxiliary is the classic mistake — 'Where you live?' is wrong.",
        "When 'who' is itself the subject, no auxiliary is needed: Who lives here?",
      ],
      formula: "Question word + do/does/is/are + subject + verb?",
      mistakeNotes: [
        "An auxiliary verb (do/does) is required in a question.",
        "The auxiliary comes BEFORE the subject.",
        "'Very much' goes at the end of the sentence.",
      ],
      quizPrompts: ["", "", "Choose the correct question:", "", "___ wrote this letter? (who wrote it?)"],
    },
  },
};
