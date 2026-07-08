"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Status = "checking" | "success" | "failed";

export function VerifyEmailView({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "checking" : "failed");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authApi
      .verifyEmail(token)
      .then(() => !cancelled && setStatus("success"))
      .catch(() => !cancelled && setStatus("failed"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "checking") {
    return <Alert tone="info">{auth.verifyChecking}</Alert>;
  }

  if (status === "success") {
    return (
      <div className="space-y-5">
        <Alert tone="success">{auth.verifySuccess}</Alert>
        <Link href={`/${lang}/dashboard`}>
          <Button fullWidth>{auth.goToDashboard}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Alert tone="error">{auth.verifyFailed}</Alert>
      <Link href={`/${lang}/auth/login`}>
        <Button variant="secondary" fullWidth>
          {auth.backToLogin}
        </Button>
      </Link>
    </div>
  );
}
