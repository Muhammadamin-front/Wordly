"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";

/** The landing nav's account corner. Signed-in learners must not be offered
 *  "Sign in" / "Sign up" here: the login page bounces an existing session
 *  straight back into the account, which reads as the app silently logging
 *  them in — or, from the landing page, as having been logged out. */
export function HeroNavAuth({
  lang,
  signIn,
  signUp,
  dashboard,
}: {
  lang: string;
  signIn: string;
  signUp: string;
  dashboard: string;
}) {
  const { user, ready } = useAuth();

  if (ready && user) {
    return (
      <Link
        href={`/${lang}/dashboard`}
        className="inline-flex min-h-10 min-w-36 items-center justify-center rounded-md border border-sand-100/35 bg-home-accent px-4 text-sm font-black text-white shadow-[3px_4px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:bg-home-accent-hover"
      >
        {dashboard}
      </Link>
    );
  }

  return (
    <>
      <Link
        href={`/${lang}/auth/login`}
        className="inline-flex min-h-10 items-center px-2 text-sm font-bold text-home-muted transition-colors hover:text-home-ink"
      >
        {signIn}
      </Link>
      <Link
        href={`/${lang}/auth/register`}
        className="inline-flex min-h-10 min-w-36 items-center justify-center rounded-md border border-sand-100/35 bg-home-accent px-4 text-sm font-black text-white shadow-[3px_4px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:bg-home-accent-hover"
      >
        {signUp}
      </Link>
    </>
  );
}
