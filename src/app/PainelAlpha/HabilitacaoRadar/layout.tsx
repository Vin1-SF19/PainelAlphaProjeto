import type { Metadata } from "next";
import "./style.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Habilitação RADAR – Coletor Semi-Automatizado",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="painel-Radar"> 
    <Toaster position="top-right" richColors />
       {children}
    </div>
  );
}
