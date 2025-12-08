import DashboardView from "@/views/components/DashboardView";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) redirect("/login");

  const decodedSession = await verifyToken(sessionCookie.value);

  if (!decodedSession) redirect("/login");

  // ⛔️ DO NOT FETCH SECTIONS OR ENROLLMENTS HERE
  // The SessionProvider will fetch them client-side.

  return <DashboardView session={decodedSession} />;
}