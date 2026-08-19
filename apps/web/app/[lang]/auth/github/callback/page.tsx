import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { GithubCallbackView } from "@/components/auth/github-callback-view";
import { getDictionary, hasLocale } from "../../../dictionaries";

export default async function GithubCallbackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthCard lang={lang} title={dict.auth.githubCallbackTitle} subtitle="">
      <Suspense>
        <GithubCallbackView lang={lang} auth={dict.auth} />
      </Suspense>
    </AuthCard>
  );
}
