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
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(50,108,255,0.12),transparent_34%,rgba(16,201,150,0.12)_62%,transparent)]"
      />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo lang={lang} className="text-2xl" />
        </div>
        <div className="surface-panel rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-black text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
