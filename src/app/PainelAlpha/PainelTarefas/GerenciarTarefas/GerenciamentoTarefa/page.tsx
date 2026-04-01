"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, BadgeCheck, ArrowRight, Mail, Shield, Users, Activity, Zap } from 'lucide-react';
import { BuscarTodosUsuarios } from '@/actions/RecursosHumanos';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");

    const carregarUsuarios = async () => {
        setLoading(true);
        const res = await BuscarTodosUsuarios();
        if (res.success) {
            setUsuarios(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const UsuariosRH = ["Rejane Rizzotto"];

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u =>
            UsuariosRH.includes(u.nome) &&
            (u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()))
        );
    }, [usuarios, busca]);

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] animate-pulse">
            <Zap size={16} className="mr-3 text-indigo-500" /> Sincronizando Colaboradores...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            {/* HEADER COM STATUS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                        Central RH <span className="text-indigo-500">Alpha</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1">
                        Gestão de Diretrizes e Performance
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <Link
                        href="/PainelAlpha/PainelTarefas/PainelEstoque"
                        className="flex-1 lg:flex-none min-w-[150px] bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl hover:bg-indigo-600 transition-all duration-500 group"
                    >
                        <p className="text-[8px] font-black text-indigo-400 group-hover:text-white/60 uppercase mb-1">Suprimentos</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-white group-hover:animate-bounce" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Estoque</span>
                            </div>
                            <ArrowRight size={14} className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    <div className="flex-1 lg:flex-none min-w-[150px] bg-black/40 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Total Equipe</p>
                        <div className="flex items-center gap-3">
                            <Users size={18} className="text-white" />
                            <span className="text-xl font-black text-white italic">{usuariosFiltrados.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 lg:flex-none min-w-[150px] bg-black/40 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Ativos Agora</p>
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-white" />
                            <span className="text-xl font-black text-white italic">{usuariosFiltrados.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA DE BUSCA ALPHA */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="BUSCAR COLABORADOR POR NOME OU E-MAIL..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                />
            </div>

            {/* GRID DE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuariosFiltrados.map((user) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-8 overflow-hidden transition-all hover:border-indigo-500/40"
                    >
                        {/* Efeito Glow de Fundo */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all" />

                        <div className="flex items-center gap-5 relative z-10 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-[2px]">
                                    <div className="w-full h-full rounded-[1.9rem] bg-[#0c0c0e] flex items-center justify-center overflow-hidden">
                                        {user.imagemUrl ? (
                                            <img src={user.imagemUrl} alt={user.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-indigo-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0c0c0e] border-4 border-[#0c0c0e] rounded-full flex items-center justify-center">
                                    <div className="w-full h-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                                    {user.nome || "COLABORADOR"}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Shield size={10} className="text-indigo-500" />
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                        {user.role || "Nível Alpha"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 bg-white/[0.02] border border-white/5 p-5 rounded-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail size={14} className="text-indigo-500/50" />
                                    <span className="text-[10px] font-bold tracking-tight">{user.email}</span>
                                </div>
                            </div>
                            <div className="h-[1px] w-full bg-white/5" />
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Status de Acesso</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase italic">Verificado</span>
                            </div>
                        </div>

                        <Link
                            href={`/PainelAlpha/PainelTarefas/GerenciarTarefas?id=${user.id}`}
                            className="mt-8 w-full py-5 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-[2rem] flex items-center justify-center gap-3 transition-all duration-500 group/btn"
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Gerenciar Rotina</span>
                            <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                        </Link>
                    </motion.div>
                ))}
            </div>

            {usuariosFiltrados.length === 0 && !loading && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <Users size={48} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Nenhum colaborador encontrado na rede RH</p>
                </div>
            )}
        </div>
    );
}