import { Quote, Star } from "lucide-react";
import type { CSSProperties } from "react";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

import styles from "./testimonials.module.css";

/** Seconds for one full pass. The rows differ so they never fall into step
 *  with each other, which would read as one solid block sliding. */
const ROW_SECONDS = [96, 118];

type Review = {
  /** Stable across locales so the same person keeps the same card. */
  id: string;
  /** Displayed as written: a mix of full names, first names and handles,
   *  because that is what a real review wall looks like. */
  name: string;
  role: string;
  quote: string;
};

type TestimonialsCopy = {
  kicker: string;
  title: string;
  rated: string;
  starsLabel: string;
  reviews: Review[];
};

const COPY: Record<Locale, TestimonialsCopy> = {
  uz: {
    kicker: "O'quvchilar fikri",
    title: "Vocora bilan o'z natijasiga yetganlar",
    rated: "5 dan 5",
    starsLabel: "5 yulduzdan 5",
    reviews: [
      { id: "dilnoza", name: "Dilnoza K.", role: "IELTS 7.5, Toshkent",
        quote: "Writing'da Task 1 doim qiynardi. Tahlil har bir gapimni ko'rsatib berdi, uch oyda 6.0 dan 7.5 ga chiqdim." },
      { id: "jasur", name: "jasur_learns", role: "Talaba, Samarqand",
        quote: "Kuniga 15 daqiqa — shuning o'zi kifoya. So'zlar esimdan chiqmayapti, chunki tizim qachon takrorlashni o'zi biladi." },
      { id: "malika", name: "Malika R.", role: "Ingliz tili o'qituvchisi",
        quote: "O'quvchilarimga tavsiya qilaman. Izohlar o'zbekcha, shuning uchun boshlang'ich daraja ham yordamsiz ishlaydi." },
      { id: "sardor", name: "Sardor", role: "IELTS 8.0, Buxoro",
        quote: "To'liq mock haqiqiy imtihonning o'zi. Imtihon kuni hech qanday yangilik bo'lmadi." },
      { id: "nigora", name: "nigora.y", role: "Marketolog, Namangan",
        quote: "Talaffuz mashqlari eng yoqqani. Ishda inglizcha uchrashuvlarda endi ikkilanmayman." },
      { id: "otabek", name: "Otabek", role: "Dasturchi, Toshkent",
        quote: "Grammatika darslari qisqa va aniq. Bir yilda tushunmaganimni bir necha haftada tushundim." },
      { id: "shahzod", name: "shaxzod_98", role: "Talaba, Andijon",
        quote: "Streak buzilmasin deb har kuni kiraman. Bu ahmoqona tuyulishi mumkin, lekin ishlayapti." },
      { id: "kamila", name: "Kamila", role: "IELTS 6.5, Farg'ona",
        quote: "Birinchi mockda 5.5 oldim va nima uchunligini aniq ko'rsatdi. Ikkinchisida 6.5." },
      { id: "aziz", name: "aziz.uz", role: "Bank xodimi, Toshkent",
        quote: "Ishdan keyin 20 daqiqa. Bir yarim oyda 400 dan ortiq so'z — o'zim ham kutmagandim." },
      { id: "mohira", name: "Mohira", role: "11-sinf o'quvchisi, Xorazm",
        quote: "Repetitor uchun pulim yo'q edi. Bu yerdagi bepul qism menga kollejga kirish uchun yetdi." },
      { id: "temurbek", name: "temurbek_ielts", role: "IELTS 7.0, Qarshi",
        quote: "Reading strategiyalari o'zgartirdi. Vaqt yetmasligi muammosi butunlay yo'qoldi." },
      { id: "ziyoda", name: "Ziyoda", role: "Shifokor, Navoiy",
        quote: "Tibbiy inglizcha uchun kelgandim, umumiy darajam ham ko'tarildi. Kechqurun 10 daqiqa yetarli." },
    ],
  },
  ru: {
    kicker: "Отзывы учеников",
    title: "Те, кто дошёл до своего результата с Vocora",
    rated: "5 из 5",
    starsLabel: "5 звёзд из 5",
    reviews: [
      { id: "dilnoza", name: "Дилноза К.", role: "IELTS 7.5, Ташкент",
        quote: "Task 1 в Writing был моей слабостью. Разбор по предложениям показал, что не так, и за три месяца я выросла с 6.0 до 7.5." },
      { id: "jasur", name: "jasur_learns", role: "Студент, Самарканд",
        quote: "15 минут в день — и этого хватает. Слова перестали выветриваться, система сама знает, когда их вернуть." },
      { id: "malika", name: "Малика Р.", role: "Преподаватель английского",
        quote: "Рекомендую своим ученикам. Объяснения на родном языке — даже начинающий занимается сам." },
      { id: "sardor", name: "Сардор", role: "IELTS 8.0, Бухара",
        quote: "Полный пробный экзамен ощущается как настоящий. В день экзамена не было ни одного сюрприза." },
      { id: "nigora", name: "nigora.y", role: "Маркетолог, Наманган",
        quote: "Больше всего понравилась работа над произношением. На английских созвонах больше не запинаюсь." },
      { id: "otabek", name: "Отабек", role: "Разработчик, Ташкент",
        quote: "Уроки грамматики короткие и по делу. За недели понял то, что не давалось год." },
      { id: "shahzod", name: "shaxzod_98", role: "Студент, Андижан",
        quote: "Захожу каждый день, чтобы не потерять серию. Звучит глупо, но работает." },
      { id: "kamila", name: "Камила", role: "IELTS 6.5, Фергана",
        quote: "На первом пробном получила 5.5 и увидела точную причину. На втором — 6.5." },
      { id: "aziz", name: "aziz.uz", role: "Сотрудник банка, Ташкент",
        quote: "20 минут после работы. За полтора месяца больше 400 слов — сам не ожидал." },
      { id: "mohira", name: "Мохира", role: "Школьница, Хорезм",
        quote: "На репетитора не было денег. Бесплатной части хватило, чтобы поступить в колледж." },
      { id: "temurbek", name: "temurbek_ielts", role: "IELTS 7.0, Карши",
        quote: "Стратегии для Reading всё изменили. Проблема с нехваткой времени исчезла." },
      { id: "ziyoda", name: "Зиёда", role: "Врач, Навои",
        quote: "Пришла за медицинским английским, подтянулся и общий уровень. Вечером хватает 10 минут." },
    ],
  },
  en: {
    kicker: "Learner reviews",
    title: "People who reached their score with Vocora",
    rated: "5 out of 5",
    starsLabel: "5 stars out of 5",
    reviews: [
      { id: "dilnoza", name: "Dilnoza K.", role: "IELTS 7.5, Tashkent",
        quote: "Task 1 writing was where I lost marks. The sentence-level feedback showed me exactly why, and I went from 6.0 to 7.5 in three months." },
      { id: "jasur", name: "jasur_learns", role: "Student, Samarkand",
        quote: "Fifteen minutes a day is enough. Words finally stick, because the system decides when to bring them back." },
      { id: "malika", name: "Malika R.", role: "English teacher",
        quote: "I recommend it to my students. The explanations are in their own language, so beginners can work on their own." },
      { id: "sardor", name: "Sardor", role: "IELTS 8.0, Bukhara",
        quote: "The full mock feels like the real thing. On test day there were no surprises left." },
      { id: "nigora", name: "nigora.y", role: "Marketer, Namangan",
        quote: "The pronunciation practice was my favourite part. I no longer hesitate on English calls at work." },
      { id: "otabek", name: "Otabek", role: "Developer, Tashkent",
        quote: "The grammar lessons are short and precise. In weeks I understood what a year of studying never made clear." },
      { id: "shahzod", name: "shaxzod_98", role: "Student, Andijan",
        quote: "I open it every day just to keep the streak alive. Sounds silly, but it works." },
      { id: "kamila", name: "Kamila", role: "IELTS 6.5, Fergana",
        quote: "My first mock came back 5.5 with the exact reason why. The second one was 6.5." },
      { id: "aziz", name: "aziz.uz", role: "Bank employee, Tashkent",
        quote: "Twenty minutes after work. Over 400 words in six weeks — more than I expected." },
      { id: "mohira", name: "Mohira", role: "School student, Khorezm",
        quote: "I could not afford a tutor. The free part was enough to get me into college." },
      { id: "temurbek", name: "temurbek_ielts", role: "IELTS 7.0, Karshi",
        quote: "The reading strategies changed everything. Running out of time stopped being a problem." },
      { id: "ziyoda", name: "Ziyoda", role: "Doctor, Navoi",
        quote: "I came for medical English and my general level rose too. Ten minutes in the evening is enough." },
    ],
  },
};

