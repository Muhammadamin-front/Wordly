"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateInputToDeadlineIso, formatApiDate } from "@/lib/dates";
import { teacherApi, type ClassAnalytics } from "@/lib/teacher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ClassDetail({
  lang,
  classId,
  t,
}: {
  lang: string;
  classId: string;
  t: Dictionary["teacher"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ClassAnalytics | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([teacherApi.analytics(classId), teacherApi.classes()]).then(([d, classes]) => {
      if (cancelled) return;
      setData(d);
      setJoinCode(classes.find((c) => c.id === classId)?.join_code ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, classId, reloadKey]);

  async function onAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const due = String(form.get("due_at") ?? "");
    if (!title || !due) return;
    const dueAt = dateInputToDeadlineIso(due);
    if (!dueAt) return;
    await teacherApi.createAssignment(classId, {
      title,
      instructions: String(form.get("instructions") ?? "") || undefined,
      target_reviews: Number(form.get("target_reviews")) || 20,
      due_at: dueAt,
    });
    (event.target as HTMLFormElement).reset();
    setReloadKey((n) => n + 1);
  }

  if (!ready || !user || data === null) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <Card className="bg-linear-to-br from-brand-600/10 to-transparent text-center">
        <p className="text-xs text-ink-soft">{t.shareCode}</p>
        <p className="mt-1 font-mono text-3xl font-extrabold tracking-widest text-brand-600 dark:text-brand-300">
          {joinCode}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={async () => {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? t.copied : t.copy}
        </Button>
      </Card>

      {/* Students */}
      <h2 className="mt-6 text-lg font-bold text-ink">{t.students}</h2>
      {data.students.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t.noStudents}</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl2 border border-line">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="bg-line/40 text-xs font-bold uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-2.5">👤</th>
                <th className="px-4 py-2.5">⚡ {t.level}</th>
                <th className="px-4 py-2.5">🔥 {t.streak}</th>
                <th className="px-4 py-2.5">{t.reviews}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-card">
              {data.students.map((s) => (
                <tr key={s.user_id}>
                  <td className="px-4 py-2 font-semibold text-ink">{s.display_name}</td>
                  <td className="px-4 py-2">{s.level}</td>
                  <td className="px-4 py-2">{s.current_streak}</td>
                  <td className="px-4 py-2 text-ink-soft">{s.total_reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignments */}
      <h2 className="mt-8 text-lg font-bold text-ink">{t.assignments}</h2>
      <div className="mt-3 space-y-3">
        {data.assignments.map((a) => (
          <Card key={a.assignment.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{a.assignment.title}</p>
                <p className="text-xs text-ink-soft">
                  {t.dueDate}: {formatApiDate(a.assignment.due_at, lang) ?? "—"} ·{" "}
                  {a.assignment.target_reviews} {t.reviews}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                {a.completed}/{a.total} {t.completed}
              </span>
            </div>
          </Card>
        ))}
        {data.assignments.length === 0 && (
          <p className="text-sm text-ink-soft">{t.noAssignments}</p>
        )}
      </div>

      <Card className="mt-4">
        <CardTitle className="text-base">＋ {t.newAssignment}</CardTitle>
        <form onSubmit={onAssign} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">{t.assignmentTitle}</Label>
            <Input id="title" name="title" required maxLength={160} />
          </div>
          <div>
            <Label htmlFor="target_reviews">{t.targetReviews}</Label>
            <Input id="target_reviews" name="target_reviews" type="number" min={1} defaultValue={20} />
          </div>
          <div>
            <Label htmlFor="due_at">{t.dueDate}</Label>
            <Input id="due_at" name="due_at" type="date" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="instructions">{t.instructions}</Label>
            <Input id="instructions" name="instructions" maxLength={2000} />
          </div>
          <Button type="submit" size="sm">
            {t.assign}
          </Button>
        </form>
      </Card>
    </main>
  );
}
