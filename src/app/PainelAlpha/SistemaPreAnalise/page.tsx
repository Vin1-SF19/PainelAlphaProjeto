"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Database, ShieldCheck, BarChart3, Loader2,
    RefreshCw, CheckCircle2, AlertCircle, Fingerprint,
    ArrowRight, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getTema } from "@/lib/temas";
import { toast } from "sonner";
import { executarPreAnalise } from "@/actions/PreAnalise";
import BlocoResultados from "./BlocoResultados";

type StatusConsulta = "idle" | "loading" | "success" | "error";

export default function SistemaPreAnalise() {
    const { data: session } = useSession();
    const [cnpj, setCnpj] = useState("");
    const [isConsultando, setIsConsultando] = useState(false);
    const [concluido, setConcluido] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const [etapas, setEtapas] = useState({
        rfb: { status: "idle" as StatusConsulta, dados: null as any },
        radar: { status: "idle" as StatusConsulta, dados: null as any },
        empresaqui: { status: "idle" as StatusConsulta, dados: null as any }
    });

    const temaNome = (session?.user as any)?.tema_interface || "blue";
    const visual = getTema(temaNome);

    const novaConsulta = useCallback(() => {
        setMostrarResultados(false);
        setIsConsultando(false);
        setConcluido(false);
        setCnpj("");
        setEtapas({
            rfb: { status: "idle", dados: null },
            radar: { status: "idle", dados: null },
            empresaqui: { status: "idle", dados: null }
        });
    }, []);

    const handleConsultar = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCnpj = cnpj.replace(/\D/g, "");
        if (cleanCnpj.length !== 14) return toast.error("CNPJ Inválido");

        setIsConsultando(true);
        setConcluido(false);

        setEtapas({
            rfb: { status: "loading", dados: null },
            radar: { status: "loading", dados: null },
            empresaqui: { status: "loading", dados: null }
        });

        const res = await executarPreAnalise(cleanCnpj);

        if (res.success && res.data) {
            setTimeout(() => setEtapas(prev => ({ ...prev, rfb: { status: res.data!.rfb.error ? "error" : "success", dados: res.data!.rfb } })), 800);
            setTimeout(() => setEtapas(prev => ({ ...prev, radar: { status: res.data!.radar.error ? "error" : "success", dados: res.data!.radar } })), 1800);
            setTimeout(() => setEtapas(prev => ({ ...prev, empresaqui: { status: res.data!.empresaqui.error ? "error" : "success", dados: res.data!.empresaqui } })), 2800);
        } else {
            toast.error(res.error || "Erro na conexão");
            setIsConsultando(false);
        }
    };

    // Monitora quando a última etapa (EmpresaAqui) terminar
    useEffect(() => {
        if (etapas.empresaqui.status === "success" || etapas.empresaqui.status === "error") {
            setConcluido(true);
        }
    }, [etapas.empresaqui.status]);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-white/10">
            <header className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl z-50 flex items-center px-8">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${visual.bg} ${visual.shadow}`}>
                            <Fingerprint size={22} />
                        </div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">Empresa de pre<span className={visual.text}>Analise</span></h1>
                    </div>
                    {mostrarResultados && (
                        <button onClick={novaConsulta} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            <RefreshCw size={14} className={visual.text} /> Nova Consulta
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-20">
                <AnimatePresence mode="wait">

                    {/* TELA 1: INPUT */}
                    {!isConsultando && !mostrarResultados && (
                        <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-3xl mx-auto text-center mt-20">
                            <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">Scanner de <span className={visual.text}>Inteligência</span></h2>
                            <form onSubmit={handleConsultar} className="w-full max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-2xl font-mono text-center focus:border-white/20 transition-all placeholder:text-slate-800 uppercase tracking-[0.2em]"
                                />
                                <button disabled={cnpj.length < 14} type="submit" className={`mt-10 px-16 py-5 rounded-[1.5rem] ${visual.bg} ${visual.shadow} text-white font-black uppercase tracking-[0.3em] text-[12px] flex items-center gap-4 mx-auto hover:scale-105 active:scale-95 transition-all disabled:opacity-30`}>
                                    <Search size={18} /> Iniciar Auditoria
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* TELA 2: PROGRESSO DOS CARDS */}
                    {isConsultando && !mostrarResultados && (
                        <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                <ProgressCard label="Cartão CNPJ RFB" status={etapas.rfb.status} icon={<Database size={24} />} visual={visual} />
                                <ProgressCard label="Radar SISCOMEX" status={etapas.radar.status} icon={<ShieldCheck size={24} />} visual={visual} />
                                <ProgressCard label="Regime Tributário" status={etapas.empresaqui.status} icon={<BarChart3 size={24} />} visual={visual} />
                            </div>

                            {/* BOTÃO QUE SÓ APARECE APÓS CARREGAR TUDO */}
                            <AnimatePresence>
                                {concluido && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                                        <button
                                            onClick={() => setMostrarResultados(true)}
                                            className={`Cursor-pointer group relative flex items-center gap-4 px-12 py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]`}
                                        >
                                            Ver Resultados da Análise
                                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* TELA 3: RESULTADOS FINAIS */}
                    {mostrarResultados && (
                        <BlocoResultados dados={etapas} visual={visual} />
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}

function ProgressCard({ label, status, icon, visual }: any) {
    return (
        <div className={`p-10 rounded-[3rem] bg-slate-900/40 border transition-all duration-700 flex flex-col items-center text-center relative overflow-hidden ${status === 'success' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'
            }`}>
            {status === "loading" && (
                <motion.div className={`absolute top-0 left-0 w-full h-1 ${visual.bg}`} initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
            )}
            <div className={`mb-6 p-5 rounded-3xl transition-all duration-500 ${status === "success" ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]" :
                    status === "error" ? "bg-rose-500 text-white" : "bg-white/5 text-slate-600"
                }`}>
                {status === "success" ? <CheckCircle2 size={32} /> : status === "error" ? <AlertCircle size={32} /> : icon}
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">{label}</h3>
            <div className="text-[9px] font-black uppercase italic">
                {status === "loading" ? <span className="text-slate-500 animate-pulse">Sincronizando...</span> :
                    status === "success" ? <span className="text-emerald-400">Consulta Concluida</span> :
                        status === "error" ? <span className="text-rose-500">Erro na Consulta</span> : <span className="text-slate-800">Pendente</span>}
            </div>
        </div>
    );
}