"use client";
import { motion } from "framer-motion";
import { Building2, ArrowUpRight } from "lucide-react";
import { getTema } from "@/lib/temas";

interface CardConsultaProps {
  razaoSocial: string;
  cnpj: string;
  tema: string;
}

export default function CardConsulta({ razaoSocial, cnpj, tema }: CardConsultaProps) {
  const visual = getTema(tema);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] backdrop-blur-md hover:border-white/10 transition-all shadow-xl hover:shadow-2xl"
    >
      {/* Efeito de Glow sutil no Hover */}
      <div className={`absolute inset-0 ${visual.glow} opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-xl -z-10`} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-white/5 group-hover:${visual.bg} group-hover:bg-opacity-20 transition-colors`}>
            <Building2 className={`w-5 h-5 text-slate-500 group-hover:${visual.text}`} />
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-[11px] font-black uppercase italic text-white tracking-tight leading-tight line-clamp-1 max-w-[200px]">
              {razaoSocial}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 font-bold mt-1 group-hover:text-slate-300 transition-colors">
              {cnpj}
            </span>
          </div>
        </div>

        {/* Botão de Detalhes (preparando para o futuro modal) */}
        <button className="p-2 rounded-xl bg-white/5 text-slate-600 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          <ArrowUpRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}