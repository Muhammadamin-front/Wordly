import type {
  CefrGrammarLevel,
  GrammarCategory,
  GrammarExercise,
  GrammarLesson,
} from "./types";

type TopicSpec = readonly [
  slug: string,
  title: string,
  titleUz: string,
  category: GrammarCategory,
  formula: string,
  markedModel: string,
  purposeUz: string,
];

const A1_TOPICS: TopicSpec[] = [
  ["subject-object-pronouns", "Subject and object pronouns", "Ega va to‘ldiruvchi olmoshlar", "Pronouns & determiners", "Subject pronoun + verb + object pronoun", "She called [him] after class.", "Gapda ishni kim bajargani va harakat kimga qaratilganini aniq ko‘rsatadi."],
  ["possessive-adjectives-pronouns", "Possessive adjectives and pronouns", "Egalik sifatlari va olmoshlari", "Pronouns & determiners", "my + noun / mine", "This bag is [mine].", "Narsaning kimga tegishli ekanini noun bilan yoki nounsiz aytishni o‘rgatadi."],
  ["demonstratives", "This, that, these and those", "Ko‘rsatish olmoshlari", "Pronouns & determiners", "this/that + singular; these/those + plural", "[These] shoes are comfortable.", "Yaqin va uzoqdagi birlik yoki ko‘plik narsalarni ko‘rsatish uchun ishlatiladi."],
  ["have-have-got", "Have and have got", "Have va have got", "Foundations", "Subject + have/has (got) + noun", "Mira [has got] a new laptop.", "Egalik, oila va tashqi ko‘rinish haqida sodda gaplar tuzishga yordam beradi."],
  ["possessive-s", "Possessive 's", "Egalik qo‘shimchasi 's", "Nouns & articles", "person + 's + noun", "That is [Aziza's] notebook.", "Biror narsa kimga tegishli ekanini ism bilan qisqa aytish uchun kerak."],
  ["present-simple-negatives", "Present Simple negatives", "Present Simple inkor gaplari", "Tenses", "Subject + do/does not + base verb", "He [doesn't drink] coffee.", "Kundalik odat yoki fakt noto‘g‘ri ekanini aytish uchun ishlatiladi."],
  ["present-simple-questions", "Present Simple questions", "Present Simple savollari", "Questions", "Do/Does + subject + base verb?", "[Does] your sister work here?", "Odatlar, ish va kundalik hayot haqida savol berishni o‘rgatadi."],
  ["present-continuous-questions", "Present Continuous questions", "Present Continuous savollari", "Questions", "Am/Is/Are + subject + verb-ing?", "[Are] they waiting outside?", "Hozir davom etayotgan harakat haqida savol berish uchun ishlatiladi."],
  ["question-words", "Question words", "So‘roq so‘zlari", "Questions", "Question word + auxiliary + subject + verb?", "[Where] do you live?", "Who, what, where, when, why va how bilan aniq ma’lumot so‘rashga yordam beradi."],
  ["imperatives", "Basic imperatives", "Buyruq va ko‘rsatmalar", "Word order", "Base verb (+ object)", "[Turn] left at the bank.", "Qisqa ko‘rsatma, iltimos va ogohlantirish berish uchun ishlatiladi."],
  ["some-any", "Some and any", "Some va any", "Pronouns & determiners", "some in positives; any in negatives/questions", "We need [some] water.", "Noma’lum miqdorni tasdiq, inkor va savol gaplarda to‘g‘ri ifodalaydi."],
  ["much-many-basics", "Much and many", "Much va many asoslari", "Pronouns & determiners", "many + countable plural; much + uncountable", "How [many] chairs do we need?", "Sanaladigan va sanalmaydigan narsalar miqdori haqida so‘rashga yordam beradi."],
  ["countable-uncountable-basics", "Countable and uncountable nouns", "Sanaladigan va sanalmaydigan otlar", "Nouns & articles", "a/an + countable; no a/an with uncountable", "Could I have [some advice]?", "Qaysi otlar son va article olishini sodda darajada ajratadi."],
  ["frequency-adverbs-basics", "Adverbs of frequency", "Takroriylik ravishlari", "Tenses", "Subject + adverb + main verb", "I [usually walk] to work.", "Harakat qanchalik tez-tez bo‘lishini aytish va ravish o‘rnini tanlash uchun kerak."],
  ["comparatives-basics", "Basic comparatives", "Oddiy qiyosiy daraja", "Comparison", "adjective-er + than / more + adjective + than", "This route is [shorter than] the old one.", "Ikki odam yoki narsani sodda tarzda taqqoslashga yordam beradi."],
  ["superlatives-basics", "Basic superlatives", "Oddiy orttirma daraja", "Comparison", "the + adjective-est / the most + adjective", "It is [the quietest] room here.", "Guruh ichidagi eng yuqori yoki eng past xususiyatni aytish uchun ishlatiladi."],
  ["past-simple-introduction", "Past Simple introduction", "Past Simple bilan tanishuv", "Tenses", "Subject + past verb", "We [visited] Bukhara last spring.", "Tugagan o‘tgan voqealarni vaqt belgisi bilan aytishni boshlaydi."],
  ["was-were", "Was and were", "Was va were", "Tenses", "I/he/she/it was; you/we/they were", "The streets [were] quiet yesterday.", "Be fe’lining o‘tgan zamon shakllarini ega bilan moslashtiradi."],
  ["going-to-plans", "Going to for plans", "Rejalar uchun going to", "Tenses", "Subject + am/is/are going to + verb", "I [am going to study] tonight.", "Oldindan qilingan reja va niyatlarni aytish uchun ishlatiladi."],
  ["basic-conjunctions", "And, but, because and so", "Asosiy bog‘lovchilar", "Clauses & linking", "clause + connector + clause", "I stayed home [because] it was raining.", "Sodda fikrlarni qo‘shish, qarama-qarshi qo‘yish va sabab-natija bilan bog‘laydi."],
];

