"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ResetForm({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await authApi.resetPassword(token, String(form.get("new_password")));
      setDone(true);
    } catch {
      setError(auth.verifyFailed);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <Alert tone="error">{auth.verifyFailed}</Alert>;
  }

  if (done) {
    return (
      <div className="space-y-5">
        <Alert tone="success">{auth.resetSuccess}</Alert>
        <Link href={`/${lang}/auth/login`}>
          <Button fullWidth>{auth.backToLogin}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="new_password">{auth.newPassword}</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1.5 text-xs text-ink-soft">
            {auth.passwordHint}
          </p>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          {auth.resetButton}
        </Button>
      </div>
    </form>
  );
}
