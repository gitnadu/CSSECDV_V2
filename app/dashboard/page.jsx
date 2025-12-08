import DashboardView from "@/views/components/DashboardView";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "lib/auth";
import { useSession} from "@/context/SessionProvider";

export default async function DashboardPage() {
  const cookieStore = await cookies(); // no await needed, cookies() is sync in app router
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const sessionValue = session?.value || "";

  const decodedSession = await verifyToken(sessionValue);
  if (!decodedSession) redirect("/login");

  // attach cookie by value, not object
  const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sections`, {
    cache: "no-store",
    headers: {
      Cookie: `session=${sessionValue}`,
    },
  });

  const ct = sectionsRes.headers.get("content-type") || "";

  let sections;
  if (ct.includes("application/json")) {
    sections = await sectionsRes.json();
  } else {
    const text = await sectionsRes.text();
    console.error("Sections response is not JSON. Body snippet:", text.slice(0, 500));
    // Optionally throw so you don't render with broken data:
    throw new Error("Unexpected non-JSON response from /api/sections. Check server logs.");
  }

  const enrollmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/me`, {
    cache: "no-store",
    headers: {
      Cookie: `session=${sessionValue}`,
    },
  });

  let enrollments;
  const ct2 = enrollmentsRes.headers.get("content-type") || "";
  if (ct2.includes("application/json")) {
    enrollments = await enrollmentsRes.json();
  } else {
    const text = await enrollmentsRes.text();
    console.error("Enrollments response is not JSON. Body snippet:", text.slice(0, 500));
    throw new Error("Unexpected non-JSON response from /api/enrollment/me. Check server logs.");
  }

  return (
    <DashboardView
      session={decodedSession}
      sections={sections.sections || []}
      enrollments={enrollments.enrollments || []}
    />
  );
}
