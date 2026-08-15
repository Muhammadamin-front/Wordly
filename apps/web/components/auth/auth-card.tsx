import type { ReactNode } from "react";

import { PaperCutLeaves } from "@/components/auth/paper-cut-leaves";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import type { Locale } from "@/lib/locales";

/** Auth shell.
 *
 *  `showcase` renders the full-bleed split card: the form on a sheet of pale
 *  paper, the paper-cut foliage cut into the right half. On narrow screens the
 *  two stack — the foliage becomes a band behind the heading and the form sits
 *  on a raised card over it, which is how the phone layout in the design works.
 */
export function AuthCard({
  lang,
  title,
  subtitle,
  children,
  showcase = false,
}: {
  lang: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  showcase?: boolean;
}) {
  if (!showcase) {
    return (
      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
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

  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-x-hidden bg-auth-page p-0 sm:p-6 lg:p-10">
      <div aria-hidden className="auth-page-glow" />

      <div className="relative grid w-full max-w-[1180px] overflow-hidden bg-auth-sheet shadow-auth-card sm:rounded-[32px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Foliage. On narrow screens it becomes a band the form card overlaps,
            which is how the phone layout in the design reads. */}
        <div className="relative order-first h-40 overflow-hidden sm:h-52 lg:order-last lg:h-auto">
          <PaperCutLeaves className="absolute inset-0 size-full" />
        </div>

        <section className="relative -mt-7 flex min-w-0 flex-col rounded-t-[28px] bg-auth-sheet px-5 pb-10 pt-7 sm:px-10 lg:mt-0 lg:rounded-none lg:px-14 lg:py-12 xl:px-20">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Logo lang={lang} className="shrink-0 text-xl" />
            <LocaleSwitcher current={lang as Locale} />
          </div>

          <div className="mx-auto flex w-full min-w-0 max-w-[27rem] flex-1 flex-col justify-center py-8 lg:py-10">
            <h1 className="font-display text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.02em] text-balance text-auth-ink sm:text-[2.7rem] lg:text-[3.1rem]">
              {title}
            </h1>
            <p className="mt-3 text-[0.95rem] leading-6 text-auth-muted">{subtitle}</p>
            <div className="mt-9">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