const A2_TOPICS: TopicSpec[] = [
  ["present-simple-vs-continuous", "Present Simple vs Present Continuous", "Present Simple va Present Continuous", "Tenses", "habit: present simple; now: be + verb-ing", "I [am working] from home this week.", "Doimiy odat bilan ayni paytdagi vaqtinchalik harakatni farqlaydi."],
  ["past-continuous-a2", "Past Continuous", "Past Continuous", "Tenses", "Subject + was/were + verb-ing", "They [were having] dinner at eight.", "O‘tgan paytda davom etayotgan harakatni tasvirlaydi."],
  ["past-simple-vs-continuous", "Past Simple vs Past Continuous", "Past Simple va Past Continuous", "Tenses", "background: was/were + ing; event: past verb", "I [was walking] when it started to rain.", "Fon harakati va uni bo‘lgan qisqa voqeani bir gapda ajratadi."],
  ["present-perfect-ever-never", "Present Perfect with ever and never", "Ever va never bilan Present Perfect", "Tenses", "have/has + ever/never + past participle", "Have you [ever tried] kayaking?", "Hayot tajribasi haqida aniq o‘tgan vaqtni aytmasdan gapirish uchun kerak."],
  ["present-perfect-just-already-yet", "Just, already and yet", "Just, already va yet", "Tenses", "have/has + just/already + V3; yet at the end", "She has [already sent] the email.", "Yaqinda tugagan yoki kutilgan harakatning holatini ko‘rsatadi."],
  ["present-perfect-for-since", "For and since", "For va since", "Tenses", "for + period; since + starting point", "We have lived here [since] 2021.", "Davomiylik muddati bilan boshlanish nuqtasini farqlashga yordam beradi."],
  ["been-vs-gone", "Been and gone", "Been va gone farqi", "Tenses", "has been = returned; has gone = still away", "Nodira has [gone] to the pharmacy.", "Biror kishi qaytganmi yoki hali boshqa joydaligini aniq ko‘rsatadi."],
  ["will-predictions", "Will for predictions and decisions", "Bashorat va qarorlar uchun will", "Tenses", "Subject + will + base verb", "I think prices [will rise] next year.", "Bashorat va gapirish paytida qabul qilingan qarorni ifodalaydi."],
  ["present-continuous-arrangements", "Present Continuous for arrangements", "Kelishuvlar uchun Present Continuous", "Tenses", "be + verb-ing + future time", "We [are meeting] the client on Friday.", "Vaqti yoki joyi kelishilgan yaqin kelajak rejasini aytadi."],
  ["will-vs-going-to", "Will vs going to", "Will va going to farqi", "Tenses", "instant decision: will; prior plan/evidence: going to", "Look at those clouds; it [is going to rain].", "Tezkor qaror, oldingi reja va dalilga asoslangan bashoratni farqlaydi."],
  ["zero-conditional-a2", "Zero Conditional", "Zero Conditional", "Conditionals", "If + present, present", "If water reaches zero, it [freezes].", "Doimiy fakt, ilmiy qoida va odatiy natijani ifodalaydi."],
  ["first-conditional-a2", "First Conditional", "First Conditional", "Conditionals", "If + present, will + verb", "If we leave now, we [will catch] the bus.", "Kelajakdagi real ehtimol va uning natijasini aytadi."],
  ["must-vs-have-to", "Must vs have to", "Must va have to", "Modal verbs", "must/have to + base verb", "Employees [have to wear] an ID card.", "Shaxsiy qat’iy talab bilan tashqi qoida yoki majburiyatni farqlaydi."],
  ["mustnt-vs-dont-have-to", "Mustn't vs don't have to", "Mustn’t va don’t have to", "Modal verbs", "mustn't = prohibited; don't have to = optional", "You [mustn't park] here.", "Taqiq bilan zarurat yo‘qligini chalkashtirmaslikka yordam beradi."],
  ["may-might-possibility", "May and might", "May va might", "Modal verbs", "may/might + base verb", "We [might arrive] a little late.", "Hozirgi yoki kelajakdagi noaniq ehtimolni yumshoq aytadi."],
  ["infinitive-purpose", "Infinitive of purpose", "Maqsad infinitivi", "Verb patterns", "to + base verb", "I called the office [to ask] a question.", "Harakat nima maqsadda bajarilganini qisqa ifodalaydi."],
  ["verb-plus-infinitive-a2", "Verb + infinitive", "Fe’l va infinitiv", "Verb patterns", "want/need/decide + to + verb", "They decided [to wait] outside.", "Ba’zi fe’llardan keyin to-infinitive ishlatilishini mustahkamlaydi."],
  ["verb-plus-ing-a2", "Verb + -ing", "Fe’l va -ing shakli", "Verb patterns", "enjoy/finish/avoid + verb-ing", "She enjoys [cooking] for friends.", "Ba’zi fe’llardan keyin gerund shaklini tanlashni o‘rgatadi."],
  ["comparative-structures-a2", "Comparative structures", "Qiyosiy strukturalar", "Comparison", "much/a little + comparative; as ... as", "The train is [much faster than] the bus.", "Farq darajasini va tenglikni aniqroq taqqoslaydi."],
  ["so-such-basics", "So and such", "So va such asoslari", "Clauses & linking", "so + adjective; such + (a/an) + adjective + noun", "It was [such a useful] lesson.", "Kuchli sifatni noun bilan yoki nounsiz tabiiy ifodalaydi."],
  ["relative-clauses-introduction", "Relative clauses introduction", "Relative clause bilan tanishuv", "Relative clauses", "noun + who/which/that + clause", "The woman [who lives next door] is a pilot.", "Odam yoki narsa haqida qo‘shimcha aniqlovchi ma’lumot beradi."],
  ["passive-introduction-a2", "Passive voice introduction", "Passive voice bilan tanishuv", "Passive", "be + past participle", "The rooms [are cleaned] every morning.", "Ishni kim bajarganidan ko‘ra harakat yoki natija muhim bo‘lganda ishlatiladi."],
  ["reported-speech-introduction", "Reported speech introduction", "Reported speech bilan tanishuv", "Reported speech", "say (that) + clause", "Ali said that he [was tired].", "Boshqa odamning gapini aynan takrorlamasdan yetkazadi."],
  ["quantifiers-a2", "Everyday quantifiers", "Kundalik miqdor so‘zlari", "Pronouns & determiners", "a lot of / a few / a little + noun", "We have [a little] time before class.", "Kundalik gaplarda kichik va katta miqdorni sanalishiga qarab ifodalaydi."],
  ["articles-places-a2", "Articles with places", "Joy nomlari bilan artikllar", "Nouns & articles", "the + specific place; zero article for many names", "We visited [the] National Gallery.", "Joy, bino va geografik nomlar bilan article tanlashni o‘rgatadi."],
  ["phrasal-verb-word-order-a2", "Phrasal verb word order", "Phrasal verblarda so‘z tartibi", "Word order", "verb + particle + noun / verb + pronoun + particle", "Please turn [it off].", "Ajraladigan phrasal verblarda object va pronoun o‘rnini to‘g‘ri qo‘yadi."],
];

