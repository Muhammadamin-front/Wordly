"use client";

import { AlertTriangle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { authApi, exportAccountData } from "@/lib/api";

const copy = {
  uz: { title: "Hisobni o‘chirish", body: "Bu amal loginni va barcha faol sessiyalarni darhol bekor qiladi. O‘quv profili anonimlashtiriladi. Qonuniy to‘lov va xavfsizlik yozuvlari saqlanishi mumkin.", confirm: "Men bu amal qaytarib bo‘lmasligini tushunaman.", remove: "Hisobni o‘chirish", cancel: "Bekor qilish", error: "Hisobni yopib bo'lmadi. support@vocora.uz ga yozing.", exportTitle: "Avval ma'lumotlaringizni yuklab oling", exportBody: "So‘zlar, kartochkalar, o‘qish tarixi va boshqa hamma narsangizni bitta JSON fayl sifatida yuklab olishingiz mumkin.", exportAction: "Ma'lumotlarni yuklab olish", exportError: "Yuklab bo'lmadi. Qayta urinib ko'ring." },
  en: { title: "Delete account", body: "This immediately revokes sign-in and every active session. Your learning profile is anonymised. Required payment and security records may be retained.", confirm: "I understand this action cannot be undone.", remove: "Delete account", cancel: "Cancel", error: "We could not close this account. Contact support@vocora.uz.", exportTitle: "Download your data first", exportBody: "Get every deck, card, review history entry, and more as one JSON file.", exportAction: "Download my data", exportError: "Download failed. Please try again." },
  ru: { title: "Удалить аккаунт", body: "Доступ и все активные сессии будут отозваны сразу. Учебный профиль будет анонимизирован. Необходимые платёжные и защитные записи могут быть сохранены.", confirm: "Я понимаю, что это действие нельзя отменить.", remove: "Удалить аккаунт", cancel: "Отмена", error: "Не удалось закрыть аккаунт. Напишите на support@vocora.uz.", exportTitle: "Сначала скачайте свои данные", exportBody: "Все колоды, карточки, история повторений и остальное — в одном JSON-файле.", exportAction: "Скачать мои данные", exportError: "Не удалось скачать. Попробуйте ещё раз." },
} as const;

export function DeleteAccountView({ lang }: { lang: string }) {
  const router = useRouter();
  const { ready, user, logout } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const text = copy[lang as keyof typeof copy] ?? copy.en;

  if (!ready) return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-xl px-5 py-16" />;
  if (!user) {
    router.replace(`/${lang}/auth/login`);
    return null;
  }

  const remove = async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.deleteAccount();
      await logout();
      router.replace(`/${lang}`);
    } catch {
      setError(text.error);
      setLoading(false);
    }
  };

  const download = async () => {
    setExporting(true);
    setExportError("");
    try {
      await exportAccountData();
    } catch {
      setExportError(text.exportError);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-xl px-5 py-16">
      <div className="surface-panel rounded-2xl p-6 sm:p-8">
        <Download className="size-8 text-ink-soft" aria-hidden />
        <h2 className="mt-5 font-display text-3xl tracking-wide text-ink">{text.exportTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{text.exportBody}</p>
        {exportError && <p className="mt-3 text-sm font-semibold text-danger-text">{exportError}</p>}
        <div className="mt-5"><Button variant="secondary" loading={exporting} onClick={download}>{text.exportAction}</Button></div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-danger/35 bg-raised p-6 shadow-[4px_5px_0_rgba(127,29,29,0.22)] sm:p-8">
        <AlertTriangle className="size-8 text-danger-text" aria-hidden />
        <h1 className="mt-5 font-display text-4xl tracking-wide text-ink">{text.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{text.body}</p>
        <label className="mt-7 flex items-start gap-3 text-sm font-medium text-ink"><input className="mt-1 size-4 accent-danger" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /> {text.confirm}</label>
        {error && <p className="mt-4 text-sm font-semibold text-danger-text">{error}</p>}
        <div className="mt-8 flex flex-wrap gap-3"><Button variant="danger" loading={loading} disabled={!confirmed} onClick={remove}>{text.remove}</Button><Button variant="secondary" onClick={() => router.back()}>{text.cancel}</Button></div>
      </div>
    </main>
  );
}
