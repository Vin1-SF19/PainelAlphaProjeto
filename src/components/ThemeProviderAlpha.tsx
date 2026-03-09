"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getTema } from "@/lib/temas";

export function ThemeProviderAlpha({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    const temaNome = (session?.user as any)?.tema_interface || "blue";
    const estilo = getTema(temaNome);
    
    const rgb = estilo.accent || "59, 130, 246"; 
    
    document.documentElement.style.setProperty("--alpha-primary", rgb);
    
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", `rgb(${rgb})`);

  }, [session]);

  return <>{children}</>;
}
