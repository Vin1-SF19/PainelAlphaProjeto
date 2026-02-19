import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";



export const metadata: Metadata = {
  title: "Painel Alpha | Login"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
      >
        <SessionProvider>
        {children}

        </SessionProvider>
      </body>
    </html>
  );
}
