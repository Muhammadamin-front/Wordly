import { notFound } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.loginTitle} subtitle={dict.auth.loginSubtitle} showcase>
      <LoginForm lang={lang} auth={dict.auth} />
    </AuthCard>
  );
}
