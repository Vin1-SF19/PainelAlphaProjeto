"use client"

import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, LineChart, Line 
} from 'recharts';
import { Users, TrendingUp, Award, UserCheck } from 'lucide-react';

export default function MarketingDashboard({ dadosEquipe }: any) {
    // 1. Ranking de Conversão (Quem está vendendo mais)
    const rankingVendas = dadosEquipe.map((c: any) => ({
        nome: c.nome,
        vendas: c.habilitacao + c.revisao,
        leads: c.leads
    })).sort((a: any, b: any) => b.vendas - a.vendas);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 space-y-8">
            {/* HEADER FOCO EM GESTÃO */}
            <header className="flex flex-col lg:flex-row items-center justify-between bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                        <Users className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white uppercase">Gestão de Performance Marketing</h1>
                        <p className="text-[10px] text-emerald-400 font-bold tracking-[0.2em] uppercase">Visão Geral da Equipe</p>
                    </div>
                </div>
            </header>

            {/* GRID DE RANKING E MÉTRICAS GERAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <CardDestaque titulo="Top Vendedor" valor={rankingVendas[0]?.nome} sub="Maior volume de CF" icon={<Award className="text-yellow-500" />} />
                <CardDestaque titulo="Total Leads" valor={dadosEquipe.reduce((a:any, b:any) => a + b.leads, 0)} sub="Entrada do mês" icon={<TrendingUp className="text-blue-500" />} />
                <CardDestaque titulo="Média Conversão" valor="12.5%" sub="Leads -> Vendas" icon={<UserCheck className="text-emerald-500" />} />
                <CardDestaque titulo="Hot Leads Ativos" valor={dadosEquipe.reduce((a:any, b:any) => a + (b.hotLeadsHabilitacao + b.hotLeadsRevisao), 0)} sub="Oportunidades Quentes" icon={<TrendingUp className="text-orange-500" />} />
            </div>

            {/* GRÁFICO COMPARATIVO DE EQUIPE */}
            <CardGraficoContainer titulo="COMPARAÇÃO DE VENDAS POR COLABORADOR">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rankingVendas}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                            <Bar dataKey="vendas" fill="#10b981" radius={[10, 10, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardGraficoContainer>

            {/* SEÇÃO INDIVIDUAL - UM CARD PARA CADA COLABORADOR */}
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mt-12">Detalhamento por Colaborador</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dadosEquipe.map((colab: any) => (
                    <CardColaborador key={colab.id} colab={colab} />
                ))}
            </div>
        </div>
    );
}

// COMPONENTE DE CARD INDIVIDUAL (O QUE VOCÊ GOSTA)
function CardColaborador({ colab }: any) {
    const dataFunil = [
        { name: 'Leads', valor: colab.leads },
        { name: 'Agendas', valor: colab.agendadas },
        { name: 'Realiz.', valor: colab.realizadas },
        { name: 'Vendas', valor: colab.habilitacao + colab.revisao },
    ];

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-blue-500">
                        {colab.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-black text-lg text-white uppercase">{colab.nome}</h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Conversão</p>
                    <p className="text-emerald-500 font-black text-xl">{((colab.habilitacao / colab.leads) * 100).toFixed(1)}%</p>
                </div>
            </div>

            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataFunil}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{display: 'none'}} />
                        <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={35}>
                            {dataFunil.map((entry, index) => (
                                <Cell key={index} fill={index === 3 ? '#10b981' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Hot Leads (H)</p>
                    <p className="text-xl font-black text-orange-500">{colab.hotLeadsHabilitacao}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Hot Leads (R)</p>
                    <p className="text-xl font-black text-amber-500">{colab.hotLeadsRevisao}</p>
                </div>
            </div>
        </div>
    );
}

function CardDestaque({ titulo, valor, sub, icon }: any) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{titulo}</span>
                {icon}
            </div>
            <p className="text-2xl font-black text-white uppercase">{valor}</p>
            <p className="text-[10px] text-slate-600 font-bold mt-1">{sub}</p>
        </div>
    );
}

function CardGraficoContainer({ titulo, children }: any) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">{titulo}</h3>
            {children}
        </div>
    );
}