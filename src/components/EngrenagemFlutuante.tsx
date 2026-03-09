"use client";

import { useState } from "react";
import { Settings, Megaphone, X, Send, PowerOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { getTema } from "@/lib/temas";
import { toast } from "sonner";
import { dispararAvisoAction, encerrarAvisoAction } from "@/actions/avisos";

export function EngrenagemFlutuante() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [tipo, setTipo] = useState("warning");
  const [loading, setLoading] = useState(false);

  if (session?.user?.role !== "Admin") return null;

  const style = getTema((session?.user as any)?.tema_interface);

  const handleEnviar = async () => {
    if (!msg) return toast.error("Digite a mensagem do broadcast.");
    setLoading(true);
    const res = await dispararAvisoAction(msg, tipo);
    if (res.success) {
      toast.success("Broadcast Alpha disparado com sucesso!");
      setIsModalOpen(false);
      setMsg("");
    }
    setLoading(false);
  };

  const handleEncerrar = async () => {
    setLoading(true);
    const res = await encerrarAvisoAction();
    if (res.success) {
      toast.success("Aviso global encerrado.");
      setIsModalOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-10 right-10 z-50 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 group hover:scale-110 active:scale-95 bg-slate-900/40 ${style.border.replace('20', '40')} hover:${style.border.replace('20', '60')} cursor-pointer`}
      >
        <Settings size={26} className={`${style.text} animate-[spin_10s_linear_infinite] group-hover:rotate-90 transition-transform duration-700`} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${style.bg}`} />
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-6 flex items-center gap-3">
              <Megaphone className={style.text} size={22} /> Central de Broadcast
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Mensagem do Aviso</label>
                <textarea 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="EX: O SISTEMA ENTRARÁ EM MANUTENÇÃO..."
                  className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest text-white focus:border-alpha outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['warning', 'error', 'info'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`h-10 rounded-xl text-[9px] font-black uppercase border transition-all ${tipo === t ? style.bg + ' border-transparent' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleEnviar}
                  disabled={loading}
                  className={`flex-1 h-14 ${style.bg} hover:brightness-110 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50`}
                >
                  {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                  Disparar
                </button>
                <button 
                  onClick={handleEncerrar}
                  className="w-14 h-14 bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all active:scale-95"
                  title="Encerrar Aviso"
                >
                  <PowerOff size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
