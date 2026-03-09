"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Palette, Layout, Save, CheckCircle2, Monitor } from "lucide-react";
import { toast } from "sonner";
import { atualizarInterfaceAction } from "@/actions/preferencias";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { getTema } from "@/lib/temas";

const TEMAS = [
  { id: "blue", label: "Alpha Blue", color: "bg-blue-600" },
  { id: "emerald", label: "Protocolo Green", color: "bg-emerald-600" },
  { id: "rose", label: "Cyber Rose", color: "bg-rose-600" },
  { id: "amber", label: "Warning Gold", color: "bg-amber-600" },
  { id: "violet", label: "Nebula Violet", color: "bg-violet-600" },
  { id: "cyan", label: "Electric Cyan", color: "bg-cyan-500" },
  { id: "fuchsia", label: "Deep Fuchsia", color: "bg-fuchsia-600" },
  { id: "toxic", label: "Toxic Lime", color: "bg-lime-500" },
  { id: "crimson", label: "Crimson Red", color: "bg-red-600" },
  { id: "midnight", label: "Midnight Blue", color: "bg-indigo-700" },
  { id: "lavender", label: "Soft Lavender", color: "bg-purple-400" },
  { id: "pink", label: "Alpha Pink", color: "bg-pink-500" },
];

export default function PreferenciasPage() {
  const { data: session, update } = useSession();
  const [tema, setTema] = useState((session?.user as any)?.tema_interface || "blue");
  const [densidade, setDensidade] = useState((session?.user as any)?.densidade_painel || "default");
  const [loading, setLoading] = useState(false);

  const preview = getTema(tema);

  const handleSalvar = async () => {
    setLoading(true);

    // 🚀 1. MUDANÇA VISUAL IMEDIATA (Não espera o banco)
    const estiloSelec = getTema(tema);
    document.documentElement.style.setProperty("--alpha-primary", estiloSelec.accent);

    try {
      const res = await atualizarInterfaceAction(tema, densidade);

      if (res?.success) {
        await update({
          user: {
            tema_interface: tema,
            densidade_painel: densidade
          }
        });

        toast.success("Protocolo Alpha Sincronizado!");

        setTimeout(() => {
          window.location.assign(`/PainelAlpha?update=${Date.now()}`);
        }, 600);
      }
    } catch (error) {
      toast.error("Erro na sincronia.");
    } finally {
      setLoading(false);
    }
  };




  return (
    <main className="min-h-screen bg-[#020617] p-8 lg:p-16 text-white relative transition-colors duration-500">

      {/* FUNDO QUE MUDA COM O TEMA */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${preview.glow} blur-[150px] rounded-full transition-all duration-700`} />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Palette className={preview.text} size={40} /> Customizar Interface
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Ajuste de Estética Operacional</p>
          </div>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className={`cursor-pointer h-14 px-10 ${preview.bg} hover:brightness-110 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all shadow-xl ${preview.shadow} disabled:opacity-50`}
          >
            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Salvar Configuração
          </button>
        </header>

        <div className="grid gap-8">
          <BotaoVoltar />

          {/* SELEÇÃO DE TEMA */}
          <section className={`bg-slate-900/40 border ${preview.border} p-8 rounded-[2.5rem] transition-all duration-500`}>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Monitor size={16} className={preview.text} /> Esquema de Cores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMAS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTema(t.id)}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${tema === t.id
                    ? `${preview.border.replace('20', '50')} ${preview.glow} scale-105`
                    : 'border-white/5 bg-black/20 hover:border-white/20'
                    }`}
                >
                  <div className={`h-12 w-12 rounded-full ${t.color} shadow-lg ${tema === t.id ? 'ring-4 ring-white/20' : ''}`} />
                  <span className={`text-[9px] font-black uppercase ${tema === t.id ? preview.text : 'text-slate-500'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* DENSIDADE DO PAINEL */}
          <section className={`bg-slate-900/40 border ${preview.border} p-8 rounded-[2.5rem] transition-all duration-500`}>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layout size={16} className={preview.text} /> Layout do Painel
            </h2>
            <div className="flex gap-4">
              {['default', 'compact'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDensidade(d)}
                  className={`cursor-pointer flex-1 p-6 rounded-3xl border transition-all flex items-center justify-between ${densidade === d
                    ? `${preview.border.replace('20', '50')} ${preview.glow} text-white`
                    : 'border-white/5 bg-black/20 text-slate-500 hover:border-white/20'
                    }`}
                >
                  <span className="text-[10px] font-black uppercase">{d === 'default' ? 'Espaçamento Padrão' : 'Modo Compacto'}</span>
                  {densidade === d && <CheckCircle2 size={18} className={preview.text} />}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
