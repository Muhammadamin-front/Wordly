"use client";

import { useEffect, useState } from "react";

import { WordForm } from "@/components/admin/word-form";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { adminVocabApi, type Category, type Word } from "@/lib/vocab";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/** Loads a word through the admin API (needs the client-side access token)
 *  and hands it to the shared form. */
export function WordEditor({
  lang,
  wordId,
  admin,
  vocab,
  categories,
}: {
  lang: string;
  wordId: string;
  admin: Dictionary["admin"];
  vocab: { synonyms: string; antonyms: string };
  categories: Category[];
}) {
  const { user, ready } = useAuth();
  const [word, setWord] = useState<Word | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    adminVocabApi
      .get(wordId)
      .then(setWord)
      .catch((err) => setError(err instanceof Error ? err.message : "error"));
  }, [ready, user, wordId]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!word) {
    return (
      <div className="flex justify-center py-12">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </div>
    );
  }

  return <WordForm lang={lang} admin={admin} vocab={vocab} categories={categories} word={word} />;
}
