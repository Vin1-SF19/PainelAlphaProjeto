"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BotaoVoltar({ destino = "/PainelAlpha" }: { destino?: string }) {
  return (
    <Link
      href={destino}
      className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-xl text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
    >
      <div className="p-1 rounded-lg bg-white/5 group-hover:bg-blue-500/10 transition-colors">
        <ArrowLeft 
          size={16} 
          className="transition-transform duration-500 group-hover:-translate-x-1" 
        />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Painel Alpha
      </span>
    </Link>
  );
}
