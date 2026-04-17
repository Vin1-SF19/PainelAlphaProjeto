"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Play, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ModuloModal({ modulo, videos, onClose }: any) {
  const router = useRouter();

  const aulasDoModulo = videos.filter((v: any) => 
    v.modulo?.some((m: any) => m.id === modulo.id) || v.moduloId === modulo.id
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-6xl h-[92vh] md:h-auto max-h-[90vh] bg-[#0A0A0A] rounded-t-[3rem] md:rounded-[3.5rem] border-t md:border border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">
          {/* LADO ESQUERDO: INFO */}
          <div className="w-full md:w-2/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-orange-600/5 to-transparent">
            <button onClick={onClose} className="mb-8 p-3 bg-white/5 hover:bg-orange-600 rounded-full text-white transition-all">
              <X size={24} />
            </button>
            <span className="text-orange-500 font-black uppercase tracking-widest text-xs block mb-4">Setor {modulo.setor}</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">{modulo.nome}</h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">{modulo.descricao}</p>

            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase text-slate-500">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full"><Clock size={14} /> Conteúdo Cloud</div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full"><Play size={14} /> {aulasDoModulo.length} Aulas</div>
            </div>
          </div>

          {/* LADO DIREITO: PREVIEW/ACTION */}
          <div className="flex-1 p-6 md:p-12 bg-black/40 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push(`/PainelAlpha/AlphaSkills/modulo/${modulo.id}`)}
              className="relative w-full max-w-lg aspect-video rounded-[2rem] bg-[#050505] border border-orange-500/30 overflow-hidden cursor-pointer group/preview"
            >
              <div className="absolute inset-0 bg-orange-600/0 group-hover/preview:bg-orange-600/10 transition-colors flex items-center justify-center">
                <div className="bg-orange-600 text-white px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">
                  Acessar Treinamento
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}