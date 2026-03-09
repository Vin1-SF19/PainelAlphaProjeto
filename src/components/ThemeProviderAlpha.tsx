"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { getTema } from "@/lib/temas";

export function ThemeProviderAlpha({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const estilo = useMemo(() => {
    const temaNome = (session?.user as any)?.tema_interface || "blue";
    return getTema(temaNome);
  }, [session]);

  useEffect(() => {
    

    if (session?.user) {
            const userObj = session.user as any;
            const temaNome = userObj?.tema_interface || "blue";
            const estilo = getTema(temaNome);
            
            document.documentElement.style.setProperty("--alpha-primary", estilo.accent);
            console.log("🎨 Tema Reativo Ativado:", temaNome);
        }
    }, [session]);

  useEffect(() => {
    if (status === "loading") return;

    const rgb = estilo.accent || "59, 130, 246";
    const root = document.documentElement;

    root.style.setProperty("--alpha-primary", rgb);
    root.style.transition = "background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease";

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", `rgb(${rgb})`);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = `rgb(${rgb})`;
      document.head.appendChild(meta);
    }
  }, [estilo, status]);

  return <>{children}</>;
}
