"""Build the sixth reviewed phrasal-verb and idiom batch.

The source entries below are maintained in the repository. The only remote
operation translates their teaching examples into Russian through Google
Translate; no user data is read or transmitted. Phrasal-verb examples use the
English source, while idioms use the meaning-first Uzbek source to avoid
literal idiom translations.
"""
from __future__ import annotations

import csv
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "phrasal_idioms_6.csv"
EXAMPLES_OUTPUT = DATA_DIR / "examples_phrasal_idioms_6.csv"
PHRASAL_EXPRESSIONS = DATA_DIR / "expressions" / "phrasal_verbs.jsonl"
IDIOM_EXPRESSIONS = DATA_DIR / "expressions" / "everyday_idioms.jsonl"
CACHE_PATH = DATA_DIR / "phrasal_idioms_6_ru_cache.json"

CORPUS_FIELDS = [
    "headword", "pos", "cefr_level", "translation_uz", "translation_ru",
    "definition_en", "ipa", "frequency_rank", "category", "example_en",
    "example_uz", "example_ru", "synonyms", "antonyms", "word_family",
    "common_mistake",
]
EXAMPLE_FIELDS = ["headword", "pos", "example_en", "example_uz", "example_ru"]


@dataclass(frozen=True)
class Entry:
    headword: str
    kind: str
    level: str
    uzbek: str
    russian: str
    definition: str
    pattern: str
    examples: tuple[tuple[str, str], tuple[str, str], tuple[str, str]]
    synonyms: tuple[str, ...] = ()


