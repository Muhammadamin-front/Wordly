// Bypasses app/[lang]/layout.tsx entirely (see next.config.ts's
// experimental.globalNotFound and the Next.js docs for why: this app's only
// layout lives under the [lang] dynamic segment, so there's no shared root
// layout to compose a 404 from). Because of that bypass, this file imports
// its own copy of the global stylesheet and cannot read the visitor's
// locale — "/" is always a safe link, proxy.ts resolves it to the right one.
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Vocora",
  description: "The page you're looking for doesn't exist or has moved.",
};

export default function GlobalNotFound() {
  return (
    <html lang="uz">
      <body>
        <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-page px-5 py-20 text-center">
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
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Sahifa topilmadi
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft sm:text-base">
            Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary-hover dark:text-brand-950"
          >
            Vocora
          </Link>
        </main>
      </body>
    </html>
  );
}
