import GradesPageClient from "./GradesPageClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function GradesPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/enrollment/me`,
    {
      cache: "no-store",
      credentials: "include",
      headers: {
        Cookie: `session=${session.value}`,
      },
    }
  );

  const data = await res.json();

  return <GradesPageClient initialEnrollments={data.enrollments || []} />;
}