PHRASAL = [
    Entry("crack down on", "phrasal", "B2", "qat'iy choralar ko'rmoq", "жёстко пресекать",
          "To take strong action to stop illegal or unacceptable activity.", "crack down on + noun/gerund", (
              ("The city is cracking down on illegal parking.", "Shahar noqonuniy mashina qo'yishga qarshi qat'iy choralar ko'rmoqda."),
              ("Schools should crack down on online bullying.", "Maktablar internetdagi bezorilikka qarshi qat'iy choralar ko'rishi kerak."),
              ("The regulator cracked down on misleading adverts.", "Nazorat organi chalg'ituvchi reklamalarga qarshi keskin chora ko'rdi.")), ("suppress", "take action against")),
    Entry("opt out of", "phrasal", "B2", "qatnashmaslikni tanlamoq", "отказаться от участия",
          "To choose not to participate in an arrangement or activity.", "opt out of + noun/gerund", (
              ("Employees can opt out of the pension scheme.", "Xodimlar pensiya dasturida qatnashmaslikni tanlashi mumkin."),
              ("She opted out of sharing her location.", "U joylashuvini ulashmaslikni tanladi."),
              ("You may opt out of promotional emails at any time.", "Istalgan paytda reklama xatlaridan voz kechishingiz mumkin.")), ("withdraw from", "decline")),
    Entry("boil down to", "phrasal", "B2", "mohiyatan bir narsaga borib taqalmoq", "сводиться к",
          "To have one main cause, meaning, or deciding factor.", "something + boil down to + noun/gerund", (
              ("The decision boils down to cost and quality.", "Qaror mohiyatan narx va sifatga borib taqaladi."),
              ("Good pronunciation boils down to regular practice.", "Yaxshi talaffuz muntazam mashqqa borib taqaladi."),
              ("Their disagreement boiled down to a lack of trust.", "Ularning kelishmovchiligi ishonch yetishmasligiga borib taqaldi.")), ("come down to", "depend on")),
    Entry("fill in for", "phrasal", "B2", "vaqtincha o'rnini bosmoq", "временно заменить",
          "To do another person's job while they are absent.", "fill in for + person", (
              ("Maya will fill in for the manager tomorrow.", "Maya ertaga menejerning o'rnini vaqtincha bosadi."),
              ("Can you fill in for me during the afternoon class?", "Tushdan keyingi darsda mening o'rnimni bosib tura olasizmi?"),
              ("A guest presenter filled in for the sick host.", "Kasal boshlovchining o'rnini mehmon taqdimotchi bosdi.")), ("substitute for", "cover for")),
    Entry("get around to", "phrasal", "B2", "nihoyat vaqt topib qilmoq", "наконец найти время",
          "To finally do something that has been delayed.", "get around to + noun/gerund", (
              ("I finally got around to updating my CV.", "Nihoyat rezyumeyimni yangilashga vaqt topdim."),
              ("Have you got around to reading that report?", "O'sha hisobotni o'qishga vaqt topdingizmi?"),
              ("We never got around to discussing the budget.", "Biz budjetni muhokama qilishga hech vaqt topa olmadik.")), ("find time for", "eventually do")),
    Entry("go through with", "phrasal", "B2", "oxirigacha amalga oshirmoq", "довести до конца",
          "To complete a difficult plan or decision despite doubts.", "go through with + noun", (
              ("They went through with the move despite the risks.", "Ular xavflarga qaramay ko'chishni oxirigacha amalga oshirdi."),
              ("She was nervous but went through with the presentation.", "U hayajonlangan bo'lsa-da, taqdimotni oxirigacha o'tkazdi."),
              ("I cannot believe he went through with the deal.", "U bitimni amalga oshirganiga ishonolmayapman.")), ("carry out", "complete")),
    Entry("keep at", "phrasal", "B2", "qat'iyat bilan davom ettirmoq", "упорно продолжать",
          "To continue working on something despite difficulty.", "keep at + noun/pronoun", (
              ("Keep at the exercises and they will become easier.", "Mashqlarni qat'iyat bilan davom ettiring, ular osonlashadi."),
              ("She kept at it until the code finally worked.", "Kod nihoyat ishlaguncha u ishni davom ettirdi."),
              ("If you keep at your speaking practice, you will improve.", "Gapirish mashqini davom ettirsangiz, yaxshilanasiz.")), ("persist with", "stick with")),
    Entry("pull off", "phrasal", "B2", "qiyin ishni muvaffaqiyatli uddalamoq", "успешно осуществить",
          "To succeed in doing something difficult or unexpected.", "pull off + noun/pronoun", (
              ("The small team pulled off an impressive launch.", "Kichik jamoa ta'sirli taqdimotni muvaffaqiyatli uddaladi."),
              ("Nobody expected her to pull off the victory.", "Hech kim uning g'alabani qo'lga kiritishini kutmagan edi."),
              ("We pulled it off with only a day to prepare.", "Atigi bir kun tayyorgarlik bilan ham buni uddaladik.")), ("accomplish", "succeed in")),
    Entry("put down to", "phrasal", "B2", "sababini bir narsa deb bilmoq", "объяснять чем-либо",
          "To explain something as being caused by a particular factor.", "put + noun/pronoun + down to + cause", (
              ("I put the mistake down to tiredness.", "Men xatoning sababini charchoq deb bildim."),
              ("Doctors put his recovery down to regular exercise.", "Shifokorlar uning tuzalishini muntazam mashq bilan izohladi."),
              ("She puts her success down to patient teachers.", "U muvaffaqiyatining sababini sabrli ustozlar deb biladi.")), ("attribute to", "explain by")),
    Entry("stand for", "phrasal", "B1", "anglatmoq yoki himoya qilmoq", "означать или выступать за",
          "To represent a meaning, principle, or belief.", "stand for + noun", (
              ("What does the abbreviation CEFR stand for?", "CEFR qisqartmasi nimani anglatadi?"),
              ("This organisation stands for equal access to education.", "Bu tashkilot ta'limdan teng foydalanish huquqini himoya qiladi."),
              ("Our brand stands for simplicity and trust.", "Brendimiz soddalik va ishonchni ifodalaydi.")), ("represent", "mean")),
    Entry("wind down", "phrasal", "B2", "asta-sekin yakunlamoq yoki tinchlanmoq", "постепенно завершать или расслабляться",
          "To gradually finish an activity or become relaxed.", "wind down / wind + noun + down", (
              ("The meeting began to wind down after lunch.", "Tushlikdan keyin yig'ilish asta-sekin yakunlana boshladi."),
              ("I read for twenty minutes to wind down before bed.", "Uxlashdan oldin tinchlanish uchun yigirma daqiqa kitob o'qiyman."),
              ("The company is winding down the old service.", "Kompaniya eski xizmatni bosqichma-bosqich yopmoqda.")), ("relax", "phase out")),
    Entry("wean off", "phrasal", "C1", "asta-sekin odatdan voz kechirmoq", "постепенно отучать от",
          "To gradually make someone stop depending on or using something.", "wean + person/pronoun + off + noun", (
              ("The doctor helped him wean himself off sleeping pills.", "Shifokor unga uyqu dorilaridan asta-sekin voz kechishga yordam berdi."),
              ("We are trying to wean the team off paper reports.", "Jamoani qog'oz hisobotlardan asta-sekin voz kechirishga harakat qilyapmiz."),
              ("She weaned herself off sugary drinks.", "U shirin ichimliklardan asta-sekin voz kechdi.")), ("reduce dependence on", "phase out")),
    Entry("ward off", "phrasal", "C1", "oldini olmoq yoki daf qilmoq", "предотвращать или отражать",
          "To prevent something harmful from affecting you.", "ward off + noun", (
              ("Regular sleep can help ward off illness.", "Muntazam uyqu kasallikning oldini olishga yordam beradi."),
              ("The company cut costs to ward off bankruptcy.", "Kompaniya bankrotlikni oldini olish uchun xarajatlarni qisqartirdi."),
              ("She wore a thick coat to ward off the cold.", "U sovuqni daf qilish uchun qalin palto kiydi.")), ("prevent", "repel")),
    Entry("vouch for", "phrasal", "C1", "ishonchliligini kafolatlamoq", "поручиться за",
          "To state that someone or something is reliable or truthful.", "vouch for + person/thing", (
              ("I can vouch for her honesty and experience.", "Men uning halolligi va tajribasiga kafolat bera olaman."),
              ("Several clients vouched for the quality of the service.", "Bir nechta mijoz xizmat sifatini tasdiqladi."),
              ("Who can vouch for the accuracy of these figures?", "Bu raqamlarning aniqligiga kim kafolat bera oladi?")), ("guarantee", "endorse")),
    Entry("track down", "phrasal", "B2", "izlab topmoq", "разыскать",
          "To find someone or something after a careful search.", "track down + noun/pronoun", (
              ("The reporter tracked down the original source.", "Muxbir asl manbani izlab topdi."),
              ("It took me an hour to track down the error.", "Xatoni topishimga bir soat ketdi."),
              ("Police tracked the missing car down within a day.", "Politsiya yo'qolgan mashinani bir kun ichida topdi.")), ("locate", "find")),
    Entry("think through", "phrasal", "B2", "har tomonlama o'ylab chiqmoq", "тщательно продумать",
          "To consider every part and consequence of something carefully.", "think through + noun/pronoun", (
              ("We need to think through the long-term effects.", "Uzoq muddatli ta'sirlarni har tomonlama o'ylab chiqishimiz kerak."),
              ("She thought the plan through before replying.", "U javob berishdan oldin rejani yaxshilab o'ylab chiqdi."),
              ("Think through what you want to say in the interview.", "Suhbatda nima demoqchi ekaningizni yaxshilab o'ylab chiqing.")), ("consider carefully", "reason out")),
    Entry("shore up", "phrasal", "C1", "mustahkamlamoq yoki qo'llab-quvvatlamoq", "укрепить или поддержать",
          "To strengthen or support something that is weak.", "shore up + noun", (
              ("The new policy aims to shore up public confidence.", "Yangi siyosat jamoatchilik ishonchini mustahkamlashni maqsad qiladi."),
              ("They raised funds to shore up the struggling business.", "Ular qiynalayotgan biznesni qo'llab-quvvatlash uchun mablag' yig'di."),
              ("Extra examples will shore up your argument.", "Qo'shimcha misollar dalilingizni mustahkamlaydi.")), ("strengthen", "reinforce")),
    Entry("shake off", "phrasal", "B2", "qutulmoq yoki ortda qoldirmoq", "избавиться от",
          "To get rid of an illness, feeling, or unwanted follower.", "shake off + noun", (
              ("I cannot shake off this feeling of doubt.", "Bu shubha hissidan qutula olmayapman."),
              ("She took a short walk to shake off her tiredness.", "U charchoqni chiqarish uchun qisqa sayr qildi."),
              ("The team shook off its slow start and won.", "Jamoa sust boshlanishni ortda qoldirib, g'alaba qozondi.")), ("get rid of", "overcome")),
    Entry("see through", "phrasal", "B2", "aldovni tushunib yetmoq", "раскусить обман",
          "To recognise that someone is trying to deceive you.", "see through + person/plan", (
              ("She saw through his excuse immediately.", "U uning bahonasini darhol yolg'on ekanini tushundi."),
              ("Customers can see through dishonest advertising.", "Mijozlar insofsiz reklamani tezda anglab oladi."),
              ("I saw through the trick before it was too late.", "Kech bo'lishidan oldin hiylani tushunib yetdim.")), ("detect", "recognise")),
    Entry("roll out", "phrasal", "B2", "yangi mahsulot yoki tizimni joriy etmoq", "внедрить или запустить",
          "To introduce a new product, service, or system in stages.", "roll out + noun", (
              ("The bank will roll out its new app next month.", "Bank yangi ilovasini kelasi oy ishga tushiradi."),
              ("The training programme was rolled out nationwide.", "O'quv dasturi butun mamlakat bo'ylab joriy etildi."),
              ("We are rolling out the feature to a small group first.", "Funksiyani avval kichik guruh uchun ishga tushiryapmiz.")), ("launch", "introduce")),
]

