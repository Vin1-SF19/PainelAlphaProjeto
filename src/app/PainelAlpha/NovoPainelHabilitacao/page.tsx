"use client"; 


import { useSession } from "next-auth/react";
import RadarIntroHeader from "./HeaderIntro/page";
import PainelConteudo from "./components/AbasPaginadas/PainelConteudo";
import { useState } from "react";

export default function PainelRadar() {
  const { data: session } = useSession();
  const [layout, setLayout] = useState<"grid" | "table">("grid");

  const user = session?.user as any;
  const temaNome = (typeof window !== "undefined" && localStorage.getItem("alpha-theme-temp")) 
                   || user?.tema_interface 
                   || "blue";

  return (
    <main className="min-h-screen bg-[#020617]">
      <RadarIntroHeader layout={layout} setLayout={setLayout} />
      
      <div className="max-w-7x2 mx-auto p-8 pt-24">
        <header className="mb-10 flex justify-between items-end px-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">
               Operações: 
            </h2>
            <div className="h-1 w-12 bg-indigo-500 mt-2 rounded-full" />
          </div>
        </header>

        <PainelConteudo tema={temaNome} layout={layout} />
      </div>
    </main>
  );
}