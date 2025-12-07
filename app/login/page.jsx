"use client";

import LoginView from "@/views/components/LoginView";
import { useSession } from "@/contexts/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { session } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session]);

  return <LoginView />;
}
