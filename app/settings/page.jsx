import SettingsPageClient from '@/views/components/SettingsPageClient';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "lib/auth";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) redirect("/login");

  const decodedSession = await verifyToken(sessionCookie.value);

  if (!decodedSession) redirect("/login");

  return <SettingsPageClient session={decodedSession} />;
}
