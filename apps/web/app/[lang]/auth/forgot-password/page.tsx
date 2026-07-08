import { notFound } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "@/components/auth/forgot-form";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.forgotTitle} subtitle={dict.auth.forgotSubtitle}>
      <ForgotForm lang={lang} auth={dict.auth} />
    </AuthCard>
  );
}
