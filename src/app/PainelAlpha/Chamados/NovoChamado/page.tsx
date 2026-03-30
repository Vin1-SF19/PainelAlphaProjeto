"use client";

import { createChamadoAction } from "@/actions/chamados";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Loader2, ShieldAlert, Cpu, Network, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function NovoChamadoPage() {
  const [pending, setPending] = useState(false);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);

      const res = await createChamadoAction(formData);

      if (res?.error) {
        toast.error(res.error);
        setPending(false);
      }

    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') return;
      console.error(err);
      toast.error("Falha ao processar requisição");
      setPending(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12 text-white selection:bg-blue-500/30">
      <div className="mx-auto max-w-3xl">

        <Link href="/PainelAlpha/Chamados" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 group transition-colors">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-blue-500/50 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Protocolos Ativos</span>
        </Link>

        <div className="relative rounded-[3rem] border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 ring-1 ring-white/10 overflow-hidden">

          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full" />

          <header className="relative mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-blue-500 w-5 h-5 animate-pulse" />
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                Abrir <span className="text-blue-500">Ticket</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Sistema de Suporte Alpha v2.0</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título do Incidente</Label>
                <Input
                  name="titulo"
                  placeholder="Ex: Falha no Login"
                  required
                  className="h-12 bg-black/40 border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-slate-700 text-sm font-bold transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria de Atuação</Label>
                <div className="relative">
                  <select
                    name="categoria"
                    className="appearance-none h-12 w-full rounded-2xl border border-white/5 bg-black/40 px-4 text-sm font-bold outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                  >
                    <option value="Hardware">🛠️ Hardware</option>
                    <option value="Software">💻 Software</option>
                    <option value="Rede">🌐 Infraestrutura / Rede</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" /> Nível de Urgência
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'].map((p) => (
                  <label key={p} className="relative group cursor-pointer">
                    <input type="radio" name="prioridade" value={p} defaultChecked={p === 'MEDIA'} className="peer sr-only" />
                    <div className="flex items-center justify-center h-12 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-tighter peer-checked:bg-blue-600 peer-checked:border-blue-400 peer-checked:text-white transition-all group-hover:border-white/20">
                      {p}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-500" /> Relatório Detalhado
              </Label>
              <textarea
                name="descricao"
                required
                rows={5}
                placeholder="Descreva o problema com o máximo de detalhes..."
                className="w-full rounded-[2rem] border border-white/5 bg-black/40 p-5 text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none placeholder:text-slate-700"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className={`w-full rounded-[2rem] h-16 font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${pending
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 active:scale-95"
                }`}
            >
              {pending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Abrir Chamado
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          Alpha Systems • Acesso Criptografado • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
