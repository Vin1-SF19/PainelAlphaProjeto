"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function Heartbeat() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const enviarSinal = async () => {
      try {
        await fetch("/api/heartbeat", { method: "POST" });
      } catch (e) {
        console.error("Falha no radar");
      }
    };

    enviarSinal(); 
    const interval = setInterval(enviarSinal, 20000); 
    return () => clearInterval(interval);
  }, [status]);

  return null;
}
