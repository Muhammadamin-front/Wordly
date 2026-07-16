import type { Locale } from "@/lib/locales";

/** Localized strategy cheatsheets shown before practice in each IELTS skill.
 *  Original coaching content written for Wordly (not from any prep book). */
export interface Cheatsheet {
  intro: string;
  tips: { title: string; body: string }[];
  mistakes: string[];
}

type Sheet = Record<Locale, Cheatsheet>;

const READING: Sheet = {
  en: {
    intro:
      "IELTS Reading gives you 60 minutes for 3 passages and 40 questions. Band 7+ is less about vocabulary and more about time discipline and knowing the question traps.",
    tips: [
      { title: "Questions first, passage second", body: "Skim the questions before reading. You'll know what to hunt for instead of trying to remember everything." },
      { title: "20 minutes per passage — hard limit", body: "Passage 3 is the hardest and worth the same points. Never let passage 1 eat 30 minutes." },
      { title: "Keywords get paraphrased", body: "The text almost never repeats the question's words. 'Cheap' becomes 'affordable', 'children' becomes 'the young'. Match meanings, not words." },
      { title: "Location, then precision", body: "First find WHERE the answer lives (skimming), then read that sentence carefully (scanning). Two different skills — use them in order." },
      { title: "'Not Given' means no evidence", body: "For True/False/Not Given: if you must use outside knowledge or logic to justify it, the answer is Not Given. The text alone must prove it." },
      { title: "Never leave blanks", body: "There is no penalty for wrong answers. With 30 seconds left, guess every empty box." },
    ],
    mistakes: [
      "Reading the full passage slowly before looking at any question",
      "Writing more words than the limit allows ('NO MORE THAN TWO WORDS' means two!)",
      "Choosing an answer because it's true in real life, not because the text says it",
      "Spending 5+ minutes on one hard question instead of moving on",
      "Copying words with spelling errors — a misspelled answer is a wrong answer",
    ],
  },
  uz: {
    intro:
      "IELTS Reading — 60 daqiqada 3 matn va 40 savol. Band 7+ ko'proq lug'atga emas, vaqtni boshqarish va savol tuzoqlarini bilishga bog'liq.",
    tips: [
      { title: "Avval savollar, keyin matn", body: "O'qishdan oldin savollarni ko'rib chiqing. Hammasini eslab qolishga urinish o'rniga nimani qidirishni bilasiz." },
      { title: "Har matnga 20 daqiqa — qat'iy chegara", body: "3-matn eng qiyini, lekin ballari bir xil. 1-matnga 30 daqiqa ketkazmang." },
      { title: "Kalit so'zlar boshqacha ifodalanadi", body: "Matn savol so'zlarini deyarli takrorlamaydi: 'cheap' → 'affordable', 'children' → 'the young'. So'zni emas, ma'noni qidiring." },
      { title: "Avval joyini toping, keyin aniq o'qing", body: "Avval javob QAYERDA ekanini toping (skimming), keyin o'sha gapni diqqat bilan o'qing (scanning)." },
      { title: "'Not Given' — dalil yo'q degani", body: "True/False/Not Given'da: javobni asoslash uchun tashqi bilim kerak bo'lsa — javob Not Given. Faqat matn isbotlashi kerak." },
      { title: "Hech qachon bo'sh qoldirmang", body: "Xato javob uchun jarima yo'q. Oxirgi 30 soniyada barcha bo'sh kataklarni taxmin bilan to'ldiring." },
    ],
    mistakes: [
      "Savollarga qaramasdan butun matnni sekin o'qib chiqish",
      "So'z limitidan oshirish ('NO MORE THAN TWO WORDS' — ikki so'z degani!)",
      "Matnda emas, hayotda to'g'ri bo'lgani uchun javobni tanlash",
      "Bitta qiyin savolga 5+ daqiqa sarflash",
      "So'zlarni imlo xatosi bilan ko'chirish — xato yozilgan javob noto'g'ri hisoblanadi",
    ],
  },
  ru: {
    intro:
      "IELTS Reading — 60 минут на 3 текста и 40 вопросов. Band 7+ зависит не столько от словаря, сколько от дисциплины времени и знания ловушек.",
    tips: [
      { title: "Сначала вопросы, потом текст", body: "Просмотрите вопросы до чтения — будете знать, что искать, вместо попыток запомнить всё." },
      { title: "20 минут на текст — жёсткий лимит", body: "Третий текст самый сложный, но баллы те же. Не тратьте 30 минут на первый." },
      { title: "Ключевые слова перефразируются", body: "Текст почти никогда не повторяет слова вопроса: 'cheap' → 'affordable'. Ищите смысл, а не слова." },
      { title: "Сначала место, потом точность", body: "Сначала найдите, ГДЕ ответ (skimming), затем внимательно прочитайте это предложение (scanning)." },
      { title: "'Not Given' = нет доказательств", body: "В True/False/Not Given: если нужны внешние знания или логика — ответ Not Given. Доказывать должен только текст." },
      { title: "Не оставляйте пропусков", body: "Штрафа за неверный ответ нет. В последние 30 секунд заполните все пустые клетки наугад." },
    ],
    mistakes: [
      "Медленно читать весь текст, не глядя на вопросы",
      "Превышать лимит слов ('NO MORE THAN TWO WORDS' — значит два!)",
      "Выбирать ответ потому, что он верен в жизни, а не по тексту",
      "Тратить 5+ минут на один сложный вопрос",
      "Копировать слова с ошибками — ответ с опечаткой не засчитывается",
    ],
  },
};

