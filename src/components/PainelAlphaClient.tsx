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
    Zap,
    LayoutGrid,
    Search,
    ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AbaDeAcesso } from "@/components/AbaDeAcesso";
import { UserDropdown } from "./UserDropdown";
import Pusher from "pusher-js";
import { getTema } from "@/lib/temas";


export default function PainelAlphaClient({ session, chamadosIniciais, configBanco }: any) {

    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [notificacoesLive, setNotificacoesLive] = useState(0);

    useEffect(() => { setMounted(true); }, []);

    const userName = session?.user?.nome || session?.user?.name || "Operador";
    const userRole = session?.user?.role || "USER";
    const userPermissions = session?.user?.permissoes || [];
    const esconderBloqueados = session?.user?.esconderBloqueados || false;
    const idsAtalhos = useMemo(() => session?.user?.atalhos?.split(",") || [], [session]);
    const idsFavoritos = useMemo(() => session?.user?.favoritos?.split(",") || [], [session]);


    const tema_interface = (session?.user as any)?.tema_interface || "blue";
    const userObj = session?.user as any;
    const densidade = (session?.user as any)?.densidade_painel || "default";
    const temaNome = configBanco?.tema || "blue";
    const densidade_painel = configBanco?.densidade || "default";
  
    const style = getTema(temaNome);



    const totalNotificacoesGeral = useMemo(() => {
        const lista = chamadosIniciais || [];
        const doBanco = lista.reduce((acc: number, c: any) => acc + (c._count?.mensagens || 0), 0);
        return doBanco + (notificacoesLive || 0);
    }, [chamadosIniciais, notificacoesLive]);

    const temNotificacaoGeral = totalNotificacoesGeral > 0;

    useEffect(() => {
        window.location;
    }, [session?.user?.tema_interface, session?.user?.densidade_painel]);


    useEffect(() => {
        if (!mounted || !chamadosIniciais || chamadosIniciais.length === 0) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            forceTLS: true
        });

        chamadosIniciais.forEach((chamado: any) => {
            const channel = pusher.subscribe(`chat-${chamado.id}`);
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

    const modulos = [
        { id: "radar", title: "Consulta RADAR", desc: "Consultas unitárias ou em lote via API com exportação Excel.", img: "../bar-chart_1573395.png", link: "/PainelAlpha/HabilitacaoRadar", color: "from-blue-600/20", tag: "Logística" },
        { id: "chamados", title: "Chamados Internos", desc: "Suporte técnico e registro de incidentes para o time de TI.", img: "../discussion_655664.png", link: "/PainelAlpha/Chamados", color: "from-amber-600/20", tag: "Suporte" },
        { id: "cadastro", title: "Gestão de Equipe", desc: "Gerenciamento de contas, permissões e status de usuários.", img: "../people_10893485.png", link: "/PainelAlpha/cadastro", color: "from-purple-600/20", tag: "Admin" },
        { id: "Reservas", title: "Reserva de Salas", desc: "Agendamento de salas com controle de data e horários.", img: "../icons8-sala-de-reuniões-64.png", link: "/PainelAlpha/ReservaSalas", color: "from-emerald-600/20", tag: "Facilities" },
        { id: "Documentos", title: "POP", desc: "Documentos de guia e normas para funções operacionais.", img: "../arquivo.png", link: "/PainelAlpha/DocsAlpha", color: "from-indigo-600/20", tag: "Processos" },
        { id: "UpDocumentos", title: "Upload POP", desc: "Portal para transmissão de novos arquivos ao servidor.", img: "../pasta.png", link: "/PainelAlpha/GerenciamentoArquivos", color: "from-rose-600/20", tag: "Arquivos" },
        { id: "Historico", title: "Gerenciamento do POP", desc: "Controle e rastreabilidade do histórico de arquivos.", img: "../historico.png", link: "/PainelAlpha/HistoricoArquivos", color: "from-cyan-600/20", tag: "Auditoria" },
        { id: "Cliente", title: "Cadastro de Clientes", desc: "Módulo estratégico para cadastro de novos parceiros.", img: "../local-na-rede-internet.png", link: "/PainelAlpha/CadastroClientes", color: "from-orange-600/20", tag: "Comercial" }
    ];

    const { favoritos, restante } = useMemo(() => {
        const busca = searchTerm.toLowerCase();
        const userObj = session?.user as any;

        const idsAtalhos = userObj?.atalhos?.split(",") || [];
        const esconder = !!userObj?.esconderBloqueados;

        const baseFiltrada = modulos.filter(m => {
            if (!m.title.toLowerCase().includes(busca)) return false;

            const temAcesso = userRole === "Admin" || userPermissions.includes(m.id.toLowerCase());

            if (esconder && !temAcesso) return false;

            return true;
        });

        const listaFavoritos = baseFiltrada
            .filter(m => idsAtalhos.includes(m.id))
            .sort((a, b) => idsAtalhos.indexOf(a.id) - idsAtalhos.indexOf(b.id));

        const listaRestante = baseFiltrada.filter(m => !idsAtalhos.includes(m.id));

        return { favoritos: listaFavoritos, restante: listaRestante };
    }, [searchTerm, session, userPermissions, userRole, modulos]);



    if (!mounted) return null;

    return (
        <main className={`min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden relative font-sans selection:${style.glow.replace('10', '30')}`}>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${style.glow} blur-[150px] rounded-full`} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com')] opacity-[0.03]" />
            </div>

            <div className={`relative z-10 mx-auto p-4 lg:p-10 flex flex-col gap-8 ${densidade_painel === 'compact' ? 'max-w-[1920px]' : 'max-w-[1800px]'}`}>
                <header className="w-full rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-3xl p-6 lg:p-8 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-2xl ring-1 ring-white/10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className={`h-20 w-20 rounded-[1.8rem] bg-gradient-to-br ${style.bg} to-slate-900 flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-all duration-500`}>
                                <Cpu size={40} strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-[#0b1120] animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white">
                                Painel <span className={style.text}>Alpha</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">
                                    <Globe size={14} className={style.text} /> Rede: <span className="text-emerald-500">Sincronizada</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">
                                    <Zap size={14} className="text-amber-500 fill-amber-500/20" /> Status: <span className="text-white italic">Criptografado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 max-w-md relative group mx-4">
                        <Search className={`absolute left-4 top-3.5 text-slate-600 group-focus-within:${style.text} transition-colors`} size={18} />
                        <Input
                            placeholder="BUSCAR MÓDULO OPERACIONAL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`h-12 bg-black/40 border-white/5 rounded-2xl pl-12 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:${style.border.replace('20', '50')} transition-all`}
                        />
                    </div>

                    <UserDropdown userName={userName} userRole={userRole} userImage={session?.user?.imagemUrl} />
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Nível de Acesso", value: userRole, icon: ShieldCheck, color: `${style.text} ${style.glow}`, active: false },
                        { label: "Integridade", value: "100%", icon: Activity, color: "text-emerald-500 bg-emerald-500/10", active: false },
                        { label: "Notificações", value: temNotificacaoGeral ? `${totalNotificacoesGeral} Pendentes` : "Limpo", icon: Bell, color: temNotificacaoGeral ? "text-amber-500 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-amber-500 bg-amber-500/10", active: temNotificacaoGeral },
                        { label: "Sistema Alpha", value: "Ativo", icon: Zap, color: "text-purple-500 bg-purple-500/10", active: false }
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-[1.8rem] border flex items-center gap-4 transition-all duration-500 group overflow-hidden relative ${stat.active ? "bg-amber-600/10 border-amber-500/50 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-slate-900/40 border-white/5 hover:bg-slate-900/60"}`}>
                            {stat.active && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent animate-shimmer" />}
                            <div className={`p-3 rounded-xl relative z-10 transition-transform duration-500 ${stat.color} ${stat.active ? "scale-110" : "group-hover:scale-110"}`}>
                                <stat.icon size={20} className={stat.active ? "animate-bounce" : ""} />
                            </div>
                            <div className="relative z-10">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${stat.active ? "text-amber-400" : "text-slate-500"}`}>{stat.label}</p>
                                <p className="text-xs font-black text-white uppercase italic">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="flex flex-col gap-12">
                    <section className="pb-20">
                        <div className="flex items-center gap-3 mb-8 px-4">
                            <LayoutGrid className={style.text} size={20} />
                            <h2 className="text-sm font-black text-white uppercase italic tracking-[0.4em] opacity-80">Núcleo Operacional</h2>
                        </div>

                        <div className={`grid gap-6 ${densidade_painel === 'compact' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {favoritos.map((modulo) => {
                                const temAcesso = userRole === "Admin" ||
                                    userPermissions.some((p: string) => p.toLowerCase() === modulo.id.toLowerCase());

                                if (densidade_painel === 'compact') {
                                    return (
                                        <AbaDeAcesso key={modulo.id} permissaoRequerida={modulo.id} userRole={userRole} userPermissions={userPermissions}>
                                            <Link href={modulo.link} className={`group relative h-28 rounded-[2rem] border transition-all p-5 flex items-center gap-5 overflow-hidden ${style.border} ${style.glow} hover:${style.border.replace('20', '40')} shadow-lg ${style.shadow}`}>
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                                    <img src={modulo.img} alt="" className={`w-8 h-8 object-contain transition-all duration-500 ${!temAcesso ? 'grayscale opacity-30' : 'grayscale-0 opacity-100'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-[10px] font-black uppercase italic tracking-tighter truncate group-hover:${style.text} transition-colors`}>{modulo.title}</h3>
                                                    <span className={`text-[7px] font-black uppercase tracking-widest ${temAcesso ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {temAcesso ? "● Disponível" : "○ Restrito"}
                                                    </span>
                                                </div>
                                                <ArrowRight size={14} className={`ml-auto ${style.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300`} />
                                            </Link>
                                        </AbaDeAcesso>
                                    )
                                }

                                return (
                                    <AbaDeAcesso key={modulo.id} permissaoRequerida={modulo.id} userRole={userRole} userPermissions={userPermissions}>
                                        <div className={`group relative h-[440px] rounded-[3rem] border border-white/5 bg-slate-950/40 p-10 flex flex-col justify-between transition-all duration-700 hover:-translate-y-3 ${temAcesso ? `hover:${style.border.replace('20', '50')} hover:shadow-[0_0_50px_-12px_rgba(var(--${style.accent}),0.3)]` : 'opacity-60 grayscale'} shadow-2xl overflow-hidden backdrop-blur-xl`}>

                                            <div className={`absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br ${style.bg} blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full`} />

                                            <div className="relative z-10">
                                                <div className="mb-8 flex items-center justify-between">
                                                    <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:${style.border} group-hover:bg-white/10 transition-all duration-500`}>
                                                        <img src={modulo.img} alt={modulo.title} className={`w-12 h-12 object-contain filter drop-shadow-lg transition-transform duration-700 group-hover:scale-110 ${!temAcesso && 'grayscale opacity-50'}`} />
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-black/40 rounded-lg border border-white/5 group-hover:${style.text} transition-colors`}>
                                                        {temAcesso ? modulo.tag : "RESTRITO"}
                                                    </span>
                                                </div>

                                                <h3 className={`text-xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight group-hover:${style.text} transition-colors line-clamp-2`}>
                                                    {modulo.title}
                                                </h3>

                                                <p className="text-slate-500 text-[11px] leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity italic">
                                                    {temAcesso ? modulo.desc : "ACESSO NEGADO: CONSULTE O ADMINISTRADOR DO SISTEMA ALPHA PARA LIBERAÇÃO."}
                                                </p>
                                            </div>

                                            <div className="relative z-10 pt-4">
                                                <Link href={temAcesso ? modulo.link : "#"} onClick={(e) => !temAcesso && e.preventDefault()}>
                                                    <Button className={`cursor-pointer w-full h-14 border rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[9px] transition-all duration-500 
                                                    ${temAcesso
                                                            ? `bg-slate-900/80 ${style.text} ${style.border.replace('20', '40')} 
                                                        hover:${style.bg} hover:text-white hover:border-transparent
                                                        group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] 
                                                        relative overflow-hidden group/btn`
                                                            : "bg-slate-950 text-slate-800 border-white/5 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        {temAcesso && (
                                                            <div className={`absolute inset-0 opacity-10 group-hover/btn:opacity-0 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-shimmer`} />
                                                        )}

                                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                                            {temAcesso ? "Acessar Painel" : "Acesso Bloqueado"}
                                                            {temAcesso && <ArrowRight size={14} className="group-hover:rotate-12 transition-transform" />}
                                                        </span>
                                                    </Button>

                                                </Link>
                                            </div>

                                            <div className={`absolute top-10 right-10 text-[7px] font-black text-slate-800 uppercase tracking-[0.4em] group-hover:${style.text} transition-colors`}>
                                                {temAcesso ? `SYS::${modulo.id}` : "LOCK::ALPHA"}
                                            </div>
                                        </div>
                                    </AbaDeAcesso>

                                )
                            })}
                        </div>
                    </section>
                </div>

            </div>
        </main>
    );
}
