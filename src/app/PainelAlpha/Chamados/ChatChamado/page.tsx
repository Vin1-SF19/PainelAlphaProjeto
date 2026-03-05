"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Pusher from "pusher-js";
import {
    MessageSquare, Send, Loader2, X, Paperclip,
    FileText, Image as ImageIcon, Download, FileSpreadsheet,
    Clock, ShieldCheck
} from "lucide-react";
import { enviarMensagemAction, marcarComoLidaAction } from "@/actions/chamados";
import { toast } from "sonner";


export default function ChatChamado({ chamadoId, titulo, mensagensIniciais, contagem, status, usuarioAtualId, isAdmin }: any) {

    const [aberto, setAberto] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mensagens, setMensagens] = useState<any[]>(mensagensIniciais || []);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagensLidasNoMomento, setMensagensLidasNoMomento] = useState(contagem || 0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [novasNoFront, setNovasNoFront] = useState(contagem || 0);




    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        setMensagens(mensagensIniciais || []);
        setMensagensLidasNoMomento(contagem || 0);
    }, [chamadoId, contagem, mensagensIniciais]);

    useEffect(() => {
        if (aberto) {
            setMensagensLidasNoMomento(mensagens.length);
        }
    }, [aberto, mensagens.length]);

    useEffect(() => {
        if (!mounted || !chamadoId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            forceTLS: true
        });

        const canalNome = `chat-${chamadoId}`;
        const channel = pusher.subscribe(canalNome);

        channel.bind("nova-mensagem", (novaMsg: any) => {
            setMensagens((prev: any[]) => {
                if (prev.some(m => m.id === novaMsg.id)) return prev;
                return [...prev, novaMsg];
            });
        
            if (!aberto && novaMsg.autorId !== usuarioAtualId) {
                setNovasNoFront((prev: number) => prev + 1);
            }
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(canalNome);
            pusher.disconnect();
        };
    }, [mounted, chamadoId]);

    useEffect(() => {
        if (aberto && scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [aberto, mensagens]);

    useEffect(() => {
        if (aberto && novasNoFront > 0) {
            console.log("🔔 Limpando notificações do chamado:", chamadoId);

            setNovasNoFront(0);

            const limparNoBanco = async () => {
                const res = await marcarComoLidaAction(chamadoId, isAdmin);
                if (res.success) {
                    console.log("✅ Banco atualizado com sucesso!");
                }
            };

            limparNoBanco();
        }
    }, [aberto, chamadoId, isAdmin, novasNoFront]);


    const handleEnviar = async () => {
        if (!texto.trim() || enviando) return;
        setEnviando(true);
        const res = await enviarMensagemAction(chamadoId, texto);
        if (!res.success) toast.error("Erro ao transmitir mensagem");
        else setTexto("");
        setEnviando(false);
    };

    const renderAnexo = (url: string, tipo: string) => {
        const t = tipo?.toUpperCase() || "";
        const isImg = ["JPG", "PNG", "JPEG", "WEBP"].some(ext => t.includes(ext));
        const isPdf = t.includes("PDF");
        const isSheet = ["XLS", "CSV"].some(ext => t.includes(ext));

        if (isImg) return (
            <a href={url} target="_blank" className="block mt-3 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all shadow-xl">
                <img src={url} alt="Anexo" className="max-w-full h-auto object-cover max-h-64" />
            </a>
        );

        return (
            <a href={url} target="_blank" download className="flex items-center gap-3 mt-3 p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group">
                <div className="p-2 bg-white/5 rounded-lg">
                    {isPdf ? <FileText className="text-rose-500" size={20} /> :
                        isSheet ? <FileSpreadsheet className="text-emerald-500" size={20} /> :
                            <Paperclip className="text-slate-400" size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white uppercase truncate tracking-tighter">Documento anexado</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">{tipo}</p>
                </div>
                <Download size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </a>
        );
    };


    const temNotificacao = !aberto && novasNoFront > 0;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={() => setAberto(false)} />

            <div className="relative w-full max-w-2xl bg-[#0b1120] border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[85vh] animate-in zoom-in duration-300">

                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20 shadow-inner">
                            <MessageSquare className="text-amber-400" size={24} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Canal de Suporte</h3>
                                <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[280px]">#{chamadoId} • {titulo}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setAberto(false)}
                        className="cursor-pointer p-4 hover:bg-rose-500/10 rounded-2xl text-slate-500 hover:text-rose-500 transition-all border border-white/5 hover:border-rose-500/20 group"
                    >
                        <X size={24} className="cursor-pointer group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[#0b1120] bg-[url('/grid.svg')] bg-[length:20px_20px] bg-fixed"
                >
                    {mensagens.map((msg: any) => {
                        const isMe = msg.autorId === usuarioAtualId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                                    <div className="flex items-center gap-2 mb-1 px-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {isMe ? 'Você' : msg.autor?.nome}
                                        </span>
                                    </div>

                                    <div className={`relative p-4 shadow-2xl border transition-all ${isMe
                                        ? 'bg-amber-600 border-amber-500/30 text-white rounded-2xl rounded-tr-none shadow-amber-900/20'
                                        : 'bg-slate-800/80 border-white/5 text-slate-100 rounded-2xl rounded-tl-none backdrop-blur-sm'
                                        }`}>
                                        {msg.texto && (
                                            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                                                {msg.texto}
                                            </p>
                                        )}

                                        {msg.arquivoUrl && (
                                            <div className={msg.texto ? "mt-3 pt-3 border-t border-white/10" : ""}>
                                                {renderAnexo(msg.arquivoUrl, msg.arquivoTipo)}
                                            </div>
                                        )}

                                        <div className={`text-[8px] mt-2 font-bold uppercase opacity-50 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


                <div className="p-8 bg-slate-950/40 border-t border-white/5 backdrop-blur-xl">
                    {status !== "CONCLUIDO" ? (
                        <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-[2rem] p-2 focus-within:border-amber-500/50 transition-all shadow-inner">

                            <input
                                type="file"
                                id={`file-${chamadoId}`}
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setEnviando(

                                        true);
                                    const toastId = toast.loading("Enviando para o servidor...");

                                    try {

                                        const response = await fetch(`/api/chat/upload?filename=${encodeURIComponent(file.name)}`, {
                                            method: 'POST',
                                            body: file,
                                        });

                                        if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.error || "Erro no servidor de storage");
                                        }

                                        const newBlob = await response.json();


                                        const fileType = file.name.split('.').pop()?.toUpperCase() || "IMG";

                                        await enviarMensagemAction(chamadoId, "", newBlob.url, fileType);

                                        toast.success("Mídia enviada!", { id: toastId });
                                    } catch (err: any) {
                                        toast.error(`Falha: ${err.message}`, { id: toastId });
                                    } finally {
                                        setEnviando(false);
                                    }
                                }}

                            />

                            <label
                                htmlFor={`file-${chamadoId}`}
                                className="p-4 cursor-pointer hover:bg-white/5 rounded-[1.5rem] text-slate-500 hover:text-amber-400 transition-all active:scale-90"
                            >
                                <Paperclip size={22} />
                            </label>

                            <input
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                placeholder="Descreva sua resposta aqui..."
                                className="flex-1 bg-transparent px-2 py-3 text-sm outline-none text-white placeholder:text-slate-700 font-medium"
                                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                            />

                            <button
                                disabled={enviando || !texto.trim()}
                                onClick={handleEnviar}
                                className="cursor-pointer p-4 bg-amber-600 hover:bg-amber-500 rounded-[1.5rem] text-white shadow-xl shadow-amber-900/40 disabled:opacity-30 transition-all active:scale-95"
                            >
                                {enviando ? <Loader2 className="cursor-pointer w-6 h-6 animate-spin" /> : <Send size={22} />}
                            </button>
                        </div>
                    ) : (
                        <div className="py-6 text-center rounded-[2rem] bg-rose-500/5 border border-rose-500/10">
                            <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.3em] flex items-center justify-center gap-3">
                                <X size={14} className="animate-pulse" /> Protocolo Encerrado
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setAberto(true)}
                className={`cursor-pointer relative p-3.5 rounded-2xl transition-all duration-500 group border ${temNotificacao
                    ? "bg-amber-600/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/5 hover:border-amber-500/40"
                    }`}
            >
                <MessageSquare size={18} className={`${temNotificacao ? "text-amber-400 animate-pulse" : "text-slate-400 group-hover:text-amber-400"}`} />
                {temNotificacao && (
                    <>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full animate-ping opacity-40" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-950 z-10">
                            {novasNoFront}
                        </span>
                    </>
                )}
            </button>
            {aberto && mounted && createPortal(modalContent, document.body)}
        </>
    );
}