const B1_TOPICS: TopicSpec[] = [
  ["present-perfect-continuous-b1", "Present Perfect Continuous", "Present Perfect Continuous", "Tenses", "have/has been + verb-ing", "I [have been learning] English for two years.", "O‘tmishda boshlanib hozirgacha davom etgan faoliyatning jarayonini ta’kidlaydi."],
  ["present-perfect-simple-vs-continuous", "Present Perfect Simple vs Continuous", "Present Perfect Simple va Continuous", "Tenses", "result: have + V3; activity: have been + ing", "She [has written] three reports today.", "Tugagan natija bilan davom etgan faoliyatni farqlaydi."],
  ["past-perfect-basics-b1", "Past Perfect basics", "Past Perfect asoslari", "Tenses", "had + past participle", "The film had started before we [arrived].", "Ikki o‘tgan voqeadan qaysi biri oldin bo‘lganini ko‘rsatadi."],
  ["would-past-habits", "Would for past habits", "O‘tgan odatlar uchun would", "Tenses", "would + base verb", "Every summer, we [would stay] with our grandparents.", "O‘tmishda takrorlangan harakatlarni hikoya qilish uchun ishlatiladi."],
  ["future-forms-review-b1", "Future forms review", "Kelajak shakllari takrori", "Tenses", "will / going to / present continuous", "I [am meeting] the designer tomorrow morning.", "Bashorat, niyat va aniq kelishuv uchun mos future formni tanlaydi."],
  ["future-continuous-b1", "Future Continuous", "Future Continuous", "Tenses", "will be + verb-ing", "This time tomorrow, we [will be flying] home.", "Kelajakdagi ma’lum vaqtda davom etadigan harakatni tasvirlaydi."],
  ["can-could-be-able-to", "Can, could and be able to", "Can, could va be able to", "Modal verbs", "can/could + verb; be able to + verb", "After practice, she [was able to solve] it.", "Qobiliyatni turli zamonlarda va aniq muvaffaqiyat holatida ifodalaydi."],
  ["modals-possibility-b1", "Modals of possibility", "Ehtimollik modal fe’llari", "Modal verbs", "may/might/could + base verb", "The keys [might be] in the kitchen.", "Dalil yetarli bo‘lmaganda bir necha ehtimolni ehtiyotkor aytadi."],
  ["modals-obligation-review-b1", "Obligation and permission", "Majburiyat va ruxsat", "Modal verbs", "must/have to/can/be allowed to + verb", "Visitors [are allowed to take] photos here.", "Qoida, majburiyat, ruxsat va taqiqni aniq ajratadi."],
  ["first-conditional-review-b1", "First Conditional review", "First Conditional takrori", "Conditionals", "If + present, will/may/can + verb", "If you book early, you [may get] a discount.", "Real kelajak shartida turli natija modal shakllarini ishlatadi."],
  ["unless-b1", "Unless", "Unless bilan shart", "Conditionals", "unless + positive clause = if ... not", "We will miss the train [unless we leave] now.", "If not ma’nosini ixcham va tabiiy ifodalaydi."],
  ["third-conditional-introduction", "Third Conditional introduction", "Third Conditional bilan tanishuv", "Conditionals", "If + had + V3, would have + V3", "If I had known, I [would have called] you.", "O‘tmishda bo‘lmagan shart va uning tasavvuriy natijasini aytadi."],
  ["wish-present-b1", "Wish about the present", "Hozirgi holat uchun wish", "Conditionals", "wish + past simple", "I wish I [had] more free time.", "Hozirgi vaziyat boshqacha bo‘lishini istashni ifodalaydi."],
  ["if-only-introduction-b1", "If only introduction", "If only bilan tanishuv", "Conditionals", "if only + past simple", "If only the apartment [were] quieter.", "Hozirgi norozilik yoki kuchli istakni wishdan kuchliroq beradi."],
  ["passive-different-tenses-b1", "Passive in different tenses", "Turli zamonlarda Passive", "Passive", "tense of be + past participle", "The bridge [was built] in 1998.", "Passive formda zamonni be yordamchi fe’li orqali saqlashni o‘rgatadi."],
  ["reported-statements-b1", "Reported statements", "O‘zlashtirma darak gaplar", "Reported speech", "said/told + (that) + backshifted clause", "Nina said that she [needed] help.", "Boshqa odamning darak gapini zamon va pronounlarni moslab yetkazadi."],
  ["reported-questions-b1", "Reported questions", "O‘zlashtirma so‘roq gaplar", "Reported speech", "asked + question word/if + statement order", "He asked where I [worked].", "Savolni o‘zlashtirma gapga aylantirganda oddiy gap tartibini saqlaydi."],
  ["reported-commands-b1", "Reported commands", "O‘zlashtirma buyruqlar", "Reported speech", "told/asked + object + to + verb", "The coach told us [to wait] outside.", "Buyruq va iltimosni to-infinitive orqali yetkazadi."],
  ["defining-relative-clauses-b1", "Defining relative clauses", "Aniqlovchi relative clauses", "Relative clauses", "noun + who/which/that + essential clause", "The app [that tracks my habits] is free.", "Qaysi odam yoki narsa nazarda tutilganini aniqlovchi zarur ma’lumot beradi."],
  ["non-defining-relative-clauses-b1", "Non-defining relative clauses", "Izohlovchi relative clauses", "Relative clauses", "noun, who/which + extra clause,", "Samarkand, [which attracts many visitors], is historic.", "Ma’noni aniqlash uchun shart bo‘lmagan qo‘shimcha ma’lumotni vergul bilan ajratadi."],
  ["verb-patterns-b1", "Common verb patterns", "Ko‘p ishlatiladigan verb patterns", "Verb patterns", "verb + to-infinitive / verb + -ing", "She avoided [answering] the question.", "Fe’ldan keyin infinitive yoki gerund kelishini ma’noga mos tanlaydi."],
  ["question-tags-b1", "Question tags", "Tasdiq so‘roqlari", "Questions", "positive clause + negative tag (and vice versa)", "You have met Ali, [haven't you]?", "Ma’lumotni tasdiqlash yoki suhbatdoshni javobga undash uchun ishlatiladi."],
  ["indirect-questions-b1", "Indirect questions", "Bilvosita savollar", "Questions", "intro phrase + question word + statement order", "Could you tell me where the station [is]?", "Savolni muloyimroq qilishda statement word orderni saqlaydi."],
  ["causative-introduction-b1", "Causative introduction", "Causative bilan tanishuv", "Passive", "have + object + past participle", "I [had my phone repaired] yesterday.", "Xizmatni o‘zi emas, boshqa odam bajarganini ifodalaydi."],
  ["articles-general-specific-b1", "General and specific articles", "Umumiy va aniq artikllar", "Nouns & articles", "a/an = one of many; the = identified", "I bought a book, and [the book] was excellent.", "Yangi ma’lumot bilan oldindan ma’lum narsani article orqali farqlaydi."],
  ["determiners-b1", "Determiners", "Aniqlovchi so‘zlar", "Pronouns & determiners", "determiner + noun", "[Each] student received a certificate.", "Each, every, either va neither bilan noun va verb mosligini boshqaradi."],
  ["quantifiers-b1", "Quantifiers and amount", "Miqdor bildiruvchi so‘zlar", "Pronouns & determiners", "few/little; a few/a little; plenty of", "We still have [plenty of] options.", "Miqdorning yetarli yoki yetarli emasligini noun turiga mos ifodalaydi."],
  ["although-despite-b1", "Although, though and despite", "Although, though va despite", "Clauses & linking", "although + clause; despite + noun/-ing", "[Although it was late], we continued working.", "Kutilmagan qarama-qarshilikni clause yoki noun phrase bilan bog‘laydi."],
  ["so-such-b1", "So and such for emphasis", "Urg‘u uchun so va such", "Clauses & linking", "so + adjective; such + noun phrase", "It was [so cold that] the lake froze.", "Kuchli sifat va uning natijasini tabiiy bog‘laydi."],
  ["adjective-order-b1", "Adjective order", "Sifatlar tartibi", "Word order", "opinion-size-age-shape-colour-origin-material-noun", "She bought a [beautiful old wooden] desk.", "Bir noun oldidan kelgan bir nechta sifatni tabiiy tartibda joylaydi."],
  ["adverb-position-b1", "Adverb position", "Ravishlarning gapdagi o‘rni", "Word order", "frequency before main verb; manner after object", "He [carefully checked] the figures.", "Frequency, manner va degree ravishlarini gapda tushunarli joylashtiradi."],
  ["comparison-structures-b1", "Extended comparison structures", "Kengaytirilgan taqqoslash", "Comparison", "not as ... as; the same as; different from", "The sequel was [not as exciting as] the first film.", "Tenglik, farq va nisbiy darajani turli strukturalar bilan ifodalaydi."],
  ["noun-clauses-basics-b1", "Noun clauses basics", "Noun clause asoslari", "Clauses & linking", "what/that/whether + clause", "[What you said] makes sense.", "Butun clause gapda subject yoki object vazifasida ishlashini ko‘rsatadi."],
  ["purpose-clauses-b1", "Purpose clauses", "Maqsad gaplari", "Clauses & linking", "to/in order to + verb; so that + clause", "She spoke slowly [so that everyone could follow].", "Harakatning maqsadini bir xil subject yoki alohida subject bilan ifodalaydi."],
  ["participle-clauses-basics-b1", "Participle clauses basics", "Participle clause asoslari", "Clauses & linking", "verb-ing / past participle + main clause", "[Feeling tired], I went to bed early.", "Bir xil subjectli ikki fikrni -ing yoki V3 shakli bilan ixchamlaydi."],
  ["future-time-clauses-b1", "Future time clauses", "Kelajakdagi time clauses", "Tenses", "when/as soon as/until + present, will + verb", "I will message you when I [arrive].", "Kelajak ma’nosi bo‘lsa ham time clauseda present tense ishlatilishini mustahkamlaydi."],
];

