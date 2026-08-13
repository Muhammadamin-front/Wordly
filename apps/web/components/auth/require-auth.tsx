"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";

/**
 * Keeps premium learning routes out of the signed-out experience while the
 * browser restores a session from its secure refresh cookie.
 */
export function RequireAuth({ children, lang }: { children: React.ReactNode; lang: string }) {
  const { ready, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/register`);
  }, [lang, ready, router, user]);

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-20" aria-live="polite">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </div>
    );
  }

  return children;
}
