"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Trash2, Check, X, 
    Square, CheckSquare, ListX 
} from 'lucide-react';
import { toast } from 'sonner';
import { BuscarTransacoesPorBanco, DeletarTransacoesLote } from '@/actions/transacao';

export default function PainelTransacoes({ bancoId }: { bancoId: number }) {
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

    const carregarDados = async () => {
        setLoading(true);
        const res = await BuscarTransacoesPorBanco(bancoId);
        if (res.success) setTransacoes(res.data);
        setLoading(false);
        setSelecionados(new Set());
    };

    useEffect(() => { carregarDados(); }, [bancoId]);

    // Filtro Inteligente (Descrição + Valor)
    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(t => {
            const termo = filtro.toLowerCase();
            const descMatch = t.descricao?.toLowerCase().includes(termo);
            const valorMatch = t.valor?.toString().includes(termo) || 
                               t.valor?.toLocaleString('pt-BR').includes(termo);
            return descMatch || valorMatch;
        });
    }, [transacoes, filtro]);

    // Lógica de Seleção
    const toggleSelecionar = (id: string) => {
        const novos = new Set(selecionados);
        if (novos.has(id)) novos.delete(id);
        else novos.add(id);
        setSelecionados(novos);
    };

    const toggleTodos = () => {
        if (selecionados.size === transacoesFiltradas.length) {
            setSelecionados(new Set());
        } else {
            setSelecionados(new Set(transacoesFiltradas.map(t => t.id)));
        }
    };

    const handleDeletarLote = async () => {
        const ids = Array.from(selecionados);
        if (ids.length === 0) return;
        if (!confirm(`Deseja excluir ${ids.length} lançamentos selecionados?`)) return;

        const res = await DeletarTransacoesLote(ids);
        if (res.success) {
            setTransacoes(prev => prev.filter(t => !ids.includes(t.id)));
            setSelecionados(new Set());
            toast.success(`${ids.length} itens removidos.`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
            Carregando base de dados...
        </div>
    );

    return (
        <div className="w-full space-y-6">
            {/* Toolbar Superior */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-[2rem] border border-white/10">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="BUSCAR POR DESCRIÇÃO OU VALOR..." 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-bold text-white uppercase outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>
                <button onClick={toggleTodos} className="px-4 py-3 bg-white/5 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                    {selecionados.size === transacoesFiltradas.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                    {selecionados.size === transacoesFiltradas.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </button>
            </div>

            <div className="bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <th className="px-6 py-5 text-left w-10">Sel.</th>
                            <th className="px-6 py-5 text-left">Data</th>
                            <th className="px-6 py-5 text-left">Descrição</th>
                            <th className="px-6 py-5 text-right">Valor (R$)</th>
                            <th className="px-6 py-5 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {transacoesFiltradas.map((t) => (
                            <tr key={t.id} className={`group transition-colors ${selecionados.has(t.id) ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleSelecionar(t.id)} className="text-slate-600 hover:text-indigo-400 transition-colors">
                                        {selecionados.has(t.id) ? <CheckSquare size={18} className="text-indigo-500"/> : <Square size={18}/>}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-400">{t.data}</td>
                                <td className="px-6 py-4">
                                    <div className="text-[13px] font-black text-white uppercase italic tracking-tight">{t.descricao}</div>
                                    <div className="text-[9px] text-slate-600 font-bold uppercase">Ref: {t.mesReferencia}</div>
                                </td>
                                <td className={`px-6 py-4 text-right text-[15px] font-black ${t.valor < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {t.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => { if(confirm("Excluir?")) DeletarTransacoesLote([t.id]).then(carregarDados) }} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer de Ações em Lote */}
            {selecionados.size > 0 && (
                <div className="sticky bottom-0 bg-indigo-600 p-4 rounded-2xl flex justify-between items-center shadow-2xl animate-in slide-in-from-bottom-4">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">
                        {selecionados.size} Itens Selecionados
                    </span>
                    <button 
                        onClick={handleDeletarLote}
                        className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-rose-100 hover:text-rose-600 transition-all"
                    >
                        <ListX size={16} />
                        Apagar Selecionados
                    </button>
                </div>
            )}
        </div>
    );
}