const LISTENING: Sheet = {
  en: {
    intro:
      "IELTS Listening plays ONCE — 4 sections, 40 questions, 30 minutes. The skill isn't hearing English; it's reading ahead and predicting what you're about to hear.",
    tips: [
      { title: "Use every pause to read ahead", body: "Before each section you get ~30 seconds. Read the upcoming questions and underline keywords — this is where the test is really won." },
      { title: "Predict the answer type", body: "Is the gap a number? A day? A name? Knowing you're listening for a price makes it jump out of the audio." },
      { title: "Expect the correction trap", body: "Speakers change their minds: 'Let's meet Tuesday — actually, Wednesday works better.' The corrected answer is the one that counts." },
      { title: "Answers come in order", body: "Within a section, answers follow the audio's order. If you've missed one, let it go — the next answer is coming." },
      { title: "Watch spelling and plurals", body: "'Environment', 'accommodation', 'February' — misspelled answers score zero. Singular vs plural matters too." },
      { title: "Numbers love distraction", body: "You'll hear several prices/dates; only one is the answer. Note them all quickly, then pick after the speaker finishes." },
    ],
    mistakes: [
      "Writing while a new answer is being spoken — and missing it",
      "Panicking after a missed answer and losing the next three",
      "Ignoring the word limit in completion tasks",
      "Copying the first number you hear without waiting for the correction",
      "Leaving transfer/checking of spelling to the last five seconds",
    ],
  },
  uz: {
    intro:
      "IELTS Listening BIR MARTA ijro etiladi — 4 bo'lim, 40 savol. Asosiy mahorat — inglizchani eshitish emas, oldindan o'qib, nimani eshitishingizni bashorat qilish.",
    tips: [
      { title: "Har pauzada oldinga o'qing", body: "Har bo'limdan oldin ~30 soniya beriladi. Keyingi savollarni o'qib, kalit so'zlarni belgilang — test aslida shu yerda yutiladi." },
      { title: "Javob turini bashorat qiling", body: "Bo'sh joy raqammi? Kunmi? Ismmi? Narx kutayotganingizni bilsangiz, u audioda o'zi ajralib eshitiladi." },
      { title: "Tuzatish tuzog'ini kuting", body: "So'zlovchilar fikrini o'zgartiradi: 'Seshanba uchrashaylik — yo'q, chorshanba yaxshiroq.' Tuzatilgan javob hisoblanadi." },
      { title: "Javoblar tartib bilan keladi", body: "Bo'lim ichida javoblar audio tartibida. Birini o'tkazib yubordingizmi — qo'yib yuboring, keyingisi kelmoqda." },
      { title: "Imlo va ko'plikka ehtiyot bo'ling", body: "'Environment', 'accommodation', 'February' — xato yozilsa 0 ball. Birlik/ko'plik ham muhim." },
      { title: "Raqamlar chalg'itadi", body: "Bir nechta narx/sana eshitasiz, faqat bittasi javob. Hammasini tez yozib, so'zlovchi tugagach tanlang." },
    ],
    mistakes: [
      "Yangi javob aytilayotganda yozish bilan band bo'lib, uni o'tkazib yuborish",
      "O'tkazib yuborilgan javobdan vahimaga tushib, keyingi uchtasini yo'qotish",
      "To'ldirish topshiriqlarida so'z limitini e'tiborsiz qoldirish",
      "Tuzatishni kutmasdan birinchi eshitilgan raqamni yozish",
      "Imloni tekshirishni oxirgi 5 soniyaga qoldirish",
    ],
  },
  ru: {
    intro:
      "IELTS Listening звучит ОДИН раз — 4 секции, 40 вопросов. Навык не в том, чтобы слышать английский, а в том, чтобы читать вперёд и предугадывать.",
    tips: [
      { title: "Каждую паузу — на чтение вперёд", body: "Перед секцией дают ~30 секунд. Прочитайте вопросы и подчеркните ключевые слова — тест выигрывается именно здесь." },
      { title: "Предсказывайте тип ответа", body: "Пропуск — это число? День? Имя? Если ждёте цену, она сама выделится в аудио." },
      { title: "Ждите ловушку-исправление", body: "Говорящие передумывают: 'Встретимся во вторник — нет, лучше в среду.' Засчитывается исправленный ответ." },
      { title: "Ответы идут по порядку", body: "Внутри секции ответы следуют порядку аудио. Пропустили — отпустите, следующий уже близко." },
      { title: "Следите за орфографией и числом", body: "'Environment', 'accommodation', 'February' — ошибка в написании = 0 баллов. Единственное/множественное тоже важно." },
      { title: "Числа любят отвлекать", body: "Прозвучит несколько цен/дат, ответ — одна. Быстро запишите все, выберите после конца фразы." },
    ],
    mistakes: [
      "Записывать, пока звучит новый ответ — и пропустить его",
      "Паниковать из-за пропуска и потерять следующие три ответа",
      "Игнорировать лимит слов в заданиях на заполнение",
      "Записать первое услышанное число, не дождавшись исправления",
      "Оставлять проверку орфографии на последние секунды",
    ],
  },
};

