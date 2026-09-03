"use client";

import { CalendarClock, Check, HelpCircle, Sparkles, Zap } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import type { Locale } from "@/lib/locales";

/** The case for paying, made before the price is shown.
 *
 *  The page used to open on a grid of numbers, which asks a visitor to judge
 *  the cost of something whose value they have not been told yet. This block
 *  answers, in order, the four questions a buyer actually has — what do I
 *  get, how soon, what does staying free cost me, and how sure can I be —
 *  and only then hands them the prices below.
 *
 *  Every number here is real: the free allowances are the ones the API
 *  enforces (3 writing checks a week, 1 full mock a month), and the countdown
 *  is the learner's own exam date. Nothing is promised that the product does
 *  not already do. */

const FREE_WRITING_CHECKS_PER_WEEK = 3;
const FREE_MOCKS_PER_MONTH = 1;

type Copy = {
  kicker: string;
  title: string;
  lead: string;
  daysLeft: (days: number) => string;
  noDate: string;
  windowTitle: string;
  freeLabel: string;
  premiumLabel: string;
  mocks: (n: number) => string;
  checks: (n: number) => string;
  unlimited: string;
  qGet: string;
  aGet: string[];
  qWhen: string;
  aWhen: string;
  qSure: string;
  aSure: string;
};

const COPY: Record<Locale, Copy> = {
  uz: {
    kicker: "Nega Premium",
    title: "Imtihon kuni kelganda tayyor bo'lasiz",
    lead: "Band ballingizni ko'taradigan narsa — mashq soni emas, har bir xatoning sababini bilish. Premium aynan shu chegarani olib tashlaydi.",
    daysLeft: (days) => `Imtihoningizga ${days} kun qoldi`,
    noDate: "Imtihon sanangizni belgilasangiz, qolgan vaqtga qarab hisoblab beramiz",
    windowTitle: "Shu vaqt ichida nima ulguradi",
    freeLabel: "Bepul reja",
    premiumLabel: "Premium",
    mocks: (n) => `${n} ta to'liq mock`,
    checks: (n) => `${n} ta AI writing tekshiruvi`,
    unlimited: "Cheklovsiz — qancha kerak bo'lsa",
    qGet: "Nima olaman?",
    aGet: [
      "Cheklovsiz to'liq mock imtihonlar",
      "Cheklovsiz AI writing tekshiruvi — har gap bo'yicha",
      "Speaking Coach — haftasiga jonli suhbat daqiqalari",
      "Barcha darajalar: A1 dan C2 gacha, grammatika kursi to'liq",
    ],
    qWhen: "Qachon natija ko'raman?",
    aWhen: "Birinchi insho tekshiruvidayoq: xato, tuzatish va nega shundayligi — 60 soniyada, band 4 ta mezon bo'yicha ajratilgan holda.",
    qSure: "Qanchalik ishonch hosil qilaman?",
    aSure: "To'lashdan oldin sinab ko'ring: bepul rejada 1 ta to'liq mock va 3 ta writing tekshiruvi bor, karta talab qilinmaydi. Feedback sizga yoqmasa — pul sarflamagan bo'lasiz.",
  },
  ru: {
    kicker: "Зачем Premium",
    title: "Быть готовым в день экзамена",
    lead: "Балл поднимает не количество попыток, а понимание причины каждой ошибки. Premium снимает именно этот лимит.",
    daysLeft: (days) => `До вашего экзамена ${days} дн.`,
    noDate: "Укажите дату экзамена — посчитаем по оставшемуся времени",
    windowTitle: "Что успеете за это время",
    freeLabel: "Бесплатный план",
    premiumLabel: "Premium",
    mocks: (n) => `${n} полных пробных экзамена`,
    checks: (n) => `${n} проверок эссе ИИ`,
    unlimited: "Без лимита — сколько нужно",
    qGet: "Что я получу?",
    aGet: [
      "Полные пробные экзамены без лимита",
      "Проверка эссе ИИ без лимита — по каждому предложению",
      "Speaking Coach — минуты живого разговора в неделю",
      "Все уровни: от A1 до C2, полный курс грамматики",
    ],
    qWhen: "Когда увижу результат?",
    aWhen: "На первой же проверке: ошибка, исправление и почему — за 60 секунд, с разбором балла по четырём критериям.",
    qSure: "Как убедиться заранее?",
    aSure: "Попробуйте до оплаты: в бесплатном плане есть 1 полный пробный экзамен и 3 проверки эссе, карта не нужна. Не понравится — вы ничего не потратили.",
  },
  en: {
    kicker: "Why Premium",
    title: "Be ready on exam day",
    lead: "What raises a band is not the number of attempts but knowing the reason behind each mistake. Premium removes exactly that ceiling.",
    daysLeft: (days) => `${days} days until your exam`,
    noDate: "Set your exam date and we will work it out against the time you have left",
    windowTitle: "What fits in that time",
    freeLabel: "Free plan",
    premiumLabel: "Premium",
    mocks: (n) => `${n} full mock exams`,
    checks: (n) => `${n} AI writing checks`,
    unlimited: "No limit — as many as you need",
    qGet: "What do I get?",
    aGet: [
      "Unlimited full mock exams",
      "Unlimited AI writing checks — sentence by sentence",
      "Speaking Coach — live conversation minutes each week",
      "Every level: A1 to C2, the full grammar course",
    ],
    qWhen: "How soon will I see it work?",
    aWhen: "On the very first check: the error, the fix and why — in about a minute, with the band broken down across all four criteria.",
    qSure: "How can I be sure first?",
    aSure: "Try it before you pay: the free plan includes one full mock and three writing checks, and asks for no card. If the feedback is not for you, you have spent nothing.",
  },
};

