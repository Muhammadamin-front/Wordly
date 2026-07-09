"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/api";
import {
  adminImportCsv,
  adminVocabApi,
  type ImportReport,
  type WordPage,
} from "@/lib/vocab";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const STATUS_FILTERS = ["", "draft", "review", "published"] as const;

export function WordsAdmin({ lang, admin }: { lang: string; admin: Dictionary["admin"] }) {
  const [data, setData] = useState<WordPage | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Bumped after mutations (delete/import) to trigger a refetch.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminVocabApi
      .list({ page, status: statusFilter || undefined, q: query || undefined })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, query, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function onDelete(id: string) {
    if (!window.confirm(admin.deleteConfirm)) return;
    await adminVocabApi.remove(id);
    reload();
  }

  async function onUpload(file: File) {
    const token = getAccessToken();
    if (!token) return;
    setUploading(true);
    setReport(null);
    try {
      setReport(await adminImportCsv(file, token));
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const statusLabel = (status: string) =>
    status === "draft"
      ? admin.statusDraft
      : status === "review"
        ? admin.statusReview
        : admin.statusPublished;

  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{admin.title}</h1>
        <div className="flex gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && void onUpload(e.target.files[0])}
          />
          <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileInput.current?.click()}>
            ⬆ {admin.uploadCsv}
          </Button>
          <Link href={`/${lang}/admin/words/new`}>
            <Button size="sm">+ {admin.newWord}</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
      {report && (
        <Alert tone={report.errors.length ? "error" : "success"} className="mt-4">
          {admin.importResult}: {report.created} {admin.created}, {report.updated} {admin.updated}
          {report.errors.length > 0 && (
            <>
              , {report.errors.length} {admin.importErrors}
              <ul className="mt-1 list-inside list-disc text-xs font-normal">
                {report.errors.slice(0, 5).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </Alert>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status || "all"}
            type="button"
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              statusFilter === status
                ? "bg-brand-600 text-white"
                : "border border-line text-ink-soft hover:text-ink"
            )}
          >
            {status ? statusLabel(status) : admin.allStatuses}
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="ml-auto h-9 w-48 rounded-lg border border-line bg-card px-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl2 border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-line/40 text-xs font-bold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">{admin.headword}</th>
              <th className="px-4 py-3">{admin.levelLabel}</th>
              <th className="px-4 py-3">{admin.translationUz}</th>
              <th className="px-4 py-3">{admin.statusLabel}</th>
              <th className="px-4 py-3 text-right">{admin.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-card">
            {(data?.items ?? []).map((word) => (
              <tr key={word.id}>
                <td className="px-4 py-2.5 font-semibold text-ink">
                  {word.headword}
                  <span className="ml-1.5 text-xs font-normal text-ink-soft">{word.pos}</span>
                </td>
                <td className="px-4 py-2.5">{word.cefr_level}</td>
                <td className="px-4 py-2.5 text-ink-soft">{word.primary_translation_uz}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      word.status === "published" && "bg-success/10 text-success",
                      word.status === "review" && "bg-warning/10 text-warning",
                      word.status === "draft" && "bg-line/60 text-ink-soft"
                    )}
                  >
                    {statusLabel(word.status)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/${lang}/admin/words/${word.id}`}
                    className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
                  >
                    {admin.edit}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void onDelete(word.id)}
                    className="ml-3 text-xs font-semibold text-danger hover:underline"
                  >
                    {admin.deleteWord}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && lastPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ←
          </Button>
          <span className="text-ink-soft">
            {page} / {lastPage} · {data.total}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => setPage(page + 1)}
          >
            →
          </Button>
        </div>
      )}
    </main>
  );
}
