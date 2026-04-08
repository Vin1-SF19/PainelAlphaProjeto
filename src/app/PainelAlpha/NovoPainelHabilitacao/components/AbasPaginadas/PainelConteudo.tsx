"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock as ClockIcon, History as HistoryIcon, LayoutGrid as LayoutIcon, Loader2 as LoaderIcon } from "lucide-react";
import { getTema } from "@/lib/temas";
import CardConsulta from "../cards/CardConsulta";
import TabelaConsultaAlpha from "../tabelaRADAR/Lista";
import ListaConsultasPaginada from "../consulta/ListaConsulta";
import { getConsultasHoje } from "@/actions/NovoRadar";
import FiltrosAlpha from "../Filtros/filtros";

interface PainelConteudoProps {
    tema: string;
    layout: "grid" | "table";
}

export default function PainelConteudo({ tema, layout }: PainelConteudoProps) {
    const [abaAtiva, setAbaAtiva] = useState<"hoje" | "historico">("hoje");
    const [consultasHoje, setConsultasHoje] = useState<any[]>([]);
    const [loadingHoje, setLoadingHoje] = useState(true);

    const [ordem, setOrdem] = useState("asc");
    const [ordemData, setOrdemData] = useState("todos");
    const [filtroSituacao, setFiltroSituacao] = useState("todos");
    const [filtroSubmodalidade, setFiltroSubmodalidade] = useState("todos");

    const visual = getTema(tema);

    const filtrosAtivos = {
        ordem,
        ordemData,
        filtroSituacao,
        filtroSubmodalidade
    };

    const carregarHoje = useCallback(async () => {
        setLoadingHoje(true);
        try {
            const res = await getConsultasHoje(filtrosAtivos);
            if (res.success) setConsultasHoje(res.data);
        } finally {
            setLoadingHoje(false);
        }
    }, [ordem, ordemData, filtroSituacao, filtroSubmodalidade]);

    useEffect(() => {
        if (abaAtiva === "hoje") {
            carregarHoje();
        }
    }, [abaAtiva, carregarHoje]);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[1.5rem] w-fit">
                    <button
                        onClick={() => setAbaAtiva("hoje")}
                        className={`cursor-pointer px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${abaAtiva === "hoje" ? `${visual.bg} ${visual.shadow} text-white` : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <ClockIcon size={14} /> Hoje
                    </button>
                    <button
                        onClick={() => setAbaAtiva("historico")}
                        className={`cursor-pointer px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${abaAtiva === "historico" ? `${visual.bg} ${visual.shadow} text-white` : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <HistoryIcon size={14} /> Histórico
                    </button>
                </div>

                <FiltrosAlpha
                    tema={tema}
                    ordem={ordem} setOrdem={setOrdem}
                    ordemData={ordemData} setOrdemData={setOrdemData}
                    filtroSituacao={filtroSituacao} setFiltroSituacao={setFiltroSituacao}
                    filtroSubmodalidade={filtroSubmodalidade} setFiltroSubmodalidade={setFiltroSubmodalidade}
                />
            </div>

            <div className="min-h-[400px]">
                {abaAtiva === "hoje" ? (
                    <div className="space-y-6">
                        <header className="px-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Resultados nas últimas 24h</h3>
                                <div className={`h-1 w-8 ${visual.bg} mt-2 rounded-full opacity-50`} />
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-fit">
                                <div className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${visual.bg} opacity-75`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${visual.bg}`}></span>
                                </div>
                                <span className="text-sm font-black text-white italic">
                                    {consultasHoje.length.toString().padStart(2, '0')}{" "}
                                    <span className="text-[10px] text-slate-600 not-italic ml-1">Consultas hoje</span>
                                </span>
                            </div>
                        </header>

                        {loadingHoje ? (
                            <div className="flex justify-center py-20">
                                <LoaderIcon className={`animate-spin ${visual.text}`} />
                            </div>
                        ) : consultasHoje.length > 0 ? (
                            layout === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {consultasHoje.map((item) => (
                                        <CardConsulta key={item.cnpj} razaoSocial={item.razaoSocial} cnpj={item.cnpj} tema={tema} />
                                    ))}
                                </div>
                            ) : (
                                <TabelaConsultaAlpha dados={consultasHoje} tema={tema} />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <LayoutIcon className="text-slate-800 mb-4" size={40} />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Nenhuma consulta realizada hoje</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <ListaConsultasPaginada
                        tema={tema}
                        layout={layout}
                        filtros={filtrosAtivos}
                    />
                )}
            </div>
        </div>
    );
}

function setLoading(arg0: boolean) {
    throw new Error("Function not implemented.");
}
function setDados(data: { razaoSocial: string | null; cnpj: string; situacao: string | null; submodalidade: string | null; }[]) {
    throw new Error("Function not implemented.");
}

function setTotalPaginas(totalPages: number) {
    throw new Error("Function not implemented.");
}

function setTotalRegistros(totalRecords: number) {
    throw new Error("Function not implemented.");
}

