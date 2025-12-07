import CoursesView from "@/components/views/CoursesView";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sections/available`, {
    cache: "no-store",
    credentials: "include",
  });

  const data = await res.json();

  return <CoursesView sections={data.sections || []} />;
}
