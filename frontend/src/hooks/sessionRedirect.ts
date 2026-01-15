"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionCookie } from "../contexts/session";

export const useSessionRedirect = () => {
  const router = useRouter();

  // Redirect to home if session is defined
  useEffect(() => {
    const session = getSessionCookie();
    if (session?.token) {
      router.push('/search');
    }
  }, [router])
}