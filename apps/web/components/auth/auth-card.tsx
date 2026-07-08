import type { ReactNode } from "react";

import { Logo } from "@/components/site/logo";

export function AuthCard({
  lang,
  title,
  subtitle,
  children,
}: {
  lang: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent"
      />
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo lang={lang} className="text-2xl" />
        </div>
        <div className="rounded-xl2 border border-line bg-card p-6 shadow-xl shadow-brand-950/8 sm:p-8">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
