"use client"

import { X, Send } from 'lucide-react';
import { useBibble } from "@/context/BibbleContext";
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { createChamadoAction } from '@/actions/chamados';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

const FALAS_RETORNO_FELIZ = [
  "Voltei! Tava dando um trato no pelo, é assim que fico com esse visual bonitao.",
  "Estava ali resolvendo uns bugs de cota do Google. De nada.",
  "Dei uma volta pra esticar as pernas virtuais. O que eu perdi?",
  "Fui ali ver se o servidor ainda tava de pé. Tava. Infelizmente."
];

const FALAS_RETORNO_TRISTE = [
  "Voltei... Fui tentar resolver um problema no código e estraguei mais do que já tava. Espero que o Vini não perceba.",
  "Tentei falar com o suporte do Google. Eles me xingaram em binário.",
  "Fui ali e descobri que o código do painel foi escrito por estagiários cansados. Que depressão.",
  "O mundo lá fora é assustador. Tem gente que não usa modo escuro."
];

export default function BibbleChat({ dadosAtuais }: any) {
  const { data: session } = useSession();
  const { contextoExtra } = useBibble();
  const pathname = usePathname();

  const isAdmin = session?.user.role === "Admin";



  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bibble', text: 'E aí? Eu me chamo Bibble. Vai ficar aí olhando ou vai perguntar algo sobre esse painel?' }]);
  const [loading, setLoading] = useState(false);
  const [bibbleStatus, setBibbleStatus] = useState<'idle' | 'thinking' | 'angry' | 'error' | 'walking' | 'happy' | 'sad' | 'hidden'>('idle');

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bibbleImages: any = {
    idle: ['/assets/bibble/bibble-idle2.png'],
    thinking: ['/assets/bibble/bibble-thinking.png'],
    angry: ['/assets/bibble/bibble-angry.png'],
    error: ['/assets/bibble/bibble-sad.png'],
    walking: [
      '/assets/bibble/walking/walk-1.png',
      '/assets/bibble/walking/walk-2.png',
      '/assets/bibble/walking/walk-3.png',
      '/assets/bibble/walking/walk-4.png',
      '/assets/bibble/walking/walk-5.png',
      '/assets/bibble/walking/walk-6.png',
      '/assets/bibble/walking/walk-7.png',
      '/assets/bibble/walking/walk-8.png',
      '/assets/bibble/walking/walk-9.png'
    ],
    happy: ['/assets/bibble/bibble-excited.png'],
    sad: ['/assets/bibble/bibble-sad.png'],
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (bibbleStatus === 'hidden') return;
    const frames = bibbleImages[bibbleStatus] || bibbleImages.idle;
    if (frames.length <= 1) {
      setCurrentFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [bibbleStatus]);

  const getRandomPosition = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const margin = 100;
    const x = Math.random() * (window.innerWidth - 400) + 50;
    const y = Math.random() * (window.innerHeight - 400) + 50;
    return { x, y };
  };

  const decidirProximaAcao = () => {
    if (isOpen || speechBubble) return;

    const acoes = ['walk', 'idle', 'go_hide', 'talk_random'];
    const decisao = acoes[Math.floor(Math.random() * acoes.length)];

    switch (decisao) {
      case 'walk':
        const novaPos = getRandomPosition();
        setBibbleStatus('walking');
        setPosition(novaPos);
        setTimeout(() => setBibbleStatus('idle'), 3000);
        break;
      case 'go_hide':
        setBibbleStatus('hidden');
        setTimeout(reaparecer, Math.random() * 40000 + 20000);
        return;
      case 'talk_random':
        const falas = ["O tédio me consome.", "Vini, desliga esse servidor e vamos pra praia.", "Alguém abre um chamado, por favor."];
        setSpeechBubble(falas[Math.floor(Math.random() * falas.length)]);
        setTimeout(() => setSpeechBubble(null), 8000);
        break;
      default:
        setBibbleStatus('idle');
    }

    setTimeout(decidirProximaAcao, Math.random() * 15000 + 10000);
  };

  const reaparecer = () => {
    const humor = Math.random() > 0.5 ? 'happy' : 'sad';
    const fala = humor === 'happy' 
      ? FALAS_RETORNO_FELIZ[Math.floor(Math.random() * FALAS_RETORNO_FELIZ.length)]
      : FALAS_RETORNO_TRISTE[Math.floor(Math.random() * FALAS_RETORNO_TRISTE.length)];
    
    setPosition(getRandomPosition());
    setBibbleStatus(humor);
    setSpeechBubble(fala);
    setTimeout(() => {
      setSpeechBubble(null);
      setBibbleStatus('idle');
      decidirProximaAcao();
    }, 10000);
  };

  useEffect(() => {
    setPosition({ x: window.innerWidth - 400, y: window.innerHeight - 400 });
    const timer = setTimeout(decidirProximaAcao, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
  
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    setBibbleStatus('thinking');
  
    try {
      const res = await fetch('/api/ChatBot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          contextData: {
            ...contextoExtra,
            urlAtual: window.location.pathname
          }
        }),
      });
  
      if (!res.ok) {
        setMessages(prev => [...prev, { 
          role: 'bibble', 
          text: "Tive um soluço aqui. Pode repetir? (O Google me bloqueou temporariamente)." 
        }]);
        setBibbleStatus('idle');
        setLoading(false);
        return; 
      }
  
      const data = await res.json();
      let textoBibble = data.text;
  
      if (textoBibble && textoBibble.includes("[CRIAR_CHAMADO:")) {
        const regex = /\[CRIAR_CHAMADO: (.*?)\]/;
        const match = textoBibble.match(regex);
  
        if (match) {
          try {
            const dadosJson = JSON.parse(match[1]);
            const formData = new FormData();
            formData.append("titulo", dadosJson.titulo);
            formData.append("prioridade", dadosJson.prioridade);
            formData.append("categoria", "SUPORTE");
            formData.append("descricao", "Aberto automaticamente via Bibble Chat.");
  
            await createChamadoAction(formData);
            textoBibble = textoBibble.replace(regex, "\n\n✅ *Chamado registrado e Vinicius avisado no WhatsApp!*");
          } catch (jsonError) {
            console.error("Erro no processamento do chamado silencioso.");
          }
        }
      }
  
      setMessages(prev => [...prev, { role: 'bibble', text: textoBibble }]);
      setBibbleStatus('angry');
      setTimeout(() => setBibbleStatus('idle'), 5000);
  
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'bibble', 
        text: "Vini, deu algum erro na rede. Vou fingir que nada aconteceu, tenta de novo!" 
      }]);
      setBibbleStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] font-sans">
      <AnimatePresence>
        {isOpen ? (
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <div className="w-[350px] h-[550px] bg-slate-900 border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
              <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={bibbleImages[bibbleStatus]?.[currentFrame] || bibbleImages.idle[0]}
                        alt="Bibble"
                        className={`w-12 h-12 object-contain ${loading ? 'animate-pulse' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black italic uppercase text-xs tracking-widest text-white">Bibble AI</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {loading ? 'Processando recalque...' : 'Online e Sarcástico'}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-slate-950/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-top-2`}>
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none font-medium' : 'bg-slate-800 text-slate-100 border border-white/10 rounded-tl-none font-normal'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-3 ml-2">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 shadow-lg">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-slate-900 border-t border-white/10">
                <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 focus-within:border-indigo-500/50 transition-all">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Mande seu deboche aqui..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                  />
                  <button onClick={sendMessage} disabled={loading} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          bibbleStatus !== 'hidden' && (
            <motion.div
              initial={false}
              animate={{ x: position.x, y: position.y }}
              transition={{ x: { duration: 3, ease: "easeInOut" }, y: { duration: 3, ease: "easeInOut" } }}
              className="absolute pointer-events-auto flex flex-col items-center"
            >
              <AnimatePresence>
                {(isHovered || speechBubble) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-[100%] mb-4 bg-white text-slate-900 px-6 py-4 rounded-[2rem] font-bold text-sm shadow-2xl border-2 border-indigo-500 whitespace-nowrap z-[210]"
                  >
                    {speechBubble || "Clica logo, não tenho o dia todo! 🙄"}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-indigo-500"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="cursor-pointer w-[200px] h-[200px] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 outline-none"
              >
                <img
                  src={bibbleImages[bibbleStatus]?.[currentFrame] || bibbleImages.idle[0]}
                  alt="Bibble Mascote"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}