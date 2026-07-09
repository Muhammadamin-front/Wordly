"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";

export function AdminGuard({
  lang,
  deniedMessage,
  children,
}: {
  lang: string;
  deniedMessage: string;
  children: ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <Alert tone="error">{deniedMessage}</Alert>
      </main>
    );
  }

  return <>{children}</>;
}
