import { Quote, Star } from "lucide-react";
import type { CSSProperties } from "react";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

import styles from "./testimonials.module.css";

/** Seconds for one full pass. Scaled by row so the two rows never fall into
 *  step with each other, which would read as one block sliding. */
const ROW_SECONDS = [64, 78];

type Review = {
  /** Stable across locales so the same person keeps the same slide. */
  id: string;
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
      {
        id: "dilnoza",
        name: "Dilnoza Karimova",
        role: "IELTS 7.5, Toshkent",
        quote:
          "Writing'da Task 1 doim qiynardi. Bu yerdagi tahlil har bir gapimni ko'rsatib berdi va uch oyda 6.0 dan 7.5 ga chiqdim.",
      },
      {
        id: "jasur",
        name: "Jasur To'xtayev",
        role: "Talaba, Samarqand",
        quote:
          "Kuniga 15 daqiqa takrorlash — shuning o'zi kifoya bo'ldi. So'zlar endi esimdan chiqmayapti, chunki tizim o'zi qachon takrorlashni biladi.",
      },
      {
        id: "malika",
        name: "Malika Rasulova",
        role: "Ingliz tili o'qituvchisi",
        quote:
          "O'quvchilarimga tavsiya qilaman. Izohlar o'zbek tilida bo'lgani uchun boshlang'ich daraja ham hech kimdan yordam so'ramay ishlay oladi.",
      },
      {
        id: "sardor",
        name: "Sardor Ne'matov",
        role: "IELTS 8.0, Buxoro",
        quote:
          "To'liq mock imtihon haqiqiy imtihonning o'zi. Imtihon kuni hech qanday yangilik bo'lmadi — hammasi tanish edi.",
      },
      {
        id: "nigora",
        name: "Nigora Yusupova",
        role: "Marketolog, Namangan",
        quote:
          "Talaffuz mashqlari eng yoqqan qismi. Ishda inglizcha uchrashuvlarda endi ikkilanmay gapiraman.",
      },
      {
        id: "otabek",
        name: "Otabek Alimov",
        role: "Dasturchi, Toshkent",
        quote:
          "Grammatika darslari qisqa va aniq. Bir yilda o'rgana olmagan narsalarimni bir necha hafta ichida tushundim.",
      },
    ],
  },
  ru: {
    kicker: "Отзывы учеников",
    title: "Те, кто дошёл до своего результата с Vocora",
    rated: "5 из 5",
    starsLabel: "5 звёзд из 5",
    reviews: [
      {
        id: "dilnoza",
        name: "Дилноза Каримова",
        role: "IELTS 7.5, Ташкент",
        quote:
          "Task 1 в Writing всегда был моей слабостью. Разбор по предложениям показал, что именно я делаю не так, и за три месяца я выросла с 6.0 до 7.5.",
      },
      {
        id: "jasur",
        name: "Жасур Тухтаев",
        role: "Студент, Самарканд",
        quote:
          "15 минут повторения в день — и этого хватило. Слова наконец перестали выветриваться, система сама знает, когда их вернуть.",
      },
      {
        id: "malika",
        name: "Малика Расулова",
        role: "Преподаватель английского",
        quote:
          "Рекомендую своим ученикам. Объяснения на родном языке — даже начинающий занимается самостоятельно, без моей помощи.",
      },
      {
        id: "sardor",
        name: "Сардор Нематов",
        role: "IELTS 8.0, Бухара",
        quote:
          "Полный пробный экзамен ощущается как настоящий. В день экзамена не было ни одного сюрприза.",
      },
      {
        id: "nigora",
        name: "Нигора Юсупова",
        role: "Маркетолог, Наманган",
        quote:
          "Больше всего понравилась работа над произношением. На английских созвонах я больше не запинаюсь.",
      },
      {
        id: "otabek",
        name: "Отабек Алимов",
        role: "Разработчик, Ташкент",
        quote:
          "Уроки грамматики короткие и по делу. За несколько недель понял то, что не давалось мне год.",
      },
    ],
  },
  en: {
    kicker: "Learner reviews",
    title: "People who reached their score with Vocora",
    rated: "5 out of 5",
    starsLabel: "5 stars out of 5",
    reviews: [
      {
        id: "dilnoza",
        name: "Dilnoza Karimova",
        role: "IELTS 7.5, Tashkent",
        quote:
          "Task 1 writing was always where I lost marks. The sentence-by-sentence feedback showed me exactly what was wrong, and I went from 6.0 to 7.5 in three months.",
      },
      {
        id: "jasur",
        name: "Jasur Tokhtaev",
        role: "Student, Samarkand",
        quote:
          "Fifteen minutes of review a day turned out to be enough. Words finally stick, because the system decides when to bring them back.",
      },
      {
        id: "malika",
        name: "Malika Rasulova",
        role: "English teacher",
        quote:
          "I recommend it to my students. The explanations are in their own language, so even beginners can work without asking anyone for help.",
      },
      {
        id: "sardor",
        name: "Sardor Nematov",
        role: "IELTS 8.0, Bukhara",
        quote:
          "The full mock exam feels like the real thing. On test day there were no surprises left.",
      },
      {
        id: "nigora",
        name: "Nigora Yusupova",
        role: "Marketer, Namangan",
        quote:
          "The pronunciation practice was my favourite part. I no longer hesitate on English calls at work.",
      },
      {
        id: "otabek",
        name: "Otabek Alimov",
        role: "Developer, Tashkent",
        quote:
          "The grammar lessons are short and precise. In a few weeks I understood what a year of studying never made clear.",
      },
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
  const half = Math.ceil(copy.reviews.length / 2);
  const rows = [copy.reviews.slice(0, half), copy.reviews.slice(half)];

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
