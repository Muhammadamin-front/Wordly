"""Build the seventh reviewed phrasal-verb and idiom batch.

All teaching copy is stored locally and reviewed in three languages. The
generator is deterministic and sends no data to external services.
"""
from __future__ import annotations

import csv
import json
import pathlib
import re
from dataclasses import dataclass


DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "phrasal_idioms_7.csv"
EXAMPLES_OUTPUT = DATA_DIR / "examples_phrasal_idioms_7.csv"
PHRASAL_EXPRESSIONS = DATA_DIR / "expressions" / "phrasal_verbs_7.jsonl"
IDIOM_EXPRESSIONS = DATA_DIR / "expressions" / "everyday_idioms_7.jsonl"

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
    examples: tuple[tuple[str, str, str], tuple[str, str, str], tuple[str, str, str]]
    synonyms: tuple[str, ...] = ()


PHRASAL = [
    Entry("dwell on", "phrasal", "B2", "bir masala haqida uzoq o'ylamoq yoki gapirmoq", "подробно останавливаться на",
          "To keep thinking or talking about something, especially something unpleasant.", "dwell on + noun/wh-clause", (
              ("Try not to dwell on one small mistake.", "Bitta kichik xato haqida uzoq o'ylamaslikka harakat qiling.", "Постарайтесь не зацикливаться на одной небольшой ошибке."),
              ("The report dwells on the risks but ignores the benefits.", "Hisobot xavflarga uzoq to'xtaladi, ammo afzalliklarni e'tiborsiz qoldiradi.", "В отчёте подробно рассматриваются риски, но игнорируются преимущества."),
              ("She refused to dwell on why the plan had failed.", "U reja nega muvaffaqiyatsiz bo'lgani haqida uzoq gapirishni istamadi.", "Она отказалась подробно обсуждать, почему план провалился.")), ("focus on", "linger over")),
    Entry("follow through on", "phrasal", "B2", "va'da yoki rejani oxirigacha bajarmoq", "довести обещание или план до конца",
          "To do what you promised or complete an intended action.", "follow through on + promise/plan/commitment", (
              ("Good leaders follow through on their promises.", "Yaxshi rahbarlar va'dalarini oxirigacha bajaradi.", "Хорошие руководители выполняют свои обещания до конца."),
              ("The team followed through on every action point.", "Jamoa har bir vazifani oxirigacha bajardi.", "Команда довела до конца каждый пункт плана."),
              ("She needs to follow through on her decision to practise daily.", "U har kuni mashq qilish qarorini amalga oshirishi kerak.", "Ей нужно довести до конца решение заниматься каждый день.")), ("carry out", "complete")),
    Entry("build on", "phrasal", "B2", "mavjud asos yoki yutuqni rivojlantirmoq", "развивать на основе достигнутого",
          "To use an existing idea, success, or foundation to make further progress.", "build on + noun", (
              ("The next lesson builds on what you learned today.", "Keyingi dars bugun o'rganganlaringiz asosida davom etadi.", "Следующий урок развивает то, что вы выучили сегодня."),
              ("We should build on the success of the pilot project.", "Sinov loyihasining muvaffaqiyati asosida rivojlanishimiz kerak.", "Нам следует развить успех пилотного проекта."),
              ("Her argument builds on recent research.", "Uning dalili so'nggi tadqiqotlarga asoslanadi.", "Её аргумент опирается на недавние исследования.")), ("develop", "expand on")),
    Entry("carry over", "phrasal", "B2", "keyingi vaqt yoki holatga o'tmoq", "переноситься на следующий период",
          "To continue to exist or be transferred into another time or situation.", "carry over / carry + noun + over", (
              ("Unused points carry over to the next month.", "Ishlatilmagan ballar keyingi oyga o'tadi.", "Неиспользованные баллы переносятся на следующий месяц."),
              ("Stress from work can carry over into family life.", "Ishdagi stress oilaviy hayotga ham o'tishi mumkin.", "Стресс на работе может переноситься в семейную жизнь."),
              ("We carried the remaining tasks over to Monday.", "Qolgan vazifalarni dushanbaga o'tkazdik.", "Мы перенесли оставшиеся задачи на понедельник.")), ("transfer", "continue")),
    Entry("drum up", "phrasal", "C1", "faol ravishda qiziqish yoki yordam jalb qilmoq", "активно привлекать интерес или поддержку",
          "To actively try to obtain support, interest, or business.", "drum up + support/interest/business", (
              ("The campaign aims to drum up support for local schools.", "Kampaniya mahalliy maktablar uchun yordam jalb qilishni maqsad qiladi.", "Кампания стремится заручиться поддержкой местных школ."),
              ("They offered free trials to drum up interest.", "Qiziqish uyg'otish uchun ular bepul sinov taklif qildi.", "Они предложили бесплатные пробные версии, чтобы вызвать интерес."),
              ("The sales team travelled abroad to drum up new business.", "Savdo jamoasi yangi mijozlar topish uchun xorijga bordi.", "Отдел продаж отправился за границу, чтобы привлечь новых клиентов.")), ("generate", "attract")),
    Entry("pan out", "phrasal", "B2", "kutilgandek natija bermoq", "сложиться или завершиться удачно",
          "To develop or end in a particular way, especially successfully.", "plan/situation + pan out", (
              ("The job offer did not pan out as expected.", "Ish taklifi kutilganidek natija bermadi.", "Предложение о работе сложилось не так, как ожидалось."),
              ("If the trial pans out, we will expand the programme.", "Sinov muvaffaqiyatli chiqsa, dasturni kengaytiramiz.", "Если испытание пройдёт успешно, мы расширим программу."),
              ("Nobody knew how the negotiations would pan out.", "Muzokaralar qanday yakunlanishini hech kim bilmasdi.", "Никто не знал, чем закончатся переговоры.")), ("work out", "develop")),
    Entry("tap into", "phrasal", "C1", "mavjud manba yoki imkoniyatdan foydalanmoq", "использовать ресурс или потенциал",
          "To make effective use of a source of knowledge, energy, or opportunity.", "tap into + resource/market/potential", (
              ("The course helps learners tap into their creativity.", "Kurs o'quvchilarga ijodkorligidan foydalanishga yordam beradi.", "Курс помогает учащимся раскрыть свой творческий потенциал."),
              ("Small firms can tap into global markets online.", "Kichik firmalar internet orqali global bozorlardan foydalana oladi.", "Малые компании могут выйти на мировые рынки через интернет."),
              ("We tapped into local knowledge before making the decision.", "Qaror qilishdan oldin mahalliy bilim va tajribadan foydalandik.", "Перед принятием решения мы воспользовались местными знаниями.")), ("make use of", "access")),
    Entry("turn around", "phrasal", "B2", "yomon vaziyatni keskin yaxshilamoq", "переломить ситуацию к лучшему",
          "To change a failing or difficult situation so that it becomes successful.", "turn + situation/business + around", (
              ("The new manager turned the struggling business around.", "Yangi menejer qiynalayotgan biznesni muvaffaqiyatli holatga keltirdi.", "Новый руководитель вывел испытывающий трудности бизнес из кризиса."),
              ("A clear routine can turn your study habits around.", "Aniq tartib o'qish odatlaringizni tubdan yaxshilashi mumkin.", "Чёткий распорядок может полностью улучшить ваши учебные привычки."),
              ("The team turned the match around in the final minutes.", "Jamoa so'nggi daqiqalarda o'yin vaziyatini o'zgartirdi.", "Команда переломила ход матча в последние минуты.")), ("transform", "revive")),
    Entry("work around", "phrasal", "B2", "to'siqni chetlab amaliy yechim topmoq", "найти обходное решение",
          "To find a practical way to deal with a problem or limitation.", "work around + problem/limitation", (
              ("We found a simple way to work around the technical limit.", "Texnik cheklovni chetlab o'tishning oddiy yo'lini topdik.", "Мы нашли простой способ обойти техническое ограничение."),
              ("Flexible hours help parents work around school schedules.", "Moslashuvchan ish vaqti ota-onalarga maktab jadvaliga moslashishga yordam beradi.", "Гибкий график помогает родителям учитывать школьное расписание."),
              ("Do not ignore the issue; work around it safely.", "Muammoni e'tiborsiz qoldirmang, uni xavfsiz yo'l bilan chetlab hal qiling.", "Не игнорируйте проблему — найдите безопасное обходное решение.")), ("circumvent", "find a solution to")),
    Entry("write off", "phrasal", "B2", "umidsiz yoki qiymatsiz deb hisoblamoq", "списать со счетов",
          "To decide that someone or something has no chance of success or value.", "write off + noun/pronoun / write + noun + off", (
              ("Do not write off a learner after one poor result.", "Bitta yomon natijadan keyin o'quvchini umidsiz deb hisoblamang.", "Не списывайте ученика со счетов после одного плохого результата."),
              ("Analysts had written the product off too early.", "Tahlilchilar mahsulotni juda erta umidsiz deb baholagan edi.", "Аналитики слишком рано списали продукт со счетов."),
              ("The bank wrote off part of the debt.", "Bank qarzning bir qismini hisobdan chiqardi.", "Банк списал часть долга.")), ("dismiss", "abandon")),
]


