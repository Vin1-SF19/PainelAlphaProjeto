"use client";

import React, { useState } from 'react';
import { Play, Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Estrutura de dados inicial
const INITIAL_DATA = [
  {
    setor: "Comercial",
    videos: [
      { id: 1, title: "Prospecção Ativa", url: "youtube.com/...", thumb: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400" },
      { id: 2, title: "Fechamento de Contrato", url: "youtube.com/...", thumb: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400" },
    ]
  },
  {
    setor: "Operacional",
    videos: [
      { id: 3, title: "Habilitação Radar", url: "youtube.com/...", thumb: "https://images.unsplash.com/photo-1586864387917-f5383526ba1d?w=400" },
    ]
  }
];

export default function AlphaSkills({ isAdmin = true }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  const deleteVideo = (setorIdx: number, videoId: number) => {
    const newData = [...data];
    newData[setorIdx].videos = newData[setorIdx].videos.filter(v => v.id !== videoId);
    setData(newData);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase text-orange-500 italic">Alpha Skills</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">------------------------------------</p>
        </div>
        {isAdmin && (

          <Link href="/PainelAlpha/AlphaSkills/Gerenciamento">
          <button
           className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-orange-500 hover:text-white transition-all">
            <Plus size={16} /> Adicionar Vídeo
          </button>
             </Link>
        )}
      </header>

      {/* RENDERIZAÇÃO DOS SETORES (CARROSSEL) */}
      <div className="space-y-16">
        {data.map((setorObj, sIdx) => (
          <div key={setorObj.setor} className="relative">
            <h2 className="text-xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-orange-500"></span>
              {setorObj.setor}
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide no-scrollbar snap-x">
              {setorObj.videos.map((video) => (
                <div 
                  key={video.id} 
                  className="min-w-[300px] group relative snap-start"
                >
                  {/* THUMBNAIL */}
                  <div 
                    onClick={() => setPlayingVideo(video)}
                    className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer border border-white/5 group-hover:border-orange-500/50 transition-all"
                  >
                    <img src={video.thumb} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-orange-500 p-4 rounded-full shadow-xl shadow-orange-500/20">
                        <Play fill="white" size={20} />
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="mt-4 flex justify-between items-start">
                    <h3 className="text-sm font-bold uppercase tracking-tight text-slate-300">{video.title}</h3>
                    {isAdmin && (
                      <button 
                        onClick={() => deleteVideo(sIdx, video.id)}
                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl aspect-video bg-black relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={24} />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              
              <p className="text-orange-500 font-black italic">VIDEO PLAYER: {playingVideo.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}