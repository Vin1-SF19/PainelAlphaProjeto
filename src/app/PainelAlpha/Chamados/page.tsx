import LogoutUser from "@/Components/LogoutUser";
import { UserIcon, PlusCircle, Clock, CheckCircle2, AlertCircle, Filter, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { Button } from "@/Components/ui/button";
import Link from "next/link";
import  db  from "@/lib/prisma";
import DetalhesChamado from "@/Components/DetalhesChamado";
import { FiltroChamados } from "@/Components/FiltroChamado";
import { BotaoVoltar } from "@/Components/BotaoVoltar";





export default async function Chamados({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth();


    if (!session) {
        redirect("/");
    }

    const { status } = await searchParams;
    const isAdmin = session.user.role === "Admin";
    const userId = Number(session.user.id);

    const filtroStatus = status ? { status: status as any } : {};
    const filtroUsuario = session.user.role === 'Admin' ? {} : { usuarioId: Number(session.user.id) }

    const todosOsChamadosBase = await db.chamados.findMany({
        where: isAdmin ? {} : { usuarioId: userId }
    });

    // Busca os dados reais do banco
    const chamados = await db.chamados.findMany({
        where:
        {
            ...(isAdmin ? {} : { usuarioId: userId }),
            ...(status && { status: status as any }),
        },
        orderBy: { createdAt: 'desc' },
        include: { solicitante: true },

    });

    
    
    const chamadosExibidos = await db.chamados.findMany({
        where: {
            ...(isAdmin ? {} : { usuarioId: userId }),
            ...(status && { status: status as any }),
        },
        orderBy: { createdAt: 'desc' },
        include: { solicitante: true }
    });
    
    // Cálculos para os StatCards
    const total = chamadosExibidos.length;
    const abertos = chamadosExibidos.filter(c => c.status === "ABERTO").length;
    const emCurso = chamadosExibidos.filter(c => c.status === "EM_ATENDIMENTO").length;
    const finalizados = chamadosExibidos.filter(c => c.status === "CONCLUIDO").length;


    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-10 sm:px-8">

            {/* HEADER ESTILIZADO */}
            <div className="mx-auto max-w-7xl mb-10 rounded-[2rem] border border-blue-500/20 bg-slate-900/40 backdrop-blur-2xl shadow-2xl p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ring-1 ring-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <LayoutDashboard className="text-blue-500 w-8 h-8" />
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                            CENTRAL DE <span className="text-blue-500 italic">CHAMADOS</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                            <UserIcon size={16} className="text-blue-400" />
                            <span className="text-blue-400 font-medium text-sm">@{session.user.usuario}</span>
                        </div>
                        <span className="text-slate-500 text-sm font-medium">| Nível: {session.user.role}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <BotaoVoltar />
                    <Link href="/PainelAlpha/Chamados/NovoChamado">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-900/40 border-t border-white/20 transition-all active:scale-95">
                            <PlusCircle className="mr-2 w-5 h-5" /> Abrir Chamado
                        </Button>
                    </Link>
                </div>
            </div>
            <LogoutUser />

            {/* ÁREA DE CONTEÚDO */}
            <main className="mx-auto max-w-7xl space-y-8">

                {/* GRID DE MÉTRICAS (VALORES DINÂMICOS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total" value={String(total)} icon={<LayoutDashboard />} color="blue" />
                    <StatCard title="Abertos" value={String(abertos)} icon={<AlertCircle />} color="amber" />
                    <StatCard title="Em curso" value={String(emCurso)} icon={<Clock />} color="purple" />
                    <StatCard title="Finalizados" value={String(finalizados)} icon={<CheckCircle2 />} color="emerald" />
                </div>

                {/* CONTAINER DA TABELA */}
                <div className="rounded-[2rem] border border-slate-800 bg-slate-900/30 backdrop-blur-md overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-500" /> Lista de Chamados
                        </h2>
                        <FiltroChamados />
                    </div>

                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-widest bg-slate-950/50">
                                    <th className="px-6 py-4 font-semibold">Chamado / Solicitante</th>
                                    <th className="px-6 py-4 font-semibold">Prioridade</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Data</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {chamados.length > 0 ? (
                                    chamadosExibidos.map((chamado) => (
                                        <tr key={chamado.id} className="hover:bg-blue-500/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base group-hover:text-blue-400 transition-colors">{chamado.titulo}</span>
                                                    <span className="text-slate-500 text-xs">{chamado.solicitante.nome} - {chamado.categoria}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${chamado.prioridade === 'URGENTE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {chamado.prioridade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                                    <span className={`w-2 h-2 rounded-full ${chamado.status === 'ABERTO' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                    {chamado.status.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-400 text-sm">
                                                {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <DetalhesChamado
                                                    chamado={chamado}
                                                    isAdmin={session.user.role === "Admin"}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Nenhum chamado encontrado.</td>
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

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
    const colors: any = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} backdrop-blur-sm flex items-center justify-between transition-all hover:scale-[1.02]`}>
            <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                <h4 className="text-3xl font-black text-white">{value}</h4>
            </div>
            <div className="p-3 rounded-2xl bg-white/5">
                {icon}
            </div>
        </div>
    );
}