IDIOMS = [
    Entry("move the goalposts", "idioms", "C1", "jarayon davomida talablarni o'zgartirmoq", "менять правила по ходу дела",
          "To unfairly change the rules or requirements after work has begun.", "move the goalposts", (
              ("The client moved the goalposts after approving the design.", "Mijoz dizaynni tasdiqlagach, talablarni o'zgartirdi.", "Клиент изменил требования после утверждения дизайна."),
              ("It is hard to succeed when the goalposts keep moving.", "Talablar doim o'zgarib tursa, muvaffaqiyatga erishish qiyin.", "Трудно добиться успеха, когда правила постоянно меняются."),
              ("The examiner will not move the goalposts during the test.", "Imtihonchi test davomida baholash mezonlarini o'zgartirmaydi.", "Экзаменатор не станет менять критерии во время теста.")), ("change the rules",)),
    Entry("put your cards on the table", "idioms", "B2", "niyat va fikrni ochiq aytmoq", "раскрыть карты",
          "To state your intentions, opinions, or facts openly and honestly.", "put your cards on the table", (
              ("Let us put our cards on the table before we negotiate.", "Muzokaradan oldin niyatlarimizni ochiq aytaylik.", "Давайте раскроем карты до начала переговоров."),
              ("She put her cards on the table and asked for a promotion.", "U fikrini ochiq aytib, lavozim oshirishni so'radi.", "Она открыто изложила свою позицию и попросила повышения."),
              ("Once everyone put their cards on the table, we found a solution.", "Hamma fikrini ochiq aytgach, yechim topdik.", "Когда все открыто высказались, мы нашли решение.")), ("be frank", "be transparent")),
    Entry("throw someone under the bus", "idioms", "C1", "o'zini saqlash uchun birovni aybdor qilib ko'rsatmoq", "подставить кого-либо ради себя",
          "To betray or blame someone else in order to protect yourself.", "throw + person + under the bus", (
              ("A good leader never throws the team under the bus.", "Yaxshi rahbar hech qachon jamoani aybdor qilib ko'rsatmaydi.", "Хороший руководитель никогда не подставляет команду."),
              ("He threw his colleague under the bus to avoid criticism.", "U tanqiddan qochish uchun hamkasbini aybladi.", "Он подставил коллегу, чтобы избежать критики."),
              ("Do not throw others under the bus when a group project fails.", "Guruh loyihasi muvaffaqiyatsiz bo'lsa, boshqalarni ayblamang.", "Не подставляйте других, если групповой проект провалился.")), ("betray", "scapegoat")),
    Entry("go down in flames", "idioms", "C1", "shov-shuvli tarzda butunlay muvaffaqiyatsiz bo'lmoq", "с треском провалиться",
          "To fail suddenly, completely, and often publicly.", "plan/project + go down in flames", (
              ("The proposal went down in flames at the board meeting.", "Taklif boshqaruv yig'ilishida butunlay muvaffaqiyatsiz bo'ldi.", "Предложение с треском провалилось на заседании совета."),
              ("Their first launch went down in flames, but they learned from it.", "Ularning ilk taqdimoti muvaffaqiyatsiz bo'ldi, ammo ular undan saboq oldi.", "Их первый запуск с треском провалился, но они извлекли урок."),
              ("Without evidence, the argument will go down in flames.", "Dalilsiz bu fikr butunlay rad etiladi.", "Без доказательств этот аргумент полностью провалится.")), ("fail spectacularly",)),
    Entry("keep your ear to the ground", "idioms", "C1", "yangilik va o'zgarishlarni diqqat bilan kuzatmoq", "держать руку на пульсе",
          "To stay alert for new information, trends, or opportunities.", "keep your ear to the ground", (
              ("Keep your ear to the ground for internship opportunities.", "Amaliyot imkoniyatlari haqidagi yangiliklarni kuzatib boring.", "Следите за новостями о возможностях стажировки."),
              ("Good journalists keep their ears to the ground.", "Yaxshi jurnalistlar yangiliklarni doim diqqat bilan kuzatadi.", "Хорошие журналисты всегда держат руку на пульсе."),
              ("We kept our ear to the ground and noticed the trend early.", "Biz o'zgarishlarni kuzatib, tendensiyani erta payqadik.", "Мы внимательно следили за изменениями и рано заметили тенденцию.")), ("stay informed", "stay alert")),
    Entry("pull the plug", "idioms", "B2", "loyiha yoki faoliyatni butunlay to'xtatmoq", "прекратить или закрыть проект",
          "To stop an activity, project, or source of support completely.", "pull the plug on + noun", (
              ("The company pulled the plug on the outdated service.", "Kompaniya eskirgan xizmatni butunlay to'xtatdi.", "Компания полностью закрыла устаревший сервис."),
              ("Investors may pull the plug if costs keep rising.", "Xarajatlar oshaversa, investorlar yordamni to'xtatishi mumkin.", "Инвесторы могут прекратить поддержку, если расходы продолжат расти."),
              ("They pulled the plug on the experiment after a safety warning.", "Xavfsizlik ogohlantirishidan keyin tajribani to'xtatishdi.", "После предупреждения о безопасности эксперимент остановили.")), ("terminate", "shut down")),
    Entry("have a lot on your plate", "idioms", "B2", "zimmasida juda ko'p ish va mas'uliyat bo'lmoq", "иметь много дел и обязанностей",
          "To have many tasks, problems, or responsibilities to deal with.", "have a lot on your plate", (
              ("I cannot join another project; I have a lot on my plate.", "Yana bir loyihaga qo'shila olmayman, zimmamda ish ko'p.", "Я не могу взяться за ещё один проект — у меня и так много дел."),
              ("She has a lot on her plate during exam week.", "Imtihon haftasida uning zimmasida juda ko'p ish bor.", "Во время экзаменационной недели у неё очень много дел."),
              ("Ask for help when you have too much on your plate.", "Zimmangizda ish haddan tashqari ko'p bo'lsa, yordam so'rang.", "Просите о помощи, когда на вас слишком много задач.")), ("be very busy",)),
    Entry("be on thin ice", "idioms", "B2", "xatoga yo'l qo'ysa zarar ko'radigan xavfli vaziyatda bo'lmoq", "находиться в рискованном положении",
          "To be in a risky situation where one more mistake may cause serious trouble.", "be on thin ice with + person/organisation", (
              ("After missing two deadlines, he is on thin ice.", "Ikki muddatni o'tkazib yuborgach, u xavfli vaziyatda qoldi.", "После двух сорванных сроков он оказался в рискованном положении."),
              ("You are on thin ice with the client, so check every detail.", "Mijoz oldida vaziyatingiz nozik, shuning uchun har bir tafsilotni tekshiring.", "Ваше положение перед клиентом шаткое, поэтому проверьте каждую деталь."),
              ("The policy is on thin ice after the latest report.", "So'nggi hisobotdan keyin siyosat jiddiy xavf ostida qoldi.", "После последнего отчёта эта политика оказалась под серьёзной угрозой.")), ("be at risk",)),
    Entry("go against the grain", "idioms", "C1", "odatdagi fikr yoki o'z tabiatiga qarshi bormoq", "идти против течения или своих принципов",
          "To oppose what is usual, expected, or natural to you.", "go against the grain", (
              ("Her minimalist approach goes against the industry grain.", "Uning minimalistik yondashuvi sohadagi odatiy yo'nalishga qarshi.", "Её минималистичный подход идёт вразрез с нормами отрасли."),
              ("It goes against the grain for me to ignore a mistake.", "Xatoni e'tiborsiz qoldirish mening tabiatimga zid.", "Мне несвойственно игнорировать ошибку."),
              ("The researcher went against the grain and questioned the theory.", "Tadqiqotchi odatiy fikrga qarshi chiqib, nazariyani shubha ostiga oldi.", "Исследователь пошёл против общепринятого мнения и поставил теорию под сомнение.")), ("defy convention",)),
    Entry("get your ducks in a row", "idioms", "C1", "ishlarni oldindan tartibga solib tayyorlamoq", "заранее привести дела в порядок",
          "To organise your tasks and preparations carefully before acting.", "get your ducks in a row", (
              ("Get your ducks in a row before applying for the visa.", "Viza uchun topshirishdan oldin barcha ishlarni tartibga soling.", "Приведите все документы в порядок перед подачей на визу."),
              ("We need a week to get our ducks in a row.", "Barcha tayyorgarlikni tartibga solish uchun bizga bir hafta kerak.", "Нам нужна неделя, чтобы привести все дела в порядок."),
              ("She got her ducks in a row and delivered the project early.", "U ishlarni tartibga solib, loyihani muddatidan oldin topshirdi.", "Она всё организовала и сдала проект досрочно.")), ("get organised", "prepare carefully")),
]


