"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Calendar, Clock, User as UserIcon, DoorOpen, LayoutDashboard, AlertCircle, CheckSquare, XCircle, Edit3, CheckCircle2, History } from 'lucide-react';
import { toast } from 'sonner';
import { agendarSala, liberarSala, buscarReservasAtivas, editarReserva, cancelarReserva, buscarHistoricoReservas } from '@/actions/Reservas';
import LogoutButton from '@/Components/LogoutUser';
import { BotaoVoltar } from '@/Components/BotaoVoltar';

export default function ReservaSalas() {

  const { data: session, status } = useSession();
  const [reservas, setReservas] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [form, setForm] = useState({ sala: "Sala 1", data: "", inicio: "" });
  const [reservaEditando, setReservaEditando] = useState<any>(null);

  const usuarioLogado = session?.user?.nome || (session?.user as any)?.usuario || "Usuário";
  const isAdmin = (session?.user as any)?.role === "Admin";

  const atualizar = async () => {
    const [ativos, passados] = await Promise.all([buscarReservasAtivas(), buscarHistoricoReservas()]);
    setReservas(ativos);
    setHistorico(passados);
  };

  useEffect(() => { if (status === "authenticated") atualizar(); }, [status]);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await agendarSala({ ...form, usuario: usuarioLogado });
    if (res.success) { toast.success("Agendado!"); setForm({ ...form, data: "", inicio: "" }); atualizar(); }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja apagar essa reserva para sempre?")) return;

    try {
      
        const res = await cancelarReserva(id);

        if (res.success) {
          
            setReservas(prev => prev.filter(r => r.id !== id));
            setReservaEditando(null);
            toast.success("Reserva removida do sistema!");
            
            
            await atualizar();
        } else {
            toast.error(res.error || "O banco de dados recusou a exclusão.");
        }
    } catch (err) {
        toast.error("Erro crítico de conexão.");
    }
};


  const getStatusSala = (nomeSala: string) => {
    const agora = new Date();
    return reservas.find(r => r.sala === nomeSala && agora >= new Date(r.inicio));
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      {/* HEADER */}
      <div className="mx-auto max-w-[1600px] mb-10 rounded-[2rem] border border-blue-500/20 bg-slate-900/40 backdrop-blur-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 ring-1 ring-white/5 shadow-2xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-blue-500 w-8 h-8" />
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">RESERVA DE <span className="text-blue-500 italic">SALAS</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <UserIcon size={16} className="text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">@{usuarioLogado}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <BotaoVoltar />
          </div>
      </div>
          <LogoutButton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Sala 1", "Sala 2", "Sala 3"].map(nome => {
              const ativa = getStatusSala(nome);
              const isOwner = ativa?.usuario === usuarioLogado;

              return (
                <div
                  key={nome}
                  onClick={() => {
                    if (ativa && (isOwner || isAdmin)) {
                      liberarSala(ativa.id).then(() => { toast.success("Sala liberada!"); atualizar(); });
                    } else if (ativa) {
                      toast.error(`Ocupada por ${ativa.usuario}`);
                    }
                  }}
                  className={`p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group ${ativa ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-slate-900/40 border-white/5 hover:border-blue-500/30'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${ativa ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}><DoorOpen size={24} /></div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${ativa ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>{ativa ? 'Ocupada' : 'Livre'}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{nome}</h3>
                  {ativa && (
                    <div className="space-y-4">
                      <p className="text-xs text-rose-400 font-bold uppercase tracking-widest flex items-center gap-2"><UserIcon size={14} /> {ativa.usuario}</p>
                      {(isOwner || isAdmin) && <p className="text-[9px] text-rose-500 font-black uppercase animate-bounce mt-4">Clique para desocupar ↑</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* LISTA AGENDAMENTOS */}
          <div className="bg-slate-900/20 border border-white/5 rounded-[2rem] p-8">
            <h3 className="text-sm font-black text-slate-500 uppercase mb-6 flex items-center gap-2"><Clock size={16} /> Próximos Agendamentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservas.filter(r => new Date(r.inicio) > new Date()).map(r => (
                <div key={r.id} onClick={() => (isAdmin || r.usuario === usuarioLogado) && setReservaEditando({...r, dataStr: new Date(r.data).toISOString().split('T')[0], inicioStr: new Date(r.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})})} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-all text-white">
                  <div><p className="font-bold">{r.sala} - {r.usuario}</p><p className="text-[10px] text-slate-500 uppercase">{new Date(r.inicio).toLocaleString('pt-BR')}</p></div>
                  <Edit3 size={16} className="text-blue-500/50" />
                </div>
              ))}
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="bg-slate-900/20 border border-white/5 rounded-[2rem] p-8">
            <h3 className="text-sm font-black text-slate-500 uppercase mb-6 flex items-center gap-2"><History size={16} className="text-emerald-500" /> Histórico</h3>
            <div className="space-y-3">
              {historico.map(h => (
                <div key={h.id} className="p-4 bg-slate-950/20 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={14} /></div>
                  <div className="text-xs text-slate-300 font-bold"><span className="text-white">{h.sala}</span> ocupada por <span className="text-blue-400">{h.usuario}</span><p className="text-[9px] text-slate-500 uppercase mt-1">{new Date(h.data).toLocaleDateString('pt-BR')} • {new Date(h.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} às {new Date(h.fim).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AGENDAR */}
        <div className="bg-gray-900/60 border border-blue-900/20 rounded-[2.5rem] p-8 shadow-2xl h-fit">
          <h2 className="text-2xl font-black text-white uppercase mb-8 flex items-center gap-3"><Calendar className="text-blue-500" /> Agendar</h2>
          <form onSubmit={handleAgendar} className="space-y-6">
            <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm" onChange={e => setForm({...form, sala: e.target.value})}>
              <option value="Sala 1">Sala 1</option><option value="Sala 2">Sala 2</option><option value="Sala 3">Sala 3</option>
            </select>
            <input required type="date" value={form.data} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm" onChange={e => setForm({...form, data: e.target.value})} />
            <input required type="time" value={form.inicio} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm" onChange={e => setForm({...form, inicio: e.target.value})} />
            <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">Confirmar</button>
          </form>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {reservaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1220] border border-blue-900/30 p-8 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gerenciar</h2><button onClick={() => setReservaEditando(null)}><XCircle className="cursor-pointer text-slate-500 hover:text-white" size={24} /></button></div>
            <div className="space-y-4">
              <select value={reservaEditando.sala} onChange={e => setReservaEditando({...reservaEditando, sala: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm"><option value="Sala 1">Sala 1</option><option value="Sala 2">Sala 2</option><option value="Sala 3">Sala 3</option></select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={reservaEditando.dataStr} onChange={e => setReservaEditando({...reservaEditando, dataStr: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                <input type="time" value={reservaEditando.inicioStr} onChange={e => setReservaEditando({...reservaEditando, inicioStr: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={() => editarReserva(reservaEditando.id, {data: reservaEditando.dataStr, inicio: reservaEditando.inicioStr, sala: reservaEditando.sala}).then(() => { toast.success("Editado!"); setReservaEditando(null); atualizar(); })} className="cursor-pointer bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Salvar</button>
                
                <button onClick={() => handleExcluir(reservaEditando.id)} className="cursor-pointer bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-500 hover:text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"><AlertCircle size={14} /> Excluir Permanentemente</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
