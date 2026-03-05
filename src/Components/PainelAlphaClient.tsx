"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Globe,
    ShieldCheck,
    ArrowRight,
    Cpu,
    Activity,
    Bell,
    Clock,
    Zap,
    LayoutGrid,
    Search,
    ExternalLink
} from "lucide-react";

import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import LogoutUser from "@/Components/LogoutUser";
import { AbaDeAcesso } from "@/Components/AbaDeAcesso";
import Pusher from "pusher-js";

export default function PainelAlphaClient({ session, chamadosIniciais }: any) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const [notificacoesLive, setNotificacoesLive] = useState(0);
    
    
    const totalNotificacoesGeral = useMemo(() => {
        const doBanco = chamadosIniciais?.reduce((acc: number, c: any) => acc + (c._count?.mensagens || 0), 0) || 0;
        return doBanco + notificacoesLive;
    }, [chamadosIniciais, notificacoesLive]);
    
    const temNotificacaoGeral = totalNotificacoesGeral > 0;

    useEffect(() => {
        if (!mounted || !chamadosIniciais || chamadosIniciais.length === 0) return;
    
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            forceTLS: true
        });
    
        chamadosIniciais.forEach((chamado: any) => {
            const canalNome = `chat-${chamado.id}`;
            const channel = pusher.subscribe(canalNome);
    
            channel.bind("nova-mensagem", (data: any) => {
                if (data.autorId !== session?.user?.id) {
                    setNotificacoesLive(prev => prev + 1);
                }
            });
        });
    
        return () => {
            chamadosIniciais.forEach((c: any) => pusher.unsubscribe(`chat-${c.id}`));
            pusher.disconnect();
        };
    }, [mounted, chamadosIniciais, session?.user?.id]);



    
    const [searchTerm, setSearchTerm] = useState("");
    const userName = session?.user?.nome || session?.user?.name || "Operador";
    const userRole = session?.user?.role || "USER";
    const userPermissions = session?.user?.permissoes || [];

    const modulos = [
        { id: "radar", title: "Consulta RADAR", desc: "Consultas unitárias ou em lote via API com exportação Excel.", img: "../bar-chart_1573395.png", link: "/PainelAlpha/HabilitacaoRadar", color: "from-blue-600/20", tag: "Logística" },
        { id: "chamados", title: "Chamados Internos", desc: "Suporte técnico e registro de incidentes para o time de TI.", img: "../discussion_655664.png", link: "/PainelAlpha/Chamados", color: "from-amber-600/20", tag: "Suporte" },
        { id: "cadastro", title: "Gestão de Equipe", desc: "Gerenciamento de contas, permissões e status de usuários.", img: "../people_10893485.png", link: "/PainelAlpha/cadastro", color: "from-purple-600/20", tag: "Admin" },
        { id: "Reservas", title: "Reserva de Salas", desc: "Agendamento de salas com controle de data e horários.", img: "../icons8-sala-de-reuniões-64.png", link: "/PainelAlpha/ReservaSalas", color: "from-emerald-600/20", tag: "Facilities" },
        { id: "Documentos", title: "Protocolos POP", desc: "Documentos de guia e normas para funções operacionais.", img: "../arquivo.png", link: "/PainelAlpha/DocsAlpha", color: "from-indigo-600/20", tag: "Processos" },
        { id: "UpDocumentos", title: "Upload Central", desc: "Portal para transmissão de novos arquivos ao servidor.", img: "../pasta.png", link: "/PainelAlpha/GerenciamentoArquivos", color: "from-rose-600/20", tag: "Arquivos" },
        { id: "Historico", title: "Histórico POP", desc: "Controle e rastreabilidade do histórico de arquivos.", img: "../historico.png", link: "/PainelAlpha/HistoricoArquivos", color: "from-cyan-600/20", tag: "Auditoria" },
        { id: "Cliente", title: "CRM Clientes", desc: "Módulo estratégico para cadastro de novos parceiros.", img: "../local-na-rede-internet.png", link: "/PainelAlpha/CadastroClientes", color: "from-orange-600/20", tag: "Comercial" }
    ];

    const filteredModulos = useMemo(() => {
        return modulos.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    if (!mounted) return null;


    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden relative font-sans selection:bg-blue-500/30">

            {/* EFEITOS DE FUNDO NEON */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 max-w-[1800px] mx-auto p-4 lg:p-10 flex flex-col gap-8">

                {/* CABEÇALHO FUTURISTA */}
                <header className="w-full rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-3xl p-6 lg:p-8 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-2xl ring-1 ring-white/10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-20 w-20 rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 group-hover:rotate-6 transition-all duration-500">
                                <Cpu size={40} strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-[#0b1120] animate-pulse" />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white">
                                    Painel <span className="text-blue-500 font-black">Alpha</span>
                                </h1>
                                <span className="hidden sm:block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">Core v4.0</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">
                                    <Globe size={14} className="text-blue-500" />
                                    Rede: <span className="text-emerald-500">Sincronizada</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">
                                    <Zap size={14} className="text-amber-500 fill-amber-500/20" />
                                    Status: <span className="text-white italic">Criptografado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 max-w-md relative group mx-4">
                        <Search className="absolute left-4 top-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <Input
                            placeholder="BUSCAR MÓDULO OPERACIONAL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 bg-black/40 border-white/5 rounded-2xl pl-12 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:border-blue-500/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 p-3 rounded-[2rem] border border-white/5 shadow-inner">
                        <div className="flex flex-col items-end px-4 border-r border-white/10">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Identidade</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white italic tracking-tight uppercase max-w-[140px] truncate">
                                    {userName}
                                </span>
                                <ShieldCheck size={16} className={userRole === "Admin" ? "text-amber-500" : "text-blue-500"} />
                            </div>
                        </div>
                    </div>
                </header>

                <LogoutUser />

                {/* CARDS DE STATUS RÁPIDO */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: "Nível de Acesso",
                            value: userRole,
                            icon: ShieldCheck,
                            color:

                                "text-blue-500 bg-blue-500/10",
                            active: false
                        },
                        {
                            label: "Integridade",
                            value: "100%",
                            icon: Activity,
                            color: "text-emerald-500 bg-emerald-500/10",
                            active: false
                        },
                        {
                            label: "Notificações",
                            value: temNotificacaoGeral ? `${totalNotificacoesGeral} Pendentes` : "Limpo",
                            icon: Bell,
                            color: temNotificacaoGeral ? "text-amber-500 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-amber-500 bg-amber-500/10",
                            active: temNotificacaoGeral // 🚀 Ativa o efeito visual
                        },
                        {
                            label: "Sistema Alpha",
                            value: "Ativo",
                            icon: Zap,
                            color: "text-purple-500 bg-purple-500/10",
                            active: false
                        }
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-[1.8rem] border flex items-center gap-4 transition-all duration-500 group overflow-hidden relative ${stat.active
                                ? "bg-amber-600/10 border-amber-500/50 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                : "bg-slate-900/40 border-white/5 hover:bg-slate-900/60"
                            }`}>
                            {/* EFEITO DE BRILHO PARA CARD ATIVO */}
                            {stat.active && (
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent animate-shimmer" />
                            )}

                            <div className={`p-3 rounded-xl relative z-10 transition-transform duration-500 ${stat.color} ${stat.active ? "scale-110" : "group-hover:scale-110"}`}>
                                <stat.icon size={20} className={stat.active ? "animate-bounce" : ""} />
                            </div>

                            <div className="relative z-10">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${stat.active ? "text-amber-400" : "text-slate-500"}`}>
                                    {stat.label}
                                </p>
                                <p className="text-xs font-black text-white uppercase italic">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* GRID DE MÓDULOS REFORMULADO */}
                <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                    {filteredModulos.map((modulo) => (
                        <AbaDeAcesso
                            key={modulo.id}
                            permissaoRequerida={modulo.id}
                            userRole={userRole}
                            userPermissions={userPermissions}
                        >
                            <div className="group relative h-[440px] rounded-[3rem] border border-white/5 bg-slate-950/40 p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-3 hover:border-blue-500/40 shadow-2xl overflow-hidden backdrop-blur-xl">

                                {/* GLOW DE HOVER */}
                                <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${modulo.color} blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity rounded-full`} />

                                <div className="relative z-10">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                            <img src={modulo.img} alt={modulo.title} className="w-12 h-12 object-contain filter drop-shadow-lg" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 px-3 py-1 bg-black/20 rounded-lg border border-white/5">
                                            {modulo.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                                        {modulo.title}
                                    </h3>

                                    <p className="text-slate-500 text-[11px] leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity italic">
                                        {modulo.desc}
                                    </p>
                                </div>

                                <div className="relative z-10 pt-6">
                                    <Link href={modulo.link}>
                                        <Button className="cursor-pointer w-full h-14 bg-blue-800 border border-white/10 hover:bg-blue-600 hover:text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all group-hover:shadow-[0_15px_40px_rgba(37,99,235,0.3)]">
                                            Executar Acesso
                                            <ExternalLink size={14} className="ml-2 group-hover:rotate-12 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* MODULE ID WATERMARK */}
                                <div className="absolute top-10 right-10 text-[7px] font-black text-slate-800 uppercase tracking-[0.4em] group-hover:text-blue-500/30 transition-colors">
                                    SYS::{modulo.id}
                                </div>
                            </div>
                        </AbaDeAcesso>
                    ))}
                </section>

            </div>
        </main>
    );
}
