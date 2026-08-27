// AUTO-GENERATED content data for the 131 grammar-curriculum-expansion lessons.
// Each entry is keyed by slug and supplies the hand-authored explanation/examples/
// mistakes/quiz content that pairs with the TopicSpec seed data in
// curriculum-expansion.ts (title/titleUz/category/formula/order come from there).
//
// Source of truth for how this was produced: written by parallel content-authoring
// passes matching the a1.ts "to-be"/"articles" quality bar, then independently
// verified (structural checks + defect-pattern greps) before being wired in here.

import type { GrammarExample, GrammarMistake, GrammarQuizItem } from "./types";

export interface AuthoredGrammarContent {
  explanation: string[];
  examples: GrammarExample[];
  mistakes: GrammarMistake[];
  quiz: GrammarQuizItem[];
}

export const EXPANSION_CONTENT: Record<string, AuthoredGrammarContent> = {
  "subject-object-pronouns": {
    "explanation": [
      "Ingliz tilida olmoshlar ega (subject) bo'lib kelganda va to'ldiruvchi (object) bo'lib kelganda turlicha shaklga kiradi — bu o'zbek tiliga o'xshamaydigan xususiyat, chunki bizda \"u\" so'zi ega bo'lsa ham, to'ldiruvchi bo'lsa ham deyarli bir xil qoladi (faqat kelishik qo'shimchasi o'zgaradi: u — uni — unga). Ingliz tilida esa so'zning o'zi butunlay boshqacha bo'lib qoladi: I → me, he → him, she → her, we → us, they → them.",
      "Ega olmoshlari (I, you, he, she, it, we, they) doim fe'ldan OLDIN, ish bajaruvchi sifatida keladi: \"He works hard.\" To'ldiruvchi olmoshlari (me, you, him, her, it, us, them) esa fe'ldan KEYIN yoki predlogdan (for, with, to, at) keyin keladi, chunki ular harakatni qabul qiluvchi tomonni bildiradi: \"I called him.\" \"This gift is for her.\"",
      "Eng ko'p uchraydigan xato — ikki kishi haqida gapirganda ega o'rnida to'ldiruvchi olmoshini ishlatish: \"Me and my friend went to the cinema\" o'rniga \"My friend and I went to the cinema\" to'g'ri, chunki bu yerda ikkovi ham ega vazifasida turibdi.",
      "Predlogdan keyin har doim to'ldiruvchi olmoshi keladi, hech qachon ega olmoshi emas: \"between you and me\", \"with him\", \"to her\". Bu xatoni hatto ona tilida so'zlashuvchilar ham qiladi (\"between you and I\" deb), shuning uchun buni alohida yodda tuting."
    ],
    "examples": [
      {
        "en": "She called him after class.",
        "uz": "U darsdan keyin unga qo'ng'iroq qildi."
      },
      {
        "en": "I saw them at the bus stop.",
        "uz": "Men ularni avtobus bekatida ko'rdim."
      },
      {
        "en": "He always helps her with homework.",
        "uz": "U unga doim uy vazifasida yordam beradi."
      },
      {
        "en": "We invited them to our party.",
        "uz": "Biz ularni ziyofatimizga taklif qildik."
      },
      {
        "en": "They know us very well.",
        "uz": "Ular bizni juda yaxshi bilishadi."
      },
      {
        "en": "Can you give me your number?",
        "uz": "Menga raqamingizni bera olasizmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "Her called me yesterday.",
        "right": "She called me yesterday.",
        "note": "Ega o'rnida to'ldiruvchi olmosh (her) emas, ega olmoshi (she) ishlatiladi."
      },
      {
        "wrong": "I saw he at the shop.",
        "right": "I saw him at the shop.",
        "note": "Fe'ldan keyin ega olmoshi (he) emas, to'ldiruvchi olmoshi (him) kerak."
      },
      {
        "wrong": "Me and my brother went home.",
        "right": "My brother and I went home.",
        "note": "Ikki ega birga kelganda ham ega olmoshi (I) ishlatiladi; odobli tartibda \"men\"ni oxiriga qo'yamiz."
      }
    ],
    "quiz": [
      {
        "q": "My sister is a doctor. ___ works in a big hospital.",
        "options": [
          "She",
          "Her",
          "He",
          "Him"
        ],
        "answer": 0
      },
      {
        "q": "Can you help ___ with my bags?",
        "options": [
          "I",
          "me",
          "my",
          "mine"
        ],
        "answer": 1
      },
      {
        "q": "___ and I are going to the cinema tonight.",
        "options": [
          "Him",
          "He",
          "His",
          "Himself"
        ],
        "answer": 1
      },
      {
        "q": "This letter is for ___.",
        "options": [
          "they",
          "them",
          "their",
          "theirs"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Her is my teacher.",
          "She is my teacher.",
          "She are my teacher.",
          "Her are my teacher."
        ],
        "answer": 1
      }
    ]
  },
  "possessive-adjectives-pronouns": {
    "explanation": [
      "Egalik sifatlari (my, your, his, her, its, our, their) doim otdan OLDIN keladi va otni albatta talab qiladi: \"my book\", \"her phone\", \"their house\". Ular otsiz yolg'iz qololmaydi — \"This is my\" degan gap noto'liq va tinglovchini \"nimang?\" deb so'rashga majbur qiladi.",
      "Egalik olmoshlari (mine, yours, his, hers, ours, theirs) esa otning o'zini ALMASHTIRADI — ulardan keyin boshqa ot kelmaydi: \"This book is mine\" (= this is my book, lekin \"book\" so'zi takrorlanmaydi). \"His\" ikkala guruhga ham xizmat qiladi — \"his car\" (sifat) va \"This car is his\" (olmosh) — ikkalasida ham shakli bir xil qoladi.",
      "Farqni ajratish uchun oddiy test bor: agar so'z otdan oldin kelayotgan bo'lsa — bu egalik sifati (my, your, his, her, its, our, their); agar so'z otning o'rnini bosayotgan bo'lsa va undan keyin hech qanday ot kelmasa — bu egalik olmoshi (mine, yours, his, hers, ours, theirs).",
      "\"Its\" (egalik sifati, apostrofsiz) ko'pincha \"it's\" (= it is, apostrof bilan) bilan chalkashtiriladi. Bu ikkisi butunlay boshqa so'zlar: \"The cat licked its paw\" (mushukning panjasi) va \"It's raining\" (yomg'ir yog'yapti) — apostrofni noto'g'ri joyga qo'yish juda keng tarqalgan xato."
    ],
    "examples": [
      {
        "en": "This is my older sister.",
        "uz": "Bu — mening opam."
      },
      {
        "en": "Is this pen yours?",
        "uz": "Bu ruchka siznikimi?"
      },
      {
        "en": "Their flat is on the third floor.",
        "uz": "Ularning kvartirasi uchinchi qavatda."
      },
      {
        "en": "This book is mine, not yours.",
        "uz": "Bu kitob meniki, sizniki emas."
      },
      {
        "en": "The dog wagged its tail happily.",
        "uz": "It quvonib dumini likillatdi."
      },
      {
        "en": "Our teacher gave us extra homework.",
        "uz": "Bizning o'qituvchimiz bizga qo'shimcha uy vazifasi berdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "This is a book of me.",
        "right": "This is my book.",
        "note": "Egalik sifati (\"my\") to'g'ridan-to'g'ri otdan oldin qo'yiladi, \"of me\" kabi aylanma yo'l kerak emas."
      },
      {
        "wrong": "That car is mine car.",
        "right": "That car is mine.",
        "note": "\"Mine\" otni o'zida mujassam qiladi — undan keyin yana ot qo'shilmaydi."
      },
      {
        "wrong": "The dog is licking it's paw.",
        "right": "The dog is licking its paw.",
        "note": "\"Its\" — egalik sifati, apostrofsiz yoziladi; \"it's\" esa \"it is\" degani, butunlay boshqa so'z."
      }
    ],
    "quiz": [
      {
        "q": "This is ___ bag.",
        "options": [
          "I",
          "me",
          "my",
          "mine"
        ],
        "answer": 2
      },
      {
        "q": "Is this pencil yours or ___?",
        "options": [
          "hers",
          "her",
          "she",
          "she's"
        ],
        "answer": 0
      },
      {
        "q": "The cat is cleaning ___ fur.",
        "options": [
          "it's",
          "its",
          "it",
          "its'"
        ],
        "answer": 1
      },
      {
        "q": "That is not your seat — it's ___.",
        "options": [
          "I",
          "my",
          "mine",
          "me"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "This book is my.",
          "This book is mine.",
          "This is mine book.",
          "This book is me."
        ],
        "answer": 1
      }
    ]
  },
  "demonstratives": {
    "explanation": [
      "Ingliz tilida ko'rsatish olmoshlari ikki narsaga qarab tanlanadi: masofa (yaqin yoki uzoq) va son (birlik yoki ko'plik). Bu o'zbek tilidagi \"bu\" va \"u/o'sha\"ga o'xshaydi, lekin ingliz tilida ko'plik uchun alohida so'z bor, o'zbekchada esa ko'rsatish olmoshi songa qarab o'zgarmaydi (\"bu kitoblar\"da \"bu\" o'zgarmay qoladi, faqat ot ko'plik qo'shimchasi oladi).",
      "\"This\" — yaqindagi birlik narsa yoki odam uchun (this book, this man); \"these\" — yaqindagi ko'plik uchun (these books). \"That\" — uzoqdagi birlik uchun (that mountain); \"those\" — uzoqdagi ko'plik uchun (those mountains).",
      "Ular ham sifat sifatida otdan oldin (this pen, those cars), ham mustaqil olmosh sifatida otsiz (\"This is mine\") ishlatilishi mumkin — ayniqsa odamlarni tanishtirishda juda ko'p uchraydi: \"This is my friend, Aziz.\"",
      "Fe'l shakli ot bilan (demak, ko'rsatish olmoshi bilan) mos kelishi kerak: \"This book IS interesting\" (birlik fe'l), lekin \"These books ARE interesting\" (ko'plik fe'l) — ko'p o'quvchi \"these/those\"dan keyin ham birlik fe'l qo'yib xato qiladi."
    ],
    "examples": [
      {
        "en": "These shoes are comfortable.",
        "uz": "Bu poyabzallar qulay."
      },
      {
        "en": "This coffee is too hot.",
        "uz": "Bu qahva juda issiq."
      },
      {
        "en": "Look at that building over there.",
        "uz": "Ana o'sha binoga qarang."
      },
      {
        "en": "Those mountains are covered with snow.",
        "uz": "Ana o'sha tog'lar qor bilan qoplangan."
      },
      {
        "en": "This is my new phone.",
        "uz": "Bu mening yangi telefonim."
      },
      {
        "en": "Can you pass me that plate, please?",
        "uz": "Iltimos, o'sha likopchani menga uzatib yubora olasizmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "These book is mine.",
        "right": "This book is mine.",
        "note": "\"Book\" birlik — \"these\" emas, \"this\" kerak."
      },
      {
        "wrong": "I like this shoes.",
        "right": "I like these shoes.",
        "note": "\"Shoes\" doim ko'plik shaklda ishlatiladi, shuning uchun \"this\" emas, \"these\" kerak."
      },
      {
        "wrong": "Those mountain is beautiful.",
        "right": "That mountain is beautiful.",
        "note": "Ko'rsatish olmoshi va ot sondagi (birlik/ko'plik) mos kelishi kerak: \"that mountain\" yoki \"those mountains\"."
      }
    ],
    "quiz": [
      {
        "q": "___ apple in my hand is red.",
        "options": [
          "This",
          "These",
          "Those",
          "That"
        ],
        "answer": 0
      },
      {
        "q": "___ shoes over there belong to my brother.",
        "options": [
          "This",
          "That",
          "These",
          "Those"
        ],
        "answer": 3
      },
      {
        "q": "I like ___ pen. (qo'limdagi qalam)",
        "options": [
          "this",
          "that",
          "these",
          "those"
        ],
        "answer": 0
      },
      {
        "q": "___ students standing next to me are very quiet.",
        "options": [
          "This",
          "That",
          "These",
          "Those"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "These book are new.",
          "This books are new.",
          "These books are new.",
          "This book are new."
        ],
        "answer": 2
      }
    ]
  },
  "have-have-got": {
    "explanation": [
      "\"Have\" va \"have got\" ikkalasi ham egalik, oila a'zolari, kasallik va tashqi ko'rinishni ifodalash uchun ishlatiladi va ma'nosi bir xil — faqat \"have got\" ko'proq so'zlashuv nutqida va Britaniya ingliz tilida keng tarqalgan: \"I have a car\" = \"I have got a car\" (Mening mashinam bor).",
      "Yasalishida katta farq bor. Oddiy \"have\"da savol va inkor \"do/does\" yordamchisi bilan tuziladi: \"Do you have a car? I don't have a car.\" \"Have got\"da esa \"do/does\" kerak emas — \"have/has\"ning o'zi ega bilan joy almashib savol yasaydi: \"Have you got a car? I haven't got a car.\"",
      "He/she/it bilan \"have\" — \"has\"ga aylanadi, xuddi shunday \"have got\" — \"has got\" bo'ladi: \"She has got two brothers\" = \"She has two brothers.\" So'zlashuvda qisqartma shakl juda keng tarqalgan: I've got, she's got, we've got.",
      "\"Have\"ning boshqa ma'nosi ham bor — biror harakat yoki faoliyatni bildiradi (have breakfast, have a shower, have a good time) va bu holatlarda \"have got\" ishlatilmaydi, faqat oddiy \"have\" va \"do/does\": \"I have breakfast at seven\" (\"I have got breakfast\" emas)."
    ],
    "examples": [
      {
        "en": "Mira has got a new laptop.",
        "uz": "Miraning yangi noutbuki bor."
      },
      {
        "en": "Do you have any brothers or sisters?",
        "uz": "Aka-uka yoki opa-singilingiz bormi?"
      },
      {
        "en": "I haven't got much time today.",
        "uz": "Bugun vaqtim kam."
      },
      {
        "en": "We have a small garden behind our house.",
        "uz": "Uyimiz orqasida kichik bog'imiz bor."
      },
      {
        "en": "He has a headache today.",
        "uz": "Uning bugun boshi og'riyapti."
      },
      {
        "en": "Has your sister got a driving licence?",
        "uz": "Opangizning haydovchilik guvohnomasi bormi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "She have got two cats.",
        "right": "She has got two cats.",
        "note": "He/she/it bilan \"have\" emas, \"has\" ishlatiladi."
      },
      {
        "wrong": "Do you have got a pen?",
        "right": "Have you got a pen?",
        "note": "\"Do\" va \"have got\" birga ishlatilmaydi — savol yo \"do you have\", yo \"have you got\" shaklida bo'ladi."
      },
      {
        "wrong": "I have got breakfast at seven every day.",
        "right": "I have breakfast at seven every day.",
        "note": "Harakatni bildirganda (nonushta qilmoq kabi) faqat oddiy \"have\" ishlatiladi, \"have got\" emas."
      }
    ],
    "quiz": [
      {
        "q": "___ she got a car?",
        "options": [
          "Do",
          "Does",
          "Has",
          "Is"
        ],
        "answer": 2
      },
      {
        "q": "I ___ any money with me right now.",
        "options": [
          "don't have",
          "doesn't have",
          "not have",
          "haven't has"
        ],
        "answer": 0
      },
      {
        "q": "He ___ two sisters.",
        "options": [
          "have",
          "has",
          "having",
          "haves"
        ],
        "answer": 1
      },
      {
        "q": "___ you got a pen I could borrow?",
        "options": [
          "Do",
          "Are",
          "Have",
          "Is"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She have got a dog.",
          "She has got a dog.",
          "She has get a dog.",
          "She having a dog."
        ],
        "answer": 1
      }
    ]
  },
  "possessive-s": {
    "explanation": [
      "Ingliz tilida biror narsa kimga tegishli ekanini aytishning yana bir yo'li — \"of\" emas, balki egalik qo'shimchasi 's (apostrof + s), ayniqsa odamlar va jonzotlar haqida gapirganda: \"Aziza's notebook\" (Azizaning daftari), \"my brother's car\" (akamning mashinasi).",
      "Qoida sodda: egasi (kim ekanligi) + 's + narsa, masalan \"Aziza's notebook\". Diqqat qiling: o'zbekchada bu tuzilma ikki qismli — \"Azizaning daftari\" (egaga -ning, narsaga -i qo'shiladi), ingliz tilida esa faqat egaga 's qo'shiladi, narsaning o'zi (notebook) hech qanday qo'shimcha olmaydi.",
      "Ko'plikdagi otlarda, agar so'z allaqachon -s bilan tugasa, faqat apostrof qo'yiladi, ikkinchi -s qo'shilmaydi: \"my parents' house\" (ota-onamning uyi), \"the students' books\". Lekin -s bilan tugamaydigan noregular ko'plikda to'liq 's qo'shiladi: \"the children's toys\", \"the men's room\".",
      "Jonsiz narsalar uchun odatda 's emas, \"of\" qurilmasi afzal ko'riladi: \"the door of the room\" tabiiyroq eshitiladi, \"the room's door\" kamdan-kam ishlatiladi. Vaqt so'zlari bilan esa 's odatiy holat: \"today's newspaper\", \"a week's holiday\"."
    ],
    "examples": [
      {
        "en": "That is Aziza's notebook.",
        "uz": "Bu — Azizaning daftari."
      },
      {
        "en": "My brother's car is parked outside.",
        "uz": "Akamning mashinasi tashqarida turibdi."
      },
      {
        "en": "The children's toys are all over the floor.",
        "uz": "Bolalarning o'yinchoqlari butun pol bo'ylab sochilib yotibdi."
      },
      {
        "en": "This is my parents' house.",
        "uz": "Bu — ota-onamning uyi."
      },
      {
        "en": "Have you read today's news?",
        "uz": "Bugungi yangiliklarni o'qidingizmi?"
      },
      {
        "en": "The teacher's explanation was very clear.",
        "uz": "O'qituvchining tushuntirishi juda tushunarli edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "This is the book of Aziz.",
        "right": "This is Aziz's book.",
        "note": "Shaxsga tegishli narsa haqida gapirganda \"of\" emas, 's qurilmasi tabiiyroq."
      },
      {
        "wrong": "My parents's house is big.",
        "right": "My parents' house is big.",
        "note": "\"Parents\" allaqachon -s bilan tugaydi, shuning uchun faqat apostrof qo'yiladi, yana -s qo'shilmaydi."
      },
      {
        "wrong": "The car of my friend is new.",
        "right": "My friend's car is new.",
        "note": "Odam haqida gapirganda 's qurilmasi ko'proq qo'llaniladi."
      }
    ],
    "quiz": [
      {
        "q": "This is ___ bag.",
        "options": [
          "Malika",
          "Malika's",
          "Malikas",
          "of Malika"
        ],
        "answer": 1
      },
      {
        "q": "These are the ___ (bir nechta bolaning) toys.",
        "options": [
          "childs'",
          "child's",
          "children's",
          "childrens'"
        ],
        "answer": 2
      },
      {
        "q": "That is my ___ house.",
        "options": [
          "sister",
          "sisters",
          "sister's",
          "sisters's"
        ],
        "answer": 2
      },
      {
        "q": "Have you seen ___ new phone?",
        "options": [
          "James",
          "James's",
          "Jameses",
          "of James"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The childrens' toys are new.",
          "The children's toys are new.",
          "The childs's toys are new.",
          "The children toys are new."
        ],
        "answer": 1
      }
    ]
  },
  "present-simple-negatives": {
    "explanation": [
      "Present Simple zamonida gapni inkor qilish uchun yordamchi fe'l \"do not (don't)\" yoki \"does not (doesn't)\" ishlatiladi — asosiy fe'lning o'zi hech qachon \"not\" bilan to'g'ridan-to'g'ri inkor qilinmaydi. \"I not like tea\" kabi gap ingliz tilida mavjud emas.",
      "I/you/we/they bilan — don't + asl fe'l: \"I don't like fish.\" He/she/it bilan — doesn't + asl fe'l, va bu holatda asosiy fe'lga -s QO'SHILMAYDI, chunki -s allaqachon \"does\"ning ichida bor: \"She doesn't like fish\" (\"She doesn't likes fish\" emas).",
      "\"To be\" fe'li bundan mustasno — u \"do/does\" talab qilmaydi, faqat \"not\" qo'shiladi: \"She is not tired\" (\"She doesn't is tired\" emas). Bu — Present Simple inkorining eng ko'p adashtiriladigan joyi, chunki o'quvchilar \"to be\"ga ham \"doesn't\" qo'shib yuboradi.",
      "So'zlashuv nutqida qisqartma shakllar ustunlik qiladi: don't, doesn't. Rasmiy yozma matnlarda to'liq shakl afzal ko'riladi: do not, does not."
    ],
    "examples": [
      {
        "en": "He doesn't drink coffee.",
        "uz": "U qahva ichmaydi."
      },
      {
        "en": "I don't understand this question.",
        "uz": "Men bu savolni tushunmayman."
      },
      {
        "en": "She doesn't like spicy food.",
        "uz": "U achchiq taomni yoqtirmaydi."
      },
      {
        "en": "We don't have classes on Sundays.",
        "uz": "Yakshanba kunlari bizda darslar bo'lmaydi."
      },
      {
        "en": "My father doesn't smoke.",
        "uz": "Otam chekmaydi."
      },
      {
        "en": "They don't live in this city anymore.",
        "uz": "Ular endi bu shaharda yashashmaydi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She don't like tea.",
        "right": "She doesn't like tea.",
        "note": "He/she/it bilan \"don't\" emas, \"doesn't\" ishlatiladi."
      },
      {
        "wrong": "He doesn't likes tea.",
        "right": "He doesn't like tea.",
        "note": "\"Doesn't\"dan keyingi fe'lga -s qo'shilmaydi — -s allaqachon \"does\"da bor."
      },
      {
        "wrong": "I not like this movie.",
        "right": "I don't like this movie.",
        "note": "Inkor faqat \"don't/doesn't\" bilan yasaladi, \"not\" yolg'iz yetarli emas."
      }
    ],
    "quiz": [
      {
        "q": "She ___ eat meat.",
        "options": [
          "don't",
          "doesn't",
          "not",
          "isn't"
        ],
        "answer": 1
      },
      {
        "q": "I ___ like loud music.",
        "options": [
          "doesn't",
          "not",
          "don't",
          "am not"
        ],
        "answer": 2
      },
      {
        "q": "He ___ speak French.",
        "options": [
          "doesn't speaks",
          "doesn't speak",
          "don't speak",
          "not speaks"
        ],
        "answer": 1
      },
      {
        "q": "They ___ live here anymore.",
        "options": [
          "doesn't",
          "isn't",
          "don't",
          "aren't"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She don't drink coffee.",
          "She doesn't drinks coffee.",
          "She doesn't drink coffee.",
          "She not drink coffee."
        ],
        "answer": 2
      }
    ]
  },
  "present-simple-questions": {
    "explanation": [
      "Present Simple'da savol berish uchun yordamchi fe'l \"Do\" yoki \"Does\" gapning eng boshiga, ega(subject)dan OLDINGA chiqariladi: gap \"You work here\" savolga aylanganda \"Do you work here?\" bo'ladi.",
      "I/you/we/they bilan — Do + ega + asl fe'l?: \"Do they live here?\" He/she/it bilan — Does + ega + asl fe'l, va fe'lga -s QO'SHILMAYDI: \"Does she work here?\" (\"Does she works here?\" emas).",
      "Javob qisqa bo'lishi mumkin — savoldagi yordamchi fe'lni takrorlab: \"Do you like tea? — Yes, I do. / No, I don't.\" \"Does he play football? — Yes, he does. / No, he doesn't.\"",
      "\"To be\" fe'li bilan savol boshqacha yasaladi — \"do/does\" kerak emas, \"to be\"ning o'zi ega bilan joy almashadi: \"Is she a doctor?\" (\"Does she is a doctor?\" emas). Ikkalasini farqlashni yodda tuting."
    ],
    "examples": [
      {
        "en": "Does your sister work here?",
        "uz": "Opangiz shu yerda ishlaydimi?"
      },
      {
        "en": "Do you speak Russian?",
        "uz": "Ruscha gapirasizmi?"
      },
      {
        "en": "Does he play the guitar?",
        "uz": "U gitara chaladimi?"
      },
      {
        "en": "Do they usually walk to school?",
        "uz": "Ular odatda maktabga piyoda boradimi?"
      },
      {
        "en": "What time does the shop close?",
        "uz": "Do'kon soat nechada yopiladi?"
      },
      {
        "en": "Do we need a ticket for this museum?",
        "uz": "Bu muzey uchun bizga chipta kerakmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "Does she works on Saturdays?",
        "right": "Does she work on Saturdays?",
        "note": "\"Does\" kelgach asosiy fe'l -s siz qoladi."
      },
      {
        "wrong": "Do he like tea?",
        "right": "Does he like tea?",
        "note": "He/she/it bilan \"do\" emas, \"does\" ishlatiladi."
      },
      {
        "wrong": "Does you have a car?",
        "right": "Do you have a car?",
        "note": "\"You\" bilan doim \"do\" ishlatiladi, \"does\" emas."
      }
    ],
    "quiz": [
      {
        "q": "___ you like pizza?",
        "options": [
          "Do",
          "Does",
          "Are",
          "Is"
        ],
        "answer": 0
      },
      {
        "q": "___ your brother play chess?",
        "options": [
          "Do",
          "Does",
          "Is",
          "Are"
        ],
        "answer": 1
      },
      {
        "q": "___ they work at the same company?",
        "options": [
          "Does",
          "Is",
          "Do",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "What time ___ the train arrive?",
        "options": [
          "do",
          "does",
          "is",
          "are"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi savol TO'G'RI?",
        "options": [
          "Does she works late?",
          "Do she work late?",
          "Does she work late?",
          "Is she works late?"
        ],
        "answer": 2
      }
    ]
  },
  "present-continuous-questions": {
    "explanation": [
      "Hozir sodir bo'layotgan harakat haqida savol berish uchun \"to be\" (am/is/are) egadan OLDINGA chiqariladi, fe'l esa -ing shaklida joyida qoladi: \"They are waiting\" gapi \"Are they waiting?\" savoliga aylanadi.",
      "Shaxsga qarab to'g'ri \"to be\" shaklini tanlash muhim: I bilan — Am, he/she/it bilan — Is, you/we/they bilan — Are: \"Am I doing this right?\", \"Is he sleeping?\", \"Are we losing?\"",
      "Wh-savollarda so'roq so'zi (what, where, why) eng boshda, undan keyin \"to be\", keyin ega, keyin -ing fe'l keladi: \"What are you doing?\", \"Why is she crying?\"",
      "Qisqa javob ham xuddi shu \"to be\" fe'lini takrorlaydi: \"Are you listening? — Yes, I am. / No, I'm not.\" \"Is it raining? — Yes, it is. / No, it isn't.\""
    ],
    "examples": [
      {
        "en": "Are they waiting outside?",
        "uz": "Ular tashqarida kutishyaptimi?"
      },
      {
        "en": "Is your brother sleeping right now?",
        "uz": "Akangiz hozir uxlayaptimi?"
      },
      {
        "en": "What are you doing this weekend?",
        "uz": "Bu hafta oxirida nima qilyapsiz?"
      },
      {
        "en": "Why is the baby crying?",
        "uz": "Chaqaloq nega yig'layapti?"
      },
      {
        "en": "Am I speaking too fast for you?",
        "uz": "Men siz uchun juda tez gapiryapmanmi?"
      },
      {
        "en": "Are we still meeting at six?",
        "uz": "Biz hali ham soat oltida uchrashyapmizmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "Is you coming to the party?",
        "right": "Are you coming to the party?",
        "note": "\"You\" bilan \"is\" emas, \"are\" ishlatiladi."
      },
      {
        "wrong": "What you are doing?",
        "right": "What are you doing?",
        "note": "Savolda \"to be\" ega (you)dan OLDIN kelishi kerak."
      },
      {
        "wrong": "Does she working today?",
        "right": "Is she working today?",
        "note": "Present Continuous savolida \"does\" emas, \"to be\" (is/am/are) ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ she studying for the exam?",
        "options": [
          "Do",
          "Does",
          "Is",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "___ your parents watching the news?",
        "options": [
          "Is",
          "Are",
          "Do",
          "Does"
        ],
        "answer": 1
      },
      {
        "q": "What ___ you doing right now?",
        "options": [
          "is",
          "are",
          "do",
          "does"
        ],
        "answer": 1
      },
      {
        "q": "___ I disturbing you?",
        "options": [
          "Do",
          "Is",
          "Am",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi savol TO'G'RI?",
        "options": [
          "Is they leaving now?",
          "Do they leaving now?",
          "Are they leaving now?",
          "They are leaving now?"
        ],
        "answer": 2
      }
    ]
  },
  "question-words": {
    "explanation": [
      "Aniq ma'lumot so'rash uchun ingliz tilida maxsus so'roq so'zlari ishlatiladi: who (kim), what (nima), where (qayer), when (qachon), why (nega), how (qanday). Ular gapning eng boshida keladi.",
      "So'roq so'zidan keyin odatdagi savol tartibi davom etadi — yordamchi fe'l, keyin ega, keyin asosiy fe'l: \"Where do you live?\", \"When does the film start?\", \"Why are you laughing?\"",
      "\"Who\" ba'zan o'zi ega vazifasida keladi va bu holda savol tartibi o'zgarmaydi, \"do/does\" ham kerak bo'lmaydi: \"Who called you?\" (bu yerda \"who\"ning o'zi ega). Bu boshqa so'roq so'zlaridan farq qiladi.",
      "\"How\" boshqa so'zlar bilan birikib maxsus ma'no beradi: how much (qancha — sanalmaydigan narsalar uchun), how many (nechta — sanaladigan narsalar uchun), how often (qanchalik tez-tez), how long (qancha vaqt)."
    ],
    "examples": [
      {
        "en": "Where do you live?",
        "uz": "Siz qayerda yashaysiz?"
      },
      {
        "en": "What time does the meeting start?",
        "uz": "Uchrashuv soat nechada boshlanadi?"
      },
      {
        "en": "Who taught you English?",
        "uz": "Sizga ingliz tilini kim o'rgatgan?"
      },
      {
        "en": "Why are you so tired today?",
        "uz": "Nega bugun juda charchagansiz?"
      },
      {
        "en": "How many languages does she speak?",
        "uz": "U nechta til biladi?"
      },
      {
        "en": "How much does this jacket cost?",
        "uz": "Bu kurtka qancha turadi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "Where you live?",
        "right": "Where do you live?",
        "note": "So'roq so'zidan keyin yordamchi fe'l (do/does/is/are) tushirib qoldirilmaydi."
      },
      {
        "wrong": "What means this word?",
        "right": "What does this word mean?",
        "note": "To'g'ri savol tartibi — does + ega + asl fe'l."
      },
      {
        "wrong": "How much books do you have?",
        "right": "How many books do you have?",
        "note": "Sanaladigan otlar bilan \"how much\" emas, \"how many\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ is your birthday?",
        "options": [
          "Who",
          "When",
          "Why",
          "Whose"
        ],
        "answer": 1
      },
      {
        "q": "___ did you break the window?",
        "options": [
          "Who",
          "Whom",
          "Whose",
          "Who's"
        ],
        "answer": 0
      },
      {
        "q": "___ does this bus go to the airport?",
        "options": [
          "How often",
          "How much",
          "How many",
          "How long"
        ],
        "answer": 0
      },
      {
        "q": "___ sugar do you want in your tea?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How often"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi savol TO'G'RI?",
        "options": [
          "Where you are going?",
          "Where are you going?",
          "Where you going?",
          "Where going you?"
        ],
        "answer": 1
      }
    ]
  },
  "imperatives": {
    "explanation": [
      "Buyruq gaplari (imperative) biror ishni qilishni buyurish, iltimos qilish yoki ko'rsatma berish uchun ishlatiladi. Bunday gaplarda ega umuman aytilmaydi — gap to'g'ridan-to'g'ri fe'lning asl shaklidan boshlanadi: \"Sit down!\", \"Open the door.\"",
      "Inkor buyruq \"Don't\" bilan yasaladi, shaxsdan qat'i nazar doim \"don't\" ishlatiladi, \"doesn't\" emas: \"Don't touch that!\", \"Don't be late.\"",
      "Buyruqni yumshatish uchun \"please\" qo'shiladi — gap boshida yoki oxirida bo'lishi mumkin: \"Please close the window.\" / \"Close the window, please.\" \"Let's\" esa suhbatdoshni ham o'z ichiga olgan taklif uchun ishlatiladi: \"Let's go!\" (Ketdik, ikkovimiz ham).",
      "Imperativ gaplar yo'l ko'rsatishda, retseptlarda, xavfsizlik ogohlantirishlarida va sinf ichidagi ko'rsatmalarda juda ko'p uchraydi: \"Turn left.\", \"Add two eggs.\", \"Be careful!\", \"Open your books.\""
    ],
    "examples": [
      {
        "en": "Turn left at the bank.",
        "uz": "Bankning oldida chapga buriling."
      },
      {
        "en": "Please close the door.",
        "uz": "Iltimos, eshikni yoping."
      },
      {
        "en": "Don't be late for class.",
        "uz": "Darsga kechikmang."
      },
      {
        "en": "Let's have lunch together.",
        "uz": "Kelinglar, birga tushlik qilamiz."
      },
      {
        "en": "Be careful on the stairs.",
        "uz": "Zinapoyada ehtiyot bo'ling."
      },
      {
        "en": "Add some salt and stir well.",
        "uz": "Biroz tuz qo'shing va yaxshilab aralashtiring."
      }
    ],
    "mistakes": [
      {
        "wrong": "You close the door.",
        "right": "Close the door.",
        "note": "Buyruq gapida ega (\"you\") odatda aytilmaydi."
      },
      {
        "wrong": "Not open the window.",
        "right": "Don't open the window.",
        "note": "Buyruq gapining inkori \"not\" bilan emas, \"don't\" bilan yasaladi."
      },
      {
        "wrong": "Please to sit down.",
        "right": "Please sit down.",
        "note": "\"Please\"dan keyin \"to\" kerak emas — fe'l asl shaklda to'g'ridan-to'g'ri keladi."
      }
    ],
    "quiz": [
      {
        "q": "___ the window, please.",
        "options": [
          "You open",
          "Opening",
          "Open",
          "Opens"
        ],
        "answer": 2
      },
      {
        "q": "___ touch the wet paint!",
        "options": [
          "No",
          "Not",
          "Don't",
          "Doesn't"
        ],
        "answer": 2
      },
      {
        "q": "___ go to the cinema tonight.",
        "options": [
          "Let's",
          "Lets us",
          "We let's",
          "Let we"
        ],
        "answer": 0
      },
      {
        "q": "___ careful — the floor is wet!",
        "options": [
          "You be",
          "Being",
          "Be",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI buyruq gap?",
        "options": [
          "You be quiet, please.",
          "Please you are quiet.",
          "Please be quiet.",
          "Please being quiet."
        ],
        "answer": 2
      }
    ]
  },
  "some-any": {
    "explanation": [
      "\"Some\" va \"any\" — aniq son aytmasdan \"birozgina\" yoki \"bir nechta\" degan ma'noni bildiradi va ham sanaladigan ko'plik otlar (some books), ham sanalmaydigan otlar (some water) bilan ishlatiladi.",
      "\"Some\" — tasdiq gaplarda ishlatiladi: \"We need some water.\" \"Any\" esa — inkor va savol gaplarda ishlatiladi: \"We don't have any water.\" \"Do you have any water?\"",
      "Muhim istisno bor: taklif qilish yoki iltimos so'rashda savol gapda ham \"some\" ishlatiladi, \"any\" emas — chunki bu holatda javob \"ha\" bo'lishi kutiladi: \"Would you like some tea?\" (\"Would you like any tea?\" emas, chunki bu taklif, oddiy savol emas).",
      "\"Any\" tasdiq gapda ham ishlatilishi mumkin, lekin bu holda ma'nosi o'zgaradi — \"istalgan\" degan ma'no beradi: \"You can take any book from this shelf\" (istalgan kitobni oling, farqi yo'q)."
    ],
    "examples": [
      {
        "en": "We need some water for the plants.",
        "uz": "O'simliklar uchun bizga biroz suv kerak."
      },
      {
        "en": "I don't have any money with me right now.",
        "uz": "Hozir yonimda hech qanday pul yo'q."
      },
      {
        "en": "Are there any seats left for the concert?",
        "uz": "Kontsert uchun bo'sh o'rindiqlar qoldimi?"
      },
      {
        "en": "Would you like some coffee before the meeting?",
        "uz": "Uchrashuvdan oldin biroz qahva ichasizmi?"
      },
      {
        "en": "She bought some apples at the market.",
        "uz": "U bozordan biroz olma sotib oldi."
      },
      {
        "en": "You can ask any teacher in this school for help.",
        "uz": "Bu maktabdagi istalgan o'qituvchidan yordam so'rashingiz mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "I don't have some time today.",
        "right": "I don't have any time today.",
        "note": "Inkor gapda \"some\" emas, \"any\" ishlatiladi."
      },
      {
        "wrong": "Do you have some questions?",
        "right": "Do you have any questions?",
        "note": "Oddiy savolda \"some\" emas, \"any\" ishlatiladi — \"some\" faqat taklif yoki iltimosda savol gapga kiradi."
      },
      {
        "wrong": "We have any apples in the fridge.",
        "right": "We have some apples in the fridge.",
        "note": "Oddiy tasdiq gapda \"any\" emas, \"some\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "Can I have ___ sugar in my tea, please?",
        "options": [
          "some",
          "any",
          "a",
          "much"
        ],
        "answer": 0
      },
      {
        "q": "I didn't buy ___ bread this morning.",
        "options": [
          "some",
          "any",
          "a",
          "many"
        ],
        "answer": 1
      },
      {
        "q": "Is there ___ milk left in the bottle?",
        "options": [
          "some",
          "any",
          "a",
          "much"
        ],
        "answer": 1
      },
      {
        "q": "Would you like ___ juice?",
        "options": [
          "any",
          "some",
          "a",
          "much"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We don't have some bread.",
          "We don't have any bread.",
          "We have any bread.",
          "Do you have some bread?"
        ],
        "answer": 1
      }
    ]
  },
  "much-many-basics": {
    "explanation": [
      "\"Much\" va \"many\" miqdor haqida so'rashda yoki inkor gapda ishlatiladi, lekin ular otning turiga qarab tanlanadi: \"many\" — sanaladigan ko'plik otlar bilan (many chairs, many people), \"much\" — sanalmaydigan otlar bilan (much water, much time).",
      "Farqni bilishning oddiy yo'li: agar otni sanab bo'lsa (one chair, two chairs) — \"many\"; agar sanab bo'lmasa (bir suv, ikki suv deyilmaydi) — \"much\".",
      "So'zlashuv nutqida tasdiq gapda \"much/many\" o'rniga ko'pincha \"a lot of\" ishlatiladi, chunki \"much/many\" tasdiq gapda biroz rasmiy yoki noqulay eshitiladi: \"I have a lot of books\" tabiiyroq, \"I have many books\" ham to'g'ri, lekin kamroq ishlatiladi.",
      "Savol va inkor gapda esa \"much/many\" juda tabiiy va keng tarqalgan: \"How many chairs do we need?\", \"There isn't much time left.\""
    ],
    "examples": [
      {
        "en": "How many chairs do we need for the meeting?",
        "uz": "Uchrashuv uchun bizga nechta stul kerak?"
      },
      {
        "en": "There isn't much time left before the exam.",
        "uz": "Imtihongacha ko'p vaqt qolmadi."
      },
      {
        "en": "How much sugar do you want in your tea?",
        "uz": "Choyingizga qancha shakar solasiz?"
      },
      {
        "en": "I don't have many friends in this city yet.",
        "uz": "Bu shaharda hali ko'p do'stim yo'q."
      },
      {
        "en": "She doesn't drink much coffee during the week.",
        "uz": "U hafta davomida ko'p qahva ichmaydi."
      },
      {
        "en": "There were too many people at the station this morning.",
        "uz": "Bugun ertalab stansiyada juda ko'p odam bor edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "How much chairs do we need?",
        "right": "How many chairs do we need?",
        "note": "\"Chairs\" sanaladigan ko'plik ot — \"much\" emas, \"many\" ishlatiladi."
      },
      {
        "wrong": "I don't have much friends.",
        "right": "I don't have many friends.",
        "note": "\"Friends\" sanaladigan ot — \"much\" emas, \"many\" kerak."
      },
      {
        "wrong": "There isn't many water in the bottle.",
        "right": "There isn't much water in the bottle.",
        "note": "\"Water\" sanalmaydigan ot — \"many\" emas, \"much\" kerak."
      }
    ],
    "quiz": [
      {
        "q": "How ___ students are in your class?",
        "options": [
          "much",
          "many",
          "a lot",
          "any"
        ],
        "answer": 1
      },
      {
        "q": "We don't have ___ time before the train leaves.",
        "options": [
          "many",
          "much",
          "any",
          "some"
        ],
        "answer": 1
      },
      {
        "q": "How ___ money do you need for the trip?",
        "options": [
          "many",
          "much",
          "some",
          "any"
        ],
        "answer": 1
      },
      {
        "q": "There aren't ___ eggs left in the fridge.",
        "options": [
          "much",
          "many",
          "any",
          "much of"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi savol TO'G'RI?",
        "options": [
          "How much books do you have?",
          "How many books do you have?",
          "How much book do you have?",
          "How many book do you have?"
        ],
        "answer": 1
      }
    ]
  },
  "countable-uncountable-basics": {
    "explanation": [
      "Ingliz tilida otlar ikki turga bo'linadi: sanaladigan (countable — one apple, two apples) va sanalmaydigan (uncountable — water, advice, information). Sanalmaydigan otlar odatda yaxlit modda, tuyg'u yoki mavhum tushunchani bildiradi va ko'plik shaklga ega emas.",
      "Sanaladigan birlik ot doim artikl (a/an) yoki boshqa determiner (my, this, one) talab qiladi: \"a book\", \"my car\". Sanalmaydigan otlar esa yolg'iz, artiklsiz ishlatilishi mumkin: \"I need advice\" (\"I need an advice\" emas).",
      "Ba'zi so'zlar o'zbek tilida sanaladigandek tuyulsa ham, ingliz tilida sanalmaydi va shuning uchun ko'plik -s olmaydi: advice, information, furniture, news, luggage. Bularni miqdorda ko'rsatish uchun maxsus so'z qo'shiladi: \"a piece of advice\", \"a piece of furniture\", \"some information\".",
      "Sanalmaydigan otlar bilan \"much\" va \"a little\" ishlatiladi, sanaladigan ko'plik bilan esa \"many\" va \"a few\": \"much information\" / \"a few pieces of advice\"."
    ],
    "examples": [
      {
        "en": "Could I have some advice about this problem?",
        "uz": "Bu muammo bo'yicha menga biroz maslahat bera olasizmi?"
      },
      {
        "en": "I need to buy a new chair for my office.",
        "uz": "Ofisim uchun yangi stul sotib olishim kerak."
      },
      {
        "en": "We don't have much furniture in this room yet.",
        "uz": "Bu xonada hali unchalik mebel yo'q."
      },
      {
        "en": "She gave me some useful information about the visa.",
        "uz": "U menga viza haqida foydali ma'lumot berdi."
      },
      {
        "en": "I bought three books and a new bag yesterday.",
        "uz": "Kecha uch ta kitob va bitta yangi sumka sotib oldim."
      },
      {
        "en": "There is a lot of traffic on this road every morning.",
        "uz": "Bu yo'lda har kuni ertalab ko'p tirbandlik bo'ladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She gave me an advice.",
        "right": "She gave me some advice. / She gave me a piece of advice.",
        "note": "\"Advice\" sanalmaydigan ot — \"an\" bilan ishlatilmaydi."
      },
      {
        "wrong": "I bought two furnitures for my room.",
        "right": "I bought two pieces of furniture for my room.",
        "note": "\"Furniture\" ko'plik shakl olmaydi — miqdor \"piece of\" orqali ko'rsatiladi."
      },
      {
        "wrong": "We need more informations about the course.",
        "right": "We need more information about the course.",
        "note": "\"Information\" sanalmaydigan ot, ko'plik -s olmaydi."
      }
    ],
    "quiz": [
      {
        "q": "Could you give me some ___ about the hotel?",
        "options": [
          "information",
          "informations",
          "an information",
          "informations of"
        ],
        "answer": 0
      },
      {
        "q": "I need to buy ___ for my new flat.",
        "options": [
          "a furniture",
          "furnitures",
          "some furniture",
          "many furniture"
        ],
        "answer": 2
      },
      {
        "q": "She has ___ interesting book on her desk.",
        "options": [
          "some",
          "a",
          "any",
          "much"
        ],
        "answer": 1
      },
      {
        "q": "He gave us ___ good advice before the interview.",
        "options": [
          "a",
          "an",
          "some",
          "many"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I need an advice.",
          "I need advices.",
          "I need some advice.",
          "I need many advice."
        ],
        "answer": 2
      }
    ]
  },
  "frequency-adverbs-basics": {
    "explanation": [
      "Takroriylik ravishlari (always, usually, often, sometimes, rarely, never) biror harakat qanchalik tez-tez sodir bo'lishini bildiradi va odatlar haqida gapirganda Present Simple bilan birga ishlatiladi.",
      "Ma'no jihatdan darajasi: always (100%, doim) → usually (odatda) → often (tez-tez) → sometimes (ba'zan) → rarely/seldom (kamdan-kam) → never (0%, hech qachon).",
      "Bu ravishlar gapda maxsus o'rinni egallaydi: asosiy fe'ldan OLDIN keladi (\"She always wakes up early\"), lekin \"to be\" fe'lidan esa KEYIN keladi (\"She is always busy\", \"She always is busy\" emas).",
      "\"Never\" o'zida allaqachon inkor ma'nosini olib yuradi, shuning uchun uni \"don't/doesn't\" bilan birga ishlatib bo'lmaydi: \"I never eat meat\" to'g'ri, \"I don't never eat meat\" noto'g'ri (ikki marta inkor bo'lib qoladi)."
    ],
    "examples": [
      {
        "en": "I usually walk to work in the morning.",
        "uz": "Men odatda ishga piyoda boraman."
      },
      {
        "en": "She is always on time for meetings.",
        "uz": "U uchrashuvlarga doim vaqtida keladi."
      },
      {
        "en": "We sometimes eat out on Fridays.",
        "uz": "Biz ba'zan juma kunlari tashqarida ovqatlanamiz."
      },
      {
        "en": "He rarely watches television during the week.",
        "uz": "U hafta davomida televizor kamdan-kam ko'radi."
      },
      {
        "en": "They never miss their English classes.",
        "uz": "Ular ingliz tili darslarini hech qachon qoldirishmaydi."
      },
      {
        "en": "My parents often visit us on weekends.",
        "uz": "Ota-onam dam olish kunlari bizga tez-tez kelishadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I walk always to school.",
        "right": "I always walk to school.",
        "note": "Takroriylik ravishi asosiy fe'ldan oldin keladi, gap oxirida emas."
      },
      {
        "wrong": "She is busy always.",
        "right": "She is always busy.",
        "note": "\"To be\" fe'lidan keyin keladi, gap oxirida emas."
      },
      {
        "wrong": "He doesn't never eat fish.",
        "right": "He never eats fish.",
        "note": "\"Never\" o'zi inkorni bildiradi, \"don't/doesn't\" bilan birga ishlatilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "My sister ___ drinks coffee in the evening.",
        "options": [
          "never drinks",
          "drinks never",
          "doesn't never drink",
          "not drinks never"
        ],
        "answer": 0
      },
      {
        "q": "He ___ late for school.",
        "options": [
          "is usually",
          "usually is",
          "is being usually",
          "usually being"
        ],
        "answer": 0
      },
      {
        "q": "We ___ visit our grandparents in the village.",
        "options": [
          "sometimes",
          "are sometimes",
          "sometimes are",
          "being sometimes"
        ],
        "answer": 0
      },
      {
        "q": "She ___ tired after work.",
        "options": [
          "always is",
          "is always",
          "is being always",
          "always being"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I always am hungry in the morning.",
          "I am always hungry in the morning.",
          "I hungry am always in the morning.",
          "Always I am hungry in the morning."
        ],
        "answer": 1
      }
    ]
  },
  "comparatives-basics": {
    "explanation": [
      "Ikki narsa yoki odamni taqqoslash uchun sifatning qiyosiy darajasi ishlatiladi va undan keyin \"than\" (...dan) qo'shiladi: \"This route is shorter than the old one.\"",
      "Qisqa sifatlarga (bir bo'g'inli, ba'zan ikki bo'g'inli) -er qo'shiladi: short → shorter, tall → taller, big → bigger (undosh ikki barobar yoziladi), happy → happier (-y → -ier). Uzunroq sifatlar bilan esa sifat oldiga \"more\" qo'shiladi: expensive → more expensive, interesting → more interesting.",
      "Ba'zi sifatlarning qiyosiy shakli mutlaqo boshqacha (irregular) — bularni alohida yodlash kerak: good → better, bad → worse, far → farther/further.",
      "Ikki narsa TENG darajada bo'lsa, \"as...as\" ishlatiladi: \"This bag is as heavy as that one.\" Bu qiyosiy daraja (-er/more) bilan bir xil emas — u tenglikni, -er esa farqni bildiradi."
    ],
    "examples": [
      {
        "en": "This route is shorter than the old one.",
        "uz": "Bu yo'l eskisidan qisqaroq."
      },
      {
        "en": "My new phone is more expensive than my old one.",
        "uz": "Mening yangi telefonim eskisidan qimmatroq."
      },
      {
        "en": "She is taller than her older brother.",
        "uz": "U akasidan bo'yi baland."
      },
      {
        "en": "Today's weather is better than yesterday's.",
        "uz": "Bugungi ob-havo kechagisidan yaxshiroq."
      },
      {
        "en": "This exercise is more difficult than the last one.",
        "uz": "Bu mashq oxirgisidan qiyinroq."
      },
      {
        "en": "Her house is as big as mine.",
        "uz": "Uning uyi mening uyimdek katta."
      }
    ],
    "mistakes": [
      {
        "wrong": "This book is more good than that one.",
        "right": "This book is better than that one.",
        "note": "\"Good\"ning qiyosiy shakli \"more good\" emas, \"better\" — noregular shakl."
      },
      {
        "wrong": "She is more tall than me.",
        "right": "She is taller than me.",
        "note": "Qisqa sifatlarga \"more\" emas, -er qo'shiladi."
      },
      {
        "wrong": "This is more cheaper than that one.",
        "right": "This is cheaper than that one.",
        "note": "Bitta sifatga -er va \"more\"ni birga ishlatib bo'lmaydi — faqat bittasini tanlang."
      }
    ],
    "quiz": [
      {
        "q": "This car is ___ than that one.",
        "options": [
          "fast",
          "faster",
          "more fast",
          "fastest"
        ],
        "answer": 1
      },
      {
        "q": "My sister is ___ than me.",
        "options": [
          "intelligent",
          "more intelligent",
          "intelligenter",
          "most intelligent"
        ],
        "answer": 1
      },
      {
        "q": "Today is ___ than yesterday.",
        "options": [
          "hot",
          "hoter",
          "hotter",
          "more hot"
        ],
        "answer": 2
      },
      {
        "q": "This film is ___ than the book.",
        "options": [
          "good",
          "gooder",
          "better",
          "more good"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "This is more cheaper than that.",
          "This is cheaper than that.",
          "This is cheap than that.",
          "This is more cheap than that."
        ],
        "answer": 1
      }
    ]
  },
  "superlatives-basics": {
    "explanation": [
      "Orttirma daraja bir guruh ichida ENG YUQORI yoki ENG PAST darajani ko'rsatadi va deyarli doim \"the\" bilan ishlatiladi: \"It is the quietest room here.\"",
      "Qisqa sifatlarga -est qo'shiladi: quiet → quietest, tall → tallest, big → biggest. Uzunroq sifatlar bilan \"the most\" ishlatiladi: expensive → the most expensive, interesting → the most interesting.",
      "Qiyosiy darajadagi kabi ba'zi so'zlar noregular: good → the best, bad → the worst, far → the farthest/furthest. Bularni alohida yodlash kerak, formula bo'yicha yasab bo'lmaydi.",
      "Orttirma darajadan keyin ko'pincha guruhni ko'rsatuvchi \"in\" yoki \"of\" qo'shiladi: \"the tallest building in the city\", \"the best student of the class\"."
    ],
    "examples": [
      {
        "en": "It is the quietest room in this hotel.",
        "uz": "Bu — shu mehmonxonadagi eng tinch xona."
      },
      {
        "en": "She is the most talented singer in our school.",
        "uz": "U maktabimizdagi eng iqtidorli qo'shiqchi."
      },
      {
        "en": "This is the tallest building in the city.",
        "uz": "Bu — shahardagi eng baland bino."
      },
      {
        "en": "That was the best meal I have ever had.",
        "uz": "Bu men yegan eng mazali taom edi."
      },
      {
        "en": "He is the youngest player on the team.",
        "uz": "U jamoadagi eng yosh o'yinchi."
      },
      {
        "en": "This was the worst film of the year.",
        "uz": "Bu yilning eng yomon filmi edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "This is the most tall building.",
        "right": "This is the tallest building.",
        "note": "Qisqa sifat \"tall\"ga \"most\" emas, -est qo'shiladi."
      },
      {
        "wrong": "She is the goodest student.",
        "right": "She is the best student.",
        "note": "\"Good\"ning orttirma shakli \"goodest\" emas, \"the best\" — noregular shakl."
      },
      {
        "wrong": "It is quietest room in the hotel.",
        "right": "It is the quietest room in the hotel.",
        "note": "Orttirma daraja oldidan deyarli doim \"the\" qo'yiladi."
      }
    ],
    "quiz": [
      {
        "q": "This is ___ mountain in the country.",
        "options": [
          "high",
          "higher",
          "the highest",
          "more high"
        ],
        "answer": 2
      },
      {
        "q": "He is ___ boy in the class.",
        "options": [
          "the tallest",
          "taller",
          "tallest",
          "the taller"
        ],
        "answer": 0
      },
      {
        "q": "That was ___ day of my life.",
        "options": [
          "good",
          "better",
          "the best",
          "best"
        ],
        "answer": 2
      },
      {
        "q": "This is ___ restaurant in town.",
        "options": [
          "most expensive",
          "the most expensive",
          "more expensive",
          "expensiver"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She is most beautiful girl.",
          "She is the most beautiful girl.",
          "She is beautifulest girl.",
          "She is more beautiful girl."
        ],
        "answer": 1
      }
    ]
  },
  "past-simple-introduction": {
    "explanation": [
      "Past Simple tugagan, o'tgan zamonda sodir bo'lgan aniq voqealarni aytish uchun ishlatiladi, ko'pincha aniq vaqt belgisi bilan birga keladi: yesterday, last week, in 2020, two years ago.",
      "Regular (qoidali) fe'llarga -ed qo'shiladi: visit → visited, work → worked, study → studied (-y undoshdan keyin -ied ga aylanadi). Irregular (noregular) fe'llarning o'tgan zamon shakli esa mutlaqo boshqacha bo'lib, alohida yodlanadi: go → went, see → saw, have → had, eat → ate.",
      "Past Simple gapda fe'lning o'zi o'zgaradi (shaxsga qarab emas, hamma shaxs uchun bir xil shakl): \"I visited\", \"she visited\", \"they visited\" — barchasi bir xil.",
      "Inkor va savol gapda esa \"did\" yordamchi fe'li ishlatiladi, va bu holatda asosiy fe'l ASL shaklga qaytadi (o'tgan zamon qo'shimchasisiz): \"Did you visit Bukhara?\", \"I didn't visit Bukhara\" (\"didn't visited\" emas)."
    ],
    "examples": [
      {
        "en": "We visited Bukhara last spring.",
        "uz": "Biz o'tgan bahorda Buxoroga bordik."
      },
      {
        "en": "She studied English for three years in school.",
        "uz": "U maktabda uch yil ingliz tilini o'rgandi."
      },
      {
        "en": "They didn't watch the film last night.",
        "uz": "Ular kecha kechqurun filmni tomosha qilishmadi."
      },
      {
        "en": "Did you call your parents yesterday?",
        "uz": "Kecha ota-onangizga qo'ng'iroq qildingizmi?"
      },
      {
        "en": "He went to the market and bought some vegetables.",
        "uz": "U bozorga bordi va biroz sabzavot sotib oldi."
      },
      {
        "en": "I didn't have breakfast this morning.",
        "uz": "Men bugun ertalab nonushta qilmadim."
      }
    ],
    "mistakes": [
      {
        "wrong": "I visit Bukhara last year.",
        "right": "I visited Bukhara last year.",
        "note": "Aniq o'tgan vaqt (last year) bilan Present Simple emas, Past Simple ishlatiladi."
      },
      {
        "wrong": "She didn't studied yesterday.",
        "right": "She didn't study yesterday.",
        "note": "\"Didn't\" kelgach fe'l asl shaklga qaytadi, -ed qo'shimchasi olib tashlanadi."
      },
      {
        "wrong": "Did you went to school?",
        "right": "Did you go to school?",
        "note": "\"Did\" bilan savolda asosiy fe'l asl shaklda bo'ladi, o'tgan zamon shaklida emas."
      }
    ],
    "quiz": [
      {
        "q": "We ___ our grandparents last weekend.",
        "options": [
          "visit",
          "visited",
          "visits",
          "visiting"
        ],
        "answer": 1
      },
      {
        "q": "She ___ to the party yesterday.",
        "options": [
          "didn't went",
          "didn't go",
          "not went",
          "didn't goes"
        ],
        "answer": 1
      },
      {
        "q": "___ you finish your homework last night?",
        "options": [
          "Do",
          "Does",
          "Did",
          "Were"
        ],
        "answer": 2
      },
      {
        "q": "He ___ two books last month.",
        "options": [
          "read",
          "readed",
          "reads",
          "reading"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I didn't saw him.",
          "I didn't see him.",
          "I don't saw him.",
          "I not saw him."
        ],
        "answer": 1
      }
    ]
  },
  "was-were": {
    "explanation": [
      "\"To be\" fe'lining o'tgan zamon shakli ikkita: \"was\" va \"were\". Bu shakllar Present Simple'dagi \"am/is/are\"ning o'tgan zamon variantlari hisoblanadi.",
      "\"Was\" — I, he, she, it bilan ishlatiladi: \"I was tired\", \"He was at home\". \"Were\" — you, we, they bilan ishlatiladi: \"You were late\", \"They were happy\".",
      "Inkor uchun \"not\" qo'shiladi: wasn't, weren't. Savol uchun \"was/were\" egadan OLDINGA chiqadi: \"Was she at school yesterday?\", \"Were you at the party?\"",
      "\"There was/there were\" qurilishi biror narsaning o'tmishda mavjud bo'lganini bildiradi: \"There was a book on the table\" (birlik), \"There were many people at the concert\" (ko'plik) — bu yerda \"was/were\" tanlash otning birlik yoki ko'plik ekaniga bog'liq."
    ],
    "examples": [
      {
        "en": "The streets were quiet yesterday evening.",
        "uz": "Kecha kechqurun ko'chalar tinch edi."
      },
      {
        "en": "I was very tired after the long journey.",
        "uz": "Uzoq safardan keyin men juda charchagan edim."
      },
      {
        "en": "Were you at home last Sunday?",
        "uz": "O'tgan yakshanba kuni uyda edingizmi?"
      },
      {
        "en": "There were a lot of people at the wedding.",
        "uz": "To'yda juda ko'p odam bor edi."
      },
      {
        "en": "She wasn't happy with the results.",
        "uz": "U natijalardan xursand emas edi."
      },
      {
        "en": "We were students at the same university.",
        "uz": "Biz bir universitetda talaba edik."
      }
    ],
    "mistakes": [
      {
        "wrong": "You was late for the meeting.",
        "right": "You were late for the meeting.",
        "note": "\"You\" bilan doim \"were\" ishlatiladi, \"was\" emas."
      },
      {
        "wrong": "There was many students in the hall.",
        "right": "There were many students in the hall.",
        "note": "\"Students\" ko'plik ot — \"was\" emas, \"were\" ishlatiladi."
      },
      {
        "wrong": "He were at work yesterday.",
        "right": "He was at work yesterday.",
        "note": "\"He\" bilan \"were\" emas, \"was\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "They ___ at the cinema last night.",
        "options": [
          "was",
          "were",
          "is",
          "are"
        ],
        "answer": 1
      },
      {
        "q": "I ___ born in Tashkent.",
        "options": [
          "was",
          "were",
          "am",
          "is"
        ],
        "answer": 0
      },
      {
        "q": "___ your parents at home yesterday?",
        "options": [
          "Was",
          "Were",
          "Did",
          "Are"
        ],
        "answer": 1
      },
      {
        "q": "There ___ a big storm last night.",
        "options": [
          "was",
          "were",
          "is",
          "are"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We was at the park.",
          "We were at the park.",
          "We is at the park.",
          "We are at the park yesterday."
        ],
        "answer": 1
      }
    ]
  },
  "going-to-plans": {
    "explanation": [
      "\"Going to\" oldindan qilingan reja va niyatlar haqida gapirish uchun ishlatiladi — gapiruvchi bu qarorni gapirish paytidan OLDIN allaqachon qabul qilgan bo'ladi: \"I am going to study tonight\" (bu allaqachon rejalashtirilgan).",
      "Qurilishi: subject + am/is/are + going to + fe'lning asl shakli. Shaxsga qarab \"to be\" o'zgaradi: I am going to, she is going to, they are going to.",
      "\"Going to\" ko'pincha aniq dalil asosida qilingan bashoratlar uchun ham ishlatiladi — hozirgi vaziyatda kelajakda nima bo'lishi aniq ko'rinib turganda: \"Look at those dark clouds — it's going to rain\" (bulutlar dalil).",
      "Inkor va savolda \"to be\" fe'li bilan bir xil qoidalar amal qiladi: inkor uchun \"not\" qo'shiladi (isn't going to, aren't going to), savol uchun \"to be\" egadan oldinga chiqadi: \"Are you going to call her?\""
    ],
    "examples": [
      {
        "en": "I am going to study tonight for the exam.",
        "uz": "Bugun kechqurun imtihon uchun o'qishga o'tiraman."
      },
      {
        "en": "She is going to visit her parents this weekend.",
        "uz": "U bu hafta oxirida ota-onasinikiga boradi."
      },
      {
        "en": "We are going to buy a new car next month.",
        "uz": "Biz keyingi oy yangi mashina sotib olamiz."
      },
      {
        "en": "Look at those clouds — it is going to rain soon.",
        "uz": "Ana o'sha bulutlarga qarang — tez orada yomg'ir yog'adi."
      },
      {
        "en": "They aren't going to travel this summer.",
        "uz": "Ular bu yoz sayohat qilishmaydi."
      },
      {
        "en": "Are you going to attend the meeting tomorrow?",
        "uz": "Ertaga uchrashuvda qatnashasizmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "I going to study tonight.",
        "right": "I am going to study tonight.",
        "note": "\"Going to\"dan oldin \"to be\" (am/is/are) tushirib qoldirilmaydi."
      },
      {
        "wrong": "She is going study tonight.",
        "right": "She is going to study tonight.",
        "note": "\"Going\"dan keyin \"to\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "Are you going to visited her?",
        "right": "Are you going to visit her?",
        "note": "\"Going to\"dan keyin fe'l asl shaklda bo'ladi, o'tgan zamon shaklida emas."
      }
    ],
    "quiz": [
      {
        "q": "We ___ going to visit my grandmother tomorrow.",
        "options": [
          "is",
          "am",
          "are",
          "be"
        ],
        "answer": 2
      },
      {
        "q": "She ___ going to call you later.",
        "options": [
          "am",
          "is",
          "are",
          "be"
        ],
        "answer": 1
      },
      {
        "q": "Look at the sky — it ___ going to rain.",
        "options": [
          "am",
          "is",
          "are",
          "be"
        ],
        "answer": 1
      },
      {
        "q": "___ you going to join us for dinner?",
        "options": [
          "Do",
          "Is",
          "Are",
          "Does"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I going to travel next year.",
          "I am going travel next year.",
          "I am going to travel next year.",
          "I am go to travel next year."
        ],
        "answer": 2
      }
    ]
  },
  "basic-conjunctions": {
    "explanation": [
      "Bog'lovchilar ikki oddiy gapni yoki fikrni birlashtirishga yordam beradi. Eng asosiy to'rttasi: \"and\" (va — qo'shish), \"but\" (lekin — qarama-qarshilik), \"because\" (chunki — sabab), \"so\" (shuning uchun — natija).",
      "\"And\" ikki o'xshash yoki bog'liq fikrni qo'shadi: \"I like tea and coffee.\" \"But\" esa kutilmagan yoki qarama-qarshi fikrni ulaydi: \"I like tea, but I don't like coffee.\"",
      "\"Because\" sababni bildiradi va SABAB gapidan oldin keladi: \"I stayed home because it was raining\" (nega uyda qoldim — chunki yomg'ir yog'ayotgan edi). \"So\" esa NATIJANI bildiradi va sabab-natija tartibi \"because\"ga teskari: \"It was raining, so I stayed home\" (birinchi sabab, keyin natija).",
      "\"Because\" va \"so\"ni bir gapda BIRGA ishlatib bo'lmaydi, chunki ular bir xil mantiqiy bog'lanishni ikki marta ifodalab, ortiqcha bo'lib qoladi: \"Because it was raining, so I stayed home\" noto'g'ri — faqat bittasini tanlash kerak."
    ],
    "examples": [
      {
        "en": "I stayed home because it was raining.",
        "uz": "Yomg'ir yog'ayotgani uchun uyda qoldim."
      },
      {
        "en": "She likes tea and coffee.",
        "uz": "U choy va qahvani yoqtiradi."
      },
      {
        "en": "He wanted to go out, but he was too tired.",
        "uz": "U tashqariga chiqmoqchi edi, lekin juda charchagan edi."
      },
      {
        "en": "It was raining, so we stayed home.",
        "uz": "Yomg'ir yog'ayotgan edi, shuning uchun uyda qoldik."
      },
      {
        "en": "I called him, but he didn't answer.",
        "uz": "Men unga qo'ng'iroq qildim, lekin u javob bermadi."
      },
      {
        "en": "She was tired because she worked all day.",
        "uz": "U kun bo'yi ishlagani uchun charchagan edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Because it was cold, so I wore a coat.",
        "right": "Because it was cold, I wore a coat. / It was cold, so I wore a coat.",
        "note": "\"Because\" va \"so\" bir gapda birga ishlatilmaydi — faqat bittasi tanlanadi."
      },
      {
        "wrong": "I like tea but coffee.",
        "right": "I like tea and coffee.",
        "note": "Oddiy qo'shishda \"but\" emas, \"and\" ishlatiladi."
      },
      {
        "wrong": "I was tired so I didn't sleep well.",
        "right": "I was tired, but I didn't sleep well. / I was tired, so I went to bed early.",
        "note": "\"So\" natijani, \"but\" qarama-qarshilikni bildiradi — mantiqqa mos bog'lovchi tanlanishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "I wanted to go, ___ it was too late.",
        "options": [
          "and",
          "but",
          "because",
          "so"
        ],
        "answer": 1
      },
      {
        "q": "She missed the bus ___ she woke up late.",
        "options": [
          "and",
          "but",
          "because",
          "so"
        ],
        "answer": 2
      },
      {
        "q": "He was hungry, ___ he made some food.",
        "options": [
          "but",
          "because",
          "so",
          "and"
        ],
        "answer": 2
      },
      {
        "q": "I like apples ___ oranges.",
        "options": [
          "but",
          "because",
          "so",
          "and"
        ],
        "answer": 3
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Because I was tired, so I slept early.",
          "I was tired, so I slept early.",
          "So I was tired, I slept early.",
          "I was tired so because I slept early."
        ],
        "answer": 1
      }
    ]
  },
  "present-simple-vs-continuous": {
    "explanation": [
      "Present Simple doimiy, takrorlanuvchi odatlar va umumiy faktlar uchun ishlatiladi: \"I work in a bank\" (doimiy ish). Present Continuous esa aynan HOZIR, gapirish paytida davom etayotgan yoki vaqtinchalik harakat uchun ishlatiladi: \"I am working from home this week\" (faqat shu hafta, doimiy emas).",
      "Present Simple bilan odatiy vaqt belgilari keladi: usually, every day, on Mondays. Present Continuous bilan esa: now, at the moment, this week, these days — bularning barchasi \"vaqtinchalik\" degan ma'noni bildiradi.",
      "Ba'zi fe'llar (state verbs) — his-tuyg'u, fikr, egalikni bildiruvchi fe'llar (know, believe, want, love, own) — odatda Continuous shaklda ishlatilmaydi, hatto hozirgi paytda gapirilsa ham: \"I know the answer\" to'g'ri, \"I am knowing the answer\" noto'g'ri.",
      "Ikkalasini bir gapda solishtirish orqali farq yanada aniq bo'ladi: \"I usually take the bus, but today I am walking\" (odatda avtobusda boraman, lekin bugun piyoda ketyapman)."
    ],
    "examples": [
      {
        "en": "I am working from home this week.",
        "uz": "Men bu hafta uydan turib ishlayapman."
      },
      {
        "en": "She usually takes the bus to work.",
        "uz": "U odatda ishga avtobusda boradi."
      },
      {
        "en": "Look! It is raining outside.",
        "uz": "Qarang! Tashqarida yomg'ir yog'yapti."
      },
      {
        "en": "He works as an engineer at a construction company.",
        "uz": "U qurilish kompaniyasida muhandis bo'lib ishlaydi."
      },
      {
        "en": "We are staying at a hotel near the airport this weekend.",
        "uz": "Biz bu hafta oxirida aeroport yaqinidagi mehmonxonada turibmiz."
      },
      {
        "en": "I know this street very well.",
        "uz": "Men bu ko'chani juda yaxshi bilaman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I am knowing the answer.",
        "right": "I know the answer.",
        "note": "\"Know\" his-bilim fe'li — Continuous shaklda ishlatilmaydi."
      },
      {
        "wrong": "She works from home this week.",
        "right": "She is working from home this week.",
        "note": "\"This week\" vaqtinchalik holatni bildiradi — Present Continuous kerak, Simple emas."
      },
      {
        "wrong": "Look, it rains!",
        "right": "Look, it is raining!",
        "note": "Hozir sodir bo'layotgan harakatda Present Simple emas, Present Continuous ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "She ___ to the gym every morning.",
        "options": [
          "goes",
          "is going",
          "go",
          "going"
        ],
        "answer": 0
      },
      {
        "q": "Right now, he ___ a report for his manager.",
        "options": [
          "writes",
          "is writing",
          "write",
          "writing"
        ],
        "answer": 1
      },
      {
        "q": "I ___ this song — who is singing it?",
        "options": [
          "don't know",
          "am not knowing",
          "not know",
          "doesn't know"
        ],
        "answer": 0
      },
      {
        "q": "We ___ at my cousin's flat while ours is being repaired.",
        "options": [
          "stay",
          "are staying",
          "stays",
          "staying"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I am understanding you.",
          "I understand you.",
          "I do understanding you.",
          "I understanding you."
        ],
        "answer": 1
      }
    ]
  },
  "past-continuous-a2": {
    "explanation": [
      "Past Continuous o'tgan paytda MA'LUM BIR MOMENTDA davom etayotgan harakatni tasvirlaydi: \"They were having dinner at eight\" (soat sakkizda ovqatlanish jarayoni davom etayotgan edi).",
      "Qurilishi: subject + was/were + fe'l-ing. I/he/she/it bilan \"was\", you/we/they bilan \"were\" ishlatiladi — xuddi oddiy \"was/were\" qoidasidagi kabi.",
      "Past Continuous ko'pincha aniq vaqt (\"at eight o'clock\") yoki boshqa bir o'tgan harakat (\"when the phone rang\") bilan birga ishlatilib, o'sha payt/harakat sodir bo'lganda NIMA DAVOM ETAYOTGANINI ko'rsatadi: \"I was cooking when the phone rang.\"",
      "Ikki uzun harakat bir vaqtda parallel davom etganda \"while\" bilan bog'lanadi: \"She was reading while I was cooking\" (ikkalamiz ham bir vaqtda davom etayotgan edik)."
    ],
    "examples": [
      {
        "en": "They were having dinner at eight o'clock.",
        "uz": "Ular soat sakkizda tushlik qilishyotgan edi."
      },
      {
        "en": "I was cooking when the phone rang.",
        "uz": "Telefon jiringlaganda men ovqat pishirayotgan edim."
      },
      {
        "en": "She was reading a book while I was cleaning the kitchen.",
        "uz": "Men oshxonani tozalayotganimda u kitob o'qiyotgan edi."
      },
      {
        "en": "What were you doing at nine last night?",
        "uz": "Kecha soat to'qqizda nima qilayotgan edingiz?"
      },
      {
        "en": "We were watching a film when the power went out.",
        "uz": "Elektr o'chib qolganda biz film tomosha qilayotgan edik."
      },
      {
        "en": "It was snowing heavily all morning.",
        "uz": "Ertalab bo'yi qattiq qor yog'ayotgan edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "They was having dinner at eight.",
        "right": "They were having dinner at eight.",
        "note": "\"They\" bilan \"was\" emas, \"were\" ishlatiladi."
      },
      {
        "wrong": "I was cook when he called.",
        "right": "I was cooking when he called.",
        "note": "Past Continuous'da fe'l -ing shaklida bo'lishi kerak."
      },
      {
        "wrong": "What you were doing last night?",
        "right": "What were you doing last night?",
        "note": "Savol tartibida \"were\" ega (\"you\")dan oldin kelishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "At six o'clock yesterday, I ___ dinner.",
        "options": [
          "cooked",
          "was cooking",
          "cook",
          "cooking"
        ],
        "answer": 1
      },
      {
        "q": "___ you sleeping when I called?",
        "options": [
          "Did",
          "Was",
          "Were",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "She ___ a shower when the doorbell rang.",
        "options": [
          "was taking",
          "took",
          "take",
          "is taking"
        ],
        "answer": 0
      },
      {
        "q": "We ___ football when it started to rain.",
        "options": [
          "were playing",
          "play",
          "played",
          "playing"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He were sleeping at midnight.",
          "He was sleeping at midnight.",
          "He is sleeping at midnight yesterday.",
          "He sleeping at midnight."
        ],
        "answer": 1
      }
    ]
  },
  "past-simple-vs-continuous": {
    "explanation": [
      "Bu ikki zamon ko'pincha bitta gapda birga ishlatiladi: Past Continuous UZUN, fon harakatini ko'rsatadi, Past Simple esa uni bo'lib kirgan QISQA voqeani ko'rsatadi: \"I was walking when it started to rain\" (uzoq davom etgan yurish — fon; yomg'ir boshlanishi — qisqa, kutilmagan voqea).",
      "Bog'lovchi so'zlar ham yordam beradi: \"while\" odatda Continuous fe'l bilan (fon harakati), \"when\" esa ko'pincha Simple fe'l bilan (aniq, qisqa voqea) ishlatiladi: \"While I was walking, it started to rain\" = \"It started to rain when I was walking.\"",
      "Agar ikkala harakat ham qisqa va ketma-ket bo'lsa (birinchi tugagach ikkinchisi boshlangan bo'lsa), ikkalasi ham Past Simple'da bo'ladi: \"I finished my homework and went to bed\" (Continuous kerak emas, chunki fon yo'q).",
      "Farqni chalkashtirish gapning ma'nosini o'zgartiradi: \"When she arrived, I cooked dinner\" (u kelgach men pishira boshladim) bilan \"When she arrived, I was cooking dinner\" (u kelganda men allaqachon pishirayotgan edim) — ma'no butunlay boshqa."
    ],
    "examples": [
      {
        "en": "I was walking home when it started to rain.",
        "uz": "Uyga piyoda ketayotganimda yomg'ir yog'a boshladi."
      },
      {
        "en": "While she was studying, her brother was watching TV.",
        "uz": "U dars tayyorlayotganda akasi televizor ko'rayotgan edi."
      },
      {
        "en": "When the alarm rang, I was still sleeping.",
        "uz": "Signal jiringlaganda men hali uxlayotgan edim."
      },
      {
        "en": "I finished my homework and went to bed early.",
        "uz": "Uy vazifamni tugatib, erta yotdim."
      },
      {
        "en": "She was cooking dinner when the guests arrived.",
        "uz": "Mehmonlar kelganda u kechki ovqat pishirayotgan edi."
      },
      {
        "en": "He broke his leg while he was skiing in the mountains.",
        "uz": "U tog'da chang'i uchayotganda oyog'ini sindirib oldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I walked home when it was starting to rain.",
        "right": "I was walking home when it started to rain.",
        "note": "Uzoq fon harakat Continuous'da, uni bo'lib kirgan qisqa voqea Simple'da bo'lishi kerak."
      },
      {
        "wrong": "While I was cook, she called me.",
        "right": "While I was cooking, she called me.",
        "note": "\"While\"dan keyin fe'l -ing shaklida bo'lishi kerak."
      },
      {
        "wrong": "When she was arriving, I was already there.",
        "right": "When she arrived, I was already there.",
        "note": "Qisqa, bir martalik voqea (kelish) Past Simple'da bo'lishi kerak, Continuous emas."
      }
    ],
    "quiz": [
      {
        "q": "I ___ TV when the lights went out.",
        "options": [
          "watched",
          "was watching",
          "watch",
          "watches"
        ],
        "answer": 1
      },
      {
        "q": "While he ___ dinner, I set the table.",
        "options": [
          "cooked",
          "was cooking",
          "cooks",
          "cook"
        ],
        "answer": 1
      },
      {
        "q": "She ___ her keys and left the house.",
        "options": [
          "was finding",
          "found",
          "was finding again",
          "finds"
        ],
        "answer": 1
      },
      {
        "q": "We were having lunch when the phone ___.",
        "options": [
          "was ringing",
          "rang",
          "rings",
          "ring"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I was cooking when he was arriving.",
          "I cooked when he was arriving.",
          "I was cooking when he arrived.",
          "I cook when he arrived."
        ],
        "answer": 2
      }
    ]
  },
  "present-perfect-ever-never": {
    "explanation": [
      "Present Perfect \"ever\" (hech qachon, umuman) va \"never\" (hech qachon, inkor) bilan hayotiy tajriba haqida gapirish uchun ishlatiladi — QACHON sodir bo'lganini emas, balki bu tajriba BOR yoki YO'Q ekanini bildiradi: \"Have you ever tried kayaking?\" (aniq vaqt muhim emas, faqat tajriba bormi-yo'qmi).",
      "Qurilishi: have/has + ever/never + fe'lning III shakli (past participle). \"Ever\" faqat savol va inkor gapda ishlatiladi: \"Have you ever been to Paris?\" \"Never\" esa tasdiq gapda, o'zi inkorni bildiradi: \"I have never been to Paris.\"",
      "Agar aniq o'tgan vaqt aytilsa (yesterday, in 2019, last year), \"ever/never\" bilan Present Perfect emas, Past Simple ishlatiladi: \"I went to Paris in 2019\" (\"I have been to Paris in 2019\" emas, chunki aniq vaqt bor).",
      "Qisqa javob \"have/has\"ning o'zi bilan beriladi: \"Have you ever eaten sushi? — Yes, I have. / No, I never have.\""
    ],
    "examples": [
      {
        "en": "Have you ever tried kayaking?",
        "uz": "Hech kayak uchganmisiz?"
      },
      {
        "en": "I have never eaten Japanese food before.",
        "uz": "Men hech qachon yapon taomini yemaganman."
      },
      {
        "en": "Has she ever visited Europe?",
        "uz": "U hech Yevropaga borganmi?"
      },
      {
        "en": "This is the best film I have ever seen.",
        "uz": "Bu men ko'rgan eng yaxshi film."
      },
      {
        "en": "We have never had a problem with this company.",
        "uz": "Bizda bu kompaniya bilan hech qachon muammo bo'lmagan."
      },
      {
        "en": "Have your parents ever been to Uzbekistan?",
        "uz": "Ota-onangiz hech O'zbekistonga kelganmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "I have never went to Korea.",
        "right": "I have never been to Korea.",
        "note": "Present Perfect'da fe'lning III shakli (been) kerak, Past Simple shakli (went) emas."
      },
      {
        "wrong": "Have you ever went there?",
        "right": "Have you ever been there?",
        "note": "\"Have/has\"dan keyin fe'lning III shakli kerak, oddiy o'tgan zamon shakli emas."
      },
      {
        "wrong": "I have eaten sushi yesterday.",
        "right": "I ate sushi yesterday.",
        "note": "Aniq o'tgan vaqt (yesterday) bilan Present Perfect emas, Past Simple ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ you ever eaten octopus?",
        "options": [
          "Do",
          "Did",
          "Have",
          "Are"
        ],
        "answer": 2
      },
      {
        "q": "I have ___ been to Australia, but I'd love to go.",
        "options": [
          "ever",
          "never",
          "already",
          "yet"
        ],
        "answer": 1
      },
      {
        "q": "This is the most beautiful place I have ever ___.",
        "options": [
          "saw",
          "see",
          "seen",
          "seeing"
        ],
        "answer": 2
      },
      {
        "q": "___ your brother ever played chess?",
        "options": [
          "Has",
          "Have",
          "Did",
          "Does"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I have never went there.",
          "I have never been there.",
          "I never have been there.",
          "I have never being there."
        ],
        "answer": 1
      }
    ]
  },
  "present-perfect-just-already-yet": {
    "explanation": [
      "\"Just\", \"already\" va \"yet\" Present Perfect bilan ishlatilib, harakat qachon tugagani haqida qo'shimcha ma'lumot beradi, garchi aniq vaqt aytilmasa ham.",
      "\"Just\" — harakat YAQINDA, bir necha daqiqa oldin tugaganini bildiradi: \"She has just sent the email\" (hozirgina yubordi). U \"have/has\"dan keyin, fe'ldan oldin keladi.",
      "\"Already\" — harakat KUTILGANDAN OLDINROQ yoki taxmin qilinganidan tezroq tugaganini bildiradi va odatda tasdiq gapda ishlatiladi, \"just\"ga o'xshab \"have/has\"dan keyin keladi: \"She has already sent the email\" (kutganimdan oldinroq yuborib bo'ldi).",
      "\"Yet\" — harakat HALI tugamaganini (inkor gapda) yoki tugadimi-yo'qmi so'rashni (savolda) bildiradi va gap OXIRIDA keladi: \"She hasn't sent the email yet\" (hali yubormagan), \"Has she sent the email yet?\" (yuborib bo'ldimi hali?)."
    ],
    "examples": [
      {
        "en": "She has already sent the email to the client.",
        "uz": "U mijozga xatni allaqachon yuborib bo'lgan."
      },
      {
        "en": "I have just finished my homework.",
        "uz": "Men hozirgina uy vazifamni tugatdim."
      },
      {
        "en": "Have you finished your report yet?",
        "uz": "Hisobotingizni hali tugatdingizmi?"
      },
      {
        "en": "We haven't decided on a name for the baby yet.",
        "uz": "Chaqaloqqa hali ism tanlamadik."
      },
      {
        "en": "He has already left the office.",
        "uz": "U ofisdan allaqachon chiqib ketgan."
      },
      {
        "en": "The train has just arrived at the station.",
        "uz": "Poyezd hozirgina stansiyaga yetib keldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I have finished my homework already yet.",
        "right": "I have already finished my homework.",
        "note": "\"Already\" va \"yet\" bir gapda birga ishlatilmaydi — vaziyatga qarab faqat bittasi tanlanadi."
      },
      {
        "wrong": "She has sent yet the email.",
        "right": "She hasn't sent the email yet.",
        "note": "\"Yet\" odatda inkor gapda ishlatiladi va gap oxirida turadi."
      },
      {
        "wrong": "He has just leaved the office.",
        "right": "He has just left the office.",
        "note": "\"Leave\"ning III shakli \"leaved\" emas, \"left\" — noregular fe'l."
      }
    ],
    "quiz": [
      {
        "q": "I have ___ eaten, so I'm not hungry.",
        "options": [
          "yet",
          "already",
          "still",
          "ago"
        ],
        "answer": 1
      },
      {
        "q": "Has the film started ___?",
        "options": [
          "already",
          "just",
          "yet",
          "still"
        ],
        "answer": 2
      },
      {
        "q": "We have ___ arrived at the hotel.",
        "options": [
          "yet",
          "just",
          "still",
          "ago"
        ],
        "answer": 1
      },
      {
        "q": "She hasn't called me back ___.",
        "options": [
          "already",
          "just",
          "yet",
          "ever"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I have already finish my work.",
          "I have already finished my work.",
          "I already have finished my work yet.",
          "I finished already my work."
        ],
        "answer": 1
      }
    ]
  },
  "present-perfect-for-since": {
    "explanation": [
      "\"For\" va \"since\" ikkalasi ham davomiylikni bildiradi va Present Perfect bilan ishlatiladi, lekin turli ma'noda ishlatiladi va chalkashtirilmasligi kerak.",
      "\"For\" — DAVOMIYLIK MUDDATINI ko'rsatadi (qancha vaqt davomida): for two years, for a week, for a long time. \"Since\" esa — BOSHLANISH NUQTASINI ko'rsatadi (qachondan beri): since 2021, since Monday, since I was a child.",
      "Ikkalasi ham \"harakat o'tmishda boshlanib, hozirgacha davom etayotganini\" bildiradi: \"We have lived here for three years\" (uch yildan beri, davomiylik) = \"We have lived here since 2021\" (2021 yildan beri, boshlanish nuqtasi) — agar hozir 2024 bo'lsa, ikkalasi bir xil ma'noni beradi, faqat ifodalash usuli farq qiladi.",
      "Oddiy test: agar so'z \"qancha vaqt\" degan savolga javob bo'lsa — \"for\"; agar \"qachondan beri\" degan savolga javob bo'lsa — \"since\". \"Since\"dan keyin ko'pincha aniq sana yoki o'zi ham gap (clause) kelishi mumkin: \"since I graduated\"."
    ],
    "examples": [
      {
        "en": "We have lived here since 2021.",
        "uz": "Biz bu yerda 2021 yildan beri yashaymiz."
      },
      {
        "en": "I have known her for ten years.",
        "uz": "Men uni o'n yildan beri bilaman."
      },
      {
        "en": "She has worked at this company since she graduated.",
        "uz": "U bu kompaniyada bitirganidan beri ishlaydi."
      },
      {
        "en": "They have been married for six months.",
        "uz": "Ular olti oydan beri turmush qurgan."
      },
      {
        "en": "I haven't seen him since last summer.",
        "uz": "Men uni o'tgan yozdan beri ko'rmaganman."
      },
      {
        "en": "He has studied English for five years.",
        "uz": "U besh yildan beri ingliz tilini o'rganadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "We have lived here for 2021.",
        "right": "We have lived here since 2021.",
        "note": "Aniq boshlanish nuqtasi (sana) bilan \"for\" emas, \"since\" ishlatiladi."
      },
      {
        "wrong": "I have known her since ten years.",
        "right": "I have known her for ten years.",
        "note": "Davomiylik muddati bilan \"since\" emas, \"for\" ishlatiladi."
      },
      {
        "wrong": "She has worked here since three years.",
        "right": "She has worked here for three years.",
        "note": "\"Three years\" — muddat, shuning uchun \"for\" kerak, \"since\" emas."
      }
    ],
    "quiz": [
      {
        "q": "I have lived in this city ___ 2018.",
        "options": [
          "for",
          "since",
          "from",
          "during"
        ],
        "answer": 1
      },
      {
        "q": "She has been a doctor ___ ten years.",
        "options": [
          "since",
          "for",
          "from",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "We haven't met ___ your wedding.",
        "options": [
          "for",
          "since",
          "during",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "He has worked here ___ he left university.",
        "options": [
          "for",
          "since",
          "during",
          "from"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I have lived here since five years.",
          "I have lived here for five years.",
          "I have lived here for 2019.",
          "I have lived here from five years."
        ],
        "answer": 1
      }
    ]
  },
  "been-vs-gone": {
    "explanation": [
      "\"Been\" va \"gone\" ikkalasi ham \"go\" fe'lining Present Perfect'dagi III shakli sifatida ishlatiladi, lekin ma'nosi butunlay farq qiladi va bu — A2 darajasidagi eng nozik farqlardan biri.",
      "\"Has/have gone\" — kishi biror joyga ketgan va HALI O'SHA YERDA, hali qaytmagan: \"Nodira has gone to the pharmacy\" (hozir dorixonada, hali qaytmadi).",
      "\"Has/have been\" — kishi biror joyga borib, ALLAQACHON QAYTIB KELGAN (yoki umuman \"borib kelgan\" tajribasini bildiradi): \"Nodira has been to the pharmacy\" (borib qaytdi, hozir yana shu yerda).",
      "\"Been\" yana \"borgan/tashrif buyurgan\" degan umumiy tajriba ma'nosida ham ishlatiladi, ayniqsa \"ever\" bilan: \"Have you ever been to London?\" (Londonga borganmisiz — u yerda hozir emassiz, faqat tajriba haqida so'ralyapti)."
    ],
    "examples": [
      {
        "en": "Nodira has gone to the pharmacy.",
        "uz": "Nodira dorixonaga ketdi (hali qaytmagan)."
      },
      {
        "en": "Nodira has been to the pharmacy — she's back now.",
        "uz": "Nodira dorixonaga borib qaytdi — u hozir shu yerda."
      },
      {
        "en": "Have you ever been to London?",
        "uz": "Hech Londonga borganmisiz?"
      },
      {
        "en": "My father has gone to work; he'll be back at six.",
        "uz": "Otam ishga ketdi; u soat oltida qaytadi."
      },
      {
        "en": "We have been to that restaurant twice this month.",
        "uz": "Biz bu oyda o'sha restoranga ikki marta borib keldik."
      },
      {
        "en": "Where has she gone? I need to talk to her.",
        "uz": "U qayerga ketdi? Men u bilan gaplashishim kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "She has been to the shop; she'll be back soon.",
        "right": "She has gone to the shop; she'll be back soon.",
        "note": "Kishi hali qaytmagani uchun \"been\" emas, \"gone\" ishlatiladi."
      },
      {
        "wrong": "Have you ever gone to Paris?",
        "right": "Have you ever been to Paris?",
        "note": "Umumiy tajriba haqida so'raganda \"gone\" emas, \"been\" ishlatiladi."
      },
      {
        "wrong": "He has gone to Italy three times.",
        "right": "He has been to Italy three times.",
        "note": "Necha marta borib qaytgani (tajriba) haqida gapirilganda \"been\" ishlatiladi, \"gone\" emas."
      }
    ],
    "quiz": [
      {
        "q": "Where's Aziz? — He has ___ to the bank; he'll be back in ten minutes.",
        "options": [
          "been",
          "gone",
          "go",
          "going"
        ],
        "answer": 1
      },
      {
        "q": "I have ___ to Turkey twice — I love it there.",
        "options": [
          "gone",
          "been",
          "go",
          "went"
        ],
        "answer": 1
      },
      {
        "q": "She isn't here — she has ___ to the airport to pick up her sister.",
        "options": [
          "been",
          "gone",
          "go",
          "going"
        ],
        "answer": 1
      },
      {
        "q": "Have you ever ___ to a music festival?",
        "options": [
          "gone",
          "been",
          "go",
          "went"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (u hozir dorixonada, qaytmagan)?",
        "options": [
          "She has been to the pharmacy.",
          "She has gone to the pharmacy.",
          "She has go to the pharmacy.",
          "She has went to the pharmacy."
        ],
        "answer": 1
      }
    ]
  },
  "will-predictions": {
    "explanation": [
      "\"Will\" kelajak haqidagi ikki muhim vaziyatda ishlatiladi: (1) dalilga asoslanmagan, shaxsiy fikr-bashorat berishda, ko'pincha \"I think\", \"I believe\", \"probably\" bilan birga; (2) gapirish PAYTIDA, o'sha zahoti qabul qilingan qarorda.",
      "Bashorat uchun: \"I think prices will rise next year\" — bu shunchaki fikr, aniq dalil yoki reja emas (bu \"going to\"dan farqi, u aniq dalilga asoslanadi).",
      "Zudlik bilan qabul qilingan qaror uchun: masalan telefon jiringlaganda \"I'll answer it\" deymiz — bu oldindan rejalashtirilmagan, o'sha zahoti qaror qilingan.",
      "Qurilishi juda sodda va shaxsga qarab o'zgarmaydi: subject + will (yoki qisqartma 'll) + fe'lning asl shakli: \"She will call you tomorrow.\" Inkor — \"won't\": \"I won't be late.\""
    ],
    "examples": [
      {
        "en": "I think prices will rise next year.",
        "uz": "Menimcha, keyingi yil narxlar oshadi."
      },
      {
        "en": "The phone is ringing — I'll answer it.",
        "uz": "Telefon jiringlayapti — men javob beraman."
      },
      {
        "en": "I believe she will pass the exam easily.",
        "uz": "Ishonaman, u imtihondan osonlik bilan o'tadi."
      },
      {
        "en": "It probably won't rain tomorrow.",
        "uz": "Ehtimol, ertaga yomg'ir yog'maydi."
      },
      {
        "en": "Don't worry, I'll help you with the bags.",
        "uz": "Xavotir olmang, sumkalaringizga yordam beraman."
      },
      {
        "en": "In the future, more people will work from home.",
        "uz": "Kelajakda ko'proq odamlar uydan turib ishlaydi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I think it will rains tomorrow.",
        "right": "I think it will rain tomorrow.",
        "note": "\"Will\"dan keyin fe'l asl shaklda bo'ladi, -s qo'shilmaydi."
      },
      {
        "wrong": "I'm thinking she will passes the exam.",
        "right": "I think she will pass the exam.",
        "note": "\"Think\" bu holatda his-fikr fe'li, Continuous shaklda ishlatilmaydi."
      },
      {
        "wrong": "The phone rings — I go to answer it.",
        "right": "The phone is ringing — I'll answer it.",
        "note": "Zudlik bilan qabul qilingan qaror uchun \"will\" ishlatiladi, oddiy Present Simple emas."
      }
    ],
    "quiz": [
      {
        "q": "I think the weather ___ better tomorrow.",
        "options": [
          "will be",
          "is",
          "will being",
          "would be"
        ],
        "answer": 0
      },
      {
        "q": "Someone's at the door — I ___ get it.",
        "options": [
          "am going to",
          "'ll",
          "am",
          "do"
        ],
        "answer": 1
      },
      {
        "q": "In fifty years, most cars ___ electric.",
        "options": [
          "will be",
          "are",
          "is being",
          "would being"
        ],
        "answer": 0
      },
      {
        "q": "I'm tired. — I ___ make you some tea.",
        "options": [
          "'ll",
          "am",
          "do",
          "going"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I think it will rains.",
          "I think it will rain.",
          "I think it rains will.",
          "I think will it rain."
        ],
        "answer": 1
      }
    ]
  },
  "present-continuous-arrangements": {
    "explanation": [
      "Present Continuous nafaqat hozirgi paytda sodir bo'layotgan harakatni, balki YAQIN KELAJAKDA aniq vaqti va joyi allaqachon kelishilgan rejani ham bildiradi: \"We are meeting the client on Friday\" (kim bilan, qachon — allaqachon aniq).",
      "\"Going to\" bilan farqi: \"going to\" niyat/rejani bildiradi (\"I'm going to call the dentist\" — hali qo'ng'iroq qilmadim, faqat niyat), Present Continuous esa allaqachon TASHKIL ETILGAN, ikkinchi tomon bilan kelishilgan rejani bildiradi (\"I'm seeing the dentist at 3pm\" — vaqt band qilingan).",
      "Bu ma'noda deyarli doim aniq kelajak vaqt belgisi qo'shiladi: tomorrow, on Friday, next week, at six o'clock — vaqt belgisisiz gap oddiy \"hozir davom etayotgan harakat\" deb tushunilishi mumkin.",
      "Ko'proq shaxslar orasidagi rejalar (uchrashuv, sayohat, tadbir) uchun ishlatiladi, tabiat hodisalari (\"it's raining tomorrow\" kabi) uchun emas — ular \"going to\" yoki \"will\" bilan ifodalanadi."
    ],
    "examples": [
      {
        "en": "We are meeting the client on Friday afternoon.",
        "uz": "Biz mijoz bilan juma kuni tushdan keyin uchrashamiz."
      },
      {
        "en": "I am flying to Samarkand next Tuesday.",
        "uz": "Men keyingi seshanba kuni Samarqandga uchib ketaman."
      },
      {
        "en": "She is starting her new job on Monday.",
        "uz": "U dushanba kuni yangi ishini boshlaydi."
      },
      {
        "en": "They are getting married in September.",
        "uz": "Ular sentyabr oyida turmush qurishadi."
      },
      {
        "en": "We are having dinner with the Karimov family tonight.",
        "uz": "Biz bugun kechqurun Karimovlar oilasi bilan kechki ovqatlanamiz."
      },
      {
        "en": "I'm seeing the dentist at three o'clock tomorrow.",
        "uz": "Ertaga soat uchda tish shifokoriga boraman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I meet the client on Friday.",
        "right": "I am meeting the client on Friday.",
        "note": "Aniq kelishilgan kelajak reja Present Simple emas, Present Continuous bilan ifodalanadi."
      },
      {
        "wrong": "We are meeting the client on Friday maybe.",
        "right": "We might meet the client on Friday.",
        "note": "Present Continuous faqat ANIQ kelishilgan reja uchun ishlatiladi, noaniq ehtimol uchun emas — noaniqlikda modal fe'l kerak."
      },
      {
        "wrong": "She is starting new job Monday.",
        "right": "She is starting her new job on Monday.",
        "note": "Kunlar oldidan \"on\" predlogi va determiner (\"her\") tushirib qoldirilmasligi kerak."
      }
    ],
    "quiz": [
      {
        "q": "I ___ my parents this weekend — it's all arranged.",
        "options": [
          "visit",
          "am visiting",
          "will visiting",
          "visits"
        ],
        "answer": 1
      },
      {
        "q": "We ___ the Karimovs for dinner on Saturday.",
        "options": [
          "see",
          "are seeing",
          "seeing",
          "sees"
        ],
        "answer": 1
      },
      {
        "q": "She ___ university next September.",
        "options": [
          "starts",
          "is starting",
          "start",
          "starting"
        ],
        "answer": 1
      },
      {
        "q": "___ you doing anything special next weekend?",
        "options": [
          "Do",
          "Are",
          "Is",
          "Will"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (allaqachon aniq kelishilgan reja)?",
        "options": [
          "I meet my dentist tomorrow.",
          "I am meeting my dentist tomorrow at 3pm.",
          "I meeting my dentist tomorrow.",
          "I meet dentist tomorrow."
        ],
        "answer": 1
      }
    ]
  },
  "will-vs-going-to": {
    "explanation": [
      "\"Will\" va \"going to\" ikkalasi ham kelajak haqida gapiradi, lekin ular qanday qaror qabul qilingani bilan farqlanadi — bu A2 darajasidagi eng muhim ajratishlardan biri.",
      "\"Will\" — gapirish PAYTIDA, o'sha zahoti qabul qilingan spontan qaror uchun: \"Look at those clouds; it is going to rain\" emas — bu yerda aksincha, \"I'll take an umbrella\" (shu zahoti qaror qildim).",
      "\"Going to\" — OLDINDAN rejalashtirilgan niyat YOKI hozirgi aniq DALILGA asoslangan bashorat uchun: \"Look at those clouds; it's going to rain\" (bulutlar — aniq dalil, bashorat shunga asoslangan).",
      "Qisqa test: agar gapiruvchi qarorni HOZIR, shu lahzada qabul qilayotgan bo'lsa — \"will\"; agar qaror OLDIN qabul qilingan yoki hozirgi vaziyatdan aniq ko'rinib turgan bo'lsa — \"going to\"."
    ],
    "examples": [
      {
        "en": "Look at those clouds; it is going to rain.",
        "uz": "Ana o'sha bulutlarga qarang; yomg'ir yog'adi."
      },
      {
        "en": "I'm thirsty. — I'll get you some water.",
        "uz": "Chanqadim. — Senga suv olib kelaman."
      },
      {
        "en": "We are going to visit my parents next weekend.",
        "uz": "Biz keyingi hafta oxirida ota-onamnikiga boramiz."
      },
      {
        "en": "The phone is ringing — I'll get it.",
        "uz": "Telefon jiringlayapti — men javob beraman."
      },
      {
        "en": "She has bought the tickets; she is going to see the concert.",
        "uz": "U chiptalarni sotib oldi; u kontsertga boradi."
      },
      {
        "en": "I don't know the answer — I'll ask the teacher.",
        "uz": "Javobini bilmayman — o'qituvchidan so'rayman."
      }
    ],
    "mistakes": [
      {
        "wrong": "Look at those clouds; it will rain.",
        "right": "Look at those clouds; it is going to rain.",
        "note": "Ko'zga ko'rinib turgan dalilga asoslangan bashoratda \"will\" emas, \"going to\" ishlatiladi."
      },
      {
        "wrong": "The phone is ringing — I am going to answer it.",
        "right": "The phone is ringing — I'll answer it.",
        "note": "Shu zahoti qabul qilingan spontan qarorda \"going to\" emas, \"will\" ishlatiladi."
      },
      {
        "wrong": "She bought the tickets; she will see the concert.",
        "right": "She bought the tickets; she is going to see the concert.",
        "note": "Chiptalar oldindan sotib olingani — bu allaqachon rejalashtirilgan niyat, \"going to\" kerak."
      }
    ],
    "quiz": [
      {
        "q": "I'm cold. — I ___ close the window for you.",
        "options": [
          "am going to",
          "'ll",
          "am",
          "do"
        ],
        "answer": 1
      },
      {
        "q": "She has already booked the hotel; she ___ visit Rome in June.",
        "options": [
          "will",
          "is going to",
          "would",
          "does"
        ],
        "answer": 1
      },
      {
        "q": "Watch out! You ___ drop that glass!",
        "options": [
          "will",
          "are going to",
          "would",
          "do"
        ],
        "answer": 1
      },
      {
        "q": "I don't have any plans yet, but I think I ___ travel more this year.",
        "options": [
          "am going to",
          "will",
          "would",
          "do"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (aniq dalilga asoslangan bashorat)?",
        "options": [
          "Look, he will fall!",
          "Look, he is going to fall!",
          "Look, he falls!",
          "Look, he would fall!"
        ],
        "answer": 1
      }
    ]
  },
  "zero-conditional-a2": {
    "explanation": [
      "Zero Conditional doimiy faktlar, ilmiy qonuniyatlar va har doim to'g'ri bo'lgan natijalarni ifodalaydi — bu shart emas, balki haqiqat: \"If water reaches zero degrees, it freezes\" (bu har doim, istisnosiz to'g'ri).",
      "Qurilishi: If + Present Simple, Present Simple. Ikkala qismda ham Present Simple ishlatiladi, \"will\" umuman kerak emas, chunki gap kelajak haqida emas, balki umumiy qoida haqida.",
      "\"If\" o'rniga bu turdagi gapda ko'pincha \"when\" ham ishlatilishi mumkin, ma'no deyarli o'zgarmaydi, chunki natija HAR DOIM sodir bo'ladi: \"When water reaches zero, it freezes\" = \"If water reaches zero, it freezes.\"",
      "Zero Conditional ko'pincha ilmiy faktlar (suv qaynaydi, muzlaydi), kundalik qoidalar (\"If you heat ice, it melts\") va ba'zan buyruq/maslahat uchun ham ishlatiladi: \"If you feel tired, take a break.\""
    ],
    "examples": [
      {
        "en": "If water reaches zero degrees, it freezes.",
        "uz": "Agar suv nol darajaga yetsa, u muzlaydi."
      },
      {
        "en": "If you heat ice, it melts.",
        "uz": "Agar muzni qizdirsangiz, u eriydi."
      },
      {
        "en": "Plants die if they don't get enough water.",
        "uz": "O'simliklar yetarli suv olmasa, quriydi."
      },
      {
        "en": "If you mix blue and yellow, you get green.",
        "uz": "Agar ko'k va sariqni aralashtirsangiz, yashil rang hosil bo'ladi."
      },
      {
        "en": "People feel tired if they don't sleep enough.",
        "uz": "Odamlar yetarli uxlamasa, charchoq his qiladi."
      },
      {
        "en": "If it rains, the streets get wet.",
        "uz": "Yomg'ir yog'sa, ko'chalar ho'l bo'ladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "If water reaches zero, it will freeze.",
        "right": "If water reaches zero, it freezes.",
        "note": "Zero Conditional'da doimiy fakt haqida gapirilganda ikkala qismda ham Present Simple ishlatiladi, \"will\" emas."
      },
      {
        "wrong": "If you will heat ice, it melts.",
        "right": "If you heat ice, it melts.",
        "note": "\"If\" bandida \"will\" ishlatilmaydi, oddiy Present Simple yetarli."
      },
      {
        "wrong": "Plants dies if they don't get water.",
        "right": "Plants die if they don't get water.",
        "note": "\"Plants\" ko'plik ot — fe'lga -s qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "If you ___ ice, it melts.",
        "options": [
          "heat",
          "will heat",
          "heated",
          "heating"
        ],
        "answer": 0
      },
      {
        "q": "Water ___ at 100 degrees Celsius.",
        "options": [
          "will boil",
          "boils",
          "boiled",
          "boiling"
        ],
        "answer": 1
      },
      {
        "q": "If people don't sleep enough, they ___ tired.",
        "options": [
          "will feel",
          "feel",
          "felt",
          "feeling"
        ],
        "answer": 1
      },
      {
        "q": "If you mix red and white, you ___ pink.",
        "options": [
          "will get",
          "get",
          "got",
          "getting"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If it rains, the ground will get wet always.",
          "If it rains, the ground gets wet.",
          "If it will rain, the ground gets wet.",
          "If it rain, the ground gets wet."
        ],
        "answer": 1
      }
    ]
  },
  "first-conditional-a2": {
    "explanation": [
      "First Conditional kelajakda REAL, mumkin bo'lgan shart va uning natijasini ifodalaydi: \"If we leave now, we will catch the bus\" (ketishimiz ham, avtobusga ulgurishimiz ham hali sodir bo'lmagan, lekin haqiqatan mumkin).",
      "Qurilishi: If + Present Simple, will + fe'lning asl shakli. \"If\" bandida hech qachon \"will\" ishlatilmaydi, garchi ma'no kelajakka tegishli bo'lsa ham — bu eng ko'p uchraydigan xato.",
      "Zero Conditional'dan farqi: Zero Conditional HAR DOIM to'g'ri bo'lgan umumiy qoida (ikkala qismda Present Simple), First Conditional esa MA'LUM BIR holat uchun aniq, real kelajak natija (natija qismida \"will\").",
      "\"If\" bandi gap boshida ham, o'rtasida ham bo'lishi mumkin: boshida bo'lsa vergul qo'yiladi (\"If we leave now, we will catch the bus\"), o'rtada bo'lsa vergul kerak emas (\"We will catch the bus if we leave now\")."
    ],
    "examples": [
      {
        "en": "If we leave now, we will catch the bus.",
        "uz": "Agar hozir chiqsak, avtobusga ulgurib qolamiz."
      },
      {
        "en": "If it rains tomorrow, we will stay at home.",
        "uz": "Agar ertaga yomg'ir yog'sa, uyda qolamiz."
      },
      {
        "en": "She will be upset if you forget her birthday.",
        "uz": "Agar tug'ilgan kunini unutsangiz, u xafa bo'ladi."
      },
      {
        "en": "If you study hard, you will pass the exam.",
        "uz": "Agar qattiq tayyorlansangiz, imtihondan o'tasiz."
      },
      {
        "en": "We will miss the flight if we don't hurry.",
        "uz": "Agar shoshilmasak, parvozga ulgurmaymiz."
      },
      {
        "en": "If he calls, I will let you know.",
        "uz": "Agar u qo'ng'iroq qilsa, sizga xabar beraman."
      }
    ],
    "mistakes": [
      {
        "wrong": "If we will leave now, we will catch the bus.",
        "right": "If we leave now, we will catch the bus.",
        "note": "\"If\" bandida \"will\" ishlatilmaydi, faqat Present Simple."
      },
      {
        "wrong": "If it rains, we stay at home.",
        "right": "If it rains, we will stay at home.",
        "note": "Real kelajak natijani ifodalash uchun natija qismida \"will\" kerak, oddiy Present Simple emas (bu Zero Conditional bo'lib qoladi)."
      },
      {
        "wrong": "If you will study hard, you will pass.",
        "right": "If you study hard, you will pass.",
        "note": "\"If\" bandida \"will\" tushirib qoldiriladi."
      }
    ],
    "quiz": [
      {
        "q": "If it ___ tomorrow, we will cancel the picnic.",
        "options": [
          "will rain",
          "rains",
          "rained",
          "raining"
        ],
        "answer": 1
      },
      {
        "q": "If you ___ me the address, I will send the package.",
        "options": [
          "give",
          "will give",
          "gave",
          "giving"
        ],
        "answer": 0
      },
      {
        "q": "She ___ very happy if she gets the job.",
        "options": [
          "is",
          "will be",
          "was",
          "be"
        ],
        "answer": 1
      },
      {
        "q": "If we don't hurry, we ___ the train.",
        "options": [
          "miss",
          "will miss",
          "missed",
          "missing"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If you will call me, I will answer.",
          "If you call me, I will answer.",
          "If you call me, I answer.",
          "If you called me, I will answer."
        ],
        "answer": 1
      }
    ]
  },
  "must-vs-have-to": {
    "explanation": [
      "\"Must\" va \"have to\" ikkalasi ham majburiyatni bildiradi (\"kerak\", \"shart\"), lekin majburiyat QAYERDAN kelayotgani jihatidan farq qiladi — bu A2 darajasida eng nozik farqlardan biri.",
      "\"Must\" ko'pincha gapiruvchining O'ZINING shaxsiy fikri, qat'iy qarori yoki his-tuyg'usidan kelib chiqadigan majburiyatni bildiradi: \"I must call my mother\" (o'zim shunday his qilayapman, ichki majburiyat).",
      "\"Have to\" esa TASHQI qoida, qonun yoki boshqa birovning talabidan kelib chiqadigan majburiyatni bildiradi: \"Employees have to wear an ID card\" (bu kompaniyaning qoidasi, gapiruvchining shaxsiy fikri emas).",
      "So'zlashuv nutqida bu farq ko'pincha yo'qolib, ikkalasi almashtirilib ishlatiladi, lekin rasmiy va yozma matnlarda farqni saqlash muhim. \"Have to\" — \"do/does\" bilan savol va inkor yasaydi (odatdagi fe'l kabi), \"must\"ning esa \"do/does\" kerak emas."
    ],
    "examples": [
      {
        "en": "Employees have to wear an ID card at work.",
        "uz": "Xodimlar ishda identifikatsiya kartochkasini taqishi shart (kompaniya qoidasi)."
      },
      {
        "en": "I must call my mother tonight — I promised her.",
        "uz": "Bugun kechqurun onamga qo'ng'iroq qilishim kerak — va'da bergandim."
      },
      {
        "en": "You have to show your passport at the border.",
        "uz": "Chegarada pasportingizni ko'rsatishingiz shart."
      },
      {
        "en": "We must be more careful with our spending.",
        "uz": "Xarajatlarimizga ko'proq ehtiyot bo'lishimiz kerak."
      },
      {
        "en": "Do you have to work on Saturdays?",
        "uz": "Shanba kunlari ishlashingiz shartmi?"
      },
      {
        "en": "Students must submit their essays by Friday.",
        "uz": "Talabalar insholarini juma kunigacha topshirishlari shart."
      }
    ],
    "mistakes": [
      {
        "wrong": "Do you must work on Saturdays?",
        "right": "Do you have to work on Saturdays? / Must you work on Saturdays?",
        "note": "\"Must\" bilan \"do/does\" ishlatilmaydi — savol \"must\"ning o'zi bilan yoki \"have to\" bilan yasaladi."
      },
      {
        "wrong": "I have to to call my mother.",
        "right": "I have to call my mother.",
        "note": "\"Have to\"dan keyin yana \"to\" qo'shilmaydi, fe'l to'g'ridan-to'g'ri keladi."
      },
      {
        "wrong": "She musts finish the report today.",
        "right": "She must finish the report today.",
        "note": "\"Must\" barcha shaxslar bilan bir xil shaklda qoladi, -s qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "You ___ show your ID card to enter the building — it's the rule.",
        "options": [
          "must",
          "have to",
          "can",
          "may"
        ],
        "answer": 1
      },
      {
        "q": "I really ___ finish this book tonight — I promised myself.",
        "options": [
          "have to",
          "must",
          "can",
          "should to"
        ],
        "answer": 1
      },
      {
        "q": "___ you have to wear a uniform at your school?",
        "options": [
          "Must",
          "Do",
          "Are",
          "Is"
        ],
        "answer": 1
      },
      {
        "q": "She ___ leave early today — her flight is at six.",
        "options": [
          "musts",
          "must",
          "have to",
          "has"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Do you must work today?",
          "Must you to work today?",
          "Do you have to work today?",
          "You have must work today?"
        ],
        "answer": 2
      }
    ]
  },
  "mustnt-vs-dont-have-to": {
    "explanation": [
      "\"Mustn't\" va \"don't have to\" ikkalasi ham inkor shaklda bo'lsa-da, ma'nosi mutlaqo qarama-qarshi — bu A2 darajasidagi eng ko'p chalkashtiriladigan mavzulardan biri.",
      "\"Mustn't\" — TAQIQ, biror ishni qilish MAN ETILGANINI bildiradi: \"You mustn't park here\" (bu yerga to'xtash taqiqlangan, qonun buzilishi mumkin).",
      "\"Don't have to\" esa — ZARURAT YO'QLIGINI bildiradi, ish qilish MAJBURIY EMAS, lekin xohlasa qilsa ham bo'ladi: \"You don't have to come to the meeting\" (kelish shart emas, lekin taqiqlanmagan — xohlasa kelishi mumkin).",
      "Farqni tekshirish uchun oddiy savol: \"Bu ishni qilish taqiqlanganmi (mustn't) yoki shunchaki zarur emasmi (don't have to)?\" Bu ikki tushunchani chalkashtirish gapning ma'nosini butunlay teskarisiga aylantirib yuboradi."
    ],
    "examples": [
      {
        "en": "You mustn't park here — it's a fire exit.",
        "uz": "Bu yerga to'xtash mumkin emas — bu yong'in chiqish joyi."
      },
      {
        "en": "You don't have to bring anything to the party; we have everything.",
        "uz": "Ziyofatga hech narsa olib kelishingiz shart emas; bizda hammasi bor."
      },
      {
        "en": "Students mustn't use their phones during the exam.",
        "uz": "Talabalar imtihon davomida telefonlaridan foydalanishi mumkin emas."
      },
      {
        "en": "You don't have to answer if you don't want to.",
        "uz": "Agar xohlamasangiz, javob berishingiz shart emas."
      },
      {
        "en": "We mustn't be late for the interview.",
        "uz": "Suhbatga kechikishimiz mumkin emas."
      },
      {
        "en": "You don't have to finish it today — tomorrow is fine too.",
        "uz": "Buni bugun tugatishingiz shart emas — ertaga ham bo'laveradi."
      }
    ],
    "mistakes": [
      {
        "wrong": "You mustn't come if you're busy.",
        "right": "You don't have to come if you're busy.",
        "note": "Kelish shart emasligi (taqiq emas) haqida gapirilganda \"mustn't\" emas, \"don't have to\" ishlatiladi."
      },
      {
        "wrong": "You don't have to smoke here — it's forbidden.",
        "right": "You mustn't smoke here — it's forbidden.",
        "note": "Taqiq bildirilganda \"don't have to\" emas, \"mustn't\" ishlatiladi."
      },
      {
        "wrong": "I mustn't work tomorrow because it's a holiday.",
        "right": "I don't have to work tomorrow because it's a holiday.",
        "note": "Bayram kuni ishlash zarur emasligi taqiq emas — \"don't have to\" to'g'ri variant."
      }
    ],
    "quiz": [
      {
        "q": "You ___ touch that — the paint is still wet.",
        "options": [
          "mustn't",
          "don't have to",
          "doesn't have to",
          "not must"
        ],
        "answer": 0
      },
      {
        "q": "It's Sunday, so we ___ get up early.",
        "options": [
          "mustn't",
          "don't have to",
          "must",
          "doesn't have to"
        ],
        "answer": 1
      },
      {
        "q": "Passengers ___ smoke on this train — it's against the law.",
        "options": [
          "don't have to",
          "mustn't",
          "doesn't have to",
          "not have to"
        ],
        "answer": 1
      },
      {
        "q": "You ___ pay now — you can pay next week.",
        "options": [
          "mustn't",
          "don't have to",
          "must not",
          "shouldn't"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (kirish taqiqlangan)?",
        "options": [
          "Visitors don't have to enter this room.",
          "Visitors mustn't enter this room.",
          "Visitors have to enter this room.",
          "Visitors don't must enter this room."
        ],
        "answer": 1
      }
    ]
  },
  "may-might-possibility": {
    "explanation": [
      "\"May\" va \"might\" hozirgi yoki kelajakdagi NOANIQ EHTIMOLNI yumshoq tarzda ifodalaydi — gapiruvchi aniq bilmaydi, faqat taxmin qiladi: \"We might arrive a little late\" (aniq emas, ehtimol shunday bo'ladi).",
      "Ikkalasining ma'nosi juda yaqin, kundalik nutqda deyarli almashtirilib ishlatiladi, garchi \"might\" ba'zan \"may\"ga qaraganda biroz kamroq ishonchni bildirsa ham: \"It may rain\" va \"It might rain\" amalda bir xil ma'noni beradi.",
      "Qurilishi sodda: subject + may/might + fe'lning asl shakli, shaxsga qarab o'zgarmaydi: \"She may know the answer\", \"They might be at home.\" Inkor — \"may not\", \"might not\" (qisqartma shakl kam ishlatiladi).",
      "\"May\" yana rasmiy ruxsat so'rashda ham ishlatiladi (\"May I come in?\"), lekin bu darsda faqat EHTIMOLLIK ma'nosiga e'tibor qaratiladi, ruxsat ma'nosiga emas."
    ],
    "examples": [
      {
        "en": "We might arrive a little late because of the traffic.",
        "uz": "Tirbandlik tufayli biroz kech qolishimiz mumkin."
      },
      {
        "en": "She may know the answer — let's ask her.",
        "uz": "U javobni bilishi mumkin — undan so'raylik."
      },
      {
        "en": "It might rain later, so take an umbrella.",
        "uz": "Keyinroq yomg'ir yog'ishi mumkin, shuning uchun soyabon oling."
      },
      {
        "en": "He may not come to the party tonight.",
        "uz": "U bugun kechqurun ziyofatga kelmasligi mumkin."
      },
      {
        "en": "They might be stuck in traffic right now.",
        "uz": "Ular hozir tirbandlikda qolib ketgan bo'lishlari mumkin."
      },
      {
        "en": "I may need some help with this later.",
        "uz": "Menga keyinroq bu ish bilan biroz yordam kerak bo'lishi mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "She mays know the answer.",
        "right": "She may know the answer.",
        "note": "\"May/might\" barcha shaxslar bilan bir xil shaklda qoladi, -s qo'shilmaydi."
      },
      {
        "wrong": "It might to rain later.",
        "right": "It might rain later.",
        "note": "\"May/might\"dan keyin \"to\" qo'shilmaydi, fe'l to'g'ridan-to'g'ri asl shaklda keladi."
      },
      {
        "wrong": "He doesn't may come tonight.",
        "right": "He may not come tonight.",
        "note": "\"May/might\"ning inkori \"doesn't\" bilan emas, \"not\" qo'shish orqali yasaladi."
      }
    ],
    "quiz": [
      {
        "q": "I ___ go to the party — I haven't decided yet.",
        "options": [
          "might",
          "mights",
          "am might",
          "do might"
        ],
        "answer": 0
      },
      {
        "q": "She ___ be at home; her car isn't outside.",
        "options": [
          "might not",
          "not might",
          "doesn't might",
          "mightn't to"
        ],
        "answer": 0
      },
      {
        "q": "They ___ visit us next month, but it isn't certain.",
        "options": [
          "may",
          "mays",
          "is may",
          "does may"
        ],
        "answer": 0
      },
      {
        "q": "He ___ need extra time to finish the project.",
        "options": [
          "may",
          "mays",
          "is maying",
          "does may"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It mights rain tomorrow.",
          "It might rains tomorrow.",
          "It might rain tomorrow.",
          "It might to rain tomorrow."
        ],
        "answer": 2
      }
    ]
  },
  "infinitive-purpose": {
    "explanation": [
      "\"To + fe'l\" (to-infinitive) biror harakat NIMA MAQSADDA bajarilganini qisqa va tabiiy tarzda ifodalash uchun ishlatiladi — o'zbekchadagi \"...uchun\" degan ma'noni beradi: \"I called the office to ask a question\" (nima uchun qo'ng'iroq qildim — savol berish uchun).",
      "Bu qurilma \"in order to\"ning qisqaroq, kundalik so'zlashuvda ko'proq ishlatiladigan varianti hisoblanadi; ikkalasining ma'nosi bir xil, faqat \"in order to\" biroz rasmiyroq: \"I called to ask\" = \"I called in order to ask.\"",
      "Maqsad infinitivi gap boshida ham, oxirida ham kelishi mumkin: \"To pass the exam, she studied every night\" yoki \"She studied every night to pass the exam\" — ikkalasi ham to'g'ri, ma'no bir xil.",
      "Muhim: \"for\" bilan maqsad bildirish uchun undan keyin fe'l EMAS, ot yoki -ing keladi (\"a knife for cutting\"), agar fe'lni ishlatish kerak bo'lsa, \"for\" emas, \"to\" tanlanadi: \"I called for ask\" emas, \"I called to ask\" to'g'ri."
    ],
    "examples": [
      {
        "en": "I called the office to ask a question.",
        "uz": "Savol berish uchun ofisga qo'ng'iroq qildim."
      },
      {
        "en": "She went to the shop to buy some bread.",
        "uz": "U non sotib olish uchun do'konga bordi."
      },
      {
        "en": "We saved money to travel to Europe next year.",
        "uz": "Keyingi yil Yevropaga sayohat qilish uchun pul jamg'ardik."
      },
      {
        "en": "He turned on the light to read his book.",
        "uz": "U kitobini o'qish uchun chiroqni yoqdi."
      },
      {
        "en": "They came early to get good seats.",
        "uz": "Ular yaxshi o'rindiqlarni egallash uchun erta kelishdi."
      },
      {
        "en": "I need a pen to sign this document.",
        "uz": "Bu hujjatni imzolash uchun menga ruchka kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "I called the office for ask a question.",
        "right": "I called the office to ask a question.",
        "note": "Maqsadni fe'l bilan ifodalashda \"for\" emas, \"to\" ishlatiladi."
      },
      {
        "wrong": "She went to the shop for buying bread.",
        "right": "She went to the shop to buy bread. / She went to the shop for some bread.",
        "note": "\"For\"dan keyin fe'l -ing shaklida kelmaydi; maqsad uchun \"to + asl fe'l\" tanlanadi."
      },
      {
        "wrong": "I need a pen for sign this.",
        "right": "I need a pen to sign this.",
        "note": "\"For\"dan keyin fe'l kelmaydi — maqsad infinitivi uchun \"to\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "She turned off her phone ___ concentrate on her work.",
        "options": [
          "for",
          "to",
          "for to",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "I need scissors ___ cut this paper.",
        "options": [
          "for",
          "to",
          "for to",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "He is saving money ___ buy a new laptop.",
        "options": [
          "for",
          "to",
          "for to",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "We went to the market ___ some vegetables.",
        "options": [
          "to buy",
          "for buy",
          "for buying",
          "buying"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I called for ask about the room.",
          "I called to ask about the room.",
          "I called for asking about the room.",
          "I called ask about the room."
        ],
        "answer": 1
      }
    ]
  },
  "verb-plus-infinitive-a2": {
    "explanation": [
      "Ba'zi fe'llardan keyin ikkinchi fe'l to-infinitive (to + asl fe'l) shaklida keladi. Eng ko'p uchraydiganlari: want, need, decide, hope, plan, promise, learn, agree: \"They decided to wait outside.\"",
      "Bu fe'llarning aksariyati NIYAT, ISTAK yoki KELAJAKKA yo'naltirilgan qarorni bildiradi — shuning uchun ular ko'pincha hali sodir bo'lmagan, faqat rejalashtirilayotgan harakatga ulanadi: \"I want to travel\", \"She hopes to pass.\"",
      "Bu fe'llardan keyin gerund (-ing) ishlatib bo'lmaydi — bu keng tarqalgan xato: \"I want to go\" to'g'ri, \"I want going\" noto'g'ri.",
      "Ba'zan bu fe'llar bilan oraliqda ot/olmosh ham kelishi mumkin: \"want someone to do something\": \"I want you to help me\" (men SIZNI yordam berishingizni xohlayman)."
    ],
    "examples": [
      {
        "en": "They decided to wait outside for the bus.",
        "uz": "Ular avtobusni tashqarida kutishga qaror qilishdi."
      },
      {
        "en": "I want to travel around the world someday.",
        "uz": "Bir kun kelib dunyo bo'ylab sayohat qilishni xohlayman."
      },
      {
        "en": "She hopes to pass her driving test this month.",
        "uz": "U shu oy haydovchilik imtihonidan o'tishga umid qilyapti."
      },
      {
        "en": "We plan to visit our grandparents next weekend.",
        "uz": "Biz keyingi hafta oxirida buvi-bobomizni ko'rgani borishni rejalashtiryapmiz."
      },
      {
        "en": "He promised to call me as soon as he arrived.",
        "uz": "U yetib borgach menga qo'ng'iroq qilishga va'da berdi."
      },
      {
        "en": "I need to finish this report before Friday.",
        "uz": "Bu hisobotni jumagacha tugatishim kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "They decided waiting outside.",
        "right": "They decided to wait outside.",
        "note": "\"Decide\"dan keyin gerund emas, to-infinitive keladi."
      },
      {
        "wrong": "I want traveling around the world.",
        "right": "I want to travel around the world.",
        "note": "\"Want\"dan keyin -ing shakli emas, to-infinitive ishlatiladi."
      },
      {
        "wrong": "She hopes passing the test.",
        "right": "She hopes to pass the test.",
        "note": "\"Hope\"dan keyin to-infinitive keladi, gerund emas."
      }
    ],
    "quiz": [
      {
        "q": "We plan ___ Samarkand next summer.",
        "options": [
          "visiting",
          "to visit",
          "visit",
          "visited"
        ],
        "answer": 1
      },
      {
        "q": "He promised ___ me the money back next week.",
        "options": [
          "giving",
          "to give",
          "give",
          "gave"
        ],
        "answer": 1
      },
      {
        "q": "I need ___ this letter before I leave.",
        "options": [
          "sending",
          "to send",
          "send",
          "sent"
        ],
        "answer": 1
      },
      {
        "q": "She agreed ___ us with the project.",
        "options": [
          "helping",
          "to help",
          "help",
          "helped"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "They decided going home.",
          "They decided to go home.",
          "They decided go home.",
          "They decided goes home."
        ],
        "answer": 1
      }
    ]
  },
  "verb-plus-ing-a2": {
    "explanation": [
      "Ba'zi fe'llardan keyin ikkinchi fe'l gerund (-ing) shaklida keladi, to-infinitive emas. Eng ko'p uchraydiganlari: enjoy, finish, avoid, mind, suggest, practise, keep, imagine: \"She enjoys cooking for friends.\"",
      "Bu fe'llarning ko'pchiligi umumiy JARAYON yoki DAVOM ETAYOTGAN faoliyatga qaratilgan, kelajak niyatiga emas — shuning uchun ular gerund bilan tabiiy birikadi: \"finish cleaning\" (tozalash jarayonini tugatish), \"avoid arguing\" (bahslashishdan qochish).",
      "Bu fe'llardan keyin to-infinitive ishlatib bo'lmaydi: \"I enjoy swimming\" to'g'ri, \"I enjoy to swim\" noto'g'ri — bu \"verb + infinitive\" bilan eng ko'p chalkashtiriladigan mavzu.",
      "Ba'zi fe'llar (like, love, hate, start, begin, prefer) ikkala shaklni ham qabul qiladi, ma'no deyarli o'zgarmaydi: \"I like swimming\" = \"I like to swim\" — lekin bu darsdagi ro'yxatdagi fe'llar FAQAT gerund bilan ishlaydi."
    ],
    "examples": [
      {
        "en": "She enjoys cooking for her friends every weekend.",
        "uz": "U har hafta oxiri do'stlariga ovqat pishirishdan zavqlanadi."
      },
      {
        "en": "We finished painting the fence yesterday.",
        "uz": "Biz kecha panjarani bo'yashni tugatdik."
      },
      {
        "en": "He avoids eating sugar because of his health.",
        "uz": "U salomatligi tufayli shakar yeyishdan qochadi."
      },
      {
        "en": "Would you mind opening the window?",
        "uz": "Derazani ochib qo'ysangiz bo'ladimi (qarshi emasmisiz)?"
      },
      {
        "en": "The teacher suggested reading this book before the exam.",
        "uz": "O'qituvchi imtihondan oldin shu kitobni o'qishni tavsiya qildi."
      },
      {
        "en": "I keep forgetting his phone number.",
        "uz": "Uning telefon raqamini doim unutib qo'yaman."
      }
    ],
    "mistakes": [
      {
        "wrong": "She enjoys to cook for her friends.",
        "right": "She enjoys cooking for her friends.",
        "note": "\"Enjoy\"dan keyin to-infinitive emas, gerund (-ing) ishlatiladi."
      },
      {
        "wrong": "We finished to paint the fence.",
        "right": "We finished painting the fence.",
        "note": "\"Finish\"dan keyin faqat gerund keladi."
      },
      {
        "wrong": "He avoids to eat sugar.",
        "right": "He avoids eating sugar.",
        "note": "\"Avoid\"dan keyin to-infinitive emas, gerund ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "I really enjoy ___ new places.",
        "options": [
          "to visit",
          "visiting",
          "visit",
          "visits"
        ],
        "answer": 1
      },
      {
        "q": "Would you mind ___ the door?",
        "options": [
          "to close",
          "closing",
          "close",
          "closed"
        ],
        "answer": 1
      },
      {
        "q": "They finished ___ the report at midnight.",
        "options": [
          "to write",
          "writing",
          "write",
          "wrote"
        ],
        "answer": 1
      },
      {
        "q": "She suggested ___ a taxi instead of walking.",
        "options": [
          "to take",
          "taking",
          "take",
          "took"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He avoids to drink coffee.",
          "He avoids drinking coffee.",
          "He avoids drink coffee.",
          "He avoids drank coffee."
        ],
        "answer": 1
      }
    ]
  },
  "comparative-structures-a2": {
    "explanation": [
      "Qiyosiy daraja (comparative)ni kuchaytirish yoki yumshatish uchun oldiga qo'shimcha so'zlar qo'shiladi: \"much/a lot/far\" — katta farqni ko'rsatadi (much faster), \"a little/a bit/slightly\" — kichik farqni ko'rsatadi (a little faster).",
      "\"Much faster than\" — ikki narsa orasidagi katta farqni ta'kidlaydi: \"The train is much faster than the bus\" (farq katta, sezilarli). \"A little faster than\" esa — farq kichik, deyarli sezilmaydi: \"This route is a little shorter.\"",
      "Tenglikni bildirish uchun \"as...as\" ishlatiladi, va uni kuchaytirish yoki yumshatish uchun ham qo'shimcha so'zlar bor: \"just as fast as\" (aynan bir xil tezlikda), \"almost as fast as\" (deyarli bir xil, lekin unchalik emas), \"nearly as fast as\".",
      "\"Much/a lot/far\" faqat qiyosiy daraja (-er/more) bilan ishlatiladi, \"as...as\" bilan emas — bu ikki qurilma orasidagi kuchaytiruvchi so'zlar farq qiladi va ularni almashtirib ishlatib bo'lmaydi."
    ],
    "examples": [
      {
        "en": "The train is much faster than the bus.",
        "uz": "Poyezd avtobusdan ancha tezroq."
      },
      {
        "en": "This laptop is a little more expensive than that one.",
        "uz": "Bu noutbuk o'shanisidan biroz qimmatroq."
      },
      {
        "en": "She is almost as tall as her mother now.",
        "uz": "U hozir deyarli onasi qadar bo'yli."
      },
      {
        "en": "This exercise is far more difficult than the last one.",
        "uz": "Bu mashq oxirgisidan ancha qiyinroq."
      },
      {
        "en": "My new phone is slightly heavier than my old one.",
        "uz": "Yangi telefonim eskisidan biroz og'irroq."
      },
      {
        "en": "This year's harvest is just as good as last year's.",
        "uz": "Bu yilgi hosil o'tgan yilgi bilan xuddi bir xil yaxshi."
      }
    ],
    "mistakes": [
      {
        "wrong": "This bag is much as heavy as that one.",
        "right": "This bag is as heavy as that one. / This bag is much heavier than that one.",
        "note": "\"Much\" \"as...as\" bilan emas, faqat qiyosiy daraja (-er/more) bilan ishlatiladi."
      },
      {
        "wrong": "She is a little taller as her sister.",
        "right": "She is a little taller than her sister.",
        "note": "Qiyosiy daraja bilan \"as\" emas, \"than\" ishlatiladi."
      },
      {
        "wrong": "This is more much expensive than that.",
        "right": "This is much more expensive than that.",
        "note": "Kuchaytiruvchi so'z (much) \"more\"dan OLDIN keladi, undan keyin emas."
      }
    ],
    "quiz": [
      {
        "q": "This car is ___ than that one — almost double the price.",
        "options": [
          "a little expensive",
          "much more expensive",
          "as expensive",
          "expensive much"
        ],
        "answer": 1
      },
      {
        "q": "My brother is ___ taller than me — just one centimetre.",
        "options": [
          "much",
          "a little",
          "far",
          "a lot"
        ],
        "answer": 1
      },
      {
        "q": "This test was ___ as difficult as the last one — no real difference.",
        "options": [
          "much",
          "far",
          "just",
          "a lot"
        ],
        "answer": 2
      },
      {
        "q": "Her new flat is ___ bigger than her old one — twice the size!",
        "options": [
          "a bit",
          "slightly",
          "much",
          "a little"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "This is much as good as that.",
          "This is much better than that.",
          "This is more much better than that.",
          "This is much good than that."
        ],
        "answer": 1
      }
    ]
  },
  "so-such-basics": {
    "explanation": [
      "\"So\" va \"such\" gapga kuchli urg'u ('juda') qo'shadi, lekin ular boshqa-boshqa so'z turkumlariga bog'lanadi: \"so\" — faqat sifat yoki ravishdan oldin (ot bo'lmasa), \"such\" esa — ot birikmasidan (artikl + sifat + ot) oldin.",
      "\"So + sifat\": \"The film was so boring\" (ot yo'q, faqat sifat). \"Such + (a/an) + sifat + ot\": \"It was such a boring film\" (bu yerda \"film\" oti bor, shuning uchun \"such\" kerak).",
      "Ikkalasi ham deyarli bir xil ma'noni beradi, faqat qurilishi farq qiladi: \"It was so useful\" = \"It was such a useful lesson\" (ikkinchisida ot — \"lesson\" — qo'shilgan).",
      "Birlik sanaladigan ot bilan \"such\"dan keyin artikl (a/an) albatta qo'shiladi: \"such a good idea\". Ko'plik yoki sanalmaydigan ot bilan artikl kerak emas: \"such good ideas\", \"such useful advice\"."
    ],
    "examples": [
      {
        "en": "It was such a useful lesson that I took lots of notes.",
        "uz": "Bu shunchalik foydali dars ediki, men ko'p yozib oldim."
      },
      {
        "en": "The film was so boring that I fell asleep.",
        "uz": "Film shunchalik zerikarli ediki, men uxlab qoldim."
      },
      {
        "en": "They are such kind people; they always help everyone.",
        "uz": "Ular shunday mehribon odamlarki, doim hammaga yordam berishadi."
      },
      {
        "en": "The weather was so cold that we stayed inside.",
        "uz": "Ob-havo shunchalik sovuq ediki, biz uyda qoldik."
      },
      {
        "en": "It was such an interesting book that I read it in two days.",
        "uz": "Bu shunchalik qiziqarli kitob ediki, uni ikki kunda o'qib chiqdim."
      },
      {
        "en": "She speaks so clearly that everyone understands her easily.",
        "uz": "U shunchalik aniq gapiradiki, hamma uni osongina tushunadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "It was so useful lesson.",
        "right": "It was such a useful lesson.",
        "note": "\"So\"dan keyin ot kelmaydi — ot bo'lganda \"such (a/an)\" ishlatiladi."
      },
      {
        "wrong": "The lesson was such useful.",
        "right": "The lesson was so useful.",
        "note": "\"Such\"dan keyin faqat ot birikmasi keladi; ot bo'lmasa (faqat sifat) — \"so\" ishlatiladi."
      },
      {
        "wrong": "It was such interesting film.",
        "right": "It was such an interesting film.",
        "note": "\"Such\"dan keyin birlik sanaladigan ot bo'lsa, artikl (a/an) qo'shilishi shart."
      }
    ],
    "quiz": [
      {
        "q": "The music was ___ loud that we couldn't talk.",
        "options": [
          "so",
          "such",
          "such a",
          "too"
        ],
        "answer": 0
      },
      {
        "q": "We had ___ wonderful time at the beach.",
        "options": [
          "so",
          "such a",
          "such",
          "too"
        ],
        "answer": 1
      },
      {
        "q": "He is ___ generous — he always shares his lunch.",
        "options": [
          "so",
          "such",
          "such a",
          "too"
        ],
        "answer": 0
      },
      {
        "q": "It was ___ difficult exam that half the class failed.",
        "options": [
          "so",
          "such",
          "such a",
          "too"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It was so a great trip.",
          "It was such great trip.",
          "It was such a great trip.",
          "It was too a great trip."
        ],
        "answer": 2
      }
    ]
  },
  "relative-clauses-introduction": {
    "explanation": [
      "Relative clause (aniqlovchi ergash gap) ot haqida qo'shimcha ma'lumot berish uchun ishlatiladi va otdan keyin darhol keladi. Bu tuzilma ikki qisqa gapni bittaga birlashtirishga yordam beradi: \"The woman is a pilot\" + \"She lives next door\" → \"The woman who lives next door is a pilot.\"",
      "\"Who\" — odamlar haqida (the woman who lives next door), \"which\" — narsa yoki hayvonlar haqida (the app which I use every day), \"that\" — ham odam, ham narsa haqida ishlatilishi mumkin va so'zlashuvda \"who/which\"dan ko'ra tabiiyroq eshitiladi.",
      "Relative clause otdan DARHOL KEYIN keladi, ular orasiga boshqa so'z kiritilmaydi: \"The woman who lives next door is a pilot\" (\"The woman is a pilot who lives next door\" emas, chunki bu holda ma'no chalkashib qoladi).",
      "Relative pronoun (who/which/that) o'zi keyingi gapda EGA vazifasini bajarganda tushirib qoldirilmaydi: \"The woman who lives next door...\" (\"who\" bu yerda ega, tushirilmaydi). Lekin bu darsda faqat ega vazifasidagi holatlar ko'rib chiqiladi."
    ],
    "examples": [
      {
        "en": "The woman who lives next door is a pilot.",
        "uz": "Qo'shni xonadonda yashaydigan ayol — uchuvchi."
      },
      {
        "en": "This is the app which I use every day for studying.",
        "uz": "Bu — men har kuni o'qish uchun ishlatadigan ilova."
      },
      {
        "en": "I have a friend who speaks four languages.",
        "uz": "Mening to'rt tilda gaplasha oladigan do'stim bor."
      },
      {
        "en": "The car that broke down yesterday belongs to my uncle.",
        "uz": "Kecha buzilib qolgan mashina amakimniki."
      },
      {
        "en": "She works for a company which makes electric cars.",
        "uz": "U elektr mashinalar ishlab chiqaradigan kompaniyada ishlaydi."
      },
      {
        "en": "The teacher who taught me English moved to another school.",
        "uz": "Menga ingliz tilini o'rgatgan o'qituvchi boshqa maktabga o'tib ketdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The woman is a pilot who lives next door.",
        "right": "The woman who lives next door is a pilot.",
        "note": "Relative clause otdan darhol keyin kelishi kerak, gap oxiriga surib qo'yilmaydi."
      },
      {
        "wrong": "I have a friend which speaks four languages.",
        "right": "I have a friend who speaks four languages.",
        "note": "Odam haqida \"which\" emas, \"who\" (yoki \"that\") ishlatiladi."
      },
      {
        "wrong": "This is the app who I use every day.",
        "right": "This is the app which I use every day.",
        "note": "Narsa (app) haqida \"who\" emas, \"which\" (yoki \"that\") ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "I know a girl ___ can speak five languages.",
        "options": [
          "which",
          "who",
          "whose",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "This is the book ___ everyone is talking about.",
        "options": [
          "who",
          "which",
          "whom",
          "whose"
        ],
        "answer": 1
      },
      {
        "q": "The man ___ called yesterday didn't leave his name.",
        "options": [
          "which",
          "who",
          "whose",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "We stayed at a hotel ___ had a beautiful view of the sea.",
        "options": [
          "who",
          "which",
          "whom",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The man is my uncle who called.",
          "The man who called is my uncle.",
          "The man called who is my uncle.",
          "Who called is my uncle the man."
        ],
        "answer": 1
      }
    ]
  },
  "passive-introduction-a2": {
    "explanation": [
      "Passive voice (majhul nisbat)da e'tibor harakatni KIM bajarganiga emas, balki harakatning O'ZIGA yoki uning natijasiga qaratiladi. Ko'pincha harakat bajaruvchisi noma'lum, muhim emas yoki hamma uchun tushunarli bo'lganda ishlatiladi: \"The rooms are cleaned every morning\" (kim tozalayotgani emas, xonalar tozalanishi muhim).",
      "Qurilishi: subject + to be (mos zamonda) + fe'lning III shakli (past participle): \"The rooms are cleaned\" (are — hozirgi zamon, cleaned — III shakl).",
      "Active gapdagi to'ldiruvchi (object) passive gapda EGA (subject) bo'lib qoladi: Active — \"Someone cleans the rooms every morning\" → Passive — \"The rooms are cleaned every morning.\" Harakat bajaruvchisi ko'pincha butunlay tushiriladi.",
      "Agar harakat bajaruvchisini aytish zarur bo'lsa, gap oxiriga \"by\" bilan qo'shiladi: \"This building was designed by a famous architect.\" Lekin bu ko'pincha tushiriladi, chunki passive'ning asosiy maqsadi aynan shuni tushirish imkonini berish."
    ],
    "examples": [
      {
        "en": "The rooms are cleaned every morning by the staff.",
        "uz": "Xonalar har kuni ertalab xodimlar tomonidan tozalanadi."
      },
      {
        "en": "This bridge was built in 1998.",
        "uz": "Bu ko'prik 1998 yilda qurilgan."
      },
      {
        "en": "English is spoken in many countries around the world.",
        "uz": "Ingliz tili dunyoning ko'plab mamlakatlarida gaplashiladi."
      },
      {
        "en": "The letters are delivered twice a day.",
        "uz": "Xatlar kuniga ikki marta yetkazib beriladi."
      },
      {
        "en": "This song was written by a famous composer.",
        "uz": "Bu qo'shiq mashhur bastakor tomonidan yozilgan."
      },
      {
        "en": "The museum is visited by thousands of tourists every year.",
        "uz": "Bu muzeyga har yili minglab sayyohlar tashrif buyuradi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The rooms cleaned every morning.",
        "right": "The rooms are cleaned every morning.",
        "note": "Passive gapda \"to be\" fe'li tushirib qoldirilmaydi."
      },
      {
        "wrong": "This bridge built in 1998.",
        "right": "This bridge was built in 1998.",
        "note": "O'tgan zamon passive'da \"was/were\" kerak, faqat III shakl yetarli emas."
      },
      {
        "wrong": "English is speaking in many countries.",
        "right": "English is spoken in many countries.",
        "note": "Passive'da fe'l -ing shaklida emas, III shaklda (spoken) bo'lishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "This film ___ in 2015.",
        "options": [
          "made",
          "was made",
          "is making",
          "made was"
        ],
        "answer": 1
      },
      {
        "q": "These cars ___ in Germany.",
        "options": [
          "produce",
          "are produced",
          "producing",
          "produced are"
        ],
        "answer": 1
      },
      {
        "q": "The letter ___ yesterday.",
        "options": [
          "was sent",
          "sent",
          "is sending",
          "send was"
        ],
        "answer": 0
      },
      {
        "q": "This building ___ by a famous architect.",
        "options": [
          "designed",
          "was designed",
          "is designing",
          "design was"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The house built last year.",
          "The house was built last year.",
          "The house is build last year.",
          "The house built was last year."
        ],
        "answer": 1
      }
    ]
  },
  "reported-speech-introduction": {
    "explanation": [
      "Reported speech (o'zlashtirma nutq) boshqa odamning gapini uning aynan o'zi aytgan so'zlarisiz, o'z gapimiz ichiga qo'shib yetkazish uchun ishlatiladi: \"Ali said that he was tired\" (Ali aslida \"I am tired\" degan edi, biz buni o'zgartirib yetkazamiz).",
      "Eng muhim o'zgarish — ZAMON ORQAGA SURILADI (backshift): Present Simple → Past Simple, Present Continuous → Past Continuous. Ali aytgan \"I am tired\" (Present) — reported speech'da \"he was tired\" (Past) bo'lib qoladi.",
      "Olmoshlar ham nuqtai nazarga qarab o'zgaradi: agar Ali \"I am tired\" desa, biz uni boshqa odamga aytib berayotganimiz uchun \"I\" — \"he\"ga aylanadi: \"Ali said that HE was tired.\"",
      "\"That\" so'zlashuv nutqida ko'pincha tushirilishi mumkin, ma'no o'zgarmaydi: \"Ali said he was tired\" = \"Ali said that he was tired.\""
    ],
    "examples": [
      {
        "en": "Ali said that he was tired after the long journey.",
        "uz": "Ali uzoq safardan keyin charchaganini aytdi."
      },
      {
        "en": "She told me that she needed some help with the project.",
        "uz": "U menga loyihada yordam kerakligini aytdi."
      },
      {
        "en": "They said that they were going to be late.",
        "uz": "Ular kechikishlarini aytishdi."
      },
      {
        "en": "He said that he liked the new restaurant very much.",
        "uz": "U yangi restoranni juda yoqtirganini aytdi."
      },
      {
        "en": "My teacher said that the exam was going to be difficult.",
        "uz": "O'qituvchim imtihon qiyin bo'lishini aytdi."
      },
      {
        "en": "She said that she had never been to Japan.",
        "uz": "U hech qachon Yaponiyada bo'lmaganini aytdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Ali said that he is tired.",
        "right": "Ali said that he was tired.",
        "note": "Reported speech'da zamon orqaga suriladi — Present Simple emas, Past Simple."
      },
      {
        "wrong": "She told that she needed help.",
        "right": "She told me that she needed help.",
        "note": "\"Tell\" fe'lidan keyin kimga aytilgani ko'rsatiladi (me, him, her); \"say\"dan farqi shu."
      },
      {
        "wrong": "He said I am tired.",
        "right": "He said that he was tired.",
        "note": "Olmosh gapiruvchining nuqtai nazariga moslashadi — \"I\" \"he\"ga aylanadi, zamon ham orqaga suriladi."
      }
    ],
    "quiz": [
      {
        "q": "She said that she ___ very busy that week.",
        "options": [
          "is",
          "was",
          "be",
          "being"
        ],
        "answer": 1
      },
      {
        "q": "He told me that he ___ to call later.",
        "options": [
          "is going",
          "was going",
          "going",
          "goes"
        ],
        "answer": 1
      },
      {
        "q": "They said that they ___ the film already.",
        "options": [
          "saw",
          "have seen",
          "had seen",
          "see"
        ],
        "answer": 2
      },
      {
        "q": "My friend said that she ___ tired.",
        "options": [
          "is",
          "was",
          "be",
          "are"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She said that she is happy.",
          "She said that she was happy.",
          "She said she happy.",
          "She said that she being happy."
        ],
        "answer": 1
      }
    ]
  },
  "quantifiers-a2": {
    "explanation": [
      "Kundalik miqdor so'zlari otning turiga (sanaladigan/sanalmaydigan) qarab tanlanadi: \"a lot of\" — ikkalasi bilan ham ishlatiladi (a lot of books, a lot of money), \"a few\" — faqat sanaladigan ko'plik bilan (a few friends), \"a little\" — faqat sanalmaydigan bilan (a little time).",
      "\"A lot of\" ijobiy ma'noda katta miqdorni bildiradi va tasdiq gapda eng ko'p ishlatiladigan variant: \"We have a lot of time before the flight.\" Savol va inkorda ko'pincha \"much/many\" ham ishlatiladi.",
      "\"A few\" — kichik, lekin YETARLI miqdorni bildiradi (ijobiy ohang): \"We have a little time before class\" (biroz vaqtimiz bor, yetadi). \"A little\" ham xuddi shunday, faqat sanalmaydigan otlar bilan.",
      "Bu so'zlarni tanlashda birinchi qadam — otning sanaladigan yoki sanalmaydiganligini aniqlash, keyin shunga mos miqdor so'zini tanlash."
    ],
    "examples": [
      {
        "en": "We have a little time before class starts.",
        "uz": "Dars boshlanguncha bizda biroz vaqt bor."
      },
      {
        "en": "She has a lot of experience in this field.",
        "uz": "Uning bu sohada katta tajribasi bor."
      },
      {
        "en": "I have a few friends who live in this neighbourhood.",
        "uz": "Mening bu mahallada yashaydigan bir nechta do'stim bor."
      },
      {
        "en": "There is a lot of traffic on this road today.",
        "uz": "Bugun bu yo'lda ko'p tirbandlik bor."
      },
      {
        "en": "We only have a little money left for this month.",
        "uz": "Bu oy uchun bizda oz miqdorda pul qoldi."
      },
      {
        "en": "He asked me a few questions about my job.",
        "uz": "U mendan ishim haqida bir nechta savol so'radi."
      }
    ],
    "mistakes": [
      {
        "wrong": "We have a little friends in this city.",
        "right": "We have a few friends in this city.",
        "note": "\"Friends\" sanaladigan ot — \"a little\" emas, \"a few\" ishlatiladi."
      },
      {
        "wrong": "I have a few money with me.",
        "right": "I have a little money with me.",
        "note": "\"Money\" sanalmaydigan ot — \"a few\" emas, \"a little\" ishlatiladi."
      },
      {
        "wrong": "She has a lot of experiences.",
        "right": "She has a lot of experience.",
        "note": "\"Experience\" (tajriba) bu ma'noda sanalmaydigan ot — ko'plik -s olmaydi."
      }
    ],
    "quiz": [
      {
        "q": "We have ___ apples left — enough for a pie.",
        "options": [
          "a little",
          "a few",
          "much",
          "a lot"
        ],
        "answer": 1
      },
      {
        "q": "There is ___ milk left in the fridge.",
        "options": [
          "a few",
          "a little",
          "many",
          "few"
        ],
        "answer": 1
      },
      {
        "q": "She has ___ money saved for the trip.",
        "options": [
          "a few",
          "a lot of",
          "many",
          "few"
        ],
        "answer": 1
      },
      {
        "q": "I have ___ questions before we start the lesson.",
        "options": [
          "a little",
          "a few",
          "much",
          "little"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We have a little friends here.",
          "We have a few friends here.",
          "We have a little friend here.",
          "We have few money here."
        ],
        "answer": 1
      }
    ]
  },
  "articles-places-a2": {
    "explanation": [
      "Joy nomlari bilan artikl tanlash o'ziga xos qoidalarga ega va bu ko'pincha o'quvchilarni chalg'itadi, chunki qoida har doim mantiqan bir xil emas — ko'p narsani yodlash kerak.",
      "Aniq, nomlangan binolar va muassasalar bilan odatda \"the\" ishlatiladi: the National Gallery, the Hilton Hotel, the White House. Lekin shahar, mamlakat va ko'chalar nomlari bilan odatda artikl umuman ishlatilmaydi: Tashkent, Uzbekistan, Amir Temur Street.",
      "Istisno: ko'plikdagi yoki \"of\" so'zini o'z ichiga olgan mamlakat nomlari bilan \"the\" ishlatiladi: the United States, the Netherlands, the United Kingdom. Daryolar, dengizlar, okeanlar va tog' tizmalari bilan ham \"the\" keladi: the Nile, the Mediterranean, the Alps.",
      "Universitet va maktab nomlarida ham farq bor: \"the University of Oxford\" (\"of\" bilan — \"the\" kerak), lekin \"Oxford University\" (to'g'ridan-to'g'ri nom — artikl kerak emas)."
    ],
    "examples": [
      {
        "en": "We visited the National Gallery on our trip to London.",
        "uz": "Londonga sayohatimizda Milliy Galereyaga tashrif buyurdik."
      },
      {
        "en": "She studies at the University of Cambridge.",
        "uz": "U Kembrij universitetida o'qiydi."
      },
      {
        "en": "Tashkent is the capital of Uzbekistan.",
        "uz": "Toshkent O'zbekistonning poytaxti."
      },
      {
        "en": "They travelled through the Netherlands and Belgium.",
        "uz": "Ular Niderlandiya va Belgiya orqali sayohat qilishdi."
      },
      {
        "en": "The Nile is the longest river in Africa.",
        "uz": "Nil daryosi Afrikadagi eng uzun daryo."
      },
      {
        "en": "We met at Oxford University for the conference.",
        "uz": "Biz konferensiya uchun Oksford universitetida uchrashdik."
      }
    ],
    "mistakes": [
      {
        "wrong": "We visited National Gallery in London.",
        "right": "We visited the National Gallery in London.",
        "note": "Aniq nomlangan muassasa (gallery, museum) nomidan oldin odatda \"the\" qo'yiladi."
      },
      {
        "wrong": "She lives in the Tashkent.",
        "right": "She lives in Tashkent.",
        "note": "Shahar nomlaridan oldin odatda artikl ishlatilmaydi."
      },
      {
        "wrong": "They visited United States last year.",
        "right": "They visited the United States last year.",
        "note": "Ko'plik shakldagi mamlakat nomlaridan (United States) oldin \"the\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ Amazon is the largest rainforest in the world.",
        "options": [
          "A",
          "An",
          "The",
          "—"
        ],
        "answer": 2
      },
      {
        "q": "He was born in ___ Tashkent.",
        "options": [
          "a",
          "the",
          "an",
          "— (no article)"
        ],
        "answer": 3
      },
      {
        "q": "She works at ___ British Museum.",
        "options": [
          "a",
          "an",
          "the",
          "— (no article)"
        ],
        "answer": 2
      },
      {
        "q": "They live in ___ United Kingdom.",
        "options": [
          "a",
          "an",
          "the",
          "— (no article)"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I study at the Harvard University.",
          "I study at Harvard University.",
          "I study at a Harvard University.",
          "I study at Harvard the University."
        ],
        "answer": 1
      }
    ]
  },
  "phrasal-verb-word-order-a2": {
    "explanation": [
      "Ko'p phrasal verblar fe'l + zarracha (particle: off, on, up, out) dan tashkil topadi va ba'zilari AJRALADIGAN (separable) — ya'ni to'ldiruvchi fe'l va zarracha orasiga kirishi mumkin: \"turn off the light\" = \"turn the light off\".",
      "Agar to'ldiruvchi ODATDAGI OT bo'lsa, ikkala tartib ham to'g'ri: \"Please turn off the TV\" yoki \"Please turn the TV off\" — ikkalasi ham tabiiy eshitiladi.",
      "Lekin agar to'ldiruvchi OLMOSH bo'lsa (it, him, her, them), u FAQAT fe'l va zarracha ORASIGA kirishi mumkin, zarrachadan keyin emas: \"Turn it off\" to'g'ri, \"Turn off it\" NOTO'G'RI — bu ajraladigan phrasal verblarning eng muhim qoidasi.",
      "Barcha phrasal verblar ajraladigan emas — ba'zilari (ajralmaydigan, inseparable) hech qachon bo'linmaydi: \"look after the baby\" (\"look the baby after\" emas). Bu darsda faqat ajraladigan turdagilarga e'tibor qaratiladi."
    ],
    "examples": [
      {
        "en": "Please turn off the TV before you go to bed.",
        "uz": "Yotishdan oldin televizorni o'chirib qo'ying, iltimos."
      },
      {
        "en": "Can you turn it off? I'm trying to sleep.",
        "uz": "Uni o'chirib qo'ya olasizmi? Men uxlamoqchiman."
      },
      {
        "en": "She picked up the phone and answered it.",
        "uz": "U telefonni ko'tarib javob berdi."
      },
      {
        "en": "I need to fill out this form before Friday.",
        "uz": "Bu formani jumagacha to'ldirishim kerak."
      },
      {
        "en": "Could you fill it out for me, please?",
        "uz": "Buni men uchun to'ldirib bera olasizmi, iltimos?"
      },
      {
        "en": "He gave up smoking last year.",
        "uz": "U o'tgan yili chekishni tashladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Turn off it, please.",
        "right": "Turn it off, please.",
        "note": "Olmosh (it) fe'l va zarracha orasiga kirishi kerak, zarrachadan keyin emas."
      },
      {
        "wrong": "Please pick up it from the table.",
        "right": "Please pick it up from the table.",
        "note": "Olmosh doim fe'l va zarracha orasida turadi, hech qachon oxirida emas."
      },
      {
        "wrong": "I filled out it yesterday.",
        "right": "I filled it out yesterday.",
        "note": "Ajraladigan phrasal verbda olmosh zarrachadan oldin, fe'ldan keyin keladi."
      }
    ],
    "quiz": [
      {
        "q": "Can you turn ___? It's too loud.",
        "options": [
          "off it",
          "it off",
          "off the it",
          "the off it"
        ],
        "answer": 1
      },
      {
        "q": "I need to pick ___ from school at three.",
        "options": [
          "up him",
          "him up",
          "up the him",
          "the up him"
        ],
        "answer": 1
      },
      {
        "q": "Please fill ___ before you leave.",
        "options": [
          "out the form",
          "the form out",
          "out it",
          "the out form"
        ],
        "answer": 0
      },
      {
        "q": "She gave ___ last month.",
        "options": [
          "it up",
          "up it",
          "the up it",
          "it the up"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Turn off it now.",
          "Turn it off now.",
          "Turn now it off.",
          "Off turn it now."
        ],
        "answer": 1
      }
    ]
  },
  "present-perfect-continuous-b1": {
    "explanation": [
      "Present Perfect Continuous o'tmishda boshlangan va HOZIRGACHA DAVOM ETAYOTGAN faoliyatning JARAYONINI ta'kidlaydi — natijadan ko'ra harakatning o'zi, davomiyligi muhim: \"I have been learning English for two years\" (jarayon hali davom etmoqda).",
      "Qurilishi: subject + have/has + been + fe'l-ing. \"Been\" doim bir xil qoladi, faqat \"have/has\" shaxsga qarab o'zgaradi: \"She has been waiting\", \"They have been working.\"",
      "Present Perfect Simple'dan farqi: Simple ko'proq NATIJA yoki tugallangan miqdorga urg'u beradi (\"I have written three emails\" — nechta email yozilgani muhim), Continuous esa JARAYONning o'ziga, uning davomiyligiga urg'u beradi (\"I have been writing emails all morning\" — qancha vaqt shug'ullanganim muhim).",
      "Ko'pincha \"for\" va \"since\" bilan birga ishlatiladi, chunki bu zamon davomiylikni ta'kidlaydi: \"She has been working here since 2019\", \"We have been waiting for an hour.\""
    ],
    "examples": [
      {
        "en": "I have been learning English for two years.",
        "uz": "Men ikki yildan beri ingliz tilini o'rganib kelyapman."
      },
      {
        "en": "She has been working at this hospital since 2018.",
        "uz": "U 2018 yildan beri shu kasalxonada ishlab kelmoqda."
      },
      {
        "en": "They have been waiting for the bus for twenty minutes.",
        "uz": "Ular yigirma daqiqadan beri avtobusni kutib turishibdi."
      },
      {
        "en": "It has been raining all day.",
        "uz": "Kun bo'yi yomg'ir yog'ib turibdi."
      },
      {
        "en": "We have been planning this trip for months.",
        "uz": "Biz bu sayohatni bir necha oydan beri rejalashtirib kelyapmiz."
      },
      {
        "en": "He has been studying for the exam since morning.",
        "uz": "U ertalabdan beri imtihonga tayyorlanib kelyapti."
      }
    ],
    "mistakes": [
      {
        "wrong": "I have been learn English for two years.",
        "right": "I have been learning English for two years.",
        "note": "\"Have been\"dan keyin fe'l -ing shaklida bo'lishi kerak, asl shaklda emas."
      },
      {
        "wrong": "She have been working here since 2018.",
        "right": "She has been working here since 2018.",
        "note": "\"She\" bilan \"have\" emas, \"has\" ishlatiladi."
      },
      {
        "wrong": "I have been knowing him for years.",
        "right": "I have known him for years.",
        "note": "\"Know\" his-bilim fe'li — Continuous shaklda ishlatilmaydi, oddiy Present Perfect kifoya."
      }
    ],
    "quiz": [
      {
        "q": "We ___ for the results since Monday.",
        "options": [
          "have waiting",
          "have been waiting",
          "has been waiting",
          "are waiting since"
        ],
        "answer": 1
      },
      {
        "q": "She ___ this book for three days now.",
        "options": [
          "has read",
          "has been reading",
          "is reading",
          "reads"
        ],
        "answer": 1
      },
      {
        "q": "How long ___ you been living here?",
        "options": [
          "do",
          "are",
          "have",
          "did"
        ],
        "answer": 2
      },
      {
        "q": "It ___ non-stop since this morning.",
        "options": [
          "has been raining",
          "has rained",
          "is raining",
          "rains"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I have been study all day.",
          "I have been studying all day.",
          "I has been studying all day.",
          "I have study all day."
        ],
        "answer": 1
      }
    ]
  },
  "present-perfect-simple-vs-continuous": {
    "explanation": [
      "Ikkalasi ham o'tmishdan hozirgacha bo'lgan bog'liqlikni ko'rsatadi, lekin urg'u qayerga qaratilganida farq qiladi: Simple — NATIJA yoki YAKUNLANGAN MIQDORGA (\"She has written three reports today\" — nechta), Continuous — JARAYON va DAVOMIYLIKKA (\"She has been writing reports all day\" — qancha vaqt shug'ullangan).",
      "Ba'zi fe'llar (know, believe, understand, own, like) his-bilim/holat fe'llari bo'lgani uchun deyarli hech qachon Continuous shaklda ishlatilmaydi, faqat Simple: \"I have known her for years\" (\"I have been knowing her\" emas).",
      "Continuous shakl ko'pincha KO'RINADIGAN NATIJA yoki hodisaning SABABINI tushuntirishda ishlatiladi: \"Your hands are dirty — have you been gardening?\" (hozirgi ko'rinishning sababi jarayonda).",
      "Miqdor yoki sanoq (how many, how much) bilan savol berilganda odatda Simple ishlatiladi, chunki natija muhim: \"How many pages have you read?\" (\"How many pages have you been reading?\" emas)."
    ],
    "examples": [
      {
        "en": "She has written three reports today.",
        "uz": "U bugun uchta hisobot yozdi."
      },
      {
        "en": "She has been writing reports all day and looks exhausted.",
        "uz": "U kun bo'yi hisobotlar yozib kelyapti va charchagandek ko'rinadi."
      },
      {
        "en": "Your hands are dirty — have you been gardening?",
        "uz": "Qo'lingiz iflos — bog'da ishlayotgan edingizmi?"
      },
      {
        "en": "I have read that book twice.",
        "uz": "Men o'sha kitobni ikki marta o'qiganman."
      },
      {
        "en": "How many emails have you sent this morning?",
        "uz": "Bugun ertalab nechta email yubordingiz?"
      },
      {
        "en": "We have been discussing this issue for an hour.",
        "uz": "Biz bir soatdan beri shu masalani muhokama qilib kelyapmiz."
      }
    ],
    "mistakes": [
      {
        "wrong": "How many pages have you been reading?",
        "right": "How many pages have you read?",
        "note": "Aniq miqdor so'ralganda Simple ishlatiladi, Continuous emas."
      },
      {
        "wrong": "I have been knowing her since school.",
        "right": "I have known her since school.",
        "note": "\"Know\" his-bilim fe'li — Continuous shaklda ishlatilmaydi."
      },
      {
        "wrong": "She has write three reports today.",
        "right": "She has written three reports today.",
        "note": "Present Perfect Simple'da fe'lning III shakli (written) kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "I ___ this article twice already.",
        "options": [
          "have read",
          "have been reading",
          "am reading",
          "read"
        ],
        "answer": 0
      },
      {
        "q": "You look tired — ___ all night?",
        "options": [
          "have you studied",
          "have you been studying",
          "did you study",
          "are you studying"
        ],
        "answer": 1
      },
      {
        "q": "How many books ___ this year?",
        "options": [
          "have you been reading",
          "have you read",
          "do you read",
          "are you reading"
        ],
        "answer": 1
      },
      {
        "q": "I ___ him since we were children.",
        "options": [
          "have known",
          "have been knowing",
          "am knowing",
          "know"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI (jarayon, hali ham davom etmoqda)?",
        "options": [
          "She has painted the fence all afternoon.",
          "She has been painting the fence all afternoon.",
          "She paints the fence all afternoon.",
          "She painted the fence all afternoon."
        ],
        "answer": 1
      }
    ]
  },
  "past-perfect-basics-b1": {
    "explanation": [
      "Past Perfect o'tmishdagi IKKI voqeadan qaysi biri BOSHQASIDAN OLDIN sodir bo'lganini ko'rsatadi — eng oldingi voqea Past Perfect'da, keyingisi esa oddiy Past Simple'da bo'ladi: \"The film had started before we arrived\" (avval boshlangan — had started; keyin biz keldik — arrived).",
      "Qurilishi juda sodda va shaxsga qarab o'zgarmaydi: subject + had + fe'lning III shakli. \"Had\" barcha shaxslar bilan bir xil: I had, she had, they had.",
      "Past Perfect ko'pincha \"before\", \"after\", \"already\", \"when\", \"by the time\" kabi so'zlar bilan birga ishlatiladi, ular ikki voqea orasidagi vaqt ketma-ketligini yanada aniqlashtiradi: \"By the time we arrived, the film had already started.\"",
      "Agar ikki voqea orasida ketma-ketlik aniq bo'lsa va chalkashish xavfi bo'lmasa (masalan \"and\" bilan bog'langan ikkita ketma-ket voqea), Past Perfect shart emas — ikkalasi ham oddiy Past Simple'da qolishi mumkin: \"I finished my work and went home.\""
    ],
    "examples": [
      {
        "en": "The film had already started before we arrived at the cinema.",
        "uz": "Biz kinoteatrga yetib borishimizdan oldin film allaqachon boshlangan edi."
      },
      {
        "en": "She had never seen snow before she moved to Russia.",
        "uz": "Rossiyaga ko'chib o'tishidan oldin u hech qachon qor ko'rmagan edi."
      },
      {
        "en": "By the time I got home, my family had already had dinner.",
        "uz": "Men uyga yetib borganimda, oilam allaqachon kechki ovqatni yeb bo'lgan edi."
      },
      {
        "en": "He realised that he had forgotten his passport.",
        "uz": "U pasportini unutib qoldirganini angladi."
      },
      {
        "en": "We had finished the project before the deadline.",
        "uz": "Biz loyihani muddatdan oldin tugatgan edik."
      },
      {
        "en": "After she had read the letter, she felt much better.",
        "uz": "Xatni o'qib bo'lgach, u o'zini ancha yaxshi his qildi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The film had started when we were arriving.",
        "right": "The film had already started when we arrived.",
        "note": "Ikkinchi (keyingi) voqea uchun Past Simple ishlatiladi, Continuous shart emas."
      },
      {
        "wrong": "She had never see snow before.",
        "right": "She had never seen snow before.",
        "note": "Past Perfect'da fe'lning III shakli (seen) kerak, asl shakli emas."
      },
      {
        "wrong": "I had finish the report before lunch.",
        "right": "I had finished the report before lunch.",
        "note": "\"Had\"dan keyin fe'lning III shakli kerak, asl shakl emas."
      }
    ],
    "quiz": [
      {
        "q": "By the time we got to the station, the train ___.",
        "options": [
          "left",
          "had left",
          "has left",
          "was leaving"
        ],
        "answer": 1
      },
      {
        "q": "She told me that she ___ that film before.",
        "options": [
          "saw",
          "had seen",
          "has seen",
          "sees"
        ],
        "answer": 1
      },
      {
        "q": "After he ___ his homework, he watched TV.",
        "options": [
          "finished",
          "had finished",
          "has finished",
          "finishes"
        ],
        "answer": 1
      },
      {
        "q": "I couldn't get into the flat because I ___ my keys.",
        "options": [
          "forgot",
          "had forgotten",
          "have forgotten",
          "forget"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "When I arrived, the meeting already started.",
          "When I arrived, the meeting had already started.",
          "When I arrived, the meeting has already started.",
          "When I arrived, the meeting already starts."
        ],
        "answer": 1
      }
    ]
  },
  "would-past-habits": {
    "explanation": [
      "\"Would\" o'tmishda TAKRORLANGAN odatlar haqida hikoya qilishda ishlatiladi, ayniqsa xotira yoki nostalji ohangida: \"Every summer, we would stay with our grandparents\" (bu — bolalikda muntazam takrorlangan an'ana).",
      "\"Would\" faqat HARAKATLAR (verbs) bilan ishlatiladi, holatlar (state) bilan emas — \"used to\" esa ikkalasi bilan ham ishlatilishi mumkin. Shuning uchun \"We would live in a small village\" emas (bu holat), \"We used to live in a small village\" to'g'ri.",
      "\"Would\" bilan \"used to\" ko'pincha almashtirilib ishlatilishi mumkin, faqat holat fe'llarida farq bor: \"I used to play chess with my father\" = \"I would play chess with my father\" (ikkalasi ham to'g'ri, chunki \"play\" — harakat).",
      "Odatda hikoya avval \"used to\" bilan boshlanadi (umumiy kontekstni belgilash uchun), keyin batafsilroq voqealar \"would\" bilan davom etadi: \"We used to spend summers in the village. We would wake up early and would go fishing.\""
    ],
    "examples": [
      {
        "en": "Every summer, we would stay with our grandparents in the village.",
        "uz": "Har yozda biz buvi-bobomiznikida qishloqda qolardik."
      },
      {
        "en": "My father would tell us stories before bed.",
        "uz": "Otam yotishdan oldin bizga hikoyalar aytib berardi."
      },
      {
        "en": "When I was a child, I would spend hours reading in the garden.",
        "uz": "Bolaligimda men bog'da soatlab kitob o'qishga vaqt sarflardim."
      },
      {
        "en": "She would always bring us small gifts when she visited.",
        "uz": "U tashrif buyurganda doim bizga kichik sovg'alar olib kelardi."
      },
      {
        "en": "We would walk to school together every morning.",
        "uz": "Biz har kuni ertalab maktabga birga piyoda borardik."
      },
      {
        "en": "He would practise the piano for an hour every day after school.",
        "uz": "U maktabdan keyin har kuni bir soat pianino chalishni mashq qilardi."
      }
    ],
    "mistakes": [
      {
        "wrong": "We would live in a small village when I was young.",
        "right": "We used to live in a small village when I was young.",
        "note": "\"Would\" holat fe'llari (live) bilan ishlatilmaydi — \"used to\" ishlatiladi."
      },
      {
        "wrong": "I would have a dog when I was a child.",
        "right": "I used to have a dog when I was a child.",
        "note": "\"Have\" (egalik ma'nosida) — holat fe'li, \"would\" bilan emas, \"used to\" bilan ishlatiladi."
      },
      {
        "wrong": "She would liked chocolate as a child.",
        "right": "She would like chocolate as a child. / She used to like chocolate as a child.",
        "note": "\"Would\"dan keyin fe'l asl shaklda bo'ladi, o'tgan zamon shaklida emas."
      }
    ],
    "quiz": [
      {
        "q": "Every winter, my grandfather ___ tell us stories by the fire.",
        "options": [
          "would",
          "was",
          "used",
          "did"
        ],
        "answer": 0
      },
      {
        "q": "When I was young, I ___ a small flat in the city centre. (holat)",
        "options": [
          "would live",
          "used to live",
          "would lived",
          "living"
        ],
        "answer": 1
      },
      {
        "q": "We ___ play football in the park after school every day.",
        "options": [
          "would",
          "used",
          "did use",
          "were"
        ],
        "answer": 0
      },
      {
        "q": "She ___ have long hair when she was a teenager. (holat)",
        "options": [
          "would",
          "used to",
          "would to",
          "was used"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We would own a big house. (holat)",
          "We used to own a big house.",
          "We would owned a big house.",
          "We would owning a big house."
        ],
        "answer": 1
      }
    ]
  },
  "future-forms-review-b1": {
    "explanation": [
      "Kelajak haqida gapirishning bir necha usuli bor va ularni to'g'ri tanlash gapning ma'nosini aniqlashtiradi: will (bashorat/spontan qaror), going to (niyat/dalilga asoslangan bashorat), Present Continuous (allaqachon kelishilgan aniq reja), Present Simple (jadval/rasmiy dastur).",
      "Present Simple kelajak uchun faqat JADVAL, RASMIY DASTUR yoki jamoat transporti vaqti haqida gapirganda ishlatiladi, shaxsiy rejalar uchun emas: \"The train leaves at nine\" (jadval bo'yicha, o'zgarmas).",
      "Present Continuous esa shaxsiy, KELISHILGAN rejalar uchun ishlatiladi, ayniqsa boshqa odam bilan bog'liq bo'lganda: \"I am meeting the designer tomorrow morning\" (allaqachon vaqt kelishib qo'yilgan).",
      "To'g'ri shaklni tanlash uchun savol berish foydali: bu — jadvalmi (Simple), kelishilgan uchrashuvmi (Continuous), oldindan qilingan rejami/dalilga asoslangan bashoratmi (going to), yoki gapirish paytida qabul qilingan qarormi/oddiy bashoratmi (will)?"
    ],
    "examples": [
      {
        "en": "I am meeting the designer tomorrow morning.",
        "uz": "Ertaga ertalab dizayner bilan uchrashaman."
      },
      {
        "en": "The train leaves at nine fifteen every day.",
        "uz": "Poyezd har kuni soat to'qqiz o'n beshda jo'nab ketadi."
      },
      {
        "en": "We are going to renovate our kitchen next year.",
        "uz": "Biz keyingi yil oshxonamizni ta'mirlaymiz."
      },
      {
        "en": "I think it will be a great event.",
        "uz": "Menimcha, bu ajoyib tadbir bo'ladi."
      },
      {
        "en": "The meeting starts at ten o'clock sharp.",
        "uz": "Uchrashuv aynan soat o'nda boshlanadi."
      },
      {
        "en": "She is starting her new job next Monday.",
        "uz": "U keyingi dushanba kuni yangi ishini boshlaydi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I meet the designer tomorrow morning.",
        "right": "I am meeting the designer tomorrow morning.",
        "note": "Shaxsiy kelishilgan reja uchun Present Simple emas, Present Continuous ishlatiladi."
      },
      {
        "wrong": "The train is leaving at nine every day.",
        "right": "The train leaves at nine every day.",
        "note": "Rasmiy jadval haqida gapirganda Present Simple ishlatiladi, Continuous emas."
      },
      {
        "wrong": "We renovate our kitchen next year — it's decided.",
        "right": "We are going to renovate our kitchen next year.",
        "note": "Oldindan qabul qilingan reja uchun oddiy Present Simple emas, \"going to\" yoki Continuous ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "The film ___ at 7:30pm according to the schedule.",
        "options": [
          "starts",
          "is starting",
          "will starting",
          "start"
        ],
        "answer": 0
      },
      {
        "q": "I ___ my sister at the airport tomorrow — it's all arranged.",
        "options": [
          "meet",
          "am meeting",
          "will meeting",
          "meets"
        ],
        "answer": 1
      },
      {
        "q": "Look at those clouds — I think it ___ rain.",
        "options": [
          "is going to",
          "meets",
          "starts",
          "is starting"
        ],
        "answer": 0
      },
      {
        "q": "The shop ___ at nine on Mondays.",
        "options": [
          "is opening",
          "opens",
          "will opening",
          "open"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (jadval)?",
        "options": [
          "The bus is leaving at 6am every day.",
          "The bus leaves at 6am every day.",
          "The bus will leave at 6am every day always.",
          "The bus leave at 6am every day."
        ],
        "answer": 1
      }
    ]
  },
  "future-continuous-b1": {
    "explanation": [
      "Future Continuous kelajakdagi ANIQ BIR MOMENTDA davom etayotgan harakatni tasvirlaydi: \"This time tomorrow, we will be flying home\" (ertaga aynan shu paytda parvoz jarayonida bo'lamiz).",
      "Qurilishi: subject + will be + fe'l-ing. Barcha shaxslar uchun bir xil: \"I will be working\", \"She will be working\", \"They will be working.\"",
      "Bu zamon ko'pincha kelajakdagi ikki voqeani solishtirishda ham ishlatiladi — biri uzoq davom etayotganda ikkinchisi sodir bo'ladi: \"When you arrive, I will be cooking dinner\" (siz kelganingizda men allaqachon pishirish jarayonida bo'laman).",
      "Yana bir muhim qo'llanilishi — RASMIY, KUTILGAN rejalar haqida NEYTRAL, tabiiy tarzda gapirish (spekulyatsiya yoki niyat emas, shunchaki normal jarayon sifatida): \"I'll be seeing him at the conference next week\" (bu allaqachon rejaning tabiiy qismi)."
    ],
    "examples": [
      {
        "en": "This time tomorrow, we will be flying home.",
        "uz": "Ertaga aynan shu paytda biz uyga parvoz qilayotgan bo'lamiz."
      },
      {
        "en": "When you arrive, I will be cooking dinner.",
        "uz": "Siz kelganingizda men kechki ovqat pishirayotgan bo'laman."
      },
      {
        "en": "This time next week, she will be starting her new job.",
        "uz": "Keyingi hafta shu paytda u yangi ishini boshlayotgan bo'ladi."
      },
      {
        "en": "Don't call me at eight — I'll be having a shower.",
        "uz": "Menga soat sakkizda qo'ng'iroq qilmang — men dush qabul qilayotgan bo'laman."
      },
      {
        "en": "At noon tomorrow, we will be sitting in the exam hall.",
        "uz": "Ertaga peshinda biz imtihon zalida o'tirgan bo'lamiz."
      },
      {
        "en": "I'll be seeing him at the conference next week, so I'll ask him.",
        "uz": "Keyingi hafta konferensiyada uni ko'raman, shuning uchun undan so'rayman."
      }
    ],
    "mistakes": [
      {
        "wrong": "This time tomorrow, we will fly home.",
        "right": "This time tomorrow, we will be flying home.",
        "note": "Kelajakdagi aniq momentda DAVOM ETAYOTGAN harakat uchun Future Continuous ishlatiladi, oddiy \"will\" emas."
      },
      {
        "wrong": "I will be cook dinner when you arrive.",
        "right": "I will be cooking dinner when you arrive.",
        "note": "\"Will be\"dan keyin fe'l -ing shaklida bo'lishi kerak."
      },
      {
        "wrong": "She will being starting her new job.",
        "right": "She will be starting her new job.",
        "note": "To'g'ri qurilish \"will be + -ing\", \"will being\" emas."
      }
    ],
    "quiz": [
      {
        "q": "This time next week, I ___ on the beach.",
        "options": [
          "will lie",
          "will be lying",
          "am lying",
          "lie"
        ],
        "answer": 1
      },
      {
        "q": "Don't call at seven — we ___ dinner.",
        "options": [
          "will have",
          "will be having",
          "have",
          "are having"
        ],
        "answer": 1
      },
      {
        "q": "At midnight, they ___ still on the road.",
        "options": [
          "will be",
          "will being",
          "are",
          "will"
        ],
        "answer": 0
      },
      {
        "q": "This time tomorrow, she ___ her final exam.",
        "options": [
          "will take",
          "will be taking",
          "takes",
          "is taking"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I will be work at nine tomorrow.",
          "I will be working at nine tomorrow.",
          "I will working at nine tomorrow.",
          "I be will working at nine tomorrow."
        ],
        "answer": 1
      }
    ]
  },
  "can-could-be-able-to": {
    "explanation": [
      "\"Can\", \"could\" va \"be able to\" qobiliyat va imkoniyatni bildiradi, lekin har biri ma'lum zamon yoki vaziyatga xos, shuning uchun ularni to'g'ri joyda tanlash muhim.",
      "\"Can\" — hozirgi qobiliyat uchun: \"I can swim.\" \"Could\" — o'tmishdagi UMUMIY qobiliyat uchun: \"When I was young, I could run very fast\" (umumiy, doimiy qobiliyat).",
      "MUHIM FARQ: bir martalik, MA'LUM BIR HOLATDAGI muvaffaqiyatli harakat uchun \"could\" ISHLATILMAYDI — bunda \"was/were able to\" (yoki \"managed to\") ishlatiladi: \"After a lot of practice, she was able to solve the puzzle\" (\"could solve\" emas, chunki bu — aniq bir holatda erishilgan natija).",
      "\"Be able to\" barcha zamonlarda ishlatilishi mumkin (hatto \"can\" bo'lmagan joylarda ham): \"I will be able to help you tomorrow\" (\"will can\" mavjud emas — \"will\"dan keyin \"can\" kelmaydi, \"be able to\" kerak)."
    ],
    "examples": [
      {
        "en": "After a lot of practice, she was able to solve the puzzle.",
        "uz": "Ko'p mashq qilgach, u jumboqni yechishga muvaffaq bo'ldi."
      },
      {
        "en": "When I was young, I could run very fast.",
        "uz": "Yosh paytimda men juda tez yugurishga qodir edim."
      },
      {
        "en": "I will be able to help you with the project tomorrow.",
        "uz": "Ertaga sizga loyihada yordam bera olaman."
      },
      {
        "en": "She can speak three languages fluently.",
        "uz": "U uch tilda ravon gapira oladi."
      },
      {
        "en": "Despite the difficult conditions, they were able to finish the race.",
        "uz": "Og'ir sharoitlarga qaramay, ular poygani tugatishga muvaffaq bo'lishdi."
      },
      {
        "en": "He couldn't swim as a child, but now he can.",
        "uz": "Bolaligida u suza olmasdi, lekin hozir suza oladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "After a lot of practice, she could solve the puzzle.",
        "right": "After a lot of practice, she was able to solve the puzzle.",
        "note": "Bir martalik, aniq muvaffaqiyat uchun \"could\" emas, \"was able to\" ishlatiladi."
      },
      {
        "wrong": "I will can help you tomorrow.",
        "right": "I will be able to help you tomorrow.",
        "note": "\"Will\"dan keyin \"can\" kelmaydi — \"be able to\" ishlatiladi."
      },
      {
        "wrong": "She is able speak French.",
        "right": "She is able to speak French.",
        "note": "\"Be able\"dan keyin \"to\" tushirib qoldirilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "I ___ swim when I was five years old.",
        "options": [
          "was able to",
          "could",
          "can",
          "will be able to"
        ],
        "answer": 1
      },
      {
        "q": "Despite the storm, the pilot ___ land the plane safely.",
        "options": [
          "could",
          "can",
          "was able to",
          "will can"
        ],
        "answer": 2
      },
      {
        "q": "Next year, I ___ drive a car.",
        "options": [
          "can",
          "could",
          "will be able to",
          "will can"
        ],
        "answer": 2
      },
      {
        "q": "She ___ play the piano beautifully.",
        "options": [
          "can",
          "is able",
          "will can",
          "could to"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI (bir martalik muvaffaqiyat)?",
        "options": [
          "After hours of trying, he could fix the car.",
          "After hours of trying, he was able to fix the car.",
          "After hours of trying, he can fix the car.",
          "After hours of trying, he will can fix the car."
        ],
        "answer": 1
      }
    ]
  },
  "modals-possibility-b1": {
    "explanation": [
      "\"May\", \"might\" va \"could\" hozirgi yoki kelajakdagi ehtimolni bildirishda ishlatiladi, ayniqsa yetarli dalil bo'lmaganda, bir necha variant orasida ikkilanish holatida: \"The keys might be in the kitchen\" (aniq emas, faqat taxmin).",
      "Uchalasi ham ma'no jihatidan juda yaqin va ko'pincha almashtirilib ishlatiladi: \"It may/might/could rain later\" — uchalasi ham \"balki yomg'ir yog'ar\" degan bir xil ma'noni beradi.",
      "Bir necha ehtimolni ketma-ket sanab o'tishda ular ayniqsa foydali, chunki gapiruvchi hech qaysi variantga qat'iy ishonch bildirmaydi: \"She could be at work, or she might be at home — I'm not sure.\"",
      "\"Could\" bu ma'noda \"can\"ning o'tgan zamon shakli emas — bu alohida, ehtimollik ma'nosidagi modal fe'l va hozirgi/kelajak vaqt uchun ham ishlatiladi."
    ],
    "examples": [
      {
        "en": "The keys might be in the kitchen — I'm not sure.",
        "uz": "Kalitlar oshxonada bo'lishi mumkin — aniq bilmayman."
      },
      {
        "en": "She could be stuck in traffic; that's why she's late.",
        "uz": "U tirbandlikda qolib ketgan bo'lishi mumkin; shuning uchun kech qoldi."
      },
      {
        "en": "It may rain later, so take an umbrella just in case.",
        "uz": "Keyinroq yomg'ir yog'ishi mumkin, shuning uchun ehtiyot uchun soyabon oling."
      },
      {
        "en": "He might not have seen the email yet.",
        "uz": "U hali xatni ko'rmagan bo'lishi mumkin."
      },
      {
        "en": "They could be at the airport already.",
        "uz": "Ular allaqachon aeroportda bo'lishlari mumkin."
      },
      {
        "en": "The meeting may be postponed because of the weather.",
        "uz": "Ob-havo tufayli uchrashuv kechiktirilishi mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "The keys mights be in the kitchen.",
        "right": "The keys might be in the kitchen.",
        "note": "\"Might\" barcha shaxslar bilan bir xil shaklda qoladi, -s qo'shilmaydi."
      },
      {
        "wrong": "She could to be at work.",
        "right": "She could be at work.",
        "note": "Modal fe'llardan (could, may, might) keyin \"to\" qo'shilmaydi."
      },
      {
        "wrong": "It may rains later.",
        "right": "It may rain later.",
        "note": "Modal fe'llardan keyin fe'l asl shaklda bo'ladi, -s qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "I'm not sure where he is — he ___ be at the gym.",
        "options": [
          "might",
          "mights",
          "is might",
          "does might"
        ],
        "answer": 0
      },
      {
        "q": "She ___ be angry with us — I really don't know why she's quiet.",
        "options": [
          "could",
          "coulds",
          "is could",
          "does could"
        ],
        "answer": 0
      },
      {
        "q": "They ___ have already left — their car isn't here.",
        "options": [
          "might",
          "mights",
          "are might",
          "does might"
        ],
        "answer": 0
      },
      {
        "q": "The train ___ be late because of the snow.",
        "options": [
          "may",
          "mays",
          "is may",
          "does may"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It might rains tomorrow.",
          "It might to rain tomorrow.",
          "It might rain tomorrow.",
          "It mights rain tomorrow."
        ],
        "answer": 2
      }
    ]
  },
  "modals-obligation-review-b1": {
    "explanation": [
      "Majburiyat, ruxsat va taqiqni ifodalash uchun bir nechta modal fe'l bor va ularni to'g'ri ajratish gapning ma'nosini aniq qiladi: must/have to (majburiyat), can/be allowed to (ruxsat), mustn't/not allowed to (taqiq).",
      "Ruxsat bildirishning ikki asosiy usuli bor: \"can\" — kundalik, norasmiy nutqda (\"You can leave early today\"), \"be allowed to\" — biroz rasmiyroq, ayniqsa qoida yoki tashkilot tomonidan berilgan ruxsat haqida gapirganda (\"Visitors are allowed to take photos here\").",
      "\"Be allowed to\" barcha zamonlarda ishlatilishi mumkin, \"can\"dan farqli o'laroq — bu uning katta afzalligi: \"I wasn't allowed to go out\" (o'tgan zamon), \"I will be allowed to drive next year\" (kelajak) — \"can\" bunday moslashuvchan emas.",
      "Taqiq bildirishda ham xuddi shunday ikki daraja bor: \"can't/mustn't\" (kundalik, qat'iy) va \"not allowed to\" (rasmiyroq, qoidaga asoslangan): \"You're not allowed to smoke in this building.\""
    ],
    "examples": [
      {
        "en": "Visitors are allowed to take photos here.",
        "uz": "Tashrif buyuruvchilar bu yerda surat olishlari mumkin."
      },
      {
        "en": "You are not allowed to park in front of the entrance.",
        "uz": "Kirish joyi oldiga to'xtash mumkin emas."
      },
      {
        "en": "Students must submit their assignments by Friday.",
        "uz": "Talabalar topshiriqlarini jumagacha topshirishlari shart."
      },
      {
        "en": "We weren't allowed to leave the building during the fire alarm.",
        "uz": "Yong'in signali paytida bizga binodan chiqishga ruxsat berilmadi."
      },
      {
        "en": "Employees have to wear safety equipment in this area.",
        "uz": "Xodimlar bu hududda xavfsizlik jihozlarini kiyishlari shart."
      },
      {
        "en": "Will we be allowed to bring guests to the event?",
        "uz": "Tadbirga mehmon olib kelishga ruxsat berilarmikin?"
      }
    ],
    "mistakes": [
      {
        "wrong": "We are allow to enter after six.",
        "right": "We are allowed to enter after six.",
        "note": "\"Be allowed to\" — \"be + III shakl (allowed) + to\" qurilishida, oddiy fe'l shaklida emas."
      },
      {
        "wrong": "I will can drive next year.",
        "right": "I will be able to drive next year. / I will be allowed to drive next year.",
        "note": "\"Will\"dan keyin \"can\" kelmaydi — \"be able to\" yoki \"be allowed to\" ishlatiladi."
      },
      {
        "wrong": "Students must to submit their work by Friday.",
        "right": "Students must submit their work by Friday.",
        "note": "\"Must\"dan keyin \"to\" qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "In this library, you ___ talk loudly — it disturbs others.",
        "options": [
          "aren't allowed to",
          "are allowed to",
          "must",
          "have to"
        ],
        "answer": 0
      },
      {
        "q": "Next year, I ___ vote for the first time.",
        "options": [
          "can",
          "will be allowed to",
          "am allowed",
          "allow"
        ],
        "answer": 1
      },
      {
        "q": "Staff ___ wear a uniform at this company.",
        "options": [
          "have to",
          "allow to",
          "are allow to",
          "must to"
        ],
        "answer": 0
      },
      {
        "q": "Were you ___ use your phone during the exam?",
        "options": [
          "allow to",
          "allowed to",
          "allowing",
          "able"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We are allow to park here.",
          "We are allowed to park here.",
          "We allowed to park here.",
          "We are allowed park here."
        ],
        "answer": 1
      }
    ]
  },
  "first-conditional-review-b1": {
    "explanation": [
      "First Conditional'da natija qismida faqat \"will\" emas, balki ehtimollik darajasiga qarab boshqa modal fe'llar ham ishlatilishi mumkin: may, might, can — bular natijaning qanchalik ANIQ yoki EHTIMOL ekanini ko'rsatadi.",
      "\"Will\" — qat'iy, ishonchli natija: \"If you leave now, you will catch the train\" (ishonch bilan). \"May/might\" — ehtimol, lekin aniq emas: \"If you book early, you may get a discount\" (aniq emas, faqat ehtimol).",
      "\"Can\" natijada ishlatilganda ko'pincha IMKONIYAT yoki RUXSATni bildiradi: \"If you finish your homework, you can watch TV\" (imkoniyat/ruxsat beriladi).",
      "\"If\" bandida hamon faqat Present Simple ishlatiladi, natija qismidagi modal fe'l qanday bo'lishidan qat'iy nazar: \"If we leave early, we might avoid the traffic\" (\"If we will leave\" emas)."
    ],
    "examples": [
      {
        "en": "If you book early, you may get a discount.",
        "uz": "Agar erta bron qilsangiz, chegirma olishingiz mumkin."
      },
      {
        "en": "If it stops raining, we might go for a walk.",
        "uz": "Agar yomg'ir to'xtasa, sayr qilishimiz mumkin."
      },
      {
        "en": "If you finish your work early, you can leave early.",
        "uz": "Agar ishingizni erta tugatsangiz, erta ketishingiz mumkin."
      },
      {
        "en": "If the traffic is bad, we may be a little late.",
        "uz": "Agar tirbandlik bo'lsa, biroz kech qolishimiz mumkin."
      },
      {
        "en": "If she studies hard, she will definitely pass.",
        "uz": "Agar u qattiq tayyorlansa, albatta o'tadi."
      },
      {
        "en": "If you don't book a table, we might not get a seat.",
        "uz": "Agar joy bron qilmasak, o'rin topa olmasligimiz mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "If you will book early, you may get a discount.",
        "right": "If you book early, you may get a discount.",
        "note": "\"If\" bandida \"will\" ishlatilmaydi, faqat Present Simple."
      },
      {
        "wrong": "If it stops raining, we mights go for a walk.",
        "right": "If it stops raining, we might go for a walk.",
        "note": "\"Might\" barcha shaxslar bilan bir xil shaklda qoladi, -s qo'shilmaydi."
      },
      {
        "wrong": "If you finish early, you may to leave.",
        "right": "If you finish early, you may leave.",
        "note": "Modal fe'ldan (may) keyin \"to\" qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "If the weather is nice, we ___ have a picnic.",
        "options": [
          "may",
          "will to",
          "mays",
          "are may"
        ],
        "answer": 0
      },
      {
        "q": "If you ___ hard, you will improve quickly.",
        "options": [
          "will practise",
          "practise",
          "practised",
          "practises"
        ],
        "answer": 1
      },
      {
        "q": "If she asks nicely, he ___ help her.",
        "options": [
          "might",
          "mights",
          "is might",
          "will to"
        ],
        "answer": 0
      },
      {
        "q": "If we leave now, we ___ catch the early train.",
        "options": [
          "can",
          "cans",
          "will can",
          "are can"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If you will call, I will answer.",
          "If you call, I may answer.",
          "If you calls, I may answer.",
          "If you call, I mays answer."
        ],
        "answer": 1
      }
    ]
  },
  "unless-b1": {
    "explanation": [
      "\"Unless\" — \"agar...bo'lmasa\" degan ma'noni ixcham va tabiiy tarzda ifodalaydi, aslida \"if...not\" bilan bir xil ma'noni beradi: \"We will miss the train unless we leave now\" = \"We will miss the train if we don't leave now.\"",
      "\"Unless\"dan keyin qo'shimcha \"not\" qo'shilmaydi, chunki \"unless\"ning o'zida allaqachon inkor ma'nosi bor — buni ikki marta inkor qilish katta xato hisoblanadi: \"unless we don't leave\" emas, \"unless we leave\" to'g'ri.",
      "\"Unless\" bilan qurilgan gapda ham \"if\" bandi kabi, bandning o'zida Present Simple ishlatiladi (kelajak ma'nosi bo'lsa ham): \"Unless it rains, we will go to the park.\"",
      "\"Unless\" biroz rasmiyroq va tor doiradagi shartlar uchun ishlatiladi — har doim \"if...not\" bilan almashtirib bo'lmaydi, ayniqsa gap salbiy natija haqida bo'lmasa. Umumiy qoida: \"unless\" faqat ANIQ, YAGONA istisno holatini ko'rsatganda tabiiy eshitiladi."
    ],
    "examples": [
      {
        "en": "We will miss the train unless we leave right now.",
        "uz": "Agar hozir chiqmasak, poyezdga ulgurmaymiz."
      },
      {
        "en": "I won't go to the party unless you come with me.",
        "uz": "Agar siz men bilan bormasangiz, men ziyofatga bormayman."
      },
      {
        "en": "The picnic will happen unless it rains.",
        "uz": "Agar yomg'ir yog'masa, piknik bo'ladi."
      },
      {
        "en": "She won't forgive you unless you apologise sincerely.",
        "uz": "Agar chin dildan kechirim so'ramasangiz, u sizni kechirmaydi."
      },
      {
        "en": "Unless something changes, the project will be delayed.",
        "uz": "Agar biror narsa o'zgarmasa, loyiha kechiktiriladi."
      },
      {
        "en": "You won't pass the test unless you study every day.",
        "uz": "Agar har kuni o'qimasangiz, testdan o'ta olmaysiz."
      }
    ],
    "mistakes": [
      {
        "wrong": "We will miss the train unless we don't leave now.",
        "right": "We will miss the train unless we leave now.",
        "note": "\"Unless\" o'zida inkorni ifodalaydi — qo'shimcha \"don't\" ikki marta inkor bo'lib xato yaratadi."
      },
      {
        "wrong": "Unless it will rain, we will go to the park.",
        "right": "Unless it rains, we will go to the park.",
        "note": "\"Unless\" bandida \"will\" emas, Present Simple ishlatiladi."
      },
      {
        "wrong": "I won't help unless you not apologise.",
        "right": "I won't help unless you apologise.",
        "note": "\"Unless\"dan keyin qo'shimcha inkor kerak emas."
      }
    ],
    "quiz": [
      {
        "q": "I won't sign the contract ___ I read it carefully.",
        "options": [
          "if",
          "unless",
          "when",
          "so"
        ],
        "answer": 1
      },
      {
        "q": "You will fail ___ you study more.",
        "options": [
          "if",
          "unless",
          "although",
          "when"
        ],
        "answer": 1
      },
      {
        "q": "___ it rains, the match will go ahead as planned.",
        "options": [
          "If",
          "Unless",
          "Because",
          "So"
        ],
        "answer": 1
      },
      {
        "q": "She won't come ___ we invite her personally.",
        "options": [
          "if",
          "unless",
          "when",
          "because"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Unless you don't hurry, you'll be late.",
          "Unless you hurry, you'll be late.",
          "Unless you will hurry, you'll be late.",
          "Unless hurry you, you'll be late."
        ],
        "answer": 1
      }
    ]
  },
  "third-conditional-introduction": {
    "explanation": [
      "Third Conditional o'tmishda BO'LMAGAN bir shart va uning HAM bo'lmagan, tasavvuriy natijasini tahlil qilish uchun ishlatiladi — bu haqiqatga zid, faqat \"agar shunday bo'lganida edi\" degan afsus yoki tahlil: \"If I had known, I would have called you\" (bilmagandim, shuning uchun qo'ng'iroq qilmadim).",
      "Qurilishi: If + had + fe'lning III shakli (Past Perfect), would have + fe'lning III shakli. Ikkala qism ham o'tmishga tegishli, lekin ikkalasi ham haqiqatda SODIR BO'LMAGAN.",
      "Bu zamon ko'pincha AFSUS, TANQID yoki \"boshqacha bo'lganida nima bo'lardi\" degan tasavvurni ifodalash uchun ishlatiladi: \"If she had studied harder, she would have passed the exam\" (u tayyorlanmadi, shuning uchun o'tolmadi — bu endi o'zgarmaydigan o'tmish).",
      "\"Would have\" o'rniga natija qismida \"could have\" (imkoniyat bo'lgan, lekin ishlatilmagan) yoki \"might have\" (ehtimol) ham kelishi mumkin: \"If we had left earlier, we could have avoided the traffic.\""
    ],
    "examples": [
      {
        "en": "If I had known about the meeting, I would have called you.",
        "uz": "Agar uchrashuv haqida bilganimda, sizga qo'ng'iroq qilgan bo'lardim."
      },
      {
        "en": "If she had studied harder, she would have passed the exam.",
        "uz": "Agar u qattiqroq tayyorlanganida, imtihondan o'tgan bo'lardi."
      },
      {
        "en": "We wouldn't have missed the flight if we had left earlier.",
        "uz": "Agar erta chiqqan bo'lsak, parvozga kechikmagan bo'lardik."
      },
      {
        "en": "If it hadn't rained, we would have had the picnic outside.",
        "uz": "Agar yomg'ir yog'magan bo'lsa, piknikni tashqarida o'tkazgan bo'lardik."
      },
      {
        "en": "If they had invited me, I would have gone to the party.",
        "uz": "Agar meni taklif qilishganida, ziyofatga borgan bo'lardim."
      },
      {
        "en": "If we had left earlier, we could have avoided the traffic.",
        "uz": "Agar erta chiqqanimizda, tirbandlikdan qochgan bo'lardik."
      }
    ],
    "mistakes": [
      {
        "wrong": "If I had known, I would call you.",
        "right": "If I had known, I would have called you.",
        "note": "Third Conditional natijasida \"would\" emas, \"would have + III shakl\" ishlatiladi."
      },
      {
        "wrong": "If I knew about the meeting, I would have called you.",
        "right": "If I had known about the meeting, I would have called you.",
        "note": "Third Conditional'da \"if\" bandida Past Perfect (had known) kerak, oddiy Past Simple emas."
      },
      {
        "wrong": "She would have pass the exam if she had studied.",
        "right": "She would have passed the exam if she had studied.",
        "note": "\"Would have\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "If we ___ earlier, we would have caught the train.",
        "options": [
          "left",
          "had left",
          "would leave",
          "leave"
        ],
        "answer": 1
      },
      {
        "q": "She would have called you if she ___ your number.",
        "options": [
          "had",
          "has",
          "would have",
          "have had"
        ],
        "answer": 0
      },
      {
        "q": "If I had seen him, I ___ told him the news.",
        "options": [
          "would",
          "would have",
          "will have",
          "had"
        ],
        "answer": 1
      },
      {
        "q": "We wouldn't have got lost if we ___ the map.",
        "options": [
          "used",
          "had used",
          "would use",
          "use"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If I had studied, I pass the exam.",
          "If I studied, I would have passed the exam.",
          "If I had studied, I would have passed the exam.",
          "If I had studied, I would pass the exam yesterday."
        ],
        "answer": 2
      }
    ]
  },
  "wish-present-b1": {
    "explanation": [
      "\"Wish\" + Past Simple hozirgi vaziyat boshqacha bo'lishini istashni ifodalaydi — vaziyat haqiqatda boshqacha EMAS, faqat gapiruvchi shunday bo'lishini xohlaydi: \"I wish I had more free time\" (aslida vaqtim kam, lekin ko'proq bo'lishini xohlayman).",
      "Qurilishi biroz g'ayrioddiy tuyulishi mumkin — HOZIRGI istak uchun Past Simple ishlatiladi (kelajak yoki o'tmish emas): \"I wish I lived closer to my family\" (hozir uzoqda yashayman, buni xohlamayman).",
      "\"To be\" fe'li bilan \"wish\"dan keyin ko'pincha \"were\" ishlatiladi, hatto \"I/he/she/it\" bilan ham (rasmiyroq, \"unreal\" holatni ta'kidlash uchun): \"I wish I were taller\" (\"I wish I was taller\" ham so'zlashuvda ishlatiladi, lekin \"were\" grammatik jihatdan afzalroq hisoblanadi).",
      "\"Wish\" + \"could\" qobiliyat yoki imkoniyat yo'qligidan afsuslanishni bildiradi: \"I wish I could speak French\" (hozir gaplasha olmayman, buni xohlayman)."
    ],
    "examples": [
      {
        "en": "I wish I had more free time to spend with my family.",
        "uz": "Oilam bilan o'tkazish uchun ko'proq bo'sh vaqtim bo'lishini xohlardim."
      },
      {
        "en": "She wishes she lived closer to the city centre.",
        "uz": "U shahar markaziga yaqinroq yashashini xohlaydi."
      },
      {
        "en": "I wish I were taller.",
        "uz": "Bo'yim balandroq bo'lishini xohlardim."
      },
      {
        "en": "He wishes he could speak Japanese.",
        "uz": "U yapon tilida gaplasha olishini xohlaydi."
      },
      {
        "en": "We wish we knew the answer to this question.",
        "uz": "Bu savolga javobni bilishimizni xohlardik."
      },
      {
        "en": "I wish this project didn't take so much time.",
        "uz": "Bu loyiha bunchalik ko'p vaqt olmasligini xohlardim."
      }
    ],
    "mistakes": [
      {
        "wrong": "I wish I have more free time.",
        "right": "I wish I had more free time.",
        "note": "\"Wish\" bilan hozirgi istakda Present Simple emas, Past Simple ishlatiladi."
      },
      {
        "wrong": "I wish I will speak French.",
        "right": "I wish I could speak French.",
        "note": "\"Wish\" bilan \"will\" ishlatilmaydi — qobiliyat yo'qligi uchun \"could\" ishlatiladi."
      },
      {
        "wrong": "She wish she lived closer.",
        "right": "She wishes she lived closer.",
        "note": "\"Wish\" fe'liga he/she/it bilan -es qo'shiladi (oddiy fe'l kabi)."
      }
    ],
    "quiz": [
      {
        "q": "I wish I ___ more time to relax.",
        "options": [
          "have",
          "had",
          "will have",
          "having"
        ],
        "answer": 1
      },
      {
        "q": "She wishes she ___ speak Spanish.",
        "options": [
          "can",
          "could",
          "will",
          "cans"
        ],
        "answer": 1
      },
      {
        "q": "I wish it ___ so cold today.",
        "options": [
          "isn't",
          "wasn't",
          "not is",
          "doesn't"
        ],
        "answer": 1
      },
      {
        "q": "He wishes he ___ a bigger flat.",
        "options": [
          "has",
          "had",
          "have",
          "will have"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I wish I am taller.",
          "I wish I were taller.",
          "I wish I will be taller.",
          "I wish I am being taller."
        ],
        "answer": 1
      }
    ]
  },
  "if-only-introduction-b1": {
    "explanation": [
      "\"If only\" \"wish\"ga juda o'xshaydi va deyarli bir xil grammatik qurilishga ega, lekin his-tuyg'u jihatidan KUCHLIROQ — ko'pincha kuchli afsus, hasrat yoki qattiq istakni bildiradi: \"If only the apartment were quieter\" (\"I wish\"dan ko'ra his-hayajon ko'proq).",
      "Hozirgi vaziyat haqida gapirganda qurilishi \"wish\"nikiga o'xshash: If only + Past Simple: \"If only I knew the answer\" (aslida bilmayman, va bu meni juda xafa qiladi).",
      "\"If only\" ko'pincha to'liq gapsiz, alohida undov sifatida ham ishlatiladi, ayniqsa nutqda: \"If only!\" (\"Qani endi shunday bo'lsa!\") — bu holatda gap tugallanmagan, faqat kuchli istak ifodalanadi.",
      "\"To be\" bilan \"if only\"dan keyin ham \"wish\"dagi kabi \"were\" afzal ko'riladi (barcha shaxslar bilan): \"If only I were more patient\" (\"wish\"dagi kabi qoida)."
    ],
    "examples": [
      {
        "en": "If only the apartment were quieter at night.",
        "uz": "Qani endi kechasi kvartira tinchroq bo'lsa."
      },
      {
        "en": "If only I knew the answer to this question.",
        "uz": "Qani endi bu savolga javobni bilsam."
      },
      {
        "en": "If only he had more patience with the children.",
        "uz": "Qani endi u bolalar bilan sabrliroq bo'lsa."
      },
      {
        "en": "If only we lived closer to the sea.",
        "uz": "Qani endi biz dengizga yaqinroq yashasak."
      },
      {
        "en": "If only I could remember his name.",
        "uz": "Qani endi uning ismini eslay olsam."
      },
      {
        "en": "If only this traffic would move faster.",
        "uz": "Qani endi bu tirbandlik tezroq harakatlansa."
      }
    ],
    "mistakes": [
      {
        "wrong": "If only I know the answer.",
        "right": "If only I knew the answer.",
        "note": "\"If only\" bilan hozirgi istakda Present Simple emas, Past Simple ishlatiladi (xuddi \"wish\"dagi kabi)."
      },
      {
        "wrong": "If only he has more patience.",
        "right": "If only he had more patience.",
        "note": "Hozirgi holatga afsus bildirishda Past Simple kerak."
      },
      {
        "wrong": "If only I can remember his name.",
        "right": "If only I could remember his name.",
        "note": "Hozirgi qobiliyat yo'qligiga afsus uchun \"can\" emas, \"could\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "If only I ___ more time for hobbies.",
        "options": [
          "have",
          "had",
          "will have",
          "having"
        ],
        "answer": 1
      },
      {
        "q": "If only she ___ here to see this.",
        "options": [
          "is",
          "were",
          "will be",
          "being"
        ],
        "answer": 1
      },
      {
        "q": "If only he ___ drive — we need someone tonight.",
        "options": [
          "can",
          "could",
          "will",
          "cans"
        ],
        "answer": 1
      },
      {
        "q": "If only they ___ closer to us.",
        "options": [
          "live",
          "lived",
          "will live",
          "living"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If only I know the truth.",
          "If only I knew the truth.",
          "If only I will know the truth.",
          "If only I am knowing the truth."
        ],
        "answer": 1
      }
    ]
  },
  "passive-different-tenses-b1": {
    "explanation": [
      "Passive voice barcha zamonlarda ishlatilishi mumkin — faqat \"to be\" fe'lining zamoni o'zgaradi, asosiy fe'l esa doim III shaklda (past participle) qoladi.",
      "Present Simple passive: am/is/are + III shakl (\"The office is cleaned daily\"). Past Simple passive: was/were + III shakl (\"The bridge was built in 1998\"). Present Perfect passive: have/has been + III shakl (\"The report has been sent\"). Future passive: will be + III shakl (\"The results will be announced tomorrow\").",
      "Har bir zamonda \"to be\" o'zgaradi, lekin qolgan qism bir xil qoladi — bu qoidani bir marta tushunib olsangiz, barcha zamonlarga qo'llash oson: [tegishli zamondagi \"to be\"] + [fe'lning III shakli].",
      "Modal fe'llar bilan ham passive ishlatiladi: modal + be + III shakl: \"This form must be signed by both parties\" (bu forma imzolanishi shart)."
    ],
    "examples": [
      {
        "en": "The bridge was built in 1998 by a Japanese company.",
        "uz": "Bu ko'prik 1998 yilda yapon kompaniyasi tomonidan qurilgan."
      },
      {
        "en": "The report has been sent to all the managers.",
        "uz": "Hisobot barcha menejerlarga yuborilgan."
      },
      {
        "en": "The results will be announced next Friday.",
        "uz": "Natijalar keyingi juma kuni e'lon qilinadi."
      },
      {
        "en": "This document must be signed before Monday.",
        "uz": "Bu hujjat dushanbagacha imzolanishi shart."
      },
      {
        "en": "New employees are trained during their first week.",
        "uz": "Yangi xodimlar birinchi haftasida o'qitiladi."
      },
      {
        "en": "The email was being written when the computer crashed.",
        "uz": "Kompyuter buzilib qolganda email yozilayotgan edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The report has sent to the managers.",
        "right": "The report has been sent to the managers.",
        "note": "Present Perfect passive'da \"has been\" kerak, faqat \"has\" yetarli emas."
      },
      {
        "wrong": "The results announced next week.",
        "right": "The results will be announced next week.",
        "note": "Kelajak passive'da \"will be\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "This form must signed by the manager.",
        "right": "This form must be signed by the manager.",
        "note": "Modal fe'ldan keyin passive'da \"be\" tushirib qoldirilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "This song ___ by a famous singer last year.",
        "options": [
          "recorded",
          "was recorded",
          "has recorded",
          "recording"
        ],
        "answer": 1
      },
      {
        "q": "The new policy ___ next month.",
        "options": [
          "will announce",
          "will be announced",
          "announces",
          "is announce"
        ],
        "answer": 1
      },
      {
        "q": "All the invitations ___ already.",
        "options": [
          "have sent",
          "have been sent",
          "sent",
          "are sending"
        ],
        "answer": 1
      },
      {
        "q": "This machine ___ used every day.",
        "options": [
          "is",
          "has",
          "was be",
          "does"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The letter written yesterday.",
          "The letter was written yesterday.",
          "The letter has write yesterday.",
          "The letter is write yesterday."
        ],
        "answer": 1
      }
    ]
  },
  "reported-statements-b1": {
    "explanation": [
      "O'zlashtirma darak gaplarda boshqa odamning aytgan gapini takrorlashda ZAMON ORQAGA SURILADI (backshift), OLMOSHLAR va VAQT/JOY BELGILARI ham nuqtai nazarga moslashtiriladi.",
      "Zamon o'zgarishi jadval bo'yicha: Present Simple → Past Simple, Present Continuous → Past Continuous, Present Perfect → Past Perfect, will → would, can → could. Masalan: Nina aytgan \"I need help\" (Present) — reported speech'da \"Nina said that she needed help\" (Past) bo'ladi.",
      "Vaqt va joy belgilari ham o'zgaradi: today → that day, tomorrow → the next day, here → there, this → that, yesterday → the day before. Bu — kontekst o'zgarganini (aytilgan payt bilan qayta aytilayotgan payt bir xil emasligini) ko'rsatadi.",
      "Agar gap HALI HAM to'g'ri, umumiy fakt yoki o'zgarmas haqiqat bo'lsa, zamonni orqaga surish shart emas: \"She said that the Earth goes round the Sun\" (bu doim to'g'ri, backshift qilinmasligi mumkin)."
    ],
    "examples": [
      {
        "en": "Nina said that she needed help with the project.",
        "uz": "Nina loyihada yordam kerakligini aytdi."
      },
      {
        "en": "He said that he would call me the next day.",
        "uz": "U ertasi kuni menga qo'ng'iroq qilishini aytdi."
      },
      {
        "en": "She told me that she had already finished the report.",
        "uz": "U menga hisobotni allaqachon tugatganini aytdi."
      },
      {
        "en": "They said that they were leaving that evening.",
        "uz": "Ular o'sha kuni kechqurun ketishlarini aytishdi."
      },
      {
        "en": "My colleague said that he couldn't attend the meeting.",
        "uz": "Hamkasbim uchrashuvda qatnasha olmasligini aytdi."
      },
      {
        "en": "She said that she liked the new office.",
        "uz": "U yangi ofisni yoqtirganini aytdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Nina said that she needs help.",
        "right": "Nina said that she needed help.",
        "note": "Reported speech'da zamon orqaga suriladi — Present emas, Past ishlatiladi."
      },
      {
        "wrong": "He said that he will call tomorrow.",
        "right": "He said that he would call the next day.",
        "note": "\"Will\" → \"would\"ga o'zgaradi, \"tomorrow\" → \"the next day\"ga o'zgaradi."
      },
      {
        "wrong": "She told that she was tired.",
        "right": "She told me that she was tired.",
        "note": "\"Tell\" fe'lidan keyin kimga aytilgani ko'rsatilishi kerak (me, him, her)."
      }
    ],
    "quiz": [
      {
        "q": "He said that he ___ to the gym every day.",
        "options": [
          "goes",
          "went",
          "go",
          "going"
        ],
        "answer": 1
      },
      {
        "q": "She said that she ___ finished her homework.",
        "options": [
          "has",
          "had",
          "have",
          "having"
        ],
        "answer": 1
      },
      {
        "q": "They told us that they ___ come to the party.",
        "options": [
          "can't",
          "couldn't",
          "cann't",
          "not can"
        ],
        "answer": 1
      },
      {
        "q": "He said that he ___ me the next day.",
        "options": [
          "will call",
          "would call",
          "calls",
          "called to"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She said that she is happy.",
          "She said that she was happy.",
          "She said she happy.",
          "She said that happy she was."
        ],
        "answer": 1
      }
    ]
  },
  "reported-questions-b1": {
    "explanation": [
      "O'zlashtirma savollarda ODDIY GAP TARTIBI saqlanadi (savol tartibi emas) va yordamchi fe'l (do/does/did) tushirib qoldiriladi — bu B1 darajasidagi eng ko'p xato qilinadigan mavzulardan biri.",
      "So'roq so'zi (where, what, why) bilan boshlangan savollar: to'g'ridan-to'g'ri savol \"Where do you work?\" — reported speech'da \"He asked where I worked\" bo'ladi (\"where do I work\" emas — savol tartibi yo'qoladi, \"do\" tushiriladi).",
      "\"Ha/yo'q\" javob talab qiluvchi savollar (so'roq so'zisiz) \"if\" yoki \"whether\" bilan qayta beriladi: \"Are you coming?\" → \"She asked if I was coming.\"",
      "Zamon backshift qoidasi bu yerda ham amal qiladi — savol qismidagi fe'l ham orqaga suriladi: \"Where do you live?\" → \"He asked where I lived\" (Present → Past)."
    ],
    "examples": [
      {
        "en": "He asked where I worked.",
        "uz": "U mendan qayerda ishlashimni so'radi."
      },
      {
        "en": "She asked me if I was coming to the party.",
        "uz": "U mendan ziyofatga kelishimni-kelmasligimni so'radi."
      },
      {
        "en": "They asked what time the shop closed.",
        "uz": "Ular do'kon soat nechada yopilishini so'rashdi."
      },
      {
        "en": "My manager asked why I was late.",
        "uz": "Menejerim nega kech qolganimni so'radi."
      },
      {
        "en": "She asked whether I had finished the report.",
        "uz": "U hisobotni tugatganimni-tugatmaganimni so'radi."
      },
      {
        "en": "He asked how long the meeting would take.",
        "uz": "U uchrashuv qancha vaqt olishini so'radi."
      }
    ],
    "mistakes": [
      {
        "wrong": "He asked where did I work.",
        "right": "He asked where I worked.",
        "note": "O'zlashtirma savolda oddiy gap tartibi saqlanadi — \"did\" qo'shilmaydi."
      },
      {
        "wrong": "She asked am I coming to the party.",
        "right": "She asked if I was coming to the party.",
        "note": "\"Ha/yo'q\" savolda \"if/whether\" qo'shiladi va oddiy gap tartibi ishlatiladi."
      },
      {
        "wrong": "They asked what time did the shop close.",
        "right": "They asked what time the shop closed.",
        "note": "So'roq so'zidan keyin ham yordamchi fe'l (did) tushiriladi."
      }
    ],
    "quiz": [
      {
        "q": "He asked me where I ___.",
        "options": [
          "do live",
          "lived",
          "live",
          "did live"
        ],
        "answer": 1
      },
      {
        "q": "She asked ___ I liked the film.",
        "options": [
          "that",
          "if",
          "when",
          "so"
        ],
        "answer": 1
      },
      {
        "q": "They asked what time the train ___.",
        "options": [
          "did leave",
          "leaves",
          "left",
          "leaving"
        ],
        "answer": 2
      },
      {
        "q": "My teacher asked why I ___ late.",
        "options": [
          "was",
          "am",
          "did was",
          "were"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He asked where did she work.",
          "He asked where she worked.",
          "He asked where she works.",
          "He asked where does she work."
        ],
        "answer": 1
      }
    ]
  },
  "reported-commands-b1": {
    "explanation": [
      "O'zlashtirma buyruq va iltimoslarda asosiy gapdagi buyruq fe'li \"to-infinitive\" bilan almashtiriladi — bu \"reported statements\"dagi backshift qoidasidan MUTLAQO farq qiladi, chunki bu yerda zamon emas, fe'l shakli o'zgaradi.",
      "Qurilishi: told/asked + object (kimga) + to + fe'l: \"Close the door\" → \"The coach told us to close the door.\" \"Object\" (us, him, her) buyruq qaratilgan shaxsni ko'rsatadi.",
      "Inkor buyruq uchun \"not to\" ishlatiladi: \"Don't be late\" → \"She told me not to be late\" (\"to not be late\" emas — \"not\" \"to\"dan OLDIN keladi).",
      "\"Tell\" — buyruq berish uchun, \"ask\" — iltimos qilish uchun ko'proq ishlatiladi, lekin ikkalasi ham xuddi shu qurilishda: object + to + fe'l. Farq faqat ohang (qat'iy buyruqmi yoki muloyim iltimosmi)."
    ],
    "examples": [
      {
        "en": "The coach told us to wait outside the gym.",
        "uz": "Murabbiy bizga zal tashqarisida kutishni buyurdi."
      },
      {
        "en": "She asked me to close the window.",
        "uz": "U mendan derazani yopishimni iltimos qildi."
      },
      {
        "en": "The teacher told the students to open their books.",
        "uz": "O'qituvchi talabalarga kitoblarini ochishni buyurdi."
      },
      {
        "en": "He asked us not to make any noise.",
        "uz": "U bizdan shovqin qilmaslikni iltimos qildi."
      },
      {
        "en": "My mother told me to clean my room.",
        "uz": "Onam menga xonamni tozalashimni buyurdi."
      },
      {
        "en": "The doctor advised him to rest for a week.",
        "uz": "Shifokor unga bir hafta dam olishni maslahat berdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The coach told us wait outside.",
        "right": "The coach told us to wait outside.",
        "note": "\"Told + object\"dan keyin \"to\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "She asked me not close the window.",
        "right": "She asked me not to close the window.",
        "note": "Inkor buyruqda \"not\" \"to\"dan oldin keladi, \"to\" tushirilmaydi."
      },
      {
        "wrong": "He told to us to wait.",
        "right": "He told us to wait.",
        "note": "\"Tell\"dan keyin \"to\" qo'shilmaydi, to'g'ridan-to'g'ri object (us) keladi."
      }
    ],
    "quiz": [
      {
        "q": "The teacher told the students ___ their phones away.",
        "options": [
          "put",
          "to put",
          "putting",
          "puts"
        ],
        "answer": 1
      },
      {
        "q": "She asked him ___ so much noise.",
        "options": [
          "not making",
          "to not make",
          "not to make",
          "don't make"
        ],
        "answer": 2
      },
      {
        "q": "My father told me ___ home before ten.",
        "options": [
          "come",
          "to come",
          "coming",
          "comes"
        ],
        "answer": 1
      },
      {
        "q": "The doctor advised her ___ more water.",
        "options": [
          "drink",
          "to drink",
          "drinking",
          "drinks"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He told me wait here.",
          "He told me to wait here.",
          "He told to me wait here.",
          "He told me waiting here."
        ],
        "answer": 1
      }
    ]
  },
  "defining-relative-clauses-b1": {
    "explanation": [
      "Defining relative clause (aniqlovchi ergash gap) ZARUR ma'lumot beradi — u tushirilsa, gapning ma'nosi noaniq bo'lib qoladi, chunki u aynan QAYSI odam yoki narsa nazarda tutilganini ko'rsatadi: \"The app that tracks my habits is free\" (bu — MA'LUM bir ilova, boshqasi emas).",
      "Bu turdagi clause OLDIDAN vergul QO'YILMAYDI, chunki u asosiy gapning ajralmas, zarur qismi hisoblanadi: \"The woman who called yesterday is my aunt\" (vergulsiz).",
      "\"That\" defining clause'da \"who/which\" o'rniga ham ishlatilishi mumkin va so'zlashuv nutqida ko'proq tabiiy eshitiladi: \"The book that I'm reading is fascinating.\"",
      "Agar relative pronoun gapda TO'LDIRUVCHI (object) vazifasini bajarsa, u tushirib qoldirilishi mumkin: \"The book (that) I'm reading is fascinating\" — bu yerda \"that\" tushirilishi mumkin, chunki \"I\" allaqachon ega vazifasini bajaryapti."
    ],
    "examples": [
      {
        "en": "The app that tracks my habits is completely free.",
        "uz": "Mening odatlarimni kuzatib boradigan ilova butunlay bepul."
      },
      {
        "en": "The woman who called yesterday is my aunt.",
        "uz": "Kecha qo'ng'iroq qilgan ayol mening xolam."
      },
      {
        "en": "This is the restaurant that we visited last month.",
        "uz": "Bu — biz o'tgan oy borgan restoran."
      },
      {
        "en": "The book I'm reading is really fascinating.",
        "uz": "Men o'qiyotgan kitob juda qiziqarli."
      },
      {
        "en": "I need a phone that has a good camera.",
        "uz": "Menga yaxshi kamerali telefon kerak."
      },
      {
        "en": "The man who fixed our car did a great job.",
        "uz": "Mashinamizni tuzatgan usta juda yaxshi ish qildi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The app, that tracks my habits, is free.",
        "right": "The app that tracks my habits is free.",
        "note": "Defining relative clause oldidan vergul qo'yilmaydi — u zarur ma'lumot beradi."
      },
      {
        "wrong": "The woman which called yesterday is my aunt.",
        "right": "The woman who called yesterday is my aunt.",
        "note": "Odam haqida \"which\" emas, \"who\" (yoki \"that\") ishlatiladi."
      },
      {
        "wrong": "This is restaurant that we visited.",
        "right": "This is the restaurant that we visited.",
        "note": "\"Restaurant\" oldidan aniqlovchi \"the\" tushirib qoldirilmasligi kerak, chunki u endi relative clause bilan aniq belgilangan."
      }
    ],
    "quiz": [
      {
        "q": "The teacher ___ taught me maths retired last year.",
        "options": [
          "which",
          "who",
          "whose",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "This is the film ___ everyone is talking about.",
        "options": [
          "who",
          "that",
          "whose",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "I lost the pen ___ my father gave me.",
        "options": [
          "who",
          "that",
          "whose",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "The company ___ hired me is based in Tashkent.",
        "options": [
          "which",
          "who",
          "whom",
          "what"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The man, who called, is my boss.",
          "The man who called is my boss.",
          "The man which called is my boss.",
          "The man whom called is my boss."
        ],
        "answer": 1
      }
    ]
  },
  "non-defining-relative-clauses-b1": {
    "explanation": [
      "Non-defining relative clause (izohlovchi ergash gap) QO'SHIMCHA, MA'NONI ANIQLASH UCHUN ZARUR BO'LMAGAN ma'lumot beradi — u tushirilsa ham, gapning asosiy ma'nosi tushunarli qoladi: \"Samarkand, which attracts many visitors, is historic\" (\"Samarkand is historic\" gapi o'zi tushunarli, qo'shimcha ma'lumot faqat izoh).",
      "Bu turdagi clause har doim VERGUL bilan ajratiladi — gap o'rtasida bo'lsa ikkita vergul, gap oxirida bo'lsa bitta: \"My brother, who lives in London, is visiting us next week.\"",
      "MUHIM FARQ: non-defining clause'da \"that\" ISHLATILMAYDI, faqat \"who/which\" ishlatiladi — bu defining clause'dan asosiy farqlaridan biri.",
      "Non-defining clause odatda MA'LUM, YAGONA narsa yoki odam (xos ism, allaqachon aniq narsa) haqida qo'shimcha izoh berish uchun ishlatiladi — chunki bunday narsani \"aniqlash\" shart emas, u allaqachon aniq."
    ],
    "examples": [
      {
        "en": "Samarkand, which attracts many visitors, is a historic city.",
        "uz": "Ko'plab tashrif buyuruvchilarni jalb qiladigan Samarqand — tarixiy shahar."
      },
      {
        "en": "My brother, who lives in London, is visiting us next week.",
        "uz": "Londonda yashaydigan akam keyingi hafta bizga tashrif buyuradi."
      },
      {
        "en": "The Nile, which is the longest river in Africa, flows through Egypt.",
        "uz": "Afrikaning eng uzun daryosi bo'lgan Nil Misr orqali oqadi."
      },
      {
        "en": "This book, which I bought last week, is already a bestseller.",
        "uz": "O'tgan hafta sotib olgan bu kitobim allaqachon bestsellerga aylandi."
      },
      {
        "en": "My colleague, whose office is next to mine, is on holiday.",
        "uz": "Ofisi meniki bilan yonma-yon bo'lgan hamkasbim ta'tilda."
      },
      {
        "en": "The company, which was founded in 1990, now has offices worldwide.",
        "uz": "1990 yilda tashkil etilgan kompaniya endi dunyo bo'ylab ofislarga ega."
      }
    ],
    "mistakes": [
      {
        "wrong": "Samarkand which attracts many visitors is historic.",
        "right": "Samarkand, which attracts many visitors, is historic.",
        "note": "Non-defining relative clause vergul bilan ajratilishi shart."
      },
      {
        "wrong": "My brother, that lives in London, is visiting us.",
        "right": "My brother, who lives in London, is visiting us.",
        "note": "Non-defining clause'da \"that\" ishlatilmaydi, faqat \"who/which\"."
      },
      {
        "wrong": "The Nile which is the longest river flows through Egypt.",
        "right": "The Nile, which is the longest river, flows through Egypt.",
        "note": "Qo'shimcha, zarur bo'lmagan ma'lumot vergul bilan ajratilishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "My sister, ___ works as a doctor, lives in Bukhara.",
        "options": [
          "that",
          "who",
          "which",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "This laptop, ___ I bought last year, still works perfectly.",
        "options": [
          "that",
          "which",
          "who",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "London, ___ is the capital of England, has millions of visitors every year.",
        "options": [
          "that",
          "which",
          "who",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "My uncle, ___ car broke down yesterday, needs a lift to work.",
        "options": [
          "who",
          "which",
          "whose",
          "that"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Tashkent, that is the capital, is a large city.",
          "Tashkent, which is the capital, is a large city.",
          "Tashkent which is the capital is a large city.",
          "Tashkent that is the capital is a large city."
        ],
        "answer": 1
      }
    ]
  },
  "verb-patterns-b1": {
    "explanation": [
      "Ba'zi fe'llardan keyin ikkinchi fe'lning shakli (to-infinitive yoki gerund) fe'lning MA'NOSIGA qarab tanlanadi — bu ro'yxatni yodlashdan tashqari, ba'zi umumiy naqshlarni bilish ham foydali.",
      "Avoid, deny, admit, suggest, risk kabi fe'llar deyarli doim gerund (-ing) talab qiladi: \"She avoided answering the question\" (\"to answer\" emas).",
      "Ba'zi fe'llar (remember, stop, try, forget) ham to-infinitive, ham gerund qabul qiladi, lekin MA'NO O'ZGARADI: \"I stopped smoking\" (chekishni tashladim) ≠ \"I stopped to smoke\" (chekish uchun to'xtadim — boshqa ish qilayotgan edim, chekish uchun to'xtadim).",
      "\"Remember + gerund\" — o'tmishdagi harakatni ESLASH (\"I remember locking the door\" — eshikni qulflaganimni eslayman), \"remember + to-infinitive\" — kelajakdagi vazifani UNUTMASLIK (\"Remember to lock the door\" — eshikni qulflashni unutma)."
    ],
    "examples": [
      {
        "en": "She avoided answering the difficult question.",
        "uz": "U qiyin savolga javob berishdan qochdi."
      },
      {
        "en": "He admitted making a mistake in the report.",
        "uz": "U hisobotda xato qilganini tan oldi."
      },
      {
        "en": "I stopped smoking two years ago.",
        "uz": "Men ikki yil oldin chekishni tashladim."
      },
      {
        "en": "On the way home, I stopped to buy some bread.",
        "uz": "Uyga qaytishda non sotib olish uchun to'xtadim."
      },
      {
        "en": "I remember locking the door before we left.",
        "uz": "Ketishdan oldin eshikni qulflaganimni eslayman."
      },
      {
        "en": "Please remember to send me the file tomorrow.",
        "uz": "Iltimos, ertaga fayl yuborishni unutmang."
      }
    ],
    "mistakes": [
      {
        "wrong": "She avoided to answer the question.",
        "right": "She avoided answering the question.",
        "note": "\"Avoid\"dan keyin to-infinitive emas, gerund ishlatiladi."
      },
      {
        "wrong": "He admitted to make a mistake.",
        "right": "He admitted making a mistake.",
        "note": "\"Admit\"dan keyin gerund ishlatiladi, to-infinitive emas."
      },
      {
        "wrong": "Remember send me the file tomorrow.",
        "right": "Remember to send me the file tomorrow.",
        "note": "Kelajakdagi vazifani eslatishda \"remember + to-infinitive\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "He denied ___ the money.",
        "options": [
          "to take",
          "taking",
          "take",
          "took"
        ],
        "answer": 1
      },
      {
        "q": "I stopped ___ a coffee on my way to work.",
        "options": [
          "buying",
          "to buy",
          "buy",
          "bought"
        ],
        "answer": 1
      },
      {
        "q": "She suggested ___ a different approach.",
        "options": [
          "to try",
          "trying",
          "try",
          "tried"
        ],
        "answer": 1
      },
      {
        "q": "Do you remember ___ this photo? It was years ago.",
        "options": [
          "to take",
          "taking",
          "take",
          "took"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (chekishni butunlay tashladi)?",
        "options": [
          "He stopped to smoke.",
          "He stopped smoking.",
          "He stopped smoke.",
          "He stopped smoked."
        ],
        "answer": 1
      }
    ]
  },
  "question-tags-b1": {
    "explanation": [
      "Tasdiq so'roqlari (question tags) gap oxiriga qo'shiladi va tasdiqni SO'RASH yoki suhbatdoshni JAVOBGA UNDASH uchun ishlatiladi: \"You have met Ali, haven't you?\" (bu — javob tabiiy \"ha\" bo'lishini kutgan holda so'ralayotgan savol).",
      "Asosiy qoida: agar asosiy gap TASDIQ bo'lsa, tag INKOR bo'ladi; agar asosiy gap INKOR bo'lsa, tag TASDIQ bo'ladi: \"She is tired, isn't she?\" (tasdiq + inkor tag), \"She isn't tired, is she?\" (inkor + tasdiq tag).",
      "Tag'dagi yordamchi fe'l asosiy gapdagi yordamchi fe'lga MOS bo'lishi kerak: agar asosiy gapda \"have\" bo'lsa, tag ham \"have\" bo'ladi; agar oddiy Present/Past Simple bo'lsa (yordamchisiz), tag \"do/does/did\" bilan yasaladi: \"You live here, don't you?\"",
      "\"I am\" bilan maxsus istisno bor — tag \"aren't I\" bo'ladi, mantiqiy \"am I not\" emas: \"I am late, aren't I?\" — bu yagona noregular holat."
    ],
    "examples": [
      {
        "en": "You have met Ali before, haven't you?",
        "uz": "Siz Ali bilan avval uchrashgansiz, shunday emasmi?"
      },
      {
        "en": "She isn't coming to the party, is she?",
        "uz": "U ziyofatga kelmaydi, shunday emasmi?"
      },
      {
        "en": "You live near the station, don't you?",
        "uz": "Siz stansiya yaqinida yashaysiz, shunday emasmi?"
      },
      {
        "en": "This isn't the right way, is it?",
        "uz": "Bu to'g'ri yo'l emas, shundaymi?"
      },
      {
        "en": "I'm a bit late, aren't I?",
        "uz": "Men biroz kech qoldim, shunday emasmi?"
      },
      {
        "en": "They finished the project on time, didn't they?",
        "uz": "Ular loyihani vaqtida tugatishdi, shunday emasmi?"
      }
    ],
    "mistakes": [
      {
        "wrong": "You live here, do you?",
        "right": "You live here, don't you?",
        "note": "Asosiy gap tasdiq bo'lsa, tag inkor bo'lishi kerak."
      },
      {
        "wrong": "She isn't coming, isn't she?",
        "right": "She isn't coming, is she?",
        "note": "Asosiy gap inkor bo'lsa, tag tasdiq bo'lishi kerak."
      },
      {
        "wrong": "I am late, am I not?",
        "right": "I am late, aren't I?",
        "note": "\"I am\" bilan tag \"aren't I\" bo'ladi, \"am I not\" emas (yagona istisno)."
      }
    ],
    "quiz": [
      {
        "q": "You speak French, ___?",
        "options": [
          "do you",
          "don't you",
          "aren't you",
          "isn't it"
        ],
        "answer": 1
      },
      {
        "q": "She doesn't like coffee, ___?",
        "options": [
          "doesn't she",
          "does she",
          "isn't she",
          "is she"
        ],
        "answer": 1
      },
      {
        "q": "They have finished the report, ___?",
        "options": [
          "have they",
          "haven't they",
          "do they",
          "don't they"
        ],
        "answer": 1
      },
      {
        "q": "I'm right about this, ___?",
        "options": [
          "am I not",
          "aren't I",
          "isn't it",
          "am I"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He works here, works he?",
          "He works here, doesn't he?",
          "He works here, isn't he?",
          "He works here, does he?"
        ],
        "answer": 1
      }
    ]
  },
  "indirect-questions-b1": {
    "explanation": [
      "Bilvosita savollar to'g'ridan-to'g'ri savolga qaraganda MULOYIMROQ, rasmiyroq eshitiladi va odatda \"Could you tell me...\", \"Do you know...\", \"I wonder...\" kabi kirish iboralari bilan boshlanadi.",
      "Eng muhim qoida: bilvosita savol ichida ODDIY GAP TARTIBI saqlanadi, yordamchi fe'l (do/does/did) esa TUSHIRIB QOLDIRILADI: \"Where is the station?\" (to'g'ridan-to'g'ri) → \"Could you tell me where the station is?\" (bilvosita, gap tartibida).",
      "\"Ha/yo'q\" javob talab qiluvchi savollarda \"if\" yoki \"whether\" qo'shiladi: \"Is the shop open?\" → \"Do you know if the shop is open?\"",
      "Bilvosita savol gap oxirida savol belgisi (?) bilan tugaydi FAQAT agar butun gap savol bo'lsa (\"Could you tell me...?\"); agar kirish qismi darak gap bo'lsa (\"I wonder...\"), nuqta qo'yiladi."
    ],
    "examples": [
      {
        "en": "Could you tell me where the station is?",
        "uz": "Menga stansiya qayerdaligini ayta olasizmi?"
      },
      {
        "en": "Do you know what time the shop closes?",
        "uz": "Do'kon soat nechada yopilishini bilasizmi?"
      },
      {
        "en": "I wonder if she is coming to the meeting.",
        "uz": "Qiziq, u uchrashuvga keladimi?"
      },
      {
        "en": "Could you tell me how much this costs?",
        "uz": "Menga bu qancha turishini ayta olasizmi?"
      },
      {
        "en": "Do you know whether the museum is open on Mondays?",
        "uz": "Muzey dushanba kunlari ochiqmi, bilasizmi?"
      },
      {
        "en": "I'd like to know why the flight was delayed.",
        "uz": "Parvoz nega kechiktirilganini bilishni xohlardim."
      }
    ],
    "mistakes": [
      {
        "wrong": "Could you tell me where is the station?",
        "right": "Could you tell me where the station is?",
        "note": "Bilvosita savolda oddiy gap tartibi saqlanadi — \"is the station\" emas, \"the station is\"."
      },
      {
        "wrong": "Do you know what time does the shop close?",
        "right": "Do you know what time the shop closes?",
        "note": "Bilvosita savolda \"does\" tushirib qoldiriladi."
      },
      {
        "wrong": "I wonder is she coming.",
        "right": "I wonder if she is coming.",
        "note": "\"Ha/yo'q\" savolda \"if/whether\" qo'shilishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "Could you tell me where the nearest bank ___?",
        "options": [
          "is",
          "it is",
          "is it",
          "does it"
        ],
        "answer": 0
      },
      {
        "q": "Do you know what time the film ___?",
        "options": [
          "does start",
          "starts",
          "start",
          "starting"
        ],
        "answer": 1
      },
      {
        "q": "I wonder ___ he will come to the party.",
        "options": [
          "that",
          "if",
          "so",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "Do you know ___ the museum opens on Sundays?",
        "options": [
          "if",
          "that",
          "what",
          "so"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Do you know where is he?",
          "Do you know where he is?",
          "Do you know where he does live?",
          "Do you know where does he live?"
        ],
        "answer": 1
      }
    ]
  },
  "causative-introduction-b1": {
    "explanation": [
      "Causative (\"have/get + object + III shakl\") biror xizmatni O'ZIMIZ emas, BOSHQA ODAM (usta, mutaxassis) bajarganini ko'rsatadi: \"I had my phone repaired\" (men o'zim tuzatmadim, ustaga berib tuzattirdim).",
      "Qurilishi: have/get + object (narsa) + fe'lning III shakli: \"I had my hair cut\" (soch oldirdim — o'zim kesmadim, sartaroshga bordim). Fe'l III shaklda bo'lishi kerak, chunki narsa harakatga NISBATAN PASSIV — u kesiladi, o'zi kesmaydi.",
      "\"Have\" va \"get\" ma'no jihatidan bir xil, faqat \"get\" biroz norasmiyroq va so'zlashuv nutqida ko'proq ishlatiladi: \"I had my car fixed\" = \"I got my car fixed.\"",
      "Bu qurilmani oddiy passiv bilan chalkashtirmaslik kerak — causative'da MUHIM: kim uchun xizmat qilinganini (subject) va bu xizmat boshqa odam tomonidan qilinganini ta'kidlaydi, oddiy passiv esa buni ko'rsatmaydi."
    ],
    "examples": [
      {
        "en": "I had my phone repaired at a shop near my house.",
        "uz": "Uyimga yaqin do'konda telefonimni tuzattirdim."
      },
      {
        "en": "She gets her hair cut every two months.",
        "uz": "U har ikki oyda sochini oldiradi."
      },
      {
        "en": "We had our house painted last summer.",
        "uz": "O'tgan yozda uyimizni bo'yattirdik."
      },
      {
        "en": "He is going to have his car serviced this weekend.",
        "uz": "U bu hafta oxirida mashinasini texnik ko'rikdan o'tkazadi."
      },
      {
        "en": "They had their photos taken by a professional photographer.",
        "uz": "Ular kasbiy fotograf tomonidan suratga tushirildi."
      },
      {
        "en": "I need to get this document translated.",
        "uz": "Bu hujjatni tarjima qildirishim kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "I had repaired my phone.",
        "right": "I had my phone repaired.",
        "note": "Causative qurilishda object (my phone) \"have/get\"dan keyin, fe'lning III shakli esa undan keyin keladi."
      },
      {
        "wrong": "She gets cut her hair.",
        "right": "She gets her hair cut.",
        "note": "\"Get\"dan keyin object (her hair), keyin fe'lning III shakli (cut) keladi — tartib muhim."
      },
      {
        "wrong": "We had our house paint last year.",
        "right": "We had our house painted last year.",
        "note": "Causative'da fe'l III shaklda bo'lishi kerak (painted), asl shaklda emas."
      }
    ],
    "quiz": [
      {
        "q": "I need to have my car ___ before the trip.",
        "options": [
          "service",
          "serviced",
          "servicing",
          "to service"
        ],
        "answer": 1
      },
      {
        "q": "She had her wedding dress ___ by a famous designer.",
        "options": [
          "make",
          "made",
          "making",
          "to make"
        ],
        "answer": 1
      },
      {
        "q": "We are going to get the kitchen ___ next month.",
        "options": [
          "renovate",
          "renovated",
          "renovating",
          "to renovate"
        ],
        "answer": 1
      },
      {
        "q": "He gets his suits ___ at a tailor's shop.",
        "options": [
          "make",
          "made",
          "making",
          "to make"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I had my hair cut yesterday.",
          "I had cut my hair yesterday.",
          "I had my hair to cut yesterday.",
          "I had my hair cutting yesterday."
        ],
        "answer": 0
      }
    ]
  },
  "articles-general-specific-b1": {
    "explanation": [
      "Ingliz tilida 'a/an' va 'the' otning ANIQ yoki NOANIQ ekanini ko'rsatadi. 'A/an' — ko'plab bir xil narsalardan BIRI, tinglovchi aynan qaysi birini bilmaydi yoki bu muhim emas: \"I need a pen\" (istalgan ruchka, farqi yo'q). 'The' esa — gapiruvchi ham, tinglovchi ham AYNAN QAYSI narsa haqida gap ketayotganini biladi: \"Where is the pen?\" (allaqachon tanish, aniq ruchka).",
      "Eng muhim qoida — BIRINCHI VA IKKINCHI TILGA OLISH: bir narsa gapda birinchi marta tilga olinganda 'a/an' bilan keladi, keyingi safar esa u endi tanish bo'lgani uchun 'the' bilan aytiladi: \"I bought a book, and the book was excellent\" — ikkinchi gapda gapiruvchi ham, tinglovchi ham qaysi kitob haqida gap borayotganini biladi.",
      "'The' otning nazarda tutilgan ma'nosi vaziyatdan yoki dunyoda yagona ekanidan ham kelib chiqishi mumkin: xonada bitta eshik bo'lsa — 'the door', quyosh yagona bo'lgani uchun — 'the sun'. Orttirma daraja (the best, the tallest) va tartib sonlar (the first, the second) oldidan ham doim 'the' keladi.",
      "Umumiy fikr — biror turkumning HAMMASI haqida gapirilganda (aynan bitta a'zosi emas) — otdan oldin hech qanday artikl qo'yilmaydi: \"Lions are powerful animals\" (umuman sherlar haqida). Lekin xuddi shu so'z aniq, ma'lum guruh haqida bo'lsa — 'the' qaytadi: \"The lions in this zoo look tired\" (aynan shu hayvonot bog'idagi sherlar)."
    ],
    "examples": [
      {
        "en": "I bought a book, and the book was excellent.",
        "uz": "Men bir kitob sotib oldim va o'sha kitob juda ajoyib chiqdi."
      },
      {
        "en": "Lions are powerful animals, but the lions in this zoo look tired.",
        "uz": "Sherlar kuchli hayvonlar, lekin shu hayvonot bog'idagi sherlar charchagandek ko'rinadi."
      },
      {
        "en": "A strange man is standing near the shop. The man is wearing a long black coat.",
        "uz": "Do'kon yonida g'alati bir erkak turibdi. O'sha erkak uzun qora palto kiygan."
      },
      {
        "en": "Could you close the door? There's a cold wind outside.",
        "uz": "Eshikni yopib qo'yasizmi? Tashqarida sovuq shamol esib turibdi."
      },
      {
        "en": "She is the most talented singer in the competition.",
        "uz": "U tanlovdagi eng iqtidorli qo'shiqchi."
      },
      {
        "en": "The sun rises in the east and sets in the west.",
        "uz": "Quyosh sharqdan chiqib, g'arbda botadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The dogs are loyal animals.",
        "right": "Dogs are loyal animals.",
        "note": "Umumiy fikr bildirilganda (barcha itlar haqida) ot oldida artikl qo'yilmaydi — 'the' faqat aniq, ma'lum itlar haqida gapirilganda ishlatiladi."
      },
      {
        "wrong": "I bought book yesterday.",
        "right": "I bought a book yesterday.",
        "note": "Birinchi marta tilga olinayotgan, noaniq birlik ot uchun 'a/an' majburiy."
      },
      {
        "wrong": "She is best student in the class.",
        "right": "She is the best student in the class.",
        "note": "Orttirma daraja (superlative: the best, the tallest) oldidan doim 'the' keladi."
      }
    ],
    "quiz": [
      {
        "q": "I saw ___ interesting film last night; ___ film was about space travel.",
        "options": [
          "a / the",
          "the / a",
          "a / a",
          "the / the"
        ],
        "answer": 0
      },
      {
        "q": "___ Moon travels around ___ Earth.",
        "options": [
          "A / an",
          "The / the",
          "A / the",
          "The / a"
        ],
        "answer": 1
      },
      {
        "q": "He is ___ tallest boy in our school.",
        "options": [
          "a",
          "an",
          "the",
          "some"
        ],
        "answer": 2
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "The tigers are dangerous animals in general.",
          "Tigers are dangerous animals in general.",
          "A tigers are dangerous animals in general.",
          "Tiger are dangerous animals in general."
        ],
        "answer": 1
      },
      {
        "q": "Can you shut ___ door? It's getting cold in here.",
        "options": [
          "a",
          "an",
          "the",
          "some"
        ],
        "answer": 2
      }
    ]
  },
  "determiners-b1": {
    "explanation": [
      "Determiner — otdan oldin kelib, u haqida 'qanchalik' yoki 'qaysi' ekanini aniqlaydigan so'z. Bu darsda to'rtta muhim determinerni ko'ramiz: each (har biri, alohida-alohida), every (har biri, umumiy), either (ikkitadan biri) va neither (ikkitadan hech biri). Ularning barchasi keyin BIRLIK ot va BIRLIK fe'l talab qiladi — bu ularning eng muhim xususiyati.",
      "'Each' va 'every' ma'no jihatdan yaqin, lekin farqi bor: 'each' guruh a'zolarini BITTA-BITTA, alohida ko'rib chiqadi, ko'pincha kichik yoki aniq sondagi guruhlarda ishlatiladi va 'each of' qurilishi mumkin: \"Each of the rooms has a view\". 'Every' esa guruhni YAXLIT holda, umumiy qoida sifatida ko'rib chiqadi — lekin 'every of' degan qurilish MAVJUD EMAS.",
      "'Either' va 'neither' ikkita narsa haqida gapirganda ishlatiladi: 'either' — ikkitadan istalgan biri (\"Either day is fine\" — ikkala kun ham mos), 'neither' esa — ikkitadan hech biri, va bu so'zning o'zida allaqachon inkor ma'nosi bor, shuning uchun uni 'not' bilan qo'shib ishlatish shart emas: \"Neither answer is correct\" (\"Neither answer isn't correct\" emas).",
      "Muhim farq: 'each', 'every', 'either', 'neither' — birlik fe'l bilan, lekin 'both' (ikkalasi ham) — ko'plik fe'l bilan ishlatiladi, chunki u ikkala narsani birgalikda nazarda tutadi: \"Both answers are correct\" (are, is emas). Bu so'zlarni ikki guruhga ajratib yodlab olish xatolarni sezilarli kamaytiradi."
    ],
    "examples": [
      {
        "en": "Each student received a certificate at the end of the course.",
        "uz": "Kurs oxirida har bir talaba sertifikat oldi."
      },
      {
        "en": "Every shop on this street closes at nine in the evening.",
        "uz": "Bu ko'chadagi har bir do'kon kechqurun soat to'qqizda yopiladi."
      },
      {
        "en": "Either bus will take you to the station — they both go there.",
        "uz": "Ikkala avtobusdan istalgani sizni bekatga olib boradi — ikkalasi ham o'sha yerga boradi."
      },
      {
        "en": "Neither answer was correct, so the teacher explained the rule again.",
        "uz": "Ikkala javob ham to'g'ri emas edi, shuning uchun o'qituvchi qoidani yana tushuntirdi."
      },
      {
        "en": "Both candidates have strong experience, but only one will get the job.",
        "uz": "Ikkala nomzod ham katta tajribaga ega, lekin faqat bittasi ishga qabul qilinadi."
      },
      {
        "en": "Each of the rooms in this hotel has a wonderful view of the sea.",
        "uz": "Bu mehmonxonadagi xonalarning har biri dengizga ajoyib manzaraga ega."
      }
    ],
    "mistakes": [
      {
        "wrong": "Each students has a locker.",
        "right": "Each student has a locker.",
        "note": "'Each' dan keyin ot birlikda keladi, ko'plikda emas."
      },
      {
        "wrong": "Every students like this teacher.",
        "right": "Every student likes this teacher.",
        "note": "'Every' doim birlik ot va birlik fe'l bilan ishlatiladi ('likes', 'like' emas)."
      },
      {
        "wrong": "Neither of the answers were correct.",
        "right": "Neither of the answers was correct.",
        "note": "'Neither' ikkita narsa haqida bo'lsa ham, birlik fe'l ('was') talab qiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ answer you choose, you will get one point for trying.",
        "options": [
          "Either",
          "Each",
          "Neither",
          "Both"
        ],
        "answer": 0
      },
      {
        "q": "I don't like ___ of these two shirts — can I see another one?",
        "options": [
          "either",
          "neither",
          "each",
          "every"
        ],
        "answer": 0
      },
      {
        "q": "___ of the two answers was correct, so nobody won the prize.",
        "options": [
          "Neither",
          "Either",
          "Each",
          "None"
        ],
        "answer": 0
      },
      {
        "q": "___ trains were late this morning, so everyone missed the meeting.",
        "options": [
          "Both",
          "Either",
          "Neither",
          "Each"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "Neither of the boys were late.",
          "Every of the boys was late.",
          "Each of the boys was late.",
          "Both of the boys was late."
        ],
        "answer": 2
      }
    ]
  },
  "quantifiers-b1": {
    "explanation": [
      "Miqdorni ifodalovchi so'zlar otning turiga qarab tanlanadi: sanaladigan ko'plik otlar bilan 'few / a few' (books, seats), sanalmaydigan otlar bilan 'little / a little' (money, time) ishlatiladi. 'Plenty of' esa ikkalasi bilan ham ishlatilaveradi.",
      "'Few' va 'a few' bir xil yozilsa ham, ma'nosi tubdan farq qiladi: 'a few' — ijobiy ma'noda, kichik lekin YETARLI miqdor (\"I have a few questions\" — bir nechta savolim bor, bu normal). 'Few' esa (artiklsiz) — salbiy ohangda, kutilganidan KAM, deyarli yo'q degan ma'noni beradi: \"Few people came\" (juda kam odam keldi, afsuski).",
      "Xuddi shu farq sanalmaydigan otlarda 'little' va 'a little' orasida ham bor: \"There's a little sugar left\" (biroz shakar bor, yetadi) — ijobiy; \"We have little time\" (deyarli vaqt qolmadi) — salbiy, xavotirli ohang.",
      "'Plenty of' — 'yetarlicha, hattoki ortiqcha' degan ijobiy ma'noni bildiradi va tasdiq gapda 'much/many'dan ko'ra tabiiyroq eshitiladi: \"We have plenty of time\" (much emas). 'Much' asosan savol va inkor gaplarda, yoki rasmiy uslubda ishlatiladi."
    ],
    "examples": [
      {
        "en": "We still have plenty of options, so don't worry about the deadline.",
        "uz": "Bizda hali yetarlicha variant bor, shuning uchun muddat haqida xavotirlanmang."
      },
      {
        "en": "I have a few questions about the contract before I sign it.",
        "uz": "Shartnomani imzolashdan oldin bir nechta savolim bor."
      },
      {
        "en": "Few people showed up to the meeting because of the storm.",
        "uz": "Bo'ron sababli yig'ilishga juda kam odam keldi."
      },
      {
        "en": "There's a little sugar left in the jar — enough for one cup of tea.",
        "uz": "Bankada biroz shakar qoldi — bir chashka choy uchun yetadi."
      },
      {
        "en": "We have little time before the flight, so let's hurry.",
        "uz": "Parvozgacha deyarli vaqtimiz qolmadi, shuning uchun shoshilaylik."
      },
      {
        "en": "The company has plenty of experienced staff to handle the project.",
        "uz": "Kompaniyada bu loyihani boshqarish uchun yetarlicha tajribali xodimlar bor."
      }
    ],
    "mistakes": [
      {
        "wrong": "I have few good friends and I'm happy about it.",
        "right": "I have a few good friends and I'm happy about it.",
        "note": "Ijobiy ma'noda ('yetarli, yaxshi') — 'a few' kerak; 'few' (artiklsiz) salbiy, 'deyarli yo'q' degan ma'no beradi."
      },
      {
        "wrong": "There is little books on the shelf.",
        "right": "There are few books on the shelf.",
        "note": "'Books' sanaladigan ot (ko'plik) — 'little' emas, 'few' ishlatiladi; 'little' faqat sanalmaydigan otlar bilan keladi."
      },
      {
        "wrong": "We have much friends in this city.",
        "right": "We have plenty of / a lot of friends in this city.",
        "note": "'Much' faqat sanalmaydigan otlar bilan keladi; sanaladigan ko'plik bilan tasdiq gapda 'many' yoki 'a lot of / plenty of' tabiiyroq."
      }
    ],
    "quiz": [
      {
        "q": "I have ___ money, so I can't buy this expensive jacket.",
        "options": [
          "a little",
          "little",
          "a few",
          "few"
        ],
        "answer": 1
      },
      {
        "q": "She has ___ close friends, and she trusts them completely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "answer": 1
      },
      {
        "q": "There are ___ empty seats — let's sit at the back.",
        "options": [
          "a little",
          "little",
          "a few",
          "much"
        ],
        "answer": 2
      },
      {
        "q": "Don't worry, we have ___ time before the train leaves.",
        "options": [
          "plenty of",
          "few",
          "many",
          "little"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "We have little apples left.",
          "We have few apples left.",
          "We have a little apples left.",
          "We have much apples left."
        ],
        "answer": 1
      }
    ]
  },
  "although-despite-b1": {
    "explanation": [
      "Kutilmagan qarama-qarshilikni ('...bo'lsa-da', '...ga qaramay') ifodalash uchun 'although/though' va 'despite/in spite of' ishlatiladi. Ularning ma'nosi bir xil, lekin GRAMMATIK QURILISHI butunlay farq qiladi — buni chalkashtirish B1 darajasida eng ko'p uchraydigan xato.",
      "'Although', 'though' va 'even though'dan keyin to'liq GAP (ega + kesim) keladi: \"Although it was late, we continued working\" (garchi kech bo'lsa-da). 'Even though' — 'although'ning kuchliroq shakli. 'Though' esa ko'proq og'zaki uslubda, hatto gap OXIRIGA ham qo'yilishi mumkin: \"It was expensive. It was worth it, though.\"",
      "'Despite' va 'in spite of'dan keyin esa faqat OT yoki -ing shakli keladi, to'liq gap EMAS: \"Despite the heavy traffic, we arrived on time\" (ot bilan) yoki \"Despite feeling nervous, he spoke confidently\" (-ing bilan). Agar 'despite'dan keyin to'liq gap ishlatish zarur bo'lsa, 'the fact that' qo'shiladi: \"Despite the fact that he was warned, he ignored the risk.\"",
      "Ikkala bog'lovchi guruhi ham gap boshida yoki o'rtasida kelishi mumkin (boshida bo'lsa, vergul qo'yiladi): \"Although it was late, we continued\" = \"We continued although it was late.\" Faqat qurilishni aralashtirmaslik kerak — 'despite'dan keyin hech qachon egasi bilan to'liq gap kelmaydi."
    ],
    "examples": [
      {
        "en": "Although it was late, we continued working on the project.",
        "uz": "Garchi vaqt kech bo'lsa-da, biz loyiha ustida ishlashda davom etdik."
      },
      {
        "en": "She passed the exam, even though she hadn't studied much.",
        "uz": "U ko'p tayyorlanmagan bo'lsa-da, imtihondan o'tdi."
      },
      {
        "en": "Despite the heavy traffic, we arrived at the airport on time.",
        "uz": "Og'ir tirbandlikka qaramay, biz aeroportga vaqtida yetib bordik."
      },
      {
        "en": "In spite of feeling nervous, he gave a confident presentation.",
        "uz": "Hayajonlanayotganiga qaramay, u ishonch bilan taqdimot o'tkazdi."
      },
      {
        "en": "The trip was expensive. It was worth it, though.",
        "uz": "Sayohat qimmatga tushdi. Shunga qaramay, bunga arzigulik edi."
      },
      {
        "en": "Despite the fact that he was warned, he ignored the risk.",
        "uz": "Ogohlantirilganiga qaramay, u xavfni e'tiborsiz qoldirdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Despite it was raining, we went out.",
        "right": "Despite the rain, we went out. / Despite the fact that it was raining, we went out.",
        "note": "'Despite'dan keyin to'g'ridan-to'g'ri gap (ega+kesim) kelmaydi — faqat ot, -ing yoki 'the fact that' + gap."
      },
      {
        "wrong": "Although the rain, we continued the match.",
        "right": "Although it was raining, we continued the match. / Despite the rain, we continued the match.",
        "note": "'Although'dan keyin faqat to'liq gap keladi, ot emas — ot uchun 'despite/in spite of' ishlatiladi."
      },
      {
        "wrong": "Although she was tired, but she finished the race.",
        "right": "Although she was tired, she finished the race.",
        "note": "'Although' bilan bir gapda 'but' ham ishlatilmaydi — ikkalasi bir xil vazifani bajaradi, birga qo'llash ortiqcha."
      }
    ],
    "quiz": [
      {
        "q": "___ he studied hard, he failed the exam.",
        "options": [
          "Although",
          "Despite",
          "In spite of",
          "So"
        ],
        "answer": 0
      },
      {
        "q": "She went to work ___ her illness.",
        "options": [
          "although",
          "even though",
          "despite",
          "but"
        ],
        "answer": 2
      },
      {
        "q": "___ the difficult conditions, the climbers reached the summit.",
        "options": [
          "Although",
          "Despite",
          "Because",
          "Since"
        ],
        "answer": 1
      },
      {
        "q": "He didn't get the job, ___ his excellent qualifications.",
        "options": [
          "despite",
          "although",
          "because of",
          "so"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "Despite it was cold, we swam in the sea.",
          "Although the cold, we swam in the sea.",
          "Despite the cold, we swam in the sea.",
          "Although of the cold, we swam in the sea."
        ],
        "answer": 2
      }
    ]
  },
  "so-such-b1": {
    "explanation": [
      "'So' va 'such' gapga kuchli urg'u ('juda', 'shunchalik') qo'shadi, lekin ular turli so'z turkumlariga bog'lanadi: 'so' — sifat yoki ravishdan OLDIN (ot bo'lmasa), 'such' esa — ot birikmasidan (artikl + sifat + ot) OLDIN keladi.",
      "'So + sifat/ravish' ko'pincha natijani bildiruvchi 'that' bandi bilan davom etadi: \"It was so cold that the lake froze\" (shunday sovuq ediki, ko'l muzladi). 'Such' bilan ham xuddi shu ma'no beriladi, faqat otni ham o'z ichiga oladi: \"It was such a cold day that the lake froze.\"",
      "'Such' dan keyin birlik sanaladigan ot bo'lsa, artikl ('a/an') albatta qo'shiladi: \"such an interesting book\". Ko'plik yoki sanalmaydigan ot bilan esa artikl kerak emas: \"such interesting books\", \"such useful advice\".",
      "Miqdor bilan ishlatilganda 'so' — 'many/much'dan OLDIN keladi: \"so many people\", \"so much noise\". 'So'ni to'g'ridan-to'g'ri ot oldidan ishlatib bo'lmaydi — bu eng ko'p uchraydigan xato: \"so a good idea\" emas, \"such a good idea\" bo'lishi kerak."
    ],
    "examples": [
      {
        "en": "It was so cold that the lake froze completely.",
        "uz": "Shunday sovuq ediki, ko'l butunlay muzlab qoldi."
      },
      {
        "en": "She speaks so quickly that I can't understand her.",
        "uz": "U shunchalik tez gapiradiki, men uni tushuna olmayman."
      },
      {
        "en": "It was such an interesting film that we watched it twice.",
        "uz": "Bu shunchalik qiziqarli film ediki, biz uni ikki marta ko'rdik."
      },
      {
        "en": "They are such kind neighbours; they always help us.",
        "uz": "Ular shunday mehribon qo'shnilarki, doim bizga yordam berishadi."
      },
      {
        "en": "There were so many people at the concert that we couldn't find seats.",
        "uz": "Kontsertda shunchalik ko'p odam bor ediki, biz o'rindiq topa olmadik."
      },
      {
        "en": "He gave us such useful advice before the interview.",
        "uz": "U bizga suhbatdan oldin juda foydali maslahat berdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "It was so a boring lecture.",
        "right": "It was such a boring lecture.",
        "note": "'So'dan keyin ot (hatto artikl bilan ham) kelmaydi — ot oldidan 'such' ishlatiladi."
      },
      {
        "wrong": "She is such tired that she can't walk.",
        "right": "She is so tired that she can't walk.",
        "note": "'Such'dan keyin faqat ot birikmasi keladi; ot bo'lmasa (sifatning o'zi) — 'so' ishlatiladi."
      },
      {
        "wrong": "It was such interesting a book.",
        "right": "It was such an interesting book.",
        "note": "'Such' bilan tartib: such + a/an + sifat + ot — artikl sifatdan OLDIN, 'such'dan keyin darhol keladi."
      }
    ],
    "quiz": [
      {
        "q": "The music was ___ loud that we had to leave.",
        "options": [
          "so",
          "such",
          "such a",
          "too"
        ],
        "answer": 0
      },
      {
        "q": "We had ___ wonderful holiday that we want to go back next year.",
        "options": [
          "so",
          "such a",
          "such",
          "too"
        ],
        "answer": 1
      },
      {
        "q": "He is ___ generous person — he always shares everything.",
        "options": [
          "so",
          "such",
          "such a",
          "too"
        ],
        "answer": 2
      },
      {
        "q": "There was ___ much noise that nobody could sleep.",
        "options": [
          "so",
          "such",
          "such a",
          "very"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "It was so a difficult exam.",
          "It was such difficult exam.",
          "It was such a difficult exam.",
          "It was too a difficult exam."
        ],
        "answer": 2
      }
    ]
  },
  "adjective-order-b1": {
    "explanation": [
      "Bir necha sifat bitta otni birga aniqlashi mumkin, lekin ularning gapdagi tartibi tasodifiy emas — inglizzabon kishilar buni sezmasdan, avtomatik tarzda qat'iy tartibda joylashtiradi. To'liq tartib: fikr-mulohaza (opinion) → o'lcham (size) → yosh (age) → shakl (shape) → rang (colour) → kelib chiqishi (origin) → material → maqsad/tur, va faqat shundan keyin OT keladi.",
      "Kundalik gaplarda odatda 2-3 tadan ortiq sifat kamdan-kam ishlatiladi, shuning uchun to'liq tartibni yodlashdan ko'ra eng muhim qoidani eslab qolish yetarli: fikr-mulohaza bildiruvchi so'z (beautiful, interesting, lovely) DOIM eng boshida keladi, material va kelib chiqish esa otga ENG YAQIN turadi.",
      "Masalan, \"a beautiful old wooden desk\" birikmasida: beautiful — fikr-mulohaza, old — yosh, wooden — material. Tartib aynan shu ketma-ketlikda: fikr-mulohaza, yosh, material — boshqacha tartibda aytilsa, gap g'alati eshitiladi.",
      "Bir xil turkumdagi sifatlar (masalan, ikkita rang) orasida odatda vergul yoki 'and' ishlatiladi: \"a black and white cat\". Turli turkumdagi sifatlar orasida esa vergulsiz, ketma-ket yoziladi: \"a small black cat\" (o'lcham + rang, vergulsiz)."
    ],
    "examples": [
      {
        "en": "She bought a beautiful old wooden desk for her new office.",
        "uz": "U yangi ofisi uchun chiroyli, eski yog'och stol sotib oldi."
      },
      {
        "en": "He was wearing a small, round, silver watch.",
        "uz": "U kichkina, dumaloq, kumush soat taqib olgan edi."
      },
      {
        "en": "They live in a lovely little Italian village.",
        "uz": "Ular go'zal, kichkina Italiya qishlog'ida yashashadi."
      },
      {
        "en": "I found an interesting old French painting in the attic.",
        "uz": "Men chordoqdan qiziqarli, qadimiy fransuz rasmini topdim."
      },
      {
        "en": "She was carrying a large, black leather bag.",
        "uz": "U katta, qora, charm sumka ko'tarib yurardi."
      },
      {
        "en": "We stayed in a comfortable, modern, three-star hotel.",
        "uz": "Biz qulay, zamonaviy, uch yulduzli mehmonxonada turdik."
      }
    ],
    "mistakes": [
      {
        "wrong": "a wooden beautiful old desk",
        "right": "a beautiful old wooden desk",
        "note": "Material (wooden) doim otga eng yaqin turadi; fikr-mulohaza (beautiful) esa eng boshida keladi."
      },
      {
        "wrong": "a red big house",
        "right": "a big red house",
        "note": "O'lcham (big) rangdan (red) oldin keladi — sifatlar tasodifiy emas, qat'iy tartibda joylashadi."
      },
      {
        "wrong": "an old, interesting book",
        "right": "an interesting old book",
        "note": "Fikr-mulohaza bildiruvchi sifat (interesting) doim yosh yoki holatni bildiruvchi sifatdan (old) oldin keladi."
      }
    ],
    "quiz": [
      {
        "q": "She has a ___ dog.",
        "options": [
          "small black French",
          "French small black",
          "black small French",
          "small French black"
        ],
        "answer": 0
      },
      {
        "q": "He bought a ___ table.",
        "options": [
          "wooden round small",
          "small round wooden",
          "round wooden small",
          "wooden small round"
        ],
        "answer": 1
      },
      {
        "q": "They found an ___ vase in the museum.",
        "options": [
          "ancient beautiful Chinese",
          "beautiful ancient Chinese",
          "Chinese beautiful ancient",
          "beautiful Chinese ancient"
        ],
        "answer": 1
      },
      {
        "q": "It's a ___ jacket.",
        "options": [
          "leather black new",
          "new black leather",
          "black new leather",
          "leather new black"
        ],
        "answer": 1
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "a plastic small red toy",
          "a red small plastic toy",
          "a small red plastic toy",
          "a small plastic red toy"
        ],
        "answer": 2
      }
    ]
  },
  "adverb-position-b1": {
    "explanation": [
      "Ravish turiga qarab uning gapdagi o'rni farq qiladi: takroriylik ravishlari (always, usually, often, never) asosiy fe'ldan OLDIN keladi, harakat tarzini bildiruvchi ravishlar (carefully, quickly, well) esa ko'pincha to'ldiruvchidan KEYIN yoki gap oxirida keladi. Noto'g'ri joy tanlash gapni g'alati yoki tushunarsiz qiladi.",
      "Takroriylik ravishlari asosiy fe'ldan OLDIN turadi: \"She always arrives early.\" Lekin 'to be' fe'lidan esa KEYIN keladi: \"She is always late\" (\"She always is late\" emas).",
      "Harakat tarzini bildiruvchi ravishlar odatda to'ldiruvchidan (object) KEYIN yoki gap oxirida turadi, hech qachon fe'l bilan to'ldiruvchi orasiga kirmaydi: \"He carefully checked the figures\" yoki \"He checked the figures carefully\" — lekin \"He checked carefully the figures\" NOTO'G'RI.",
      "Darajani bildiruvchi ravishlar (really, quite, extremely, too) sifat yoki boshqa ravishdan OLDIN keladi: \"This is really important.\" \"She speaks extremely fluently.\""
    ],
    "examples": [
      {
        "en": "He carefully checked the figures before sending the report.",
        "uz": "U hisobotni yuborishdan oldin raqamlarni ehtiyotkorlik bilan tekshirib chiqdi."
      },
      {
        "en": "She always arrives at the office before nine o'clock.",
        "uz": "U doim soat to'qqizdan oldin ofisga yetib keladi."
      },
      {
        "en": "My grandmother is usually awake by six in the morning.",
        "uz": "Buvim odatda ertalab soat oltida uyg'oq bo'ladi."
      },
      {
        "en": "He answered the difficult question calmly and confidently.",
        "uz": "U qiyin savolga xotirjam va ishonch bilan javob berdi."
      },
      {
        "en": "This exercise is really difficult for beginners.",
        "uz": "Bu mashq boshlovchilar uchun juda qiyin."
      },
      {
        "en": "They rarely eat fast food because they prefer home cooking.",
        "uz": "Ular fast-fudni kamdan-kam yeyishadi, chunki uy taomini afzal ko'rishadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She is late always.",
        "right": "She is always late.",
        "note": "Takroriylik ravishi 'to be' fe'lidan KEYIN keladi, gap oxirida emas."
      },
      {
        "wrong": "He checked carefully the figures.",
        "right": "He carefully checked the figures. / He checked the figures carefully.",
        "note": "Harakat tarzi ravishi fe'l bilan to'ldiruvchi orasiga kirmaydi."
      },
      {
        "wrong": "I usually am tired after work.",
        "right": "I am usually tired after work.",
        "note": "'To be' bilan takroriylik ravishi undan KEYIN keladi — 'am usually' tartibida, 'usually am' emas."
      }
    ],
    "quiz": [
      {
        "q": "My brother ___ football on Sundays.",
        "options": [
          "plays always",
          "always plays",
          "is always plays",
          "plays is always"
        ],
        "answer": 1
      },
      {
        "q": "The manager ___ late for meetings.",
        "options": [
          "is never",
          "never is",
          "is being never",
          "never be"
        ],
        "answer": 0
      },
      {
        "q": "She explained the plan ___ so that everyone understood.",
        "options": [
          "clear",
          "clearly",
          "cleared",
          "clearing"
        ],
        "answer": 1
      },
      {
        "q": "This film is ___ boring — I nearly fell asleep.",
        "options": [
          "extreme",
          "extremely",
          "extent",
          "extremist"
        ],
        "answer": 1
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "He drives always carefully.",
          "He always drives carefully.",
          "He drives carefully always.",
          "Always he drives carefully."
        ],
        "answer": 1
      }
    ]
  },
  "comparison-structures-b1": {
    "explanation": [
      "Oddiy -er/more solishtirishdan tashqari, ingliz tilida o'xshashlik va farqni ifodalovchi bir necha muhim qurilma bor: 'as...as' (tenglik), 'not as...as' (notenglik), 'the same as' (bir xillik) va 'different from' (farq).",
      "'As + sifat + as' — tenglikni bildiradi: \"She is as tall as her brother\" (bo'yi baravar). Inkor shaklda — 'not as + sifat + as' — birinchi narsa ikkinchisidan KAMROQ ekanini bildiradi, bu ko'pincha oddiy qiyosiy darajadan (comparative) ko'ra yumshoqroq va tabiiyroq eshitiladi: \"The sequel was not as exciting as the first film\" = davomi kamroq hayajonli edi.",
      "'The same as' — ikki narsa AYNAN bir xil ekanini bildiradi: \"Her new haircut looks the same as her old one.\" 'Different from' esa farqni ko'rsatadi — bu eng xavfsiz, universal shakl ('different than' amerikacha so'zlashuv uslubida, 'different to' esa britaniyacha norasmiy uslubda uchraydi, lekin 'different from' har doim to'g'ri hisoblanadi).",
      "Katta farqni ta'kidlash uchun qiyosiy daraja oldidan 'much/far/a lot' qo'shiladi: \"This is much cheaper than that.\" Bir necha barobar farqni bildirish uchun esa 'twice/three times as...as' ishlatiladi: \"This year's harvest is twice as large as last year's.\""
    ],
    "examples": [
      {
        "en": "The sequel was not as exciting as the first film.",
        "uz": "Davomi birinchi filmchalik hayajonli emas edi."
      },
      {
        "en": "My sister is as tall as me now.",
        "uz": "Opam hozir men bilan bir xil bo'yda."
      },
      {
        "en": "This restaurant is not as expensive as the one downtown.",
        "uz": "Bu restoran markazdagi restoranchalik qimmat emas."
      },
      {
        "en": "Her new haircut looks the same as her old one.",
        "uz": "Uning yangi soch turmagi eskisi bilan bir xil ko'rinadi."
      },
      {
        "en": "City life is very different from village life.",
        "uz": "Shahar hayoti qishloq hayotidan juda farq qiladi."
      },
      {
        "en": "This year's harvest is twice as large as last year's.",
        "uz": "Bu yilgi hosil o'tgan yilgidan ikki barobar ko'p."
      }
    ],
    "mistakes": [
      {
        "wrong": "This book is as interesting than that one.",
        "right": "This book is as interesting as that one.",
        "note": "'As...as' qurilishida ikkinchi qismda ham 'as' bo'lishi kerak, 'than' emas."
      },
      {
        "wrong": "My phone is different than yours.",
        "right": "My phone is different from yours.",
        "note": "Ikki narsa orasidagi farqni bildirishning eng xavfsiz va universal shakli — 'different from'."
      },
      {
        "wrong": "This test is not so difficult than the last one.",
        "right": "This test is not as difficult as the last one.",
        "note": "Notenglikni ifodalashda 'as...as' ishlatiladi; 'so...than' degan aralash shakl mavjud emas."
      }
    ],
    "quiz": [
      {
        "q": "This car is ___ that one — they cost exactly the same.",
        "options": [
          "as expensive as",
          "as expensive than",
          "more expensive as",
          "so expensive than"
        ],
        "answer": 0
      },
      {
        "q": "Her opinion is completely ___ mine.",
        "options": [
          "different from",
          "different than",
          "difference from",
          "differently from"
        ],
        "answer": 0
      },
      {
        "q": "This laptop is ___ expensive as that one — almost double the price.",
        "options": [
          "twice as",
          "two times than",
          "double as",
          "as twice"
        ],
        "answer": 0
      },
      {
        "q": "The results this year are ___ last year's — nothing has changed.",
        "options": [
          "the same as",
          "as same as",
          "same than",
          "the similar as"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "This coffee is not as strong than that one.",
          "This coffee isn't as strong that one.",
          "This coffee is not as strong as that one.",
          "This coffee is not stronger as that one."
        ],
        "answer": 2
      }
    ]
  },
  "noun-clauses-basics-b1": {
    "explanation": [
      "Noun clause — bir butun gap (ega + kesim) boshqa kattaroq gapda OT vazifasini bajaradi: ega, to'ldiruvchi yoki predikativ bo'lib keladi. \"What you said\" bu yerda bitta so'z emas, balki butun \"you said something\" gapi ega vazifasida ishlatilgan.",
      "'That' bandi — asosan fe'ldan keyin to'ldiruvchi vazifasida keladi: \"I know that she is right\" (og'zaki nutqda 'that' ko'pincha tushiriladi: \"I know she is right\"). Ega vazifasida kamdan-kam va rasmiyroq: \"That he lied is obvious\" o'rniga ko'pincha \"It is obvious that he lied\" tuzilishi tabiiyroq eshitiladi.",
      "'What' bandi ('nima aytilgani/qilingani') ko'pincha ega yoki to'ldiruvchi vazifasida keladi: \"What you said makes sense\" (ega), \"I don't understand what you mean\" (to'ldiruvchi). 'What' bu yerda 'the thing that' ma'nosini beradi.",
      "'Whether/if' ikki variant yoki noaniqlikni ('...mi' ma'nosida) bildiradi: \"I don't know whether she is coming.\" Savol so'zlari (where, why, how) bilan yasalgan noun clauselarda ODDIY GAP TARTIBI saqlanadi, savol tartibi emas: \"I wonder where he lives\" (\"where does he live\" emas)."
    ],
    "examples": [
      {
        "en": "What you said makes a lot of sense to me.",
        "uz": "Siz aytgan narsa menga juda mantiqli tuyuldi."
      },
      {
        "en": "I don't know whether she will accept the offer.",
        "uz": "Uning taklifni qabul qilish-qilmasligini bilmayman."
      },
      {
        "en": "That he passed the exam without studying surprised everyone.",
        "uz": "Uning o'qimasdan imtihondan o'tgani hammani hayratga soldi."
      },
      {
        "en": "Can you tell me what time the meeting starts?",
        "uz": "Menga uchrashuv soat nechada boshlanishini ayta olasizmi?"
      },
      {
        "en": "Whether we win or lose, the team played well today.",
        "uz": "Yutamizmi yoki yutqazamizmi, jamoa bugun yaxshi o'ynadi."
      },
      {
        "en": "I still don't understand why he changed his mind so suddenly.",
        "uz": "Men hali ham u nega fikrini birdan o'zgartirganini tushunmayapman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I don't know where does he live.",
        "right": "I don't know where he lives.",
        "note": "Noun clause ichida oddiy gap tartibi saqlanadi — 'does' kabi yordamchi fe'l qo'shilmaydi."
      },
      {
        "wrong": "I don't know that you mean.",
        "right": "I don't know what you mean.",
        "note": "'Nima' ma'nosini berish uchun 'that' emas, 'what' ishlatiladi — 'that' faqat aniq gapni kiritadi, savol mazmunini bildirmaydi."
      },
      {
        "wrong": "What did you say makes sense.",
        "right": "What you say makes sense. / What you said makes sense.",
        "note": "'What' bilan boshlangan noun clause ichida ham savol tartibi emas, oddiy gap tartibi ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "___ she is telling the truth is hard to know.",
        "options": [
          "Whether",
          "What",
          "Because",
          "So"
        ],
        "answer": 0
      },
      {
        "q": "I really don't understand ___ he wants.",
        "options": [
          "that",
          "what",
          "if",
          "because"
        ],
        "answer": 1
      },
      {
        "q": "Can you tell me ___ the bank is?",
        "options": [
          "where is",
          "where",
          "is where",
          "where does"
        ],
        "answer": 1
      },
      {
        "q": "___ she said in the interview impressed the manager.",
        "options": [
          "What",
          "That",
          "If",
          "So"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "I don't know where does she work.",
          "I don't know where she works.",
          "I don't know where works she.",
          "I don't know where she does work."
        ],
        "answer": 1
      }
    ]
  },
  "purpose-clauses-b1": {
    "explanation": [
      "Maqsad gapi biror harakat NIMA UCHUN bajarilganini ko'rsatadi ('...uchun', '...maqsadida'). Ikki asosiy qurilma bor: to-infinitive va 'so that' + gap.",
      "'To / in order to' + fe'l — ikkala harakatning egasi BIR XIL bo'lganda ishlatiladi: \"She went to the market to buy vegetables\" (u bordi, u sotib oldi — bitta ega). 'In order to' — 'to'ning rasmiyroq shakli, ayniqsa yozma nutqda ko'proq uchraydi.",
      "'So that' + gap — ikkita harakatning egasi HAR XIL bo'lganda MAJBURIY, egalar bir xil bo'lsa ham ishlatilishi mumkin: \"She spoke slowly so that everyone could follow\" (u gapirdi, boshqalar tushundi — ikkita ega). 'So that'dan keyingi gapda odatda modal fe'l keladi: can/could (hozirgi yoki kelajak maqsad uchun), will/would.",
      "Salbiy maqsadni ('biror narsa yuz bermasligi uchun') ifodalash uchun 'so that...wouldn't/couldn't' yoki 'in order not to' ishlatiladi: \"He whispered so that he wouldn't wake the baby.\" / \"He left early in order not to be late.\" Diqqat: 'for to' degan qurilish INGLIZ TILIDA MAVJUD EMAS — bu ko'p uchraydigan xato."
    ],
    "examples": [
      {
        "en": "She spoke slowly so that everyone could follow the lesson.",
        "uz": "U hamma darsni tushunib borishi uchun sekin gapirdi."
      },
      {
        "en": "I saved money for a year in order to buy a new laptop.",
        "uz": "Yangi noutbuk sotib olish uchun bir yil davomida pul yig'dim."
      },
      {
        "en": "He left the party early so that he wouldn't miss the last bus.",
        "uz": "U so'nggi avtobusga ulgurmaslik uchun bazmni erta tark etdi."
      },
      {
        "en": "We turned off the lights to save electricity.",
        "uz": "Elektr energiyasini tejash uchun chiroqlarni o'chirdik."
      },
      {
        "en": "The teacher repeated the instructions so that no one would be confused.",
        "uz": "Hech kim adashib qolmasligi uchun o'qituvchi ko'rsatmalarni takrorladi."
      },
      {
        "en": "She wore headphones in order not to disturb her roommate.",
        "uz": "U xonadoshini bezovta qilmaslik uchun quloqchin taqib oldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I called him for to ask about the meeting.",
        "right": "I called him to ask about the meeting.",
        "note": "Ingliz tilida 'for to' degan qurilish yo'q — maqsad uchun oddiy 'to + fe'l' yetarli."
      },
      {
        "wrong": "She whispered so that not to wake the baby.",
        "right": "She whispered so that she wouldn't wake the baby. / She whispered in order not to wake the baby.",
        "note": "'So that' bilan inkor 'wouldn't/couldn't' orqali beriladi, 'so that not to' shakli noto'g'ri."
      },
      {
        "wrong": "I went to the shop for buy some bread.",
        "right": "I went to the shop to buy some bread. / I went to the shop for some bread.",
        "note": "'For'dan keyin fe'l emas, ot yoki -ing keladi; harakat maqsadini bildirish uchun 'to + fe'l' ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "He is learning English ___ get a better job.",
        "options": [
          "for",
          "to",
          "for to",
          "so that"
        ],
        "answer": 1
      },
      {
        "q": "I wrote everything down ___ I wouldn't forget it.",
        "options": [
          "so that",
          "for that",
          "in order",
          "to that"
        ],
        "answer": 0
      },
      {
        "q": "They arrived early ___ get good seats.",
        "options": [
          "for to",
          "so",
          "in order to",
          "for"
        ],
        "answer": 2
      },
      {
        "q": "She locked the door ___ nobody could get in.",
        "options": [
          "so that",
          "for that",
          "to that",
          "in order"
        ],
        "answer": 0
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "I exercise for stay healthy.",
          "I exercise to stay healthy.",
          "I exercise for to stay healthy.",
          "I exercise so stay healthy."
        ],
        "answer": 1
      }
    ]
  },
  "participle-clauses-basics-b1": {
    "explanation": [
      "Participle clause ikkita bog'liq gapni, ayniqsa ega bir xil bo'lsa, ixcham shaklga keltiradi: \"Because I felt tired, I went to bed early\" o'rniga \"Feeling tired, I went to bed early\" deyish mumkin — ma'no bir xil, lekin qisqaroq va yozma uslubda chiroyliroq eshitiladi.",
      "-ing shakli (present participle) FAOL ma'noda ishlatiladi — ega o'zi harakatni bajaradi: \"Feeling tired, I went to bed early\" (men his qildim). Sabab yoki bir vaqtda sodir bo'layotgan ikkinchi harakatni bildirishi mumkin: \"Walking home, she met an old friend\" (u yurar ekan...).",
      "III shakl (past participle, V3) esa PASSIV ma'noda ishlatiladi — ega harakatni bajarmaydi, balki harakat unga qaratilgan: \"Written in 1997, the novel became an instant classic\" (roman yozilgan — u yozuvchi emas, yozilgan narsaning o'zi).",
      "MUHIM QOIDA: participle clause va asosiy gapning egasi BIR XIL bo'lishi shart, aks holda gap noto'g'ri yoki kulgili chiqadi: \"Walking to school, the rain started\" — xato, chunki yomg'ir yurmaydi! To'g'risi: \"Walking to school, I got caught in the rain.\""
    ],
    "examples": [
      {
        "en": "Feeling tired, I went to bed early last night.",
        "uz": "Charchaganimni his qilib, kecha erta yotdim."
      },
      {
        "en": "Written by a famous historian, the book quickly became a bestseller.",
        "uz": "Mashhur tarixchi tomonidan yozilgan bu kitob tezda bestsellerga aylandi."
      },
      {
        "en": "Walking home from work, she noticed a beautiful sunset.",
        "uz": "Ishdan uyga qaytar ekan, u go'zal quyosh botishini payqadi."
      },
      {
        "en": "Not knowing the answer, he decided to guess.",
        "uz": "Javobni bilmagani uchun, u taxmin qilishga qaror qildi."
      },
      {
        "en": "Exhausted after the long journey, the travellers fell asleep immediately.",
        "uz": "Uzoq safardan charchagan sayohatchilar darhol uxlab qolishdi."
      },
      {
        "en": "Standing at the top of the mountain, we could see the whole valley.",
        "uz": "Tog' cho'qqisida turib, biz butun vodiyni ko'ra olardik."
      }
    ],
    "mistakes": [
      {
        "wrong": "Walking to school, the rain started suddenly.",
        "right": "Walking to school, I got caught in the rain suddenly. / While I was walking to school, the rain started suddenly.",
        "note": "Participle clause va asosiy gapning egasi bir xil bo'lishi kerak — yomg'ir 'yurmaydi', bu 'osilib qolgan participle' xatosi."
      },
      {
        "wrong": "Interesting in the topic, she read the whole article.",
        "right": "Interested in the topic, she read the whole article.",
        "note": "His-tuyg'u bildiruvchi fe'llarda ega o'zi his qilganda V3 (interested), boshqasiga shu holatni his qildirganda -ing (interesting) ishlatiladi."
      },
      {
        "wrong": "Write in 1997, the novel became a classic.",
        "right": "Written in 1997, the novel became a classic.",
        "note": "Passiv ma'noda (roman yozilgan, o'zi yozmagan) fe'lning III shakli — V3 — kerak, oddiy fe'l shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "___ the news, she immediately called her sister.",
        "options": [
          "Hearing",
          "Heard",
          "Hear",
          "To hear"
        ],
        "answer": 0
      },
      {
        "q": "___ in 1632, the Taj Mahal attracts millions of visitors every year.",
        "options": [
          "Building",
          "Build",
          "Built",
          "To build"
        ],
        "answer": 2
      },
      {
        "q": "___ about the exam, the students studied all weekend.",
        "options": [
          "Worrying",
          "Worried",
          "Worry",
          "To worry"
        ],
        "answer": 1
      },
      {
        "q": "___ tired of waiting, we decided to leave the queue.",
        "options": [
          "Grown",
          "Growing",
          "Grow",
          "To grow"
        ],
        "answer": 1
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "Cooked dinner, the phone rang.",
          "Cooking dinner, I heard the phone ring.",
          "Cook dinner, I heard the phone ring.",
          "To cook dinner, the phone rang."
        ],
        "answer": 1
      }
    ]
  },
  "future-time-clauses-b1": {
    "explanation": [
      "Kelajakdagi ikkita voqeani bog'laganda asosiy gapda 'will' ishlatiladi, lekin vaqt bog'lovchisidan (when, as soon as, until, before, after, while) keyingi gapda 'will' EMAS, PRESENT SIMPLE ishlatiladi — garchi ma'no aniq kelajakka tegishli bo'lsa ham.",
      "Bog'lovchilar va ma'nolari: when (...ganda), as soon as (...ganidan darhol keyin — 'when'dan tezroq), until/till (...gunga qadar), before/after (...dan oldin/keyin), while (...gan paytda, davomiylik).",
      "Qoidani mustahkamlash uchun misolga e'tibor bering: \"I will message you when I arrive\" (\"when I will arrive\" emas). Ikkala fe'l ham kelajakka tegishli, lekin faqat asosiy gapda 'will' ko'rinadi.",
      "Bu qoida faqat vaqt bog'lovchisi sifatida ishlatilgan 'when'ga tegishli — agar 'when' bilvosita savol mazmunini bersa (masalan, 'qachon' degan ma'noda), qoida qo'llanilmaydi va 'will' saqlanib qoladi: \"I don't know when he will arrive\" (bu yerda 'when' vaqt bog'lovchisi emas, balki 'qachon' degan savol mazmunini beradi)."
    ],
    "examples": [
      {
        "en": "I will message you when I arrive at the hotel.",
        "uz": "Mehmonxonaga yetib borganimda sizga xabar yuboraman."
      },
      {
        "en": "As soon as the rain stops, we will continue the match.",
        "uz": "Yomg'ir to'xtashi bilanoq, o'yinni davom ettiramiz."
      },
      {
        "en": "She won't leave until she finishes the report.",
        "uz": "U hisobotni tugatmaguncha ketmaydi."
      },
      {
        "en": "Please turn off the lights before you leave the room.",
        "uz": "Xonadan chiqishdan oldin chiroqlarni o'chiring, iltimos."
      },
      {
        "en": "We will call you as soon as the results are ready.",
        "uz": "Natijalar tayyor bo'lishi bilanoq sizga qo'ng'iroq qilamiz."
      },
      {
        "en": "I'll stay here while you talk to the manager.",
        "uz": "Siz menejer bilan gaplashayotganingizda men shu yerda kutib turaman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I will call you when I will get home.",
        "right": "I will call you when I get home.",
        "note": "Vaqt bog'lovchisi (when) dan keyingi gapda 'will' emas, Present Simple ishlatiladi."
      },
      {
        "wrong": "We will wait until you will be ready.",
        "right": "We will wait until you are ready.",
        "note": "'Until'dan keyin ham kelajak ma'nosi bo'lsa-da, Present Simple keladi."
      },
      {
        "wrong": "As soon as I will finish, I will call you.",
        "right": "As soon as I finish, I will call you.",
        "note": "'As soon as' — vaqt bog'lovchisi, undan keyin 'will' emas, oddiy hozirgi zamon ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "I will let you know as soon as I ___ the news.",
        "options": [
          "hear",
          "will hear",
          "heard",
          "am hearing"
        ],
        "answer": 0
      },
      {
        "q": "She will start cooking when the guests ___.",
        "options": [
          "will arrive",
          "arrive",
          "arrived",
          "arriving"
        ],
        "answer": 1
      },
      {
        "q": "Don't leave the house until I ___ you.",
        "options": [
          "will call",
          "call",
          "called",
          "calling"
        ],
        "answer": 1
      },
      {
        "q": "We'll have dinner after the film ___.",
        "options": [
          "will finish",
          "finishes",
          "finished",
          "finishing"
        ],
        "answer": 1
      },
      {
        "q": "To'g'ri gapni tanlang:",
        "options": [
          "I will tell her when I will see her.",
          "I will tell her when I see her.",
          "I tell her when I will see her.",
          "I will tell her when do I see her."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-present-time-contrasts": {
    "explanation": [
      "Ba'zi fe'llar HOLAT (state) ma'nosida ishlatilganda Continuous shaklga kirmaydi, lekin ular AYNAN SHU FE'L boshqa ma'noda — ma'lum bir jarayon yoki xatti-harakat ma'nosida ishlatilsa, Continuous shaklga kirishi mumkin: \"I am considering a change\" (fikrlash JARAYONI — vaqtinchalik) va \"I think the plan is sound\" (fikr — doimiy baho, holat).",
      "\"Think\" ikki xil ma'noda ishlatiladi: \"opinion\" ma'nosida (holat — Simple: \"I think this is right\") va \"active mental process\" ma'nosida (jarayon — Continuous: \"I am thinking about the offer\" — hozir tahlil qilyapman). Xuddi shunday \"have\" ham egalik ma'nosida holat (\"I have a car\"), lekin \"have lunch\" kabi harakat ma'nosida Continuous bo'la oladi (\"I am having lunch\").",
      "Doimiy xususiyat va vaqtinchalik holat orasidagi farq ham B2 darajasida muhim: \"She lives in Tashkent\" (doimiy joylashuv) va \"She is living with her sister this month\" (vaqtinchalik, odatiy holatdan farqli).",
      "Bu nozik farqlarni to'g'ri ishlatish nutqni tabiiyroq va aniqroq qiladi — ayniqsa rasmiy yozma va og'zaki nutqda fikringiz vaqtinchalik jarayonmi yoki barqaror bahomi ekanini aniq ko'rsatish muhim."
    ],
    "examples": [
      {
        "en": "I am considering a change, but I think the plan is fundamentally sound.",
        "uz": "Men o'zgarish haqida o'ylab ko'ryapman, lekin menimcha reja asosan yaxshi."
      },
      {
        "en": "She lives in Tashkent, but she is staying with relatives in Samarkand this week.",
        "uz": "U Toshkentda yashaydi, lekin bu hafta Samarqandda qarindoshlari yonida turibdi."
      },
      {
        "en": "I'm having lunch with a client right now, so I'll call you back later.",
        "uz": "Men hozir mijoz bilan tushlik qilyapman, shuning uchun keyinroq qo'ng'iroq qilaman."
      },
      {
        "en": "We are seeing several candidates this week before making a decision.",
        "uz": "Qaror qabul qilishdan oldin biz bu hafta bir necha nomzod bilan uchrashyapmiz."
      },
      {
        "en": "He owns a small bookshop in the old town.",
        "uz": "U eski shaharda kichik kitob do'koniga egalik qiladi."
      },
      {
        "en": "I'm thinking about whether we should postpone the launch.",
        "uz": "Ishga tushirishni kechiktirish kerakmi-yo'qmi, hozir o'ylab ko'ryapman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I am thinking this plan is good. (fikr, baho)",
        "right": "I think this plan is good.",
        "note": "\"Think\" bu yerda fikr-baho ma'nosida — holat fe'li, Continuous shaklga kirmaydi."
      },
      {
        "wrong": "She is owning a small shop.",
        "right": "She owns a small shop.",
        "note": "\"Own\" — sof egalik ma'nosidagi holat fe'li, Continuous shaklda deyarli ishlatilmaydi."
      },
      {
        "wrong": "I have lunch right now with a client.",
        "right": "I am having lunch right now with a client.",
        "note": "\"Have lunch\" bu yerda harakat (ovqatlanish jarayoni) ma'nosida — Continuous shaklga kiradi."
      }
    ],
    "quiz": [
      {
        "q": "I ___ this is the right decision, even though I'm still weighing the options.",
        "options": [
          "think",
          "am thinking",
          "am thinking that",
          "thinking"
        ],
        "answer": 0
      },
      {
        "q": "She normally lives alone, but she ___ with her parents while her flat is repaired.",
        "options": [
          "lives",
          "is living",
          "live",
          "has lived"
        ],
        "answer": 1
      },
      {
        "q": "We ___ dinner at the moment — can I call you back?",
        "options": [
          "have",
          "are having",
          "having",
          "has"
        ],
        "answer": 1
      },
      {
        "q": "He ___ three restaurants in the city centre.",
        "options": [
          "is owning",
          "owns",
          "own",
          "is own"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (fikrlash jarayoni)?",
        "options": [
          "I think about the offer right now.",
          "I am thinking about the offer right now.",
          "I am think about the offer right now.",
          "I thinking about the offer right now."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-past-time-contrasts": {
    "explanation": [
      "O'tgan hikoyada to'rtta zamon o'zaro bog'liq holda ishlatiladi: Past Simple (asosiy ketma-ket voqealar), Past Continuous (fon, davom etayotgan jarayon), Past Perfect (voqeadan OLDIN sodir bo'lgan), Past Perfect Continuous (voqeadan oldin DAVOM ETGAN jarayon).",
      "Past Perfect Continuous — bu darsning markaziy nuqtasi — o'tmishdagi bir voqeadan OLDIN BOSHLANIB, o'sha voqea paytigacha DAVOM ETGAN faoliyatni ko'rsatadi, ko'pincha uning natijasi yoki sababini tushuntiradi: \"She was exhausted because she had been travelling all night\" (charchash — natija; safar qilish — sabab, uzoq davom etgan jarayon).",
      "Farqni solishtiring: \"He had worked there for ten years\" (Past Perfect Simple — muddat/natija, u endi u yerda ishlamaydi, umumiy fakt) va \"He had been working there for ten years when the company closed\" (Past Perfect Continuous — jarayonning davomiyligi ta'kidlanadi, kompaniya yopilgan paytgacha).",
      "To'rtta zamonni bir hikoyada birlashtirish orqali voqealar orasidagi ANIQ vaqt munosabati (fon, ketma-ketlik, sabab) yaratiladi — bu yozma hikoyachilikda va murakkab tushuntirishlarda juda muhim ko'nikma."
    ],
    "examples": [
      {
        "en": "She was exhausted because she had been travelling all night.",
        "uz": "U tun bo'yi sayohat qilgani uchun charchagan edi."
      },
      {
        "en": "He had worked at the company for ten years when it finally closed down.",
        "uz": "Kompaniya nihoyat yopilganda, u u yerda o'n yildan beri ishlagan edi."
      },
      {
        "en": "I was reading when the phone rang, so I had been sitting there for an hour already.",
        "uz": "Telefon jiringlaganda men o'qiyotgan edim, chunki u yerda allaqachon bir soatdan beri o'tirgan edim."
      },
      {
        "en": "By the time the ambulance arrived, he had been lying there for twenty minutes.",
        "uz": "Tez yordam yetib kelguncha, u yigirma daqiqadan beri u yerda yotgan edi."
      },
      {
        "en": "They had been arguing for hours before they finally reached an agreement.",
        "uz": "Ular nihoyat kelishuvga erishishdan oldin soatlab bahslashib kelishgan edi."
      },
      {
        "en": "Her eyes were red because she had been crying.",
        "uz": "Ko'zlari qizarib turgani uchun u yig'lab kelgan edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She was tired because she had travelled all night.",
        "right": "She was tired because she had been travelling all night.",
        "note": "Davomiylik va jarayon ta'kidlanganda Past Perfect Continuous kerak, oddiy Past Perfect emas."
      },
      {
        "wrong": "He had been working there for ten years, so he knew everyone. (bir marta tugagan uzoq faoliyat)",
        "right": "He had worked there for ten years, so he knew everyone.",
        "note": "Umumiy natija/muddat haqida gapirilganda Past Perfect Simple ko'proq tabiiy, ayniqsa raqamli muddat bilan."
      },
      {
        "wrong": "Her eyes were red because she had cry.",
        "right": "Her eyes were red because she had been crying.",
        "note": "\"Had\"dan keyin fe'l III shaklda emas, \"been + -ing\" bilan Continuous shaklda bo'lishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "He looked exhausted because he ___ all day.",
        "options": [
          "had worked",
          "had been working",
          "worked",
          "was working"
        ],
        "answer": 1
      },
      {
        "q": "By the time she called, I ___ the report three times.",
        "options": [
          "had been checking",
          "had checked",
          "checked",
          "was checking"
        ],
        "answer": 1
      },
      {
        "q": "They ___ for two hours when the rain finally stopped.",
        "options": [
          "had walked",
          "had been walking",
          "walked",
          "were walking"
        ],
        "answer": 1
      },
      {
        "q": "I knew the area well because I ___ there for many years.",
        "options": [
          "had been living",
          "had lived",
          "lived",
          "was living"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (charchash sababi — davomiy jarayon)?",
        "options": [
          "She was tired because she had run.",
          "She was tired because she had been running.",
          "She was tired because she ran.",
          "She was tired because she has been running."
        ],
        "answer": 1
      }
    ]
  },
  "future-perfect-b2": {
    "explanation": [
      "Future Perfect kelajakdagi MA'LUM BIR MUDDATGACHA tugallanadigan harakat yoki natijani ko'rsatadi — e'tibor MUDDATDAN OLDIN tugash faktiga qaratilgan, jarayonga emas: \"By June, they will have completed the bridge\" (iyungacha ish tugallangan bo'ladi).",
      "Qurilishi: subject + will have + fe'lning III shakli. Ko'pincha \"by\" + vaqt (by June, by next year, by the time) yoki \"in\" + muddat (in five years) bilan birga keladi.",
      "Future Perfect Continuous (will have been + -ing) esa muddatgacha DAVOM ETGAN jarayonning uzunligini ta'kidlaydi: \"By next year, she will have been working here for a decade\" (o'n yil davomida ishlagan bo'ladi — jarayon davomiyligi muhim).",
      "Future Perfect'ni oddiy Future Simple (will) bilan chalkashtirmaslik kerak: \"will\" — shunchaki kelajakda sodir bo'ladi (aniq muddat ta'kidlanmaydi), \"will have + III shakl\" esa — MUDDATGACHA allaqachon tugallangan bo'ladi."
    ],
    "examples": [
      {
        "en": "By June, they will have completed the new bridge.",
        "uz": "Iyungacha ular yangi ko'prikni tugatgan bo'ladilar."
      },
      {
        "en": "By the time you arrive, I will have finished cooking dinner.",
        "uz": "Siz yetib kelguningizcha men kechki ovqatni pishirib bo'lgan bo'laman."
      },
      {
        "en": "She will have graduated from university by next summer.",
        "uz": "Keyingi yozgacha u universitetni bitirgan bo'ladi."
      },
      {
        "en": "By 2030, this company will have opened offices in ten more countries.",
        "uz": "2030 yilga borib bu kompaniya yana o'n mamlakatda ofis ochgan bo'ladi."
      },
      {
        "en": "In five years, we will have paid off the whole loan.",
        "uz": "Besh yildan keyin biz butun kreditni to'lab bo'lgan bo'lamiz."
      },
      {
        "en": "By the time the film starts, we will have already eaten dinner.",
        "uz": "Film boshlanguncha biz allaqachon kechki ovqatni yeb bo'lgan bo'lamiz."
      }
    ],
    "mistakes": [
      {
        "wrong": "By June, they will complete the bridge.",
        "right": "By June, they will have completed the bridge.",
        "note": "Muddatgacha tugallangan harakat uchun oddiy \"will\" emas, \"will have + III shakl\" ishlatiladi."
      },
      {
        "wrong": "She will have graduate by next summer.",
        "right": "She will have graduated by next summer.",
        "note": "\"Will have\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      },
      {
        "wrong": "By the time you arrive, I finish cooking.",
        "right": "By the time you arrive, I will have finished cooking.",
        "note": "Boshqa kelajak voqeadan oldin tugaydigan harakat uchun Future Perfect kerak."
      }
    ],
    "quiz": [
      {
        "q": "By next month, we ___ all the paperwork.",
        "options": [
          "will finish",
          "will have finished",
          "finish",
          "are finishing"
        ],
        "answer": 1
      },
      {
        "q": "By the time the guests arrive, she ___ the house.",
        "options": [
          "will clean",
          "will have cleaned",
          "cleans",
          "is cleaning"
        ],
        "answer": 1
      },
      {
        "q": "In ten years, he ___ his own company for a while.",
        "options": [
          "will run",
          "will have run",
          "runs",
          "is running"
        ],
        "answer": 1
      },
      {
        "q": "By 2027, they ___ the new stadium.",
        "options": [
          "will build",
          "will have built",
          "build",
          "are building"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "By June, we will finish the project.",
          "By June, we will have finished the project.",
          "By June, we finish the project.",
          "By June, we are finishing the project already."
        ],
        "answer": 1
      }
    ]
  },
  "past-modal-deduction": {
    "explanation": [
      "Modal fe'l + have + III shakl (\"modal + have + past participle\") o'tgan voqealar haqida DALILGA ASOSLANGAN XULOSA chiqarishda ishlatiladi — bu haqiqatda nima sodir bo'lganini emas, balki gapiruvchining shu haqdagi MANTIQIY XULOSASINI bildiradi.",
      "Har bir modal xulosaning ishonch darajasini bildiradi: \"must have\" — kuchli, deyarli aniq xulosa (\"She must have missed the train\" — barcha dalillar shunga ishora qilyapti); \"might/could have\" — noaniq ehtimol; \"can't have\" — kuchli inkor xulosa (\"They can't have seen the notice\" — bu mumkin emas, dalillarga zid).",
      "Bu qurilma o'tmishda BO'LMAGAN shartni emas (Third Conditional), balki o'tmishda NIMA SODIR BO'LGANI haqidagi HOZIRGI xulosani bildiradi — vaqt farqiga e'tibor bering: xulosa HOZIR chiqarilyapti, voqeaning o'zi O'TMISHDA sodir bo'lgan.",
      "Grammatik jihatdan barcha modal fe'llar bilan qurilish bir xil: modal + have + III shakl, shaxsga qarab o'zgarmaydi: \"He must have left\", \"They must have left\" — ikkalasi ham bir xil shaklda."
    ],
    "examples": [
      {
        "en": "She must have missed the train — she's usually on time.",
        "uz": "U poyezdga ulgurmagan bo'lishi kerak — u odatda vaqtida keladi."
      },
      {
        "en": "They can't have seen the notice, or they wouldn't have parked there.",
        "uz": "Ular e'lonni ko'rmagan bo'lishlari kerak, aks holda u yerga to'xtamas edi."
      },
      {
        "en": "He might have forgotten about the meeting entirely.",
        "uz": "U uchrashuv haqida butunlay unutgan bo'lishi mumkin."
      },
      {
        "en": "The lights are off — they must have already left.",
        "uz": "Chiroqlar o'chiq — ular allaqachon ketgan bo'lishlari kerak."
      },
      {
        "en": "She could have taken a different route; that's why we didn't see her.",
        "uz": "U boshqa yo'ldan borgan bo'lishi mumkin; shuning uchun uni ko'rmadik."
      },
      {
        "en": "He can't have finished already — he only started an hour ago.",
        "uz": "U hali tugatmagan bo'lishi kerak — u atigi bir soat oldin boshlagan edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She must missed the train.",
        "right": "She must have missed the train.",
        "note": "O'tmish haqidagi xulosada \"must\"dan keyin \"have + III shakl\" kerak, faqat fe'l emas."
      },
      {
        "wrong": "They can't saw the notice.",
        "right": "They can't have seen the notice.",
        "note": "\"Can't have\"dan keyin fe'lning III shakli kerak (seen), Past Simple shakli (saw) emas."
      },
      {
        "wrong": "He might has forgotten about it.",
        "right": "He might have forgotten about it.",
        "note": "Modal fe'ldan keyin \"has\" emas, \"have\" ishlatiladi — bu barcha shaxslar bilan o'zgarmaydi."
      }
    ],
    "quiz": [
      {
        "q": "The ground is wet — it ___ rained last night.",
        "options": [
          "must",
          "must have",
          "must has",
          "must to have"
        ],
        "answer": 1
      },
      {
        "q": "He ___ heard the announcement; the airport was too noisy.",
        "options": [
          "can't have",
          "mustn't have",
          "can't",
          "couldn't"
        ],
        "answer": 0
      },
      {
        "q": "She's not answering — she ___ her phone at home.",
        "options": [
          "might leave",
          "might have left",
          "might has left",
          "might left"
        ],
        "answer": 1
      },
      {
        "q": "They ___ already arrived — their car is in the driveway.",
        "options": [
          "must",
          "must have",
          "must has",
          "must to have"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She must have forget her umbrella.",
          "She must have forgotten her umbrella.",
          "She must has forgotten her umbrella.",
          "She must forgotten her umbrella."
        ],
        "answer": 1
      }
    ]
  },
  "should-have-b2": {
    "explanation": [
      "\"Should have + III shakl\" o'tmishda kutilgan, tavsiya etilgan yoki ideal bo'lgan ishni ko'rsatadi, LEKIN bu ish AMALDA sodir bo'lmagan — shuning uchun bu ko'pincha TANQID yoki AFSUS ohangida ishlatiladi: \"You should have checked the address\" (siz tekshirishingiz kerak edi, lekin tekshirmadingiz).",
      "Bu \"should\"ning oddiy shaklidan (kelajakdagi/hozirgi maslahat) farqi shunda — \"should have\" faqat O'TGAN, endi O'ZGARTIRIB BO'LMAYDIGAN vaziyat haqida gapiradi.",
      "Inkor shakl \"shouldn't have + III shakl\" — o'tmishda QILINGAN, lekin qilinmasligi kerak bo'lgan ishga afsus yoki tanqidni bildiradi: \"I shouldn't have eaten so much\" (yedim, lekin buni qilmasligim kerak edi).",
      "Bu qurilma ko'pincha o'zini-o'zi tanqid qilishda (\"I should have studied more\") yoki boshqa birovning xatti-harakatini nazokat bilan tanqid qilishda ishlatiladi — kuchli, to'g'ridan-to'g'ri ayblashdan yumshoqroq ohang beradi."
    ],
    "examples": [
      {
        "en": "You should have checked the address before you left.",
        "uz": "Ketishdan oldin manzilni tekshirishingiz kerak edi."
      },
      {
        "en": "I should have called her back yesterday, but I forgot.",
        "uz": "Kecha unga qayta qo'ng'iroq qilishim kerak edi, lekin unutdim."
      },
      {
        "en": "We shouldn't have eaten so much before the flight.",
        "uz": "Parvozdan oldin bunchalik ko'p ovqat yemasligimiz kerak edi."
      },
      {
        "en": "He should have asked for help instead of struggling alone.",
        "uz": "U yolg'iz kurashish o'rniga yordam so'rashi kerak edi."
      },
      {
        "en": "You shouldn't have spent so much money on that.",
        "uz": "Buning uchun bunchalik ko'p pul sarflamasligingiz kerak edi."
      },
      {
        "en": "I should have listened to your advice from the beginning.",
        "uz": "Boshidanoq sizning maslahatingizga quloq solishim kerak edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "You should checked the address.",
        "right": "You should have checked the address.",
        "note": "O'tmishdagi bajarilmagan ideal harakat uchun \"should have + III shakl\" kerak, faqat \"should\" yetarli emas."
      },
      {
        "wrong": "I shouldn't have eat so much.",
        "right": "I shouldn't have eaten so much.",
        "note": "\"Shouldn't have\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      },
      {
        "wrong": "She should have going to the doctor earlier.",
        "right": "She should have gone to the doctor earlier.",
        "note": "\"Should have\"dan keyin fe'l -ing shaklida emas, III shaklda bo'lishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "I ___ an umbrella — now I'm soaked.",
        "options": [
          "should bring",
          "should have brought",
          "should have bring",
          "should brought"
        ],
        "answer": 1
      },
      {
        "q": "You ___ so rude to the waiter.",
        "options": [
          "shouldn't be",
          "shouldn't have been",
          "shouldn't has been",
          "shouldn't been"
        ],
        "answer": 1
      },
      {
        "q": "We ___ earlier to avoid the traffic.",
        "options": [
          "should leave",
          "should have left",
          "should have leave",
          "should left"
        ],
        "answer": 1
      },
      {
        "q": "He ___ his phone charger — now his phone is dead.",
        "options": [
          "should pack",
          "should have packed",
          "should packed",
          "should have pack"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "She should study harder for the exam yesterday.",
          "She should have studied harder for the exam.",
          "She should have study harder for the exam.",
          "She should has studied harder."
        ],
        "answer": 1
      }
    ]
  },
  "could-have-b2": {
    "explanation": [
      "\"Could have + III shakl\" o'tmishda MAVJUD BO'LGAN, lekin ISHLATILMAGAN imkoniyatni bildiradi — bu \"should have\"dan farq qiladi, chunki bu yerda tanqid emas, faqat mumkin bo'lgan muqobil variant ta'kidlanadi: \"We could have taken a taxi\" (imkoniyat bor edi, lekin boshqa yo'l tanladik — hukm yo'q, faqat fakt).",
      "Bu qurilma ko'pincha \"lekin qilmadik\" degan qarama-qarshilikni yashirin tarzda o'z ichiga oladi: \"I could have helped you\" (yordam berish imkoniyati bor edi, lekin bermadim — sabab aytilmasligi ham mumkin).",
      "\"Could have\" yana o'tmishdagi NOANIQ ehtimol (imkoniyat, aniq emas) ma'nosida ham ishlatiladi, \"might have\"ga juda yaqin: \"The delay could have been caused by bad weather\" (sabab noaniq, faqat taxmin).",
      "Farqni saqlash muhim: \"should have\" — bajarilmagan IDEAL/tavsiya (tanqid ohangi), \"could have\" — bajarilmagan IMKONIYAT (neytral, hukm yo'q) yoki noaniq EHTIMOL."
    ],
    "examples": [
      {
        "en": "We could have taken a taxi, but we decided to walk instead.",
        "uz": "Biz taksi olishimiz mumkin edi, lekin piyoda yurishga qaror qildik."
      },
      {
        "en": "The delay could have been caused by the bad weather.",
        "uz": "Kechikish yomon ob-havo tufayli bo'lgan bo'lishi mumkin."
      },
      {
        "en": "I could have finished earlier if I hadn't been interrupted.",
        "uz": "Agar meni bo'lishmaganida, men erta tugatgan bo'lardim."
      },
      {
        "en": "She could have won the race, but she twisted her ankle.",
        "uz": "U poygada g'olib bo'lishi mumkin edi, lekin oyog'ini burib oldi."
      },
      {
        "en": "They could have told us about the change earlier.",
        "uz": "Ular o'zgarish haqida bizga oldinroq aytishlari mumkin edi."
      },
      {
        "en": "You could have called me instead of waiting outside.",
        "uz": "Tashqarida kutish o'rniga menga qo'ng'iroq qilishingiz mumkin edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "We could take a taxi instead.",
        "right": "We could have taken a taxi instead.",
        "note": "O'tmishda bo'lmagan imkoniyat uchun \"could have + III shakl\" kerak, oddiy \"could\" emas."
      },
      {
        "wrong": "She could have win the race.",
        "right": "She could have won the race.",
        "note": "\"Could have\"dan keyin fe'lning III shakli kerak (won), asl shakli emas."
      },
      {
        "wrong": "The delay could be caused by the weather. (o'tmish haqida taxmin)",
        "right": "The delay could have been caused by the weather.",
        "note": "O'tmish haqidagi noaniq taxmin uchun \"could have been\" kerak, oddiy \"could be\" emas."
      }
    ],
    "quiz": [
      {
        "q": "You ___ me if you needed help — I was right here.",
        "options": [
          "could ask",
          "could have asked",
          "could have ask",
          "could asked"
        ],
        "answer": 1
      },
      {
        "q": "The accident ___ by the icy road.",
        "options": [
          "could cause",
          "could have caused",
          "could have been caused",
          "could be caused"
        ],
        "answer": 2
      },
      {
        "q": "I ___ the job, but I decided to stay at my old company.",
        "options": [
          "could take",
          "could have taken",
          "could have take",
          "could taken"
        ],
        "answer": 1
      },
      {
        "q": "They ___ earlier, but the traffic was terrible.",
        "options": [
          "could arrive",
          "could have arrived",
          "could have arrive",
          "could arrived"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We could have won that match.",
          "We could win that match yesterday.",
          "We could have wins that match.",
          "We could have winning that match."
        ],
        "answer": 0
      }
    ]
  },
  "might-have-b2": {
    "explanation": [
      "\"Might have + III shakl\" o'tmishdagi NOANIQ, ISHONCH DARAJASI PAST ehtimolni bildiradi — bu \"must have\"dan farqli o'laroq, gapiruvchi haqiqatan bilmaydi, faqat ochiq bir imkoniyatni ko'rsatib qo'yadi: \"The message might have gone to spam\" (aniq emas, shunchaki bitta ehtimol).",
      "\"Might have\" ko'pincha bir necha muqobil izohlar ro'yxatida ishlatiladi, chunki gapiruvchi hech qaysi variantga to'liq ishonmaydi: \"He might have missed the bus, or he might have forgotten about our meeting.\"",
      "\"May have\" bilan ma'nosi deyarli bir xil, faqat \"might have\" so'zlashuv nutqida biroz ko'proq ishlatiladi va ba'zan \"may have\"ga qaraganda biroz kamroq ishonchni bildiradi.",
      "Inkor shakl \"might not have\" — o'tmishda biror narsa sodir BO'LMAGAN bo'lishi mumkinligini bildiradi: \"She might not have received the email\" (olmagan bo'lishi ham mumkin, aniq emas)."
    ],
    "examples": [
      {
        "en": "The message might have gone to spam — check your junk folder.",
        "uz": "Xabar spam papkasiga tushgan bo'lishi mumkin — keraksiz papkani tekshiring."
      },
      {
        "en": "He might have missed the bus; that would explain why he's late.",
        "uz": "U avtobusga ulgurmagan bo'lishi mumkin; shuning uchun kech qolgandir."
      },
      {
        "en": "She might not have seen my message yet.",
        "uz": "U hali mening xabarimni ko'rmagan bo'lishi mumkin."
      },
      {
        "en": "They might have changed their plans at the last minute.",
        "uz": "Ular oxirgi daqiqada rejalarini o'zgartirgan bo'lishlari mumkin."
      },
      {
        "en": "I might have left my keys at the office.",
        "uz": "Kalitlarimni ofisda qoldirib ketgan bo'lishim mumkin."
      },
      {
        "en": "The problem might have started with the last software update.",
        "uz": "Muammo oxirgi dasturiy yangilanish bilan boshlangan bo'lishi mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "The message might went to spam.",
        "right": "The message might have gone to spam.",
        "note": "\"Might\"dan keyin o'tmish haqida gapirilganda \"have + III shakl\" kerak, oddiy Past Simple shakli emas."
      },
      {
        "wrong": "She might not saw my message.",
        "right": "She might not have seen my message.",
        "note": "\"Might not\"dan keyin ham \"have + III shakl\" kerak."
      },
      {
        "wrong": "They might has changed their plans.",
        "right": "They might have changed their plans.",
        "note": "Modal fe'ldan keyin \"has\" emas, \"have\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "He isn't answering — he ___ his phone on silent.",
        "options": [
          "might put",
          "might have put",
          "might has put",
          "might putting"
        ],
        "answer": 1
      },
      {
        "q": "I can't find my glasses — I ___ them at work.",
        "options": [
          "might leave",
          "might have left",
          "might has left",
          "might leaving"
        ],
        "answer": 1
      },
      {
        "q": "She ___ the invitation — she never mentioned it.",
        "options": [
          "might not receive",
          "might not have received",
          "mightn't received",
          "might not has received"
        ],
        "answer": 1
      },
      {
        "q": "The delay ___ by a technical problem.",
        "options": [
          "might cause",
          "might have caused",
          "might have been caused",
          "might be caused"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "They might have forget the address.",
          "They might have forgotten the address.",
          "They might forgotten the address.",
          "They might has forgotten the address."
        ],
        "answer": 1
      }
    ]
  },
  "must-cant-have-b2": {
    "explanation": [
      "\"Must have\" va \"can't have\" o'tmish haqidagi ikki QARAMA-QARSHI, lekin ikkalasi ham KUCHLI xulosani bildiradi — \"must have\" kuchli ijobiy xulosa (\"albatta shunday bo'lgan\"), \"can't have\" esa kuchli salbiy xulosa (\"albatta bunday bo'lmagan, mumkin emas\").",
      "\"Must have\" barcha dalillar bir xulosaga ishora qilganda ishlatiladi: \"They can't have seen the notice\" (aksincha misol) — \"The lights are off; they must have left already\" (barcha belgilar ketishganini ko'rsatyapti).",
      "\"Can't have\" — mantiqiy jihatdan MUMKIN EMASLIKNI bildiradi, oddiy \"probably not\" emas, balki \"bu mutlaqo mantiqsiz\" darajasidagi ishonch: \"He can't have finished already — he only started ten minutes ago\" (vaqt jihatidan mumkin emas).",
      "Muhim: bu ikkalasining o'rtasida \"mustn't have\" DEGAN shakl YO'Q — \"must\"ning inkori sifatida bu ma'noda \"can't have\" ishlatiladi, \"mustn't have\" grammatik jihatdan noto'g'ri."
    ],
    "examples": [
      {
        "en": "The lights are off — they must have already left for the airport.",
        "uz": "Chiroqlar o'chiq — ular aeroportga allaqachon ketishgan bo'lishi kerak."
      },
      {
        "en": "He can't have finished already; he only started ten minutes ago.",
        "uz": "U hali tugatmagan bo'lishi kerak; u atigi o'n daqiqa oldin boshlagan edi."
      },
      {
        "en": "She must have worked really hard to achieve such results.",
        "uz": "Bunday natijalarga erishish uchun u juda qattiq ishlagan bo'lishi kerak."
      },
      {
        "en": "They can't have missed the announcement; it was on every screen.",
        "uz": "Ular e'londan mahrum bo'lgan bo'lishlari mumkin emas; u har bir ekranda edi."
      },
      {
        "en": "This must have taken years of practice.",
        "uz": "Bu yillar davomida mashq qilishni talab qilgan bo'lishi kerak."
      },
      {
        "en": "You can't have read the whole book in one night — it's 800 pages!",
        "uz": "Siz butun kitobni bir kechada o'qib chiqqan bo'lishingiz mumkin emas — u 800 sahifa!"
      }
    ],
    "mistakes": [
      {
        "wrong": "They mustn't have seen the notice.",
        "right": "They can't have seen the notice.",
        "note": "\"Must\"ning kuchli inkori \"mustn't have\" emas, \"can't have\" — bu grammatik jihatdan alohida shakl."
      },
      {
        "wrong": "He must has worked hard for this.",
        "right": "He must have worked hard for this.",
        "note": "Modal fe'ldan keyin \"has\" emas, \"have\" ishlatiladi."
      },
      {
        "wrong": "She can't have finish already.",
        "right": "She can't have finished already.",
        "note": "\"Can't have\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "The ground is dry — it ___ rained last night.",
        "options": [
          "must have",
          "can't have",
          "should have",
          "would have"
        ],
        "answer": 1
      },
      {
        "q": "She got a perfect score — she ___ studied very hard.",
        "options": [
          "can't have",
          "must have",
          "shouldn't have",
          "would have"
        ],
        "answer": 1
      },
      {
        "q": "He ___ read the whole report in five minutes — it's fifty pages long.",
        "options": [
          "must have",
          "can't have",
          "should have",
          "would have"
        ],
        "answer": 1
      },
      {
        "q": "They're both wearing coats — it ___ cold outside.",
        "options": [
          "must be",
          "can't be",
          "must have",
          "can't have"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "They mustn't have left yet.",
          "They can't have left yet.",
          "They must haven't left yet.",
          "They can't left yet."
        ],
        "answer": 1
      }
    ]
  },
  "third-conditional-b2": {
    "explanation": [
      "Third Conditional o'tmishda BO'LMAGAN shart va uning HAM bo'lmagan natijasini chuqurroq tahlil qilish, ko'pincha afsus yoki o'z-o'zini/boshqalarni baholash uchun ishlatiladi: \"If we had left earlier, we would have avoided the traffic\" (ketmadik, tirbandlikka tushdik — bu allaqachon o'zgarmaydigan o'tmish).",
      "Qurilishi: If + Past Perfect (had + III shakl), would have + III shakl. Natija qismida \"would have\" o'rniga vaziyatga qarab \"could have\" (imkoniyat) yoki \"might have\" (ehtimol) ham ishlatilishi mumkin: \"If we had left earlier, we might have avoided the traffic\" (ehtimol, aniq emas).",
      "Bu zamon ko'pincha professional, akademik va formal kontekstlarda o'tmishdagi qarorlarni tahlil qilish, xatolardan saboq olish va muqobil natijalarni ko'rib chiqishda ishlatiladi: \"If the company had invested earlier, it would have gained a competitive edge.\"",
      "\"If\" bandi va natija qismini almashtirish mumkin, ma'no o'zgarmaydi: \"We would have avoided the traffic if we had left earlier\" = \"If we had left earlier, we would have avoided the traffic.\""
    ],
    "examples": [
      {
        "en": "If we had left earlier, we would have avoided the traffic.",
        "uz": "Agar erta chiqqan bo'lsak, tirbandlikdan qochgan bo'lardik."
      },
      {
        "en": "If the company had invested in research, it would have gained a competitive edge.",
        "uz": "Agar kompaniya tadqiqotga sarmoya kiritganida, u raqobatbardosh ustunlikka ega bo'lardi."
      },
      {
        "en": "She wouldn't have made that mistake if she had read the instructions carefully.",
        "uz": "Agar ko'rsatmalarni diqqat bilan o'qigan bo'lsa, u bu xatoni qilmagan bo'lardi."
      },
      {
        "en": "If we had known about the delay, we could have rescheduled the meeting.",
        "uz": "Agar kechikish haqida bilganimizda, uchrashuvni qayta rejalashtirgan bo'lardik."
      },
      {
        "en": "If he had accepted the offer, his career might have taken a very different path.",
        "uz": "Agar taklifni qabul qilganida, uning karerasi butunlay boshqa yo'l tutgan bo'lishi mumkin edi."
      },
      {
        "en": "If they had tested the product more thoroughly, this problem would not have occurred.",
        "uz": "Agar mahsulotni batafsilroq sinab ko'rishganida, bu muammo yuzaga kelmagan bo'lardi."
      }
    ],
    "mistakes": [
      {
        "wrong": "If we left earlier, we would have avoided the traffic.",
        "right": "If we had left earlier, we would have avoided the traffic.",
        "note": "Third Conditional'da \"if\" bandida Past Perfect (had left) kerak, oddiy Past Simple emas."
      },
      {
        "wrong": "If we had left earlier, we would avoid the traffic.",
        "right": "If we had left earlier, we would have avoided the traffic.",
        "note": "Natija qismida \"would have + III shakl\" kerak, oddiy \"would\" emas."
      },
      {
        "wrong": "She wouldn't have make that mistake.",
        "right": "She wouldn't have made that mistake.",
        "note": "\"Would have\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "If they ___ harder, they would have won the contract.",
        "options": [
          "negotiated",
          "had negotiated",
          "would negotiate",
          "negotiate"
        ],
        "answer": 1
      },
      {
        "q": "She would have passed the exam if she ___ more.",
        "options": [
          "studied",
          "had studied",
          "would study",
          "studies"
        ],
        "answer": 1
      },
      {
        "q": "If we had known about the problem, we ___ it earlier.",
        "options": [
          "fixed",
          "would fix",
          "would have fixed",
          "fix"
        ],
        "answer": 2
      },
      {
        "q": "He wouldn't have missed the flight if he ___ earlier.",
        "options": [
          "left",
          "had left",
          "would leave",
          "leaves"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "If I had known, I would tell you.",
          "If I knew, I would have told you.",
          "If I had known, I would have told you.",
          "If I had known, I told you."
        ],
        "answer": 2
      }
    ]
  },
  "mixed-conditionals-b2": {
    "explanation": [
      "Mixed Conditionals ikki turli vaqt bosqichini bitta gapda bog'laydi — bu \"toza\" Second yoki Third Conditional'dan farqli o'laroq, shart va natija BOSHQA-BOSHQA VAQTGA tegishli bo'lganda ishlatiladi.",
      "Birinchi tur: O'TGAN SHART + HOZIRGI NATIJA. Qurilishi: If + Past Perfect, would + asl fe'l: \"If I had taken that job, I would live abroad now\" (o'tmishdagi qaror — hozirgi natijaga ta'sir qiladi, natija HOZIR davom etmoqda, o'tmishda emas).",
      "Ikkinchi tur: HOZIRGI/DOIMIY HOLAT + O'TGAN NATIJA. Qurilishi: If + Past Simple, would have + III shakl: \"If she weren't so shy, she would have spoken up at the meeting\" (uning xarakteri — doimiy holat; natija esa muayyan o'tgan voqeada ko'rinadi).",
      "Mixed Conditionals'ni to'g'ri qurish uchun avval har bir qism QAYSI VAQTGA tegishli ekanini aniqlash kerak — shart o'tmishdami yoki hozirgi/doimiymi, natija hozirgimi yoki o'tgan bir voqeaga tegishlimi."
    ],
    "examples": [
      {
        "en": "If I had taken that job, I would live abroad now.",
        "uz": "Agar o'sha ishni qabul qilgan bo'lsam, hozir chet elda yashagan bo'lardim."
      },
      {
        "en": "If she weren't so shy, she would have spoken up at the meeting.",
        "uz": "Agar u bunchalik uyatchan bo'lmasa edi, uchrashuvda o'z fikrini bildirgan bo'lardi."
      },
      {
        "en": "If he hadn't studied medicine, he wouldn't be a doctor today.",
        "uz": "Agar tibbiyotni o'qimaganida, bugun shifokor bo'lmasdi."
      },
      {
        "en": "If I were more organised, I wouldn't have missed the deadline.",
        "uz": "Agar men uyushqoqroq bo'lganimda, muddatni o'tkazib yubormagan bo'lardim."
      },
      {
        "en": "If they hadn't moved to this city, they wouldn't know each other now.",
        "uz": "Agar bu shaharga ko'chib kelishmaganida, hozir bir-birlarini bilishmasdi."
      },
      {
        "en": "If I didn't have so much work, I would have joined you for dinner.",
        "uz": "Agar menda bunchalik ko'p ish bo'lmaganida, sizga kechki ovqatda qo'shilgan bo'lardim."
      }
    ],
    "mistakes": [
      {
        "wrong": "If I had taken that job, I would have lived abroad now.",
        "right": "If I had taken that job, I would live abroad now.",
        "note": "Natija HOZIRGI vaqtga tegishli bo'lsa, \"would have\" emas, oddiy \"would\" ishlatiladi."
      },
      {
        "wrong": "If she wasn't so shy, she would speak up at the meeting yesterday.",
        "right": "If she weren't so shy, she would have spoken up at the meeting yesterday.",
        "note": "Shart HOZIRGI/doimiy xarakter, lekin natija O'TGAN aniq voqea bo'lsa, \"would have + III shakl\" kerak."
      },
      {
        "wrong": "If he hadn't studied medicine, he wouldn't have been a doctor today.",
        "right": "If he hadn't studied medicine, he wouldn't be a doctor today.",
        "note": "\"Today\" hozirgi vaqtni bildiradi — natija qismida oddiy \"would\" kerak, \"would have\" emas."
      }
    ],
    "quiz": [
      {
        "q": "If I ___ harder at school, I would have a better job now.",
        "options": [
          "studied",
          "had studied",
          "would study",
          "study"
        ],
        "answer": 1
      },
      {
        "q": "If he weren't so careless, he ___ his phone yesterday.",
        "options": [
          "wouldn't lose",
          "wouldn't have lost",
          "won't lose",
          "didn't lose"
        ],
        "answer": 1
      },
      {
        "q": "If they had saved more money, they ___ a house now.",
        "options": [
          "would buy",
          "would have bought",
          "will buy",
          "bought"
        ],
        "answer": 0
      },
      {
        "q": "If I didn't have this allergy, I ___ that dessert earlier.",
        "options": [
          "would try",
          "would have tried",
          "will try",
          "tried"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (o'tgan sabab, hozirgi natija)?",
        "options": [
          "If I had learned to swim, I would join you at the pool now.",
          "If I learned to swim, I would have joined you at the pool now.",
          "If I had learned to swim, I would have joined you at the pool now.",
          "If I learn to swim, I would join you at the pool now."
        ],
        "answer": 0
      }
    ]
  },
  "passive-perfect-continuous-b2": {
    "explanation": [
      "Murakkab zamonlarda ham passive voice ishlatilishi mumkin — asosiy qoida saqlanadi: [tegishli zamondagi \"be\"] + fe'lning III shakli, lekin bu zamonlar bir necha yordamchi qismdan iborat bo'lgani uchun qurilishi ancha uzunroq.",
      "Present Perfect passive: has/have been + III shakl (\"The issue has been discussed several times\"). Modal passive: modal + be + III shakl (\"This must be signed by tomorrow\"). Perfect modal passive: modal + have been + III shakl (\"The email should have been sent yesterday\").",
      "Continuous passive kamroq ishlatiladi, lekin mavjud: is/are being + III shakl (hozirgi: \"The road is being repaired\"), was/were being + III shakl (o'tgan: \"The report was being reviewed when I called\").",
      "Murakkab passive qurilishlarni yasashning eng ishonchli yo'li — avval active gapni to'g'ri zamonda tuzish, keyin uni bosqichma-bosqich passive'ga aylantirish: \"They have discussed the issue\" → \"The issue has been discussed.\""
    ],
    "examples": [
      {
        "en": "The issue has been discussed several times in previous meetings.",
        "uz": "Bu masala oldingi uchrashuvlarda bir necha marta muhokama qilingan."
      },
      {
        "en": "This report must be signed by both directors before Friday.",
        "uz": "Bu hisobot jumagacha ikkala direktor tomonidan imzolanishi shart."
      },
      {
        "en": "The invoice should have been sent last week, but it wasn't.",
        "uz": "Hisob-faktura o'tgan hafta yuborilishi kerak edi, lekin yuborilmadi."
      },
      {
        "en": "The road is being repaired, so expect some delays.",
        "uz": "Yo'l ta'mirlanmoqda, shuning uchun ba'zi kechikishlarni kutib turing."
      },
      {
        "en": "The proposal is being reviewed by the committee at the moment.",
        "uz": "Taklif hozirda qo'mita tomonidan ko'rib chiqilmoqda."
      },
      {
        "en": "This policy might have been updated since we last checked.",
        "uz": "Bu siyosat biz oxirgi tekshirganimizdan beri yangilangan bo'lishi mumkin."
      }
    ],
    "mistakes": [
      {
        "wrong": "The issue has discussed several times.",
        "right": "The issue has been discussed several times.",
        "note": "Present Perfect passive'da \"has been\" kerak, faqat \"has\" yetarli emas."
      },
      {
        "wrong": "The invoice should sent last week.",
        "right": "The invoice should have been sent last week.",
        "note": "Modal + perfect + passive uchun \"should have been\" to'liq shakli kerak."
      },
      {
        "wrong": "The road is repairing at the moment.",
        "right": "The road is being repaired at the moment.",
        "note": "Hozirgi davomiy passive'da \"is being\" kerak, faqat \"is\" + -ing emas — yo'l o'zi ta'mirlamaydi, u ta'mirlanadi."
      }
    ],
    "quiz": [
      {
        "q": "The contract ___ by both parties before it takes effect.",
        "options": [
          "must sign",
          "must be signed",
          "must have signed",
          "must being signed"
        ],
        "answer": 1
      },
      {
        "q": "The report ___ when the manager walked in.",
        "options": [
          "was being reviewed",
          "was reviewed",
          "has been reviewed",
          "is being reviewed"
        ],
        "answer": 0
      },
      {
        "q": "This email ___ sent yesterday, but there was a delay.",
        "options": [
          "should send",
          "should have sent",
          "should have been sent",
          "should be sent"
        ],
        "answer": 2
      },
      {
        "q": "The bridge ___ since early this year.",
        "options": [
          "is being repaired",
          "has been being repaired",
          "has been repaired",
          "is repaired"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The building is repair now.",
          "The building is being repaired now.",
          "The building is repairing now.",
          "The building has repair now."
        ],
        "answer": 1
      }
    ]
  },
  "passive-reporting-b2": {
    "explanation": [
      "Passive reporting strukturalari umumiy fikr, mish-mish yoki manbasi aniq ko'rsatilmagan da'voni RASMIY va MASOFALI ohangda bildirish uchun ishlatiladi — bu ko'pincha yangiliklar, ilmiy matnlar va rasmiy hisobotlarda uchraydi.",
      "Birinchi qurilma: \"It is said/believed/thought/reported that + gap\": \"It is said that the company will merge with a competitor\" (kim aytgani noaniq, umumiy fikr).",
      "Ikkinchi qurilma: \"Subject + is said/believed/thought + to be/to have + III shakl\": \"The treatment is believed to be effective\" (hozirgi holat haqida) yoki \"The building is thought to have been damaged\" (o'tmishdagi voqea haqida — \"to have + III shakl\" bilan).",
      "Ikkala qurilma ham ma'no jihatidan bir xil, faqat ikkinchisi (subject + is said to) ingliz tilida biroz ixchamroq va yozma, rasmiy uslubda ko'proq ishlatiladi: \"It is said that she is the best candidate\" = \"She is said to be the best candidate.\""
    ],
    "examples": [
      {
        "en": "It is said that the company will merge with a larger competitor.",
        "uz": "Aytishlaricha, kompaniya kattaroq raqib bilan qo'shiladi."
      },
      {
        "en": "The treatment is believed to be effective for most patients.",
        "uz": "Davolash usuli ko'pchilik bemorlar uchun samarali deb hisoblanadi."
      },
      {
        "en": "The ancient building is thought to have been damaged by an earthquake.",
        "uz": "Qadimiy bino zilzila natijasida shikastlangan deb o'ylanadi."
      },
      {
        "en": "It is reported that the negotiations are progressing well.",
        "uz": "Xabar berilishicha, muzokaralar yaxshi davom etmoqda."
      },
      {
        "en": "She is said to be one of the most talented musicians of her generation.",
        "uz": "U o'z avlodining eng iqtidorli musiqachilaridan biri deb aytiladi."
      },
      {
        "en": "It is understood that the decision will be announced next week.",
        "uz": "Ma'lumki, qaror keyingi hafta e'lon qilinadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "It is said the company will merge.",
        "right": "It is said that the company will merge.",
        "note": "\"It is said\"dan keyin \"that\" tushirilmasligi rasmiy yozuvda afzal ko'riladi (kundalik nutqda tushirilishi ham mumkin, lekin rasmiy uslubda saqlanadi)."
      },
      {
        "wrong": "The building is thought to damaged by the storm.",
        "right": "The building is thought to have been damaged by the storm.",
        "note": "O'tgan voqea haqida gapirganda \"to have been + III shakl\" to'liq shakli kerak."
      },
      {
        "wrong": "She is said being the best candidate.",
        "right": "She is said to be the best candidate.",
        "note": "\"Is said\"dan keyin \"to be\" kerak, \"being\" emas."
      }
    ],
    "quiz": [
      {
        "q": "It ___ that the two companies will announce a partnership soon.",
        "options": [
          "says",
          "is said",
          "is saying",
          "said"
        ],
        "answer": 1
      },
      {
        "q": "The bridge ___ built over two thousand years ago.",
        "options": [
          "is believed to be",
          "is believed to have been",
          "believes to be",
          "is believing to be"
        ],
        "answer": 1
      },
      {
        "q": "He ___ the wealthiest man in the region.",
        "options": [
          "is said to be",
          "is said being",
          "says to be",
          "is saying to be"
        ],
        "answer": 0
      },
      {
        "q": "It ___ that the new law will take effect in January.",
        "options": [
          "is reporting",
          "is reported",
          "reports",
          "reported"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It is thought she is abroad.",
          "It is thought that she is abroad.",
          "It thought that she is abroad.",
          "She is thinks to be abroad."
        ],
        "answer": 1
      }
    ]
  },
  "have-vs-get-something-done": {
    "explanation": [
      "\"Have\" va \"get something done\" ma'no jihatidan bir xil — ikkalasi ham boshqa birov tomonidan bajarilgan xizmatni bildiradi — lekin ular ISHLATILISH USLUBI va KONTEKST bo'yicha farq qiladi.",
      "\"Have + object + III shakl\" biroz rasmiyroq va neytral, xizmat ko'rsatish (professional xizmat, texnik ish) kontekstida ko'proq ishlatiladi: \"We had the windows replaced last week\" (rasmiy, professional kontekst).",
      "\"Get + object + III shakl\" so'zlashuv nutqida ko'proq ishlatiladi va ba'zan ish qanchalik OSON yoki QIYIN ekanligiga (harakat, kuch sarflashga) urg'u beradi: \"I finally got my computer fixed\" (\"nihoyat\" degan norasmiy, shaxsiy ohang).",
      "\"Get\" yana salbiy, kutilmagan voqealar haqida ham ishlatilishi mumkin (bu holatda \"have\" bilan almashtirib bo'lmaydi): \"He got his wallet stolen\" (bu YOMON voqea — u xizmat buyurmadi, bu unga sodir bo'ldi; \"have\" bu ma'noda ishlatilmaydi)."
    ],
    "examples": [
      {
        "en": "We had the windows replaced last week by a professional company.",
        "uz": "O'tgan hafta derazalarimizni professional kompaniya orqali almashtirdik."
      },
      {
        "en": "I finally got my computer fixed after weeks of problems.",
        "uz": "Nihoyat, bir necha haftalik muammolardan keyin kompyuterimni tuzattirdim."
      },
      {
        "en": "He got his wallet stolen on the train yesterday.",
        "uz": "Kecha poyezdda uning hamyoni o'g'irlandi."
      },
      {
        "en": "She is having her wedding dress made by a local designer.",
        "uz": "U to'y libosini mahalliy dizaynerga tiktiryapti."
      },
      {
        "en": "We need to get this contract translated into English.",
        "uz": "Bu shartnomani ingliz tiliga tarjima qildirishimiz kerak."
      },
      {
        "en": "They had their kitchen renovated over the summer.",
        "uz": "Ular yoz davomida oshxonalarini ta'mirlatishdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "He had his wallet stolen yesterday. (u buni xohlamagan, kutilmagan)",
        "right": "He got his wallet stolen yesterday.",
        "note": "Salbiy, kutilmagan voqealar uchun \"have\" emas, \"get\" ishlatiladi."
      },
      {
        "wrong": "We had replace the windows.",
        "right": "We had the windows replaced.",
        "note": "Causative qurilishda object (windows) \"have\"dan keyin, fe'lning III shakli undan keyin keladi."
      },
      {
        "wrong": "I got fix my computer.",
        "right": "I got my computer fixed.",
        "note": "\"Get\"dan keyin ham object, keyin fe'lning III shakli keladi — tartib muhim."
      }
    ],
    "quiz": [
      {
        "q": "She ___ her car stolen from outside her house last night.",
        "options": [
          "had",
          "got",
          "made",
          "did"
        ],
        "answer": 1
      },
      {
        "q": "We are going to ___ the roof repaired next month.",
        "options": [
          "have",
          "make",
          "do",
          "let"
        ],
        "answer": 0
      },
      {
        "q": "He finally ___ his suit tailored for the wedding.",
        "options": [
          "got",
          "made",
          "did",
          "let"
        ],
        "answer": 0
      },
      {
        "q": "They ___ their photos taken by a professional last weekend.",
        "options": [
          "had",
          "made",
          "did",
          "let"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI (kutilmagan, yomon voqea)?",
        "options": [
          "I had my phone stolen at the station.",
          "I got my phone stolen at the station.",
          "I did my phone stolen at the station.",
          "I made my phone stolen at the station."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-reported-statements": {
    "explanation": [
      "Murakkab reported speech'da zamon BACKSHIFT QILINISHI SHART EMAS, agar gap HALI HAM to'g'ri, o'zgarmas fakt yoki umumiy haqiqat bo'lsa: \"Lola explained that the rule still applies\" (\"still applies\" — Present Simple saqlangan, chunki qoida hozir ham amal qiladi).",
      "Backshift ayniqsa quyidagi holatlarda tushirilishi mumkin: gapiruvchi darhol (bir necha soniya ichida) qayta aytayotganda, gap doimiy fakt bo'lganda, yoki gapning to'g'riligi hali ham dolzarb bo'lganda: \"She said that Tashkent is the capital of Uzbekistan\" (o'zgarmas fakt — \"is\" saqlanishi mumkin).",
      "Modal fe'llarning ba'zilari backshift qilinmaydi, chunki ularning o'zi allaqachon \"o'tgan\" shaklga ega yoki o'zgarmaydi: could, might, should, would, must (ko'pincha) — bular reported speech'da o'z holicha qoladi.",
      "Kontekstga qarab tanlash ko'nikmasi B2 darajasida muhim: mexanik ravishda har doim backshift qilish emas, balki gapning HALI HAM to'g'ri yoki dolzarbligini baholab, mos zamonni tanlash kerak."
    ],
    "examples": [
      {
        "en": "Lola explained that the rule still applies to new employees.",
        "uz": "Lola bu qoida yangi xodimlarga ham amal qilishini tushuntirdi."
      },
      {
        "en": "The teacher said that practice makes perfect.",
        "uz": "O'qituvchi mashq mukammallikka olib kelishini aytdi."
      },
      {
        "en": "He told me a minute ago that he is on his way.",
        "uz": "U bir daqiqa oldin menga yo'lda ekanini aytdi."
      },
      {
        "en": "She mentioned that the museum is closed on Mondays.",
        "uz": "U muzey dushanba kunlari yopiqligini aytib o'tdi."
      },
      {
        "en": "My colleague said that he might join us later.",
        "uz": "Hamkasbim keyinroq bizga qo'shilishi mumkinligini aytdi."
      },
      {
        "en": "The scientist explained that water boils at a lower temperature at high altitude.",
        "uz": "Olim baland tog'da suv pastroq haroratda qaynashini tushuntirdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The scientist said that water boiled at 100 degrees. (doimiy fakt)",
        "right": "The scientist said that water boils at 100 degrees.",
        "note": "O'zgarmas ilmiy fakt uchun backshift shart emas — Present Simple saqlanishi mumkin."
      },
      {
        "wrong": "He told me that he must have called yesterday.",
        "right": "He told me that he had to call yesterday. / He told me that he must call soon.",
        "note": "\"Must\" majburiyat ma'nosida reported speech'da ko'pincha \"had to\"ga aylanadi (kontekstga qarab), \"must have\" boshqa ma'noni bildiradi."
      },
      {
        "wrong": "She mentioned the museum was closed on Mondays. (hali ham dolzarb, umumiy qoida)",
        "right": "She mentioned that the museum is closed on Mondays.",
        "note": "Hali ham to'g'ri, doimiy qoida uchun backshift shart emas."
      }
    ],
    "quiz": [
      {
        "q": "The teacher explained that the Earth ___ around the Sun.",
        "options": [
          "went",
          "goes",
          "was going",
          "had gone"
        ],
        "answer": 1
      },
      {
        "q": "She said a moment ago that she ___ hungry.",
        "options": [
          "was",
          "is",
          "were",
          "has been"
        ],
        "answer": 1
      },
      {
        "q": "He mentioned that the shop ___ at nine every day (umumiy jadval).",
        "options": [
          "opened",
          "opens",
          "was opening",
          "had opened"
        ],
        "answer": 1
      },
      {
        "q": "My friend told me that he ___ join us later.",
        "options": [
          "might",
          "mighted",
          "will might",
          "mightn't to"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI (o'zgarmas fakt)?",
        "options": [
          "She said that ice melted at zero degrees.",
          "She said that ice melts at zero degrees.",
          "She said that ice was melting at zero degrees.",
          "She said that ice had melted at zero degrees."
        ],
        "answer": 1
      }
    ]
  },
  "reporting-verbs-b2": {
    "explanation": [
      "Ingliz tilida \"say\" va \"tell\"dan tashqari o'nlab boshqa reporting verb (xabar beruvchi fe'l) bor — suggest, admit, deny, warn, advise, recommend, insist, offer, promise — va har biri O'ZIGA XOS grammatik struktura (complement) bilan ishlaydi.",
      "Ba'zi fe'llar \"that + gap\" bilan ishlaydi: \"He admitted that he had made a mistake.\" Ba'zilari \"object + to-infinitive\" bilan: \"The manager advised us to wait\" (kimga — us, nima qilish — to wait).",
      "\"Suggest\" va \"recommend\" o'ziga xos — ular \"object + to-infinitive\" bilan ISHLATILMAYDI (bu — eng ko'p uchraydigan xato), balki \"that + gap\" yoki \"gerund\" bilan ishlaydi: \"She suggested going to the cinema\" yoki \"She suggested that we go to the cinema\" (\"She suggested us to go\" NOTO'G'RI).",
      "\"Warn\" ikki xil strukturada ishlashi mumkin: \"object + to-infinitive\" (ogohlantirish — nima qilish kerak) yoki \"object + about/against\" (ogohlantirish — nimadan ehtiyot bo'lish kerak): \"She warned him to be careful\" / \"She warned him about the risks.\""
    ],
    "examples": [
      {
        "en": "The manager advised us to wait until the results were confirmed.",
        "uz": "Menejer bizga natijalar tasdiqlanguncha kutishni maslahat berdi."
      },
      {
        "en": "He admitted that he had made a serious mistake.",
        "uz": "U jiddiy xato qilganini tan oldi."
      },
      {
        "en": "She suggested going to the cinema instead of staying home.",
        "uz": "U uyda qolish o'rniga kinoteatrga borishni taklif qildi."
      },
      {
        "en": "They denied breaking the agreement.",
        "uz": "Ular kelishuvni buzganliklarini rad etishdi."
      },
      {
        "en": "The doctor recommended that he rest for a few more days.",
        "uz": "Shifokor unga yana bir necha kun dam olishni tavsiya qildi."
      },
      {
        "en": "She warned us about the heavy traffic on that road.",
        "uz": "U bizni o'sha yo'ldagi og'ir tirbandlik haqida ogohlantirdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "She suggested us to go to the cinema.",
        "right": "She suggested going to the cinema. / She suggested that we go to the cinema.",
        "note": "\"Suggest\" \"object + to-infinitive\" bilan ishlatilmaydi — gerund yoki \"that\" bandi kerak."
      },
      {
        "wrong": "He admitted to made a mistake.",
        "right": "He admitted making a mistake. / He admitted that he had made a mistake.",
        "note": "\"Admit\"dan keyin gerund yoki \"that\" bandi keladi, \"to + III shakl\" emas."
      },
      {
        "wrong": "The doctor recommended him to rest.",
        "right": "The doctor recommended that he rest. / The doctor recommended resting.",
        "note": "\"Recommend\" \"object + to-infinitive\" bilan ishlatilmaydi, xuddi \"suggest\" kabi."
      }
    ],
    "quiz": [
      {
        "q": "She suggested ___ a taxi instead of walking.",
        "options": [
          "to take",
          "us to take",
          "taking",
          "take"
        ],
        "answer": 2
      },
      {
        "q": "He denied ___ the money from the office.",
        "options": [
          "to take",
          "taking",
          "take",
          "took"
        ],
        "answer": 1
      },
      {
        "q": "The teacher advised the students ___ more before the exam.",
        "options": [
          "to practise",
          "practising",
          "practise",
          "practised"
        ],
        "answer": 0
      },
      {
        "q": "She warned them ___ careful on the icy road.",
        "options": [
          "to be",
          "being",
          "be",
          "that be"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "He suggested me to leave early.",
          "He suggested leaving early.",
          "He suggested to leave early.",
          "He suggested I to leave early."
        ],
        "answer": 1
      }
    ]
  },
  "reduced-relatives-b2": {
    "explanation": [
      "Reduced relative clause (qisqartirilgan relative clause) relative pronoun (who/which/that) va yordamchi fe'lni tushirib, gapni ixchamlashtiradi — bu ayniqsa yozma, rasmiy uslubda keng qo'llaniladi.",
      "AKTIV ma'noda -ing shakli ishlatiladi: \"The people who are waiting outside\" → \"The people waiting outside\" (kim harakat qilyapti — o'zi, aktiv).",
      "PASSIV ma'noda past participle (III shakl) ishlatiladi: \"Applicants who are selected for interview will be contacted\" → \"Applicants selected for interview will be contacted\" (nomzodlar harakat qilmaydi, ular TANLANADI — passiv).",
      "Bu qisqartirish faqat relative pronoun EGA vazifasida bo'lganda mumkin (\"who/which are/is\" turini tushirib qoldirish); agar relative pronoun object vazifasida bo'lsa, bu qisqartirish qo'llanilmaydi."
    ],
    "examples": [
      {
        "en": "Applicants selected for interview will be contacted next week.",
        "uz": "Suhbatga tanlangan nomzodlar bilan keyingi hafta bog'lanishadi."
      },
      {
        "en": "The people waiting outside have been there for an hour.",
        "uz": "Tashqarida kutayotgan odamlar u yerda bir soatdan beri turishibdi."
      },
      {
        "en": "The report published last month contains important findings.",
        "uz": "O'tgan oy nashr etilgan hisobot muhim topilmalarni o'z ichiga oladi."
      },
      {
        "en": "Employees working from home should attend the meeting online.",
        "uz": "Uydan ishlaydigan xodimlar uchrashuvda onlayn qatnashishlari kerak."
      },
      {
        "en": "The documents needed for the visa application are listed on the website.",
        "uz": "Viza arizasi uchun zarur hujjatlar veb-saytda ko'rsatilgan."
      },
      {
        "en": "Passengers travelling to Samarkand should board at gate five.",
        "uz": "Samarqandga sayohat qiluvchi yo'lovchilar beshinchi darvozadan chiqishlari kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "Applicants selecting for interview will be contacted.",
        "right": "Applicants selected for interview will be contacted.",
        "note": "Passiv ma'noda (nomzodlar tanlanadi, o'zlari tanlamaydi) -ing emas, III shakl (selected) kerak."
      },
      {
        "wrong": "The people wait outside are getting impatient.",
        "right": "The people waiting outside are getting impatient.",
        "note": "Aktiv, davom etayotgan ma'noda fe'l -ing shaklida bo'lishi kerak."
      },
      {
        "wrong": "The report publish last month is important.",
        "right": "The report published last month is important.",
        "note": "Passiv ma'noda fe'lning III shakli (published) kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "The man ___ next to the window is my new colleague.",
        "options": [
          "sit",
          "sitting",
          "sat",
          "who sit"
        ],
        "answer": 1
      },
      {
        "q": "Products ___ before 2020 are no longer covered by this warranty.",
        "options": [
          "manufacturing",
          "manufactured",
          "manufacture",
          "who manufacture"
        ],
        "answer": 1
      },
      {
        "q": "The students ___ for the scholarship must submit their essays by Friday.",
        "options": [
          "applying",
          "applied",
          "apply",
          "who applies"
        ],
        "answer": 0
      },
      {
        "q": "The bridge ___ by the earthquake has now been repaired.",
        "options": [
          "damaging",
          "damaged",
          "damage",
          "who damaged"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The man standing there is my uncle.",
          "The man stand there is my uncle.",
          "The man stood there is my uncle.",
          "The man who stand there is my uncle."
        ],
        "answer": 0
      }
    ]
  },
  "present-participle-clauses-b2": {
    "explanation": [
      "Present participle clause (-ing bilan boshlanuvchi qo'shimcha gap) bir subjektga tegishli ikki fikrni — ko'pincha sabab yoki bir vaqtda sodir bo'layotgan harakatni — ixcham va yozma uslubda birlashtiradi: \"Knowing the risks, she prepared carefully\" (bilgani uchun — sabab).",
      "Bu clause AKTIV ma'noni bildiradi — ega o'zi harakatni bajaradi yoki his qiladi: \"Walking to the station, he noticed the shop was closed\" (u yuradi, u payqaydi — ikkalasi ham bir subjekt).",
      "Ma'no jihatidan bu qurilma \"because\", \"while\", \"as\" kabi bog'lovchilarning qisqartirilgan, yozma uslubdagi shaklidir: \"Knowing the risks, she prepared carefully\" = \"Because she knew the risks, she prepared carefully.\"",
      "Qat'iy qoida: participle clause va asosiy gapning EGASI bir xil bo'lishi shart, aks holda gap noto'g'ri yoki kulgili ma'no beradi (\"dangling participle\" xatosi): \"Walking to school, the rain started\" — bu noto'g'ri, chunki yomg'ir yurmaydi."
    ],
    "examples": [
      {
        "en": "Knowing the risks, she prepared every detail of the plan carefully.",
        "uz": "Xavflarni bilgani uchun u rejaning har bir tafsilotini ehtiyotkorlik bilan tayyorladi."
      },
      {
        "en": "Walking home from work, he noticed a new café had opened.",
        "uz": "Ishdan uyga qaytayotib, u yangi kafe ochilganini payqadi."
      },
      {
        "en": "Feeling confident about the results, she submitted her application early.",
        "uz": "Natijalarga ishonchi komil bo'lgani uchun u arizasini erta topshirdi."
      },
      {
        "en": "Realising she had forgotten her keys, she went back inside.",
        "uz": "Kalitlarini unutib qoldirganini anglagach, u ichkariga qaytdi."
      },
      {
        "en": "Living abroad for many years, he had almost forgotten his native language.",
        "uz": "Ko'p yillar chet elda yashagani uchun u ona tilini deyarli unutib qo'ygan edi."
      },
      {
        "en": "Not wanting to disturb anyone, she left the room quietly.",
        "uz": "Hech kimni bezovta qilishni istamagani uchun u xonadan sekingina chiqib ketdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Walking to school, the rain started suddenly.",
        "right": "Walking to school, I got caught in sudden rain.",
        "note": "Participle clause va asosiy gapning egasi bir xil bo'lishi shart — yomg'ir 'yurmaydi'."
      },
      {
        "wrong": "Know the risks, she prepared carefully.",
        "right": "Knowing the risks, she prepared carefully.",
        "note": "Present participle clause fe'lning -ing shaklidan boshlanishi kerak, asl shaklidan emas."
      },
      {
        "wrong": "Not want to disturb anyone, she left quietly.",
        "right": "Not wanting to disturb anyone, she left quietly.",
        "note": "Inkor ham -ing shakldan oldin qo'yiladi, fe'l shakli o'zgarmaydi."
      }
    ],
    "quiz": [
      {
        "q": "___ tired after the long shift, she went straight to bed.",
        "options": [
          "Feel",
          "Feeling",
          "Felt",
          "Feels"
        ],
        "answer": 1
      },
      {
        "q": "___ the deadline was near, they worked through the weekend.",
        "options": [
          "Know",
          "Knowing",
          "Knew",
          "Known"
        ],
        "answer": 1
      },
      {
        "q": "___ to catch the early train, he left the house at six.",
        "options": [
          "Wanting",
          "Want",
          "Wanted",
          "Wants"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Walk to the shop, I saw an old friend.",
          "Walking to the shop, I saw an old friend.",
          "Walked to the shop, I saw an old friend.",
          "Walks to the shop, I saw an old friend."
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap NOTO'G'RI (dangling participle)?",
        "options": [
          "Arriving late, she missed the introduction.",
          "Arriving late, the meeting had already started.",
          "Feeling unwell, he left early.",
          "Knowing the answer, she raised her hand."
        ],
        "answer": 1
      }
    ]
  },
  "past-participle-clauses-b2": {
    "explanation": [
      "Past participle clause (III shakl bilan boshlanuvchi qo'shimcha gap) PASSIV ma'noni ixcham tarzda beradi — ega harakatni bajarmaydi, aksincha harakat UNGA nisbatan qaratilgan: \"Designed for small teams, the tool is easy to use\" (asbob loyihalashtirilgan, u loyihalashtirmagan).",
      "Bu qurilma \"which is/was + III shakl\" kabi to'liq passiv relative clause'ning qisqartirilgan shakli hisoblanadi: \"Designed for small teams, the tool is easy to use\" = \"The tool, which was designed for small teams, is easy to use.\"",
      "Ko'pincha sabab yoki fon ma'lumotni ixcham tarzda berish uchun ishlatiladi, ayniqsa yozma, rasmiy matnlarda: \"Written in simple language, the report is accessible to everyone\" (sabab — sodda tilda yozilgani).",
      "Xuddi present participle clause kabi, bu yerda ham asosiy gapning egasi bilan mos kelishi shart — passiv ma'noda ega narsaga NISBATAN qaratilgan harakatni qabul qiladi, o'zi bajarmaydi."
    ],
    "examples": [
      {
        "en": "Designed for small teams, the tool is easy to use and set up.",
        "uz": "Kichik jamoalar uchun loyihalashtirilgan bu asbobni ishlatish va sozlash oson."
      },
      {
        "en": "Written in simple language, the report is accessible to a general audience.",
        "uz": "Sodda tilda yozilgan bu hisobot keng auditoriya uchun tushunarli."
      },
      {
        "en": "Built in the sixteenth century, the fortress still stands today.",
        "uz": "O'n oltinchi asrda qurilgan bu qal'a bugungi kunga qadar saqlanib qolgan."
      },
      {
        "en": "Impressed by her presentation, the investors offered to fund the project.",
        "uz": "Uning taqdimotidan taassurot olgan investorlar loyihani moliyalashtirishni taklif qilishdi."
      },
      {
        "en": "Located near the city centre, the hotel is popular with tourists.",
        "uz": "Shahar markaziga yaqin joylashgan bu mehmonxona sayyohlar orasida mashhur."
      },
      {
        "en": "Founded in 1990, the company now operates in twelve countries.",
        "uz": "1990 yilda tashkil etilgan kompaniya endi o'n ikki mamlakatda faoliyat yuritadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Design for small teams, the tool is easy to use.",
        "right": "Designed for small teams, the tool is easy to use.",
        "note": "Passiv ma'noda fe'lning III shakli (designed) kerak, asl shakli emas."
      },
      {
        "wrong": "Building in the sixteenth century, the fortress still stands.",
        "right": "Built in the sixteenth century, the fortress still stands.",
        "note": "Qal'a o'zi qurmagan, u qurilgan — shuning uchun -ing emas, III shakl (built) kerak."
      },
      {
        "wrong": "Impressing by her presentation, the investors offered funding.",
        "right": "Impressed by her presentation, the investors offered funding.",
        "note": "Investorlar taassurot OLGAN (passiv), o'zlari taassurot bermagan — III shakl kerak."
      }
    ],
    "quiz": [
      {
        "q": "___ in 1920, the museum houses a huge collection of art.",
        "options": [
          "Founding",
          "Founded",
          "Found",
          "Founds"
        ],
        "answer": 1
      },
      {
        "q": "___ by the results, the manager congratulated the whole team.",
        "options": [
          "Pleasing",
          "Pleased",
          "Please",
          "Pleases"
        ],
        "answer": 1
      },
      {
        "q": "___ near the river, the town often floods in spring.",
        "options": [
          "Locating",
          "Located",
          "Locate",
          "Locates"
        ],
        "answer": 1
      },
      {
        "q": "___ specifically for beginners, this course covers all the basics.",
        "options": [
          "Designing",
          "Designed",
          "Design",
          "Designs"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Write in 1997, the novel became a classic.",
          "Writing in 1997, the novel became a classic.",
          "Written in 1997, the novel became a classic.",
          "Writes in 1997, the novel became a classic."
        ],
        "answer": 2
      }
    ]
  },
  "perfect-participle-clauses-b2": {
    "explanation": [
      "Perfect participle clause (\"having + III shakl\") ikki harakat orasidagi VAQT KETMA-KETLIGINI aniq ko'rsatadi — asosiy harakatdan OLDIN tugagan ishni ixcham tarzda ifodalaydi: \"Having finished the report, she went home\" (avval tugatdi, keyin ketdi).",
      "Oddiy present participle (-ing)dan farqi shunda: oddiy -ing ikki harakat bir vaqtda yoki tartib muhim bo'lmaganda ishlatiladi, \"having + III shakl\" esa AYNAN qaysi harakat oldin sodir bo'lganini ta'kidlaydi — ketma-ketlik muhim bo'lganda ishlatiladi.",
      "Passiv shakli ham mavjud: \"having been + III shakl\": \"Having been warned about the risks, he decided to proceed carefully\" (avval ogohlantirilgan edi — passiv, keyin qaror qildi).",
      "Bu qurilma rasmiy, yozma uslubda ko'proq uchraydi — kundalik og'zaki nutqda odatda oddiyroq \"after + gap\" yoki ikkita alohida gap afzal ko'riladi."
    ],
    "examples": [
      {
        "en": "Having finished the report, she went home for the evening.",
        "uz": "Hisobotni tugatgach, u kechqurun uyga ketdi."
      },
      {
        "en": "Having lived in Japan for five years, he speaks Japanese fluently.",
        "uz": "Beš yil Yaponiyada yashagani uchun u yapon tilida ravon gapiradi."
      },
      {
        "en": "Having been warned about the risks, he decided to proceed with caution.",
        "uz": "Xavflar haqida oldindan ogohlantirilgani uchun u ehtiyotkorlik bilan davom etishga qaror qildi."
      },
      {
        "en": "Having completed her degree, she immediately started looking for a job.",
        "uz": "Diplomini tugatgach, u darhol ish qidira boshladi."
      },
      {
        "en": "Having read the contract carefully, the lawyer suggested a few changes.",
        "uz": "Shartnomani diqqat bilan o'qib chiqqach, advokat bir nechta o'zgartirishlarni taklif qildi."
      },
      {
        "en": "Having never visited Europe before, she was excited about the trip.",
        "uz": "Avval hech qachon Yevropaga bormagani uchun u sayohatdan hayajonda edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Having finish the report, she went home.",
        "right": "Having finished the report, she went home.",
        "note": "\"Having\"dan keyin fe'lning III shakli kerak, asl shakli emas."
      },
      {
        "wrong": "Finishing the report first, she then went home.",
        "right": "Having finished the report, she went home.",
        "note": "Ketma-ketlik (avval-keyin) ta'kidlanganda oddiy -ing emas, \"having + III shakl\" tabiiyroq."
      },
      {
        "wrong": "Having warned about the risks, he proceeded carefully.",
        "right": "Having been warned about the risks, he proceeded carefully.",
        "note": "Passiv ma'noda (u ogohlantirilgan, o'zi ogohlantirmagan) \"having been + III shakl\" kerak."
      }
    ],
    "quiz": [
      {
        "q": "___ all the guests, she started serving dinner.",
        "options": [
          "Having greeted",
          "Having greet",
          "Greeting",
          "Greet"
        ],
        "answer": 0
      },
      {
        "q": "___ the exam, he felt a huge sense of relief.",
        "options": [
          "Having passed",
          "Having pass",
          "Passing",
          "Pass"
        ],
        "answer": 0
      },
      {
        "q": "___ several times, he finally gave up on the project.",
        "options": [
          "Having tried",
          "Having try",
          "Trying",
          "Try"
        ],
        "answer": 0
      },
      {
        "q": "___ about the change, the staff adjusted their schedules.",
        "options": [
          "Having informed",
          "Having been informed",
          "Informing",
          "Inform"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Having finish her homework, she watched TV.",
          "Having finished her homework, she watched TV.",
          "Have finished her homework, she watched TV.",
          "Finished her homework, she watched TV."
        ],
        "answer": 1
      }
    ]
  },
  "complex-gerund-patterns-b2": {
    "explanation": [
      "Gerund (-ing) oldida OBJEKT yoki EGALIK FORMASI qo'shilib, harakatni AYNAN KIM bajarganini aniq ko'rsatish mumkin — bu ayniqsa his-tuyg'u yoki fikr bildiruvchi fe'llardan (appreciate, mind, understand, remember) keyin ishlatiladi.",
      "Rasmiy uslubda egalik formasi (possessive) afzal ko'riladi: \"I appreciate your helping me\" (sizning yordam berishingiz). So'zlashuv uslubida oddiy object formasi ham keng ishlatiladi: \"I appreciate you helping me\" — ikkalasi ham to'g'ri, faqat rasmiylik darajasi farq qiladi.",
      "Predloglardan keyin ham gerund oldidan object/egalik formasi kelishi mumkin: \"There's no chance of him arriving on time\" (uning o'z vaqtida kelish ehtimoli).",
      "Bu qurilma ayniqsa gap egasi bilan gerund harakatining bajaruvchisi BOSHQA-BOSHQA shaxs bo'lganda zarur bo'ladi — aks holda kim nima qilayotgani noaniq bo'lib qoladi: \"I don't like him smoking in the house\" (men — bir kishi, u chekyapti — boshqa kishi)."
    ],
    "examples": [
      {
        "en": "I really appreciate you helping me move to the new flat.",
        "uz": "Yangi kvartiraga ko'chishimda menga yordam berganingiz uchun juda minnatdorman."
      },
      {
        "en": "There's no chance of him arriving on time; he's always late.",
        "uz": "Uning o'z vaqtida kelish ehtimoli yo'q; u doim kech qoladi."
      },
      {
        "en": "I don't mind you borrowing my laptop for the presentation.",
        "uz": "Taqdimot uchun noutbukimni olishingizga qarshi emasman."
      },
      {
        "en": "The manager was upset about the team missing the deadline.",
        "uz": "Menejer jamoaning muddatni o'tkazib yuborganidan xafa bo'ldi."
      },
      {
        "en": "We understand your wanting more time to think it over.",
        "uz": "Buni o'ylash uchun ko'proq vaqt xohlashingizni tushunamiz."
      },
      {
        "en": "I remember him mentioning something about a promotion.",
        "uz": "Uning lavozim ko'tarilishi haqida biror narsa aytganini eslayman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I appreciate you help me move.",
        "right": "I appreciate you helping me move. / I appreciate your helping me move.",
        "note": "Gerund (helping) kerak, oddiy asl fe'l shakli emas."
      },
      {
        "wrong": "I don't mind you to borrow my laptop.",
        "right": "I don't mind you borrowing my laptop.",
        "note": "\"Mind\"dan keyin to-infinitive emas, gerund ishlatiladi."
      },
      {
        "wrong": "There's no chance of he arriving on time.",
        "right": "There's no chance of him arriving on time.",
        "note": "Predlogdan keyin ega olmoshi (he) emas, to'ldiruvchi olmoshi (him) yoki egalik formasi (his) ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "I really appreciate ___ helping me with this project.",
        "options": [
          "you",
          "you to",
          "for you",
          "of you"
        ],
        "answer": 0
      },
      {
        "q": "She was annoyed about ___ arriving late again.",
        "options": [
          "he",
          "him",
          "his to",
          "he to"
        ],
        "answer": 1
      },
      {
        "q": "There's a good chance of ___ getting the job — she interviewed really well.",
        "options": [
          "she",
          "her",
          "she to",
          "her to"
        ],
        "answer": 1
      },
      {
        "q": "I don't remember ___ mentioning that at all.",
        "options": [
          "him",
          "he",
          "him to",
          "he to"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I appreciate you to help me.",
          "I appreciate you help me.",
          "I appreciate you helping me.",
          "I appreciate for you helping me."
        ],
        "answer": 2
      }
    ]
  },
  "complex-infinitive-patterns-b2": {
    "explanation": [
      "\"Verb + object + to-infinitive\" naqshida fe'l va infinitiv orasiga object (kimga qaratilgan) qo'shiladi — bu naqsh expect, want, ask, tell, allow, force, encourage kabi fe'llar bilan ishlaydi: \"We expected the delivery to arrive by noon\" (kim kelishi kerak — delivery).",
      "Perfect infinitive (\"to have + III shakl\") o'tmishga tegishli natija yoki taxminni bildiradi, ayniqsa modal fe'llar (seem, appear, be said, claim) bilan birga: \"He appears to have left already\" (u ketgan ko'rinadi — bu bugungi baholash, lekin ketish O'TMISHDA sodir bo'lgan).",
      "Perfect infinitive yana o'tmishda BAJARILMAGAN niyat yoki umidni bildirishda ham ishlatiladi: \"I meant to have called you yesterday, but I forgot\" (rejam bor edi, lekin bajarmadim).",
      "Bu naqshlarni to'g'ri ishlatish uchun avval fe'lning o'ziga xos strukturasini bilish kerak — barcha fe'llar bir xil object+infinitive naqshini qabul qilavermaydi, ba'zilari boshqacha struktura talab qiladi (masalan \"suggest\" object bilan ishlamaydi, oldingi darsda ko'rilgan edi)."
    ],
    "examples": [
      {
        "en": "We expected the delivery to arrive by noon, but it was delayed.",
        "uz": "Biz yetkazib berish peshingacha kelishini kutgan edik, lekin kechikdi."
      },
      {
        "en": "The manager asked the team to finish the report by Friday.",
        "uz": "Menejer jamoadan hisobotni jumagacha tugatishni so'radi."
      },
      {
        "en": "He appears to have left the office already.",
        "uz": "U ofisdan allaqachon ketgan ko'rinadi."
      },
      {
        "en": "They allowed the students to leave early because of the storm.",
        "uz": "Bo'ron tufayli ular talabalarga erta ketishga ruxsat berishdi."
      },
      {
        "en": "I meant to have called you yesterday, but the day got too busy.",
        "uz": "Kecha sizga qo'ng'iroq qilishni rejalashtirgan edim, lekin kun juda band bo'lib ketdi."
      },
      {
        "en": "The company is said to have lost millions in the deal.",
        "uz": "Kompaniya bu bitimda millionlab pul yo'qotgan deyiladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "We expected the delivery arrive by noon.",
        "right": "We expected the delivery to arrive by noon.",
        "note": "\"Expect + object\"dan keyin \"to\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "He appears to left already.",
        "right": "He appears to have left already.",
        "note": "O'tmishga tegishli xulosa uchun \"to have + III shakl\" (perfect infinitive) kerak, oddiy \"to + asl fe'l\" emas."
      },
      {
        "wrong": "The manager asked the team finishing the report.",
        "right": "The manager asked the team to finish the report.",
        "note": "\"Ask + object\"dan keyin to-infinitive keladi, gerund emas."
      }
    ],
    "quiz": [
      {
        "q": "They encouraged her ___ for the scholarship.",
        "options": [
          "apply",
          "applying",
          "to apply",
          "applied"
        ],
        "answer": 2
      },
      {
        "q": "The report is believed ___ by an anonymous source.",
        "options": [
          "to write",
          "to have written",
          "to have been written",
          "writing"
        ],
        "answer": 2
      },
      {
        "q": "I wanted ___ you earlier, but I lost your number.",
        "options": [
          "to call",
          "to have called",
          "calling",
          "call"
        ],
        "answer": 1
      },
      {
        "q": "The teacher told the students ___ their essays by Monday.",
        "options": [
          "submit",
          "submitting",
          "to submit",
          "submitted"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI (o'tmishda tugagan harakat haqida hozirgi xulosa)?",
        "options": [
          "She seems to leave already.",
          "She seems to have left already.",
          "She seems leaving already.",
          "She seems left already."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-determiners-b2": {
    "explanation": [
      "\"All\", \"both\", \"either\", \"neither\" va \"each\" guruh a'zolarini turlicha qamrab oladigan determinerlar — ularning MA'NOSI va FE'L MOSLIGI (agreement) bir-biridan farq qiladi.",
      "\"Both\" — ikkalasi ham, ko'plik fe'l bilan: \"Both proposals were rejected.\" \"Either\" — ikkitadan biri, birlik fe'l bilan: \"Either proposal is acceptable.\" \"Neither\" — ikkitadan hech biri, birlik fe'l bilan (o'zida allaqachon inkor bor): \"Neither of the proposals was accepted.\"",
      "\"All\" ko'plikdagi otlar bilan ko'plik fe'l talab qiladi (\"All the students are here\"), lekin sanalmaydigan otlar bilan birlik fe'l talab qiladi (\"All the information is correct\").",
      "\"Each\" har doim BIRLIK fe'l bilan ishlatiladi, hatto \"each of\" ko'plik otdan oldin kelsa ham: \"Each of the applicants was interviewed separately\" (\"were\" emas, \"was\" — chunki \"each\" alohida-alohida ko'rib chiqishni bildiradi)."
    ],
    "examples": [
      {
        "en": "Neither of the proposals was accepted by the committee.",
        "uz": "Qo'mita ikkala taklifni ham qabul qilmadi."
      },
      {
        "en": "Both candidates have excellent qualifications for this role.",
        "uz": "Ikkala nomzod ham bu lavozim uchun ajoyib malakaga ega."
      },
      {
        "en": "Either option would work well for our current needs.",
        "uz": "Ikkala variant ham bizning hozirgi ehtiyojlarimiz uchun yaxshi mos keladi."
      },
      {
        "en": "Each of the applicants was interviewed separately by the panel.",
        "uz": "Har bir nomzod komissiya tomonidan alohida suhbatlashtirildi."
      },
      {
        "en": "All the evidence points to the same conclusion.",
        "uz": "Barcha dalillar bir xil xulosaga ishora qilmoqda."
      },
      {
        "en": "All the students were present at the ceremony.",
        "uz": "Barcha talabalar marosimda hozir bo'lishdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Neither of the proposals were accepted.",
        "right": "Neither of the proposals was accepted.",
        "note": "\"Neither\" ikkita narsa haqida bo'lsa ham, birlik fe'l (was) talab qiladi."
      },
      {
        "wrong": "Each of the applicants were interviewed.",
        "right": "Each of the applicants was interviewed.",
        "note": "\"Each\" doim birlik fe'l bilan ishlatiladi, ko'plik ot oldida bo'lsa ham."
      },
      {
        "wrong": "All the information are correct.",
        "right": "All the information is correct.",
        "note": "\"Information\" sanalmaydigan ot — \"all\" bilan ham birlik fe'l talab qiladi."
      }
    ],
    "quiz": [
      {
        "q": "Both of the applicants ___ strong interview skills.",
        "options": [
          "has",
          "have",
          "is having",
          "having"
        ],
        "answer": 1
      },
      {
        "q": "Neither of the two options ___ ideal.",
        "options": [
          "are",
          "is",
          "were",
          "have"
        ],
        "answer": 1
      },
      {
        "q": "Each of the team members ___ a specific task.",
        "options": [
          "have",
          "has",
          "having",
          "were having"
        ],
        "answer": 1
      },
      {
        "q": "All the furniture in this room ___ handmade.",
        "options": [
          "are",
          "is",
          "were",
          "have been"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Either of the answers are correct.",
          "Either of the answers is correct.",
          "Either of the answer is correct.",
          "Either the answers is correct."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-quantifiers-b2": {
    "explanation": [
      "Rasmiy yozuvda kundalik \"a lot of\" o'rniga aniqroq, rasmiyroq miqdor birikmalari ishlatiladi: \"a great deal of\" (katta miqdor — faqat sanalmaydigan otlar bilan), \"a number of\" (bir nechta — sanaladigan ko'plik bilan), \"the number of\" (sonining o'zi — bu grammatik jihatdan boshqacha ishlaydi).",
      "\"A number of\" — \"ba'zi, bir nechta\" ma'nosida, KO'PLIK fe'l talab qiladi, chunki e'tibor kop sondagi a'zolarga qaratilgan: \"A number of students are working remotely\" (are, is emas).",
      "\"The number of\" esa — \"sonining o'zi, statistik ko'rsatkich\" ma'nosida, BIRLIK fe'l talab qiladi, chunki e'tibor SONNING O'ZIGA (yagona statistik ma'lumot) qaratilgan: \"The number of students has increased this year\" (has, have emas).",
      "\"A great deal of\" faqat sanalmaydigan otlar bilan ishlatiladi va \"much\"ning rasmiyroq muqobili hisoblanadi: \"This requires a great deal of patience\" (\"much patience\"dan rasmiyroq)."
    ],
    "examples": [
      {
        "en": "A number of students are working remotely this semester.",
        "uz": "Bir nechta talabalar bu semestrda masofadan turib ishlashmoqda."
      },
      {
        "en": "The number of applicants has increased significantly this year.",
        "uz": "Nomzodlar soni bu yil sezilarli darajada oshdi."
      },
      {
        "en": "This project requires a great deal of patience and dedication.",
        "uz": "Bu loyiha katta sabr-toqat va fidoyilikni talab qiladi."
      },
      {
        "en": "A number of issues were raised during the meeting.",
        "uz": "Uchrashuv davomida bir nechta masalalar ko'tarildi."
      },
      {
        "en": "The number of complaints has decreased since the new policy.",
        "uz": "Yangi siyosatdan beri shikoyatlar soni kamaydi."
      },
      {
        "en": "She has spent a great deal of time researching this topic.",
        "uz": "U bu mavzuni tadqiq qilishga katta vaqt sarfladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "A number of students is absent today.",
        "right": "A number of students are absent today.",
        "note": "\"A number of\" ko'plik fe'l talab qiladi, chunki ko'p a'zolarga e'tibor qaratilgan."
      },
      {
        "wrong": "The number of complaints have decreased.",
        "right": "The number of complaints has decreased.",
        "note": "\"The number of\" birlik fe'l talab qiladi, chunki e'tibor sonning o'ziga qaratilgan."
      },
      {
        "wrong": "This requires a great deal of efforts.",
        "right": "This requires a great deal of effort.",
        "note": "\"A great deal of\" faqat sanalmaydigan otlar bilan ishlatiladi — \"effort\" bu ma'noda ko'plik shakl olmaydi."
      }
    ],
    "quiz": [
      {
        "q": "A number of employees ___ requested flexible hours.",
        "options": [
          "has",
          "have",
          "is",
          "was"
        ],
        "answer": 1
      },
      {
        "q": "The number of visitors to the site ___ tripled this year.",
        "options": [
          "have",
          "has",
          "are",
          "were"
        ],
        "answer": 1
      },
      {
        "q": "This task requires a great deal of ___.",
        "options": [
          "skills",
          "skill",
          "a skill",
          "the skills"
        ],
        "answer": 1
      },
      {
        "q": "A number of proposals ___ still under review.",
        "options": [
          "is",
          "are",
          "was",
          "has been"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The number of errors have gone down.",
          "The number of errors has gone down.",
          "A number of errors has gone down.",
          "The number of error has gone down."
        ],
        "answer": 1
      }
    ]
  },
  "inversion-introduction-b2": {
    "explanation": [
      "Inversiya — kuchli urg'u berish uchun oddiy gap tartibini (subject + verb) TESKARISIGA aylantirish (auxiliary + subject + verb), bu ko'pincha SALBIY yoki CHEKLOVCHI ma'nodagi ravish gap boshiga chiqarilganda sodir bo'ladi.",
      "Odatdagi gap: \"We rarely see such rapid change\" (oddiy tartib). Inversiya bilan: \"Rarely do we see such rapid change\" (\"rarely\" gap boshida, \"do\" auxiliary egadan OLDIN chiqadi — kuchliroq, adabiy ohang).",
      "Inversiya faqat SALBIY yoki CHEKLOVCHI ma'nodagi so'zlar bilan ishlaydi: never, rarely, seldom, hardly, little, only, not only — bu so'zlar gap boshiga chiqqanda auxiliary fe'l ham egadan oldinga o'tadi.",
      "Agar asosiy fe'lda yordamchi fe'l bo'lmasa (oddiy Present/Past Simple), \"do/does/did\" qo'shiladi — xuddi savol yasashdagi kabi: \"Never have I seen such a mess\" (has bo'lsa, u ko'chadi) yoki \"Rarely does she complain\" (does qo'shiladi, chunki oddiy Present Simple)."
    ],
    "examples": [
      {
        "en": "Rarely do we see such rapid technological change.",
        "uz": "Bunday tez texnologik o'zgarishni kamdan-kam ko'ramiz."
      },
      {
        "en": "Never have I seen such a beautiful sunset.",
        "uz": "Men hech qachon bunday go'zal quyosh botishini ko'rmaganman."
      },
      {
        "en": "Little did she know that her life was about to change forever.",
        "uz": "U hayoti abadiy o'zgarishini deyarli bilmasdi."
      },
      {
        "en": "Seldom does he arrive at work before nine.",
        "uz": "U kamdan-kam ishga to'qqizdan oldin keladi."
      },
      {
        "en": "Not once did he complain about the difficult conditions.",
        "uz": "U og'ir sharoitlar haqida bir marta ham shikoyat qilmadi."
      },
      {
        "en": "Hardly had the show started when the power went out.",
        "uz": "Shou boshlanganidan darhol elektr o'chib qoldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Rarely we see such rapid change.",
        "right": "Rarely do we see such rapid change.",
        "note": "Salbiy ravish gap boshida bo'lsa, auxiliary (do) egadan OLDIN chiqishi kerak."
      },
      {
        "wrong": "Never I have seen such a mess.",
        "right": "Never have I seen such a mess.",
        "note": "Auxiliary (have) ega (I)dan OLDIN turishi kerak, keyin emas."
      },
      {
        "wrong": "Little she knew what was about to happen.",
        "right": "Little did she know what was about to happen.",
        "note": "Oddiy Present/Past Simple fe'lda inversiya uchun \"do/does/did\" qo'shilishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "Rarely ___ such dedication among new employees.",
        "options": [
          "we see",
          "do we see",
          "we do see",
          "see we"
        ],
        "answer": 1
      },
      {
        "q": "Never ___ such an important decision alone.",
        "options": [
          "I have made",
          "have I made",
          "I made",
          "made I have"
        ],
        "answer": 1
      },
      {
        "q": "Seldom ___ complaints from our customers.",
        "options": [
          "we receive",
          "do we receive",
          "receive we",
          "we do receive"
        ],
        "answer": 1
      },
      {
        "q": "Little ___ that the deal would fall through.",
        "options": [
          "they knew",
          "did they know",
          "they did know",
          "knew they"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Hardly the meeting had started when the fire alarm rang.",
          "Hardly had the meeting started when the fire alarm rang.",
          "Hardly did the meeting start when the fire alarm rang.",
          "Hardly the meeting started had when the fire alarm rang."
        ],
        "answer": 1
      }
    ]
  },
  "cleft-sentences-b2": {
    "explanation": [
      "Cleft sentence (\"It is/was + X + that...\") gapning bitta muayyan qismini ALOHIDA URG'ULASH uchun ishlatiladi — bu qism odatdagi gapda urg'usiz kelgan bo'lsa ham, cleft struktura orqali diqqat markaziga chiqariladi.",
      "Oddiy gap: \"The deadline changed our plan\" (hech narsa alohida ta'kidlanmagan). Cleft bilan: \"It was the deadline that changed our plan\" (aynan MUDDAT — boshqa hech narsa emas — bizning rejamizni o'zgartirdi, bu maxsus urg'u).",
      "Cleft struktura ko'pincha ANIQLASHTIRISH yoki KORREKSIYA qilish uchun ishlatiladi — ayniqsa boshqa birov noto'g'ri narsani nazarda tutganda: \"It wasn't the price that worried me, it was the quality\" (narx emas, aynan sifat).",
      "Urg'ulanayotgan qism ODAM, NARSA, VAQT yoki JOY bo'lishi mumkin, faqat \"that\" o'rniga odam bo'lsa \"who\" ham ishlatilishi mumkin: \"It was John who called the meeting\" (aynan John, boshqa hech kim emas)."
    ],
    "examples": [
      {
        "en": "It was the deadline that changed our entire plan.",
        "uz": "Aynan muddat bizning butun rejamizni o'zgartirdi."
      },
      {
        "en": "It wasn't the price that worried me, it was the quality.",
        "uz": "Meni tashvishga solgan narx emas, sifat edi."
      },
      {
        "en": "It was John who first suggested this idea.",
        "uz": "Bu g'oyani birinchi bo'lib taklif qilgan aynan Jon edi."
      },
      {
        "en": "It is hard work, not luck, that leads to success.",
        "uz": "Muvaffaqiyatga olib boradigan omad emas, qattiq mehnat."
      },
      {
        "en": "It was in 1998 that the company was first established.",
        "uz": "Kompaniya aynan 1998 yilda birinchi marta tashkil etilgan."
      },
      {
        "en": "It was her determination that impressed the interviewers most.",
        "uz": "Suhbatchilarni eng ko'p taassurot qoldirgan narsa uning qat'iyati edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "It was the deadline what changed our plan.",
        "right": "It was the deadline that changed our plan.",
        "note": "Cleft sentence'da \"what\" emas, \"that\" (yoki odamlar uchun \"who\") ishlatiladi."
      },
      {
        "wrong": "It was John which suggested this idea.",
        "right": "It was John who suggested this idea.",
        "note": "Odam haqida \"which\" emas, \"who\" ishlatiladi."
      },
      {
        "wrong": "The deadline it was that changed our plan.",
        "right": "It was the deadline that changed our plan.",
        "note": "Cleft sentence \"It is/was\" bilan boshlanadi, urg'ulanayotgan qism undan keyin keladi."
      }
    ],
    "quiz": [
      {
        "q": "It was ___ that persuaded them to invest.",
        "options": [
          "our proposal",
          "our proposal which",
          "our proposal it",
          "that our proposal"
        ],
        "answer": 0
      },
      {
        "q": "It ___ my sister who first noticed the mistake.",
        "options": [
          "is",
          "was",
          "has",
          "does"
        ],
        "answer": 1
      },
      {
        "q": "It wasn't the cost ___ concerned us — it was the timing.",
        "options": [
          "what",
          "that",
          "who",
          "it"
        ],
        "answer": 1
      },
      {
        "q": "It was Maria ___ organised the whole event.",
        "options": [
          "that",
          "who",
          "which",
          "both a and b"
        ],
        "answer": 3
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It was the manager what called the meeting.",
          "It was the manager who called the meeting.",
          "The manager it was who called the meeting.",
          "It the manager was who called the meeting."
        ],
        "answer": 1
      }
    ]
  },
  "do-emphasis-b2": {
    "explanation": [
      "Emphatic \"do/does/did\" tasdiq gapda kuchli urg'u yoki qarama-qarshilikni ta'kidlash uchun qo'shiladi — bu bilan gapiruvchi o'z fikrini yanada ishonch bilan, samimiy tarzda bildiradi: \"I do understand your concern\" (chindan HAM tushunaman, garchi shubhalanayotgan bo'lsangiz ham).",
      "Qurilishi: do/does/did + fe'lning asl shakli. Bu qo'shimcha \"do\" gapga hech qanday grammatik ma'no qo'shmaydi, faqat URG'U beradi.",
      "Ko'pincha oldingi gapga QARAMA-QARSHILIK yoki uni INKOR qilish (kimningdir shubhasini yo'qqa chiqarish) uchun ishlatiladi: \"I know you think I forgot, but I did call you\" (chaqirdim, garchi shubha bo'lsa ham).",
      "Yozma va og'zaki nutqda bu urg'u ko'pincha ovoz tonini kuchaytirish bilan birga keladi va suhbatdoshni ishontirish, o'z pozitsiyasini himoya qilish uchun ishlatiladi."
    ],
    "examples": [
      {
        "en": "I do understand your concern, even though I disagree with the solution.",
        "uz": "Sizning tashvishingizni chindan ham tushunaman, garchi yechim bilan rozi bo'lmasam ham."
      },
      {
        "en": "She does work hard; she's just not getting the recognition she deserves.",
        "uz": "U chindan ham qattiq ishlaydi; u shunchaki loyiq e'tirofni olmayapti."
      },
      {
        "en": "I did tell you about the meeting — you must have forgotten.",
        "uz": "Men sizga uchrashuv haqida aytgan edim — siz unutgan bo'lishingiz kerak."
      },
      {
        "en": "He does care about his team, even if he doesn't always show it.",
        "uz": "U jamoasi haqida chindan ham qayg'uradi, garchi buni har doim ko'rsatmasa ham."
      },
      {
        "en": "We do appreciate your feedback, and we'll take it into account.",
        "uz": "Fikringizni chindan ham qadrlaymiz va uni hisobga olamiz."
      },
      {
        "en": "I do believe this is the right decision for the company.",
        "uz": "Men chindan ham bu kompaniya uchun to'g'ri qaror deb ishonaman."
      }
    ],
    "mistakes": [
      {
        "wrong": "I do understanding your concern.",
        "right": "I do understand your concern.",
        "note": "\"Do\"dan keyin fe'l asl shaklda bo'ladi, -ing shaklida emas."
      },
      {
        "wrong": "She does worked hard.",
        "right": "She does work hard.",
        "note": "\"Does\"dan keyin fe'l asl shaklda bo'ladi, o'tgan zamon shaklida emas."
      },
      {
        "wrong": "I did called you yesterday.",
        "right": "I did call you yesterday.",
        "note": "\"Did\"dan keyin fe'l asl shaklda bo'ladi, o'tgan zamon shakli (-ed) qo'shilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "I know it doesn't look like it, but I ___ care about this project.",
        "options": [
          "do",
          "am",
          "did",
          "does"
        ],
        "answer": 0
      },
      {
        "q": "She ___ enjoy the film, even though she complained about the length.",
        "options": [
          "did",
          "does",
          "do",
          "was"
        ],
        "answer": 0
      },
      {
        "q": "He ___ try his best, even though the result wasn't perfect.",
        "options": [
          "do",
          "did",
          "does",
          "was"
        ],
        "answer": 1
      },
      {
        "q": "We ___ value your opinion, even when we don't follow it.",
        "options": [
          "do",
          "does",
          "did",
          "are"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I do understood the problem.",
          "I do understand the problem.",
          "I did understands the problem.",
          "I do understands the problem."
        ],
        "answer": 1
      }
    ]
  },
  "fronting-introduction-b2": {
    "explanation": [
      "Fronting — gapning odatda oxirida yoki o'rtasida keladigan elementni gap BOSHIGA olib chiqish orqali information focus (diqqat markazi)ni o'zgartirish usuli — bu urg'u berish, matn oqimini boshqarish yoki oldingi gap bilan bog'lash uchun ishlatiladi.",
      "Eng ko'p uchraydigan turi — object yoki complement'ning gap boshiga chiqarilishi: \"What I need most is a clear answer\" (bu yerda \"what I need most\" — asosiy e'tibor shu qismga qaratilgan, keyin \"is\" bilan javob beriladi).",
      "Fronting ko'pincha OLDINGI gap bilan bog'liqlikni ko'rsatish uchun ham ishlatiladi — matnda \"eski\" ma'lumot (allaqachon aytilgan) gap boshiga, \"yangi\" ma'lumot esa oxiriga qo'yiladi: \"This problem, we have already discussed at length\" (\"this problem\" — oldin tilga olingan, endi qo'shimcha fikr bildirilmoqda).",
      "Fronting yozma, rasmiy va nutqiy uslubda kuchli ta'sir yaratadi, lekin ortiqcha ishlatilsa g'ayritabiiy eshitilishi mumkin — shuning uchun aynan ta'kidlash zarur bo'lgan joylardagina ishlatiladi."
    ],
    "examples": [
      {
        "en": "What I need most right now is a clear, honest answer.",
        "uz": "Menga hozir eng kerak bo'lgan narsa — aniq, halol javob."
      },
      {
        "en": "This problem, we have already discussed at length in previous meetings.",
        "uz": "Bu muammoni biz oldingi uchrashuvlarda allaqachon batafsil muhokama qilganmiz."
      },
      {
        "en": "What really surprised everyone was how quickly the situation changed.",
        "uz": "Hammani chindan ham hayratga solgan narsa vaziyat qanchalik tez o'zgargani edi."
      },
      {
        "en": "Such was the demand that tickets sold out within an hour.",
        "uz": "Talab shunchalik katta ediki, chiptalar bir soat ichida sotilib bo'ldi."
      },
      {
        "en": "That particular issue, I would rather discuss in private.",
        "uz": "Aynan o'sha masalani men shaxsan muhokama qilishni afzal ko'raman."
      },
      {
        "en": "What matters most to us is the long-term wellbeing of our clients.",
        "uz": "Biz uchun eng muhimi — mijozlarimizning uzoq muddatli farovonligi."
      }
    ],
    "mistakes": [
      {
        "wrong": "What I need most it is a clear answer.",
        "right": "What I need most is a clear answer.",
        "note": "Fronted \"what\"-clause'dan keyin qo'shimcha \"it\" kerak emas, to'g'ridan-to'g'ri \"is\" keladi."
      },
      {
        "wrong": "This problem we discuss already.",
        "right": "This problem, we have already discussed.",
        "note": "Fronting bilan ham zamon to'g'ri saqlanishi kerak (Present Perfect, chunki natija hozirgi holatga bog'liq)."
      },
      {
        "wrong": "What surprised everyone it was the speed of change.",
        "right": "What surprised everyone was the speed of change.",
        "note": "Fronted subject clause'dan keyin qo'shimcha \"it\" tushirib qoldiriladi."
      }
    ],
    "quiz": [
      {
        "q": "What worries me most ___ the lack of a clear plan.",
        "options": [
          "it is",
          "is",
          "is it",
          "was it"
        ],
        "answer": 1
      },
      {
        "q": "This decision, ___ carefully before announcing it.",
        "options": [
          "we should consider",
          "should we consider",
          "we consider should",
          "consider we should"
        ],
        "answer": 0
      },
      {
        "q": "What impressed the judges most ___ her confidence.",
        "options": [
          "it was",
          "was",
          "was it",
          "were"
        ],
        "answer": 1
      },
      {
        "q": "That particular topic, ___ discuss another time.",
        "options": [
          "let's",
          "let's it",
          "it let's",
          "we let's"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "What she wants it is more responsibility.",
          "What she wants is more responsibility.",
          "What wants she is more responsibility.",
          "Is what she wants more responsibility."
        ],
        "answer": 1
      }
    ]
  },
  "complex-noun-phrases-b2": {
    "explanation": [
      "Rasmiy va akademik yozuvda fikrlar ko'pincha uzun, murakkab NOUN PHRASE (ot birikmasi) shaklida ixchamlashtiriladi — bu butun gapni bitta zich ot birikmasiga aylantirish orqali matnni professional va ixcham qiladi.",
      "Qurilishi: pre-modifier (aniqlovchi sifatlar/otlar) + BOSH OT (head noun) + post-modifier (predlogli birikma yoki relative clause): \"the rapid growth of online learning\" — \"growth\" bosh ot, \"rapid\" pre-modifier, \"of online learning\" post-modifier.",
      "Bu qurilma ko'pincha oddiy gapni ixchamlashtirish uchun ishlatiladi: \"Online learning has grown rapidly. This has changed education\" — ikki gap → \"The rapid growth of online learning has changed education\" (bitta ixcham gap).",
      "Akademik matnlarda bunday ot birikmalari fikrni OB'EKTIV va NEYTRAL qilib ko'rsatadi — harakat bajaruvchisi (kim o'sdirdi) emas, JARAYONNING O'ZI (o'sish) diqqat markazida bo'ladi."
    ],
    "examples": [
      {
        "en": "The rapid growth of online learning has changed education significantly.",
        "uz": "Onlayn ta'limning tez o'sishi ta'limni sezilarli darajada o'zgartirdi."
      },
      {
        "en": "The increasing use of artificial intelligence raises important ethical questions.",
        "uz": "Sun'iy intellektdan tobora ko'proq foydalanish muhim axloqiy savollarni ko'taradi."
      },
      {
        "en": "The sharp rise in living costs has affected many families this year.",
        "uz": "Yashash xarajatlarining keskin ko'tarilishi bu yil ko'plab oilalarga ta'sir qildi."
      },
      {
        "en": "The steady decline in newspaper readership reflects changing media habits.",
        "uz": "Gazeta o'quvchilari sonining barqaror kamayishi o'zgaruvchan media odatlarini aks ettiradi."
      },
      {
        "en": "The widespread adoption of remote work has reshaped office culture.",
        "uz": "Masofaviy ishning keng qo'llanilishi ofis madaniyatini qayta shakllantirdi."
      },
      {
        "en": "The growing demand for skilled workers has led to higher salaries.",
        "uz": "Malakali ishchilarga bo'lgan talabning o'sishi yuqori maoshlarga olib keldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The growth rapid of online learning changed education.",
        "right": "The rapid growth of online learning changed education.",
        "note": "Sifat (rapid) bosh otdan (growth) OLDIN keladi, keyin emas."
      },
      {
        "wrong": "Online learning has grown rapid and this changed education.",
        "right": "The rapid growth of online learning has changed education.",
        "note": "Rasmiy uslubda ikki oddiy gap o'rniga zich noun phrase afzal ko'riladi."
      },
      {
        "wrong": "The rise of living costs sharp affected many families.",
        "right": "The sharp rise in living costs affected many families.",
        "note": "Sifat (sharp) bosh otdan oldin keladi; \"of\" o'rniga bu holatda \"in\" predlogi to'g'ri ishlatiladi (rise in costs)."
      }
    ],
    "quiz": [
      {
        "q": "___ has made communication instant across the globe.",
        "options": [
          "The growth rapid of the internet",
          "The rapid growth of the internet",
          "The internet rapid growth",
          "Growth of the internet rapid"
        ],
        "answer": 1
      },
      {
        "q": "___ raises questions about job security.",
        "options": [
          "The increasing use of automation",
          "The use increasing of automation",
          "The automation increasing use",
          "Increasing the use of automation"
        ],
        "answer": 0
      },
      {
        "q": "___ reflects changing consumer habits.",
        "options": [
          "The decline steady in sales",
          "The steady decline in sales",
          "Sales steady decline",
          "Decline in sales steady"
        ],
        "answer": 1
      },
      {
        "q": "___ has affected many small businesses.",
        "options": [
          "The rise sharp in costs",
          "The sharp rise in costs",
          "Costs sharp rise",
          "Rise in costs the sharp"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The demand growing for housing is a concern.",
          "The growing demand for housing is a concern.",
          "The demand for housing growing is a concern.",
          "Growing the demand for housing is a concern."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-conjunctions-b2": {
    "explanation": [
      "Rasmiy yozuvda oddiy \"but/if/because\" o'rniga aniqroq, rasmiyroq bog'lovchilar ishlatiladi: \"whereas\" (kontrast, ikki narsani solishtirish), \"provided that\" (qat'iy shart), \"given that\" (sabab, allaqachon ma'lum fakt asosida).",
      "\"Whereas\" ikki narsani BEVOSITA SOLISHTIRISH uchun ishlatiladi, \"but\"dan farqli o'laroq u ko'proq rasmiy, tahliliy uslubga xos: \"Remote work is flexible, whereas office work offers direct contact\" (ikki variantni tenglashtirib solishtirish).",
      "\"Provided that\" (yoki \"providing that\") — \"agar, faqat shu shart bilan\" ma'nosini \"if\"dan ko'ra qat'iyroq beradi, ko'pincha shartnoma, qoida kontekstida: \"You may leave early, provided that you finish your tasks\" (aniq, qat'iy shart).",
      "\"Given that\" — allaqachon MA'LUM, isbotlangan fakt asosida xulosa chiqarishda ishlatiladi, \"because\"dan farqli o'laroq bu ko'proq mantiqiy fikr yuritish ohangini beradi: \"Given that the market is unstable, we should be cautious\" (bu fakt allaqachon ma'lum, shunga asoslanib xulosa chiqarilyapti)."
    ],
    "examples": [
      {
        "en": "Remote work offers flexibility, whereas office work provides direct contact with colleagues.",
        "uz": "Masofaviy ish moslashuvchanlik beradi, office ishi esa hamkasblar bilan bevosita aloqa imkonini beradi."
      },
      {
        "en": "You may take the extended deadline, provided that you notify us in advance.",
        "uz": "Bizga oldindan xabar bersangiz, uzaytirilgan muddatdan foydalanishingiz mumkin."
      },
      {
        "en": "Given that the economy is slowing down, the company decided to postpone expansion.",
        "uz": "Iqtisodiyot sekinlashayotganini hisobga olib, kompaniya kengayishni kechiktirishga qaror qildi."
      },
      {
        "en": "Some employees prefer working alone, whereas others thrive in team environments.",
        "uz": "Ba'zi xodimlar yolg'iz ishlashni afzal ko'radi, boshqalari esa jamoaviy muhitda yaxshi ishlaydi."
      },
      {
        "en": "The contract will be renewed, provided that both parties agree to the new terms.",
        "uz": "Ikkala tomon ham yangi shartlarga rozi bo'lsa, shartnoma yangilanadi."
      },
      {
        "en": "Given that this is her first time presenting, she did remarkably well.",
        "uz": "Bu uning birinchi taqdimoti ekanini hisobga olsak, u ajoyib ishladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Remote work is flexible, whereas office work offer contact.",
        "right": "Remote work is flexible, whereas office work offers contact.",
        "note": "\"Whereas\" bandidagi fe'l ham normal subject-verb agreement qoidasiga bo'ysunadi (offers, offer emas)."
      },
      {
        "wrong": "You may leave early, provided you will finish your tasks.",
        "right": "You may leave early, provided that you finish your tasks.",
        "note": "\"Provided that\" bandida kelajak \"will\" emas, Present Simple ishlatiladi (xuddi \"if\" kabi)."
      },
      {
        "wrong": "Given the market is unstable, we should be cautious.",
        "right": "Given that the market is unstable, we should be cautious.",
        "note": "\"Given\"dan keyin \"that\" odatda saqlanadi, ayniqsa rasmiy yozuvda."
      }
    ],
    "quiz": [
      {
        "q": "Some students prefer online classes, ___ others like face-to-face teaching.",
        "options": [
          "whereas",
          "provided that",
          "given that",
          "unless"
        ],
        "answer": 0
      },
      {
        "q": "You can join the team, ___ you have the required qualifications.",
        "options": [
          "whereas",
          "provided that",
          "given that",
          "although"
        ],
        "answer": 1
      },
      {
        "q": "___ the current situation, we need to act quickly.",
        "options": [
          "Whereas",
          "Provided that",
          "Given",
          "Unless"
        ],
        "answer": 2
      },
      {
        "q": "He enjoys city life, ___ his brother prefers the countryside.",
        "options": [
          "provided that",
          "whereas",
          "given that",
          "unless"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Provided you finish on time, you can leave early.",
          "Provided you will finish on time, you can leave early.",
          "Provided that you finished on time, you can leave early.",
          "Provided you finishing on time, you can leave early."
        ],
        "answer": 0
      }
    ]
  },
  "contrast-clauses-b2": {
    "explanation": [
      "Murakkab kontrast gaplarida \"while\", \"whereas\" va \"even though\" ikki fikr orasidagi kutilmagan yoki parallel qarama-qarshilikni aniq tashkil qilish uchun ishlatiladi, lekin ular bir-biridan nozik farq qiladi.",
      "\"Even though\" (\"although\"ning kuchliroq shakli) KUTILMAGAN natijani ta'kidlaydi — biror to'siq yoki qarshi omil bo'lishiga qaramay natija o'zgarmaganini bildiradi: \"Even though demand fell, prices remained high\" (kutilgani — narx tushishi kerak edi, lekin tushmadi).",
      "\"While\" va \"whereas\" ko'proq IKKI TENG holatni PARALLEL SOLISHTIRISHDA ishlatiladi, kutilmaganlik ma'nosisiz: \"While some regions saw growth, others experienced decline\" (ikki holat oddiygina qarama-qarshi qo'yilyapti, biri kutilmagan emas).",
      "Bu uch bog'lovchi gap boshida ham, o'rtasida ham kelishi mumkin, lekin \"whereas\" rasmiyroq uslubga xos bo'lgani uchun ko'pincha yozma, tahliliy matnlarda ustunlik qiladi."
    ],
    "examples": [
      {
        "en": "Even though demand fell sharply, prices remained surprisingly high.",
        "uz": "Talab keskin tushishiga qaramay, narxlar ajablanarli darajada yuqoriligicha qoldi."
      },
      {
        "en": "While some regions saw strong growth, others experienced a slight decline.",
        "uz": "Ba'zi hududlarda kuchli o'sish kuzatilgan bo'lsa, boshqalarida biroz pasayish yuz berdi."
      },
      {
        "en": "Even though the plan seemed risky, the board approved it unanimously.",
        "uz": "Reja xavfli ko'rinishiga qaramay, kengash uni bir ovozdan tasdiqladi."
      },
      {
        "en": "Whereas the first quarter showed losses, the second quarter turned a profit.",
        "uz": "Birinchi chorak zarar ko'rsatgan bo'lsa, ikkinchi chorak foyda keltirdi."
      },
      {
        "en": "Even though he had little experience, he handled the crisis impressively well.",
        "uz": "Uning tajribasi kam bo'lishiga qaramay, u inqirozni ajoyib tarzda boshqardi."
      },
      {
        "en": "While the design was praised, the pricing received significant criticism.",
        "uz": "Dizayn maqtovga sazovor bo'lgan bo'lsa, narxlash sezilarli tanqidga uchradi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Even though demand fell, but prices remained high.",
        "right": "Even though demand fell, prices remained high.",
        "note": "\"Even though\" bilan bir gapda \"but\" ham ishlatilmaydi — ikkalasi bir xil vazifani bajaradi."
      },
      {
        "wrong": "Even though the plan risky, it was approved.",
        "right": "Even though the plan was risky, it was approved.",
        "note": "\"Even though\"dan keyin to'liq gap (ega + kesim) kelishi kerak, \"was\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "Whereas the growth in region one, region two declined.",
        "right": "Whereas region one saw growth, region two declined.",
        "note": "\"Whereas\"dan keyin to'liq gap kerak, faqat noun phrase emas."
      }
    ],
    "quiz": [
      {
        "q": "___ the team worked hard, they still missed the deadline.",
        "options": [
          "Whereas",
          "Even though",
          "While",
          "Both b and c"
        ],
        "answer": 3
      },
      {
        "q": "Sales increased in Europe, ___ they fell in Asia.",
        "options": [
          "even though",
          "whereas",
          "despite",
          "although"
        ],
        "answer": 1
      },
      {
        "q": "___ he apologised sincerely, she remained upset.",
        "options": [
          "Even though",
          "Whereas",
          "Given that",
          "Provided that"
        ],
        "answer": 0
      },
      {
        "q": "The north received heavy rainfall, ___ the south stayed dry.",
        "options": [
          "even though",
          "while",
          "despite",
          "unless"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Even though it was expensive, but we bought it.",
          "Even though it was expensive, we bought it.",
          "Even though expensive, we bought it.",
          "Even though it expensive, we bought it."
        ],
        "answer": 1
      }
    ]
  },
  "concession-clauses-b2": {
    "explanation": [
      "Concession clause (yon berish gaplari) biror TO'SIQ yoki QIYINCHILIK mavjud bo'lsa-da, NATIJA O'ZGARMAGANINI formal uslubda ta'kidlaydi — bu \"although\"dan ko'ra rasmiyroq, adabiyroq variantlar.",
      "\"However + sifat/ravish + subject + verb\" qurilishi: \"However difficult it seems, the task is possible\" (qanchalik qiyin ko'rinmasin — darajasidan qat'iy nazar, natija o'zgarmaydi). \"However\" bu yerda oddiy bog'lovchi emas, balki darajani bildiruvchi maxsus struktura.",
      "\"Much as\" — \"garchi ... juda ham xohlasam-da\" ma'nosidagi rasmiy, adabiy ibora, ko'pincha shaxsiy his-tuyg'u bilan qarama-qarshi harakatni bildiradi: \"Much as I admire her work, I can't agree with this decision\" (uning ishini juda hurmat qilaman, lekin baribir rozi emasman).",
      "Bu strukturalar ko'pincha rasmiy nutq, esse va murakkab tushuntirishlarda ishlatiladi, chunki ular oddiy \"but\"dan ko'ra fikrning KUCHLI, lekin OBYEKTIV tarzda qarama-qarshi qo'yilishini ta'minlaydi."
    ],
    "examples": [
      {
        "en": "However difficult the task seems, it is still achievable with the right approach.",
        "uz": "Vazifa qanchalik qiyin ko'rinmasin, u to'g'ri yondashuv bilan hali ham bajariladigan."
      },
      {
        "en": "Much as I admire her dedication, I cannot support this particular decision.",
        "uz": "Uning fidoyiligini qanchalik hurmat qilmayin, men aynan shu qarorni qo'llab-quvvatlay olmayman."
      },
      {
        "en": "However hard we tried, we couldn't finish the project on time.",
        "uz": "Qanchalik harakat qilmaylik, loyihani vaqtida tugata olmadik."
      },
      {
        "en": "Much as I enjoy travelling, I always look forward to coming home.",
        "uz": "Sayohat qilishni qanchalik yoqtirmayin, doim uyga qaytishni intiqlik bilan kutaman."
      },
      {
        "en": "However complicated the situation becomes, we must stay calm and focused.",
        "uz": "Vaziyat qanchalik murakkablashmasin, biz xotirjam va diqqatli bo'lishimiz kerak."
      },
      {
        "en": "Much as they wanted to help, there was nothing they could do.",
        "uz": "Ular yordam berishni qanchalik xohlamasin, ular hech narsa qila olmasdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "However the task seems difficult, it is achievable.",
        "right": "However difficult the task seems, it is achievable.",
        "note": "\"However\"dan keyin darhol sifat (difficult) keladi, keyin ega+fe'l — tartib muhim."
      },
      {
        "wrong": "Much as I admiring her work, I disagree.",
        "right": "Much as I admire her work, I disagree.",
        "note": "\"Much as\"dan keyin oddiy Present Simple keladi, -ing shakli emas."
      },
      {
        "wrong": "However difficult it seems, but we will succeed.",
        "right": "However difficult it seems, we will succeed.",
        "note": "\"However\" bilan bir gapda \"but\" ortiqcha — ikkalasi bir xil vazifani bajaradi."
      }
    ],
    "quiz": [
      {
        "q": "___ tired she was, she finished the marathon.",
        "options": [
          "Much as",
          "However",
          "Given that",
          "Provided that"
        ],
        "answer": 1
      },
      {
        "q": "___ I respect his opinion, I don't think he's right this time.",
        "options": [
          "However",
          "Much as",
          "Whereas",
          "Unless"
        ],
        "answer": 1
      },
      {
        "q": "___ complex the problem seems, there is always a solution.",
        "options": [
          "Much as",
          "However",
          "Given that",
          "Whereas"
        ],
        "answer": 1
      },
      {
        "q": "___ I love this city, the traffic is unbearable.",
        "options": [
          "However",
          "Much as",
          "Whereas",
          "Provided that"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "However it is difficult, we will manage.",
          "However difficult it is, we will manage.",
          "However difficult is it, we will manage.",
          "However is it difficult, we will manage."
        ],
        "answer": 1
      }
    ]
  },
  "purpose-result-clauses-b2": {
    "explanation": [
      "Murakkab maqsad va natija gaplarida oddiy \"to/so that\"dan tashqari rasmiyroq strukturalar ham ishlatiladi: \"such...that\" (kuchli sifat + natija), \"with the result that\" (rasmiy, aniq natija bog'lovchisi).",
      "\"Such...that\" — kuchli sifat-ot birikmasidan keyin uning NATIJASINI bildiradi: \"The demand was such that we had to increase production\" (talab shunchalik katta ediki — natija: ishlab chiqarishni oshirishga majbur bo'ldik).",
      "\"With the result that\" rasmiy yozuvda \"so\"ning aniqroq, akademik muqobili sifatida ishlatiladi, ayniqsa sabab-natija zanjirini tushuntirishda: \"The factory closed, with the result that hundreds lost their jobs\" (aniq, rasmiy sabab-natija bog'lanishi).",
      "Maqsad va natijani farqlash muhim: MAQSAD — nima uchun biror ish qilinadi (\"so that\", \"in order to\"), NATIJA — nima sodir bo'ladi (\"with the result that\", \"as a result\") — ikkalasi grammatik jihatdan boshqacha ishlaydi."
    ],
    "examples": [
      {
        "en": "The demand for the product was such that we had to double production.",
        "uz": "Mahsulotga talab shunchalik katta ediki, biz ishlab chiqarishni ikki barobar oshirishga majbur bo'ldik."
      },
      {
        "en": "The factory closed down, with the result that hundreds of workers lost their jobs.",
        "uz": "Zavod yopilib qoldi, natijada yuzlab ishchilar ishlarini yo'qotishdi."
      },
      {
        "en": "She spoke so clearly and confidently that the audience was completely convinced.",
        "uz": "U shunchalik aniq va ishonchli gapirdiki, tomoshabinlar to'liq ishondi."
      },
      {
        "en": "The system was redesigned so that users could complete tasks more quickly.",
        "uz": "Foydalanuvchilar vazifalarni tezroq bajarishi uchun tizim qayta loyihalashtirildi."
      },
      {
        "en": "The storm was so severe that flights were cancelled across the region.",
        "uz": "Bo'ron shunchalik kuchli ediki, mintaqa bo'ylab parvozlar bekor qilindi."
      },
      {
        "en": "The company cut costs, with the result that quality began to suffer.",
        "uz": "Kompaniya xarajatlarni qisqartirdi, natijada sifat pasaya boshladi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The demand was so that we had to double production.",
        "right": "The demand was such that we had to double production.",
        "note": "Ot birikmasi (the demand) bilan \"so\" emas, \"such\" ishlatiladi."
      },
      {
        "wrong": "The factory closed, so that hundreds lost their jobs.",
        "right": "The factory closed, with the result that hundreds lost their jobs.",
        "note": "\"So that\" MAQSADNI bildiradi, natijani emas — bu yerda \"with the result that\" to'g'ri variant."
      },
      {
        "wrong": "The system was redesigned with the result that users could work faster. (bu maqsad, natija emas)",
        "right": "The system was redesigned so that users could work faster.",
        "note": "Bu — niyat/maqsad (nima uchun qayta loyihalashtirildi), shuning uchun \"so that\" to'g'ri, \"with the result that\" emas."
      }
    ],
    "quiz": [
      {
        "q": "The noise was ___ that nobody could concentrate.",
        "options": [
          "so",
          "such",
          "with the result",
          "so that"
        ],
        "answer": 0
      },
      {
        "q": "Interest rates rose sharply, ___ many people struggled with their mortgages.",
        "options": [
          "so that",
          "with the result that",
          "such that",
          "in order to"
        ],
        "answer": 1
      },
      {
        "q": "The project was delayed ___ the team could gather more data.",
        "options": [
          "with the result that",
          "such that",
          "so that",
          "so"
        ],
        "answer": 2
      },
      {
        "q": "Her performance was ___ impressive that she won the award immediately.",
        "options": [
          "such",
          "so",
          "with the result",
          "in order to"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "The heat was so that everyone felt exhausted.",
          "The heat was such that everyone felt exhausted.",
          "The heat was such so everyone felt exhausted.",
          "The heat such was that everyone felt exhausted."
        ],
        "answer": 1
      }
    ]
  },
  "future-in-the-past-b2": {
    "explanation": [
      "\"Future in the past\" o'tgan nuqtadan (masalan, o'tgan bir voqea yoki hikoya davomida) qaraganda O'SHA PAYTDA kelajakka tegishli bo'lgan voqeani ifodalaydi — bu haqiqiy kelajak emas, balki \"o'sha paytdan keyin sodir bo'lishi kutilgan\" narsa.",
      "\"Would\" — \"will\"ning o'tgan zamon muqobili sifatida ishlatiladi: \"I knew the meeting would take longer\" (o'sha paytda men kelajakni shunday kutgan edim). \"Was/were going to\" — o'tgan niyatni bildiradi: \"She was going to call, but she forgot\" (u qo'ng'iroq qilishni rejalashtirgan edi).",
      "\"Was/were about to\" — o'tgan paytda JUDA YAQIN kelajakni, ish deyarli boshlangan holatni bildiradi: \"I was about to leave when the phone rang\" (chiqishga oz qolgan edi).",
      "Bu qurilmalar ko'pincha hikoya qilishda, ayniqsa reported speech va o'tgan voqealarni tartib bilan tasvirlashda ishlatiladi — ular o'quvchi/tinglovchiga o'sha paytdagi kelajak kutuvini his qildiradi."
    ],
    "examples": [
      {
        "en": "I knew the meeting would take longer than expected.",
        "uz": "Men uchrashuv kutilganidan uzoqroq davom etishini bilardim."
      },
      {
        "en": "She was going to call him, but she forgot in all the confusion.",
        "uz": "U unga qo'ng'iroq qilmoqchi edi, lekin barcha tartibsizlikda unutib qo'ydi."
      },
      {
        "en": "I was about to leave the house when the phone rang.",
        "uz": "Uydan chiqishga oz qolgan edi, telefon jiringlab qoldi."
      },
      {
        "en": "He didn't realise that this decision would change his whole career.",
        "uz": "U bu qarorning butun karerasini o'zgartirishini anglamagan edi."
      },
      {
        "en": "We were about to give up when we finally found a solution.",
        "uz": "Biz voz kechishga yaqinlashgan edik, nihoyat yechim topdik."
      },
      {
        "en": "They were going to move to a new city, but their plans changed.",
        "uz": "Ular yangi shaharga ko'chib o'tmoqchi edi, lekin rejalari o'zgardi."
      }
    ],
    "mistakes": [
      {
        "wrong": "I knew the meeting will take longer.",
        "right": "I knew the meeting would take longer.",
        "note": "O'tgan nuqtadan qaraganda kelajak uchun \"will\" emas, \"would\" ishlatiladi."
      },
      {
        "wrong": "She was going call him.",
        "right": "She was going to call him.",
        "note": "\"Was going\"dan keyin \"to\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "I was about leaving when the phone rang.",
        "right": "I was about to leave when the phone rang.",
        "note": "\"Be about to\" qurilishida \"to\"dan keyin fe'l asl shaklda bo'ladi, -ing shaklida emas."
      }
    ],
    "quiz": [
      {
        "q": "He told me that he ___ the report by Friday.",
        "options": [
          "will finish",
          "would finish",
          "finishes",
          "finished"
        ],
        "answer": 1
      },
      {
        "q": "We ___ to leave when it started raining heavily.",
        "options": [
          "were about",
          "was about",
          "were going",
          "are about"
        ],
        "answer": 0
      },
      {
        "q": "She ___ study abroad, but she changed her mind at the last moment.",
        "options": [
          "was going to",
          "will",
          "is going to",
          "would to"
        ],
        "answer": 0
      },
      {
        "q": "I didn't know that this small decision ___ so much.",
        "options": [
          "will matter",
          "would matter",
          "matters",
          "mattered"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I was about to call you when you texted me.",
          "I was about calling you when you texted me.",
          "I was about call you when you texted me.",
          "I am about to call you when you texted me."
        ],
        "answer": 0
      }
    ]
  },
  "advanced-indirect-questions-b2": {
    "explanation": [
      "Murakkab bilvosita savollarda ham asosiy qoida saqlanadi — oddiy gap tartibi va yordamchi fe'lning tushirilishi — lekin bu yerda murakkab zamonlar (Present Perfect, passive) bilan ham to'g'ri qo'llash muhim.",
      "\"Whether\" ko'pincha \"if\"dan rasmiyroq va aniqroq hisoblanadi, ayniqsa \"or not\" bilan birga yoki predlogdan keyin ishlatilganda: \"I wonder whether the data has been verified\" (\"if\" ham to'g'ri, lekin \"whether\" rasmiyroq).",
      "Murakkab zamonlar (Present Perfect passive, modal) bilvosita savolga aylantirilganda ham gap tartibi o'zgarmaydi — faqat savol belgisi va yordamchi fe'lning O'RNI o'zgaradi, zamonning o'zi saqlanadi: \"Has the data been verified?\" → \"I wonder whether the data has been verified\" (\"has been verified\" o'zgarmagan holda qoladi, faqat tartib o'zgargan).",
      "\"Whether\"dan farqli o'laroq, \"if\" predlogdan keyin yoki \"or not\" bilan bevosita ishlatilmaydi (\"of if\" yoki \"if or not\" grammatik jihatdan noto'g'ri) — bunday holatlarda faqat \"whether\" ishlatiladi."
    ],
    "examples": [
      {
        "en": "I wonder whether the data has been verified by the research team.",
        "uz": "Qiziq, ma'lumotlar tadqiqot guruhi tomonidan tekshirilganmi?"
      },
      {
        "en": "She asked whether the results had already been published.",
        "uz": "U natijalar allaqachon nashr etilganmi-etilmaganmi deb so'radi."
      },
      {
        "en": "I'm not sure whether or not the meeting has been rescheduled.",
        "uz": "Uchrashuv qayta rejalashtirilganmi-yo'qmi, aniq bilmayman."
      },
      {
        "en": "Could you find out whether the contract has been signed yet?",
        "uz": "Shartnoma hali imzolanganmi-imzolanmaganini bilib bera olasizmi?"
      },
      {
        "en": "He questioned whether the policy would actually be enforced.",
        "uz": "U bu siyosat haqiqatan ham amalga oshiriladimi deb shubha bildirdi."
      },
      {
        "en": "We need to know whether the funding has been approved.",
        "uz": "Moliyalashtirish tasdiqlanganmi-yo'qmi bilishimiz kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "I wonder whether has the data been verified.",
        "right": "I wonder whether the data has been verified.",
        "note": "Bilvosita savolda oddiy gap tartibi saqlanadi — \"has\" egadan keyin turishi kerak."
      },
      {
        "wrong": "I'm not sure of if the meeting was rescheduled.",
        "right": "I'm not sure whether the meeting has been rescheduled.",
        "note": "Predlogdan (of) keyin \"if\" emas, faqat \"whether\" ishlatiladi."
      },
      {
        "wrong": "She asked whether had the results published.",
        "right": "She asked whether the results had been published.",
        "note": "Passiv bilvosita savolda \"had\" egadan keyin, \"been\" saqlangan holda turishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "I wonder whether the report ___ yet.",
        "options": [
          "has been finished",
          "has finished",
          "finished has been",
          "been has finished"
        ],
        "answer": 0
      },
      {
        "q": "She asked ___ the decision had been made.",
        "options": [
          "that",
          "whether",
          "so",
          "what"
        ],
        "answer": 1
      },
      {
        "q": "I'm not sure ___ the invitation was sent.",
        "options": [
          "of if",
          "whether",
          "if that",
          "that if"
        ],
        "answer": 1
      },
      {
        "q": "Could you check ___ the payment has been processed?",
        "options": [
          "whether",
          "that",
          "so",
          "what"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I wonder whether has she left.",
          "I wonder whether she has left.",
          "I wonder has she left whether.",
          "I wonder whether left she has."
        ],
        "answer": 1
      }
    ]
  },
  "ellipsis-basics-b2": {
    "explanation": [
      "Ellipsis — gapda ma'no hali ham tushunarli bo'lib qolgan holda TAKRORIY so'zlarni TUSHIRIB QOLDIRISH usuli. Bu nutqni tabiiyroq va ixchamroq qiladi, ayniqsa ikkinchi gap birinchisiga o'xshash struktura ishlatganda.",
      "Eng oddiy misol — ikki qism bir xil fe'lni baham ko'rganda, ikkinchisida fe'l tushiriladi: \"I ordered the soup, and Maya the salad\" (\"Maya ordered the salad\" o'rniga — \"ordered\" tushirilgan, chunki u allaqachon aniq).",
      "Yordamchi fe'llar ham ko'pincha qisqa javoblarda va qo'shimcha gaplarda tushiriladi: \"She can speak French, and so can I\" (\"can speak French\" ikkinchi marta takrorlanmaydi, \"so can I\" bilan almashtiriladi).",
      "Ellipsis rasmiy va norasmiy nutqda ham keng ishlatiladi, lekin qaysi qismning tushirilishi mumkinligini tushunish uchun gapning grammatik strukturasini aniq bilish kerak — noto'g'ri joyda tushirish gapni tushunarsiz qiladi."
    ],
    "examples": [
      {
        "en": "I ordered the soup, and Maya the salad.",
        "uz": "Men shorva buyurdim, Maya esa salat."
      },
      {
        "en": "She can speak French fluently, and so can her brother.",
        "uz": "U frantsuz tilida ravon gapira oladi, akasi ham shunday."
      },
      {
        "en": "Some people prefer coffee; others, tea.",
        "uz": "Ba'zi odamlar qahvani afzal ko'radi; boshqalari — choyni."
      },
      {
        "en": "He wanted to help, but couldn't.",
        "uz": "U yordam bermoqchi edi, lekin bera olmadi."
      },
      {
        "en": "I haven't seen the film, but my sister has.",
        "uz": "Men filmni ko'rmaganman, lekin opam ko'rgan."
      },
      {
        "en": "We visited the museum in the morning and the gallery in the afternoon.",
        "uz": "Biz ertalab muzeyga, tushdan keyin esa galereyaga tashrif buyurdik."
      }
    ],
    "mistakes": [
      {
        "wrong": "I ordered the soup, and Maya ordered.",
        "right": "I ordered the soup, and Maya the salad.",
        "note": "Ellipsis'da to'ldiruvchi (salad) qoladi, takroriy fe'l (ordered) tushiriladi — \"ordered\" yolg'iz qoldirilmaydi, chunki bu noaniq ma'no beradi."
      },
      {
        "wrong": "She can speak French, and so I can.",
        "right": "She can speak French, and so can I.",
        "note": "\"So + auxiliary + subject\" tartibida — \"can I\" emas \"so can I\", auxiliary subjektdan oldin keladi."
      },
      {
        "wrong": "I haven't seen it, but my sister have.",
        "right": "I haven't seen it, but my sister has.",
        "note": "Ellipsis'da qoldirilgan auxiliary fe'l (has) subjektga (my sister — birlik) mos kelishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "He likes tea, and she ___.",
        "options": [
          "likes coffee",
          "coffee",
          "does coffee",
          "like coffee"
        ],
        "answer": 1
      },
      {
        "q": "I can't attend the meeting, but my colleague ___.",
        "options": [
          "can",
          "cans",
          "does can",
          "can attend"
        ],
        "answer": 0
      },
      {
        "q": "She finished her homework early; her brother ___ late.",
        "options": [
          "finished",
          "finished it",
          "did",
          "finish"
        ],
        "answer": 0
      },
      {
        "q": "My father enjoys hiking, and so ___ my mother.",
        "options": [
          "does",
          "do",
          "is",
          "has"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "I ordered fish, and he ordered chicken.",
          "I ordered fish, and he chicken.",
          "Both a and b are correct.",
          "I fish ordered, and he chicken."
        ],
        "answer": 2
      }
    ]
  },
  "substitution-basics-b2": {
    "explanation": [
      "Substitution — takroriy so'z yoki gapni tushirib qoldirish o'rniga, uni QISQA SO'Z bilan ALMASHTIRISH usuli (ellipsis'dan farqi — bu yerda hech narsa tushirilmaydi, aksincha o'rniga boshqa so'z qo'yiladi).",
      "\"One/ones\" — takroriy OTni almashtiradi: \"The blue chairs are softer than the red ones\" (\"the red chairs\" o'rniga \"the red ones\" — \"chairs\" takrorlanmaydi).",
      "\"Do so\" — takroriy FE'L BIRIKMASINI (harakatni) rasmiy uslubda almashtiradi: \"If you want to leave early, you may do so\" (\"leave early\" o'rniga \"do so\").",
      "\"So/not\" ba'zi fe'llardan (think, hope, believe, expect, be afraid) keyin butun GAPni (clause) almashtiradi: \"Will it rain? — I think so\" (\"I think it will rain\" o'rniga \"I think so\"); inkor uchun \"not\": \"I hope not\" (\"I hope it won't happen\")."
    ],
    "examples": [
      {
        "en": "The blue chairs are softer than the red ones.",
        "uz": "Ko'k stullar qizil (stullar)dan yumshoqroq."
      },
      {
        "en": "If you would like to leave the meeting early, you may do so.",
        "uz": "Agar uchrashuvni erta tark etmoqchi bo'lsangiz, shunday qilishingiz mumkin."
      },
      {
        "en": "Will the project succeed? — I think so.",
        "uz": "Loyiha muvaffaqiyatli bo'ladimi? — Menimcha, ha."
      },
      {
        "en": "Is it going to rain today? — I hope not.",
        "uz": "Bugun yomg'ir yog'adimi? — Umid qilamanki, yo'q."
      },
      {
        "en": "I need a new laptop; this old one is too slow.",
        "uz": "Menga yangi noutbuk kerak; bu eskisi juda sekin."
      },
      {
        "en": "He asked me to help, and I was happy to do so.",
        "uz": "U mendan yordam so'radi va men buni bajonidil qildim."
      }
    ],
    "mistakes": [
      {
        "wrong": "The blue chairs are softer than the red chair.",
        "right": "The blue chairs are softer than the red ones.",
        "note": "Ko'plik ot takrorlanganda \"ones\" bilan almashtirish tabiiyroq va to'g'ri — \"chair\" (birlik) sondagi nomuvofiqlik xato yaratadi."
      },
      {
        "wrong": "If you want to leave, you may do it.",
        "right": "If you want to leave, you may do so.",
        "note": "Oldingi to-infinitive fe'l birikmasini almashtirishda rasmiy uslubda \"do so\" ishlatiladi, \"do it\" emas."
      },
      {
        "wrong": "Will it rain? — I think it.",
        "right": "Will it rain? — I think so.",
        "note": "Butun clause'ni almashtirishda \"it\" emas, \"so\" ishlatiladi."
      }
    ],
    "quiz": [
      {
        "q": "I like the small bag more than the big ___.",
        "options": [
          "one",
          "ones",
          "it",
          "so"
        ],
        "answer": 0
      },
      {
        "q": "Will they finish on time? — I believe ___.",
        "options": [
          "it",
          "that",
          "so",
          "one"
        ],
        "answer": 2
      },
      {
        "q": "If you need to leave early, please feel free to ___.",
        "options": [
          "do it",
          "do so",
          "make so",
          "do that so"
        ],
        "answer": 1
      },
      {
        "q": "Is the shop still open? — I hope ___.",
        "options": [
          "so",
          "not",
          "it",
          "one"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "These shoes are nicer than those shoe.",
          "These shoes are nicer than those ones.",
          "These shoes are nicer than that one.",
          "These shoes are nicer than those it."
        ],
        "answer": 1
      }
    ]
  },
  "advanced-prepositions-b2": {
    "explanation": [
      "Rasmiy va akademik matnlarda oddiy predloglar (\"because of\", \"but\") o'rniga murakkab, ko'p so'zli predloglar ishlatiladi — bular sabab, kontrast va munosabatni aniqroq va rasmiyroq ifodalaydi.",
      "Sabab uchun: \"due to\", \"owing to\" (\"because of\"ning rasmiy muqobillari): \"The delay was due to bad weather.\" Kontrast uchun: \"in spite of\", \"despite\" (allaqachon tanish, lekin \"notwithstanding\" ham rasmiy matnlarda uchraydi).",
      "\"In terms of\" — biror narsani MA'LUM BIR JIHATDAN ko'rib chiqishda ishlatiladi: \"In terms of cost, this option is cheaper\" (narx nuqtai nazaridan). \"With regard to\" / \"regarding\" — mavzuni kiritishda: \"With regard to your request, we can confirm...\"",
      "Bu murakkab predloglardan keyin har doim OT yoki -ing shakli keladi, hech qachon to'liq gap (ega+kesim) kelmaydi — bu oddiy bog'lovchilardan (because, although) asosiy farqi."
    ],
    "examples": [
      {
        "en": "The event continued in spite of the heavy rain.",
        "uz": "Tadbir kuchli yomg'irga qaramay davom etdi."
      },
      {
        "en": "The delay was due to a technical problem with the system.",
        "uz": "Kechikish tizimdagi texnik muammo tufayli bo'ldi."
      },
      {
        "en": "In terms of cost, this option is significantly cheaper than the alternatives.",
        "uz": "Narx nuqtai nazaridan, bu variant boshqalaridan sezilarli darajada arzonroq."
      },
      {
        "en": "With regard to your enquiry, we will respond within two business days.",
        "uz": "Sizning so'rovingizga kelsak, biz ikki ish kuni ichida javob beramiz."
      },
      {
        "en": "Owing to unforeseen circumstances, the conference has been postponed.",
        "uz": "Kutilmagan holatlar tufayli konferensiya kechiktirildi."
      },
      {
        "en": "In view of the recent changes, we need to update our strategy.",
        "uz": "Yaqinda yuz bergan o'zgarishlarni hisobga olib, biz strategiyamizni yangilashimiz kerak."
      }
    ],
    "mistakes": [
      {
        "wrong": "The delay was due to it rained heavily.",
        "right": "The delay was due to heavy rain.",
        "note": "\"Due to\"dan keyin ot yoki -ing keladi, to'liq gap emas."
      },
      {
        "wrong": "In spite the rain, the event continued.",
        "right": "In spite of the rain, the event continued.",
        "note": "\"In spite\"dan keyin \"of\" tushirib qoldirilmaydi."
      },
      {
        "wrong": "With regard your request, we confirm.",
        "right": "With regard to your request, we confirm.",
        "note": "\"With regard\"dan keyin \"to\" kerak."
      }
    ],
    "quiz": [
      {
        "q": "The flight was cancelled ___ the storm.",
        "options": [
          "due to",
          "despite",
          "although",
          "so that"
        ],
        "answer": 0
      },
      {
        "q": "___ the criticism, the plan went ahead as scheduled.",
        "options": [
          "Due to",
          "In spite of",
          "Because",
          "So that"
        ],
        "answer": 1
      },
      {
        "q": "___ quality, this product is far superior to its competitors.",
        "options": [
          "In terms of",
          "Due to",
          "In spite of",
          "Because of"
        ],
        "answer": 0
      },
      {
        "q": "___ your email, we would like to confirm the meeting time.",
        "options": [
          "With regard to",
          "In spite of",
          "Due to",
          "Owing"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Owing the traffic, we were late.",
          "Owing to the traffic, we were late.",
          "Owing of the traffic, we were late.",
          "Owing that traffic, we were late."
        ],
        "answer": 1
      }
    ]
  },
  "adjective-preposition-patterns-b2": {
    "explanation": [
      "Ko'plab sifatlar ma'lum, FIKS predlog bilan birikadi va bu birikmalarni bir butun sifatida yodlash kerak, chunki predlog tanlovi mantiqiy qoidaga emas, balki AN'ANAGA asoslangan.",
      "Ba'zi keng tarqalgan birikmalar: capable of, interested in, worried about, responsible for, similar to, different from, aware of, keen on, good at, afraid of.",
      "Bu sifat+predlog birikmasidan keyin agar fe'l kerak bo'lsa, u GERUND (-ing) shaklida bo'ladi, to-infinitive emas — chunki predlogdan keyin fe'l doim -ing shaklida keladi: \"The team is capable of handling the change\" (\"to handle\" emas).",
      "Bu birikmalarni to'g'ri ishlatish uchun eng ishonchli usul — har bir yangi sifatni predlogi bilan BIRGA yodlash, alohida-alohida emas, chunki tarjima qilishda ona tilidagi predlog boshqacha bo'lishi mumkin."
    ],
    "examples": [
      {
        "en": "The team is fully capable of handling this level of complexity.",
        "uz": "Jamoa bu darajadagi murakkablikni boshqarishga to'liq qodir."
      },
      {
        "en": "She has always been interested in learning new languages.",
        "uz": "U doim yangi tillarni o'rganishga qiziqib kelgan."
      },
      {
        "en": "He is responsible for managing the entire project.",
        "uz": "U butun loyihani boshqarishga mas'ul."
      },
      {
        "en": "We are aware of the risks involved in this decision.",
        "uz": "Biz bu qarordagi xavflardan xabardormiz."
      },
      {
        "en": "This approach is quite similar to what we used last year.",
        "uz": "Bu yondashuv o'tgan yil ishlatganimizga juda o'xshash."
      },
      {
        "en": "She is worried about the upcoming exam results.",
        "uz": "U yaqinlashib kelayotgan imtihon natijalaridan xavotirda."
      }
    ],
    "mistakes": [
      {
        "wrong": "The team is capable to handle the change.",
        "right": "The team is capable of handling the change.",
        "note": "\"Capable\" \"of\" predlogi bilan ishlatiladi, \"to\" bilan emas."
      },
      {
        "wrong": "He is responsible of the project.",
        "right": "He is responsible for the project.",
        "note": "\"Responsible\" \"for\" predlogi bilan ishlatiladi, \"of\" bilan emas."
      },
      {
        "wrong": "She is interested to learn new languages.",
        "right": "She is interested in learning new languages.",
        "note": "\"Interested\" \"in\" predlogi bilan, undan keyin gerund (-ing) keladi."
      }
    ],
    "quiz": [
      {
        "q": "He is very good ___ solving complex problems.",
        "options": [
          "in",
          "at",
          "for",
          "with"
        ],
        "answer": 1
      },
      {
        "q": "She is worried ___ losing her job.",
        "options": [
          "for",
          "of",
          "about",
          "in"
        ],
        "answer": 2
      },
      {
        "q": "This model is different ___ the previous one.",
        "options": [
          "than",
          "from",
          "of",
          "to"
        ],
        "answer": 1
      },
      {
        "q": "I'm not really keen ___ working overtime.",
        "options": [
          "on",
          "in",
          "for",
          "at"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "We are aware for the risks.",
          "We are aware of the risks.",
          "We are aware to the risks.",
          "We are aware about the risks."
        ],
        "answer": 1
      }
    ]
  },
  "noun-preposition-patterns-b2": {
    "explanation": [
      "Otlar ham sifatlar kabi ma'lum FIKS predloglar bilan birikadi va bu collocationlar (birikmalar) akademik va professional yozuvda muntazam ishlatiladi.",
      "Keng tarqalgan birikmalar: demand for, reason for, solution to, access to, increase/decrease in, effect on, interest in, relationship with/between, need for.",
      "Muhim nozik farq: \"increase/decrease IN\" (biror narsaning o'zi qanchalik o'zgargani — \"an increase in sales\"), lekin \"effect ON\" (biror narsaga ta'sir — \"the effect on the economy\") — bu ikki turdagi predlog almashtirilmaydi.",
      "Bu birikmalarni to'g'ri ishlatish yozma ishning tabiiyligini va professionalligini oshiradi — noto'g'ri predlog tanlangan gap ma'no jihatidan tushunarli bo'lsa ham, notabiiy va \"tarjima qilingandek\" eshitiladi."
    ],
    "examples": [
      {
        "en": "There is growing demand for flexible, remote-friendly courses.",
        "uz": "Moslashuvchan, masofaviy ishlashga qulay kurslarga talab o'sib bormoqda."
      },
      {
        "en": "The main reason for the delay was a shortage of materials.",
        "uz": "Kechikishning asosiy sababi materiallar yetishmovchiligi edi."
      },
      {
        "en": "Researchers are still searching for a solution to this problem.",
        "uz": "Tadqiqotchilar hali ham bu muammoning yechimini izlashmoqda."
      },
      {
        "en": "There has been a significant increase in online shopping this year.",
        "uz": "Bu yil onlayn xarid qilishda sezilarli o'sish kuzatildi."
      },
      {
        "en": "The new policy will have a direct effect on small businesses.",
        "uz": "Yangi siyosat kichik biznesga bevosita ta'sir qiladi."
      },
      {
        "en": "Access to clean water remains a challenge in many regions.",
        "uz": "Toza suvga kirish imkoniyati ko'plab hududlarda hali ham muammo bo'lib qolmoqda."
      }
    ],
    "mistakes": [
      {
        "wrong": "There is a growing demand of flexible courses.",
        "right": "There is a growing demand for flexible courses.",
        "note": "\"Demand\" \"for\" predlogi bilan ishlatiladi, \"of\" bilan emas."
      },
      {
        "wrong": "There was an increase of sales this quarter.",
        "right": "There was an increase in sales this quarter.",
        "note": "\"Increase/decrease\" \"in\" predlogi bilan ishlatiladi."
      },
      {
        "wrong": "This policy will have an effect to small businesses.",
        "right": "This policy will have an effect on small businesses.",
        "note": "\"Effect\" \"on\" predlogi bilan ishlatiladi, \"to\" bilan emas."
      }
    ],
    "quiz": [
      {
        "q": "There is a growing need ___ better public transport.",
        "options": [
          "for",
          "of",
          "in",
          "to"
        ],
        "answer": 0
      },
      {
        "q": "Scientists found a solution ___ the pollution problem.",
        "options": [
          "for",
          "of",
          "to",
          "in"
        ],
        "answer": 2
      },
      {
        "q": "There was a sharp decrease ___ tourism last year.",
        "options": [
          "of",
          "in",
          "for",
          "on"
        ],
        "answer": 1
      },
      {
        "q": "The new law will have a big effect ___ local farmers.",
        "options": [
          "to",
          "of",
          "for",
          "on"
        ],
        "answer": 3
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "What is the reason of your absence?",
          "What is the reason for your absence?",
          "What is the reason to your absence?",
          "What is the reason with your absence?"
        ],
        "answer": 1
      }
    ]
  },
  "verb-preposition-grammar-b2": {
    "explanation": [
      "Fe'llar ham fiks predloglar bilan birikadi, va ko'pincha PREDLOG O'ZGARISHI FE'LNING MA'NOSINI ham o'zgartiradi — bu B2 darajasida alohida e'tibor talab qiladigan mavzu.",
      "Keng tarqalgan birikmalar: depend on, consist of, deal with, believe in, apply for, result in/from, focus on, rely on, insist on, succeed in.",
      "\"Result in\" va \"result from\" MA'NO jihatidan qarama-qarshi: \"result in\" — SABAB → NATIJA (\"Poor planning resulted in delays\" — reja yomonligi kechikishga OLIB KELDI), \"result from\" — NATIJA → SABAB (\"The delays resulted from poor planning\" — kechikish reja yomonligidan KELIB CHIQDI).",
      "Bu fe'l+predlog birikmalaridan keyin agar boshqa fe'l kerak bo'lsa, u har doim GERUND (-ing) shaklida bo'ladi, chunki predlogdan keyin fe'l -ing shaklida keladi: \"succeed in solving\" (\"to solve\" emas)."
    ],
    "examples": [
      {
        "en": "The outcome depends on several factors beyond our control.",
        "uz": "Natija bizning nazoratimizdan tashqaridagi bir nechta omillarga bog'liq."
      },
      {
        "en": "Poor planning resulted in significant delays to the project.",
        "uz": "Yomon reja loyihaning sezilarli kechikishiga olib keldi."
      },
      {
        "en": "The delays resulted from a shortage of skilled workers.",
        "uz": "Kechikishlar malakali ishchilar yetishmasligidan kelib chiqdi."
      },
      {
        "en": "The company needs to focus on improving customer satisfaction.",
        "uz": "Kompaniya mijozlar qoniqishini yaxshilashga e'tibor qaratishi kerak."
      },
      {
        "en": "We rely on accurate data to make informed decisions.",
        "uz": "Biz ongli qarorlar qabul qilish uchun aniq ma'lumotlarga tayanamiz."
      },
      {
        "en": "She finally succeeded in convincing the board to approve the plan.",
        "uz": "U nihoyat kengashni rejani tasdiqlashga ishontirishga muvaffaq bo'ldi."
      }
    ],
    "mistakes": [
      {
        "wrong": "The outcome depends of several factors.",
        "right": "The outcome depends on several factors.",
        "note": "\"Depend\" \"on\" predlogi bilan ishlatiladi, \"of\" bilan emas."
      },
      {
        "wrong": "Poor planning resulted delays.",
        "right": "Poor planning resulted in delays.",
        "note": "\"Result\"dan keyin \"in\" predlogi tushirib qoldirilmaydi."
      },
      {
        "wrong": "She succeeded to convince the board.",
        "right": "She succeeded in convincing the board.",
        "note": "\"Succeed\" \"in\" predlogi bilan, undan keyin gerund (-ing) keladi, to-infinitive emas."
      }
    ],
    "quiz": [
      {
        "q": "Success ___ this project depends ___ good teamwork.",
        "options": [
          "in / on",
          "on / on",
          "of / in",
          "in / of"
        ],
        "answer": 0
      },
      {
        "q": "The company's growth resulted ___ a well-planned strategy.",
        "options": [
          "in",
          "from",
          "of",
          "on"
        ],
        "answer": 1
      },
      {
        "q": "The team needs to focus ___ meeting the deadline.",
        "options": [
          "in",
          "of",
          "on",
          "for"
        ],
        "answer": 2
      },
      {
        "q": "He finally succeeded ___ passing the exam after three attempts.",
        "options": [
          "to",
          "in",
          "on",
          "at"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "This decision depends of the budget.",
          "This decision depends on the budget.",
          "This decision depends in the budget.",
          "This decision depends for the budget."
        ],
        "answer": 1
      }
    ]
  },
  "formal-grammar-patterns-b2": {
    "explanation": [
      "Formal (rasmiy) yozuvda oddiy, shaxsiy gaplar ko'pincha NOMINAL yoki IMPERSONAL (shaxssiz) strukturalarga aylantiriladi — bu uslub subyektiv fikrni obyektiv, professional ohangga o'zgartiradi.",
      "\"It is + sifat + to-infinitive\" qurilishi shaxssiz, umumiy baho berish uchun ishlatiladi: \"It is essential to consider the long-term cost\" (\"You must consider...\" o'rniga rasmiyroq, umumiyroq).",
      "\"It is + sifat + that + gap\" ham shunga o'xshash: \"It is important that all staff be informed\" (bu yerda \"be\" — subjunctive mood, rasmiy buyruq/tavsiya gaplarda ishlatiladi, \"is/are\" emas).",
      "Shaxsiy olmoshlar (I, we, you) o'rniga passiv yoki umumiy subject (\"one\", \"it\") ishlatish rasmiy uslubning yana bir belgisi: \"One must consider all the options\" yoki \"All options should be considered\" — \"You must consider\" o'rniga."
    ],
    "examples": [
      {
        "en": "It is essential to consider the long-term cost of this decision.",
        "uz": "Bu qarorning uzoq muddatli xarajatini ko'rib chiqish zarur."
      },
      {
        "en": "It is recommended that all applicants submit their forms by the deadline.",
        "uz": "Barcha nomzodlarga o'z formalarini muddatgacha topshirish tavsiya etiladi."
      },
      {
        "en": "It is important that the report be reviewed before submission.",
        "uz": "Hisobot topshirishdan oldin ko'rib chiqilishi muhim."
      },
      {
        "en": "One must take into account the potential risks before proceeding.",
        "uz": "Davom etishdan oldin salbiy ehtimoliy xavflarni hisobga olish kerak."
      },
      {
        "en": "All applications should be submitted through the official portal.",
        "uz": "Barcha arizalar rasmiy portal orqali topshirilishi kerak."
      },
      {
        "en": "It is advisable to consult a specialist before making a final decision.",
        "uz": "Yakuniy qaror qabul qilishdan oldin mutaxassisga murojaat qilish maqsadga muvofiq."
      }
    ],
    "mistakes": [
      {
        "wrong": "It is essential considering the cost.",
        "right": "It is essential to consider the cost.",
        "note": "\"It is + sifat\"dan keyin to-infinitive keladi, gerund emas."
      },
      {
        "wrong": "It is important that the report is reviewed.",
        "right": "It is important that the report be reviewed.",
        "note": "Rasmiy tavsiya/talab gaplarida (\"it is important/essential that\") subjunctive \"be\" ishlatiladi, \"is\" emas."
      },
      {
        "wrong": "You must consider all the options. (norasmiy, shaxsiy uslub rasmiy matnda)",
        "right": "One must consider all the options. / All options should be considered.",
        "note": "Rasmiy yozuvda shaxsiy \"you\" o'rniga shaxssiz \"one\" yoki passiv struktura afzal ko'riladi."
      }
    ],
    "quiz": [
      {
        "q": "It is crucial ___ all safety procedures before starting.",
        "options": [
          "following",
          "to follow",
          "follow",
          "followed"
        ],
        "answer": 1
      },
      {
        "q": "It is essential that every employee ___ the new policy.",
        "options": [
          "understands",
          "understand",
          "understanding",
          "to understand"
        ],
        "answer": 1
      },
      {
        "q": "___ consider the environmental impact before approving the project.",
        "options": [
          "You must",
          "One must",
          "I must",
          "We must (informal)"
        ],
        "answer": 1
      },
      {
        "q": "It is recommended that the documents ___ before Friday.",
        "options": [
          "are submitted",
          "be submitted",
          "submitted",
          "submitting"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI (rasmiy uslub)?",
        "options": [
          "It is important to review the data carefully.",
          "It is important reviewing the data carefully.",
          "It is important review the data carefully.",
          "It is important for review the data carefully."
        ],
        "answer": 0
      }
    ]
  },
  "hardly-scarcely-barely-inversion": {
    "explanation": [
      "\"Hardly\", \"scarcely\" va \"barely\" — \"deyarli...emas, zo'rg'a\" ma'nosidagi ravishlar, ular gap boshiga chiqarilganda auxiliary fe'lni ega oldiga o'tkazib INVERSIYA yaratadi: bu — ADABIY, NARRATIV uslubga xos kuchli struktura, ikkinchi voqea BIRINCHISIDAN DARHOL KEYIN sodir bo'lganini dramatik tarzda ta'kidlaydi.",
      "Qurilishi: Hardly/Scarcely/Barely + had + subject + III shakl + when/before + ikkinchi voqea: \"Hardly had the debate begun when the alarm sounded\" (bahs boshlanishi bilanoq, deyarli darhol signal chalindi).",
      "Bu struktura sof mexanik transformatsiya emas — u yozuvchiga VOQEALARNING TEZLIGI va KUTILMAGANLIGINI his qildirish imkonini beradi. Oddiy \"The debate had hardly begun when...\" bilan taqqoslaganda, inversiya qilingan shakl ANCHA DRAMATIKROQ, adabiy hikoyachilik yoki yangiliklar tilida ustunlik qiladi.",
      "\"Hardly...when\" va \"scarcely...before\" an'anaviy juftliklar hisoblanadi, garchi amaliyotda ular ko'pincha almashtirilib ishlatiladi. Bu struktura kundalik so'zlashuv nutqida deyarli ishlatilmaydi — u faqat yozma, rasmiy yoki adabiy kontekstda tabiiy eshitiladi."
    ],
    "examples": [
      {
        "en": "Hardly had the debate begun when the fire alarm sounded through the building.",
        "uz": "Bahs boshlanishi bilanoq, bino bo'ylab yong'in signali chalindi."
      },
      {
        "en": "Scarcely had she sat down before the phone started ringing again.",
        "uz": "U o'tirishi bilanoq, telefon yana jiringlay boshladi."
      },
      {
        "en": "Barely had the plane landed when passengers began reaching for their phones.",
        "uz": "Samolyot qo'nishi bilanoq, yo'lovchilar telefonlariga qo'l cho'zishni boshlashdi."
      },
      {
        "en": "Hardly had we left the house when it started to pour with rain.",
        "uz": "Uydan chiqishimiz bilanoq, jala quya boshladi."
      },
      {
        "en": "Scarcely had the announcement been made when the share price collapsed.",
        "uz": "E'lon qilinishi bilanoq, aksiya narxi keskin tushib ketdi."
      },
      {
        "en": "Barely had the new policy been introduced when critics began to voice their concerns.",
        "uz": "Yangi siyosat joriy etilishi bilanoq, tanqidchilar o'z xavotirlarini bildira boshlashdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Hardly the debate had begun when the alarm sounded.",
        "right": "Hardly had the debate begun when the alarm sounded.",
        "note": "Inversiyada auxiliary (had) egadan (the debate) OLDIN turishi kerak, keyin emas."
      },
      {
        "wrong": "Hardly had the debate begun than the alarm sounded.",
        "right": "Hardly had the debate begun when the alarm sounded.",
        "note": "\"Hardly\" bilan \"when\" (yoki \"before\") ishlatiladi, \"than\" emas — \"than\" \"no sooner\" bilan birga ishlatiladi."
      },
      {
        "wrong": "Hardly we had left when it started to rain.",
        "right": "Hardly had we left when it started to rain.",
        "note": "Inversiyada \"had\" \"we\"dan oldin turishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "Hardly ___ the presentation when the projector broke.",
        "options": [
          "we had started",
          "had we started",
          "we started",
          "did we started"
        ],
        "answer": 1
      },
      {
        "q": "Scarcely had she arrived ___ the meeting was cancelled.",
        "options": [
          "than",
          "when",
          "that",
          "so"
        ],
        "answer": 1
      },
      {
        "q": "Barely ___ the store when the power went out.",
        "options": [
          "had I entered",
          "I had entered",
          "did I enter",
          "I entered"
        ],
        "answer": 0
      },
      {
        "q": "Hardly had the show ___ when the lights went out.",
        "options": [
          "start",
          "started",
          "starting",
          "starts"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Hardly had the film started than everyone fell asleep.",
          "Hardly the film had started when everyone fell asleep.",
          "Hardly had the film started when everyone fell asleep.",
          "Hardly had started the film when everyone fell asleep."
        ],
        "answer": 2
      }
    ]
  },
  "no-sooner-inversion-c1": {
    "explanation": [
      "\"No sooner...than\" — \"hardly...when\" bilan bir xil ma'noni beradigan, lekin AYNAN \"than\" bilan ishlaydigan alohida inversiya strukturasi — ikki VOQEANING KETMA-KETLIGINI (birinchisi tugashi bilanoq ikkinchisi boshlangani) FORMAL va EMPHATIC tarzda ifodalaydi.",
      "Qurilishi: No sooner + had + subject + III shakl + than + ikkinchi voqea: \"No sooner had we launched than demand doubled\" (ishga tushirishimiz bilanoq, talab ikki barobar oshdi).",
      "MUHIM: \"No sooner\" faqat \"than\" bilan ishlaydi, \"when\" bilan EMAS — bu \"hardly/scarcely/barely\"dan (ular \"when/before\" bilan ishlaydi) asosiy grammatik farqi va C1 darajasidagi eng ko'p uchraydigan xato manbai.",
      "Bu struktura ikkita voqea orasidagi bog'liqlikni JUDA QISQA VAQT oralig'ida sodir bo'lgan holda ko'rsatadi va ko'pincha biznes hisobotlari, yangiliklar va rasmiy hikoyachilikda ishlatiladi, chunki u voqealar ketma-ketligini ixcham va ta'sirchan tarzda beradi."
    ],
    "examples": [
      {
        "en": "No sooner had we launched the product than demand doubled overnight.",
        "uz": "Mahsulotni ishga tushirishimiz bilanoq, talab bir kechada ikki barobar oshdi."
      },
      {
        "en": "No sooner had she finished speaking than the audience burst into applause.",
        "uz": "U gapirib bo'lishi bilanoq, tomoshabinlar qarsak chala boshladi."
      },
      {
        "en": "No sooner had the deal been signed than the company's shares began to rise.",
        "uz": "Bitim imzolanishi bilanoq, kompaniya aksiyalari ko'tarila boshladi."
      },
      {
        "en": "No sooner had he sat down than his phone rang with urgent news.",
        "uz": "U o'tirishi bilanoq, telefoni shoshilinch yangilik bilan jiringlab qoldi."
      },
      {
        "en": "No sooner had the strike ended than production returned to normal.",
        "uz": "Ish tashlash tugashi bilanoq, ishlab chiqarish odatiy holatga qaytdi."
      },
      {
        "en": "No sooner had the news broken than journalists surrounded the building.",
        "uz": "Yangilik tarqalishi bilanoq, jurnalistlar binoni o'rab olishdi."
      }
    ],
    "mistakes": [
      {
        "wrong": "No sooner had we launched the product when demand doubled.",
        "right": "No sooner had we launched the product than demand doubled.",
        "note": "\"No sooner\" faqat \"than\" bilan ishlaydi, \"when\" bilan emas."
      },
      {
        "wrong": "No sooner we had finished than they arrived.",
        "right": "No sooner had we finished than they arrived.",
        "note": "Inversiyada auxiliary (had) egadan (we) oldin turishi kerak."
      },
      {
        "wrong": "No sooner had she finish speaking than they applauded.",
        "right": "No sooner had she finished speaking than they applauded.",
        "note": "\"Had\"dan keyin fe'lning III shakli (finished) kerak, asl shakli emas."
      }
    ],
    "quiz": [
      {
        "q": "No sooner ___ the announcement than panic spread.",
        "options": [
          "had they made",
          "they had made",
          "did they make",
          "they made"
        ],
        "answer": 0
      },
      {
        "q": "No sooner had the game started ___ it began to rain.",
        "options": [
          "when",
          "than",
          "that",
          "so"
        ],
        "answer": 1
      },
      {
        "q": "No sooner had she ___ than the phone rang.",
        "options": [
          "leave",
          "left",
          "leaving",
          "leaves"
        ],
        "answer": 1
      },
      {
        "q": "No sooner had the shop opened ___ customers rushed in.",
        "options": [
          "when",
          "than",
          "so",
          "that"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "No sooner had he arrived when he left again.",
          "No sooner he had arrived than he left again.",
          "No sooner had he arrived than he left again.",
          "No sooner had arrived he than he left again."
        ],
        "answer": 2
      }
    ]
  },
  "not-only-inversion-c1": {
    "explanation": [
      "\"Not only\" gap boshiga chiqarilganda inversiya yaratadi va ikkita BOG'LIQ, BIR-BIRINI KUCHAYTIRUVCHI natijani PARALLEL tuzilma bilan ta'kidlaydi — birinchi qismga kuchli urg'u berib, keyin \"but also\" bilan ikkinchi qismni qo'shadi.",
      "Qurilishi: Not only + auxiliary + subject + verb, but (also) + ikkinchi qism: \"Not only did the policy reduce costs, but it also improved access\" (siyosat nafaqat xarajatlarni kamaytirdi, balki kirish imkoniyatini ham yaxshiladi).",
      "Agar asosiy fe'lda auxiliary bo'lmasa (oddiy Present/Past Simple), \"do/does/did\" qo'shiladi — xuddi boshqa inversiya turlaridagi kabi: \"Not only did she win the award, but she also broke the record.\"",
      "\"But also\" ikkinchi qismda odatda saqlanadi, garchi so'zlashuv uslubida \"also\" tushirilishi mumkin bo'lsa ham — rasmiy yozuvda to'liq \"but...also\" juftligi afzal ko'riladi, chunki bu strukturaning parallelligini kuchaytiradi."
    ],
    "examples": [
      {
        "en": "Not only did the new policy reduce costs, but it also improved customer access.",
        "uz": "Yangi siyosat nafaqat xarajatlarni kamaytirdi, balki mijozlar uchun kirish imkoniyatini ham yaxshiladi."
      },
      {
        "en": "Not only was the presentation informative, but it was also genuinely entertaining.",
        "uz": "Taqdimot nafaqat ma'lumotli, balki chindan ham qiziqarli edi."
      },
      {
        "en": "Not only has she published three novels, but she has also won several awards.",
        "uz": "U nafaqat uchta roman nashr ettirdi, balki bir necha mukofotlarga ham sazovor bo'ldi."
      },
      {
        "en": "Not only did the storm damage the roof, but it also flooded the basement.",
        "uz": "Bo'ron nafaqat tomga zarar yetkazdi, balki podvalni ham suv bosdi."
      },
      {
        "en": "Not only do they offer competitive salaries, but they also provide excellent training.",
        "uz": "Ular nafaqat raqobatbardosh maosh taklif qilishadi, balki a'lo darajadagi o'qitishni ham ta'minlashadi."
      },
      {
        "en": "Not only was the project delivered on time, but it also came in under budget.",
        "uz": "Loyiha nafaqat o'z vaqtida topshirildi, balki byudjetdan ham kam xarajat qildi."
      }
    ],
    "mistakes": [
      {
        "wrong": "Not only the policy reduced costs, but it also improved access.",
        "right": "Not only did the policy reduce costs, but it also improved access.",
        "note": "Inversiyada oddiy Past Simple fe'l uchun \"did\" qo'shiladi va u egadan oldin turadi."
      },
      {
        "wrong": "Not only did the policy reduced costs.",
        "right": "Not only did the policy reduce costs.",
        "note": "\"Did\"dan keyin fe'l asl shaklda bo'ladi, o'tgan zamon shakli (-ed) qo'shilmaydi."
      },
      {
        "wrong": "Not only she won the award, but also broke the record.",
        "right": "Not only did she win the award, but she also broke the record.",
        "note": "Inversiya kerak (did she win) va ikkinchi qismda ham ega (she) takrorlanishi kerak."
      }
    ],
    "quiz": [
      {
        "q": "Not only ___ the deadline, but they also exceeded expectations.",
        "options": [
          "they met",
          "did they meet",
          "met they",
          "they did meet"
        ],
        "answer": 1
      },
      {
        "q": "Not only ___ she a brilliant scientist, but she is also a talented writer.",
        "options": [
          "is",
          "does",
          "did",
          "was"
        ],
        "answer": 0
      },
      {
        "q": "Not only did the company expand abroad, but it ___ doubled its workforce.",
        "options": [
          "also",
          "so",
          "too",
          "either"
        ],
        "answer": 0
      },
      {
        "q": "Not only ___ the students pass, but they all scored above average.",
        "options": [
          "did",
          "do",
          "does",
          "had"
        ],
        "answer": 0
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Not only he arrived late, but he also forgot his notes.",
          "Not only did he arrive late, but he also forgot his notes.",
          "Not only did he arrived late, but he also forgot his notes.",
          "Not only arrived he late, but he also forgot his notes."
        ],
        "answer": 1
      }
    ]
  },
  "conditional-inversion-c1": {
    "explanation": [
      "Formal, adabiy yoki yuridik matnlarda shart gaplari \"if\"siz, INVERSIYA orqali ham tuzilishi mumkin — bu struktura \"if\"ni butunlay tushirib, auxiliary fe'lni egadan oldinga chiqaradi va gapga qat'iy, rasmiy ohang beradi.",
      "Uch asosiy turi bor, har biri boshqa shart turiga mos keladi: \"Had\" — Third Conditional uchun (\"Had I known the full cost, I would have declined\" = \"If I had known...\"); \"Were\" — Second Conditional uchun (\"Were she here, she would agree\" = \"If she were here...\"); \"Should\" — First Conditional'dagi noaniq/kam ehtimolli shart uchun (\"Should you need assistance, please contact us\" = \"If you should need...\").",
      "Bu struktura ayniqsa RASMIY XATLAR, SHARTNOMALAR va AKADEMIK/YURIDIK matnlarda ishlatiladi — kundalik so'zlashuv nutqida deyarli uchramaydi, chunki u juda rasmiy va masofali ohang beradi.",
      "Inversiya qilingan shart gapida ham natija qismi oddiy qoidaga bo'ysunadi (would/would have) — faqat \"if\" bandining o'zi o'zgaradi, natija qismi o'zgarmaydi."
    ],
    "examples": [
      {
        "en": "Had I known the full cost in advance, I would have declined the offer.",
        "uz": "Agar to'liq narxni oldindan bilganimda, taklifni rad etgan bo'lardim."
      },
      {
        "en": "Were she here today, she would certainly agree with this decision.",
        "uz": "Agar u bugun shu yerda bo'lganida, bu qarorga albatta rozi bo'lardi."
      },
      {
        "en": "Should you need any further assistance, please do not hesitate to contact us.",
        "uz": "Agar sizga qo'shimcha yordam kerak bo'lsa, biz bilan bog'lanishdan tortinmang."
      },
      {
        "en": "Had the committee acted sooner, the crisis could have been avoided.",
        "uz": "Agar qo'mita erta harakat qilganida, inqirozning oldi olinishi mumkin edi."
      },
      {
        "en": "Were the circumstances different, we might reach a different conclusion.",
        "uz": "Agar sharoit boshqacha bo'lganida, biz boshqa xulosaga kelishimiz mumkin edi."
      },
      {
        "en": "Should the situation change, we will inform all shareholders immediately.",
        "uz": "Agar vaziyat o'zgarsa, biz barcha aksiyadorlarni darhol xabardor qilamiz."
      }
    ],
    "mistakes": [
      {
        "wrong": "If I had known, I would have declined. → Had I have known, I would have declined.",
        "right": "Had I known the full cost, I would have declined.",
        "note": "Inversiyada \"had\" faqat bir marta ishlatiladi (o'zi auxiliary vazifasini bajaradi) — \"had have\" ortiqcha va noto'g'ri."
      },
      {
        "wrong": "Was she here today, she would agree.",
        "right": "Were she here today, she would agree.",
        "note": "Second Conditional inversiyasida \"was\" emas, \"were\" ishlatiladi (barcha shaxslar bilan)."
      },
      {
        "wrong": "Should you needed assistance, contact us.",
        "right": "Should you need assistance, contact us.",
        "note": "\"Should\"dan keyin fe'l asl shaklda bo'ladi (need), o'tgan zamon shaklida emas."
      }
    ],
    "quiz": [
      {
        "q": "___ I known about the delay, I would have left earlier.",
        "options": [
          "If",
          "Had",
          "Was",
          "Should"
        ],
        "answer": 1
      },
      {
        "q": "___ any problems arise, please contact our support team.",
        "options": [
          "If",
          "Had",
          "Should",
          "Were"
        ],
        "answer": 2
      },
      {
        "q": "___ he more experienced, he would have handled the crisis better.",
        "options": [
          "If",
          "Had",
          "Were",
          "Should"
        ],
        "answer": 2
      },
      {
        "q": "___ the funding been approved, the project would have started immediately.",
        "options": [
          "If",
          "Had",
          "Were",
          "Should"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "Had I have known, I would have called.",
          "Had I known, I would have called.",
          "If had I known, I would have called.",
          "Had known I, I would have called."
        ],
        "answer": 1
      }
    ]
  },
  "distancing-structures-c1": {
    "explanation": [
      "Distancing structures (masofalovchi strukturalar) muallifni o'z da'vosidan biroz \"masofalashtirish\" — ya'ni bu o'z shaxsiy, qat'iy fikri emas, balki umumiy taxmin, boshqa manba fikri yoki hali to'liq isbotlanmagan xulosa ekanini ko'rsatish uchun ishlatiladi.",
      "Eng keng tarqalgan qurilma: \"It appears/seems/is thought/is believed + that + gap\": \"It appears that the estimate was too low\" (bu — mening shaxsiy, qat'iy da'vom emas, balki hozirgi holatdan kelib chiqadigan taxmin).",
      "Bu strukturalar akademik yozuvda AYNIQSA muhim, chunki ular fikrni ILMIY EHTIYOTKORLIK bilan berish imkonini beradi — qat'iy \"this is wrong\" o'rniga \"it appears that this may be incorrect\" ancha ilmiy va bahsga ochiq ohang yaratadi.",
      "Bu qurilmalarni \"passive reporting\" (subject + is said/believed + to be) bilan chalkashtirmaslik kerak — ular o'xshash ma'noni beradi, lekin distancing structures ko'pincha \"It + verb + that\" shaklida boshlanadi, umumiyroq va shaxssizroq."
    ],
    "examples": [
      {
        "en": "It appears that the initial cost estimate was significantly too low.",
        "uz": "Shunday ko'rinadiki, dastlabki xarajat bahosi sezilarli darajada past bo'lgan."
      },
      {
        "en": "It seems that the negotiations have reached an impasse.",
        "uz": "Shunday tuyulyaptiki, muzokaralar chiqmas nuqtaga yetdi."
      },
      {
        "en": "It is thought that the ancient settlement was abandoned due to drought.",
        "uz": "Qadimiy makon qurg'oqchilik tufayli tashlab ketilgan deb o'ylanadi."
      },
      {
        "en": "It is believed that early intervention significantly improves outcomes.",
        "uz": "Erta aralashuv natijalarni sezilarli darajada yaxshilaydi deb hisoblanadi."
      },
      {
        "en": "It would seem that the original plan needs to be reconsidered.",
        "uz": "Shunday ko'rinadiki, dastlabki reja qayta ko'rib chiqilishi kerak."
      },
      {
        "en": "It is generally accepted that this approach yields more reliable results.",
        "uz": "Bu yondashuv ishonchliroq natijalar berishi umuman qabul qilingan fikr hisoblanadi."
      }
    ],
    "mistakes": [
      {
        "wrong": "It appears the estimate was too low.",
        "right": "It appears that the estimate was too low.",
        "note": "Akademik/rasmiy uslubda \"that\" odatda saqlanadi, garchi so'zlashuvda tushirilishi mumkin bo'lsa ham."
      },
      {
        "wrong": "It is thought the settlement abandoned due to drought.",
        "right": "It is thought that the settlement was abandoned due to drought.",
        "note": "Passiv gap uchun \"was abandoned\" kerak, \"abandoned\" yolg'iz yetarli emas."
      },
      {
        "wrong": "It seem that the negotiations have failed.",
        "right": "It seems that the negotiations have failed.",
        "note": "\"It\" bilan fe'lga -s qo'shiladi (seems), oddiy fe'l kelishuvi qoidasi."
      }
    ],
    "quiz": [
      {
        "q": "It ___ that the report contains several factual errors.",
        "options": [
          "appear",
          "appears",
          "appearing",
          "appeared to"
        ],
        "answer": 1
      },
      {
        "q": "It is generally ___ that regular exercise improves mental health.",
        "options": [
          "believe",
          "believing",
          "believed",
          "believes"
        ],
        "answer": 2
      },
      {
        "q": "It would ___ that our initial assumptions were incorrect.",
        "options": [
          "seem",
          "seems",
          "seeming",
          "seemed to"
        ],
        "answer": 0
      },
      {
        "q": "It is ___ that the policy will be revised next year.",
        "options": [
          "think",
          "thinking",
          "thought",
          "thinks"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "It appear that the results were flawed.",
          "It appears the results were flawed.",
          "It appears that the results were flawed.",
          "It is appears that the results were flawed."
        ],
        "answer": 2
      }
    ]
  },
  "pseudo-clefts-c1": {
    "explanation": [
      "Pseudo-cleft sentence (\"What + clause + be + focused element\") oddiy cleft sentence (\"It is...that\")dan farqli o'laroq \"what\" bilan boshlanadi va gapning MUHIM QISMINI oxiriga, kuchli FOCUS pozitsiyasiga olib boradi.",
      "Qurilishi: What + subject + verb + be + urg'ulanayotgan element: \"What the team needs is clearer guidance\" (jamoaga kerak bo'lgan narsa — bu, va bu qism eng oxirida, eng kuchli urg'u bilan keladi).",
      "Bu struktura ayniqsa YANGI yoki KONTRASTIV ma'lumotni ta'kidlashda kuchli — u tinglovchi/o'quvchining diqqatini oxirgi, eng muhim qismga qaratadi, xuddi jumla \"...va bu ayni narsa muhim\" deb baqirayotgandek: \"What surprised me most was how quickly things changed\" (eng ko'p taassurot qoldirgan narsa — TEZLIK, boshqa hech narsa emas).",
      "Pseudo-cleft yozma va nutqiy uslubda tez-tez ishlatiladi, chunki u tabiiy ravishda kuchli urg'u yaratadi, hech qanday sun'iy \"emphasis\" so'zisiz — bu diskurs strukturasini boshqarishning nafis usuli hisoblanadi."
    ],
    "examples": [
      {
        "en": "What the team needs most right now is clearer, more consistent guidance.",
        "uz": "Jamoaga hozir eng kerak bo'lgan narsa — aniqroq, izchilroq yo'l-yo'riq."
      },
      {
        "en": "What surprised me most was how quickly the situation changed.",
        "uz": "Meni eng ko'p hayratga solgan narsa — vaziyat qanchalik tez o'zgargani."
      },
      {
        "en": "What we really need to focus on is customer retention, not acquisition.",
        "uz": "Biz haqiqatan ham e'tibor qaratishimiz kerak bo'lgan narsa — mijozlarni saqlab qolish, yangilarini jalb qilish emas."
      },
      {
        "en": "What impressed the investors most was the founder's clear long-term vision.",
        "uz": "Investorlarni eng ko'p taassurot qoldirgan narsa — asoschining aniq uzoq muddatli qarashi edi."
      },
      {
        "en": "What matters here is not who is right, but what actually works.",
        "uz": "Bu yerda muhimi — kim to'g'ri ekani emas, balki nima haqiqatan ishlashi."
      },
      {
        "en": "What she wants more than anything is to be taken seriously.",
        "uz": "U hamma narsadan ko'proq xohlaydigan narsa — jiddiy qabul qilinish."
      }
    ],
    "mistakes": [
      {
        "wrong": "What the team needs it is clearer guidance.",
        "right": "What the team needs is clearer guidance.",
        "note": "Fronted \"what\"-clause'dan keyin qo'shimcha \"it\" kerak emas, to'g'ridan-to'g'ri \"is\" keladi."
      },
      {
        "wrong": "What surprised me most it was the speed of change.",
        "right": "What surprised me most was the speed of change.",
        "note": "\"What\"-clause'dan keyin qo'shimcha \"it\" tushirib qoldiriladi."
      },
      {
        "wrong": "What we need focus on is retention.",
        "right": "What we need to focus on is retention.",
        "note": "\"Need\"dan keyin \"to\" tushirib qoldirilmaydi."
      }
    ],
    "quiz": [
      {
        "q": "What this company lacks most ___ a clear long-term strategy.",
        "options": [
          "it is",
          "is",
          "is it",
          "was it"
        ],
        "answer": 1
      },
      {
        "q": "What really matters ___ the quality of the work, not the quantity.",
        "options": [
          "it is",
          "is",
          "is it",
          "are"
        ],
        "answer": 1
      },
      {
        "q": "What surprised everyone ___ how calm she remained under pressure.",
        "options": [
          "it was",
          "was",
          "was it",
          "were"
        ],
        "answer": 1
      },
      {
        "q": "What we should ___ on is long-term sustainability.",
        "options": [
          "focusing",
          "focus",
          "focused",
          "focuses"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap TO'G'RI?",
        "options": [
          "What he wants it is more responsibility.",
          "What he wants is more responsibility.",
          "What wants he is more responsibility.",
          "Is what he wants more responsibility."
        ],
        "answer": 1
      }
    ]
  },
  "formal-informal-choices-c1": {
    "explanation": [
      "C1 darajasida grammatik jihatdan to'g'ri bo'lgan bir nechta struktura orasidan AUDITORIYA va JANRGA (formal yozuv, norasmiy suhbat, akademik matn) mos kelganini ONGLI RAVISHDA tanlash ko'nikmasi rivojlanadi — bu allaqachon o'rganilgan grammatikani yangi nuqtai nazardan qo'llash.",
      "Formal registrda: passiv struktura, nominal (ot asosidagi) gaplar, \"that\"-bandidagi subjunctive (\"requested that the figures be revised\" — \"be\", \"are\" emas), murakkab bog'lovchilar (\"whereas\", \"given that\"), phrasal verb o'rniga lotin asosidagi bitta so'z (\"investigate\" o'rniga \"look into\" emas).",
      "Norasmiy/kundalik registrda: aktiv struktura, qisqartma shakllar (don't, can't), phrasal verblar (\"look into\", \"figure out\"), oddiy bog'lovchilar (\"but\", \"so\"), shaxsiy olmoshlar (I, you, we).",
      "Bu tanlov ko'pincha bitta gapning IKKI XIL YOZILISHI orqali ko'rinadi: \"The committee requested that the figures be revised\" (formal) = \"The committee asked us to revise the figures\" (neytral/norasmiy) — ikkalasi ham grammatik jihatdan to'g'ri, lekin kontekstga qarab biri boshqasidan afzalroq."
    ],
    "examples": [
      {
        "en": "The committee requested that the figures be revised before the final submission.",
        "uz": "Qo'mita raqamlar yakuniy topshirishdan oldin qayta ko'rib chiqilishini so'radi."
      },
      {
        "en": "Could you look into this issue and let me know what you find? (informal)",
        "uz": "Bu masalani tekshirib, nima topganingizni menga aytib bera olasizmi? (norasmiy)"
      },
      {
        "en": "We would be grateful if you could investigate this matter at your earliest convenience. (formal)",
        "uz": "Iloji boricha tezroq bu masalani tekshirib chiqsangiz, minnatdor bo'lardik. (rasmiy)"
      },
      {
        "en": "It is recommended that all staff attend the training session. (formal)",
        "uz": "Barcha xodimlarga o'quv mashg'ulotida qatnashish tavsiya etiladi. (rasmiy)"
      },
      {
        "en": "Can everyone come to the training on Friday? (informal)",
        "uz": "Hamma jumaga o'quv mashg'ulotiga kela oladimi? (norasmiy)"
      },
      {
        "en": "Given the current circumstances, a revised timeline is necessary. (formal)",
        "uz": "Hozirgi sharoitni hisobga olib, qayta ko'rib chiqilgan jadval zarur. (rasmiy)"
      }
    ],
    "mistakes": [
      {
        "wrong": "The committee requested that the figures are revised. (formal context)",
        "right": "The committee requested that the figures be revised.",
        "note": "Rasmiy \"request that\" strukturasida subjunctive \"be\" ishlatiladi, oddiy \"are\" emas."
      },
      {
        "wrong": "We would be grateful if you could look into this ASAP. (yuqori darajadagi rasmiy xatda)",
        "right": "We would be grateful if you could investigate this matter at your earliest convenience.",
        "note": "Juda rasmiy kontekstda norasmiy phrasal verb (look into) va qisqartma (ASAP) o'rniga rasmiy muqobil (investigate) tanlash kerak."
      },
      {
        "wrong": "Could you please figure out this issue? (rasmiy hisobotda)",
        "right": "Could you please determine the cause of this issue?",
        "note": "Rasmiy hisobotlarda norasmiy phrasal verb (figure out) o'rniga formal muqobil (determine) afzal ko'riladi."
      }
    ],
    "quiz": [
      {
        "q": "Formal xatda qaysi variant tabiiyroq?",
        "options": [
          "Can you sort this out?",
          "Could you please resolve this matter?",
          "Fix this, please?",
          "Can you deal with this?"
        ],
        "answer": 1
      },
      {
        "q": "The board insisted that the report ___ before publication.",
        "options": [
          "is reviewed",
          "be reviewed",
          "was reviewed",
          "reviews"
        ],
        "answer": 1
      },
      {
        "q": "Norasmiy suhbatda qaysi variant tabiiyroq?",
        "options": [
          "I would be grateful if you could assist.",
          "Could you help me out?",
          "I request your assistance.",
          "Your assistance would be appreciated."
        ],
        "answer": 1
      },
      {
        "q": "Rasmiy hisobotda qaysi so'z afzal?",
        "options": [
          "look into",
          "check out",
          "investigate",
          "figure out"
        ],
        "answer": 2
      },
      {
        "q": "Qaysi gap RASMIY registrga mos?",
        "options": [
          "We need to sort out this problem ASAP.",
          "It is essential that this matter be addressed promptly.",
          "Can we fix this soon?",
          "Let's deal with this quickly."
        ],
        "answer": 1
      }
    ]
  },
  "information-structure-c1": {
    "explanation": [
      "Information structure (axborot strukturasi) — gapda MA'LUM (given) ma'lumotni oldinga, YANGI (new) ma'lumotni esa gap oxiriga, kuchli \"end focus\" pozitsiyasiga joylashtirish printsipi. Bu ingliz tilida matn oqimini tabiiy va tushunarli qiladigan asosiy uslubiy qonuniyat.",
      "Odatda ingliz tilida gap OLDINGI GAPDAN MA'LUM bo'lgan narsadan boshlanadi (mavzu, subject), so'ngra YANGI ma'lumot bilan tugaydi: \"We hired a new manager last month. The manager has already improved team morale\" — ikkinchi gapda \"the manager\" (ma'lum) oldin, \"improved team morale\" (yangi) oxirida.",
      "Pseudo-cleft va passiv struktura ko'pincha aynan shu maqsadda — yangi ma'lumotni oxiriga surish uchun — ishlatiladi: \"What changed the outcome was a late piece of evidence\" (\"the outcome\" — allaqachon ma'lum mavzu, \"a late piece of evidence\" — yangi, muhim ma'lumot, oxirida).",
      "Bu printsipni buzish (yangi ma'lumotni gap boshiga qo'yish) gapni grammatik jihatdan to'g'ri, lekin USLUBIY jihatdan noqulay va tushunish qiyin qiladi — bu C1 darajasida matn izchilligini (coherence) yaxshilashning muhim vositasi."
    ],
    "examples": [
      {
        "en": "What changed the final outcome was a late piece of evidence submitted the night before.",
        "uz": "Yakuniy natijani o'zgartirgan narsa — kechasi topshirilgan kech dalil edi."
      },
      {
        "en": "We interviewed five candidates. The strongest candidate had ten years of relevant experience.",
        "uz": "Biz beshta nomzod bilan suhbatlashdik. Eng kuchli nomzod o'nyillik tegishli tajribaga ega edi."
      },
      {
        "en": "The report was published last week. In it, several surprising findings were revealed.",
        "uz": "Hisobot o'tgan hafta nashr etildi. Unda bir necha ajablanarli topilmalar ochib berildi."
      },
      {
        "en": "What eventually convinced the board was the sheer weight of the financial evidence.",
        "uz": "Kengashni oxir-oqibat ishontirgan narsa — moliyaviy dalillarning katta og'irligi edi."
      },
      {
        "en": "The new system was introduced in March. Since then, productivity has increased by twenty percent.",
        "uz": "Yangi tizim martda joriy etildi. O'shandan beri unumdorlik yigirma foizga oshdi."
      },
      {
        "en": "What made the difference in the end was careful preparation, not luck.",
        "uz": "Oxir-oqibat farq qiluvchi narsa — omad emas, balki puxta tayyorgarlik edi."
      }
    ],
    "mistakes": [
      {
        "wrong": "A late piece of evidence changed what the outcome. (yangi ma'lumot noqulay joylashtirilgan)",
        "right": "What changed the outcome was a late piece of evidence.",
        "note": "Yangi, muhim ma'lumot (dalil) gap oxiriga, kuchli focus pozitsiyasiga qo'yilishi kerak — pseudo-cleft bu maqsadga xizmat qiladi."
      },
      {
        "wrong": "Ten years of relevant experience the strongest candidate had.",
        "right": "The strongest candidate had ten years of relevant experience.",
        "note": "Ma'lum mavzu (nomzod) gap boshida, yangi ma'lumot (tajriba) oxirida bo'lishi tabiiy ingliz tili tartibiga mos keladi."
      },
      {
        "wrong": "Careful preparation, not luck, what made the difference.",
        "right": "What made the difference was careful preparation, not luck.",
        "note": "Pseudo-cleft to'g'ri qurilishi kerak — \"what\"-clause avval, keyin \"was\", keyin urg'ulanayotgan yangi ma'lumot."
      }
    ],
    "quiz": [
      {
        "q": "We reviewed the proposal carefully. ___ several issues were identified.",
        "options": [
          "In it",
          "It in",
          "There in",
          "In there"
        ],
        "answer": 0
      },
      {
        "q": "What ultimately ___ was the strength of the evidence, not the number of witnesses.",
        "options": [
          "it mattered",
          "mattered",
          "was mattering",
          "matters it"
        ],
        "answer": 1
      },
      {
        "q": "The company launched a new app last year. ___ has attracted over a million users.",
        "options": [
          "It",
          "The app",
          "There",
          "This the app"
        ],
        "answer": 1
      },
      {
        "q": "What persuaded the jury ___ the defendant's calm, consistent testimony.",
        "options": [
          "it was",
          "was",
          "was it",
          "were"
        ],
        "answer": 1
      },
      {
        "q": "Qaysi gap axborot strukturasi jihatidan TABIIYROQ?",
        "options": [
          "A brilliant strategy the team's success explains.",
          "The team's success is explained by a brilliant strategy.",
          "By a brilliant strategy is the team's success explained.",
          "Explains the team's success a brilliant strategy."
        ],
        "answer": 1
      }
    ]
  }
};
