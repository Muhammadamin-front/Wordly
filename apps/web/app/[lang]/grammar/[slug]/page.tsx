import { notFound } from "next/navigation";

import { LessonView } from "@/components/grammar/lesson-view";
import { SiteHeader } from "@/components/site/header";
import { ALL_LESSONS, lessonBySlug } from "@/lib/grammar";
import { localiseLesson } from "@/lib/grammar/localise";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export default async function GrammarLessonPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <LessonView lang={lang} lesson={localiseLesson(lesson, lang)} t={dict.grammar} />
    </>
  );
}