ENTRIES = [*PHRASAL, *IDIOMS]


def normalize(value: str) -> str:
    value = value.casefold().replace("’", "'")
    return re.sub(r"[^a-z0-9']+", " ", value).strip()


def load_existing() -> set[str]:
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
    for path in (DATA_DIR / "expressions").glob("*.jsonl"):
        if path in {PHRASAL_EXPRESSIONS, IDIOM_EXPRESSIONS}:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                result.add(normalize(json.loads(line)["expression"]))
    return result


def expression_row(entry: Entry) -> dict:
    is_idiom = entry.kind == "idioms"
    mistakes = (
        ["Keep the wording fixed; do not translate this idiom word for word.", "Use the idiom only when its figurative meaning fits."]
        if is_idiom
        else [f"Keep the particle or preposition in '{entry.headword}'.", f"Use this structure: {entry.pattern}."]
    )
    return {
        "expression": entry.headword,
        "uzbek": entry.uzbek,
        "russian": entry.russian,
        "cefr": entry.level,
        "ielts_band": {"B2": "6.5", "C1": "7.5"}[entry.level],
        "category": "Everyday Idioms" if is_idiom else "Phrasal Verbs",
        "formality": "Informal" if is_idiom else "Neutral",
        "usage": entry.definition,
        "grammar_pattern": entry.pattern,
        "common_mistakes": mistakes,
        "alternatives": list(entry.synonyms),
        "example_sentences": [english for english, _, _ in entry.examples],
        "collocations": [entry.pattern],
        "synonyms": list(entry.synonyms),
        "opposites": [],
        "native_notes": (
            "Use this fixed expression selectively in natural conversation; clarity matters more than forcing an idiom."
            if is_idiom
            else "Learn the verb and particle as one unit, then practise the full object pattern."
        ),
    }