IDIOMS = [
    Entry("add insult to injury", "idioms", "B2", "ustiga-ustak vaziyatni battar qilmoq", "усугубить обиду",
          "To make an already bad situation even worse.", "add insult to injury", (
              ("The flight was cancelled, and to add insult to injury, our luggage was lost.", "Parvoz bekor qilindi, ustiga-ustak yukimiz ham yo'qoldi."),
              ("He missed the deadline and then blamed me, adding insult to injury.", "U muddatni o'tkazib yubordi, keyin meni ayblab vaziyatni battar qildi."),
              ("The fee increased and, to add insult to injury, the service got worse.", "To'lov oshdi, ustiga-ustak xizmat ham yomonlashdi.")), ("make matters worse",)),
    Entry("sit on the fence", "idioms", "B2", "aniq qaror qilmay ikkilanib turmoq", "занимать нейтральную позицию",
          "To avoid choosing between two sides or options.", "sit on the fence about/over + noun", (
              ("You cannot sit on the fence forever; choose a course.", "Doim ikkilanib turolmaysiz, bir kursni tanlang."),
              ("Several voters are still sitting on the fence.", "Bir nechta saylovchi hali ham aniq qaror qilmagan."),
              ("She sat on the fence until both offers expired.", "Ikkala taklif muddati tugaguncha u ikkilanib yurdi.")), ("remain undecided",)),
    Entry("the best of both worlds", "idioms", "B2", "ikki tomonning ham eng yaxshi jihatlari", "лучшее из двух миров",
          "A situation that combines the advantages of two different options.", "have/get the best of both worlds", (
              ("Remote work gives her the best of both worlds: flexibility and teamwork.", "Masofaviy ish unga moslashuvchanlik va jamoaviy ishning eng yaxshi tomonlarini beradi."),
              ("This town offers the best of both worlds, nature and city life.", "Bu shaharcha tabiat va shahar hayotining eng yaxshi jihatlarini birlashtiradi."),
              ("The hybrid course gives students the best of both worlds.", "Aralash kurs talabalarga ikkala usulning ham afzalliklarini beradi.")), ("ideal combination",)),
    Entry("wrap your head around", "idioms", "B2", "murakkab narsani tushunib yetmoq", "осмыслить",
          "To manage to understand a difficult or surprising idea.", "wrap your head around + noun/wh-clause", (
              ("It took me a while to wrap my head around the new system.", "Yangi tizimni tushunib olishimga biroz vaqt ketdi."),
              ("I cannot wrap my head around why they rejected the offer.", "Nega ular taklifni rad etganini tushuna olmayapman."),
              ("The diagram helps learners wrap their heads around the process.", "Diagramma o'quvchilarga jarayonni tushunishga yordam beradi.")), ("understand", "grasp")),
    Entry("burn your bridges", "idioms", "C1", "ortga qaytish yo'lini yopmoq", "сжечь мосты",
          "To damage a relationship or option so badly that you cannot return to it.", "burn your bridges with + person/organisation", (
              ("Do not burn your bridges when you leave a job.", "Ishdan ketayotganda ortga qaytish yo'lini yopmang."),
              ("His angry email burned his bridges with the client.", "Uning jahldor xati mijoz bilan aloqani butunlay buzdi."),
              ("She changed careers without burning her bridges.", "U eski aloqalarini buzmasdan kasbini o'zgartirdi.")), ("cut ties",)),
    Entry("cross that bridge when we come to it", "idioms", "B2", "muammo kelganda hal qilamiz", "решим проблему, когда она возникнет",
          "Used to postpone worrying about a possible future problem until it happens.", "we'll cross that bridge when we come to it", (
              ("What if demand doubles? We will cross that bridge when we come to it.", "Talab ikki baravar oshsa-chi? Bu muammoni kelganda hal qilamiz."),
              ("Do not worry about the final interview yet; cross that bridge when you come to it.", "Yakuniy suhbat haqida hozir tashvishlanmang, vaqti kelganda hal qilasiz."),
              ("Funding may become an issue, but we will cross that bridge later.", "Mablag' muammoga aylanishi mumkin, lekin uni keyin hal qilamiz.")), ("deal with it later",)),
    Entry("a grey area", "idioms", "B2", "aniq qoida bo'lmagan noaniq masala", "серая зона",
          "A situation where the rules or the difference between right and wrong are unclear.", "be/remain a grey area", (
              ("The use of personal devices at work remains a grey area.", "Ishda shaxsiy qurilmalardan foydalanish hali ham aniq qoidasi yo'q masala."),
              ("This case falls into a legal grey area.", "Bu holat huquqiy jihatdan noaniq sohaga kiradi."),
              ("Online privacy is a grey area for many users.", "Onlayn maxfiylik ko'p foydalanuvchilar uchun noaniq masala.")), ("unclear case", "ambiguous area")),
    Entry("get a taste of your own medicine", "idioms", "C1", "o'zing qilgan yomon munosabatni o'zing ko'rmoq", "испытать на себе собственное отношение",
          "To experience the same unpleasant treatment that you gave others.", "get a taste of your own medicine", (
              ("The bully finally got a taste of his own medicine.", "Bezorining o'zi nihoyat boshqalarga qilgan munosabatni ko'rdi."),
              ("After weeks of interrupting us, she got a taste of her own medicine.", "Haftalab gapimizni bo'lgach, u ham xuddi shunday munosabatni ko'rdi."),
              ("He laughed when his rival got a taste of his own medicine.", "Raqibi o'z qilmishiga yarasha javob olganida u kuldi.")), ("receive the same treatment",)),
    Entry("go back to the drawing board", "idioms", "B2", "rejani boshidan qayta tuzmoq", "вернуться к разработке с нуля",
          "To start planning again because the first attempt failed.", "go back to the drawing board", (
              ("The prototype failed, so we went back to the drawing board.", "Prototip ishlamadi, shuning uchun rejani boshidan qayta tuzdik."),
              ("If users dislike the design, it is back to the drawing board.", "Foydalanuvchilarga dizayn yoqmasa, uni boshidan qayta ishlaymiz."),
              ("The rejected proposal sent the team back to the drawing board.", "Rad etilgan taklif jamoani rejani qayta tuzishga majbur qildi.")), ("start again", "rethink")),
    Entry("keep something under your hat", "idioms", "B2", "bir narsani sir saqlamoq", "держать что-либо в секрете",
          "To keep information secret and not tell anyone.", "keep + noun + under your hat", (
              ("Keep the launch date under your hat for now.", "Hozircha ishga tushirish sanasini sir saqlang."),
              ("She told me the news but asked me to keep it under my hat.", "U menga yangilikni aytdi, lekin uni sir saqlashimni so'radi."),
              ("Can you keep this idea under your hat until Monday?", "Bu g'oyani dushanbagacha sir saqlay olasizmi?")), ("keep secret",)),
    Entry("put all your eggs in one basket", "idioms", "B2", "hamma imkoniyatni bitta variantga bog'lamoq", "положить все яйца в одну корзину",
          "To risk everything by depending on only one plan or investment.", "put all your eggs in one basket", (
              ("Do not put all your eggs in one basket; apply to several universities.", "Hamma umidingizni bitta joyga bog'lamang, bir nechta universitetga topshiring."),
              ("The company put all its eggs in one basket with a single product.", "Kompaniya barcha imkoniyatini bitta mahsulotga bog'ladi."),
              ("Diversifying prevents you from putting all your eggs in one basket.", "Turli yo'nalishlarga ajratish hamma imkoniyatni bitta variantga bog'lashdan saqlaydi.")), ("risk everything on one option",)),
    Entry("water under the bridge", "idioms", "B2", "o'tib ketgan va endi ahamiyatsiz voqea", "дело прошлое",
          "A past problem that is no longer important or worth arguing about.", "be water under the bridge", (
              ("We disagreed last year, but it is water under the bridge now.", "O'tgan yili kelishmagandik, lekin hozir bu o'tib ketgan gap."),
              ("The old mistake is water under the bridge.", "Eski xato endi ahamiyatsiz o'tmishdagi voqea."),
              ("Let us treat the argument as water under the bridge.", "Keling, janjalni o'tib ketgan gap deb hisoblaylik.")), ("a thing of the past",)),
    Entry("your guess is as good as mine", "idioms", "B2", "men ham sizdan ortiq bilmayman", "я знаю не больше вашего",
          "Used to say that you do not know the answer either.", "your guess is as good as mine", (
              ("When will the server return? Your guess is as good as mine.", "Server qachon ishlaydi? Men ham sizdan ortiq bilmayman."),
              ("Why did they cancel it? Your guess is as good as mine.", "Nega uni bekor qilishdi? Men ham bilmayman."),
              ("Your guess is as good as mine about the final price.", "Yakuniy narx haqida men ham sizdan ortiq bilmayman.")), ("I have no idea",)),
    Entry("have your back against the wall", "idioms", "C1", "juda qiyin va tanlovsiz vaziyatda qolmoq", "оказаться в безвыходном положении",
          "To be in a difficult situation with very few choices left.", "have your back against the wall", (
              ("With the deadline tomorrow, we have our backs against the wall.", "Muddat ertaga bo'lgani uchun juda qiyin vaziyatda qoldik."),
              ("She performs well when her back is against the wall.", "U tanlovsiz qiyin vaziyatda ham yaxshi ishlaydi."),
              ("The team fought back with their backs against the wall.", "Jamoa o'ta qiyin vaziyatda ham qarshilik ko'rsatdi.")), ("be under severe pressure",)),
    Entry("come rain or shine", "idioms", "B2", "har qanday sharoitda ham", "при любых обстоятельствах",
          "No matter what happens or what the conditions are.", "come rain or shine", (
              ("She walks every morning, come rain or shine.", "U har qanday ob-havoda ham har tong sayr qiladi."),
              ("The market opens on Sunday, come rain or shine.", "Bozor har qanday sharoitda ham yakshanba kuni ochiladi."),
              ("I will support you, come rain or shine.", "Nima bo'lishidan qat'i nazar, sizni qo'llab-quvvatlayman.")), ("no matter what",)),
    Entry("keep a straight face", "idioms", "B2", "kulmay jiddiy turmoq", "сохранять серьёзное лицо",
          "To avoid laughing or showing amusement.", "keep a straight face", (
              ("I could not keep a straight face during his impression.", "Uning taqlidi paytida kulmay turolmadim."),
              ("She kept a straight face while telling the joke.", "U hazilni aytayotganda jiddiy turdi."),
              ("Try to keep a straight face in the meeting.", "Yig'ilishda kulmay jiddiy turishga harakat qiling.")), ("remain serious",)),
    Entry("the elephant in the room", "idioms", "B2", "hamma biladigan, lekin gapirmaydigan katta muammo", "очевидная проблема, о которой молчат",
          "An obvious and serious problem that people avoid discussing.", "the elephant in the room", (
              ("The budget gap is the elephant in the room.", "Budjetdagi yetishmovchilik hamma biladigan, ammo gapirmaydigan katta muammo."),
              ("Nobody mentioned the elephant in the room: falling sales.", "Hech kim asosiy muammo, ya'ni savdo pasayishini tilga olmadi."),
              ("Let us address the elephant in the room before planning further.", "Keyingi rejadan oldin hamma chetlab o'tayotgan asosiy muammoni muhokama qilaylik.")), ("unspoken issue",)),
    Entry("by the book", "idioms", "B2", "qoidalarga to'liq amal qilib", "строго по правилам",
          "Exactly according to the official rules or procedure.", "do/play/run + something + by the book", (
              ("The inspector does everything by the book.", "Inspektor hamma ishni qoidalarga to'liq amal qilib bajaradi."),
              ("We handled the complaint by the book.", "Shikoyatni rasmiy qoidalarga muvofiq ko'rib chiqdik."),
              ("If we do this by the book, there will be no legal risk.", "Buni qoidaga muvofiq qilsak, huquqiy xavf bo'lmaydi.")), ("according to the rules",)),
    Entry("take the plunge", "idioms", "B2", "ikkilanishni yengib katta qadam tashlamoq", "решиться на важный шаг",
          "To finally decide to do something important or risky.", "take the plunge and + verb", (
              ("After months of planning, she took the plunge and opened a cafe.", "Bir necha oylik rejadan so'ng u katta qadam tashlab kafe ochdi."),
              ("I took the plunge and applied for the scholarship.", "Ikkilanishni yengib, stipendiyaga ariza topshirdim."),
              ("They are ready to take the plunge into self-employment.", "Ular mustaqil ishlashga katta qadam tashlashga tayyor.")), ("make the leap",)),
    Entry("weather the storm", "idioms", "C1", "qiyin davrni bardosh bilan yengib o'tmoq", "пережить трудный период",
          "To survive a difficult period or serious problem.", "weather the storm", (
              ("The business cut costs to weather the storm.", "Biznes qiyin davrni yengib o'tish uchun xarajatlarni qisqartirdi."),
              ("Strong friendships can weather the storm of disagreement.", "Mustahkam do'stlik kelishmovchilikning qiyin davrini yengib o'tadi."),
              ("The team stayed calm and weathered the storm.", "Jamoa xotirjamlikni saqlab, qiyin davrni yengib o'tdi.")), ("survive a crisis", "endure")),
]