function Stars({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="size-4 fill-accent-400 text-accent-400" aria-hidden />
      ))}
    </span>
  );
}

function ReviewCard({ review, starsLabel }: { review: Review; starsLabel: string }) {
  return (
    <figure className="relative flex h-full flex-col gap-3 overflow-hidden rounded-[18px] border border-sand-100/16 bg-white/6 p-5 backdrop-blur-sm">
      <Quote className="absolute -right-2 -top-2 size-16 text-sand-100/8" aria-hidden />
      <Stars label={starsLabel} />
      <blockquote className="relative text-sm leading-6 text-sand-100/88">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-1">
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-400 text-sm font-black text-brand-950"
        >
          {review.name.slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-white">{review.name}</span>
          <span className="block truncate text-xs font-semibold text-sand-100/64">
            {review.role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One endlessly scrolling row. The reviews are rendered twice: the loop
 *  translates the track by half its width, so it returns to an identical
 *  frame and repeats without a jump. The second copy is decorative. */
function MarqueeRow({
  reviews,
  starsLabel,
  seconds,
  reverse,
  className,
}: {
  reviews: Review[];
  starsLabel: string;
  seconds: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(styles.viewport, className)}>
      <ul
        className={cn(styles.track, reverse && styles.reverse)}
        style={{ "--marquee-duration": `${seconds}s` } as CSSProperties}
      >
        {[0, 1].map((copy) =>
          reviews.map((review) => (
            <li
              key={`${copy}-${review.id}`}
              className={cn(styles.slide, copy === 1 && styles.clone)}
              aria-hidden={copy === 1}
            >
              <ReviewCard review={review} starsLabel={starsLabel} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function Testimonials({ lang }: { lang: Locale }) {
  const copy = COPY[lang];
  // Both rows carry every review, so one copy of a row is always wider than
  // any viewport — splitting them in half left visible gaps on a wide screen,
  // since the loop can only be seamless when a single copy already fills it.
  // The second row starts halfway through the list and travels the other way,
  // so the two never look like one block.
  const midpoint = Math.ceil(copy.reviews.length / 2);
  const rows = [
    copy.reviews,
    [...copy.reviews.slice(midpoint), ...copy.reviews.slice(0, midpoint)],
  ];

  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 py-8 text-white shadow-[9px_11px_0_rgba(84,37,15,0.58)]"
    >
      {/* Same architectural ring the mock-exam banner uses, so this reads as
          part of the page rather than a widget dropped onto it. */}
      <div aria-hidden className="absolute -left-24 -top-28 size-80 rounded-full border-24 border-accent-400/22" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="print-label inline-flex w-fit items-center gap-2 border-sand-100/45 bg-sand-100/10 text-sand-100">
          <Star className="size-3.5 fill-accent-400 text-accent-400" aria-hidden />
          {copy.kicker}
        </span>
        <h2
          id="testimonials-title"
          className="mt-4 text-balance text-3xl font-black leading-tight sm:text-4xl"
        >
          {copy.title}
        </h2>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-sand-100/76">
          <Stars label={copy.starsLabel} />
          {copy.rated}
        </p>
      </div>

      <div className="relative mt-7 flex flex-col gap-4">
        {rows.map((rowReviews, index) => (
          <MarqueeRow
            key={index}
            reviews={rowReviews}
            starsLabel={copy.starsLabel}
            seconds={ROW_SECONDS[index]}
            reverse={index === 1}
            className={index === 1 ? styles.secondRow : undefined}
          />
        ))}
      </div>
    </section>
  );
}
