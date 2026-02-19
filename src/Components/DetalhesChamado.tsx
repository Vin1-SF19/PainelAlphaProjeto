"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { updateChamadosStatus } from "@/actions/chamados";
import { Clock, CheckCircle, User, MessageSquare, Calendar, CheckCircle2 } from "lucide-react";

export default function DetalhesChamado({ chamado, isAdmin }: any) {
  const [open, setOpen] = useState(false);

  const handleStatus = async (status: string) => {
    let solucao = "";
    if (status === "CONCLUIDO") {
      solucao = prompt("Descreva a solução aplicada:") || "";
      if (!solucao) return; // Cancela se não escrever solução
    }
    
    await updateChamadosStatus(chamado.id, status, solucao);
    setOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="ghost" 
        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 font-bold"
      >
        Ver Detalhes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl rounded-[2rem] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  DETALHES DO <span className="text-blue-500">CHAMADO</span>
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-1 font-bold">
                  <Calendar size={14} /> {new Date(chamado.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="px-4 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold">
                #{chamado.id}
              </div>
            </DialogHeader>

            <div className="grid gap-6">
              {/* SOLICITANTE */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="p-3 rounded-xl bg-blue-600/20"><User className="text-blue-500" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Solicitante</p>
                  <p className="font-bold text-slate-200">{chamado.solicitante?.nome} (@{chamado.solicitante?.usuario})</p>
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" /> Ocorrência
                </h4>
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-300 text-sm leading-relaxed italic">
                  "{chamado.descricao}"
                </div>
              </div>

              {/* SOLUÇÃO CADASTRADA */}
              {chamado.solucao && (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-emerald-500 text-xs font-black uppercase mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Solução Aplicada
                  </h4>
                  <p className="text-emerald-100/80 text-sm">{chamado.solucao}</p>
                </div>
              )}
            </div>

            {/* AÇÕES DO ADMIN */}
            {isAdmin && chamado.status !== "CONCLUIDO" && (
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                <Button 
                  onClick={() => handleStatus("EM_ATENDIMENTO")}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-500 border border-amber-500/20 h-12 font-bold rounded-xl"
                >
                  <Clock className="mr-2 w-4 h-4" /> Em curso
                </Button>
                <Button 
                  onClick={() => handleStatus("CONCLUIDO")}
                  className="bg-blue-600 hover:bg-blue-500 text-white h-12 font-bold rounded-xl shadow-lg shadow-blue-900/20"
                >
                  <CheckCircle className="mr-2 w-4 h-4" /> Finalizar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
