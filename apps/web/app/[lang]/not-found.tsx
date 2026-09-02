"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Inlined rather than pulled from the dictionary loader: not-found.tsx
// receives no props at all in this Next.js version (confirmed by a failed
// build — it is not passed `params` the way page.tsx is), so there is no
// server-side way to await the full dictionary here.
const COPY = {
  uz: { title: "Sahifa topilmadi", body: "Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.", home: "Bosh sahifaga qaytish" },
  ru: { title: "Страница не найдена", body: "Запрашиваемая страница не существует или была перемещена.", home: "Вернуться на главную" },
  en: { title: "Page not found", body: "The page you're looking for doesn't exist or has moved.", home: "Back to home" },
} as const;

export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;
  const locale = lang === "ru" || lang === "en" ? lang : "uz";
  const t = COPY[locale];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-[60svh] w-full max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <div className="relative size-28 overflow-hidden rounded-2xl border-2 border-line shadow-[4px_5px_0_rgba(0,0,0,0.15)] sm:size-32">
        <Image
          src="/images/vocora-cat-tutor-poster.png"
          alt=""
          fill
          sizes="128px"
          className="object-cover"
        />
      </div>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-brand-600">404</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft sm:text-base">{t.body}</p>
      <Link
        href={`/${locale}`}
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary-hover dark:text-brand-950"
      >
        {t.home}
      </Link>
    </main>
  );
}
