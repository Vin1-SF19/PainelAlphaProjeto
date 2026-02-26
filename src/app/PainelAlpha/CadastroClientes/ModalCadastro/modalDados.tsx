"use client";

import React, { useEffect, useState } from 'react';
import { X, Plus, ThumbsUp, ThumbsDown, Minus, Calendar, User, MessageSquare, Save, Star, Search, CheckCircle2, TrendingUp } from "lucide-react";
import { salvarAlteracoesGestao, salvarLogCS, salvarLogFeedback } from '@/actions/Clientes';
import { toast } from 'sonner';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function ModalGestaoCliente({ isOpen, onClose, cliente, aoSalvar }: { isOpen: boolean, onClose: () => void, cliente: any; aoSalvar?: () => void; }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [showNovoCS, setShowNovoCS] = useState(false);
    const [status, setStatus] = useState(cliente?.status || "Em Andamento");
    const [feedbackCS, setFeedbackCS] = useState<"pos" | "neg" | "na" | null>(null);
    const [sentimentoFeedback, setSentimentoFeedback] = useState<"pos" | "neg" | "na" | null>(null);
    const [obsCS, setObsCS] = useState("");
    const [enviandoCS, setEnviandoCS] = useState(false);

    const [nps, setNps] = useState(cliente?.nps || 0);
    const [feedbackSim, setFeedbackSim] = useState(cliente?.feedbackGoogle ?? false);
    const [nomeFeedback, setNomeFeedback] = useState("");
    const [showNovoFeedback, setShowNovoFeedback] = useState(false);

    const [listaLogsFeedback, setListaLogsFeedback] = useState<any[]>(cliente?.logFeedback ?? []);


    const [listaLogsCS, setListaLogsCS] = useState(cliente?.log_cs || []);

    const [obsFeedback, setObsFeedback] = useState("");

    const isTextoValido = (texto: string) => texto.length >= 10 && texto.length <= 140;



    const handleSalvarCS = async () => {
        if (!feedbackCS || obsCS.length < 10) return toast.error("Dados inválidos");

        setEnviandoCS(true);

        const novoLog = {
            colaborador: session?.user?.nome || "Analista",
            sentimento: feedbackCS,
            observacao: obsCS,
            data_registro: new Date().toISOString()
        };

        const res = await salvarLogCS(cliente.id, novoLog);

        if (res.success) {
            toast.success("CS registrado!");

            setListaLogsCS((prev: any[]) => [novoLog, ...prev]);

            setShowNovoCS(false);
            setObsCS("");
            setFeedbackCS(null);

            if (aoSalvar) aoSalvar();
        }
        setEnviandoCS(false);
    };



    useEffect(() => {
        setFeedbackSim(cliente?.feedbackGoogle ?? false);
        setNomeFeedback(cliente?.nomeGoogle ?? "");
        setListaLogsFeedback(cliente?.logFeedback ?? []);
    }, [cliente]);

    useEffect(() => {
        if (cliente) {
            setStatus(cliente.status || "Em Andamento");
            setNps(cliente.nps || 0);
            setFeedbackSim(cliente.feedbackGoogle || false);
            setNomeFeedback(cliente.nomeGoogle || "");
        }
    }, [cliente, isOpen]); 


    const getStatusColor = (s: string) => {
        switch (s) {
            case "Deferido": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Em Andamento": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Stand By": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Cancelado": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-slate-800 text-slate-400";
        }
    };

    const handleSalvarFeedback = async () => {
        if (!sentimentoFeedback || obsFeedback.length < 10) return;

        const novoLog = {
            colaborador: session?.user?.nome || "Analista",
            sentimento: sentimentoFeedback,
            observacao: obsFeedback,
            data_registro: new Date().toISOString()
        };

        const res = await salvarLogFeedback(cliente.id, novoLog);

        if (res.success) {
            toast.success("Pedido registrado!");
            setListaLogsFeedback((prev: any[]) => [novoLog, ...prev]);
            setShowNovoFeedback(false);
            setObsFeedback("");
            setSentimentoFeedback(null);
            if (aoSalvar) aoSalvar();
        }
    };


    const handleSalvarGeral = async () => {
        const res = await salvarAlteracoesGestao(
            cliente.id,
            {
                status,
                nps,
                feedbackGoogle: feedbackSim,
                nomeGoogle: nomeFeedback
            },
            session?.user?.nome || "Analista"
        );

        if (res.success) {
            toast.success("Alterações salvas e log registrado!");
            if (aoSalvar) await aoSalvar();
            onClose();
        }
    };


    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#0b1220] border border-white/10 w-full max-w-6xl rounded-[2.5rem] shadow-2xl relative custom-scrollbar max-h-[95vh] overflow-y-auto">

                {/* HEADER */}
                <div className="sticky top-0 bg-[#0b1220]/95 backdrop-blur-md p-8 border-b border-white/5 flex justify-between items-center z-20 rounded-t-[2.5rem]">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                            DADOS DO <span className="text-indigo-500">CLIENTE</span>
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Gestão de Operação e CS</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                <div className="p-8 space-y-10">

                    {/* SEÇÃO 1: IGUAL AO CADASTRO (BLOQUEADO) */}
                    <section className="grid grid-cols-1 md:grid-cols-12 gap-5 opacity-80">
                        <div className="md:col-span-4 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">CNPJ</label>
                            <input disabled value={cliente.cnpj} className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400" />
                        </div>
                        <div className="md:col-span-8 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Razão Social</label>
                            <input disabled value={cliente.razaoSocial} className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400" />
                        </div>
                        <div className="md:col-span-6 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Nome Fantasia</label>
                            <input disabled value={cliente.nomeFantasia || "---"} className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400" />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Data Constituição</label>
                            <input disabled value={cliente.dataConstituicao || "---"} className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400" />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Regime / UF</label>
                            <input disabled value={`${cliente.regimeTributario} - ${cliente.uf}`} className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400" />
                        </div>
                    </section>

                    {/* SEÇÃO 2: STATUS E DATAS (MODIFICÁVEL) */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-400 ml-1">Status Atual</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Deferido">Deferido</option>
                                <option value="Stand By">Stand By</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Contratação</label>
                            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white">
                                {new Date(cliente.dataContratacao).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data de Êxito</label>
                            <div className={`p-3 rounded-xl border text-sm font-bold ${status === "Deferido" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" : "bg-slate-950 border-slate-800 text-slate-700"}`}>
                                {status === "Deferido" ? new Date().toLocaleDateString('pt-BR') : "Aguardando Deferimento"}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Analista Responsável</label>
                            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-indigo-400 font-bold uppercase tracking-tighter">
                                {cliente.analistaResponsavel}
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 3: SÓCIOS (O que o banco vai carregar) */}
                    <section className="space-y-4 pt-6 border-t border-white/5">
                        <div

                            className="flex items-center gap-2">
                            <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                            <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">
                                Quadro de Sócios / Responsáveis
                            </h3>
                        </div>

                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                        <th className="px-6 py-4 border-b border-white/5">Nome do Socio</th>
                                        <th className="px-6 py-4 border-b border-white/5">Telefone / WhatsApp</th>
                                        <th className="px-6 py-4 border-b border-white/5">Observações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {cliente.socios && cliente.socios.length > 0 ? (
                                        cliente.socios.map((s: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-white uppercase tracking-tight">
                                                        {s.nome}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-indigo-400">
                                                        {s.telefone || "(00) 00000-0000"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-400 italic">
                                                        {s.obs || "Nenhuma observação registrada"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-700 text-xs font-bold uppercase tracking-widest italic">
                                                Nenhum sócio vinculado a este CNPJ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SEÇÃO CUSTOMER SUCCESS */}
                    <section className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare size={16} className="text-emerald-500" /> Customer Success (CS)
                            </h3>
                            <button
                                onClick={() => setShowNovoCS(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                            >
                                <Plus size={14} /> Novo CS
                            </button>
                        </div>

                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Colaborador</th>
                                        <th className="px-6 py-4 text-center">Sentimento</th>
                                        <th className="px-6 py-4">Observação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {listaLogsCS && listaLogsCS.length > 0 ? (
                                        listaLogsCS.map((log: any, i: number) => (
                                            <tr key={log.id || i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-[10px] font-mono text-slate-500">
                                                    {new Date(log.data_registro || log.dataRegistro).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-tighter">
                                                    {log.colaborador}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {log.sentimento === "pos" && <ThumbsUp size={16} className="text-emerald-500 mx-auto" />}
                                                    {log.sentimento === "neg" && <ThumbsDown size={16} className="text-rose-500 mx-auto" />}
                                                    {log.sentimento === "na" && <Minus size={16} className="text-slate-500 mx-auto" />}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[11px] text-slate-400 italic max-w-xs truncate" title={log.observacao}>
                                                        {log.observacao || "---"}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="text-slate-700 italic text-[11px]">
                                            <td colSpan={4} className="p-10 text-center uppercase font-black tracking-[0.3em] opacity-20">
                                                Nenhum registro de CS
                                            </td>
                                        </tr>
                                    )}
                                </tbody>



                            </table>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg"><Star className="text-amber-500 w-5 h-5" /></div>
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Nota - NPS</h3>
                        </div>
                        <div className="md:col-span-1">
                            <select
                                value={nps}
                                onChange={(e) => setNps(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-amber-500 font-black outline-none focus:border-amber-500"
                            >
                                {[...Array(11)].map((_, i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 text-[10px] text-slate-600 uppercase font-bold italic">
                            * 0-6 Detratores | 7-8 Neutros | 9-10 Promotores
                        </div>
                    </section>

                    {/* SEÇÃO 6: FEEDBACK GOOGLE */}
                    <section className="space-y-6 pt-8 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><Search className="text-blue-500 w-5 h-5" /></div>
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Feedback Google</h3>
                            </div>
                            <button
                                onClick={() => setShowNovoFeedback(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Plus size={14} /> + Pedido
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-950/30 p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-slate-500">Fez Feedback?</span>
                                <button
                                    onClick={() => {
                                        setFeedbackSim(!feedbackSim);
                                        if (feedbackSim) setNomeFeedback("");
                                    }}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${feedbackSim ? 'bg-emerald-500' : 'bg-red-500'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${feedbackSim ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className={`text-[10px] font-black uppercase ${feedbackSim ? 'text-emerald-500' : 'text-slate-600'}`}>
                                    {feedbackSim ? 'Sim' : 'Não'}
                                </span>
                            </div>

                            <div className="flex-1 w-full space-y-1">
                                <label className={`text-[9px] font-black uppercase ml-1 transition-colors ${feedbackSim ? 'text-slate-500' : 'text-slate-800'}`}>Nome de quem comentou</label>
                                <input
                                    type="text"
                                    disabled={!feedbackSim}
                                    value={nomeFeedback}
                                    onChange={(e) => setNomeFeedback(e.target.value)}
                                    placeholder={feedbackSim ? "Digite o nome..." : "Bloqueado - Marque 'Sim' primeiro"}
                                    className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-sm transition-all outline-none ${feedbackSim ? 'border-slate-800 text-white focus:border-blue-500' : 'border-transparent text-slate-800 cursor-not-allowed'}`}
                                />
                            </div>
                        </div>

                        {/* TABELA DE PEDIDOS DE FEEDBACK */}
                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Colaborador</th>
                                        <th className="px-6 py-4 text-center">Sentimento</th>
                                        <th className="px-6 py-4">Observação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {listaLogsFeedback && listaLogsFeedback.length > 0 ? (
                                        listaLogsFeedback.map((log:

                                            any, i: number) => (
                                            <tr key={log.id || i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-[10px] font-mono text-slate-500">
                                                    {new Date(log.data_registro || log.dataRegistro).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-tighter">
                                                    {log.colaborador}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {log.sentimento === "pos" && <ThumbsUp size={14} className="text-blue-500 mx-auto" />}
                                                    {log.sentimento === "neg" && <ThumbsDown size={14} className="text-rose-500 mx-auto" />}
                                                    {log.sentimento === "na" && <Minus size={14} className="text-slate-500 mx-auto" />}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[11px] text-slate-400 italic max-w-xs truncate" title={log.observacao}>
                                                        {log.observacao || "---"}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-10 text-center opacity-20 uppercase font-black tracking-[0.3em] text-[10px]">
                                                Nenhum pedido de feedback registrado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </section>
                </div>

                {/* BOTÃO SALVAR GERAL */}
                <div className="p-8 border-t border-white/5 flex justify-end">
                    <button
                        onClick={handleSalvarGeral}
                        className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>

                {/* MODAL PEQUENO: NOVO CS */}
                {showNovoCS && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-3xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black text-white uppercase">Novo <span className="text-emerald-500">CS</span></h4>
                                <button onClick={() => setShowNovoCS(false)}><X size={20} className="text-slate-500" /></button>
                            </div>

                            <div className="space-y-6">

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                            <MessageSquare size={12} className="text-emerald-500" /> Relato do Atendimento
                                        </label>
                                        <span className={

                                            `text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${obsCS.length >= 10 && obsCS.length <= 140 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {obsCS.length}/140
                                        </span>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            value={obsCS}
                                            onChange={(e) => setObsCS(e.target.value)}
                                            className={`w-full bg-slate-950/80 border-2 rounded-2xl p-4 text-sm text-white min-h-[130px] outline-none transition-all duration-300 resize-none shadow-inner
                                            ${obsCS.length > 0 && (obsCS.length < 10 || obsCS.length > 140)
                                                    ? 'border-rose-500/30 focus:border-rose-500 focus:shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                                                    : 'border-slate-800 focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}
                                            placeholder="O que o cliente relatou neste contato?..."
                                        />
                                        <div className={`absolute bottom-3 right-3 transition-opacity ${obsCS.length >= 10 && obsCS.length <= 140 ? 'opacity-100' : 'opacity-0'}`}>
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 block text-center">Resultado do Feedback</label>
                                    <div className="flex justify-between items-center gap-4">
                                        {/* POSITIVO */}
                                        <button
                                            onClick={() => setFeedbackCS("pos")}
                                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${feedbackCS === "pos" ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-slate-950 border-white/5 text-slate-600 hover:text-white"}`}
                                        >
                                            <ThumbsUp size={24} /> <span className="text-[9px] font-black uppercase">Positivo</span>
                                        </button>

                                        {/* NEGATIVO */}
                                        <button
                                            onClick={() => setFeedbackCS("neg")}
                                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${feedbackCS === "neg" ? "bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "bg-slate-950 border-white/5 text-slate-600 hover:text-white"}`}
                                        >
                                            <ThumbsDown size={24} /> <span className="text-[9px] font-black uppercase">Negativo</span>
                                        </button>

                                        {/* N/A - SEM RESPOSTA */}
                                        <button
                                            onClick={() => setFeedbackCS("na")}
                                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${feedbackCS === "na" ? "bg-slate-700 border-white/30 text-white" : "bg-slate-950 border-white/5 text-slate-600 hover:text-white"}`}
                                        >
                                            <Minus size={24} /> <span className="text-[9px] font-black uppercase">N/A (Sem Resposta)</span>
                                        </button>
                                    </div>

                                </div>

                                <div className="flex gap-3 pt-4">
                                    {/* BOTÃO CANCELAR */}
                                    <button
                                        onClick={() => {
                                            setShowNovoCS(false);
                                            setObsCS("");
                                            setFeedbackCS(

                                                null);
                                        }}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Cancelar
                                    </button>

                                    {/* BOTÃO SALVAR CS */}
                                    <button

                                        onClick={handleSalvarCS}
                                        disabled={!isTextoValido(obsCS) || !feedbackCS}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {enviandoCS ? "Salvando..." : "Salvar CS"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* MODAL PEQUENO: NOVO PEDIDO DE FEEDBACK */}
            {showNovoFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-blue-500/20 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-400 w-5 h-5" /></div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Solicitar <span className="text-blue-500">Google</span></h4>
                            </div>
                            <button onClick={() => { setShowNovoFeedback(false); setObsFeedback(""); setSentimentoFeedback(null); }} className="text-slate-500 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* BOTÕES DE SENTIMENTO (IGUAL AO CS) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 block text-center tracking-widest">Sentimento do Cliente</label>
                                <div className="flex justify-between gap-3">
                                    {[
                                        { id: 'pos', icon: ThumbsUp, label: 'Positivo', color: 'blue' },
                                        { id: 'neg', icon: ThumbsDown, label: 'Negativo', color: 'rose' },
                                        { id: 'na', icon: Minus, label: 'N/A', color: 'slate' }
                                    ].map((btn) => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setSentimentoFeedback(btn.id as any)}
                                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 
                                                ${sentimentoFeedback === btn.id
                                                    ? `bg-${btn.color}-500/10 border-${btn.color}-500 text-${btn.color}-400 shadow-lg`
                                                    : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/10'}`}
                                        >
                                            <btn.icon size={20} />
                                            <span className="text-[9px] font-black uppercase">{btn.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* INPUT DE TEXTO */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Observação</label>
                                    <span className={`text-[10px] font-mono font-bold ${obsFeedback.length >= 10 && obsFeedback.length <= 140 ? 'text-blue-400' : 'text-rose-500'}`}>
                                        {obsFeedback.length}/140
                                    </span>
                                </div>
                                <textarea
                                    value={obsFeedback}
                                    onChange={(e) => setObsFeedback(e.target.value)}
                                    className={`w-full bg-slate-950 border-2 rounded-2xl p-4 text-sm text-white min-h-[100px] outline-none transition-all
              ${obsFeedback.length > 0 && !isTextoValido(obsFeedback) ? 'border-rose-500/30' : 'border-slate-800 focus:border-blue-500'}`}
                                    placeholder="Por que está solicitando este feedback?..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowNovoFeedback(false)} className="flex-1 py-4 bg-slate-900 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Cancelar</button>
                                <button
                                    onClick={handleSalvarFeedback}
                                    disabled={!isTextoValido(obsFeedback) || !sentimentoFeedback}
                                    className="flex-1 py-4 bg-blue-600 disabled:bg-slate-800/50 disabled:text-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                                >
                                    Confirmar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
