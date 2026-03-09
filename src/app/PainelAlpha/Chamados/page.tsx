import { UserIcon, PlusCircle, Clock, CheckCircle2, AlertCircle, Filter, LayoutDashboard, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import db from "@/lib/prisma";
import DetalhesChamado from "@/components/DetalhesChamado";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import ChatChamado from "./ChatChamado/page";
import { FiltroChamadosCards } from "@/components/FiltroChamado";

export default async function Chamados({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/");

    const { status } = await searchParams;
    const isAdmin = session.user.role === "Admin";
    const userId = Number(session.user.id);

    const todosOsChamadosBase = await db.chamados.findMany({
        where: isAdmin ? {} : { usuarioId: userId },
        select: { status: true } 
    });

    const chamados = await db.chamados.findMany({
        where: {
            ...(isAdmin ? {} : { usuarioId: userId }),
            ...(status && status !== "TODOS" && { status: status as any }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
            solicitante: true,
            mensagens: {
                include: { autor: true },
                orderBy: { createdAt: 'asc' }
            },
            _count: {
                select: {
                    mensagens: {
                        where: {
                            AND: [
                                { autorId: { not: userId } },
                                isAdmin
                                    ? { lida_admin: false }
                                    : { lida_usuario: false }
                            ]
                        }
                    }
                }
            }
        },
    });


    const temAtivos = chamados.some(c => c.status !== "CONCLUIDO");

    const total = todosOsChamadosBase.length;
    const abertos = todosOsChamadosBase.filter(c => c.status === "ABERTO").length;
    const emCurso = todosOsChamadosBase.filter(c => c.status === "EM_ATENDIMENTO").length;
    const finalizados = todosOsChamadosBase.filter(c => c.status === "CONCLUIDO").length;

    const statusStyles: any = {
        ABERTO: "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
        EM_ATENDIMENTO: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        CONCLUIDO: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };

    return (
        <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-10 sm:px-8 custom-scrollbar">
            {/* HEADER COM EFEITO NEON */}
            <div className="mx-auto max-w-7xl mb-10 rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 ring-1 ring-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20">
                            <LayoutDashboard className="text-blue-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Chamados <span className="text-blue-500">Internos</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 pl-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Operador:</span>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-blue-400 font-bold text-xs uppercase">@{session.user.usuario}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <BotaoVoltar />
                    {!isAdmin && (
                        <Link href="/PainelAlpha/Chamados/NovoChamado">
                            <Button className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] px-8 h-14 font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 border-t border-white/20 transition-all active:scale-95 group">
                                <PlusCircle className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Novo Chamado
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-7xl space-y-8 relative">

                <FiltroChamadosCards
                    total={total}
                    abertos={abertos}
                    emCurso={emCurso}
                    finalizados={finalizados}
                />

                <div className="rounded-[3rem] border border-white/5 bg-slate-900/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                Histórico de Atendimentos
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-black/20">
                                    <th className="px-8 py-5">Assunto / Categoria</th>
                                    <th className="px-8 py-5 text-center">Urgência</th>
                                    <th className="px-8 py-5">Status Atual</th>
                                    <th className="px-8 py-5">Abertura</th>
                                    <th className="px-8 py-5">Chat</th>
                                    <th className="px-8 py-5 text-right">Gestão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chamados.length > 0 ? (
                                    chamados.map((chamado) => (
                                        <tr key={chamado.id} className="hover:bg-blue-600/5 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                                                        {chamado.titulo}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                                                        {chamado.solicitante.nome} • <span className="text-slate-600">{chamado.categoria}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${chamado.prioridade === 'URGENTE'
                                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                                                        : 'bg-slate-800 text-slate-400 border-white/5'
                                                        }`}>
                                                        {chamado.prioridade}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${statusStyles[chamado.status]}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${chamado.status === 'ABERTO' ? 'animate-ping' : ''}`} />
                                                    {chamado.status.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400 text-xs font-bold font-mono">
                                                {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-8 py-6">
                                                <ChatChamado
                                                    chamadoId={chamado.id}
                                                    titulo={chamado.titulo}
                                                    mensagensIniciais={chamado.mensagens}
                                                    contagem={chamado._count.mensagens}
                                                    status={chamado.status}
                                                    usuarioAtualId={userId}
                                                    isAdmin={session.user.role === "Admin"}
                                                />
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <DetalhesChamado chamado={chamado} isAdmin={isAdmin} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <LayoutDashboard size={48} />
                                                <span className="text-xs font-black uppercase tracking-widest">Nenhum chamado na fila</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
    const colors: any = {
        blue: "text-blue-400 border-blue-500/20 shadow-blue-900/10",
        amber: "text-amber-400 border-amber-500/20 shadow-amber-900/10",
        emerald: "text-emerald-400 border-emerald-500/20 shadow-emerald-900/10",
        purple: "text-purple-400 border-purple-500/20 shadow-purple-900/10",
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border bg-slate-900/20 backdrop-blur-xl flex items-center justify-between transition-all hover:border-white/20 group relative overflow-hidden ${colors[color]}`}>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 group-hover:text-white transition-colors">{title}</p>
                <h4 className="text-4xl font-black text-white tracking-tighter">{value}</h4>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {icon}
            </div>
        </div>
    );
}
