import type { Locale } from "@/lib/locales";

export type SeoPage =
  | "home"
  | "pricing"
  | "vocabulary"
  | "expressions"
  | "grammar"
  | "ielts"
  | "ieltsReading"
  | "ieltsWriting"
  | "ieltsListening"
  | "ieltsSpeaking"
  | "ieltsMock"
  | "games"
  | "skills";

type SeoCopy = Record<SeoPage, { title: string; description: string }>;

const SEO_COPY: Record<Locale, SeoCopy> = {
  uz: {
    home: {
      title: "Vocora — Ingliz tili so'zlari va grammatika",
      description:
        "Inglizcha so'zlarni A1–C2 darajalarda o'rganing: o'zbekcha tarjima, talaffuz, misollar, SRS takrorlash, grammatika va IELTS mashqlari.",
    },
    pricing: {
      title: "Premium rejalar va narxlar",
      description:
        "Vocora Free, oylik, 3 oylik va yillik rejalarini solishtiring. Vocabulary, grammatika, IELTS mashqlari va chuqur statistika imkoniyatlarini ko'ring.",
    },
    vocabulary: {
      title: "Inglizcha so'zlar lug'ati: A1–C2",
      description:
        "A1 dan C2 gacha inglizcha so'zlarni o'zbekcha va ruscha tarjima, IPA talaffuz, misollar va CEFR darajalari bilan o'rganing.",
    },
    expressions: {
      title: "Inglizcha iboralar, idiomalar va phrasal verblar",
      description:
        "Kundalik suhbat, ish va IELTS uchun tabiiy inglizcha iboralar, idiomalar, collocation va phrasal verblarni tarjima hamda misollar bilan o'rganing.",
    },
    grammar: {
      title: "Ingliz tili grammatikasi: A1–C2 darslar",
      description:
        "Ingliz tili grammatikasini A1 dan C2 gacha bosqichma-bosqich o'rganing. O'zbekcha tushuntirishlar, aniq misollar va mashqlar bir joyda.",
    },
    ielts: {
      title: "IELTS tayyorlov: Reading, Writing, Listening, Speaking",
      description:
        "IELTS Academic uchun to'rtta ko'nikmani mashq qiling: reading, writing, listening va speaking bo'yicha strategiyalar, testlar va lug'at resurslari.",
    },
    ieltsReading: {
      title: "IELTS Reading mashqlari va strategiyalari",
      description:
        "IELTS Reading matnlari, savol turlari, vaqt boshqaruvi va akademik lug'at bilan imtihon formatida o'qish ko'nikmangizni rivojlantiring.",
    },
    ieltsWriting: {
      title: "IELTS Writing Task 1 va Task 2 qo'llanmasi",
      description:
        "IELTS Writing Task 1 va Task 2 uchun tuzilma, model javoblar, foydali iboralar va band mezonlari bilan yozishni mashq qiling.",
    },
    ieltsListening: {
      title: "IELTS Listening testlari va mashqlari",
      description:
        "IELTS Listening bo'limlari, audio testlar, savol turlari va imtihon strategiyalari bilan tinglab tushunish ko'nikmangizni oshiring.",
    },
    ieltsSpeaking: {
      title: "IELTS Speaking savollari va javob namunalari",
      description:
        "IELTS Speaking Part 1, 2 va 3 savollari, tabiiy iboralar, cue card mavzulari va yuqori bandga mos javob usullarini mashq qiling.",
    },
    ieltsMock: {
      title: "IELTS sinov testi: to'liq mock imtihon",
      description:
        "Listening, Reading, Writing va Speaking bo'limlarini haqiqiy vaqt va yagona overall band natijasi bilan to'liq IELTS mock formatida topshiring.",
    },
    games: {
      title: "Inglizcha so'z o'yinlari",
      description:
        "Inglizcha so'zlarni tezkor viktorina, word match, fill in the blank va tinglash o'yinlari orqali eslab qoling va takrorlang.",
    },
    skills: {
      title: "Ingliz tili ko'nikmalari",
      description:
        "Ingliz tilida tinglash, o'qish, yozish, gapirish va grammatikani darajali mashqlar orqali muntazam rivojlantiring.",
    },
  },
  en: {
    home: {
      title: "Vocora — English vocabulary and grammar learning",
      description:
        "Learn English vocabulary from A1 to C2 with translations, pronunciation, examples, spaced repetition, grammar lessons, games, and IELTS practice.",
    },
    pricing: {
      title: "Premium plans and pricing",
      description:
        "Compare Vocora Free, monthly, quarterly, and yearly plans for vocabulary, grammar, IELTS practice, learning games, and deeper progress analytics.",
    },
    vocabulary: {
      title: "English vocabulary dictionary: A1–C2",
      description:
        "Explore A1–C2 English words with Uzbek and Russian translations, IPA pronunciation, examples, CEFR levels, and practical learning tools.",
    },
    expressions: {
      title: "English expressions, idioms, and phrasal verbs",
      description:
        "Learn natural English expressions, idioms, collocations, and phrasal verbs for daily conversation, work, and IELTS with translations and examples.",
    },
    grammar: {
      title: "English grammar lessons from A1 to C2",
      description:
        "Study English grammar step by step from A1 to C2 with clear explanations, practical examples, structured lessons, and focused exercises.",
    },
    ielts: {
      title: "IELTS preparation: Reading, Writing, Listening, Speaking",
      description:
        "Prepare for IELTS Academic with reading, writing, listening, and speaking practice, exam strategies, mock tests, and academic vocabulary resources.",
    },
    ieltsReading: {
      title: "IELTS Reading practice and strategies",
      description:
        "Practise IELTS Reading passages, common question types, time management, and academic vocabulary in an exam-focused learning environment.",
    },
    ieltsWriting: {
      title: "IELTS Writing Task 1 and Task 2 guide",
      description:
        "Improve IELTS Writing Task 1 and Task 2 with clear structures, model answers, useful phrases, scoring criteria, and focused practice.",
    },
    ieltsListening: {
      title: "IELTS Listening tests and practice",
      description:
        "Build IELTS Listening skills with four-section audio tests, common question types, practical vocabulary, and exam-day strategies.",
    },
    ieltsSpeaking: {
      title: "IELTS Speaking questions and sample answers",
      description:
        "Practise IELTS Speaking Parts 1, 2, and 3 with cue cards, natural phrases, common topics, and high-band answer techniques.",
    },
    ieltsMock: {
      title: "Full IELTS mock test",
      description:
        "Take Listening, Reading, Writing, and Speaking in one timed IELTS mock exam and review a single overall band result with section scores.",
    },
    games: {
      title: "English vocabulary learning games",
      description:
        "Review English words through speed quizzes, word matching, fill-in-the-blank, and listening games designed to strengthen active recall.",
    },
    skills: {
      title: "English language skills practice",
      description:
        "Develop English listening, reading, writing, speaking, and grammar through short level-based activities and practical feedback.",
    },
  },
  ru: {
    home: {
      title: "Vocora — английская лексика и грамматика",
      description:
        "Учите английские слова уровней A1–C2 с переводом, произношением, примерами, интервальными повторениями, грамматикой и практикой IELTS.",
    },
    pricing: {
      title: "Тарифы и цены Premium",
      description:
        "Сравните бесплатный, месячный, трёхмесячный и годовой тарифы Vocora для лексики, грамматики, IELTS, игр и подробной статистики.",
    },
    vocabulary: {
      title: "Словарь английских слов A1–C2",
      description:
        "Изучайте английские слова уровней A1–C2 с узбекским и русским переводом, транскрипцией IPA, примерами и полезными упражнениями.",
    },
    expressions: {
      title: "Английские выражения, идиомы и фразовые глаголы",
      description:
        "Учите естественные английские выражения, идиомы, коллокации и фразовые глаголы для общения, работы и IELTS с переводом и примерами.",
    },
    grammar: {
      title: "Грамматика английского языка: уроки A1–C2",
      description:
        "Изучайте английскую грамматику от A1 до C2: понятные объяснения, практические примеры, структурированные уроки и упражнения.",
    },
    ielts: {
      title: "Подготовка к IELTS: Reading, Writing, Listening, Speaking",
      description:
        "Готовьтесь к IELTS Academic: практика чтения, письма, аудирования и говорения, пробные тесты, стратегии и академическая лексика.",
    },
    ieltsReading: {
      title: "IELTS Reading: практика и стратегии",
      description:
        "Тренируйте IELTS Reading на текстах экзаменационного формата: типы вопросов, управление временем и академическая лексика.",
    },
    ieltsWriting: {
      title: "IELTS Writing Task 1 и Task 2",
      description:
        "Готовьтесь к IELTS Writing Task 1 и Task 2 по структурам, модельным ответам, полезным фразам, критериям оценки и заданиям.",
    },
    ieltsListening: {
      title: "IELTS Listening: тесты и упражнения",
      description:
        "Развивайте аудирование IELTS с тестами из четырёх разделов, типовыми вопросами, полезной лексикой и экзаменационными стратегиями.",
    },
    ieltsSpeaking: {
      title: "IELTS Speaking: вопросы и примеры ответов",
      description:
        "Практикуйте IELTS Speaking Parts 1, 2 и 3: cue cards, естественные фразы, частые темы и техники ответов для высокого балла.",
    },
    ieltsMock: {
      title: "Полный пробный тест IELTS",
      description:
        "Пройдите Listening, Reading, Writing и Speaking в одном пробном IELTS с реальным временем и общим баллом по результатам разделов.",
    },
    games: {
      title: "Игры для изучения английских слов",
      description:
        "Повторяйте английские слова в быстрых викторинах, подборе пар, заполнении пропусков и играх на аудирование и активную память.",
    },
    skills: {
      title: "Практика навыков английского языка",
      description:
        "Развивайте аудирование, чтение, письмо, говорение и грамматику английского языка с короткими заданиями по уровням.",
    },
  },
};

export function getSeoCopy(lang: string, page: SeoPage): { title: string; description: string } {
  const locale = (lang === "en" || lang === "ru" ? lang : "uz") satisfies Locale;
  return SEO_COPY[locale][page];
}

export const SEO_COPY_BY_LOCALE = SEO_COPY;
