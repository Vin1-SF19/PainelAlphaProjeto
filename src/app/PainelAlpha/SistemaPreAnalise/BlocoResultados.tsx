"use client";

import {
    ShieldCheck, BarChart3, MapPin,
    Users, Phone, Mail, DollarSign, Briefcase,
    Activity, Landmark, User, Globe, History, Receipt
} from "lucide-react";

export default function BlocoResultados({ dados, visual, item }: { dados: any, visual: any, item: any }) {
    const rfb = dados.rfb?.dados || {};
    const radar = dados.radar?.dados || {};
    const empresaqui = dados.empresaqui?.dados || {};



    const historico = empresaqui.historico_regime || empresaqui.historicoRegime || [];


    const cnaes_secundarios = rfb.atividades_secundarias || [];
    const listaCnaes = [
        ...(rfb.atividade_principal || []).map((c: any) => ({ codigo: c.code, descricao: c.text })),
        ...cnaes_secundarios.map((c: any) => ({ codigo: c.code, descricao: c.text }))
    ];

    const estadosBrasileiros: { [key: string]: string } = {
        AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
        DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
        MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará",
        PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
        RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
        SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins"
    };


    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* HEADER: RAZÃO SOCIAL E STATUS */}
            <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-96 h-96 ${visual.bg} opacity-10 blur-[120px]`} />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                    <div className="max-w-4xl space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-[1px] bg-indigo-500/50" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                                Identificação Empresarial
                            </span>
                        </div>

                        <div className="relative">
                            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                                {rfb.razaoSocial || "NÃO LOCALIZADO"}
                            </h2>

                            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
                                <p className="text-slate-500 font-mono text-xs md:text-lg tracking-[0.2em] uppercase border-l-2 border-white/10 pl-4">
                                    {rfb.nomeFantasia !== "Sem nome fantasia"
                                        ? rfb.nomeFantasia
                                        : "NOME FANTASIA NÃO REGISTRADO"}
                                </p>

                                {rfb.cnpj && (
                                    <span className="text-[14px] font-bold bg-white/5 text-slate-400 px-3 py-1 rounded-full border border-white/5 w-fit uppercase">
                                        {rfb.cnpj}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            Situação Cadastral
                        </span>
                        <div className={`
                                px-6 py-3 rounded-2xl border font-black text-sm md:text-base uppercase tracking-tighter transition-all
                                ${rfb.situacao === 'ATIVA'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.1)]'}
                            `}>
                            {rfb.situacao || "N/A"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">

                {/* COLUNA ESQUERDA: DADOS CADASTRAIS */}
                <div className="lg:col-span-8 space-y-6 md:space-y-10">

                    {/* BLOCO 1: INFOS GERAIS */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900/40 border border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
                        <DataField label="Data de Abertura" value={rfb.dataConstituicao} />
                        <DataField label="Porte da Empresa" value={rfb.porte} />
                        <DataField label="Natureza Jurídica" value={rfb.natureza_juridica} fullWidth />
                        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    CNAEs Identificados
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const fonteDados = rfb || item;

                                    const principal = Array.isArray(fonteDados?.atividade_principal)
                                        ? fonteDados.atividade_principal
                                        : [];

                                    const secundarios = Array.isArray(fonteDados?.atividades_secundarias)
                                        ? fonteDados.atividades_secundarias
                                        : [];

                                    const listaCnaes = [...principal, ...secundarios];

                                    if (listaCnaes.length === 0) {
                                        return (
                                            <div className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-center">
                                                <span className="text-[10px] text-slate-600 font-black uppercase">Nenhum CNAE localizado</span>
                                            </div>
                                        );
                                    }

                                    return listaCnaes.map((cnae: any, i: number) => {
                                        const codigo = cnae.code || cnae.codigo;
                                        const descricao = cnae.text || cnae.descricao;
                                        const isPrincipal = i === 0;

                                        return (
                                            <div key={i} className="group relative">
                                                <div className={`
                                                    cursor-help px-3 py-1.5 rounded-lg border transition-all duration-300
                                                    flex items-center gap-2
                                                    ${isPrincipal
                                                        ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                                                    `}>
                                                    {isPrincipal && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                    )}
                                                    <span className={`text-[10px] font-mono font-black tracking-wider ${isPrincipal ? 'text-indigo-300' : 'text-slate-400'}`}>
                                                        {codigo}
                                                    </span>
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 
                                                        bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl 
                                                        opacity-0 group-hover:opacity-100 pointer-events-none 
                                                        transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
                                                    <p className="text-[9px] text-indigo-400 font-black uppercase mb-1 tracking-widest">
                                                        {isPrincipal ? "Atividade Principal" : "Atividade Secundária"}
                                                    </p>
                                                    <p className="text-[10px] leading-relaxed text-white font-bold uppercase italic">
                                                        {descricao}
                                                    </p>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0F172A]"></div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* BLOCO 2: QSA */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                            <Users size={24} className={visual.text} />
                            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">QSA</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rfb.qsa?.length > 0 ? rfb.qsa.map((socio: any, i: number) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="p-4 rounded-xl bg-white/5"><User size={20} className="text-slate-400" /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs md:text-sm font-black text-white uppercase truncate">{socio.nome}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic tracking-widest">{socio.qual}</p>
                                    </div>
                                </div>
                            )) : <p className="text-xs text-slate-600 uppercase font-black tracking-widest p-4">Informação não disponível ou Individual</p>}
                        </div>
                    </div>

                    {/* BLOCO 3: ENDEREÇO */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900/40 border border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <MapPin size={24} className={visual.text} />
                            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">Localização Completa</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                            <DataField label="Logradouro" value={`${rfb.logradouro}, ${rfb.numero}`} />
                            <DataField label="Bairro" value={rfb.bairro} />
                            <DataField label="Município" value={rfb.municipio} />
                            <DataField
                                label="Estado (UF)"
                                value={estadosBrasileiros[rfb.uf?.toUpperCase()] || rfb.uf || "---"}
                            />
                            <DataField label="CEP" value={rfb.cep} />
                            <DataField label="País" value="BRASIL" />
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: TRIBUTÁRIO & RADAR */}
                <div className="lg:col-span-4 space-y-6 md:space-y-10">

                    {/* REGIME FISCAL */}
                    <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border ${visual.border} bg-white/5 shadow-2xl backdrop-blur-sm`}>
                        <div className="flex items-center gap-4 mb-10">
                            <Landmark size={24} className={visual.text} />
                            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">Regime Fiscal</h3>
                        </div>
                        <div className="space-y-6">
                            <StatusRow label="Simples Nacional" active={rfb.optante_simples} />
                            <DataField label="Data de Opção (Simples)" value={rfb.data_opcao || "N/A"} />
                            <div className="h-[1px] bg-white/5 my-6" />
                            <StatusRow label="MEI (Microempreendedor)" active={rfb.optante_simei} />
                            <DataField label="Capital Social Declarado" value={rfb.capitalSocial} />
                        </div>
                    </div>

                    {/* RADAR SISCOMEX */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-blue-500/5 border border-blue-500/20 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <ShieldCheck size={24} className="text-blue-400" />
                            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">Radar Siscomex</h3>
                        </div>
                        <div className="space-y-6">
                            <DataField label="Submodalidade de Atuação" value={radar.submodalidade} />
                            <DataField label="Status de Habilitação" value={radar.situacao} />
                            <DataField label="Última Atualização" value={radar.dataSituacao} />
                        </div>
                    </div>

                    {/* EMPRESAQUI */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-purple-500/5 border border-purple-500/20 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <BarChart3 size={24} className="text-purple-400" />
                            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">Analise Empresaqui</h3>
                        </div>
                        <div className="space-y-6">
                            <DataField label="Regime Identificado" value={empresaqui.regimeEA} />
                        </div>
                    </div>

                </div>

            </div>

            {historico.length > 0 && (
                <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900/40 border border-white/5">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <History size={24} className={visual.text} />
                        <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white">Evolução Tributária Anual</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                        {[2021, 2022, 2023, 2024, 2025,].map(ano => {
                            const registro = historico.find((h: any) => String(h.Ano || h.ano || h.periodo).includes(String(ano)));
                            return (
                                <div key={ano} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all">
                                    <span className="block text-xs font-black text-slate-500 mb-3">{ano}</span>
                                    <span className={`text-[10px] font-black uppercase leading-tight ${registro ? 'text-white' : 'text-slate-700'}`}>
                                        {registro?.Regime || registro?.regime || "---"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CONTATOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ContactInfo icon={<Mail size={20} />} label="Canal de E-mail" value={rfb.email} />
                <ContactInfo icon={<Phone size={20} />} label="Terminal Telefônico" value={rfb.telefone} />
            </div>
        </div>
    );
}

function DataField({ label, value, fullWidth = false }: any) {
    return (
        <div className={`${fullWidth ? "col-span-1 sm:col-span-2 md:col-span-4" : ""} min-w-0`}>
            <p className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className="text-sm md:text-lg font-bold text-slate-100 uppercase italic leading-tight break-words">{value || "---"}</p>
        </div>
    );
}

function StatusRow({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-[11px] font-black px-5 py-2 rounded-lg ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                {active ? 'SIM' : 'NÃO'}
            </span>
        </div>
    );
}

function ContactInfo({ icon, label, value }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/[0.08] transition-all">
            <div className="text-slate-500 group-hover:text-white transition-colors">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xs md:text-sm font-bold text-white truncate uppercase italic">{value || "---"}</p>
            </div>
        </div>
    );
}

function parseData(arg0: any) {
    throw new Error("Function not implemented.");
}
