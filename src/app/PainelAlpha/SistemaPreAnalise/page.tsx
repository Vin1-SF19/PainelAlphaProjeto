"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Database, ShieldCheck, BarChart3, Loader2,
    RefreshCw, CheckCircle2, AlertCircle, Fingerprint,
    ArrowRight, LayoutDashboard, History, X, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getTema } from "@/lib/temas";
import { toast } from "sonner";
import { consultarReceita, consultarRadar, consultarEmpresaAqui } from "@/actions/PreAnalise";
import BlocoResultados from "./BlocoResultados";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import BotaoVoltarMinimalista from "@/components/BotaoVoltarMinimalista";

type StatusConsulta = "idle" | "loading" | "success" | "error";

export default function SistemaPreAnalise() {
    const { data: session } = useSession();
    const [cnpj, setCnpj] = useState("");
    const [isConsultando, setIsConsultando] = useState(false);
    const [concluido, setConcluido] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [modalHistorico, setModalHistorico] = useState(false);
    const [historicoPesquisas, setHistoricoPesquisas] = useState([]);

    const [etapas, setEtapas] = useState({
        rfb: { status: "idle" as StatusConsulta, dados: null as any },
        radar: { status: "idle" as StatusConsulta, dados: null as any },
        empresaqui: { status: "idle" as StatusConsulta, dados: null as any }
    });

    const [confirmarNovaConsulta, setConfirmarNovaConsulta] = useState(false);

    const handleNovaConsulta = () => {
        setConfirmarNovaConsulta(false);
        novaConsulta();
    };


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

    const handleConsultar = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const cleanCnpj = cnpj.replace(/\D/g, "");
        setIsConsultando(true);

        // Passo 1: Receita
        setEtapas(prev => ({ ...prev, rfb: { status: "loading", dados: null } }));
        const resRfb = await consultarReceita(cleanCnpj);
        setEtapas(prev => ({ ...prev, rfb: { status: resRfb.error ? "error" : "success", dados: resRfb } }));

        // Passo 2: Radar
        setEtapas(prev => ({ ...prev, radar: { status: "loading", dados: null } }));
        const resRadar = await consultarRadar(cleanCnpj);
        setEtapas(prev => ({ ...prev, radar: { status: resRadar.error ? "error" : "success", dados: resRadar } }));

        // Passo 3: EmpresaAqui
        setEtapas(prev => ({ ...prev, empresaqui: { status: "loading", dados: null } }));
        const resEq = await consultarEmpresaAqui(cleanCnpj);
        setEtapas(prev => ({ ...prev, empresaqui: { status: resEq.error ? "error" : "success", dados: resEq } }));
    };

    const reconsultarIndividual = async (chave: 'rfb' | 'radar' | 'empresaqui') => {
        // 1. Reseta o status da etapa específica para 'loading'
        setEtapas(prev => ({
            ...prev,
            [chave]: { ...prev[chave], status: 'loading', erro: null }
        }));

        try {
            let res;
            const cnpjLimpo = cnpj.replace(/\D/g, "");

            if (chave === 'rfb') {
                res = await fetch(`/api/ReceitaFederal?cnpj=${cnpjLimpo}`);
            } else if (chave === 'radar') {

                res = await fetch(`/api/ConsultaRadar?cnpj=${cnpjLimpo}`);
            } else {
                res = await fetch(`/api/EmpresaAqui?cnpj=${cnpjLimpo}`);
            }

            if (!res.ok) throw new Error("Falha na resposta");
            const data = await res.json();

            setEtapas(prev => ({
                ...prev,
                [chave]: { status: 'success', dados: data }
            }));

        } catch (error) {
            setEtapas(prev => ({
                ...prev,
                [chave]: { ...prev[chave], status: 'error' }
            }));
        }
    };


    const ProgressCard = ({ label, status, icon, visual, onRetry }: any) => {
        const isError = status === 'error';
        const isLoading = status === 'loading';
        const isSuccess = status === 'success';

        return (
            <div className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${isError ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'
                }`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`p-4 rounded-2xl transition-all ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' :
                        isError ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'
                        }`}>
                        {isLoading ? <RefreshCw size={24} className="animate-spin" /> : icon}
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</h3>
                        <p className={`text-xs font-bold uppercase ${isSuccess ? 'text-emerald-400' : isError ? 'text-rose-500' : 'text-white'
                            }`}>
                            {status === 'idle' && "Aguardando..."}
                            {isLoading && "Consultando..."}
                            {isSuccess && "Concluído"}
                            {isError && "Erro na Consulta"}
                        </p>
                    </div>

                    {isError && (
                        <button
                            onClick={onRetry}
                            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                        >
                            <RefreshCw size={12} /> Tentar Novamente
                        </button>
                    )}
                </div>

                {/* Barra de progresso interna discreta */}
                <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full overflow-hidden rounded-b-[2rem]">
                    <div className={`h-full transition-all duration-1000 ${isSuccess ? 'bg-emerald-500 w-full' :
                        isError ? 'bg-rose-500 w-full' :
                            isLoading ? 'bg-indigo-500 animate-pulse w-1/2' : 'w-0'
                        }`} />
                </div>
            </div>
        );
    };

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
                        <h1 className="text-xl font-black italic tracking-tighter text-white">
                            Sistema de pré <span className={visual.text}>Analise</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setModalHistorico(true)}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-slate-300"
                        >
                            <History size={14} className={visual.text} /> Historico
                        </button>


                        {mostrarResultados && (
                            <button
                                onClick={() => setConfirmarNovaConsulta(true)}
                                className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                            >
                                <RefreshCw size={14} className={visual.text} /> Nova Consulta
                            </button>
                        )}
                        <BotaoVoltarMinimalista />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-20">
                <AnimatePresence mode="wait">

                    {/* TELA 1: INPUT */}
                    {!isConsultando && !mostrarResultados && (
                        <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-3xl mx-auto text-center mt-20">
                            <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">Realizar <span className={visual.text}>Analise</span></h2>
                            <form onSubmit={handleConsultar} className="w-full max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-2xl font-mono text-center focus:border-white/20 transition-all placeholder:text-slate-800 uppercase tracking-[0.2em]"
                                />
                                <button disabled={cnpj.replace(/\D/g, "").length < 14} type="submit" className={`cursor-pointer mt-10 px-16 py-5 rounded-[1.5rem] ${visual.bg} ${visual.shadow} text-white font-black uppercase tracking-[0.3em] text-[12px] flex items-center gap-4 mx-auto hover:scale-105 active:scale-95 transition-all disabled:opacity-30`}>
                                    <Search size={18} /> Pesquisar
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* TELA 2: PROGRESSO DOS CARDS */}
                    {isConsultando && !mostrarResultados && (
                        <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                <ProgressCard
                                    label="Cartão CNPJ RFB"
                                    status={etapas.rfb.status}
                                    icon={<Database size={24} />}
                                    visual={visual}
                                    onRetry={() => reconsultarIndividual('rfb')}
                                />
                                <ProgressCard
                                    label="Radar SISCOMEX"
                                    status={etapas.radar.status}
                                    icon={<ShieldCheck size={24} />}
                                    visual={visual}
                                    onRetry={() => reconsultarIndividual('radar')}
                                />
                                <ProgressCard
                                    label="Regime Tributário"
                                    status={etapas.empresaqui.status}
                                    icon={<BarChart3 size={24} />}
                                    visual={visual}
                                    onRetry={() => reconsultarIndividual('empresaqui')}
                                />
                            </div>

                            <AnimatePresence>
                                {concluido && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                                        <button
                                            onClick={() => setMostrarResultados(true)}
                                            className="cursor-pointer group relative flex items-center gap-4 px-12 py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
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
                        <BlocoResultados dados={etapas} visual={visual} item />
                    )}

                </AnimatePresence>
            </main>

            {modalHistorico && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col relative">

                        {/* HEADER DO MODAL */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                    Histórico de <span className={visual.text}>Consultas</span>
                                </h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Últimas 20 empresas analisadas
                                </p>
                            </div>
                            <button
                                onClick={() => setModalHistorico(false)}
                                className="cursor-pointer p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* LISTA DE CARDS */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-4">
                                {/* MAPEAR SEU HISTÓRICO AQUI */}
                                {[1, 2, 3].map((item, i) => (
                                    <div key={i} className="group relative bg-white/5 border border-white/5 hover:border-white/10 p-6 rounded-[1.5rem] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 group-hover:text-white group-hover:border-indigo-500/30 transition-all">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase italic tracking-tight">RAZÃO SOCIAL DA EMPRESA LTDA</h3>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                                                    <span>00.000.000/0001-00</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span>12/10/2023 - 14:30</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                                                QUALIFICADO
                                            </div>
                                            <button className="cursor-pointer flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
                                                Reabrir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FOOTER DO MODAL */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-center">
                            <button className="cursor-pointer text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-rose-500 transition-all">
                                Limpar todo o histórico
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmarNovaConsulta && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center">
                        {/* Ícone de Alerta */}
                        <div className={`mx-auto w-16 h-16 rounded-full ${visual.bg} flex items-center justify-center mb-6 shadow-lg`}>
                            <RefreshCw size={28} className="text-white animate-spin-slow" />
                        </div>

                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
                            Nova Consulta?
                        </h3>

                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight leading-relaxed mb-8">
                            Os dados da análise atual serão perdidos. Deseja continuar?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleNovaConsulta}
                                className="cursor-pointer w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                            >
                                Sim, Iniciar Nova
                            </button>

                            <button
                                onClick={() => setConfirmarNovaConsulta(false)}
                                className="cursor-pointer w-full py-4 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}



const ProgressCard = ({ label, status, icon, visual, onRetry }: any) => {
    const isError = status === 'error';
    const isLoading = status === 'loading';
    const isSuccess = status === 'success';

    return (
        <div className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${isError ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex flex-col items-center text-center gap-4">
                <div className={`p-4 rounded-2xl transition-all ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' :
                    isError ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'
                    }`}>
                    {isLoading ? <RefreshCw size={24} className="animate-spin" /> : icon}
                </div>

                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</h3>
                    <p className={`text-xs font-bold uppercase ${isSuccess ? 'text-emerald-400' : isError ? 'text-rose-500' : 'text-white'
                        }`}>
                        {status === 'idle' && "Aguardando..."}
                        {isLoading && "Consultando..."}
                        {isSuccess && "Concluído"}
                        {isError && "Erro na Consulta"}
                    </p>
                </div>


                {isError && (
                    <button
                        onClick={onRetry}
                        className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                    >
                        <RefreshCw size={12} /> Tentar Novamente
                    </button>
                )}
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full overflow-hidden rounded-b-[2rem]">
                <div className={`h-full transition-all duration-1000 ${isSuccess ? 'bg-emerald-500 w-full' :
                    isError ? 'bg-rose-500 w-full' :
                        isLoading ? 'bg-indigo-500 animate-pulse w-1/2' : 'w-0'
                    }`} />
            </div>

        </div>
    );
};

function parseData(arg0: any) {
    throw new Error("Function not implemented.");
}