const B2_TOPICS: TopicSpec[] = [
  ["advanced-present-time-contrasts", "Advanced present-time contrasts", "Hozirgi zamonlarning murakkab farqlari", "Tenses", "state vs activity; permanent vs temporary", "I [am considering] a change, but I think the plan is sound.", "State va action fe’llari orqali doimiy fikr bilan vaqtinchalik jarayonni farqlaydi."],
  ["advanced-past-time-contrasts", "Advanced past-time contrasts", "O‘tgan zamonlarning murakkab farqlari", "Tenses", "past simple/continuous/perfect/perfect continuous", "She was exhausted because she [had been travelling] all night.", "O‘tgan hikoyada ketma-ketlik, fon, oldingi natija va davomiylikni boshqaradi."],
  ["future-perfect-b2", "Future Perfect", "Future Perfect", "Tenses", "will have + past participle", "By June, they [will have completed] the bridge.", "Kelajakdagi muddatgacha tugaydigan natijani ko‘rsatadi."],
  ["past-modal-deduction", "Past modal deduction", "O‘tmish haqida modal xulosa", "Modal verbs", "modal + have + past participle", "She [must have missed] the train.", "O‘tgan voqea haqida dalilga asoslangan kuchli yoki ehtiyotkor xulosa qiladi."],
  ["should-have-b2", "Should have", "Should have", "Modal verbs", "should have + past participle", "You [should have checked] the address.", "O‘tmishdagi maslahat, kutilgan ish yoki tanqidni ifodalaydi."],
  ["could-have-b2", "Could have", "Could have", "Modal verbs", "could have + past participle", "We [could have taken] a taxi.", "O‘tmishda mavjud bo‘lgan, ammo ishlatilmagan imkoniyatni ko‘rsatadi."],
  ["might-have-b2", "Might have", "Might have", "Modal verbs", "might have + past participle", "The message [might have gone] to spam.", "O‘tmishdagi noaniq ehtimolni ehtiyotkor ifodalaydi."],
  ["must-cant-have-b2", "Must have and can't have", "Must have va can’t have", "Modal verbs", "must/can't have + past participle", "They [can't have seen] the notice.", "O‘tmish haqida kuchli ijobiy yoki salbiy xulosani farqlaydi."],
  ["third-conditional-b2", "Third Conditional", "Third Conditional", "Conditionals", "if + had + V3, would have + V3", "If we had left earlier, we [would have avoided] traffic.", "Bo‘lmagan o‘tgan shart va uning bo‘lmagan natijasini tahlil qiladi."],
  ["mixed-conditionals-b2", "Mixed Conditionals in context", "Kontekstdagi Mixed Conditionals", "Conditionals", "past condition + present result / present condition + past result", "If I had taken that job, I [would live] abroad now.", "Turli vaqtga tegishli shart va natijani mantiqan bog‘laydi."],
  ["passive-perfect-continuous-b2", "Advanced passive tenses", "Murakkab passive zamonlar", "Passive", "modal/perfect/continuous be + past participle", "The issue [has been discussed] several times.", "Perfect, continuous va modal kontekstlarda passive formni aniq quradi."],
  ["passive-reporting-b2", "Passive reporting structures", "Passive reporting strukturalari", "Passive", "It is said that... / subject is said to...", "The treatment [is believed to be] effective.", "Umumiy fikr yoki manbasi noma’lum da’voni rasmiy va masofali ohangda beradi."],
  ["have-vs-get-something-done", "Have vs get something done", "Have va get something done", "Passive", "have/get + object + past participle", "We [got the windows replaced] last week.", "Rasmiy xizmat va kundalik tashkillashtirilgan ish orasidagi uslub farqini ko‘rsatadi."],
  ["advanced-reported-statements", "Advanced reported speech", "Murakkab reported speech", "Reported speech", "reporting verb + shifted or unchanged clause", "Lola explained that the rule [still applies].", "Backshift shart bo‘lmagan holatlarni va kontekstga mos zamonni tanlaydi."],
  ["reporting-verbs-b2", "Reporting verbs", "Reporting verbs", "Reported speech", "verb + that / object + to / verb-ing", "The manager [advised us to wait].", "Suggest, admit, deny, warn va advise kabi fe’llarning turli complementlarini boshqaradi."],
  ["reduced-relatives-b2", "Reduced relative clauses", "Qisqartirilgan relative clauses", "Relative clauses", "noun + verb-ing / past participle phrase", "Applicants [selected for interview] will be contacted.", "Active va passive relative clauselarni ma’noni yo‘qotmasdan ixchamlaydi."],
  ["present-participle-clauses-b2", "Present participle clauses", "Present participle clauses", "Clauses & linking", "verb-ing clause + main clause", "[Knowing the risks], she prepared carefully.", "Bir subjectli sabab, vaqt yoki parallel harakatni -ing clause bilan bog‘laydi."],
  ["past-participle-clauses-b2", "Past participle clauses", "Past participle clauses", "Clauses & linking", "past participle clause + main clause", "[Designed for small teams], the tool is easy to use.", "Passive ma’nodagi qo‘shimcha fikrni V3 clause orqali ixchamlaydi."],
  ["perfect-participle-clauses-b2", "Perfect participle clauses", "Perfect participle clauses", "Clauses & linking", "having + past participle", "[Having finished] the report, she went home.", "Asosiy harakatdan oldin tugagan ishni ixcham va aniq ko‘rsatadi."],
  ["complex-gerund-patterns-b2", "Complex gerund patterns", "Murakkab gerund patterns", "Verb patterns", "verb/preposition + object + verb-ing", "I appreciate [you helping] at short notice.", "Gerund oldidagi object yoki possessive form orqali harakat egasini ko‘rsatadi."],
  ["complex-infinitive-patterns-b2", "Complex infinitive patterns", "Murakkab infinitive patterns", "Verb patterns", "verb + object + to-infinitive / perfect infinitive", "We expected the delivery [to arrive] by noon.", "Objectli va perfect infinitive strukturalarida vaqt hamda subjectni aniq qiladi."],
  ["advanced-determiners-b2", "Advanced determiners", "Murakkab determiners", "Pronouns & determiners", "all/both/either/neither/each + noun/pronoun", "[Neither of the proposals] was accepted.", "Guruhning hammasi, ikkisi yoki hech birini noun agreement bilan ifodalaydi."],
  ["advanced-quantifiers-b2", "Advanced quantifiers", "Murakkab quantifiers", "Pronouns & determiners", "a great deal of / a number of / the number of", "[A number of students are] working remotely.", "Rasmiy miqdor birikmalarida countability va subject-verb agreementni saqlaydi."],
  ["inversion-introduction-b2", "Inversion introduction", "Inversion bilan tanishuv", "Advanced grammar", "negative adverbial + auxiliary + subject + verb", "Rarely [do we see] such rapid change.", "Kuchli urg‘u uchun auxiliaryni subject oldiga ko‘chirishni boshlaydi."],
  ["cleft-sentences-b2", "Cleft sentences for focus", "Urg‘u uchun cleft sentences", "Advanced grammar", "It is/was X that...", "It was the deadline [that changed] our plan.", "Gapning bitta qismini alohida urg‘ulash uchun cleft strukturani ishlatadi."],
  ["do-emphasis-b2", "Emphatic do", "Urg‘uli do", "Advanced grammar", "do/does/did + base verb", "I [do understand] your concern.", "Tasdiq gapda qarama-qarshilik yoki samimiy urg‘u beradi."],
  ["fronting-introduction-b2", "Fronting introduction", "Fronting bilan tanishuv", "Advanced grammar", "fronted element + clause", "[What I need most] is a clear answer.", "Muhim elementni gap boshiga olib chiqib information focusni o‘zgartiradi."],
  ["complex-noun-phrases-b2", "Complex noun phrases", "Murakkab noun phrases", "Nouns & articles", "pre-modifiers + head noun + post-modifier", "The [rapid growth of online learning] has changed education.", "Bir noun atrofida aniq modifierlar qurib formal fikrni zich ifodalaydi."],
  ["advanced-conjunctions-b2", "Advanced conjunctions", "Murakkab bog‘lovchilar", "Clauses & linking", "whereas/provided that/given that + clause", "Remote work is flexible, [whereas] office work offers direct contact.", "Kontrast, shart va sababni rasmiyroq conjunctionlar bilan bog‘laydi."],
  ["contrast-clauses-b2", "Complex contrast clauses", "Murakkab contrast clauses", "Clauses & linking", "while/whereas/even though + clause", "[Even though demand fell], prices remained high.", "Kutilmagan yoki parallel kontrastni murakkab gapda aniq tashkil qiladi."],
  ["concession-clauses-b2", "Concession clauses", "Concession clauses", "Clauses & linking", "much as/however + adjective + clause", "[However difficult it seems], the task is possible.", "To‘siq mavjud bo‘lsa ham natija o‘zgarmasligini formal uslubda beradi."],
  ["purpose-result-clauses-b2", "Advanced purpose and result", "Murakkab maqsad va natija", "Clauses & linking", "so that / such...that / with the result that", "The file was compressed [so that it could be sent].", "Maqsad va haqiqiy natijani modal hamda result strukturalari bilan farqlaydi."],
  ["future-in-the-past-b2", "Future in the past", "O‘tmish nuqtasidan kelajak", "Tenses", "would / was going to / was about to", "I knew the meeting [would take] longer.", "O‘tgan nuqtadan keyin sodir bo‘lishi kutilgan voqeani ko‘rsatadi."],
  ["advanced-indirect-questions-b2", "Advanced indirect questions", "Murakkab indirect questions", "Questions", "intro + whether/question word + statement order", "I wonder whether the data [has been verified].", "Murakkab zamon va passive formda ham bilvosita savol tartibini saqlaydi."],
  ["ellipsis-basics-b2", "Ellipsis basics", "Ellipsis asoslari", "Advanced grammar", "omit repeated words when meaning stays clear", "I ordered the soup, and Maya [the salad].", "Takroriy elementni tushirib qoldirib gapni tabiiy va ixcham qiladi."],
  ["substitution-basics-b2", "Substitution basics", "Substitution asoslari", "Advanced grammar", "one/ones, do so, so/not", "The blue chairs are softer than the red [ones].", "Takroriy noun, verb phrase yoki butun clause o‘rniga substitute ishlatadi."],
  ["advanced-prepositions-b2", "Advanced prepositions", "Murakkab prepositions", "Prepositions", "complex preposition + noun phrase", "The event continued [in spite of] the rain.", "Formal matnda sabab, kontrast va munosabatni complex preposition bilan ifodalaydi."],
  ["adjective-preposition-patterns-b2", "Adjective + preposition patterns", "Adjective va preposition birikmalari", "Prepositions", "adjective + fixed preposition", "The team is [capable of handling] the change.", "Sifatdan keyin keladigan fixed preposition va gerund patternni mustahkamlaydi."],
  ["noun-preposition-patterns-b2", "Noun + preposition patterns", "Noun va preposition birikmalari", "Prepositions", "noun + fixed preposition + noun/-ing", "There is growing [demand for] flexible courses.", "Academic va kundalik noun collocationlarda to‘g‘ri preposition tanlaydi."],
  ["verb-preposition-grammar-b2", "Verb + preposition grammar", "Verb va preposition birikmalari", "Prepositions", "verb + fixed preposition + object", "The outcome [depends on] several factors.", "Ma’no o‘zgaradigan fixed verb-preposition patternlarni aniq ishlatadi."],
  ["formal-grammar-patterns-b2", "Formal grammar patterns", "Rasmiy grammar patterns", "Advanced grammar", "formal subject + nominal/impersonal structure", "It [is essential to consider] the long-term cost.", "Essay va professional yozuvda colloquial gapni neutral formal strukturaga aylantiradi."],
];

