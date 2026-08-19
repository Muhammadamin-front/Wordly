import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { TelegramCallbackView } from "@/components/auth/telegram-callback-view";
import { getDictionary, hasLocale } from "../../../dictionaries";

export default async function TelegramCallbackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.telegramCallbackTitle} subtitle="">
      <Suspense>
        <TelegramCallbackView lang={lang} auth={dict.auth} />
      </Suspense>
    </AuthCard>
  );
}
