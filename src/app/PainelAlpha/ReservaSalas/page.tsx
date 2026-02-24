"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Calendar as CalendarIcon, Clock, User as UserIcon, DoorOpen, LayoutDashboard, AlertCircle, XCircle, Edit3, CheckCircle2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { agendarSala, liberarSala, buscarReservasAtivas, editarReserva, cancelarReserva, buscarHistoricoReservas } from '@/actions/Reservas';
import LogoutButton from '@/Components/LogoutUser';
import { BotaoVoltar } from '@/Components/BotaoVoltar';

export default function ReservaSalas() {
  const { data: session, status } = useSession();
  const [reservas, setReservas] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [form, setForm] = useState({ sala: "Sala de Reuniões", inicio: "09:00", fim: "10:00" });
  const [reservaEditando, setReservaEditando] = useState<any>(null);

  const usuarioLogado = session?.user?.nome || (session?.user as any)?.usuario || "Usuário";
  const isAdmin = (session?.user as any)?.role === "Admin";

  const atualizar = async () => {
    const [ativos, passados] = await Promise.all([buscarReservasAtivas(), buscarHistoricoReservas()]);
    setReservas(ativos);
    setHistorico(passados);
  };

  useEffect(() => { if (status === "authenticated") atualizar(); }, [status]);

  const handleInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoInicio = e.target.value;
    const [horas, minutos] = novoInicio.split(':').map(Number);
    const novaHoraFim = `${String((horas + 1) % 24).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    setForm({ ...form, inicio: novoInicio, fim: novaHoraFim });
  };

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return toast.error("Selecione uma data");
    const res = await agendarSala({ 
      ...form, 
      data: selectedDate.toISOString().split('T')[0], 
      usuario: usuarioLogado 
    });
    if (res.success) { toast.success("Agendado!"); atualizar(); }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Excluir reserva?")) return;
    const res = await cancelarReserva(id);
    if (res.success) { setReservaEditando(null); toast.success("Removida!"); atualizar(); }
  };

  const reservasDoDia = reservas.filter(r => 
    new Date(r.inicio).toDateString() === selectedDate?.toDateString()
  ).sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 text-slate-200">
      <style>{`
        .rdp { --rdp-accent-color: #3b82f6; --rdp-background-color: #1e293b; margin: 0; }
        .rdp-day_selected { background-color: var(--rdp-accent-color) !important; }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #334155; }
      `}</style>

      <div className="mx-auto max-w-[1600px] mb-10 rounded-[2rem] border border-blue-500/20 bg-slate-900/40 backdrop-blur-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-blue-500 w-8 h-8" />
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase tracking-tighter">AGENDA DE <span className="text-blue-500 italic">SALAS</span></h1>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 inline-flex items-center gap-2">
            <UserIcon size={16} className="text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">@{usuarioLogado}</span>
          </div>
        </div>
        <div className="flex items-center gap-4"><BotaoVoltar /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><CalendarIcon size={20} className="text-blue-500"/> Calendário</h2>
            <div className="flex justify-center bg-slate-950/50 rounded-2xl p-2">
              <DayPicker 
                mode="single" 
                selected={selectedDate} 
                onSelect={setSelectedDate} 
                locale={ptBR}
                className="text-white"
              />
            </div>

            <form onSubmit={handleAgendar} className="mt-6 space-y-4">
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white" value={form.sala} onChange={e => setForm({...form, sala: e.target.value})}>
                <option value="Sala de Reuniões">Sala de Reuniões</option>
                <option value="Sala Xangai">Sala Xangai</option>
                <option value="Sala Los Angeles">Sala Los Angeles</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Início</label>
                  <input type="time" value={form.inicio} onChange={handleInicioChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Término</label>
                  <input type="time" value={form.fim} onChange={e => setForm({...form, fim: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20">AGENDAR</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-8 min-h-[600px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Clock className="text-blue-500" /> Agenda do Dia
              </h3>
              <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <div className="space-y-4">
              {reservasDoDia.length > 0 ? (
                reservasDoDia.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => (isAdmin || r.usuario === usuarioLogado) && setReservaEditando({...r, dataStr: new Date(r.inicio).toISOString().split('T')[0], inicioStr: new Date(r.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), fimStr: new Date(r.fim).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})}
                    className="group relative ml-4 pl-6 py-4 border-l-2 border-blue-500 bg-slate-900/40 hover:bg-slate-800/60 rounded-r-2xl transition-all cursor-pointer border-y border-r border-white/5"
                  >
                    <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full ring-4 ring-[#020617]" />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-black text-lg">{r.sala}</p>
                        <p className="text-blue-400 font-bold text-sm">
                          {new Date(r.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} — {new Date(r.fim).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pr-4">
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-black text-slate-500">Reservado por</p>
                          <p className="text-sm font-bold text-slate-300">@{r.usuario}</p>
                        </div>
                        {(isAdmin || r.usuario === usuarioLogado) && <Edit3 size={18} className="text-slate-600 group-hover:text-blue-500 transition-colors" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600 italic">
                  <CalendarIcon size={48} className="mb-4 opacity-20" />
                  <p>Nenhum compromisso agendado para este dia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {reservaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1220] border border-blue-900/30 p-8 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gerenciar Reserva</h2>
              <button onClick={() => setReservaEditando(null)}><XCircle className="text-slate-500 hover:text-white transition-colors" size={24} /></button>
            </div>
            <div className="space-y-4">
              <select value={reservaEditando.sala} onChange={e => setReservaEditando({...reservaEditando, sala: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm">
                <option value="Sala de Reuniões">Sala de Reuniões</option>
                <option value="Sala Xangai">Sala Xangai</option>
                <option value="Sala Los Angeles">Sala Los Angeles</option>
              </select>
              <div className="grid grid-cols-1 gap-4">
                <input type="date" value={reservaEditando.dataStr} onChange={e => setReservaEditando({...reservaEditando, dataStr: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={reservaEditando.inicioStr} onChange={e => setReservaEditando({...reservaEditando, inicioStr: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm" />
                  <input type="time" value={reservaEditando.fimStr} onChange={e => setReservaEditando({...reservaEditando, fimStr: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={() => editarReserva(reservaEditando.id, {data: reservaEditando.dataStr, inicio: reservaEditando.inicioStr, fim: reservaEditando.fimStr, sala: reservaEditando.sala}).then(() => { toast.success("Atualizado!"); setReservaEditando(null); atualizar(); })} className="bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-colors">Salvar Alterações</button>
                <button onClick={() => handleExcluir(reservaEditando.id)} className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-500 hover:text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"><AlertCircle size={16} /> Excluir Permanentemente</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
