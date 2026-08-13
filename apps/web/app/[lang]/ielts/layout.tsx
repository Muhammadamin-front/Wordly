import { RequireAuth } from "@/components/auth/require-auth";

export default async function IeltsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <RequireAuth lang={lang}>{children}</RequireAuth>;
}
