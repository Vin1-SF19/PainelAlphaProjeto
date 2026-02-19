"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FolderTree, FileText, Eye, Download, Search, FileType, ShieldCheck, Globe } from "lucide-react";
import { BotaoVoltar } from "@/Components/BotaoVoltar";

interface Documento {
    id: number;
    titulo: string;
    descricao?: string;
    url: string;
    setor: string;
    tipo: string;
}

const SETORES = [
    "REGRAS GERAIS", "OPERACIONAL", "COMERCIAL", "RECURSOS HUMANOS", "FINANCEIRO", "JURÍDICO", "PARCEIRO"
];

export default function PaginaDocumentos() {
    const { data: session, status } = useSession();
    const [setorAtivo, setSetorAtivo] = useState("REGRAS GERAIS");
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [docSelecionado, setDocSelecionado] = useState<Documento | null>(null);
    const [busca, setBusca] = useState("");
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        async function inicializarDiretorio() {
            try {
                const res = await fetch("/api/documentos");
                const data = await res.json();
                if (Array.isArray(data)) setDocumentos(data);

                if (session?.user?.role) {
                    setSetorAtivo("REGRAS GERAIS");
                }
            } catch (err) {
                console.error("Erro ao sincronizar dados:", err);
            } finally {
                setLoadingDocs(false);
            }
        }

        if (status !== "loading") {
            inicializarDiretorio();
        }
    }, [session, status]);

    const roleUser = session?.user?.role?.toUpperCase().trim() || "USER";
    const isAdmin = roleUser === "ADMIN";

    const docsFiltrados = documentos.filter(d => {
        const setorDoc = d.setor?.toUpperCase().trim();
        const abaSelecionada = setorAtivo.toUpperCase().trim();
        
        const condicaoBusca = d.titulo.toLowerCase().includes(busca.toLowerCase());
        if (!condicaoBusca) return false;

        if (abaSelecionada === "REGRAS GERAIS") return setorDoc === "REGRAS GERAIS";

        if (isAdmin) return setorDoc === abaSelecionada;

        const temAcessoAoRH = roleUser === "RH" || roleUser === "RECURSOS HUMANOS" || roleUser === "FINANCEIRO";
        const temAcessoAoFinanceiro = roleUser === "FINANCEIRO" || roleUser === "RH" || roleUser === "RECURSOS HUMANOS";

        if (abaSelecionada === "RECURSOS HUMANOS") return temAcessoAoRH && setorDoc === "RECURSOS HUMANOS";
        if (abaSelecionada === "FINANCEIRO") return temAcessoAoFinanceiro && setorDoc === "FINANCEIRO";

        return setorDoc === abaSelecionada && setorDoc === roleUser;
    });

    if (status === "loading" || loadingDocs) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando...</p>
            </div>
        );
    }

    return (
        <>
                    <div className="p-5 bg-slate-950">
                        <div className="w-50">
                            <BotaoVoltar />
                        </div>
                    </div>
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="relative overflow-hidden bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                                    {isAdmin ? "Painel Administrativo" : "Sala de Documentos"}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        Nível de Acesso: <span className="text-blue-400">{roleUser}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                            {SETORES.map(setor => {
                                const s = setor.toUpperCase();
                                const r = roleUser;
                                
                                const podeVerBotao = 
                                s === "REGRAS GERAIS" ||
                                isAdmin || 
                                (r === "RH" && (s === "RECURSOS HUMANOS" || s === "FINANCEIRO")) ||
                                (r === "FINANCEIRO" && (s === "FINANCEIRO" || s === "RECURSOS HUMANOS")) ||
                                r === s || (r === "RECURSOS HUMANOS" && (s === "RECURSOS HUMANOS" || s === "FINANCEIRO"));
                                
                                if (!podeVerBotao) return null;
                                
                                return (
                                    <button
                                    key={setor}
                                    onClick={() => { setSetorAtivo(setor); setDocSelecionado(null); }}
                                    className={`w-24 cursor-pointer px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${setorAtivo.toUpperCase() === setor.toUpperCase()
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40 scale-105"
                                        : "text-slate-500 hover:bg-white/5"
                                        }`}
                                        >
                                        {setor === "REGRAS GERAIS" && <Globe size={12} className="inline mr-2 mb-0.5" />}
                                        {setor}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 backdrop-blur-md">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-3.5 text-slate-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR DOCUMENTO..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-600/50 outline-none"
                                    />
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {docsFiltrados.length > 0 ? (
                                    docsFiltrados.map(doc => (
                                        <button
                                        key={doc.id}
                                        onClick={() => setDocSelecionado(doc)}
                                        className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all border ${docSelecionado?.id === doc.id
                                            ? "bg-blue-600/10 border-blue-500/40 translate-x-2"
                                            : "bg-slate-950/50 border-transparent hover:border-white/10"
                                            }`}
                                            >
                                            <div className={`p-3 rounded-xl ${docSelecionado?.id === doc.id ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-600"}`}>
                                                <FileText size={18} />
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className={`text-[11px] font-black uppercase truncate tracking-tight ${docSelecionado?.id === doc.id ? "text-blue-400" : "text-slate-300"}`}>
                                                    {doc.titulo}
                                                </p>
                                                <p className="text-[9px] font-bold uppercase text-slate-600 mt-0.5 tracking-tighter">{doc.setor}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center px-4">
                                        <FileType size={40} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum registro para {setorAtivo}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col min-h-[700px] shadow-inner backdrop-blur-md">
                        {docSelecionado ? (
                            <>
                                <div className="p-5 bg-black/40 border-b border-white/5 flex justify-between items-center px-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{docSelecionado.titulo}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <a href={docSelecionado.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-600 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest border border-white/5">
                                            <Download size={14} /> DOWNLOAD
                                        </a>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white relative">
                                    <iframe
                                        key={docSelecionado.id}
                                        src={`${docSelecionado.url}#toolbar=0&view=FitH`}
                                        className="absolute inset-0 w-full h-full border-none shadow-2xl"
                                        title="Visualizador"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-700 bg-slate-950/20">
                                <div className="p-8 rounded-full bg-slate-900/50 mb-6 border border-white/5 shadow-2xl">
                                    <Eye size={60} className="opacity-10" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 text-center px-4">Selecione uma Regra ou Manual</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
                                        </>
    );
}
