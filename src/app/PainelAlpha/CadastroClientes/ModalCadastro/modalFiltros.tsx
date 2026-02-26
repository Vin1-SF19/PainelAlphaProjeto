"use client";
import React from 'react';
import { X, SortAsc, SortDesc, Calendar, User, ShieldCheck } from "lucide-react";

export default function ModalFiltros({ isOpen, onClose, ordenacao, setOrdenacao }: any) {
    if (!isOpen) return null;

    const opcoes = [
        { label: "Razão Social", campo: "razaoSocial", icon: SortAsc },
        { label: "Nome Fantasia", campo: "nomeFantasia", icon: SortAsc },
        { label: "Data Contratação", campo: "dataContratacao", icon: Calendar },
        { label: "Data Êxito", campo: "dataExito", icon: Calendar },
        { label: "Status", campo: "status", icon: ShieldCheck },
        { label: "Analista", campo: "analistaResponsavel", icon: User },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0b1220] border border-white/10 w-full max-w-md rounded-[2rem] shadow-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Filtros Avançados</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    {opcoes.map((item) => (
                        <div key={item.campo} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 text-slate-300">
                                <item.icon size={16} className="text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setOrdenacao({ campo: item.campo, direcao: 'asc' })}
                                    className={`p-2 rounded-lg transition-all ${ordenacao.campo === item.campo && ordenacao.direcao === 'asc' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {item.campo.includes('data') ? 'Antigos' : 'A-Z'}
                                </button>
                                <button 
                                    onClick={() => setOrdenacao({ campo: item.campo, direcao: 'desc' })}
                                    className={`p-2 rounded-lg transition-all ${ordenacao.campo === item.campo && ordenacao.direcao === 'desc' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {item.campo.includes('data') ? 'Recentes' : 'Z-A'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/20">
                    <button onClick={onClose} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95">
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
