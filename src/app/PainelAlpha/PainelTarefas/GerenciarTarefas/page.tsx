"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { CriarTarefa, BuscarTarefasPorUsuario, DeletarTarefa } from '@/actions/Tarefas';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { CheckCircle, Clock, Info, Plus, Search, Trash2, UserCheck } from 'lucide-react';

export default function AdminTarefas() {
    const searchParams = useSearchParams();
    const userIdUrl = searchParams.get('id');
    const { data: session } = useSession();

    // Estados
    const [tarefas, setTarefas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [novaTarefa, setNovaTarefa] = useState({
        texto: "",
        descricao: "",
        fixa: false,
        diasSemana: [] as number[]
    });

    const [diaFiltro, setDiaFiltro] = useState(new Date().getDay() - 1 || 0);

    const DIAS_NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];




    const carregarDados = async () => {
        if (!userIdUrl) return;
        setLoading(true);
        try {
            const idNumerico = parseInt(userIdUrl, 10);
            const data = await BuscarTarefasPorUsuario(idNumerico);
            setTarefas(data || []);
        } catch (error) {
            console.error("Erro ao carregar:", error);
            toast.error("Erro ao sincronizar com o banco.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarDados(); }, [userIdUrl]);

    // Lógica de Filtro
    const tarefasFiltradas = useMemo(() => {
        return tarefas.filter(t => {
            const matchesBusca = t.texto.toLowerCase().includes(busca.toLowerCase());

            const matchesStatus =
                filtroStatus === 'todas' ? true :
                    filtroStatus === 'pendentes' ? !t.feita :
                        filtroStatus === 'concluidas' ? t.feita : true;
            const matchesDia = t.diaSemana === diaFiltro;

            return matchesBusca && matchesStatus && matchesDia;
        });
    }, [tarefas, busca, filtroStatus, diaFiltro]);

    const stats = {
        total: tarefas.length,
        concluidas: tarefas.filter(t => t.feita).length,
        progresso: tarefas.length > 0 ? Math.round((tarefas.filter(t => t.feita).length / tarefas.length) * 100) : 0
    };

    // Ações
    const handleCriar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdUrl || novaTarefa.diasSemana.length === 0) {
            toast.error("Selecione pelo menos um dia!");
            return;
        }

        try {
            const promessas = novaTarefa.diasSemana.map(dia =>
                CriarTarefa({
                    texto: novaTarefa.texto,
                    descricao: novaTarefa.descricao,
                    fixa: novaTarefa.fixa,
                    diaSemana: dia,
                    userId: String(userIdUrl)
                })
            );

            await Promise.all(promessas);

            toast.success("Diretrizes lançadas com sucesso!");
            setShowModalAdd(false);
            setNovaTarefa({ texto: "", descricao: "", fixa: false, diasSemana: [] });
            carregarDados();
        } catch (error) {
            toast.error("Erro ao salvar uma ou mais diretrizes.");
        }
    };


    const handleDeletar = async (id: string) => {
        if (!confirm("Remover esta diretriz?")) return;
        const res = await DeletarTarefa(id);
        if (res.success) {
            toast.success("Removida com sucesso");
            carregarDados();
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <UserCheck className="text-indigo-500" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                            Gestão de <span className="text-indigo-500">Diretrizes</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                            Colaborador ID: <span className="text-indigo-400">{userIdUrl}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModalAdd(true)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={18} /> Lançar Nova Ordem
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total de Ordens" valor={stats.total} icon={<Clock size={20} />} color="indigo" />
                <StatCard label="Concluídas" valor={stats.concluidas} icon={<CheckCircle size={20} />} color="emerald" />
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Eficiência Geral</p>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white italic">{stats.progresso}%</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progresso}%` }} className="h-full bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-black/20 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                        type="text"
                        placeholder="PESQUISAR DIRETRIZ OU DESCRIÇÃO..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-14 text-[11px] font-bold text-white uppercase outline-none focus:border-indigo-500/30 transition-all"
                    />
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
                    {['todas', 'pendentes', 'concluidas', 'fixas'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltroStatus(f)}
                            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filtroStatus === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {DIAS_NOMES.map((nome, i) => (
                    <button
                        key={i}
                        onClick={() => setDiaFiltro(i)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${diaFiltro === i
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/5 text-slate-500 hover:bg-white/10'
                            }`}
                    >
                        {nome}
                    </button>
                ))}
            </div>

            {/* Tabela de Tarefas */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando...</div>
                ) : tarefasFiltradas.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Descrição da Atividade</th>
                                <th className="px-8 py-6 text-center">Tipo</th>
                                <th className="px-8 py-6 text-right">Gestão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {tarefasFiltradas.map((t) => (
                                <React.Fragment key={t.id}>
                                    <tr
                                        className="group hover:bg-white/[0.02] transition-all cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                    >
                                        <td className="px-8 py-5">
                                            {t.feita ? (
                                                <span className="text-emerald-500 text-[9px] font-black uppercase flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Concluída
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 text-[9px] font-black uppercase flex items-center gap-2">
                                                    <Clock size={12} className="animate-pulse" /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white uppercase italic flex items-center gap-2">
                                                    {t.texto} {t.descricao && <Info size={12} className="text-indigo-400 opacity-50" />}
                                                </span>
                                                {t.descricao && (
                                                    <span className="text-[9px] text-slate-500 uppercase font-black truncate max-w-xs opacity-50">
                                                        {t.descricao}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {t.fixa ? (
                                                <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-amber-500/20">Rotina</span>
                                            ) : (
                                                <span className="text-slate-600 text-[8px] font-black uppercase italic">Demanda Única</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeletar(t.id); }}
                                                className="cursor-pointer text-slate-600 hover:text-rose-500 p-2 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Detalhe Expandido */}
                                    {expandedId === t.id && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-6 bg-indigo-600/5 border-l-2 border-indigo-500">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Instruções Detalhadas:</p>
                                                <p className="text-slate-300 text-xs font-medium leading-relaxed">
                                                    {t.descricao || "Nenhuma instrução adicional fornecida para esta atividade."}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-20 text-center text-slate-700 font-black uppercase text-[10px] italic tracking-widest">
                        Sem dados para o filtro selecionado.
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModalAdd && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalAdd(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.form
                            onSubmit={handleCriar}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-[2rem] space-y-4"
                        >
                            <h2 className="text-xl font-black text-white uppercase italic">Nova Diretriz</h2>
                            <input
                                required placeholder="TÍTULO DA ATIVIDADE"
                                value={novaTarefa.texto}
                                onChange={e => setNovaTarefa({ ...novaTarefa, texto: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-xs outline-none"
                            />
                            <textarea
                                placeholder="DESCRIÇÃO / PASSO A PASSO"
                                value={novaTarefa.descricao}
                                onChange={e => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-xs h-32 outline-none"
                            />
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setNovaTarefa({ ...novaTarefa, fixa: !novaTarefa.fixa, diasSemana: [] })}
                                    className={`w-full p-4 rounded-xl text-[10px] font-black uppercase border transition-all ${novaTarefa.fixa ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                >
                                    {novaTarefa.fixa ? "Atividade de Rotina (Fixa)" : "Demanda Única (Eventual)"}
                                </button>

                                <div className="grid grid-cols-7 gap-1">
                                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((dia, index) => {
                                        const selecionado = novaTarefa.diasSemana.includes(index);
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => {
                                                    if (novaTarefa.fixa) {
                                                        setNovaTarefa({
                                                            ...novaTarefa,
                                                            diasSemana: selecionado
                                                                ? novaTarefa.diasSemana.filter(d => d !== index)
                                                                : [...novaTarefa.diasSemana, index]
                                                        });
                                                    } else {
                                                        setNovaTarefa({ ...novaTarefa, diasSemana: [index] });
                                                    }
                                                }}
                                                className={`h-10 rounded-lg text-[10px] font-black transition-all border ${selecionado
                                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                                                    }`}
                                            >
                                                {dia}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">
                                    {novaTarefa.fixa ? "Selecione os dias da recorrência" : "Selecione o dia da execução"}
                                </p>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 p-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Lançar Ordem</button>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, valor, icon, color }: any) {
    const colors: any = {
        indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
        emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    };
    return (
        <div className={`p-6 rounded-[2rem] border ${colors[color]} flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <span className="text-4xl font-black italic text-white">{valor}</span>
            </div>
            <div className="opacity-30">{icon}</div>
        </div>
    );
}