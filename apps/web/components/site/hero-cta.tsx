"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Landing CTA that respects auth state: guests are sent to registration,
 *  signed-in learners straight to the library. */
export function HeroCta({
  lang,
  guestLabel,
  userLabel,
  variant,
}: {
  lang: string;
  guestLabel: string;
  userLabel: string;
  variant?: ButtonProps["variant"];
}) {
  const { user, ready } = useAuth();
  const signedIn = ready && !!user;

  return (
    <Link href={signedIn ? `/${lang}/decks` : `/${lang}/auth/register`}>
      <Button size="lg" variant={variant}>
        {signedIn ? userLabel : guestLabel}
      </Button>
    </Link>
  );
}
