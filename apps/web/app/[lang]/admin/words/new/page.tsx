import { notFound } from "next/navigation";

import { AdminGuard } from "@/components/admin/admin-guard";
import { WordForm } from "@/components/admin/word-form";
import { SiteHeader } from "@/components/site/header";
import { fetchCategories } from "@/lib/vocab";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../../dictionaries";

export const dynamic = "force-dynamic";

export default async function NewWordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, categories] = await Promise.all([getDictionary(lang), fetchCategories()]);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <AdminGuard lang={lang} deniedMessage={dict.admin.accessDenied}>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink">
            {dict.admin.newWord}
          </h1>
          <WordForm
            lang={lang}
            admin={dict.admin}
            vocab={{ synonyms: dict.vocab.synonyms, antonyms: dict.vocab.antonyms }}
            categories={categories}
          />
        </main>
      </AdminGuard>
    </>
  );
}
