import Link from "next/link";
import { notFound } from "next/navigation";

import { AiExplain } from "@/components/ai/ai-explain";
import { SiteHeader } from "@/components/site/header";
import { Card, CardTitle } from "@/components/ui/card";
import { fetchWord, type Word } from "@/lib/vocab";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getDictionary, hasLocale } from "../../dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const word = await fetchWord(slug);
  if (!word) return {};
  const sense = word.senses[0];
  const translation = lang === "ru" ? sense?.translation_ru : sense?.translation_uz;
  const title =
    lang === "ru"
      ? `${word.headword}: перевод и примеры`
      : lang === "en"
        ? `${word.headword}: meaning, pronunciation, and examples`
        : `${word.headword}: o'zbekcha tarjima va misollar`;
  const description =
    lang === "ru"
      ? `${word.headword} — ${translation ?? "английское слово"}. Значение: ${sense?.definition_en ?? "словарная статья"}. Уровень ${word.cefr_level}, произношение и примеры употребления.`
      : lang === "en"
        ? `${word.headword}: ${sense?.definition_en ?? "English dictionary entry"}. See its ${word.cefr_level} level, pronunciation, translations, examples, and related words.`
        : `${word.headword} — ${translation ?? "inglizcha so'z"}. Ma'nosi: ${sense?.definition_en ?? "lug'at izohi"}. ${word.cefr_level} daraja, talaffuz va qo'llanish misollari.`;
  return publicPageMetadata({ lang, path: `/words/${slug}`, title, description });
}

function relationGroup(word: Word, type: string): string[] {
  return word.relations.filter((r) => r.relation_type === type).map((r) => r.related_text);
}

export default async function WordPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, word] = await Promise.all([getDictionary(lang), fetchWord(slug)]);
  if (!word) notFound();
  const { vocab } = dict;

  const synonyms = relationGroup(word, "synonym");
  const antonyms = relationGroup(word, "antonym");

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/${lang}/vocabulary`}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          ← {vocab.backToList}
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-ink">{word.headword}</h1>
            <span className="rounded-lg bg-brand-600/10 px-2 py-1 text-sm font-bold text-brand-600 dark:text-brand-300">
              {word.cefr_level}
            </span>
            {word.category && (
              <span className="rounded-lg bg-accent-500/10 px-2 py-1 text-sm font-medium text-accent-600 dark:text-accent-300">
                {word.category.emoji}{" "}
                {lang === "uz"
                  ? word.category.name_uz
                  : lang === "ru"
                    ? word.category.name_ru
                    : word.category.name_en}
              </span>
            )}
          </div>
          <p className="mt-2 text-ink-soft">
            <em>{word.pos}</em>
            {word.ipa ? <span className="ml-2 font-mono">/{word.ipa}/</span> : null}
          </p>
        </header>

        {word.senses.map((sense, index) => (
          <Card key={sense.id ?? index} className="mt-5">
            <div className="grid gap-1.5">
              <p className="text-xl font-bold text-ink">
                🇺🇿 {sense.translation_uz}
                <span className="ml-3 font-semibold text-ink-soft">🇷🇺 {sense.translation_ru}</span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-semibold uppercase tracking-wide text-ink-soft/80">
                  {vocab.definition}:
                </span>{" "}
                {sense.definition_en}
              </p>
            </div>

            {sense.examples.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {vocab.examples}
                </h2>
                <ul className="mt-2 space-y-2">
                  {sense.examples.map((example, i) => (
                    <li key={example.id ?? i} className="rounded-lg bg-page px-3 py-2">
                      <p className="text-sm font-medium text-ink">{example.text_en}</p>
                      {example.text_uz && (
                        <p className="mt-0.5 text-xs text-ink-soft">{example.text_uz}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}

        {(synonyms.length > 0 || antonyms.length > 0) && (
          <Card className="mt-5">
            {synonyms.length > 0 && (
              <p className="text-sm">
                <span className="font-bold text-ink">{vocab.synonyms}:</span>{" "}
                <span className="text-ink-soft">{synonyms.join(", ")}</span>
              </p>
            )}
            {antonyms.length > 0 && (
              <p className="mt-1.5 text-sm">
                <span className="font-bold text-ink">{vocab.antonyms}:</span>{" "}
                <span className="text-ink-soft">{antonyms.join(", ")}</span>
              </p>
            )}
          </Card>
        )}

        {word.common_mistake && (
          <Card className="mt-5 border-warning/40 bg-warning/5">
            <CardTitle className="text-sm text-warning-text">⚠️ {vocab.commonMistake}</CardTitle>
            <p className="mt-1 text-sm text-ink-soft">{word.common_mistake}</p>
          </Card>
        )}

        <AiExplain wordId={word.id} ai={dict.ai} />
      </main>
    </>
  );
}
