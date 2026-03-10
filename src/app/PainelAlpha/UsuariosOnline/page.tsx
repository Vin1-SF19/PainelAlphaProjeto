import db from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { Activity, User, ArrowRight, ShieldCheck, WifiOff } from "lucide-react";
import { getTema } from "@/lib/temas";

export const dynamic = "force-dynamic";

export default async function UsuariosOnlinePage() {
  const session = await auth();
  if (session?.user?.role !== "Admin") redirect("/");

  const style = getTema((session?.user as any)?.tema_interface || "blue");
  
  const todosUsuarios = await db.usuarios.findMany({
    select: { 
      id: true, 
      nome: true, 
      email: true, 
      role: true, 
      tema_interface: true, 
      ultimo_aviso: true 
    },
    orderBy: { nome: 'asc' }
  });

  const limiteOnline = new Date(Date.now() - 20000).toISOString();

  return (
    <main className="min-h-screen bg-[#020617] p-8 text-white relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${style.glow} opacity-5 blur-[150px]`} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Activity className="text-emerald-500" size={40} /> Central de <span className={style.text}>Agentes</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Gestão de Acessos e Presença Alpha</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Total de Agentes</span>
            <span className="text-2xl font-black italic">{todosUsuarios.length}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {todosUsuarios.map((u) => {
            const isOnline = u.ultimo_aviso && u.ultimo_aviso >= limiteOnline;
            const uStyle = getTema(u.tema_interface || "blue");

            return (
              <div key={u.id} className={`bg-slate-900/40 border transition-all duration-500 p-6 rounded-[2.5rem] relative group ${isOnline ? 'border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]' : 'border-white/5 opacity-80 hover:opacity-100'}`}>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className={`h-14 w-14 rounded-2xl ${isOnline ? uStyle.bg : 'bg-slate-800'} flex items-center justify-center shadow-2xl transition-colors`}>
                    <User size={28} className={isOnline ? "text-white" : "text-slate-500"} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-tight ${isOnline ? 'text-white' : 'text-slate-400'}`}>{u.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Acesso</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.role === 'Admin' ? 'text-red-500 bg-red-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Interface</span>
                    <span className={`text-[9px] font-black uppercase ${isOnline ? uStyle.text : 'text-slate-600'}`}>{u.tema_interface || 'Padrão'}</span>
                  </div>
                </div>

                <button className={`w-full h-12 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all border ${isOnline ? `${uStyle.bg} text-white border-transparent hover:brightness-110 shadow-lg` : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
                   Gerenciar Perfil <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
