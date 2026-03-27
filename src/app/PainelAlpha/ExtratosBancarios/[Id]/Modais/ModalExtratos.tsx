"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, Minus, Layers, Search, Download,
    Calendar, Database, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Transacao } from '@prisma/client';
import { toast } from 'sonner';

interface PainelProps {
    empresa: { razaoSocial: string; cnpj: string };
    linhas: any[];
    setLinhasExtraidas: React.Dispatch<React.SetStateAction<any[]>>;
    onClose: () => void;
    onExport: (dados: any[]) => void;
    bancoId: number;
    isOpen: boolean;     
    dadosContexto: any;
    onAtualizar: () => Promise<void>;
}

export default function PainelConferencia({ empresa, linhas, onClose, onExport, isOpen }: PainelProps) {
    const [filtroExportacao, setFiltroExportacao] = useState<'todos' | 'entradas' | 'saidas'>('todos');
    const [valorMinimo, setValorMinimo] = useState("");
    const [valorMaximo, setValorMaximo] = useState("");

    const [linhasExtraidas, setLinhasExtraidas] = useState<Transacao[]>([]);

    const [negativosEncontrados, setNegativosEncontrados] = useState<any[]>([]);
    const [showModalNegativos, setShowModalNegativos] = useState(false);

    const formatarMoedaInput = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        if (!apenasNumeros) return "";
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(
            parseFloat(apenasNumeros) / 100
        );
    };



    const processarExportacao = () => {
        const parse = (v: string) => v ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : null;
        const min = parse(valorMinimo) ?? -Infinity;
        const max = parse(valorMaximo) ?? Infinity;

        const filtrados = linhas.filter((t) => {
            const v = typeof t.valor === 'string' ? parseFloat(t.valor.replace(/\./g, '').replace(',', '.')) : Number(t.valor);
            let passaTipo = true;
            if (filtroExportacao === 'entradas') passaTipo = v > 0;
            if (filtroExportacao === 'saidas') passaTipo = v < 0;
            return passaTipo && Math.abs(v) >= min && Math.abs(v) <= max;
        });

        if (filtrados.length === 0) return alert("Nenhum dado encontrado.");
        onExport(filtrados);
    };



    const abrirConferenciaNegativos = () => {
        const encontrados = linhas.filter((t: any) => {
            const v = typeof t.valor === 'string'
                ? parseFloat(t.valor.replace(/\./g, '').replace(',', '.'))
                : Number(t.valor);
            return v < 0;
        });

        if (encontrados.length === 0) {
            alert("Nenhum valor negativo encontrado.");
            return;
        }

        setNegativosEncontrados(encontrados);
        setShowModalNegativos(true);
    };

    const confirmarRemocaoNegativos = () => {
        const apenasPositivos = linhas.filter((t: any) => {
            const v = typeof t.valor === 'string'
                ? parseFloat(t.valor.replace(/\./g, '').replace(',', '.'))
                : Number(t.valor);
            return v >= 0;
        });

        setLinhasExtraidas(apenasPositivos);
        setShowModalNegativos(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-7xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
            {/* HEADER ESTILIZADO */}
            <div className="p-8 border-b bg-white flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                        Conferência de Lançamentos
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {empresa.cnpj}
                        </span>
                        <p className="text-sm text-slate-500 font-bold uppercase italic">{empresa.razaoSocial}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="cursor-pointer p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-rose-500"
                >
                    <X size={28} />
                </button>
            </div>

            {/* TABELA COM ESTILO DARK/WHITE MIX */}
            <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-900 text-white">
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em] first:rounded-l-2xl">Mês Ref.</th>
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Instituição</th>
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Data</th> 
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Descrição Detalhada</th>
                            <th className="p-5 text-right text-[10px] font-black uppercase tracking-[0.2em] last:rounded-r-2xl">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.map((t, i) => (
                            <tr key={i} className="group bg-white hover:bg-indigo-50/50 transition-all shadow-sm">
                                <td className="p-5 border-y border-l border-slate-100 first:rounded-l-2xl text-slate-900 font-black italic">
                                    {t.mesReferencia}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-500 font-bold text-xs uppercase">
                                    {t.nomeBanco}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-600 font-bold text-[11px] whitespace-nowrap">
                                    {t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-800 font-medium text-[11px] uppercase leading-tight max-w-md">
                                    {t.descricao}
                                </td>
                                <td className={`p-5 border-y border-r border-slate-100 last:rounded-r-2xl text-right font-black text-sm ${t.valor < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER PREMIUM COM FILTROS */}
            <div className="p-8 border-t bg-slate-50 flex flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-8">

                    {/* Filtro Tipo */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Filtrar Movimentação</p>
                        <div className="flex bg-slate-200 p-1.5 rounded-[1.2rem] border border-slate-300 shadow-inner">
                            <button onClick={() => setFiltroExportacao('entradas')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'entradas' ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Plus size={14} strokeWidth={3} /> Entradas
                            </button>
                            <button onClick={() => setFiltroExportacao('saidas')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'saidas' ? 'bg-rose-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Minus size={14} strokeWidth={3} /> Saídas
                            </button>
                            <button onClick={() => setFiltroExportacao('todos')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'todos' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Layers size={14} strokeWidth={3} /> Tudo
                            </button>
                        </div>
                    </div>

                    {/* Filtro Valores */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Faixa de Valor (R$)</p>
                        <div className="flex items-center gap-3">
                            <input type="text" placeholder="Mínimo R$ 0,00" value={valorMinimo} onChange={(e) => setValorMinimo(formatarMoedaInput(e.target.value))} className="w-40 bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-right shadow-sm" />
                            <span className="text-slate-400 font-black text-[10px] uppercase italic">até</span>
                            <input type="text" placeholder="Máximo R$ 0,00" value={valorMaximo} onChange={(e) => setValorMaximo(formatarMoedaInput(e.target.value))} className="w-40 bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-right shadow-sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button onClick={onClose} className="cursor-pointer px-6 py-4 text-slate-400 hover:text-slate-900 font-black text-[11px] uppercase tracking-widest transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={abrirConferenciaNegativos}
                            className="group cursor-pointer flex items-center gap-3 bg-amber-50 hover:bg-amber-100 text-amber-700 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-amber-200 transition-all active:scale-95 shadow-sm"
                        >
                            <div className="relative">
                                <Search size={18} className="group-hover:scale-110 transition-transform" />
                                {linhasExtraidas.filter(t => t.valor < 0).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            Conferir {linhasExtraidas.filter(t => t.valor < 0).length} Negativos
                        </button>
                        <button
                            onClick={processarExportacao}
                            className={`cursor-pointer flex items-center gap-3 px-10 py-5 rounded-[1.5rem] font-black text-xs shadow-2xl transition-all hover:scale-105 text-white active:scale-95 ${filtroExportacao === 'entradas' ? 'bg-emerald-600 shadow-emerald-200' :
                                filtroExportacao === 'saidas' ? 'bg-rose-600 shadow-rose-200' :
                                    'bg-slate-900 shadow-slate-200'
                                }`}
                        >
                            <Download size={20} strokeWidth={2.5} />
                            EXPORTAR {filtroExportacao.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>
            {showModalNegativos && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-amber-900 uppercase tracking-tighter">
                                    Transações Negativas Detectadas
                                </h3>
                                <p className="text-sm text-amber-700 font-medium">Confira os valores antes de remover do relatório.</p>
                            </div>
                            <button onClick={() => setShowModalNegativos(false)} className="cursor-pointer text-amber-900/50 hover:text-amber-900">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-auto p-4 space-y-2">
                            {negativosEncontrados.map((n, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-amber-200 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{n.data ? new Date(n.data).toLocaleDateString('pt-BR') : '-'}</span>
                                        <span className="text-sm font-bold text-slate-700 uppercase leading-tight">{n.descricao}</span>
                                    </div>
                                    <span className="text-base font-black text-rose-600">
                                        {Number(n.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>

    );
}