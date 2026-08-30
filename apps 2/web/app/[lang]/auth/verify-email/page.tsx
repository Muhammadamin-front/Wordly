import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailView } from "@/components/auth/verify-email-view";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.verifyTitle} subtitle="">
      <Suspense>
        <VerifyEmailView lang={lang} auth={dict.auth} />
      </Suspense>
    </AuthCard>
  );
}
