"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ShieldAlert, CheckCircle, Save } from "lucide-react";
import { getTema } from "@/lib/temas";

export default function ModalConsultaRadar({ isOpen, onClose, tema }: { isOpen: boolean, onClose: () => void, tema: string }) {
    const [cnpj, setCnpj] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [erro, setErro] = useState("");

    const visual = getTema(tema);

    const handleConsulta = async () => {
        if (cnpj.replace(/\D/g, "").length !== 14) return;

        setLoading(true);
        setErro("");
        setResultado(null);

        try {
            const res = await fetch(`/api/ConsultaCompleta?cnpj=${cnpj}&forcar=true`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Erro na consulta");

            setResultado(data);
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        {/* Glow de fundo interno */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 ${visual.glow} blur-[80px] rounded-full`} />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">Operação - Unica</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Consulta de Habilitação Radar</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Input Field */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                                />
                                <button
                                    onClick={handleConsulta}
                                    disabled={loading || cnpj.length < 14}
                                    className={`absolute right-2 top-2 h-10 px-4 rounded-xl ${visual.bg} ${visual.shadow} text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50`}
                                >
                                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search size={14} />}
                                    Consultar
                                </button>
                            </div>

                            {/* Status Area */}
                            <AnimatePresence mode="wait">
                                {loading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
                                        <Loader2 className={`w-8 h-8 animate-spin mx-auto ${visual.text} mb-4`} />
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando com Receita e Radar...</p>
                                    </motion.div>
                                )}

                                {resultado && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-[2rem] bg-white/5 border ${visual.border} space-y-4`}>
                                        {/* Cabeçalho do Resultado */}
                                        <div className="flex items-start gap-4 mb-2">
                                            <div className={`p-2 rounded-xl ${visual.bg} bg-opacity-20`}>
                                                <CheckCircle className={visual.text} size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-[11px] font-black text-white uppercase italic leading-tight">{resultado.razaoSocial}</h4>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{resultado.nomeFantasia || "SEM NOME FANTASIA"}</p>
                                                <p className={`text-[10px] font-mono font-bold ${visual.text} mt-1`}>{resultado.cnpj}</p>
                                            </div>
                                        </div>

                                        {/* Grid de Informações Operacionais */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter mb-1">Situação Radar</span>
                                                <span className={`text-[10px] font-black uppercase leading-none ${visual.text}`}>{resultado.situacao}</span>
                                                <span className="text-[7px] text-slate-600 font-bold mt-1 uppercase">DESDE: {resultado.dataSituacao ? new Date(resultado.dataSituacao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                            </div>

                                            <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter mb-1">Submodalidade</span>
                                                <span className="text-[10px] font-black uppercase text-white leading-none">{resultado.submodalidade}</span>
                                            </div>

                                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter mb-1">Regime Tributário</span>
                                                <span className="text-[9px] font-black uppercase text-slate-300 block leading-tight">{resultado.regimeTributario || "NÃO INFORMADO"}</span>
                                                <span className="text-[7px] text-slate-600 font-bold mt-1 uppercase">OPÇÃO: {resultado.data_opcao ? new Date(resultado.data_opcao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                            </div>

                                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter mb-1">Capital Social</span>
                                                <span className="text-[10px] font-black text-white block">
                                                    {resultado.capitalSocial}
                                                </span>
                                                <span className="text-[7px] text-slate-600 font-bold mt-1 uppercase">INÍCIO: {resultado.dataConstituicao ? new Date(resultado.dataConstituicao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                            </div>

                                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter mb-1">Localidade</span>
                                                <span className="text-[10px] font-black text-white block">
                                                    {resultado.municipio}
                                                </span>
                                                <span className="text-[7px] text-slate-600 font-bold mt-1 uppercase">UF: {resultado.uf}</span>
                                            </div>
                                        </div>

                                        {/* Footer da Consulta */}
                                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[7px] text-slate-600 font-black uppercase tracking-[0.2em]">Protocolo Sincronizado</span>
                                            <span className="text-[7px] text-slate-500 font-bold uppercase">
                                                Consulta em: {new Date(resultado.dataConsulta).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {erro && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                                        <ShieldAlert size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{erro}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Rodapé de Ações do Modal */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
                            <button
                                onClick={() => {
                                    setCnpj("");
                                    setResultado(null);
                                    setErro("");
                                    onClose();
                                }}
                                className="cursor-pointer h-12 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
                                Cancelar Operação
                            </button>

                            <button
                                onClick={() => {
                                    console.log("Salvar acionado");
                                }}
                                className={`cursor-pointer h-12 rounded-2xl ${visual.bg} ${visual.shadow} text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2`}
                            >
                                <Save size={14} />
                                Salvar Consulta
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}