"use client";

import React, { useState } from "react";
import { UploadCloud, FileCheck, Loader2, AlertCircle, ShieldCheck, ChevronLeft } from "lucide-react";
import { uploadDocumento } from "@/actions/UploadDocs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SETORES = ["OPERACIONAL", "COMERCIAL", "RECURSOS HUMANOS", "FINANCEIRO", "JURÍDICO", "PARCEIRO", "REGRAS GERAIS"];

export default function AdminUploadDocs() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return toast.error("Selecione um arquivo!");

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await uploadDocumento(formData);

      if (res.success) {
        toast.success("Documento enviado e salvo com sucesso!");
        setFile(null);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Falha no processamento.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER ESTILIZADO */}
        <header className="relative overflow-hidden bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UploadCloud size={100} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                  Central de Upload
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Diretório Estratégico
                </p>
              </div>
            </div>

            {/* BOTAO VOLTAR ARRUMADO */}
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
            >
              <ChevronLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Voltar</span>
            </button>
          </div>
        </header>

        {/* CONTAINER DO FORMULÁRIO */}
        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>
          
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest text-blue-400">Título do Documento</label>
                <input
                  name="titulo"
                  required
                  placeholder="EX: MANUAL DE ADMISSÃO V1"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest text-blue-400">Setor Destino</label>
                <select
                  name="setor"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-600/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950">SELECIONE O SETOR...</option>
                  {SETORES.map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                </select>
              </div>
            </div>

            {/* DROPZONE ESTILIZADA */}
            <div className="relative group">
              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-500 ${
                file 
                ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]" 
                : "border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/5"
              }`}>
                {file ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="p-4 bg-emerald-500/20 rounded-2xl mb-4">
                      <FileCheck className="text-emerald-500" size={40} />
                    </div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest text-center">{file.name}</span>
                    <span className="text-[9px] text-emerald-600 font-bold mt-2 uppercase">Arquivo pronto para sincronização</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-slate-800/50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                      <UploadCloud className="text-slate-500 group-hover:text-blue-500 transition-colors" size={40} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Arraste ou selecione o manual</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase mt-2">PDF ou Word (Máximo 10MB)</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Sincronizando Banco...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Finalizar e Publicar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
               <AlertCircle className="text-blue-400" size={20} />
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold leading-relaxed tracking-wide">
              O processamento é feito via <strong className="text-blue-400">Vercel Blob</strong>. Após a conclusão, o link será indexado no banco <strong className="text-blue-400">Turso</strong> e ficará visível instantaneamente para os setores autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