const C1_TOPICS: TopicSpec[] = [
  ["hardly-scarcely-barely-inversion", "Hardly, scarcely and barely inversion", "Hardly, scarcely va barely inversion", "Advanced grammar", "Hardly had + subject + V3 when...", "Hardly [had the debate begun] when the alarm sounded.", "Bir voqea ortidan darhol boshqasi kelganini kuchli narrative inversion bilan beradi."],
  ["no-sooner-inversion-c1", "No sooner inversion", "No sooner inversion", "Advanced grammar", "No sooner had + subject + V3 than...", "No sooner [had we launched] than demand doubled.", "Ikki ketma-ket voqeani formal va emphatic tarzda bog‘laydi."],
  ["not-only-inversion-c1", "Not only inversion", "Not only inversion", "Advanced grammar", "Not only + auxiliary + subject + verb, but...", "Not only [did the policy reduce] costs, but it also improved access.", "Ikki bog‘liq natijani birinchisiga kuchli urg‘u berib parallel quradi."],
  ["conditional-inversion-c1", "Conditional inversion", "Shart gaplarda inversion", "Conditionals", "Had/Were/Should + subject ...", "[Had I known] the full cost, I would have declined.", "If so‘zisiz formal shart gaplarini vaqt va ehtimolga mos quradi."],
  ["distancing-structures-c1", "Distancing structures", "Masofalovchi strukturalar", "Advanced grammar", "It appears/seems/is thought that...", "It [appears that] the estimate was too low.", "Muallifni da’vodan ehtiyotkor masofalab, akademik aniqlik yaratadi."],
  ["pseudo-clefts-c1", "Pseudo-cleft sentences", "Pseudo-cleft sentences", "Advanced grammar", "What + clause + be + focused element", "What the team needs [is clearer guidance].", "Yangi yoki kontrastiv ma’lumotni gap oxirida kuchli focus bilan beradi."],
  ["formal-informal-choices-c1", "Formal vs informal grammar choices", "Rasmiy va norasmiy grammar tanlovi", "Advanced grammar", "context-appropriate clause and verb pattern", "The committee [requested that the figures be revised].", "Bir ma’noni auditoriya va janrga mos formal yoki conversational shaklda tanlaydi."],
  ["information-structure-c1", "Information structure and end focus", "Information structure va end focus", "Advanced grammar", "given information first; new information last", "What changed the outcome was [a late piece of evidence].", "Oldindan ma’lum va yangi ma’lumotni joylashtirib matn oqimini boshqaradi."],
];

