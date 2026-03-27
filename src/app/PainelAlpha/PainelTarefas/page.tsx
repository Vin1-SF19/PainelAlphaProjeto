"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, CheckCircle2,
    Circle, Star, Clock, Calendar as CalendarIcon, Filter, CheckCircle, CircleDashed,
    Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BotaoVoltar } from '@/components/BotaoVoltar';
import { BuscarTarefasPorUsuario, AlternarStatusTarefa } from '@/actions/Tarefas'; 
import { toast } from 'sonner';

export default function PainelTarefas() {
    const { data: session } = useSession();

    // Estados
    const [agora, setAgora] = useState(new Date());
    const [diaAtivo, setDiaAtivo] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [tarefas, setTarefas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');
    
    const DIAS = [
        { nome: "Segunda-feira", curto: "SEG" },
        { nome: "Terça-feira", curto: "TER" },
        { nome: "Quarta-feira", curto: "QUA" },
        { nome: "Quinta-feira", curto: "QUI" },
        { nome: "Sexta-feira", curto: "SEX" },
        { nome: "Sábado", curto: "SAB" },
        { nome: "Domingo", curto: "DOM" },
    ];
    
    const temAcesso = session?.user.role === "Admin" || session?.user.role === "RECURSOS HUMANOS";

    // Carregar tarefas do banco
    const carregarTarefas = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        try {
            const data = await BuscarTarefasPorUsuario(String(session.user.id));
            setTarefas(data || []);
        } catch (error) {
            toast.error("Erro ao sincronizar atividades.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarTarefas();
        const timer = setInterval(() => setAgora(new Date()), 1000);
        return () => clearInterval(timer);
    }, [session]);

    const tarefasExibidas = useMemo(() => {
        return tarefas.filter(t => {
            const eODiaCorreto = t.diaSemana === diaAtivo;
            
            if (!eODiaCorreto) return false;
    
            if (filtro === 'pendentes') return !t.feita;
            if (filtro === 'concluidas') return t.feita;
            
            return true;
        });
    }, [tarefas, diaAtivo, filtro]);

    

    const navegar = (direcao: number) => {
        setDiaAtivo((prev) => (prev + direcao + 7) % 7);
    };

    const handleToggle = async (id: string, statusAtual: boolean) => {
        setTarefas(prev => prev.map(t => t.id === id ? { ...t, feita: !statusAtual } : t));

        try {
            const res = await AlternarStatusTarefa(id, !statusAtual);
            if (!res.success) throw new Error();
        } catch (error) {
            toast.error("Erro ao atualizar status");
            carregarTarefas(); // Reverte se der erro
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-10 min-h-screen pb-20">
            <header className="space-y-6 mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <img
                                src={session?.user.imagemUrl || '/panda.png'}
                                alt='Avatar'
                                className="w-14 h-14 object-cover rounded-[1.3rem] border-2 border-indigo-500/20 shadow-lg"
                            />
                            <div className="absolute inset-0 rounded-[1.3rem] bg-indigo-500/20 blur-md -z-10 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Operador(a):</p>
                            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {session?.user.nome || "Usuário"}
                            </h1>
                            <span className='text-indigo-400 font-bold text-[12px] uppercase tracking-widest'>
                                {session?.user.role}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] min-w-[200px] text-right">
                        <div className="text-xl font-black text-indigo-400 font-mono">
                            {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            {agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </div>
                    </div>
                </div>

                    <BotaoVoltar/>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-black/20 p-1 rounded-full border border-white/5">
                        {(['todas', 'pendentes', 'concluidas'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filtro === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Seletor de Dia */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-[3rem]">
                <button onClick={() => navegar(-1)} className="p-4 hover:bg-white/10 rounded-full text-slate-400"><ChevronLeft /></button>
                <div className="text-center">
                    <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">{DIAS[diaAtivo].curto}</span>
                    <h2 className="text-lg font-black text-white uppercase italic leading-tight">{DIAS[diaAtivo].nome}</h2>
                </div>
                <button onClick={() => navegar(1)} className="p-4 hover:bg-white/10 rounded-full text-slate-400"><ChevronRight /></button>
            </div>

            {/* Lista de Tarefas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Diretrizes de Hoje</h3>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                        {tarefasExibidas.filter(t => t.feita).length}/{tarefasExibidas.length} OK
                    </span>
                </div>

                <div className="grid gap-3">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : tarefasExibidas.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {tarefasExibidas.map((tarefa) => (
                                <motion.div
                                    layout
                                    key={tarefa.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleToggle(tarefa.id, tarefa.feita)}
                                    className={`group cursor-pointer p-5 rounded-[2rem] border transition-all ${tarefa.feita ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:border-indigo-500/30'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={tarefa.feita ? 'text-emerald-500' : 'text-slate-700'}>
                                            {tarefa.feita ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold uppercase tracking-tight ${tarefa.feita ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                                {tarefa.texto}
                                            </p>
                                            {tarefa.descricao && (
                                                <p className="text-[10px] text-slate-500 mt-1 lowercase font-medium italic">
                                                    {tarefa.descricao}
                                                </p>
                                            )}
                                        </div>
                                        {tarefa.fixa && <Star size={14} className="fill-amber-500 text-amber-500 opacity-50" />}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                            <p className="text-[10px] font-black text-slate-700 uppercase italic">Nenhuma atividade agendada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}