ENTRIES = [*PHRASAL, *IDIOMS]

RU_OVERRIDES = {
    "I finally got around to updating my CV.": "Наконец я нашёл время обновить своё резюме.",
    "We pulled it off with only a day to prepare.": "Мы справились, хотя на подготовку был всего один день.",
    "If you keep at your speaking practice, you will improve.": "Если вы будете упорно заниматься разговорной практикой, ваши навыки улучшатся.",
    "The team shook off its slow start and won.": "Команда оправилась после неудачного старта и победила.",
    "She saw through his excuse immediately.": "Она сразу поняла, что его оправдание было неискренним.",
    "Customers can see through dishonest advertising.": "Покупатели способны распознать нечестную рекламу.",
    "Parvoz bekor qilindi, ustiga-ustak yukimiz ham yo'qoldi.": "Рейс отменили, и вдобавок ко всему наш багаж потеряли.",
    "To'lov oshdi, ustiga-ustak xizmat ham yomonlashdi.": "Плата выросла, и вдобавок ко всему качество обслуживания ухудшилось.",
    "Doim ikkilanib turolmaysiz, bir kursni tanlang.": "Нельзя колебаться вечно — выберите один курс.",
    "Ikkala taklif muddati tugaguncha u ikkilanib yurdi.": "Она колебалась, пока срок действия обоих предложений не истёк.",
    "U eski aloqalarini buzmasdan kasbini o'zgartirdi.": "Она сменила профессию, не разрывая прежних связей.",
    "Yakuniy suhbat haqida hozir tashvishlanmang, vaqti kelganda hal qilasiz.": "Пока не беспокойтесь об итоговом собеседовании — решите этот вопрос, когда придёт время.",
    "Bezorining o'zi nihoyat boshqalarga qilgan munosabatni ko'rdi.": "Хулиган наконец испытал на себе то же отношение, которое проявлял к другим.",
    "Haftalab gapimizni bo'lgach, u ham xuddi shunday munosabatni ko'rdi.": "После того как она неделями перебивала нас, с ней поступили точно так же.",
    "U menga yangilikni aytdi, lekin uni sir saqlashimni so'radi.": "Она сообщила мне новость, но попросила сохранить её в секрете.",
    "Kompaniya barcha imkoniyatini bitta mahsulotga bog'ladi.": "Компания поставила всё на один-единственный продукт.",
    "Turli yo'nalishlarga ajratish hamma imkoniyatni bitta variantga bog'lashdan saqlaydi.": "Диверсификация помогает не зависеть только от одного варианта.",
    "Server qachon ishlaydi? Men ham sizdan ortiq bilmayman.": "Когда сервер снова заработает? Я знаю не больше вас.",
    "U tanlovsiz qiyin vaziyatda ham yaxshi ishlaydi.": "Она хорошо работает даже тогда, когда оказывается в крайне трудном положении.",
    "U har qanday ob-havoda ham har tong sayr qiladi.": "Она гуляет каждое утро при любой погоде.",
    "U hazilni aytayotganda jiddiy turdi.": "Рассказывая шутку, она сохраняла серьёзное выражение лица.",
    "Bir necha oylik rejadan so'ng u katta qadam tashlab kafe ochdi.": "После нескольких месяцев планирования она решилась на важный шаг и открыла кафе.",
}