def main() -> None:
    if len(PHRASAL) != 10 or len(IDIOMS) != 10:
        raise RuntimeError("Batch 7 must contain 10 phrasal verbs and 10 idioms.")
    keys = [normalize(entry.headword) for entry in ENTRIES]
    if len(keys) != len(set(keys)):
        raise RuntimeError("Duplicate entry inside batch 7.")
    conflicts = set(keys) & load_existing()
    if conflicts:
        raise RuntimeError(f"Entries already exist in the corpus: {sorted(conflicts)}")

    corpus_rows = []
    extra_rows = []
    for index, entry in enumerate(ENTRIES):
        pos = "idiom" if entry.kind == "idioms" else "phrasal verb"
        corpus_rows.append({
            "headword": entry.headword,
            "pos": pos,
            "cefr_level": entry.level,
            "translation_uz": entry.uzbek,
            "translation_ru": entry.russian,
            "definition_en": entry.definition,
            "ipa": "",
            "frequency_rank": str(22001 + index * 2),
            "category": entry.kind,
            "example_en": entry.examples[0][0],
            "example_uz": entry.examples[0][1],
            "example_ru": entry.examples[0][2],
            "synonyms": " | ".join(entry.synonyms),
            "antonyms": "",
            "word_family": entry.pattern,
            "common_mistake": expression_row(entry)["common_mistakes"][0],
        })
        for example in entry.examples[1:]:
            extra_rows.append({
                "headword": entry.headword,
                "pos": pos,
                "example_en": example[0],
                "example_uz": example[1],
                "example_ru": example[2],
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
    print("generated: 10 phrasal verbs, 10 idioms, 60 localized examples")


if __name__ == "__main__":
    main()
