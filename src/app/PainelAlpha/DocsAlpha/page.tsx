"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { FileText, Eye, Search, ShieldCheck, Globe, ChevronRight, Folder, Trash2, ShieldAlert, Lock, Video, Settings, Star, ChevronDown, ChevronUp } from "lucide-react";
import { BotaoVoltar } from "@/Components/BotaoVoltar";
import { toast } from "sonner";
import AntiCapture from 'react-anticapture';
import { buscarOrdemPastas, salvarOrdemPastas } from "@/actions/OrdemPastas";


export const dynamic = 'force-dynamic';


interface Documento {
    id: number;
    titulo: string;
    data_criacao: string;
    url: string;
    setor: string;
    PastaArquivos: string;
    tipo: string;
    criado_por: string;
    protecao: string;
    ordem_manual: number;
}


const SETORES = ["REGRAS GERAIS", "OPERACIONAL", "COMERCIAL", "RECURSOS HUMANOS", "FINANCEIRO", "JURÍDICO", "PARCEIRO", "SERVIÇOS GERAIS"];
const SENHA_MESTRA = "1234";

export default function PaginaDocumentos() {
    const { data: session, status } = useSession();
    const [setorAtivo, setSetorAtivo] = useState("REGRAS GERAIS");
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [docSelecionado, setDocSelecionado] = useState<Documento | null>(null);
    const [busca, setBusca] = useState("");
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [modalExcluir, setModalExcluir] = useState(false);
    const [senhaInput, setSenhaInput] = useState("");


    const roleUser = session?.user?.role?.toUpperCase().trim() || "USER";

    const isAdmin = roleUser === "ADMIN";
    const rh = roleUser === "RECURSOS HUMANOS";

    const [pastaConfig, setPastaConfig] = useState<string | null>(null);

    const [ordemPastas, setOrdemPastas] = useState<string[]>([]);
    const [isArrastando, setIsArrastando] = useState(false);
    const [pastasAbertas, setPastasAbertas] = useState<Record<string, boolean>>({});



    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const handleEscudoScroll = (e: React.WheelEvent) => {
        if (iframeContainerRef.current) {
            iframeContainerRef.current.scrollTop += e.deltaY;
        }
    };

    const [ordem, setOrdem] = useState<"PADRAO" | "recentes" | "az" | "za">("recentes");


    const [hasWindow, setHasWindow] = useState(false);
    const [ficharioAtivo, setFicharioAtivo] = useState("Financeiro");

    useEffect(() => {
        setHasWindow(true);
    }, []);


    useEffect(() => {
        carregarDocumentos();
    }, [status]);

    useEffect(() => {

        const restoreScreen = () => {
            document.body.style.filter = "none";
            document.body.style.opacity = "1";
        };

        const handleSecurity = async (e: KeyboardEvent) => {
            const isPrintKey = e.key === 'PrintScreen' || e.keyCode === 44;
            const isForbiddenShortcut = e.ctrlKey && ['p', 'P', 's', 'S', 'u', 'U', 'c', 'C', 'v', 'V', 'x', 'X'].includes(e.key);
            const isDevTools = e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key));
            const isSystemCapture = (e.metaKey && e.shiftKey);

            if (isPrintKey || isForbiddenShortcut || isDevTools || isSystemCapture) {
                e.preventDefault();

                try {
                    await navigator.clipboard.writeText("ACESSO RESTRITO ALPHA");
                } catch (err) { }

                toast.error("SEGURANÇA ALPHA", {
                    description: "AÇÃO BLOQUEADA: CONTEÚDO RESTRITO",
                    duration: 4000,
                    style: { background: '#450a0a', border: '2px solid #ff0000', color: '#fff' }
                });

                setTimeout(restoreScreen, 2000);
            }
        };

        const handleBlur = () => {
            setTimeout(() => {
                if (document.activeElement?.classList.contains('documento-liberado')) {
                    restoreScreen();
                } else {
                }
            }, 150);
        };

        const disableRightClick = (e: MouseEvent) => e.preventDefault();

        window.addEventListener('keydown', handleSecurity);
        window.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen' || e.keyCode === 44) handleSecurity(e);
        });
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', restoreScreen);
        window.addEventListener('contextmenu', disableRightClick);

        return () => {
            window.removeEventListener('keydown', handleSecurity);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', restoreScreen);
            window.removeEventListener('contextmenu', disableRightClick);
        };
    }, []);







    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, []);





    async function carregarDocumentos() {
        try {
            const res = await fetch("/api/documentos");
            const data = await res.json();
            if (Array.isArray(data)) setDocumentos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDocs(false);
        }
    }

    const handleExcluirLogico = async () => {
        if (senhaInput !== SENHA_MESTRA) return toast.error("Senha Administrativa Incorreta!");

        try {
            const res = await fetch(`/api/documentos`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: docSelecionado?.id, status: 'INATIVO' })
            });

            if (!res.ok) throw new Error("Falha na resposta do servidor");

            setDocumentos(prev => prev.filter(d => d.id !== docSelecionado?.id));
            setDocSelecionado(null);
            setModalExcluir(false);
            setSenhaInput("");
            toast.success("Documento desativado com sucesso!");
        } catch (err) {
            console.error("Erro de Sincronização:", err);
            toast.error("Erro ao sincronizar com o banco de dados.");
        }
    };


    const documentosAgrupados = useMemo(() => {
        const filtrados = documentos.filter(d => {
            const setorDoc = d.setor?.toUpperCase().trim();
            const abaSelecionada = setorAtivo?.toUpperCase().trim();
            const role = roleUser?.toUpperCase().trim();
            const rh = roleUser === "RECURSOS HUMANOS";

            const temAcessoTotal = isAdmin || rh || role === "RECURSOS HUMANOS";

            if (!d.titulo.toLowerCase().includes(busca.toLowerCase())) return false;

            if (temAcessoTotal) {
                return setorDoc === abaSelecionada;
            }

            const ehRegrasGerais = setorDoc === "REGRAS GERAIS";
            const ehProprioSetor = setorDoc === role;

            return setorDoc === abaSelecionada && (ehRegrasGerais || ehProprioSetor);
        });

        const agrupados = filtrados.reduce((acc, doc) => {
            const nomePasta = (doc.PastaArquivos || doc.tipo).toUpperCase();
            if (!acc[nomePasta]) acc[nomePasta] = [];
            acc[nomePasta].push(doc);
            return acc;
        }, {} as Record<string, Documento[]>);

        Object.keys(agrupados).forEach(pasta => {
            agrupados[pasta].sort((a, b) => {
                if (ordem === "PADRAO") return (a.ordem_manual || 0) - (b.ordem_manual || 0);
                if (ordem === "recentes") return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
                if (ordem === "az") return a.titulo.localeCompare(b.titulo);
                if (ordem === "za") return b.titulo.localeCompare(a.titulo);
                return 0;
            });
        });

        return agrupados;
    }, [documentos, setorAtivo, busca, isAdmin, rh, roleUser, ordem]); // Adicionado rh e isAdmin aqui




    const pastasOrdenadas = useMemo(() => {
        return Object.keys(documentosAgrupados).sort((a, b) => {
            if (ordem === "az") return a.localeCompare(b);
            if (ordem === "za") return b.localeCompare(a);
            return 0;
        });
    }, [documentosAgrupados, ordem]);


    const [pdfHeight, setPdfHeight] = useState("1000px");

    useEffect(() => {
        if (docSelecionado && docSelecionado.tipo !== "VIDEO") {
            setPdfHeight("20000px");
        }
    }, [docSelecionado]);

    useEffect(() => {
        const chaves = Object.keys(documentosAgrupados);
        setOrdemPastas(chaves);
    }, [documentosAgrupados]);

    useEffect(() => {
        setOrdemPastas([]);
    }, [setorAtivo]);

    useEffect(() => {
        const sincronizarOrdem = async () => {
            const ordemSalva: string[] | null = await buscarOrdemPastas(ficharioAtivo);
            const pastasExistentes = Object.keys(documentosAgrupados);
    
            if (ordemSalva && Array.isArray(ordemSalva)) {
                const ordemFiltrada = ordemSalva.filter((p: string) => pastasExistentes.includes(p));
                const novasPastas = pastasExistentes.filter((p: string) => !ordemSalva.includes(p));
                
                setOrdemPastas([...ordemFiltrada, ...novasPastas]);
            } else {
                setOrdemPastas(pastasExistentes);
            }
        };
    
        if (ficharioAtivo) sincronizarOrdem();
    }, [ficharioAtivo, documentosAgrupados]);
    
    

    
    useEffect(() => {
        const carregarPostas = async () => {
            const ordem = await buscarOrdemPastas(ficharioAtivo);
            setOrdemPastas(ordem || Object.keys(documentosAgrupados));
        };
        carregarPostas();
    }, [ficharioAtivo]); 
    



    if (loadingDocs) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse">SINCRONIZANDO ESTRUTURA...</div>;

    return (

        <>
            <style dangerouslySetInnerHTML={{
                __html: `
            @media print { body { display: none !important; } }
            .no-select { user-select: none; -webkit-user-drag: none; }
          `}} />

            <div className="bg-slate-950 p-2">
                <div className="bg-slate-950 w-50">
                    <BotaoVoltar />
                </div>
            </div>
            <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 select-none">

                <style jsx global>{`
                @media print {
                    body { display: none !important; }
                    }
                    `}</style>

                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="p-5 bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-xl flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter">POP</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Acesso: <span className="text-blue-400">{roleUser}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {SETORES.map(s => {
                                const podeVer = isAdmin || s === "REGRAS GERAIS" || roleUser === s || rh;
                                if (!podeVer) return null;
                                return (
                                    <button key={s} onClick={() => { setSetorAtivo(s); setDocSelecionado(null); }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${setorAtivo === s ? "bg-blue-600 text-white scale-105" : "text-slate-500 hover:bg-white/5"}`}>{s}</button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
                        <div className="lg:col-span-4 bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 flex flex-col backdrop-blur-md">
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-3.5 text-slate-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/50"
                                />
                            </div>

                            {/* BOTÕES DE FILTRO RÁPIDO */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                <button
                                    onClick={() => setOrdem("PADRAO")}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${ordem === 'PADRAO' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    <Star size={10} className="inline mr-1" /> Padrão (Manual)
                                </button>
                                <button
                                    onClick={() => setOrdem("recentes")}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${ordem === 'recentes' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    Recentes
                                </button>
                                <button
                                    onClick={() => setOrdem("az")}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${ordem === 'az' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    A-Z
                                </button>

                                <button
                                    onClick={() => setOrdem("za")}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${ordem === 'za' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    A-Z
                                </button>
                            </div>


                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {(ordemPastas.length > 0 ? ordemPastas : Object.keys(documentosAgrupados)).map((pasta, index) => {
                                    const docs = documentosAgrupados[pasta];
                                    if (!docs) return null;

                                    return (
                                        /* 2. CADA PASTA (AQUI SIM OS EVENTOS FUNCIONAM) */
                                        <div
                                            key={pasta}
                                            draggable
                                            onDragStart={(e) => {
                                                setIsArrastando(true);
                                                if (ordemPastas.length === 0) setOrdemPastas(Object.keys(documentosAgrupados));
                                                e.dataTransfer.setData("index", index.toString());
                                            }}
                                            onDragEnd={() => {
                                                setIsArrastando(false);
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={async (e) => {
                                                setIsArrastando(false);
                                                const deIndex = parseInt(e.dataTransfer.getData("index"));
                                                const paraIndex = index;

                                                const listaBase = ordemPastas.length > 0 ? [...ordemPastas] : Object.keys(documentosAgrupados);
                                                const novaLista = [...listaBase];
                                                const [itemRemovido] = novaLista.splice(deIndex, 1);
                                                novaLista.splice(paraIndex, 0, itemRemovido);

                                                setOrdemPastas(novaLista);

                                                const res = await salvarOrdemPastas(ficharioAtivo, novaLista);

                                                if (res.success) {
                                                    toast.success("Ordem das pastas salva!");
                                                } else {
                                                    toast.error("Erro ao persistir ordem no banco.");
                                                }
                                            }}


                                            className="space-y-1 group/pasta relative cursor-grab active:cursor-grabbing"
                                        >
                                            {/* CONTEÚDO DA PASTA*/}
                                            <div className="relative flex items-center">
                                                <button
                                                    onClick={() => setPastasAbertas((p: any) => ({ ...p, [pasta]: !p[pasta] }))}
                                                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-slate-900 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Folder size={16} className={pastasAbertas[pasta] ? "text-blue-500" : "text-slate-600"} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{pasta}</span>
                                                    </div>
                                                    <ChevronRight size={14} className={`transition-transform duration-300 ${pastasAbertas[pasta] ? "rotate-90" : "mr-6"}`} />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPastaConfig(pasta);
                                                    }}
                                                    className="mr-4 absolute right-10 opacity-0 group-hover/pasta:opacity-100 p-2 hover:bg-blue-600/20 rounded-lg transition-all text-slate-500 hover:text-blue-400 z-10"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                            </div>

                                            {/* ARQUIVOS INTERNOS */}
                                            {pastasAbertas[pasta] && (
                                                <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                                                    {docs.map(doc => (
                                                        <button
                                                            key={doc.id}
                                                            onClick={() => setDocSelecionado(doc)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-[9px] font-bold uppercase transition-all ${docSelecionado?.id === doc.id ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:bg-white/5"}`}
                                                        >
                                                            <span className="truncate">{doc.titulo}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        <div className="lg:col-span-8 bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col relative shadow-2xl">
                            {docSelecionado ? (
                                <>

                                    <div className="lg:col-span-8 bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col relative shadow-2xl h-[750px]">
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                                @media print { body { display: none !important; } iframe { visibility: hidden !important; } }
                                                * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
                                            `}}
                                        />


                                        {docSelecionado ? (
                                            <>
                                                <div className="lg:col-span-8 bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col relative shadow-2xl h-[750px]">
                                                    <style dangerouslySetInnerHTML={{
                                                        __html: docSelecionado?.protecao === "ATIVO" ? `
                    * { -webkit-user-select: none !important; user-select: none !important; }
                    @media print { body { display: none !important; } }
                ` : ""
                                                    }} />

                                                    {docSelecionado ? (
                                                        <>
                                                            <div className="p-4 bg-black/60 border-b border-white/5 flex justify-between items-center px-8">
                                                                <div className="flex items-center gap-3">
                                                                    <Lock size={14} className={docSelecionado.protecao === "ATIVO" ? "text-blue-500" : "text-emerald-500"} />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${docSelecionado.protecao === "ATIVO" ? "text-blue-400" : "text-emerald-400"}`}>
                                                                        {docSelecionado.titulo}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-5">
                                                                    <div className={`flex items-center gap-2 text-[8px] font-black uppercase ${docSelecionado.protecao === "ATIVO" ? "text-red-500/40" : "text-emerald-500/60"}`}>
                                                                        {docSelecionado.protecao === "ATIVO" ? <><ShieldAlert size={12} /> Arquivo Restrito</> : <><Globe size={12} /> Arquivo Livre</>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 bg-white overflow-auto relative">
                                                                {docSelecionado.tipo === "VIDEO" ? (
                                                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                                                        <video
                                                                            controls
                                                                            className="w-full h-auto max-h-full"
                                                                            src={docSelecionado.url}
                                                                            style={{
                                                                                maxHeight: 'calc(750px - 120px)',
                                                                                width: 'auto',
                                                                                maxWidth: '100%'
                                                                            }}
                                                                        />
                                                                        {docSelecionado.protecao === "ATIVO" && (
                                                                            <div
                                                                                className="absolute inset-0"
                                                                                style={{ backgroundColor: 'transparent' }}
                                                                                onContextMenu={(e) => e.preventDefault()}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <AntiCapture
                                                                            screenshotPrevent={true}
                                                                            clipboardPrevent={true}
                                                                            devtoolsPrevent={true}
                                                                            userSelect={false}
                                                                        >

                                                                            <iframe
                                                                                key={docSelecionado.id}
                                                                                src={docSelecionado.protecao ===

                                                                                    "ATIVO"
                                                                                    ? `${docSelecionado.url}#toolbar=0&navpanes=0&scrollbar=1`
                                                                                    : `${docSelecionado.url}#toolbar=1&navpanes=1&scrollbar=1`
                                                                                }
                                                                                className={`w-full border-none ${docSelecionado.protecao !== "ATIVO" ? 'documento-liberado' : ''}`}
                                                                                style={{
                                                                                    height: '20000px',
                                                                                    width: '100%',
                                                                                    pointerEvents: docSelecionado.protecao === "ATIVO" ? 'none' : 'auto'
                                                                                }}
                                                                                title={docSelecionado.titulo}
                                                                            />
                                                                        </AntiCapture>

                                                                        {docSelecionado.protecao === "ATIVO" && (
                                                                            <div
                                                                                className="absolute inset-0"
                                                                                style={{ backgroundColor: 'transparent' }}
                                                                                onContextMenu={(e) => e.preventDefault()}
                                                                                onMouseDown={(e) => e.preventDefault()}
                                                                                onMouseUp={(e) => e.preventDefault()}
                                                                                onClick={(e) => e.preventDefault()}
                                                                            />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className="absolute bottom-6 right-6 z-10 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl pointer-events-none">
                                                                <div className={`h-1.5 w-1.5 rounded-full ${docSelecionado.protecao === "ATIVO" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>
                                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                                    {docSelecionado.protecao === "ATIVO" ? "Cópia Bloqueada" : "Acesso Liberado"}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                                                            <Eye size={80} className="mb-4" />
                                                            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Aguardando Seleção</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                                                <Eye size={80} className="mb-4" />
                                                <p className="text-[12px] font-black uppercase tracking-[0.5em]">Aguardando Seleção</p>
                                            </div>
                                        )}
                                    </div>

                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-20"><Eye size={80} className="mb-4" /><p className="text-[12px] font-black uppercase tracking-[0.5em]">Aguardando Seleção</p></div>
                            )}

                            {modalExcluir && (
                                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/90">

                                    <div className="absolute inset-0 bg-red-900/5 animate-pulse" />

                                    <div className="relative bg-slate-950 border-2 border-red-500/20 p-8 rounded-[3rem] max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300">

                                        <div className="flex flex-col items-center mb-8 text-center">
                                            <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
                                                <ShieldAlert size={44} className="text-red-500 animate-bounce" />
                                            </div>
                                            <h2 className="text-[14px] font-black uppercase text-white tracking-[0.3em] italic">
                                                AUTENTICAÇÃO <span className="text-red-500">MESTRA</span>
                                            </h2>
                                            <div className="h-1 w-12 bg-red-600 my-3 rounded-full" />
                                            <p className="text-[10px] text-slate-500 font-black uppercase leading-relaxed tracking-tighter">
                                                Ação crítica detectada. Insira a chave de segurança para mover ao histórico inativo.
                                            </p>
                                        </div>

                                        <input
                                            type="password"
                                            autoFocus
                                            placeholder="••••••••"
                                            value={senhaInput}
                                            onChange={e => setSenhaInput(e.target.value)}
                                            className="w-full bg-black border-2 border-white/5 rounded-[1.5rem] px-5 py-5 text-center tracking-[1em] text-white outline-none mb-6 focus:border-red-600 transition-all shadow-inner placeholder:tracking-normal placeholder:text-slate-800 font-mono"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => { setModalExcluir(false); setSenhaInput(""); }}
                                                className="py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                                            >
                                                Abortar
                                            </button>
                                            <button
                                                onClick={handleExcluirLogico}
                                                className="py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-900/40 transition-all active:scale-95"
                                            >
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                {pastaConfig && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
                        <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
                            <header className="flex flex-col items-center mb-8 text-center">
                                <div className="h-1.5 w-16 bg-blue-600 rounded-full mb-6"></div>
                                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Configurar Pasta: {pastaConfig}</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Organize a ordem e edite os títulos abaixo</p>
                            </header>

                            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                                {documentosAgrupados[pastaConfig]?.map((doc, index) => (
                                    <div key={doc.id} className="flex items-center gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => {
                                                    const listaDaPasta = [...documentosAgrupados[pastaConfig!]];
                                                    if (index === 0) return;
                                                    const temp = listaDaPasta[index - 1];
                                                    listaDaPasta[index - 1] = listaDaPasta[index];
                                                    listaDaPasta[index] = temp;
                                                    const novosDocs = documentos.map(d => {
                                                        const idx = listaDaPasta.findIndex(item => item.id === d.id);
                                                        return idx !== -1 ? { ...d, ordem_manual: idx } : d;
                                                    });
                                                    setDocumentos(novosDocs);
                                                    setOrdem("PADRAO");
                                                }}
                                                className="p-1 hover:bg-blue-600/20 rounded text-slate-600 hover:text-blue-400"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const listaDaPasta = [...documentosAgrupados[pastaConfig!]];
                                                    if (index === listaDaPasta.length - 1) return;
                                                    const temp = listaDaPasta[index + 1];
                                                    listaDaPasta[index + 1] = listaDaPasta[index];
                                                    listaDaPasta[index] = temp;
                                                    const novosDocs = documentos.map(d => {
                                                        const idx = listaDaPasta.findIndex(item => item.id === d.id);
                                                        return idx !== -1 ? { ...d, ordem_manual: idx } : d;
                                                    });
                                                    setDocumentos(novosDocs);
                                                    setOrdem("PADRAO");
                                                }}
                                                className="p-1 hover:bg-blue-600/20 rounded text-slate-600 hover:text-blue-400"
                                            >
                                                <ChevronDown size={16} />
                                            </button>


                                        </div>

                                        <div className="flex-1">
                                            <input
                                                value={doc.titulo}
                                                onChange={(e) => {
                                                    const novoTitulo = e.target.value.toUpperCase();
                                                    setDocumentos(prev => prev.map(d => d.id === doc.id ? { ...d, titulo: novoTitulo } : d));
                                                }}
                                                className="w-full bg-transparent border-none text-xs font-black uppercase text-slate-200 outline-none focus:text-blue-400 transition-colors"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setModalExcluir(true)}
                                            className="cursor-pointer px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all text-[9px] font-black uppercase border border-red-600/20 flex items-center gap-2 relative z-[70]"
                                        >
                                            <Trash2 size={14} /> Desativar
                                        </button>
                                        <div className="text-[10px] font-black text-blue-600 opacity-30 group-hover:opacity-100">
                                            #{index + 1}

                                        </div>

                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button
                                    onClick={() => { setPastaConfig(null); carregarDocumentos(); }}
                                    className="py-5 bg-white/5 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={async () => {
                                        setLoadingDocs(true);
                                        const docsParaSalvar = documentosAgrupados[pastaConfig!];
                                        try {
                                            await fetch('/api/documentos/ordenar', {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                    documentos: docsParaSalvar.map((d, i) => ({ id: d.id, titulo: d.titulo, ordem: i }))
                                                }),
                                            });
                                            toast.success("Pasta sincronizada com sucesso!");
                                            setPastaConfig(null);
                                        } catch (err) {
                                            toast.error("Erro ao salvar alterações");
                                        } finally {
                                            setLoadingDocs(false);
                                        }
                                    }}
                                    className="py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all"
                                >
                                    Salvar Mudanças
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MARCA D'ÁGUA DINÂMICA */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden select-none flex flex-wrap gap-20 p-10 rotate-[-15deg]">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <span key={i} className="text-white font-black text-2xl uppercase tracking-widest">
                            {session?.user?.nome || "ACESSO RESTRITO ALPHA"}
                        </span>
                    ))}
                </div>


            </div>

        </>



    );

}
