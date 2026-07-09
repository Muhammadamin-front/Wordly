"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminGuard } from "@/components/admin/admin-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminApi, type AdminAnalytics, type AdminUser, type AiReport } from "@/lib/admin-panel";
import { formatSom } from "@/lib/billing";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Tab = "analytics" | "reports" | "users";

export function AdminDashboard({
  lang,
  t,
  deniedMessage,
}: {
  lang: string;
  t: Dictionary["adminPanel"];
  deniedMessage: string;
}) {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <AdminGuard lang={lang} deniedMessage={deniedMessage}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">🛠 {t.title}</h1>
          <Link
            href={`/${lang}/admin/words`}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            📚 {t.words} →
          </Link>
        </div>

        <div className="mt-5 flex gap-1 rounded-xl border border-line p-1">
          {(["analytics", "reports", "users"] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                tab === key ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"
              )}
            >
              {t[key]}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "analytics" ? (
            <AnalyticsTab t={t} />
          ) : tab === "reports" ? (
            <ReportsTab t={t} />
          ) : (
            <UsersTab t={t} lang={lang} />
          )}
        </div>
      </main>
    </AdminGuard>
  );
}

function AnalyticsTab({ t }: { t: Dictionary["adminPanel"] }) {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi.analytics().then((s) => !cancelled && setStats(s)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return <Spinner />;

  const tiles: [string, string][] = [
    [t.usersTotal, String(stats.users_total)],
    [t.premiumUsers, String(stats.premium_users)],
    [t.activeSubs, String(stats.active_subscriptions)],
    [t.revenue, `${formatSom(stats.revenue_som)} ${t.som}`],
    [t.reportsOpen, String(stats.ai_reports_open)],
    [t.reviewsTotal, String(stats.reviews_total)],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map(([label, value]) => (
        <div key={label} className="rounded-xl2 border border-line bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-ink">{value}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{label}</p>
        </div>
      ))}
    </div>
  );
}

function ReportsTab({ t }: { t: Dictionary["adminPanel"] }) {
  const [reports, setReports] = useState<AiReport[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminApi.reports(false).then((r) => !cancelled && setReports(r)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (!reports) return <Spinner />;
  if (reports.length === 0)
    return <Card className="text-center text-ink-soft">{t.noReports}</Card>;

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-ink-soft">
                {t.reportKind}: {r.kind}
                {r.reason && (
                  <span className="ml-2 font-normal normal-case">
                    · {t.reportReason}: {r.reason}
                  </span>
                )}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{r.output}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await adminApi.resolveReport(r.id);
                setReloadKey((n) => n + 1);
              }}
            >
              ✓ {t.resolve}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersTab({ t, lang }: { t: Dictionary["adminPanel"]; lang: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminApi.users(query || undefined).then((page) => !cancelled && setUsers(page.items)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const reload = () => setReloadKey((n) => n + 1);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        className="h-10 w-full max-w-xs rounded-lg border border-line bg-card px-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
      />

      {!users ? (
        <Spinner />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl2 border border-line">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="bg-line/40 text-xs font-bold uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-2.5">{t.email}</th>
                <th className="px-4 py-2.5">{t.role}</th>
                <th className="px-4 py-2.5">{t.status}</th>
                <th className="px-4 py-2.5">{t.joined}</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-card">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-ink">{u.display_name}</span>
                    <span className="ml-1.5 text-xs text-ink-soft">{u.email}</span>
                    {u.is_premium && <span className="ml-1.5">✨</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        await adminApi.setRole(u.id, e.target.value);
                        reload();
                      }}
                      className="rounded-md border border-line bg-card px-1.5 py-0.5 text-xs text-ink"
                    >
                      <option value="learner">learner</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                        u.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}
                    >
                      {u.is_active ? t.active : t.banned}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">
                    {new Date(u.created_at).toLocaleDateString(lang)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        if (u.is_active) await adminApi.ban(u.id);
                        else await adminApi.unban(u.id);
                        reload();
                      }}
                      className={cn(
                        "text-xs font-semibold hover:underline",
                        u.is_active ? "text-danger" : "text-success"
                      )}
                    >
                      {u.is_active ? t.ban : t.unban}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
    </div>
  );
}
