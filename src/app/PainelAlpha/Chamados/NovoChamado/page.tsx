import { createChamadoAction } from "@/actions/chamados"; 
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function NovoChamadoPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        
        <Link href="/PainelAlpha/Chamados" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para a lista</span>
        </Link>

        <div className="rounded-[2.5rem] border border-blue-500/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl p-8 ring-1 ring-white/5">
          <h1 className="text-3xl font-black mb-10">ABRIR <span className="text-blue-500">CHAMADO</span></h1>

          <form action={createChamadoAction} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="titulo" required className="bg-slate-950/50 border-slate-800" />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <select name="categoria" className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950/50 px-3 text-sm">
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Rede">Rede</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <div className="flex gap-4">
                {['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'].map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="prioridade" value={p} defaultChecked={p === 'MEDIA'} />
                    <span className="text-xs font-bold">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea name="descricao" required rows={4} className="w-full rounded-md border border-slate-800 bg-slate-950/50 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12">
              <Send className="w-4 h-4 mr-2" /> Enviar Chamado
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