const TOPICS_BY_LEVEL: Record<CefrGrammarLevel, TopicSpec[]> = {
  A1: A1_TOPICS,
  A2: A2_TOPICS,
  B1: B1_TOPICS,
  B2: B2_TOPICS,
  C1: C1_TOPICS,
};

function unmark(marked: string): { sentence: string; answer: string; gap: string } {
  const match = marked.match(/\[([^\]]+)]/);
  if (!match) throw new Error(`Grammar model has no marked answer: ${marked}`);
  return {
    answer: match[1],
    sentence: marked.replace(`[${match[1]}]`, match[1]),
    gap: marked.replace(`[${match[1]}]`, "___"),
  };
}

function distractors(answer: string): string[] {
  const exact: Record<string, string[]> = {
    him: ["he", "his", "himself"], mine: ["my", "me", "I"], These: ["This", "That", "It"],
    some: ["any", "many", "much"], many: ["much", "little", "a little"], since: ["for", "during", "from"],
    the: ["a", "an", "no article"], where: ["what", "when", "which"], were: ["was", "are", "did"],
    gone: ["been", "went", "going"], neither: ["both", "every", "all"], whereas: ["therefore", "because", "unless"],
  };
  const words = answer.split(/\s+/);
  const first = words[0];
  const auxiliary: Record<string, string[]> = {
    am: ["is", "are", "do"], is: ["are", "does", "has"], are: ["is", "do", "have"],
    was: ["were", "did", "has"], were: ["was", "did", "had"], do: ["does", "did", "is"], does: ["do", "did", "is"],
    has: ["have", "had", "is"], have: ["has", "had", "are"], had: ["has", "have", "did"],
    will: ["would", "did", "is"], would: ["will", "did", "has"], can: ["could", "does", "is"],
    could: ["can", "would", "did"], might: ["must", "may", "did"], must: ["might", "should", "did"],
  };
  const mapped = exact[answer] ?? exact[first];
  const candidates = mapped ?? (words.length > 1 && auxiliary[first]
    ? auxiliary[first].map((replacement) => [replacement, ...words.slice(1)].join(" "))
    : words.length > 1
      ? [words.slice(1).join(" "), `not ${answer}`, `${answer} to`]
      : [`not ${answer}`, `${answer}ing`, `to ${answer}`]);
  return [...new Set(candidates.filter((item) => item !== answer))].slice(0, 3);
}

