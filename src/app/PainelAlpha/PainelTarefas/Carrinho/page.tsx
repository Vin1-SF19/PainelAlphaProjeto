"use client"

import { useState } from "react";
import { ShoppingCart, ArrowLeft, Package, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { RegistrarCompra, RemoverDaLista } from "@/actions/Estoque";
import { toast } from "sonner";

interface ItemCompra {
    id: string;
    produtoId: string;
    nome: string;
    quantidadeAtual: number;
    minimoEsperado: number;
    unidade: string;
    status: string;
    categoria?: { nome: string };
}

export default function ListaCompras({ itens, aoVoltar, atualizarDados }: { itens: ItemCompra[], aoVoltar: () => void, atualizarDados: () => void }) {
    const [itemSelecionado, setItemSelecionado] = useState<ItemCompra | null>(null);
    const [qtdComprada, setQtdComprada] = useState<string>("1");
    const [loading, setLoading] = useState(false);

    const itensPendentes = itens.filter(item => item.status === "PENDENTE");

    const handleConfirmarCompra = async () => {
        if (!itemSelecionado) return;
        setLoading(true);
        const res = await RegistrarCompra(itemSelecionado.produtoId, Number(qtdComprada));
        if (res.success) {
            toast.success("Estoque atualizado!");
            atualizarDados();
            setItemSelecionado(null);
            setQtdComprada("1");
        }
        setLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {itemSelecionado && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0c0c0e] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Confirmar Entrada</p>
                                <h3 className="text-xl font-black text-white uppercase italic">{itemSelecionado.nome}</h3>
                            </div>
                            <button onClick={() => setItemSelecionado(null)} className="text-slate-500 hover:text-white cursor-pointer"><X /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Quantidade Comprada ({itemSelecionado.unidade})</label>
                                <input 
                                    type="number" 
                                    value={qtdComprada}
                                    onChange={(e) => setQtdComprada(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-2xl focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleConfirmarCompra}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all cursor-pointer"
                            >
                                {loading ? "Processando..." : <><Plus size={16}/> Adicionar ao Estoque</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={aoVoltar} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer text-left">
                    <ArrowLeft size={14} /> Voltar para Tarefas
                </button>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Shopping <span className="text-indigo-500">List</span></h2>
                </div>
            </div>


            <div className="space-y-4">
                {itensPendentes.length > 0 ? (
                    itensPendentes.map((item) => {


                        
                        const isMin = item.quantidadeAtual <= (item.minimoEsperado + 1);
                        const isMetade = item.quantidadeAtual / 2;
                        const isSuave = item.quantidadeAtual > isMetade;



                        const pulseClass = isMin ? "animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)] border-rose-500/30 bg-rose-500/5" 
                                         : isMetade ? "animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.1)] border-amber-500/30 bg-amber-500/5" 
                                         : "bg-white/[0.02] border-white/5";

                        const iconColor = isMin ? "text-rose-500" : isMetade ? "text-amber-500" : isSuave ? "text-indigo-500" : "";

                        return (
                            <div key={item.id} className={`group border rounded-3xl p-6 flex items-center justify-between transition-all duration-500 ${pulseClass}`}>
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl bg-white/5 ${iconColor}`}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em]">{item.categoria?.nome || "Insumo"}</p>
                                            {isMin && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                                        </div>
                                        <h4 className="text-md font-black text-white uppercase italic tracking-tight leading-none">{item.nome}</h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-tighter">Status Atual</p>
                                        <p className="text-lg font-black text-white italic leading-none">
                                            {item.quantidadeAtual} <span className="text-[10px] text-slate-400 not-italic uppercase">{item.unidade}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => RemoverDaLista(item.produtoId).then(atualizarDados)}
                                            className="p-3 bg-white/5 text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-white/5 cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setItemSelecionado(item)}
                                            className="p-3 bg-white text-black rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl cursor-pointer"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3.5rem]">
                        <ShoppingCart className="mx-auto text-slate-800 mb-6 opacity-20" size={56} />
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em]">Protocolo de Compras Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
}