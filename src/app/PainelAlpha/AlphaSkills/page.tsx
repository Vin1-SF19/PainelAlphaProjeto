"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Play, Settings, Search, ChevronRight, X, Clock, LayoutGrid, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getModulos, getVideos } from '@/actions/GetVideos';

export default function AlphaSkillsViewer({ isAdmin = true }) {
    const [modulos, setModulos] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModulo, setSelectedModulo] = useState<any>(null);
    const [playingVideo, setPlayingVideo] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [mods, vids] = await Promise.all([getModulos(), getVideos()]);
            setModulos(mods);
            setVideos(vids);
            setLoading(false);
        };
        fetchData();
    }, []);

    const setores = useMemo(() => {
      
      const listaSetoresUnicos = Array.from(new Set(
          modulos.flatMap(m => m.setor.split(", "))
      )).sort();
  
      
      return listaSetoresUnicos.map(nomeSetor => ({
          nome: nomeSetor,
          items: modulos.filter(m => {
              const pertenceAoSetor = m.setor.split(", ").includes(nomeSetor);
              const matchesBusca = m.nome.toLowerCase().includes(searchTerm.toLowerCase());
              return pertenceAoSetor && matchesBusca;
          })
      })).filter(s => s.items.length > 0);
  }, [modulos, searchTerm]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
            
            <section className="relative h-[60vh] flex items-center px-8 md:px-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10" />
                
                <div className="absolute inset-0 opacity-40">
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070" 
                        className="w-full h-full object-cover scale-110 blur-sm"
                        alt="Background"
                    />
                </div>

                <div className="relative z-20 max-w-2xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                            Alpha Learning Experience
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">
                            Alpha<br/><span className="text-orange-500">Skills</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                            A plataforma definitiva de treinamento da Alpha. Domine as ferramentas, 
                            aperfeiçoe processos e escale sua performance.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="O que você quer aprender hoje?"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                            </div>
                            {isAdmin && (
                                <Link href="/PainelAlpha/AlphaSkills/Gerenciamento">
                                    <button className="bg-white text-black p-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all">
                                        <Settings size={20} />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TRILHAS POR SETOR */}
            <div className="px-8 md:px-16 -mt-20 pb-20 relative z-30 space-y-16">
                {setores.map((setor) => (
                    <div key={setor.nome} className="group/setor">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                {setor.nome}
                                <ChevronRight className="text-orange-500 group-hover/setor:translate-x-2 transition-transform" />
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {setor.items.map((mod) => (
                                <motion.div
                                    key={mod.id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => setSelectedModulo(mod)}
                                    className="cursor-pointer group/card"
                                >
                                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/5 group-hover/card:border-orange-500/50 transition-all shadow-2xl bg-[#111]">
                                        {mod.imagemUrl ? (
                                            <img 
                                                src={mod.imagemUrl} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-orange-600/10">
                                                <LayoutGrid className="text-orange-500/20" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="text-lg font-black uppercase tracking-tight mb-1">{mod.nome}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-orange-500 uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                                    Explorar Módulo
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE VÍDEOS DO MÓDULO (ESTILO G4 EXPANDIDO) */}
            <AnimatePresence>
                {selectedModulo && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedModulo(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-6xl h-[90vh] md:h-auto bg-[#0A0A0A] rounded-t-[3rem] md:rounded-[3.5rem] border-t md:border border-white/10 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Lateral: Info do Módulo */}
                                <div className="w-full md:w-2/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-orange-600/5 to-transparent">
                                    <button 
                                        onClick={() => setSelectedModulo(null)}
                                        className="mb-8 p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                    
                                    <span className="text-orange-500 font-black uppercase tracking-widest text-xs block mb-4">Trilha {selectedModulo.setor}</span>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">{selectedModulo.nome}</h2>
                                    <p className="text-slate-400 leading-relaxed mb-8">{selectedModulo.descricao || "Aperfeiçoe suas habilidades com este conteúdo exclusivo."}</p>
                                    
                                    <div className="flex items-center gap-6 text-sm font-bold uppercase text-slate-500">
                                        <div className="flex items-center gap-2"><Clock size={16}/> 1h 20m</div>
                                        <div className="flex items-center gap-2"><Play size={16}/> {videos.filter(v => v.modulos?.some((m:any) => m.moduloId === selectedModulo.id)).length} Aulas</div>
                                    </div>
                                </div>

                                {/* Lista de Aulas */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                                    <div className="space-y-4">
                                        {videos
                                            .filter(v => v.modulos?.some((m:any) => m.moduloId === selectedModulo.id))
                                            .map((video, idx) => (
                                            <div 
                                                key={video.id}
                                                onClick={() => setPlayingVideo(video)}
                                                className="group flex items-center gap-6 p-4 rounded-3xl bg-white/5 hover:bg-orange-600 transition-all cursor-pointer"
                                            >
                                                <div className="text-2xl font-black text-white/20 group-hover:text-white/40 italic">{(idx + 1).toString().padStart(2, '0')}</div>
                                                <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-white/10">
                                                    <img src={video.thumbUrl || "/placeholder.png"} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <Play fill="white" size={16} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black uppercase tracking-tight text-sm group-hover:text-white">{video.titulo}</h4>
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-white/70">{video.tamanho || "Video HD"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PLAYER DE VÍDEO (FIXO) */}
            <AnimatePresence>
                {playingVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4"
                    >
                        <button 
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-8 right-8 text-white/50 hover:text-white z-10"
                        >
                            <X size={40} />
                        </button>
                        <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            <video 
                                src={playingVideo.url} 
                                controls 
                                autoPlay 
                                className="w-full h-full"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}