function generatedExercises(slug: string, marked: string, title: string): GrammarExercise[] {
  const { sentence, answer, gap } = unmark(marked);
  const wrongAnswers = distractors(answer);
  const options = [answer, ...wrongAnswers];
  const explanation = `${title}: ${answer} shakli berilgan formula va gap ma’nosiga mos keladi.`;
  const wrongSentence = gap.replace("___", wrongAnswers[0] ?? "—");
  const words = sentence.replace(/[?.!,]/g, "").split(/\s+/);
  const shuffled = [...words.slice(1), words[0]];
  const exercise = (
    id: number,
    type: GrammarExercise["type"],
    prompt: string,
    correctAnswer: string,
    extra: Partial<GrammarExercise> = {},
  ): GrammarExercise => ({ id: `${slug}-${id}`, type, prompt, correctAnswer, explanation, ...extra });

  return [
    exercise(1, "multiple-choice", gap, answer, { options }),
    exercise(2, "fill-blank", `Bo‘sh joyni to‘ldiring: ${gap}`, answer),
    exercise(3, "error-correction", `Xatoni tuzating: ${wrongSentence}`, sentence),
    exercise(4, "sentence-builder", "So‘zlardan to‘g‘ri gap tuzing.", sentence, { words: shuffled }),
    exercise(5, "rewrite", `Gapni ${title} qoidasi bilan aynan qayta yozing: ${sentence}`, sentence),
    exercise(6, "context-choice", `Qaysi gap ${title} uchun to‘g‘ri model?`, sentence, {
      context: "Kundalik ingliz tilida grammatik jihatdan aniq variantni tanlang.",
      options: [sentence, wrongSentence, gap.replace("___", wrongAnswers[1] ?? "—")],
    }),
    exercise(7, "multiple-choice", `To‘g‘ri shaklni tanlang: ${gap}`, answer, { options: [...options].reverse() }),
    exercise(8, "fill-blank", `Formula bo‘yicha yozing (${title}): ${gap}`, answer),
    exercise(9, "error-correction", `Bu gapdagi formani tuzating: ${wrongSentence}`, sentence),
    exercise(10, "sentence-builder", "Gap bo‘laklarini mantiqiy tartibga keltiring.", sentence, { words: [...shuffled].reverse() }),
    exercise(11, "rewrite", `Ma’noni o‘zgartirmasdan to‘g‘ri modelni yozing: ${wrongSentence}`, sentence),
    exercise(12, "context-choice", `Dars formulasiga mos gapni toping.`, sentence, {
      context: `${title} bo‘yicha nazorat savoli.`,
      options: [wrongSentence, sentence, gap.replace("___", wrongAnswers[2] ?? "—")],
    }),
    exercise(13, "multiple-choice", `Kontekstdagi yetishmayotgan formani belgilang: ${gap}`, answer, { options: [wrongAnswers[0] ?? "—", answer, ...wrongAnswers.slice(1)] }),
    exercise(14, "fill-blank", `Faqat yetishmayotgan qismni yozing: ${gap}`, answer),
    exercise(15, "sentence-builder", "Model gapni tiklang.", sentence, { words: shuffled }),
  ];
}

