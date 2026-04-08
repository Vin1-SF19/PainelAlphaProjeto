"use client";
import CardConsulta from "../cards/CardConsulta";

export default function ListaConsultas({ consultas, tema }: { consultas: any[], tema: string }) {
  if (consultas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Nenhum protocolo registrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {consultas.map((item, index) => (
        <CardConsulta 
          key={index}
          razaoSocial={item.razaoSocial}
          cnpj={item.cnpj}
          tema={tema}
        />
      ))}
    </div>
  );
}