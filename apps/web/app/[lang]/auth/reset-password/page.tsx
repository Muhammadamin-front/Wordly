import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetForm } from "@/components/auth/reset-form";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.resetTitle} subtitle={dict.auth.resetSubtitle}>
      <Suspense>
        <ResetForm lang={lang} auth={dict.auth} />
      </Suspense>
    </AuthCard>
  );
}
