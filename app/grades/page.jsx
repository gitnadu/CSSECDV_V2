import GradesView from "@/views/components/GradesView";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function GradesPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const { id: studentId } = JSON.parse(decodeURIComponent(session.value));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/grades/student/${studentId}`,
    {
      cache: "no-store",
      credentials: "include",
    }
  );

  const grades = await res.json();

  return <GradesView grades={grades.grades || []} />;
}
