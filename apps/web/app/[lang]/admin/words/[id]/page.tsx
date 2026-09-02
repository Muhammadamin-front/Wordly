import { notFound } from "next/navigation";

import { AdminGuard } from "@/components/admin/admin-guard";
import { WordEditor } from "@/components/admin/word-editor";
import { SiteHeader } from "@/components/site/header";
import { fetchCategories } from "@/lib/vocab";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../../dictionaries";

export const dynamic = "force-dynamic";

export default async function EditWordPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, categories] = await Promise.all([getDictionary(lang), fetchCategories()]);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <AdminGuard lang={lang} deniedMessage={dict.admin.accessDenied} allowedRoles={["content_manager", "admin", "super_admin"]}>
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink">
            {dict.admin.edit}
          </h1>
          <WordEditor
            lang={lang}
            wordId={id}
            admin={dict.admin}
            vocab={{ synonyms: dict.vocab.synonyms, antonyms: dict.vocab.antonyms }}
            categories={categories}
          />
        </main>
      </AdminGuard>
    </>
  );
}
