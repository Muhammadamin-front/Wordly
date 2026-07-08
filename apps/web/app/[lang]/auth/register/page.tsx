import { notFound } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.registerTitle} subtitle={dict.auth.registerSubtitle}>
      <RegisterForm lang={lang} auth={dict.auth} />
    </AuthCard>
  );
}