const WRITING: Sheet = {
  en: {
    intro:
      "Writing is the hardest skill to fake. Examiners score four things equally: answering the task, organisation, vocabulary and grammar. Band 7 needs all four — a brilliant essay off-topic scores 5.",
    tips: [
      { title: "Task 2 first (or strictly 20/40)", body: "Task 2 is worth twice Task 1. Many candidates write it first while fresh. Whatever you do: 20 minutes Task 1, 40 minutes Task 2, no exceptions." },
      { title: "Answer EVERY part of the question", body: "'Discuss both views and give your opinion' = three jobs. Miss one and Task Response caps at band 5, no matter how beautiful the English." },
      { title: "Plan for 5 minutes — it pays back", body: "One idea per body paragraph, with an example. A planned essay writes itself; an unplanned one wanders and repeats." },
      { title: "Overview is the Task 1 key", body: "One sentence starting 'Overall, …' summarising the main trend. Without an overview, Task 1 cannot pass band 5." },
      { title: "Linking words: seasoning, not soup", body: "'However' and 'moreover' in every sentence reads mechanical and hurts you. Use them where logic actually turns." },
      { title: "Simple and correct beats fancy and broken", body: "A clean complex sentence per paragraph beats five broken ones. Accuracy is half the grammar score." },
    ],
    mistakes: [
      "Writing under the word limit (150/250) — an automatic penalty",
      "Memorised introductions the examiner has read a thousand times",
      "Giving your opinion when the task didn't ask for it (or hiding it when it did)",
      "Informal language in essays: contractions, 'a lot of', 'kids', 'stuff'",
      "Listing every number from a Task 1 chart instead of selecting key features",
      "No paragraphs, or one-sentence 'paragraphs'",
    ],
  },
  uz: {
    intro:
      "Writing'da ko'z bo'yash eng qiyin. Imtihonchi 4 narsani teng baholaydi: topshiriqqa javob, tuzilish, lug'at va grammatika. Band 7 uchun to'rttasi ham kerak — mavzudan chetga chiqqan zo'r insho 5 oladi.",
    tips: [
      { title: "Avval Task 2 (yoki qat'iy 20/40)", body: "Task 2 ikki baravar ko'p ball beradi. Qanday bo'lmasin: Task 1 ga 20, Task 2 ga 40 daqiqa — istisnosiz." },
      { title: "Savolning HAR qismiga javob bering", body: "'Discuss both views and give your opinion' = uchta vazifa. Bittasi tushsa, Task Response 5 dan oshmaydi." },
      { title: "5 daqiqa reja — o'zini oqlaydi", body: "Har tana xatboshiga bitta g'oya + misol. Rejali insho o'zi yoziladi; rejasizi aylanib, takrorlanadi." },
      { title: "Overview — Task 1 kaliti", body: "'Overall, …' bilan boshlanuvchi bitta gap asosiy trendni umumlashtirsin. Overview'siz Task 1 band 5 dan o'tmaydi." },
      { title: "Bog'lovchilar — ziravor, ovqat emas", body: "Har gapda 'However', 'moreover' mexanik ko'rinadi va ball tushiradi. Mantiq burilgan joyda ishlating." },
      { title: "Sodda-to'g'ri > murakkab-xato", body: "Har xatboshida bitta toza murakkab gap beshta buzuq gapdan yaxshi. Aniqlik — grammatika balining yarmi." },
    ],
    mistakes: [
      "So'z limitidan kam yozish (150/250) — avtomatik jarima",
      "Imtihonchi ming marta o'qigan yodlangan kirishlar",
      "So'ralmagan joyda fikr bildirish (yoki so'ralganda yashirish)",
      "Inshoda og'zaki til: qisqartmalar, 'a lot of', 'kids', 'stuff'",
      "Task 1 da asosiylarini tanlash o'rniga hamma raqamni sanash",
      "Xatboshisiz yozish yoki bir gaplik 'xatboshilar'",
    ],
  },
  ru: {
    intro:
      "Writing сложнее всего «подделать». Экзаменатор оценивает четыре вещи поровну: ответ на задание, организацию, лексику и грамматику. Для band 7 нужны все четыре.",
    tips: [
      { title: "Сначала Task 2 (или строго 20/40)", body: "Task 2 весит вдвое больше. В любом случае: 20 минут на Task 1, 40 — на Task 2, без исключений." },
      { title: "Ответьте на КАЖДУЮ часть вопроса", body: "'Discuss both views and give your opinion' = три задачи. Пропустите одну — Task Response не выше 5." },
      { title: "5 минут плана окупаются", body: "Одна идея на абзац плюс пример. Спланированное эссе пишется само; неспланированное — блуждает." },
      { title: "Overview — ключ к Task 1", body: "Одно предложение 'Overall, …' с главным трендом. Без overview Task 1 не проходит band 5." },
      { title: "Связки — приправа, не суп", body: "'However' в каждом предложении звучит механически и снижает балл. Ставьте там, где реально поворачивает логика." },
      { title: "Просто и верно лучше, чем сложно и с ошибками", body: "Одно чистое сложное предложение на абзац лучше пяти сломанных. Точность — половина оценки за грамматику." },
    ],
    mistakes: [
      "Писать меньше лимита слов (150/250) — автоматический штраф",
      "Заученные вступления, которые экзаменатор читал тысячу раз",
      "Давать мнение, когда не просили (или прятать, когда просили)",
      "Разговорный стиль в эссе: сокращения, 'a lot of', 'kids', 'stuff'",
      "Перечислять все цифры из графика вместо ключевых черт",
      "Отсутствие абзацев или «абзацы» из одного предложения",
    ],
  },
};

