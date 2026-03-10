"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/temas";

let audioGlobal: HTMLAudioElement | null = null;
if (typeof window !== "undefined") {
    audioGlobal = new Audio("/sounds/notification.mp3");
    audioGlobal.preload = "auto";
}

export function NotificacaoFlutuante() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const ultimaMsgId = useRef<number | null>(null);


    const temaNome = (session?.user as any)?.tema_interface || "blue";
    const style = getTema(temaNome);

    const checkNovasMensagens = useCallback(async () => {
        if (status !== "authenticated" || !session?.user?.id) return;

        try {
            const res = await fetch(`/api/notificacoes?v=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });
            const msg = await res.json();

            if (!msg || msg.nenhum) {
                ultimaMsgId.current = null;
                return;
            }

            if (msg.id && msg.id !== ultimaMsgId.current) {
                ultimaMsgId.current = msg.id;

                if (audioGlobal) {
                    audioGlobal.pause();
                    audioGlobal.currentTime = 0;
                    audioGlobal.volume = 0.8;
                    const playPromise = audioGlobal.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                }

                toast.custom((t) => (
                    <div
                        onClick={() => {
                            router.push(`/PainelAlpha/Chamados/${msg.chamadoId}`);
                            toast.dismiss(t);
                        }}
                        className={`w-[350px] bg-slate-950 border ${style.border} p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl cursor-pointer hover:scale-105 transition-all group relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 left-0 w-1 h-full ${style.bg}`} />
                        <div className="flex items-start gap-4">
                            <div className={`p-3 ${style.glow} rounded-2xl ${style.text} group-hover:rotate-12 transition-transform`}>
                                <MessageSquare size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${style.text} mb-1`}>Alerta de Transmissão</p>
                                <p className="text-xs font-bold text-white truncate">
                                    {msg.autor?.nome}: <span className="text-slate-500 font-medium italic">"{msg.texto?.substring(0, 25)}..."</span>
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-[8px] font-black text-slate-600 uppercase truncate pr-4">Ref: {msg.chamado?.titulo}</p>
                                    <ArrowRight size={12} className={style.text} />
                                </div>
                            </div>
                        </div>
                    </div>
                ), { duration: 5000, id: `msg-${msg.id}` });
            }
        } catch (e) { }
    }, [session, status, router, style]);


    useEffect(() => {
        const interval = setInterval(checkNovasMensagens, 1000);
        return () => clearInterval(interval);
    }, [checkNovasMensagens]);

    return null;
}
