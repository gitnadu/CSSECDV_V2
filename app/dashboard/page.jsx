import DashboardView from "@/components/views/DashboardView";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  // Backend API routes handle role-based responses
  const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sections`, {
    cache: "no-store",
    credentials: "include",
  });

  const enrollmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/enrollment/me`, {
    cache: "no-store",
    credentials: "include",
  });

  const sections = await sectionsRes.json();
  const enrollments = await enrollmentsRes.json();

  return (
    <DashboardView
      session={JSON.parse(decodeURIComponent(session.value))}
      sections={sections.sections || []}
      enrollments={enrollments.enrollments || []}
    />
  );
}
