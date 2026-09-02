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
      <main id="main-content" tabIndex={-1} className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo lang={lang} className="text-2xl" />
          </div>
          <div className="surface-panel rounded-2xl p-6 sm:p-8">
            <h1 className="font-display text-4xl tracking-wide text-ink">{title}</h1>
            <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-auth-page p-0 lg:p-10">
      {/* Full-bleed foliage behind the floating card. Hidden once the split
          card takes over, where the artwork lives inside the card instead. */}
      <div aria-hidden className="absolute inset-0 lg:hidden">
        <PaperCutLeaves className="size-full" crop="portrait" />
      </div>

      <div className="relative z-10 flex w-full max-w-295 justify-center px-6 py-12 sm:px-8 lg:block lg:px-0 lg:py-0">
        <div className="grid w-full max-w-[25.5rem] overflow-hidden rounded-[18px] border-2 border-auth-line bg-auth-sheet shadow-auth-card lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:rounded-[22px]">
          <div className="relative hidden lg:order-last lg:block">
            <PaperCutLeaves className="absolute inset-0 size-full" />
          </div>

          <section className="flex min-w-0 flex-col px-6 py-8 sm:px-8 lg:px-14 lg:py-12 xl:px-20">
            <div className="flex min-w-0 items-center justify-between gap-3 max-[359px]:flex-col max-[359px]:items-center max-[359px]:gap-2">
              <Logo lang={lang} className="shrink-0 text-lg lg:text-xl" />
              <LocaleSwitcher current={lang as Locale} />
            </div>

            <div className="mx-auto flex w-full min-w-0 max-w-[27rem] flex-1 flex-col justify-center py-7 lg:py-10">
              {/* The Russian "С возвращением" is a single unbreakable word that
                  came within a pixel of the card edge at 360px and overflowed
                  outright below that. The clamp keeps it inside the card on
                  narrow phones at full size elsewhere; break-words is the
                  backstop for any translation longer still. */}
              <h1 className="text-center font-display text-[clamp(2.2rem,11vw,2.8rem)] leading-[0.88] tracking-[0.015em] text-balance wrap-break-word text-auth-ink sm:text-[3.4rem] lg:text-left lg:text-[4.4rem]">
                {title}
              </h1>
              <p className="mt-3 text-center text-[0.9rem] leading-6 text-auth-muted lg:text-left lg:text-[0.95rem]">
                {subtitle}
              </p>
              <div className="mt-8 lg:mt-9">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
