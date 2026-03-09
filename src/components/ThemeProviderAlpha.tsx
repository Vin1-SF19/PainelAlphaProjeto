"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { getTema } from "@/lib/temas";

interface ThemeProviderProps {
  children: React.ReactNode;
  configIncial: {
    tema: string;
    densidade: string;
  };
}

export function ThemeProviderAlpha({ children, configIncial }: ThemeProviderProps) {
  const { data: session, status } = useSession();

  const estilo = useMemo(() => {
    const temaNome = (session?.user as any)?.tema_interface || configIncial.tema || "blue";
    return getTema(temaNome);
  }, [session, configIncial]);

  useEffect(() => {
    if (status === "loading" && !configIncial.tema) return;

    const rgb = estilo.accent || "59, 130, 246";
    const root = document.documentElement;

    root.style.setProperty("--alpha-primary", rgb);
    

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", `rgb(${rgb})`);
    }
  }, [estilo, status, configIncial]);

  return <>{children}</>;
}
