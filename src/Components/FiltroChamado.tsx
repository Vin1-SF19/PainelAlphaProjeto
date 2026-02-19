// src/Components/FiltroChamados.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FiltroChamados() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusAtual = searchParams.get("status") || "TODOS";

  const filtros = [
    { label: "Todos", value: "TODOS" },
    { label: "Abertos", value: "ABERTO" },
    { label: "Em curso", value: "EM_ATENDIMENTO" },
    { label: "Concluídos", value: "CONCLUIDO" },
  ];

  const handleFiltro = (valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    valor === "TODOS" ? params.delete("status") : params.set("status", valor);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex p-1.5 bg-slate-900/80 border border-white/5 backdrop-blur-xl rounded-2xl shadow-inner">
      {filtros.map((f) => {
        const ativo = statusAtual === f.value;
        return (
          <button
            key={f.value}
            onClick={() => handleFiltro(f.value)}
            className={` cursor-pointer
              relative px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
              ${ativo 
                ? "text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
            `}
          >
            {f.label}
            {ativo && (
               <span className="absolute-bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
