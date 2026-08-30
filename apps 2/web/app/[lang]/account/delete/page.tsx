import { DeleteAccountView } from "@/components/account/delete-account-view";

export default async function DeleteAccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <DeleteAccountView lang={lang} />;
}
