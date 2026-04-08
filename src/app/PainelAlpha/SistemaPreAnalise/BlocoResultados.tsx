"use client";

import {
    Database, ShieldCheck, BarChart3, MapPin,
    Users, Phone, Mail, DollarSign, Briefcase,
    Activity, Landmark, User
} from "lucide-react";

export default function BlocoResultados({ dados, visual }: { dados: any, visual: any }) {
    // Desestruturação segura: pegamos o conteúdo de 'dados' dentro de cada etapa
    const rfb = dados.rfb?.dados || {};
    const radar = dados.radar?.dados || {};
    const empresaqui = dados.empresaqui?.dados || {};

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* HEADER: RAZÃO SOCIAL E STATUS */}
            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 ${visual.bg} opacity-10 blur-[100px]`} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                            {rfb.razaoSocial || "NÃO LOCALIZADO"}
                        </h2>
                        <p className="text-slate-400 font-mono tracking-[0.2em] mt-2">
                            {rfb.nomeFantasia !== "Sem nome fantasia" ? rfb.nomeFantasia : "NOME FANTASIA NÃO REGISTRADO"}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Situação Cadastral</span>
                        <span className="px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            {rfb.situacao || "ATIVA"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* COLUNA ESQUERDA: DADOS CADASTRAIS */}
                <div className="lg:col-span-8 space-y-8">

                    {/* BLOCO 1: INFOS GERAIS */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <DataField label="Abertura" value={rfb.dataConstituicao} />
                        <DataField label="Porte" value={rfb.porte} />
                        <DataField label="Natureza" value={rfb.natureza_juridica} fullWidth />
                        <DataField label="CNAE Principal" value={rfb.atividade_principal?.[0]?.text} fullWidth />
                    </div>

                    {/* BLOCO 2: QSA */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <Users size={18} className={visual.text} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Quadro de Sócios e Administradores (QSA)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rfb.qsa?.length > 0 ? rfb.qsa.map((socio: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="p-2 rounded-lg bg-white/5"><User size={14} className="text-slate-400" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase">{socio.nome}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase">{socio.qual}</p>
                                    </div>
                                </div>
                            )) : <p className="text-[10px] text-slate-600 uppercase font-black">Informação não disponível ou Individual</p>}
                        </div>
                    </div>

                    {/* BLOCO 3: ENDEREÇO */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={18} className={visual.text} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Localização</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <DataField label="Logradouro" value={`${rfb.logradouro}, ${rfb.numero}`} />
                            <DataField label="Bairro" value={rfb.bairro} />
                            <DataField label="Município" value={rfb.municipio} />
                            <DataField label="UF" value={rfb.uf} />
                            <DataField label="CEP" value={rfb.cep} />
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: TRIBUTÁRIO & RADAR */}
                <div className="lg:col-span-4 space-y-8">

                    {/* SIMPLES NACIONAL / MEI */}
                    <div className={`p-8 rounded-[2.5rem] border ${visual.border} bg-white/5 shadow-xl`}>
                        <div className="flex items-center gap-3 mb-8">
                            <Landmark size={18} className={visual.text} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Regime Fiscal</h3>
                        </div>
                        <div className="space-y-4">
                            <StatusRow label="Simples Nacional" active={rfb.optante_simples} />
                            <DataField label="Opção Simples" value={rfb.data_opcao || "N/A"} />
                            <div className="h-[1px] bg-white/5 my-4" />
                            <StatusRow label="Microempreendedor (MEI)" active={rfb.mei} />
                            <DataField label="Capital Social" value={rfb.capitalSocial} />
                        </div>
                    </div>

                    {/* RADAR SISCOMEX */}
                    <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck size={18} className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Radar Siscomex</h3>
                        </div>
                        <div className="space-y-4">
                            <DataField label="Submodalidade" value={radar.submodalidade} />
                            <DataField label="Situação Radar" value={radar.situacao} />
                            <DataField label="Data da Situação" value={radar.dataSituacao} />
                        </div>
                    </div>

                    {/* EMPRESAQUI */}
                    <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 size={18} className="text-purple-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Rating EmpresaAqui</h3>
                        </div>
                        <DataField label="Regime Identificado" value={empresaqui.regime} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataField({ label, value, fullWidth = false }: any) {
    return (
        <div className={fullWidth ? "col-span-2 md:col-span-4" : ""}>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[11px] font-bold text-slate-200 uppercase italic truncate">{value || "---"}</p>
        </div>
    );
}

function StatusRow({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase">{label}</span>
            <span className={`text-[9px] font-black px-3 py-1 rounded-md ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
                {active ? 'SIM' : 'NÃO'}
            </span>
        </div>
    );
}