"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ShieldAlert, CheckCircle, Save, Globe, Building2, MapPin } from "lucide-react";
import { getTema } from "@/lib/temas";

// Utilitário para máscara de CNPJ
const formatarCNPJ = (val: string) => {
    return val
        .replace(/\D/g, "")
        .replace(/^(\md{2})(\md)/, "$1.$2")
        .replace(/^(\md{2})\.(\md{3})(\md)/, "$1.$2.$3")
        .replace(/\.(\md{3})(\md)/, ".$1/$2")
        .replace(/(\md{4})(\md)/, "$1-$2")
        .substring(0, 18);
};

export default function ModalConsultaRadar({ isOpen, onClose, tema }: { isOpen: boolean, onClose: () => void, tema: string }) {
    const [cnpj, setCnpj] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [erro, setErro] = useState("");

    const visual = getTema(tema);

    // Limpa o estado ao fechar
    useEffect(() => {
        if (!isOpen) {
            setResultado(null);
            setErro("");
            setCnpj("");
        }
    }, [isOpen]);

    const handleConsulta = async () => {
        const docLimpo = cnpj.replace(/\D/g, "");
        if (docLimpo.length !== 14) {
            setErro("CNPJ INCOMPLETO");
            return;
        }

        setLoading(true);
        setErro("");
        setResultado(null);

        try {
            const res = await fetch(`/api/ConsultaCompleta?cnpj=${docLimpo}&forcar=true`);
            const data = await res.json();

            // Melhoria: Captura erro mesmo se o status for 200 (conforme nossa lógica de "ultrapassar" erros)
            if (data.error) throw new Error(data.message || data.error);
            if (!res.ok) throw new Error("Falha na comunicação com o servidor");

            setResultado(data);
        } catch (err: any) {
            setErro(err.message.toUpperCase());
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className={`absolute -top-24 -right-24 w-64 h-64 ${visual.glow} blur-[100px] rounded-full opacity-50`} />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter flex items-center gap-2">
                                    <Globe className={visual.text} size={20} />
                                    Operação Única
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sincronização em tempo real</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Input com Máscara */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConsulta()}
                                    className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white text-lg placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                                />
                                <button
                                    onClick={handleConsulta}
                                    disabled={loading || cnpj.length < 14}
                                    className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl ${visual.bg} ${visual.shadow} text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:grayscale transition-all active:scale-95`}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search size={16} />}
                                    Executar
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {loading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center bg-white/5 rounded-[2rem] border border-white/5">
                                        <Loader2 className={`w-10 h-10 animate-spin mx-auto ${visual.text} mb-4`} />
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Acessando Bases Governamentais...</p>
                                    </motion.div>
                                )}

                                {resultado && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent border ${visual.border} space-y-5`}>

                                        {/* Card Identidade */}
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                            <div className={`p-3 rounded-2xl ${visual.bg} bg-opacity-20 flex-shrink-0`}>
                                                <Building2 className={visual.text} size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-black text-white uppercase italic truncate">{resultado.razao_social || resultado.razaoSocial}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${visual.bg} text-white`}>{resultado.cnpj}</span>
                                                    <span className="text-[9px] text-slate-500 uppercase font-black truncate">{resultado.nome_fantasia || resultado.nomeFantasia || "Nome Fantasia Indisponível"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grid Inteligente */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Status Radar com destaque visual */}
                                            <div className="col-span-2 bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-1">Status de Habilitação Radar</span>
                                                    <span className={`text-sm font-black uppercase tracking-tight ${resultado.situacao_radar === 'HABILITADA' ? 'text-emerald-400' : visual.text}`}>
                                                        {resultado.situacao_radar || resultado.situacao || "NÃO HABILITADA"}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[8px] text-slate-500 uppercase font-black block">Submodalidade</span>
                                                    <span className="text-xs font-black text-white">{resultado.submodalidade || "N/A"}</span>
                                                </div>
                                            </div>

                                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin size={12} className="text-slate-500" />
                                                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Localidade</span>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-200 block">{resultado.municipio}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase">Estado: {resultado.uf}</span>
                                            </div>

                                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5">
                                                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-2">Capital Social</span>
                                                <span className="text-[11px] font-black text-emerald-400 block">
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(Number(resultado.capital_social || resultado.capitalSocial || 0))}
                                                </span>
                                                <span className="text-[8px] text-slate-500 font-bold uppercase">Início: {resultado.data_constituicao ? new Date(resultado.data_constituicao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-between items-center opacity-50">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={10} className="text-emerald-500" />
                                                <span className="text-[7px] text-slate-400 font-black uppercase">Dados Verificados</span>
                                            </div>
                                            <span className="text-[7px] text-slate-400 font-bold">FONTE: {resultado.fonte}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {erro && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400">
                                        <div className="p-2 bg-red-500/20 rounded-xl">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">Falha na Operação</p>
                                            <span className="text-xs font-black uppercase">{erro}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Botões de Ação */}
                        <div className="grid grid-cols-2 gap-4 mt-10 relative z-10">
                            <button
                                onClick={onClose}
                                className="h-14 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
                                Fechar Janela
                            </button>

                            <button
                                disabled={!resultado}
                                onClick={() => console.log("Salvar:", resultado)}
                                className={`h-14 rounded-2xl ${visual.bg} ${visual.shadow} text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-20 disabled:grayscale`}
                            >
                                <Save size={16} />
                                Registrar Consulta
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}