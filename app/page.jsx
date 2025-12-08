import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
 const cookieStore = await cookies();
  const session = cookieStore.get("session"); // this now works

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
