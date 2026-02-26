"use client";
import React from 'react';
import { X, History, User, RotateCcw, ArrowRight, ShieldAlert, Clock } from "lucide-react";
import { restaurarVersaoCliente } from '@/actions/Clientes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ModalLogAuditoria({ isOpen, onClose, cliente, aoSalvar }: {
    isOpen: boolean,
    onClose: () => void,
    cliente: any,
    aoSalvar?: () => void

}) {
    const router = useRouter();

    const calcularMudancas = (dadosAntigosJSON: string, clienteAtual: any) => {
        try {
            const antigo = JSON.parse(dadosAntigosJSON);

            const camposParaIgnorar = [
                'id', 'createdAt', 'updatedAt', 'clienteId', 'cliente_id',
                'data_alteracao', 'data_registro', 'dataContratacao',
                'data_contratacao', 'dataConstituicao', 'data_constituicao'
            ];

            return Object.keys(antigo)
                .filter(key => {
                    if (camposParaIgnorar.includes(key)) return false;

                    const vAntigo = String(antigo[key] || "").trim();
                    const vAtual = String(clienteAtual[key] || "").trim();

                    return vAntigo !== vAtual;
                })
                .map(key => ({
                    campo: key,
                    valorAntigo: antigo[key],
                    valorAtual: clienteAtual[key]
                }));
        } catch (e) {
            return [];
        }
    };


    const handleRestaurar = async (dadosAntigosJSON: string) => {
        if (!confirm("⚠️ Confirmar restauração?")) return;

        try {
            const res = await restaurarVersaoCliente(cliente.id, dadosAntigosJSON, "Sistema (Restore)");

            if (res.success) {
                toast.success("Versão restaurada!");
                onClose(); // Fecha o modal do olho
                if (aoSalvar) await aoSalvar(); // Atualiza a tabela pai
                router.refresh();
            } else {
                // MOSTRA O ERRO REAL NO TOAST
                toast.error("Erro: " + res.error);
            }
        } catch (error) {
            toast.error("Erro na comunicação com o servidor.");
        }
    };


    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">

            <div className="bg-[#0b1220] border border-white/10 w-full max-w-3xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">

                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <History className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                                Histórico de <span className="text-indigo-500">Auditoria</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                {cliente.razaoSocial}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                    >
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-6 bg-slate-950/20">
                    {cliente.logAlteracao?.length > 0 ? (
                        [...cliente.logAlteracao].reverse().map((log: any) => {
                            const mudancas = calcularMudancas(log.dadosAnteriores, cliente);

                            return (
                                <div key={log.id} className="relative group p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-indigo-500/40 transition-all duration-500">

                                    <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-indigo-500/30 group-hover:bg-indigo-500 transition-colors" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                                <Clock size={12} /> {new Date(log.dataAlteracao || log.dataRegistro).toLocaleString('pt-BR')}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase italic">
                                                <User size={14} className="text-slate-600" /> {log.colaborador}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestaurar(log.dadosAnteriores)}
                                            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/0 hover:shadow-rose-900/40"
                                        >
                                            <RotateCcw size={14} className="group-hover/btn:rotate-[-120deg] transition-transform duration-500" />
                                            Restaurar
                                        </button>
                                    </div>

                                    {/* MUDANÇAS */}
                                    {/* GRID DE MUDANÇAS - ESTILO COMPARAÇÃO LIMPA */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {mudancas.length > 0 ? mudancas.map((item, idx) => (
                                            <div key={idx} className="bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                                                {/* TÍTULO DO CAMPO */}
                                                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                                        {item.campo.replace(/([A-Z])/g, ' $1')}
                                                    </span>
                                                    <div className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
                                                </div>

                                                {/* LADO A LADO: ANTES E DEPOIS */}
                                                <div className="grid grid-cols-2 divide-x divide-white/5">
                                                    {/* VALOR ANTERIOR (ESQUERDA) */}
                                                    <div className="p-4 space-y-1 bg-rose-500/[0.02]">
                                                        <p className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest">Anterior</p>
                                                        <p className="text-xs font-medium text-rose-400/80 break-words leading-relaxed">
                                                            {String(item.valorAntigo || "—")}
                                                        </p>
                                                    </div>

                                                    {/* VALOR ATUAL (DIREITA) */}
                                                    <div className="p-4 space-y-1 bg-emerald-500/[0.02]">
                                                        <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Atual</p>
                                                        <p className="text-xs font-bold text-emerald-400 break-words leading-relaxed">
                                                            {String(item.valorAtual || "—")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex items-center gap-3 p-4 bg-slate-900/20 rounded-2xl border border-dashed border-white/10 opacity-40">
                                                <ShieldAlert size={14} />
                                                <p className="text-[10px] font-bold uppercase italic">Nenhuma divergência de valores encontrada.</p>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-full border border-white/5">
                                <History size={40} className="text-slate-800" />
                            </div>
                            <p className="text-[10px] text-slate-700 uppercase font-black tracking-[0.5em] italic">
                                Linha do tempo vazia
                            </p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-slate-900/40 border-t border-white/5 text-center">
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest flex items-center justify-center gap-2">
                        Sistema de Auditoria Alpha Comex • Imutável
                    </p>
                </div>
            </div>
        </div>
    );
}
