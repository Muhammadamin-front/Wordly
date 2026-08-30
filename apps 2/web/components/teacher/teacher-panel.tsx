"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teacherApi, type Classroom } from "@/lib/teacher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function TeacherPanel({ lang, t }: { lang: string; t: Dictionary["teacher"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Classroom[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    teacherApi.classes().then((c) => !cancelled && setClasses(c)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    await teacherApi.createClass(name, String(form.get("description") ?? "") || undefined);
    (event.target as HTMLFormElement).reset();
    setReloadKey((n) => n + 1);
  }

  if (!ready || !user || classes === null) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">👩‍🏫 {t.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {classes.map((c) => (
          <Link
            key={c.id}
            href={`/${lang}/teacher/classes/${c.id}`}
            className="block rounded-xl2 border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:shadow-md"
          >
            <CardTitle>{c.name}</CardTitle>
            {c.description && <CardDescription>{c.description}</CardDescription>}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="rounded-md bg-brand-600/10 px-2 py-0.5 font-mono font-bold text-brand-600 dark:text-brand-300">
                {c.join_code}
              </span>
              <span className="text-ink-soft">
                {c.member_count} {t.members}
              </span>
            </div>
          </Link>
        ))}

        <Card>
          <CardTitle>＋ {t.newClass}</CardTitle>
          <form onSubmit={onCreate} className="mt-3 space-y-3">
            <div>
              <Label htmlFor="name">{t.className}</Label>
              <Input id="name" name="name" required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="description">{t.classDesc}</Label>
              <Input id="description" name="description" maxLength={400} />
            </div>
            <Button type="submit" size="sm">
              {t.create}
            </Button>
          </form>
        </Card>
      </div>

      {classes.length === 0 && <p className="mt-4 text-center text-sm text-ink-soft">{t.noClasses}</p>}
    </main>
  );
}
