"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, LayoutGrid, List } from "lucide-react";
import CardConsulta from "../cards/CardConsulta";
import TabelaConsultaAlpha from "../tabelaRADAR/Lista";
import { getConsultasPaginadas } from "@/actions/NovoRadar";
import { getTema } from "@/lib/temas";

interface ListaProps {
    tema: string;
    layout: "grid" | "table";
    filtros: {
        ordem: string;
        ordemData: string;
        filtroSituacao: string;
        filtroSubmodalidade: string;
    };
}

export default function ListaConsultasPaginada({ tema, filtros, layout }: ListaProps) {
    const [pagina, setPagina] = useState(1);
    const [dados, setDados] = useState<any[]>([]);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [total, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);

    const visual = getTema(tema);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getConsultasPaginadas(pagina, 20, filtros);
            if (res.success) {
                setDados(res.data);
                setTotalPaginas(res.totalPages);
                setTotalRegistros(res.totalRecords);
            }
        } finally {
            setLoading(false);
        }
    }, [pagina, filtros]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    useEffect(() => {
        setPagina(1);
    }, [filtros]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 ${visual.bg} rounded-full opacity-50`} />
                    <div className="flex flex-col">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">
                            Explorador de Dados
                        </h2>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Base Geral: <span className="text-slate-300 font-mono">{total.toLocaleString()}</span> registros
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                    <Loader2 className={`w-10 h-10 animate-spin ${visual.text} mb-4`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Sincronizando Base RADAR...</span>
                </div>
            ) : (
                <>
                    <div className="min-h-[400px]">
                        {layout === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {dados.map((item) => (
                                    <CardConsulta
                                        key={item.cnpj}
                                        razaoSocial={item.razaoSocial}
                                        cnpj={item.cnpj}
                                        tema={tema}
                                    />
                                ))}
                            </div>
                        ) : (
                            <TabelaConsultaAlpha dados={dados} tema={tema} />
                        )}

                        {dados.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <LayoutGrid className="text-slate-800 mb-4" size={40} />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Nenhum registro encontrado nos filtros atuais</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-10 pb-4">
                        <button
                            disabled={pagina === 1 || loading}
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-10 transition-all active:scale-90"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <div className="flex flex-col items-center min-w-[120px]">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Navigation</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black ${visual.text} italic leading-none`}>
                                    {String(pagina).padStart(2, '0')}
                                </span>
                                <span className="text-slate-700 font-black text-sm">/</span>
                                <span className="text-slate-500 font-black text-sm tracking-tighter">
                                    {String(totalPaginas).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        <button
                            disabled={pagina >= totalPaginas || loading}
                            onClick={() => setPagina(p => p + 1)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-10 transition-all active:scale-90"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}