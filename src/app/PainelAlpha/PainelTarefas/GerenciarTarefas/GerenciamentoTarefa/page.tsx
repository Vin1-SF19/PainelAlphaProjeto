"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, BadgeCheck, ArrowRight, Mail, Shield } from 'lucide-react';
import { BuscarTodosUsuarios } from '@/actions/RecursosHumanos';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const UsuariosRH = ["Weslei Silva - TESTE", "Vinicius Floriano"];

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u =>
            UsuariosRH.includes(u.nome) 
        );
    }, [usuarios]);


    if (loading) return (
        <div className="flex items-center justify-center p-20 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
            Sincronizando Colaboradores...
        </div>
    );

    

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Central RH <span className="text-indigo-500">Alpha</span>
                    </h1>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
                        Selecione um colaborador para gerenciar diretrizes
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuariosFiltrados.map((user) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 overflow-hidden transition-all hover:border-indigo-500/30 hover:bg-slate-900/60"
                    >
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-white/10 flex items-center justify-center overflow-hidden">
                                {user.imagemUrl ? (
                                    <img src={user.imagemUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={30} className="text-indigo-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-black text-white uppercase italic leading-none">
                                    {user.nome || "COLABORADOR"}
                                </h3>
                                <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-widest mt-2 inline-block">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3 relative z-10">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Mail size={14} />
                                <span className="text-[11px] font-bold">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-emerald-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Acesso Ativo</span>
                            </div>
                        </div>

                        <Link
                            href={`/PainelAlpha/PainelTarefas/GerenciarTarefas?id=${user.id}`}
                            className="mt-8 w-full py-4 bg-white/5 hover:bg-indigo-600 border border-white/10 rounded-[1.8rem] flex items-center justify-center gap-2 transition-all group/btn"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Gerenciar Rotina</span>
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}