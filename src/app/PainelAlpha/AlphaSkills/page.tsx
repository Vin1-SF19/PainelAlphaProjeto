"use client";

import React, { useState } from 'react';
import { Play, Book, Clock, ChevronRight, Layout, Monitor, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock de dados organizados por setores
const ACADEMY_DATA = [
  {
    setor: "Comercial",
    icon: <Users size={20} />,
    cursos: [
      {
        id: "vendas-1",
        titulo: "Prospecção Alpha",
        duracao: "4h 20min",
        modulosCount: 5,
        progresso: 100,
        modulos: [
          { titulo: "Introdução ao B2B", aulas: ["O que é Radar?", "Perfil de Cliente"] },
          { titulo: "Abordagem Inicial", aulas: ["Script de Ligação", "Quebra de Objeções"] }
        ]
      }
    ]
  },
  {
    setor: "Operacional",
    icon: <Shield size={20} />,
    cursos: [
      {
        id: "radar-1",
        titulo: "Habilitação de Radar Siscomex",
        duracao: "6h 15min",
        modulosCount: 8,
        progresso: 45,
        modulos: [
          { titulo: "Fundamentos Aduaneiros", aulas: ["Tipos de Radar", "Documentação"] }
        ]
      }
    ]
  }
];

export default function AlphaSkills() {
  const [setorAtivo, setSetorAtivo] = useState("Comercial");

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      
      {/* SIDEBAR DE SETORES */}
      <aside className="w-64 border-r border-white/5 p-6 space-y-8">
        <div className="mb-10">
           <h2 className="text-xl font-black italic text-orange-500 uppercase">Alpha Skills</h2>
           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Plataforma de Treinamento</p>
        </div>

        <nav className="space-y-2">
          {ACADEMY_DATA.map((item) => (
            <button
              key={item.setor}
              onClick={() => setSetorAtivo(item.setor)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                setorAtivo === item.setor 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-xs font-black uppercase tracking-tighter">{item.setor}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Cursos de <span className="text-orange-500">{setorAtivo}</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {ACADEMY_DATA.find(s => s.setor === setorAtivo)?.cursos.map((curso) => (
              <CourseCard key={curso.id} curso={curso} />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function CourseCard({ curso }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 group hover:border-orange-500/50 transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
          <Monitor size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-600 uppercase bg-white/5 px-3 py-1 rounded-full">
           {curso.duracao}
        </span>
      </div>

      <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 leading-tight">
        {curso.titulo}
      </h3>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1 text-slate-500">
          <Book size={12} />
          <span className="text-[10px] font-bold">{curso.modulosCount} Módulos</span>
        </div>
        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
           <div className="h-full bg-orange-500" style={{ width: `${curso.progresso}%` }} />
        </div>
        <span className="text-[10px] font-black italic">{curso.progresso}%</span>
      </div>

      <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2">
        Acessar Curso <ChevronRight size={14} />
      </button>
    </motion.div>
  );
}