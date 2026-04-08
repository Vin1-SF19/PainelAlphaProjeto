"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    SlidersHorizontal, SortAsc, SortDesc, Calendar, 
    CheckCircle2, XCircle, Ban, PauseCircle, 
    ShieldCheck, Ghost, RotateCcw, ChevronDown
} from "lucide-react";
import { getTema } from "@/lib/temas";

export default function FiltrosAlpha({
    tema,
    ordem, setOrdem,
    ordemData, setOrdemData,
    filtroStatus, setFiltroStatus,
    filtroSituacao, setFiltroSituacao,
    filtroSubmodalidade, setFiltroSubmodalidade,
}: any) {
    const [aberto, setAberto] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const visual = getTema(tema);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const temFiltroAtivo = ordem || ordemData || filtroStatus !== "todos" || filtroSituacao !== "todos" || filtroSubmodalidade !== "todos";

    // Sub-componente para os botões de filtro para manter o código limpo
    const FiltroBtn = ({ active, onClick, icon: Icon, label, colorActive = visual.bg }: any) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex-1
                ${active 
                    ? `${colorActive} text-white border-white/20 shadow-lg scale-[1.02]` 
                    : "bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                }`}
        >
            {Icon && <Icon size={12} />}
            {label}
        </button>
    );

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                onClick={() => setAberto(!aberto)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border backdrop-blur-md
                    ${temFiltroAtivo
                        ? `${visual.bg} ${visual.shadow} border-white/20 text-white`
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
            >
                <SlidersHorizontal size={14} className={temFiltroAtivo ? "text-white" : visual.text} />
                Filtrar Operações
                <ChevronDown size={14} className={`transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {aberto && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-80 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 z-[100] backdrop-blur-2xl"
                    >
                        {/* Brilho de fundo interno */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 ${visual.glow} blur-[80px] rounded-full opacity-20`} />

                        <div className="relative z-10 space-y-6">
                            {/* Seção: Ordenação */}
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                                    <SortAsc size={12} className={visual.text} /> Ordenação Alfabética
                                </h3>
                                <div className="flex gap-2">
                                    <FiltroBtn label="A-Z" icon={SortAsc} active={ordem === "asc"} onClick={() => setOrdem(ordem === "asc" ? "todos" : "asc")} />
                                    <FiltroBtn label="Z-A" icon={SortDesc} active={ordem === "desc"} onClick={() => setOrdem(ordem === "desc" ? "todos" : "desc")} />
                                </div>
                            </div>

                            {/* Seção: Data */}
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                                    <Calendar size={12} className={visual.text} /> Cronologia
                                </h3>
                                <div className="flex gap-2">
                                    <FiltroBtn label="Recentes" active={ordemData === "recentes"} onClick={() => setOrdemData(ordemData === "recentes" ? "todos" : "recentes")} />
                                    <FiltroBtn label="Antigos" active={ordemData === "antigos"} onClick={() => setOrdemData(ordemData === "antigos" ? "todos" : "antigos")} />
                                </div>
                            </div>

                            {/* Seção: Submodalidade */}
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                                    <ShieldCheck size={12} className={visual.text} /> Submodalidade
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <FiltroBtn label="50K" active={filtroSubmodalidade === "LIMITADA (ATÉ US$ 50.000)"} onClick={() => setFiltroSubmodalidade(filtroSubmodalidade === "LIMITADA (ATÉ US$ 50.000)" ? "todos" : "LIMITADA (ATÉ US$ 50.000)")} />
                                    <FiltroBtn label="150K" active={filtroSubmodalidade === "LIMITADA (ATÉ US$ 150.000)"} onClick={() => setFiltroSubmodalidade(filtroSubmodalidade === "LIMITADA (ATÉ US$ 150.000)" ? "todos" : "LIMITADA (ATÉ US$ 150.000)")} />
                                    <FiltroBtn label="ILIM" active={filtroSubmodalidade === "ILIMITADA"} onClick={() => setFiltroSubmodalidade(filtroSubmodalidade === "ILIMITADA" ? "todos" : "ILIMITADA")} />
                                </div>
                            </div>

                            {/* Seção: Situação */}
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                                    <Ghost size={12} className={visual.text} /> Status Radar
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <FiltroBtn label="Deferida" icon={ShieldCheck} active={filtroSituacao === "DEFERIDA"} onClick={() => setFiltroSituacao(filtroSituacao === "DEFERIDA" ? "todos" : "DEFERIDA")} colorActive="bg-emerald-600" />
                                    <FiltroBtn label="Suspensa" icon={PauseCircle} active={filtroSituacao === "SUSPENSA"} onClick={() => setFiltroSituacao(filtroSituacao === "SUSPENSA" ? "todos" : "SUSPENSA")} colorActive="bg-orange-600" />
                                    <FiltroBtn label="Não Hab." icon={Ban} active={filtroSituacao === "NÃO HABILITADA"} onClick={() => setFiltroSituacao(filtroSituacao === "NÃO HABILITADA" ? "todos" : "NÃO HABILITADA")} colorActive="bg-red-600" />
                                    <FiltroBtn label="Sem Status" icon={Ghost} active={filtroSituacao === "SEM STATUS"} onClick={() => setFiltroSituacao(filtroSituacao === "SEM STATUS" ? "todos" : "SEM STATUS")} colorActive="bg-slate-700" />
                                </div>
                            </div>

                            {/* Footer: Limpar */}
                            <button
                                onClick={() => {
                                    setOrdem("todos");
                                    setOrdemData("todos");
                                    setFiltroStatus("todos");
                                    setFiltroSituacao("todos");
                                    setFiltroSubmodalidade("todos");
                                }}
                                className="w-full py-3 mt-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={12} />
                                Reiniciar Filtros
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}