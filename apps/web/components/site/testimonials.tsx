"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

import styles from "./testimonials.module.css";

const AUTOPLAY_MS = 5500;

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
  previous: string;
  next: string;
  goTo: string;
  starsLabel: string;
  reviews: Review[];
};

const COPY: Record<Locale, TestimonialsCopy> = {
  uz: {
    kicker: "O'quvchilar fikri",
    title: "Vocora bilan o'z natijasiga yetganlar",
    rated: "5 dan 5",
    previous: "Oldingi fikr",
    next: "Keyingi fikr",
    goTo: "Fikrga o'tish",
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
    previous: "Предыдущий отзыв",
    next: "Следующий отзыв",
    goTo: "Перейти к отзыву",
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
    previous: "Previous review",
    next: "Next review",
    goTo: "Go to review",
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
        <Star key={i} className="size-4 fill-accent-500 text-accent-500" aria-hidden />
      ))}
    </span>
  );
}

export function Testimonials({ lang }: { lang: Locale }) {
  const copy = COPY[lang];
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = copy.reviews.length;

  const scrollTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[next] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft });
  }, []);

  // The visible index follows the scroll position rather than the click that
  // caused it, so dragging the track by hand keeps the dots honest.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slides = Array.from(track!.children) as HTMLElement[];
        const left = track!.scrollLeft + track!.offsetLeft;
        let nearest = 0;
        let best = Infinity;
        slides.forEach((slide, i) => {
          const distance = Math.abs(slide.offsetLeft - left);
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        });
        setIndex(nearest);
      });
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const next = (index + 1) % count;
      setIndex(next);
      scrollTo(next);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, index, count, scrollTo]);

  function step(delta: number) {
    const next = (index + delta + count) % count;
    setIndex(next);
    scrollTo(next);
  }

  return (
    <div
      className="surface-panel rounded-[22px] p-6 sm:p-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-brand-600">{copy.kicker}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black text-brand-950 dark:text-white sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink-soft">
            <Stars label={copy.starsLabel} />
            {copy.rated}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={copy.previous}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={copy.next}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <ul ref={trackRef} className={cn(styles.viewport, "mt-6")}>
        {copy.reviews.map((review) => (
          <li key={review.id} className={styles.slide}>
            <figure className="flex h-full flex-col gap-4 rounded-[18px] border border-line bg-card p-5">
              <Stars label={copy.starsLabel} />
              <blockquote className="text-sm leading-6 text-ink">“{review.quote}”</blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white"
                >
                  {review.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-brand-950 dark:text-white">
                    {review.name}
                  </span>
                  <span className="block truncate text-xs font-semibold text-ink-soft">
                    {review.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center gap-2">
        {copy.reviews.map((review, i) => (
          <button
            key={review.id}
            type="button"
            aria-label={`${copy.goTo} ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => {
              setIndex(i);
              scrollTo(i);
            }}
            className="group inline-flex h-11 items-center px-1 focus-visible:outline-none"
          >
            <span
              aria-hidden
              className={cn(
                "block h-2 rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-focus",
                i === index ? "w-6 bg-brand-600" : "w-2 bg-line group-hover:bg-brand-400"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