function daysUntil(iso: string): number | null {
  const exam = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(exam.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((exam.getTime() - today.getTime()) / 86_400_000);
  return days > 0 ? days : null;
}

export function ValueCase({ lang }: { lang: Locale }) {
  const { user } = useAuth();
  const t = COPY[lang];

  const examDate = user?.profile.exam_date ?? null;
  const days = examDate ? daysUntil(examDate) : null;
  // The window the learner actually has, or a plain month when they have not
  // told us — never a made-up deadline.
  const windowDays = days ?? 30;
  const freeMocks = Math.max(1, Math.floor(windowDays / 30)) * FREE_MOCKS_PER_MONTH;
  const freeChecks = Math.max(1, Math.floor(windowDays / 7)) * FREE_WRITING_CHECKS_PER_WEEK;

  return (
    <section className="mt-7" aria-labelledby="value-case-title">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(232,201,154,0.28)] bg-[rgba(255,248,234,0.07)] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[rgba(243,230,203,0.82)]">
        <Sparkles className="size-3" aria-hidden />
        {t.kicker}
      </p>

      <h2
        id="value-case-title"
        className="mt-3 max-w-[24ch] font-display text-3xl leading-[1.06] tracking-wide text-[#fff8ea] sm:text-4xl"
      >
        {t.title}
      </h2>
      <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-7 text-[rgba(243,230,203,0.78)]">{t.lead}</p>

      {/* The cost of staying on the free plan, in the learner's own window.
          Loss is the stronger motivator, so it is stated as arithmetic they
          can check rather than as a warning. */}
      <div className="mt-6 rounded-[18px] border border-[rgba(232,201,154,0.22)] bg-[rgba(255,248,234,0.05)] p-5">
        <p className="inline-flex items-center gap-2 text-sm font-black text-[#fff8ea]">
          <CalendarClock className="size-4 text-[#d9b784]" aria-hidden />
          {days ? t.daysLeft(days) : t.noDate}
        </p>

        <p className="mt-4 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[rgba(243,230,203,0.6)]">
          {t.windowTitle}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] border border-[rgba(232,201,154,0.18)] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-[rgba(243,230,203,0.6)]">{t.freeLabel}</p>
            <p className="mt-1.5 text-[0.9375rem] font-bold leading-6 text-[rgba(243,230,203,0.9)]">
              {t.mocks(freeMocks)}
              <br />
              {t.checks(freeChecks)}
            </p>
          </div>
          <div className="rounded-[14px] border border-[#d9b784]/55 bg-[#d9b784]/12 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-[#e8c99a]">{t.premiumLabel}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[0.9375rem] font-bold leading-6 text-[#fff8ea]">
              <Zap className="size-4 shrink-0 text-[#e8c99a]" aria-hidden />
              {t.unlimited}
            </p>
          </div>
        </div>
      </div>

      {/* The three questions the price alone cannot answer. */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-[16px] border border-[rgba(232,201,154,0.2)] bg-[rgba(255,248,234,0.04)] p-5">
          <p className="text-sm font-black text-[#fff8ea]">{t.qGet}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {t.aGet.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[0.875rem] leading-6 text-[rgba(243,230,203,0.86)]">
                <Check className="mt-1 size-3.5 shrink-0 text-[#9fc4b8]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[16px] border border-[rgba(232,201,154,0.2)] bg-[rgba(255,248,234,0.04)] p-5">
          <p className="text-sm font-black text-[#fff8ea]">{t.qWhen}</p>
          <p className="mt-3 text-[0.875rem] leading-6 text-[rgba(243,230,203,0.86)]">{t.aWhen}</p>
        </div>

        {/* Risk reversal, and an honest one: the free tier really does carry
            a full mock and three checks, so "try before you pay" is a fact
            about the product rather than a refund promise nobody made. */}
        <div className="rounded-[16px] border border-[#9fc4b8]/40 bg-[#9fc4b8]/10 p-5">
          <p className="inline-flex items-center gap-1.5 text-sm font-black text-[#fff8ea]">
            <HelpCircle className="size-4 text-[#9fc4b8]" aria-hidden />
            {t.qSure}
          </p>
          <p className="mt-3 text-[0.875rem] leading-6 text-[rgba(243,230,203,0.9)]">{t.aSure}</p>
        </div>
      </div>
    </section>
  );
}