def normalize(value: str) -> str:
    value = value.casefold().replace("’", "'")
    return re.sub(r"[^a-z0-9']+", " ", value).strip()


def load_existing_headwords() -> set[str]:
    result: set[str] = set()
    for path in DATA_DIR.glob("*.csv"):
        if path in {OUTPUT, EXAMPLES_OUTPUT}:
            continue
        try:
            for row in csv.DictReader(path.open(encoding="utf-8")):
                if row.get("headword"):
                    result.add(normalize(row["headword"]))
        except (csv.Error, UnicodeDecodeError):
            continue
    return result


def load_existing_expressions() -> set[str]:
    result: set[str] = set()
    for path in (DATA_DIR / "expressions").glob("*.jsonl"):
        if path in {PHRASAL_EXPRESSIONS, IDIOM_EXPRESSIONS}:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                result.add(normalize(json.loads(line)["expression"]))
    return result


def translate_ru(text: str, cache: dict[str, str], source_lang: str) -> str:
    if text in RU_OVERRIDES:
        return RU_OVERRIDES[text]
    cache_key = f"{source_lang}:{text}"
    if cache_key in cache:
        return cache[cache_key]
    if source_lang == "uz" and text in cache:
        return cache[text]
    query = urllib.parse.urlencode({
        "client": "gtx", "sl": source_lang, "tl": "ru", "dt": "t", "q": text,
    })
    url = "https://translate.googleapis.com/translate_a/single?" + query
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Wordly/1.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.loads(response.read().decode("utf-8"))
            translated = "".join(part[0] for part in payload[0] if part[0]).strip()
            if translated:
                cache[cache_key] = translated
                CACHE_PATH.write_text(
                    json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
                )
                time.sleep(0.12)
                return translated
        except Exception:
            time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Russian example translation failed: {text}")


