import { notFound } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ switch?: string | string[] }>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.loginTitle} subtitle={dict.auth.loginSubtitle} showcase>
      <LoginForm lang={lang} auth={dict.auth} switchingAccount={query.switch === "1"} />
    </AuthCard>
  );
}
