"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock as ClockIcon, History as HistoryIcon, Loader2 as LoaderIcon, PlayCircle, Layers, DownloadCloud, Trash2, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTema } from "@/lib/temas";
import CardConsulta from "../cards/CardConsulta";
import TabelaConsultaAlpha from "../tabelaRADAR/Lista";
import ListaConsultasPaginada from "../consulta/ListaConsulta";
import { getConsultasHoje } from "@/actions/NovoRadar";
import FiltrosAlpha from "../Filtros/filtros";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { verificarCnpjsExistentes } from "@/actions/RadarAction";
import DropzoneRadar from "@/components/ComponentesRadar/DropzoneRadar";

export default function PainelConteudo({ tema, layout }: { tema: string; layout: "grid" | "table" }) {
    const [abaAtiva, setAbaAtiva] = useState<"hoje" | "historico" | "importar">("hoje");
    const [dadosLote, setDadosLote] = useState<any[]>([]);
    const [processandoLote, setProcessandoLote] = useState(false);
    const [sincronizando, setSincronizando] = useState(false);
    const [consultasHoje, setConsultasHoje] = useState<any[]>([]);
    const [loadingHoje, setLoadingHoje] = useState(true);
    const [progresso, setProgresso] = useState({ atual: 0, total: 0, porcentagem: 0, acao: "" });

    const [ordem, setOrdem] = useState("asc");
    const [ordemData, setOrdemData] = useState("todos");
    const [filtroSituacao, setFiltroSituacao] = useState("todos");
    const [filtroSubmodalidade, setFiltroSubmodalidade] = useState("todos");
    const abortarSincronizacao = useRef(false);

    const visual = getTema(tema);



    const carregarHoje = useCallback(async () => {
        if (abaAtiva !== "hoje") return;
        setLoadingHoje(true);
        try {
            const res = await getConsultasHoje({ ordem, ordemData, filtroSituacao, filtroSubmodalidade });
            if (res.success) setConsultasHoje(res.data);
        } finally {
            setLoadingHoje(false);
        }
    }, [abaAtiva, ordem, ordemData, filtroSituacao, filtroSubmodalidade]);

    useEffect(() => { carregarHoje(); }, [carregarHoje]);

    const handleFileLoaded = async (dadosBrutos: any[]) => {
        setProcessandoLote(true);
        const total = dadosBrutos.length;
        setProgresso({ atual: 0, total, porcentagem: 0, acao: "Mapeando Estrutura Alpha..." });

        try {
            const cnpjsPlanilha = dadosBrutos.map(d => String(d.cnpj || d.CNPJ || "").replace(/\D/g, "").padStart(14, "0"));
            const res = await verificarCnpjsExistentes(cnpjsPlanilha);
            const existentes = res.success ? (res.data ?? []) : [];

            const normalizados = dadosBrutos.map((d: any) => {
                const cnpjLimpo = String(d.cnpj || d.CNPJ || "").replace(/\D/g, "").padStart(14, "0");
                const jaExiste = existentes.find((e: any) => e.cnpj === cnpjLimpo);
                return jaExiste ? { ...jaExiste, salvo: true, origem: "BANCO" } : {
                    cnpj: cnpjLimpo,
                    razaoSocial: d.razaoSocial || d.razao_social || "AGUARDANDO CONSULTA",
                    situacao: "PENDENTE",
                    submodalidade: "---",
                    dataConsulta: new Date().toISOString(),
                    salvo: false,
                    origem: "NOVO"
                };
            });
            setDadosLote(normalizados);
            setAbaAtiva("importar");
        } finally {
            setProcessandoLote(false);
            setProgresso({ atual: 0, total: 0, porcentagem: 0, acao: "" });
        }
    };

    const iniciarSincronizacaoLote = async () => {
        const fila = dadosLote.filter(emp => !emp.salvo);
        
        if (fila.length === 0) return;
    
        setSincronizando(true);
        abortarSincronizacao.current = false;
    
        for (let i = 0; i < fila.length; i++) {
            if (abortarSincronizacao.current) break;
    
            const emp = fila[i];
    
            setProgresso({
                atual: i + 1,
                total: fila.length,
                porcentagem: Math.round(((i + 1) / fila.length) * 100),
                acao: `Consultando: ${emp.cnpj}`
            });
    
            try {
                const res = await fetch(`/api/ConsultaCompleta?cnpj=${emp.cnpj}&forcar=true`);
                
                if (res.ok) {
                    const data = await res.json();
                    setDadosLote(prev => prev.map(item => 
                        item.cnpj === emp.cnpj ? { ...data, salvo: true } : item
                    ));
                } else {
                    console.error(`Erro ${res.status} no CNPJ ${emp.cnpj}`);
                    await new Promise(r => setTimeout(r, 20000));
                }
            } catch (e) {
                console.error("Falha na conexão com a API");
            }
    
            await new Promise(r => setTimeout(r, 20000));
        }
    
        setSincronizando(false);
        setProgresso({ atual: 0, total: 0, porcentagem: 0, acao: "" });
    };

    const interromperSincronizacao = () => {
        abortarSincronizacao.current = true;
    };

    const exportarDadosParaExcel = (nomeArquivo?: string) => {
        const fonteDados = abaAtiva === "importar" ? dadosLote : consultasHoje;
        if (fonteDados.length === 0) return toast.error("Não há dados para exportar.");

        const formatarData = (v: any) => {
            if (!v || v === "N/A" || v === "---") return "---";
            const d = new Date(v);
            return isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
        };

        const dadosFormatados = fonteDados.map(emp => ({
            "Data Consulta": formatarData(emp.dataConsulta || emp.data_consulta),
            "CNPJ": emp.cnpj,
            "Contribuinte": (emp.contribuinte || "").toUpperCase(),
            "Situação": (emp.situacao || "").toUpperCase(),
            "Data Situação": formatarData(emp.dataSituacao),
            "Submodalidade": (emp.submodalidade || "").toUpperCase(),
            "Razão Social": (emp.razaoSocial || "").toUpperCase(),
            "Nome Fantasia": (emp.nomeFantasia || "").toUpperCase(),
            "Município": (emp.municipio || "").toUpperCase(),
            "UF": (emp.uf || "").toUpperCase(),
            "Data Const.": formatarData(emp.dataConstituicao || emp.data_constituicao),
            "Regime": (emp.regimeTributario || "").toUpperCase(),
            "Data Opção": formatarData(emp.data_opcao || emp.dataOpcao),
            "CAPITAL SOCIAL": emp.capitalSocial ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(emp.capitalSocial)) : "R$ 0,00",
        }));

        const ws = XLSX.utils.json_to_sheet(dadosFormatados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Radar Alpha");
        ws['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 45 }, { wch: 35 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
        const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        XLSX.writeFile(wb, nomeArquivo || `ALPHA_RADAR_${abaAtiva.toUpperCase()}_${dataHoje}.xlsx`);
        toast.success("Planilha Alpha exportada!");
    };

    const dadosExibidos = dadosLote.filter(item => {
        if (filtroSituacao !== "todos" && item.situacao !== filtroSituacao) return false;
        if (filtroSubmodalidade !== "todos" && item.submodalidade !== filtroSubmodalidade) return false;
        return true;
    });

    return (
        <div className="space-y-12 relative left-1/2 -translate-x-1/2 w-full max-w-[1600px] px-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/[0.02] p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded-[1.8rem] border border-white/5">
                    {[{ id: "hoje", label: "Hoje", icon: ClockIcon }, { id: "historico", label: "Histórico", icon: HistoryIcon }, { id: "importar", label: "Lote / Planilha", icon: Layers }].map((aba) => (
                        <button key={aba.id} onClick={() => setAbaAtiva(aba.id as any)} className={`relative px-6 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 overflow-hidden ${abaAtiva === aba.id ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
                            {abaAtiva === aba.id && <motion.div layoutId="activeTab" className={`absolute inset-0 ${visual.bg} -z-10`} />}
                            <aba.icon size={14} className={abaAtiva === aba.id ? "animate-pulse" : ""} /> {aba.label}
                        </button>
                    ))}
                </div>
                <FiltrosAlpha tema={tema} ordem={ordem} setOrdem={setOrdem} ordemData={ordemData} setOrdemData={setOrdemData} filtroSituacao={filtroSituacao} setFiltroSituacao={setFiltroSituacao} filtroSubmodalidade={filtroSubmodalidade} setFiltroSubmodalidade={setFiltroSubmodalidade} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={abaAtiva} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[500px]">
                    {abaAtiva === "hoje" && (
                        <section className="space-y-8">
                            {loadingHoje ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-4">
                                    <LoaderIcon className={`animate-spin w-12 h-12 ${visual.text}`} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Banco Alpha...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center px-6">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Monitoramento Ativo</h3>
                                        <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/5"><span className={`text-2xl font-black ${visual.text}`}>{consultasHoje.length}</span></div>
                                    </div>
                                    {layout === "grid" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{consultasHoje.map(i => <CardConsulta key={i.cnpj} {...i} tema={tema} />)}</div> : <TabelaConsultaAlpha dados={consultasHoje} tema={tema} />}
                                </>
                            )}
                        </section>
                    )}

                    {abaAtiva === "historico" && <ListaConsultasPaginada tema={tema} layout={layout} filtros={{ ordem, ordemData, filtroSituacao, filtroSubmodalidade }} />}

                    {abaAtiva === "importar" && (
                        <div className="w-full">
                            {processandoLote ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-6">
                                    <LoaderIcon className={`animate-spin w-12 h-12 ${visual.text}`} />
                                    <span className="text-sm font-black text-white uppercase tracking-tighter italic">Lendo Planilha Alpha...</span>
                                </div>
                            ) : (
                                <>
                                    {dadosLote.length === 0 ? (
                                        <DropzoneRadar onFileLoaded={handleFileLoaded} visual={visual} />
                                    ) : (
                                        <div className="space-y-8">
                                            {sincronizando && (
                                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-12">
                                                    <div className="flex items-center gap-6 shrink-0">
                                                        <div className="relative">
                                                            <LoaderIcon className={`animate-spin w-10 h-10 ${visual.text}`} />
                                                            <div className={`absolute inset-0 blur-lg ${visual.bg} opacity-20 animate-pulse`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-black text-white italic uppercase tracking-tighter">{progresso.acao}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processamento de Lote Alpha</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full space-y-3">
                                                        <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden shadow-inner">
                                                            <motion.div className={`h-full rounded-full ${visual.bg} ${visual.shadow}`} animate={{ width: `${progresso.porcentagem}%` }} transition={{ duration: 0.4 }} />
                                                        </div>
                                                        <div className="flex justify-between items-center font-black">
                                                            <span className={`text-5xl italic ${visual.text}`}>{progresso.porcentagem}%</span>
                                                            <span className="text-sm text-white tracking-[0.3em] font-mono">{progresso.atual.toString().padStart(2, '0')}/{progresso.total.toString().padStart(2, '0')}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`p-4 rounded-2xl ${visual.bg} shadow-lg shadow-white/5`}><Layers className="text-white w-6 h-6" /></div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-white uppercase italic">Fila de Sincronização</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{dadosLote.length} Empresas no Lote</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => exportarDadosParaExcel()} className="h-12 px-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"><DownloadCloud size={16} /> Exportar XLSX</button>
                                                    <button onClick={() => setDadosLote([])} className="h-12 px-6 rounded-xl border border-white/5 bg-white/5 text-slate-500 text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /> Limpar Lote</button>

                                                    <div className="flex items-center gap-3">
                                                        {sincronizando ? (
                                                            <button
                                                                onClick={interromperSincronizacao}
                                                                className="h-12 px-8 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-rose-600 transition-all"
                                                            >
                                                                <StopCircle size={16} /> Interromper Sincronização
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => setDadosLote([])} className="h-12 px-6 rounded-xl border border-white/5 bg-white/5 text-slate-500 text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">
                                                                    <Trash2 size={16} /> Limpar
                                                                </button>
                                                                <button onClick={iniciarSincronizacaoLote} className={`h-12 px-8 rounded-xl ${visual.bg} text-white text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:scale-105 transition-all`}>
                                                                    <PlayCircle size={16} /> Iniciar Sincronização
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>

                                            <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/20 shadow-2xl">
                                                <TabelaConsultaAlpha dados={dadosLote} tema={tema} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}