def expression_row(entry: Entry) -> dict:
    is_idiom = entry.kind == "idioms"
    mistakes = (
        ["Do not change the fixed wording of this idiom.", "Do not translate the phrase word for word."]
        if is_idiom
        else [f"Do not omit the particle or preposition in '{entry.headword}'.", f"Use the structure: {entry.pattern}."]
    )
    return {
        "expression": entry.headword,
        "uzbek": entry.uzbek,
        "russian": entry.russian,
        "cefr": entry.level,
        "ielts_band": {"B1": "6.0", "B2": "6.5", "C1": "7.5"}[entry.level],
        "category": "Everyday Idioms" if is_idiom else "Phrasal Verbs",
        "formality": "Informal" if is_idiom else "Neutral",
        "usage": entry.definition,
        "grammar_pattern": entry.pattern,
        "common_mistakes": mistakes,
        "alternatives": list(entry.synonyms),
        "example_sentences": [english for english, _ in entry.examples],
        "collocations": [entry.pattern],
        "synonyms": list(entry.synonyms),
        "opposites": [],
        "native_notes": (
            "Use this as a fixed expression in natural conversation; one well-chosen idiom is better than several forced ones."
            if is_idiom
            else "Learn the verb and particle as one unit, then practise it with the object pattern shown above."
        ),
    }


