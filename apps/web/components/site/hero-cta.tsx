"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Landing CTA that respects auth state: a guest starts with the three
 *  onboarding questions and is asked to register once they have answered
 *  them, which is where signing up has actually earned itself; a signed-in
 *  learner goes straight to the library. */
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
    <Link
      href={signedIn ? `/${lang}/decks` : `/${lang}/onboarding`}
      className={cn(buttonVariants({ size: "lg", variant }), className, linkClassName)}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {signedIn ? userLabel : guestLabel}
      </span>
    </Link>
  );
}
