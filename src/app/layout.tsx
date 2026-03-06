import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { StatusConexao } from "@/components/StatusConexao";
import { ThemeProviderAlpha } from "@/components/ThemeProviderAlpha";

export const metadata: Metadata = {
  title: "Painel Alpha | Sistema de Gestão",
  description: "Plataforma avançada de monitoramento e suporte Alpha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body className="antialiased selection:bg-blue-500/30">
        <SessionProvider>
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            expand={false}
          />
          <StatusConexao />
          <ThemeProviderAlpha>

            {children}
          </ThemeProviderAlpha>
        </SessionProvider>
      </body>
    </html >
  );
}
