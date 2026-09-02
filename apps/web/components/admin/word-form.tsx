"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminVocabApi,
  CEFR_LEVELS,
  WORD_STATUSES,
  type Category,
  type Word,
  type WordInput,
} from "@/lib/vocab";
import type { Dictionary } from "@/app/[lang]/dictionaries";

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function WordForm({
  lang,
  admin,
  vocab,
  categories,
  word,
}: {
  lang: string;
  admin: Dictionary["admin"];
  vocab: Pick<Dictionary["vocab"], "synonyms" | "antonyms">;
  categories: Category[];
  word?: Word;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sense = word?.senses[0];
  const example = sense?.examples[0];
  const initialSynonyms = word?.relations
    .filter((r) => r.relation_type === "synonym")
    .map((r) => r.related_text)
    .join(", ");
  const initialAntonyms = word?.relations
    .filter((r) => r.relation_type === "antonym")
    .map((r) => r.related_text)
    .join(", ");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "").trim();

    const exampleEn = get("example_en");
    const payload: WordInput = {
      headword: get("headword"),
      pos: get("pos"),
      cefr_level: get("cefr_level"),
      ipa: get("ipa") || null,
      frequency_rank: get("frequency_rank") ? Number(get("frequency_rank")) : null,
      common_mistake: get("common_mistake") || null,
      category_slug: get("category_slug") || null,
      status: get("status"),
      senses: [
        {
          definition_en: get("definition_en"),
          translation_uz: get("translation_uz"),
          translation_ru: get("translation_ru"),
          examples: exampleEn
            ? [{ text_en: exampleEn, text_uz: get("example_uz") || null, text_ru: null }]
            : [],
        },
      ],
      relations: [
        ...splitList(get("synonyms")).map((text) => ({
          relation_type: "synonym",
          related_text: text,
        })),
        ...splitList(get("antonyms")).map((text) => ({
          relation_type: "antonym",
          related_text: text,
        })),
      ],
    };

    try {
      if (word) {
        await adminVocabApi.update(word.id, payload);
      } else {
        await adminVocabApi.create(payload);
      }
      router.push(`/${lang}/admin/words`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
      setSaving(false);
    }
  }

  const selectClass =
    "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-focus";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="headword">{admin.headword}</Label>
          <Input id="headword" name="headword" defaultValue={word?.headword} required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="pos">{admin.posLabel}</Label>
          <Input id="pos" name="pos" defaultValue={word?.pos} required maxLength={20} />
        </div>
        <div>
          <Label htmlFor="cefr_level">{admin.levelLabel}</Label>
          <select
            id="cefr_level"
            name="cefr_level"
            defaultValue={word?.cefr_level ?? "A1"}
            className={selectClass}
          >
            {CEFR_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">{admin.statusLabel}</Label>
          <select
            id="status"
            name="status"
            defaultValue={word?.status ?? "draft"}
            className={selectClass}
          >
            {WORD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "draft"
                  ? admin.statusDraft
                  : status === "review"
                    ? admin.statusReview
                    : admin.statusPublished}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category_slug">{admin.categoryLabel}</Label>
          <select
            id="category_slug"
            name="category_slug"
            defaultValue={word?.category?.slug ?? ""}
            className={selectClass}
          >
            <option value="">—</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.emoji} {lang === "uz" ? category.name_uz : lang === "ru" ? category.name_ru : category.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="ipa">{admin.ipaLabel}</Label>
          <Input id="ipa" name="ipa" defaultValue={word?.ipa ?? ""} maxLength={80} />
        </div>
        <div>
          <Label htmlFor="frequency_rank">{admin.rankLabel}</Label>
          <Input
            id="frequency_rank"
            name="frequency_rank"
            type="number"
            min={1}
            defaultValue={word?.frequency_rank ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="translation_uz">{admin.translationUz}</Label>
          <Input id="translation_uz" name="translation_uz" defaultValue={sense?.translation_uz} required maxLength={160} />
        </div>
        <div>
          <Label htmlFor="translation_ru">{admin.translationRu}</Label>
          <Input id="translation_ru" name="translation_ru" defaultValue={sense?.translation_ru} required maxLength={160} />
        </div>
      </div>

      <div>
        <Label htmlFor="definition_en">{admin.definitionEn}</Label>
        <Input id="definition_en" name="definition_en" defaultValue={sense?.definition_en} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="example_en">{admin.exampleEn}</Label>
          <Input id="example_en" name="example_en" defaultValue={example?.text_en ?? ""} />
        </div>
        <div>
          <Label htmlFor="example_uz">{admin.exampleUz}</Label>
          <Input id="example_uz" name="example_uz" defaultValue={example?.text_uz ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="synonyms">{vocab.synonyms}</Label>
          <Input id="synonyms" name="synonyms" defaultValue={initialSynonyms} placeholder="good, nice" />
        </div>
        <div>
          <Label htmlFor="antonyms">{vocab.antonyms}</Label>
          <Input id="antonyms" name="antonyms" defaultValue={initialAntonyms} placeholder="bad, small" />
        </div>
      </div>
      <div>
        <Label htmlFor="common_mistake">{admin.mistakeLabel}</Label>
        <Input id="common_mistake" name="common_mistake" defaultValue={word?.common_mistake ?? ""} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {admin.saveWord}
        </Button>
      </div>
    </form>
  );
}
