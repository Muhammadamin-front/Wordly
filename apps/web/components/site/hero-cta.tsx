"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Landing CTA that respects auth state: guests are sent to registration,
 *  signed-in learners straight to the library. */
export function HeroCta({
  lang,
  guestLabel,
  userLabel,
  variant,
  className,
  linkClassName,
  icon,
}: {
  lang: string;
  guestLabel: string;
  userLabel: string;
  variant?: ButtonProps["variant"];
  className?: string;
  linkClassName?: string;
  icon?: ReactNode;
}) {
  const { user, ready } = useAuth();
  const signedIn = ready && !!user;

  return (
    <Link href={signedIn ? `/${lang}/decks` : `/${lang}/auth/register`} className={linkClassName}>
      <Button size="lg" variant={variant} className={className}>
        {icon}
        {signedIn ? userLabel : guestLabel}
      </Button>
    </Link>
  );
}
