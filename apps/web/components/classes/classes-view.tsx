"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { formatApiDate } from "@/lib/dates";
import { studentApi, type StudentAssignment, type StudentClass } from "@/lib/teacher";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ClassesView({ lang, t }: { lang: string; t: Dictionary["classes"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<StudentClass[] | null>(null);
  const [assignments, setAssignments] = useState<Record<string, StudentAssignment[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    studentApi.myClasses().then(async (list) => {
      if (cancelled) return;
      setClasses(list);
      const all: Record<string, StudentAssignment[]> = {};
      for (const c of list) {
        all[c.id] = await studentApi.assignments(c.id);
      }
      if (!cancelled) setAssignments(all);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  async function onJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim().toUpperCase();
    if (!code) return;
    try {
      await studentApi.join(code);
      (event.target as HTMLFormElement).reset();
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? t.invalidCode : t.invalidCode);
    }
  }

  if (!ready || !user || classes === null) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">🎒 {t.myClasses}</h1>
        <Link
          href={`/${lang}/teacher`}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          {t.becomeTeacher} →
        </Link>
      </div>

      {/* Join form */}
      <Card className="mt-5">
        <CardTitle className="text-base">{t.join}</CardTitle>
        <form onSubmit={onJoin} className="mt-3 flex gap-2">
          <input
            name="code"
            maxLength={8}
            placeholder={t.joinCode}
            className="h-11 flex-1 rounded-xl border border-line bg-card px-4 font-mono text-sm uppercase tracking-widest text-ink focus:border-brand-400 focus:outline-none"
          />
          <Button type="submit">{t.joinButton}</Button>
        </form>
        {error && (
          <Alert tone="error" className="mt-3">
            {error}
          </Alert>
        )}
      </Card>

      {classes.length === 0 ? (
        <EmptyState className="mt-6" icon={GraduationCap} title={t.noClasses} body={t.noClassesBody} />
      ) : (
        classes.map((c) => (
          <Card key={c.id} className="mt-4">
            <CardTitle>{c.name}</CardTitle>
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-ink-soft">
              {t.assignments}
            </h3>
            <ul className="mt-2 space-y-2">
              {(assignments[c.id] ?? []).map((a) => (
                <li
                  key={a.assignment.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-page px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{a.assignment.title}</p>
                    <p className="text-xs text-ink-soft">
                      {t.due}: {formatApiDate(a.assignment.due_at, lang) ?? "—"} ·{" "}
                      {a.reviews} {t.of} {a.assignment.target_reviews} {t.reviews}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                      a.done
                        ? "bg-success/10 text-success-text"
                        : a.overdue
                          ? "bg-danger/10 text-danger-text"
                          : "bg-line/60 text-ink-soft"
                    )}
                  >
                    {a.done ? `✓ ${t.done}` : a.overdue ? t.overdue : `${a.reviews}/${a.assignment.target_reviews}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
    </main>
  );
}