function topicToLesson(spec: TopicSpec, level: CefrGrammarLevel, order: number): GrammarLesson {
  const [slug, title, titleUz, category, formula, marked, purposeUz] = spec;
  const { sentence, answer, gap } = unmark(marked);
  const wrong = gap.replace("___", distractors(answer)[0] ?? "—");
  return {
    slug,
    level,
    title,
    titleUz,
    emoji: "📘",
    category,
    order,
    introduction: purposeUz,
    explanation: [
      purposeUz,
      `Asosiy qolip: ${formula}. Gapni tuzishda avval subject va yordamchi fe’lni, keyin asosiy formani tekshiring.`,
      `Model gap: ${sentence} Vaqt, subject yoki kontekst o‘zgarsa ham strukturaning asosiy qismini saqlang.`,
      ...(level === "C1" ? [`C1 darajada ${title} uslub, information focus va muallif pozitsiyasini ham o‘zgartiradi; strukturani faqat grammatik emas, pragmatik maqsad bilan tanlang.`] : []),
    ],
    formula,
    forms: [{ label: "Positive", formula, example: sentence }],
    highlights: [answer],
    comparisons: [{
      title: `${title}: correct form vs common error`,
      left: sentence,
      right: wrong,
      explanation: `${answer} formasi qoida va kontekstga mos; ikkinchi variantda shakl buzilgan.`,
    }],
    examples: [
      { en: sentence, uz: purposeUz },
      { en: `In class, the correct model was: “${sentence}”`, uz: "Darsdagi modelda aynan shu struktura saqlanadi." },
      { en: `A learner wrote this accurately: “${sentence}”`, uz: "Bu gap qoida bo‘yicha to‘g‘ri tuzilgan." },
      { en: `For revision, compare the form in: “${sentence}”`, uz: "Takrorlashda belgilangan formaga e’tibor bering." },
    ],
    mistakes: [
      { wrong, right: sentence, note: `${answer} formasi tushib qolmasligi yoki noto‘g‘ri o‘zgarmasligi kerak.` },
      { wrong: gap.replace("___", distractors(answer)[1] ?? "—"), right: sentence, note: `Subject, vaqt va ${title} formulasini birga tekshiring.` },
    ],
    quiz: generatedExercises(slug, marked, title).filter((item) => item.options).slice(0, 5).map((item) => ({
      q: item.prompt,
      options: item.options!,
      answer: item.options!.indexOf(item.correctAnswer),
      explanation: item.explanation,
    })),
    exercises: generatedExercises(slug, marked, title),
    prerequisites: [],
    relatedLessons: [],
    estimatedMinutes: level === "A1" ? 12 : level === "A2" ? 14 : level === "B1" ? 16 : level === "B2" ? 18 : 20,
    difficulty: level === "A1" ? 1 : level === "A2" ? 2 : level === "B1" ? 3 : level === "B2" ? 4 : 5,
  };
}

export function expansionLessons(level: CefrGrammarLevel, startOrder: number): GrammarLesson[] {
  return TOPICS_BY_LEVEL[level].map((spec, index) => topicToLesson(spec, level, startOrder + index));
}

export const EXPANSION_COUNTS: Record<CefrGrammarLevel, number> = {
  A1: A1_TOPICS.length,
  A2: A2_TOPICS.length,
  B1: B1_TOPICS.length,
  B2: B2_TOPICS.length,
  C1: C1_TOPICS.length,
};
