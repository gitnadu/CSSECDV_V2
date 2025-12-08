"use client";

import LoginView from "@/views/components/LoginView";
import { useSession} from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const {session} = useSession();
  const router = useRouter();

  //console.log("LoginPage render, session =", session);

  // Redirect if already logged in
  useEffect(() => {
    //console.log("useEffect triggered, session =", session);
    if (session) router.push("/dashboard");
    
  }, [session]);

  return <LoginView/>;
}
