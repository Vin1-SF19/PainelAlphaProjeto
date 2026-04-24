"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LayoutDashboard, Settings, ExternalLink, List, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { getTema } from "@/lib/temas";
import ModalConsultaRadar from "../components/consulta/ConsultaRadar";

export default function RadarIntroHeader({ layout, setLayout }: {
    layout: "grid" | "table",
    setLayout: (l: "grid" | "table") => void
}) {


    const { data: session } = useSession();
    const [isIntro, setIsIntro] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [infosimples, setInfosimples] = useState<any>(null);
    const [isOffline, setIsOffline] = useState(typeof window !== "undefined" ? !navigator.onLine : false);

    useEffect(() => {
        const handleStatus = () => {
            setIsOffline(!navigator.onLine);
        };

        handleStatus();

        window.addEventListener("online", handleStatus);
        window.addEventListener("offline", handleStatus);

        return () => {
            window.removeEventListener("online", handleStatus);
            window.removeEventListener("offline", handleStatus);
        };
    }, []);


    const user = session?.user as any;
    const temaNome = (typeof window !== "undefined" && localStorage.getItem("alpha-theme-temp"))
        || user?.tema_interface
        || "blue";

    const visual = getTema(temaNome);

    useEffect(() => {
        const timer = setTimeout(() => setIsIntro(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const buscarSaldo = async () => {
            const res = await fetch("/api/InfoSimples");
            const data = await res.json();
            setInfosimples(data);
        };

        buscarSaldo();

        const interval = setInterval(buscarSaldo, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <motion.header
                initial={false}
                animate={{
                    height: isIntro ? "100vh" : "70px",
                    backgroundColor: isIntro ? "#020617" : "rgba(2, 6, 23, 0.8)",
                    borderBottom: isIntro ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-0 left-0 w-full z-50 flex items-center overflow-hidden backdrop-blur-xl"
            >
                {/* Glow de fundo */}
                <AnimatePresence>
                    {isIntro && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 ${visual.glow} blur-[120px] rounded-full -z-10`}
                        />
                    )}
                </AnimatePresence>


                <AnimatePresence>
                    {isIntro && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center z-[60] pointer-events-none"
                        >
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter">
                                Bem-vindo ao <span className={visual.text}>Painel RADAR</span>
                            </h1>
                            <div className="flex items-center justify-center gap-3">
                                <div className={`h-[1px] w-12 ${visual.bg} opacity-50`} />
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Ambiente Operacional</p>
                                <div className={`h-[1px] w-12 ${visual.bg} opacity-50`} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
                    {/* Logo dinâmico */}
                    <motion.div layout className="flex items-center gap-3 shrink-0">
                        <motion.div
                            animate={{ rotate: isIntro ? 360 : 0 }}
                            className={`${visual.bg} p-2.5 rounded-2xl shadow-lg ${visual.shadow}`}
                        >
                            <ShieldCheck className="text-white w-5 h-5" />
                        </motion.div>

                        <motion.div layout className="flex flex-col">
                            <span className="text-white font-black tracking-tighter text-xl italic uppercase leading-none">
                                RADAR<span className={visual.text}>ALPHA</span>
                            </span>
                            {isIntro && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1"
                                >
                                    Sistemas de Consulta
                                </motion.span>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Menu Lateral */}
                    {!isIntro && (
                        <motion.nav
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 ml-auto justify-end"
                        >
                            {/* BADGE DE SALDO ESTILIZADO */}
                            <div
                                className={`flex items-center gap-4 px-4 h-12 bg-black/40 backdrop-blur-md rounded-2xl border transition-all duration-500 shadow-lg ${infosimples
                                        ? infosimples.saldo < 100
                                            ? "border-rose-500/40 shadow-rose-500/5 animate-pulse"
                                            : "border-white/10"
                                        : "border-white/10"
                                    }`}
                            >
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] uppercase font-black text-gray-500 tracking-tighter">
                                            Saldo Atual
                                        </span>
                                        <span className={`h-1.5 w-1.5 rounded-full ${infosimples?.saldo < 100 ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                                            }`} />
                                    </div>

                                    <h2 className={`text-sm font-mono font-black tracking-tight ${infosimples?.saldo < 100 ? "text-rose-400" : "text-emerald-400"
                                        }`}>
                                        {isOffline ? (
                                            <div className="flex items-center gap-1 text-[8px]">
                                                <Loader2 size={10} className="animate-spin" /> OFFLINE
                                            </div>
                                        ) : (
                                            `R$ ${Number(infosimples?.saldo || 0).toFixed(2)}`
                                        )}
                                    </h2>
                                </div>

                                {/* Divisor interno sutil */}
                                <div className="h-6 w-[1px] bg-white/5" />

                                <div className="flex flex-col justify-center hidden sm:flex">
                                    <span className="text-[7px] uppercase font-bold text-gray-600">Consumo</span>
                                    <span className="text-[10px] font-black text-slate-300 italic">
                                        R$ {Number(infosimples?.consumo || 0).toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            {/* BOTÕES DE LAYOUT E PREFERÊNCIAS */}
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setLayout(layout === "grid" ? "table" : "grid")}
                                    className={`p-2 rounded-lg transition-all ${layout === "table" ? visual.text + " bg-white/10 shadow-lg" : "text-slate-500 hover:text-white"}`}
                                >
                                    {layout === "grid" ? <LayoutDashboard size={16} /> : <List size={16} />}
                                </button>

                                <a href="/PainelAlpha/Preferencias" className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <Settings size={16} />
                                </a>
                            </div>

                            <div className="h-8 w-[1px] bg-white/10 mx-1" />

                            {/* ACESSOS EXTERNOS E AÇÃO PRINCIPAL */}
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://servicos.receita.fazenda.gov.br/servicos/radar/consultaSituacaoCpfCnpj.asp"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group"
                                >
                                    <ExternalLink size={12} className={`transition-transform group-hover:scale-110 ${visual.text}`} />
                                    Receita
                                </a>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className={`${visual.bg} ${visual.shadow} h-10 cursor-pointer text-white px-6 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all hover:brightness-125 hover:scale-[1.02] active:scale-95 shadow-xl`}
                                >
                                    Nova Consulta
                                </button>
                            </div>
                        </motion.nav>
                    )}
                </div>
            </motion.header>

            {!isIntro && <div className="h-[70px]" />}
            <ModalConsultaRadar
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tema={temaNome}
            />
        </>
    );
}