const SPEAKING: Sheet = {
  en: {
    intro:
      "Speaking is 11-14 minutes with a human examiner: Part 1 (everyday questions), Part 2 (a 2-minute talk from a cue card), Part 3 (deeper discussion). It's scored like Writing — fluency, vocabulary, grammar, pronunciation.",
    tips: [
      { title: "Extend every answer", body: "Never stop at yes or no. Answer + reason + example is the band-7 reflex: 'Do you like tea?' → what kind, when, why." },
      { title: "Use the full 2 minutes in Part 2", body: "Keep talking until the examiner stops you. Structure on the fly: past → present → opinion → future keeps ideas coming." },
      { title: "Paraphrase, don't freeze", body: "Forgot a word? Talk around it ('the machine that cleans carpets'). Paraphrasing is a scored SKILL, not a failure." },
      { title: "Fillers buy thinking time", body: "'That's an interesting question…', 'I've never thought about it, but…' sound natural and give your brain two seconds." },
      { title: "Self-correction is a plus", body: "Catching your own mistake ('he go— he goes') signals control. Don't apologise, just fix and continue." },
      { title: "Opinions matter, accents don't", body: "Examiners don't grade your accent — only clarity. In Part 3, commit to a view and defend it; hedging everything sounds like band 5." },
    ],
    mistakes: [
      "One-word answers in Part 1 ('Yes.' — silence)",
      "Memorised speeches — examiners detect and ignore them",
      "Stopping after 40 seconds in Part 2",
      "Panicking over one grammar slip and losing the thread",
      "Whispering or mumbling — clarity is a pronunciation criterion",
    ],
  },
  uz: {
    intro:
      "Speaking — imtihonchi bilan 11-14 daqiqa: Part 1 (kundalik savollar), Part 2 (cue card bo'yicha 2 daqiqalik nutq), Part 3 (chuqur muhokama). Writing kabi baholanadi: ravonlik, lug'at, grammatika, talaffuz.",
    tips: [
      { title: "Har javobni kengaytiring", body: "Hech qachon ha/yo'q bilan to'xtamang. Javob + sabab + misol — band 7 refleksi: 'Choy yoqtirasizmi?' → qanaqasini, qachon, nega." },
      { title: "Part 2 da to'liq 2 daqiqa gapiring", body: "Imtihonchi to'xtatguncha davom eting. Tayyor sxema: o'tmish → hozir → fikr → kelajak — g'oyalar tugamaydi." },
      { title: "So'z esdan chiqsa — aylanib o'ting", body: "'Gilamni tozalaydigan mashina' deb tushuntiring. Parafraz — baholanadigan MAHORAT, mag'lubiyat emas." },
      { title: "To'ldiruvchilar o'ylash vaqtini beradi", body: "'That's an interesting question…', 'I've never thought about it, but…' tabiiy eshitiladi va miyaga 2 soniya beradi." },
      { title: "O'z xatosini tuzatish — plus", body: "'He go— he goes' deb o'zingizni tuzatish nazoratni ko'rsatadi. Kechirim so'ramang, tuzating va davom eting." },
      { title: "Fikr muhim, aksent emas", body: "Imtihonchi aksentni baholamaydi — faqat tushunarlilikni. Part 3 da bir pozitsiyani tanlab, himoya qiling." },
    ],
    mistakes: [
      "Part 1 da bir so'zlik javoblar ('Yes.' — jimlik)",
      "Yodlangan nutqlar — imtihonchi payqaydi va hisobga olmaydi",
      "Part 2 da 40 soniyadan keyin to'xtab qolish",
      "Bitta grammatik xatodan vahimaga tushib, fikrni yo'qotish",
      "Pichirlash yoki g'o'ldirash — tushunarlilik talaffuz mezoni",
    ],
  },
  ru: {
    intro:
      "Speaking — 11-14 минут с экзаменатором: Part 1 (бытовые вопросы), Part 2 (речь на 2 минуты по карточке), Part 3 (глубокая дискуссия). Критерии как в Writing: беглость, лексика, грамматика, произношение.",
    tips: [
      { title: "Расширяйте каждый ответ", body: "Никогда не останавливайтесь на да/нет. Ответ + причина + пример — рефлекс band 7." },
      { title: "Говорите все 2 минуты в Part 2", body: "Продолжайте, пока не остановят. Схема на ходу: прошлое → настоящее → мнение → будущее." },
      { title: "Перефразируйте, не замирайте", body: "Забыли слово? Опишите его ('машина, которая чистит ковры'). Парафраз — оцениваемый НАВЫК." },
      { title: "Филлеры дают время подумать", body: "'That's an interesting question…' звучит естественно и даёт мозгу две секунды." },
      { title: "Самоисправление — плюс", body: "Поймали свою ошибку ('he go— he goes') — это признак контроля. Не извиняйтесь, исправьте и дальше." },
      { title: "Мнение важно, акцент — нет", body: "Акцент не оценивается — только ясность. В Part 3 выберите позицию и защищайте её." },
    ],
    mistakes: [
      "Односложные ответы в Part 1 ('Yes.' — тишина)",
      "Заученные речи — экзаменатор замечает и игнорирует",
      "Остановка через 40 секунд в Part 2",
      "Паника из-за одной ошибки и потеря мысли",
      "Шёпот и бормотание — ясность входит в критерий произношения",
    ],
  },
};

export const CHEATSHEETS = {
  reading: READING,
  listening: LISTENING,
  writing: WRITING,
  speaking: SPEAKING,
} as const;

export type CheatsheetSkill = keyof typeof CHEATSHEETS;

export function cheatsheetFor(skill: CheatsheetSkill, lang: string): Cheatsheet {
  const sheet = CHEATSHEETS[skill];
  return sheet[(lang in sheet ? lang : "en") as Locale];
}
