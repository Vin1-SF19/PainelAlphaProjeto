'use client'

import loginAction from "@/lib/loginAction";
import Form from "next/form";
import { useActionState, useState } from "react";
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";
import ModalRecuperarSenha from "./RecuperarSenha/page";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [isModalSenhaAberto, setIsModalSenhaAberto] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* MENSAGEM DE ERRO REESTILIZADA */}
      {state?.success === false && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-500 animate-in slide-in-from-top-2 duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <AlertCircle size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Rejeitado</span>
            <span className="text-xs font-bold uppercase italic">{state?.message}</span>
          </div>
        </div>
      )}

      <Form action={formAction} className="space-y-5">
        {/* CAMPO EMAIL */}
        <div className="group">
          <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">
            Identificação de Rede
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="USUARIO@ALPHA.COM"
              required
              className="block w-full h-14 rounded-2xl bg-white/5 border border-white/5 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:bg-white/10 transition-all outline-none shadow-inner"
            />
          </div>
        </div>

        {/* CAMPO SENHA */}
        <div className="group">
          <div className="flex items-center justify-between mb-2 px-1">
            <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              Chave de Acesso
            </label>
            <button
              type="button"
              onClick={() => setIsModalSenhaAberto(true)}
              className="cursor-pointer text-[9px] font-black text-slate-600 uppercase hover:text-indigo-500 transition-all italic border-b border-transparent hover:border-indigo-500/50"
            >
              Recuperar Acesso
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              id="password"
              name="senha"
              type="password"
              placeholder="••••••••"
              required
              className="block w-full h-14 rounded-2xl bg-white/5 border border-white/5 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:bg-white/10 transition-all outline-none shadow-inner"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className={`
                      group relative w-full h-16 rounded-[1.8rem] flex items-center justify-center gap-3 
                      text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 overflow-hidden
                      ${isPending
                ? "bg-slate-800 text-slate-500 cursor-wait shadow-none"
                : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xl shadow-indigo-950/40 hover:-translate-y-1 active:scale-95"
              }
                    `}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                <span>Entrar</span>
              </>
            )}

            {!isPending && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            )}
          </button>
        </div>

      </Form>

      <ModalRecuperarSenha
        isOpen={isModalSenhaAberto}
        onClose={() => setIsModalSenhaAberto(false)}
      />
    </div>
  );
}