def main() -> None:
    if len(PHRASAL) != 20 or len(IDIOMS) != 20:
        raise RuntimeError("The batch must contain 20 phrasal verbs and 20 idioms.")
    keys = [normalize(entry.headword) for entry in ENTRIES]
    if len(keys) != len(set(keys)):
        raise RuntimeError("Duplicate entry inside batch 6.")

    conflicts = (set(keys) & load_existing_headwords()) | (set(keys) & load_existing_expressions())
    if conflicts:
        raise RuntimeError(f"Entries already exist in the corpus: {sorted(conflicts)}")

    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8")) if CACHE_PATH.exists() else {}
    corpus_rows = []
    extra_rows = []
    for index, entry in enumerate(ENTRIES):
        source_lang = "uz" if entry.kind == "idioms" else "en"
        translated_examples = [
            translate_ru(uzbek if source_lang == "uz" else english, cache, source_lang)
            for english, uzbek in entry.examples
        ]
        pos = "idiom" if entry.kind == "idioms" else "phrasal verb"
        corpus_rows.append({
            "headword": entry.headword,
            "pos": pos,
            "cefr_level": entry.level,
            "translation_uz": entry.uzbek,
            "translation_ru": entry.russian,
            "definition_en": entry.definition,
            "ipa": "",
            "frequency_rank": str(21001 + index * 2),
            "category": entry.kind,
            "example_en": entry.examples[0][0],
            "example_uz": entry.examples[0][1],
            "example_ru": translated_examples[0],
            "synonyms": " | ".join(entry.synonyms),
            "antonyms": "",
            "word_family": entry.pattern,
            "common_mistake": expression_row(entry)["common_mistakes"][0],
        })
        for example_index in (1, 2):
            extra_rows.append({
                "headword": entry.headword,
                "pos": pos,
                "example_en": entry.examples[example_index][0],
                "example_uz": entry.examples[example_index][1],
                "example_ru": translated_examples[example_index],
            })

    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CORPUS_FIELDS)
        writer.writeheader()
        writer.writerows(corpus_rows)
    with EXAMPLES_OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=EXAMPLE_FIELDS)
        writer.writeheader()
        writer.writerows(extra_rows)

    for path, entries in ((PHRASAL_EXPRESSIONS, PHRASAL), (IDIOM_EXPRESSIONS, IDIOMS)):
        path.write_text(
            "\n".join(json.dumps(expression_row(entry), ensure_ascii=False) for entry in entries) + "\n",
            encoding="utf-8",
        )
    print("generated: 20 phrasal verbs, 20 idioms, 120 localized examples")


if __name__ == "__main__":
    main()
