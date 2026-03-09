import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { StatusConexao } from "@/components/StatusConexao";
import { ThemeProviderAlpha } from "@/components/ThemeProviderAlpha";
import db from "@/lib/prisma";
import { auth } from "../../auth";
import { getTema } from "@/lib/temas";
import { EngrenagemFlutuante } from "@/components/EngrenagemFlutuante";
import BroadcastBanner from "@/components/BroadcastBanner";
import { NotificacaoFlutuante } from "@/components/NotificacaoFlutuante";

export const metadata: Metadata = {
  title: "Painel Alpha | Sistema de Gestão",
  description: "Plataforma avançada de monitoramento e suporte Alpha",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  const userDb = session?.user?.id 
    ? await db.usuarios.findUnique({ 
        where: { id: Number(session.user.id) },
        select: { tema_interface: true, densidade_painel: true } 
      }) 
    : null;

  const temaNome = userDb?.tema_interface || "blue";
  const estiloServidor = getTema(temaNome);
  const rgbServidor = estiloServidor.accent || "59, 130, 246";

  const configIncial = {
    tema: temaNome,
    densidade: userDb?.densidade_painel || "default"
  };

 
  return (
    <html 
      lang="pt-br" 
      className="dark"
      style={{ "--alpha-primary": rgbServidor } as React.CSSProperties}
    >
      <body className="antialiased selection:bg-alpha/30">
        <SessionProvider session={session}>
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            expand={false}
          />
          <StatusConexao />
          <ThemeProviderAlpha configIncial={configIncial}>
          <BroadcastBanner />
          <NotificacaoFlutuante/> 
            {children}
            <EngrenagemFlutuante />
          </ThemeProviderAlpha>
        </SessionProvider>
      </body>
    </html>
  );
}
