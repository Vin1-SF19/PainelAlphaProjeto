"use client"

import { useState, useEffect, useMemo } from "react";
import {
    Plus, Package, Trash2, Edit3, Search, X, Loader2,
    ChevronRight, ShoppingCart, LayoutGrid, Tag,
    Image as ImageIcon, Filter, AlertTriangle, ArrowRight
} from "lucide-react";
import { SalvarProduto, buscarProdutos, DeletarProduto, buscarListaCompra, AdicionarAoCarrinho, RemoverDaLista, ConfirmarCarrinhoParaLista } from "@/actions/Estoque";
import { SalvarCategoria, buscarCategorias, DeletarCategoria } from "@/actions/Estoque";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface Categoria {
    id: string;
    nome: string;
}

interface ProdutoEstoque {
    id: string;
    nome: string;
    quantidade: number;
    estoqueMinimo: number;
    unidade: string;
    precoMedio: number | null;
    imagem?: string | null;
    categoriaId: string;
    categoria?: { nome: string };
}

export default function PainelEstoquePro() {
    const [busca, setBusca] = useState("");
    const [filtroCat, setFiltroCat] = useState("TODOS");
    const [showModal, setShowModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [listaCompraDoBanco, setListaCompraDoBanco] = useState<any[]>([]);

    const [form, setForm] = useState({
        id: "", nome: "", categoriaId: "", quantidade: 0,
        estoqueMinimo: 1, unidade: "un", precoMedio: 0, imagem: ""
    });

    const itensNoCarrinho = listaCompraDoBanco.filter(item => item.status === "CARRINHO");


    const [nomeNovaCat, setNomeNovaCat] = useState("");

    useEffect(() => { carregarDados(); }, []);

    async function carregarDados() {
        const lista = await buscarListaCompra();

        setListaCompraDoBanco(lista);
        setLoading(true);
        try {
            const [p, c] = await Promise.all([buscarProdutos(), buscarCategorias(), buscarListaCompra()]);
            setProdutos(p as any);
            setCategorias(c as any);
        } finally {
            setLoading(false);
        }
    }

    const handleSalvarProduto = async () => {
        if (!form.nome || !form.categoriaId) return toast.error("Nome e Categoria são obrigatórios!");
        setIsSaving(true);
        const res = await SalvarProduto(form);
        if (res.success) {
            toast.success("Sincronizado!");
            fecharModal();
            carregarDados();
        }
        setIsSaving(false);
    };

    const handleAddCategoria = async () => {
        if (!nomeNovaCat) return;
        const res = await SalvarCategoria(nomeNovaCat.toUpperCase());
        if (res.success) {
            toast.success("Categoria Criada");
            setNomeNovaCat("");
            carregarDados();
        }
    };

    const fecharModal = () => {
        setShowModal(false);
        setForm({ id: "", nome: "", categoriaId: "", quantidade: 0, estoqueMinimo: 1, unidade: "un", precoMedio: 0, imagem: "" });
    };

    const filtrados = useMemo(() => {
        return produtos.filter(p =>
            p.nome.toLowerCase().includes(busca.toLowerCase()) &&
            (filtroCat === "TODOS" || p.categoriaId === filtroCat)
        );
    }, [produtos, busca, filtroCat]);

    const stats = useMemo(() => ({
        total: produtos.length,
        criticos: produtos.filter(p => p.quantidade <= p.estoqueMinimo).length,
        valor: produtos.reduce((acc, p) => acc + ((p.precoMedio || 0) * p.quantidade), 0)
    }), [produtos]);



    return (
        <div className="min-h-screen bg-[#08080a] text-slate-300 p-4 lg:p-10 selection:bg-indigo-500/30">
            <div className="max-w-[1400px] mx-auto">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                            <LayoutGrid className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Controle de <span className="text-indigo-500">Estoque</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Gestão de Suprimentos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowCatModal(true)}
                            className="cursor-pointer p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                            title="Gerenciar Categorias"
                        >
                            <Tag size={20} />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="cursor-pointer flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Plus size={18} strokeWidth={3} /> Novo Item
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        {
                            label: "Itens no Sistema",
                            val: stats.total,
                            icon: Package,
                            color: "text-indigo-500",
                            action: null
                        },
                        {
                            label: "Abaixo do Mínimo",
                            val: stats.criticos,
                            icon: AlertTriangle,
                            color: "text-rose-500",
                            action: null
                        },
                        {
                            label: "Carrinho de Compras",
                            val: `${itensNoCarrinho.length} ${itensNoCarrinho.length === 1 ? 'item' : 'itens'}`,
                            icon: ShoppingCart,
                            color: "text-amber-400",
                            action: () => setShowCartModal(true)
                        }
                    ].map((s, i) => {
                        const CardTag = s.action ? 'button' : 'div';

                        return (
                            <CardTag
                                key={i}
                                onClick={s.action || undefined}
                                className={`bg-white/[0.03] border border-white/5 rounded-[2rem] p-7 flex items-center gap-6 relative overflow-hidden group text-left w-full transition-all ${s.action ? 'hover:bg-white/[0.06] cursor-pointer' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                <div className={`p-4 rounded-2xl bg-white/5 ${s.color}`}>
                                    <s.icon size={24} />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter mb-1">
                                        {s.label}
                                    </p>
                                    <p className="text-2xl font-black text-white italic tracking-tight">
                                        {s.val}
                                    </p>
                                </div>

                                {s.action && (
                                    <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                )}
                            </CardTag>
                        );
                    })}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input
                            placeholder="Buscar insumo pelo nome..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold outline-none focus:border-indigo-500/50 transition-all"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFiltroCat("TODOS")}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${filtroCat === "TODOS" ? 'bg-white text-black' : 'hover:bg-white/5'}`}
                        >
                            Todos
                        </button>
                        {categorias.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setFiltroCat(c.id)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${filtroCat === c.id ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}
                            >
                                {c.nome}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center opacity-20">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Carregando Sistema...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtrados.map(p => {

                            const qtd = Number(p.quantidade);
                            const min = Number(p.estoqueMinimo);
                            const metade = min / 2;

                            const isCritico = qtd <= metade - 1;
                            const isAtencao = qtd < min && qtd > metade;

                            return (
                                <div
                                    key={p.id}
                                    className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 
                                            ${isCritico ? 'border-rose-500/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]' :
                                            isAtencao ? 'border-amber-500/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' :
                                                'border-white/5 hover:border-white/20'}`}
                                >
                                    {/* Overlays de cor */}
                                    {isCritico && <div className="absolute inset-0 bg-rose-500/[0.03] pointer-events-none" />}
                                    {isAtencao && <div className="absolute inset-0 bg-amber-500/[0.02] pointer-events-none" />}

                                    <div className="relative h-56 w-full bg-white/5">
                                        {p.imagem ? (
                                            <img
                                                src={p.imagem}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                                alt={p.nome}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                                                <ImageIcon size={40} />
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 z-10">

                                            <button
                                                onClick={async () => {
                                                    const res = await AdicionarAoCarrinho(p);
                                                    if (res.success) {
                                                        toast.success(`${p.nome} no carrinho!`);
                                                        carregarDados();
                                                    }
                                                }}
                                                className="p-3 bg-black/50 backdrop-blur-md text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-white/10"
                                            >
                                                <ShoppingCart size={16} />
                                            </button>

                                            <button
                                                onClick={() => { setForm({ ...p, imagem: p.imagem || "", precoMedio: p.precoMedio || 0 }); setShowModal(true); }}
                                                className="p-3 bg-black/50 backdrop-blur-md text-white rounded-xl hover:bg-indigo-500 transition-colors border border-white/10"
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            <button
                                                onClick={() => DeletarProduto(p.id).then(carregarDados)}
                                                className="p-3 bg-black/50 backdrop-blur-md text-white rounded-xl hover:bg-rose-500 transition-colors border border-white/10"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Badges de Status */}
                                        {isCritico && (
                                            <div className="absolute bottom-4 left-4 px-3 py-1 text-[8px] font-black text-white uppercase rounded-lg z-10 shadow-lg flex items-center gap-2 bg-rose-600 animate-pulse">
                                                <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                                                Crítico
                                            </div>
                                        )}
                                        {isAtencao && (
                                            <div className="absolute bottom-4 left-4 px-3 py-1 text-[8px] font-black text-white uppercase rounded-lg z-10 shadow-lg bg-amber-600">
                                                Atenção
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-7 flex-1 flex flex-col relative z-10">
                                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">
                                            {p.categoria?.nome || 'Sem Categoria'}
                                        </p>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                                            {p.nome}
                                        </h3>

                                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Estoque</p>
                                                <p className={`text-2xl font-black italic tracking-tighter
                                                     ${isCritico ? 'text-rose-500' : isAtencao ? 'text-amber-500' : 'text-white'}`}>
                                                    {qtd}
                                                    <span className="text-[10px] font-medium not-italic ml-1 text-slate-500">{p.unidade}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Mínimo</p>
                                                <p className="text-xs font-bold italic text-slate-500">
                                                    {min}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Configurar <span className="text-indigo-500">Item</span></h2>
                            <button onClick={fecharModal} className="cursor-pointer text-slate-500 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Identificação</label>
                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all uppercase" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Qtd Atual</label>
                                    <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Mínimo</label>
                                    <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none" value={form.estoqueMinimo} onChange={e => setForm({ ...form, estoqueMinimo: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Categoria</label>
                                <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none appearance-none" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                                    <option value="">Selecione...</option>
                                    {categorias.map(c => <option key={c.id} value={c.id} className="bg-[#0c0c0e]">{c.nome}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">URL da Imagem</label>
                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none" value={form.imagem} onChange={e => setForm({ ...form, imagem: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={fecharModal} className="cursor-pointer hover:text-red-600 flex-1 p-4 text-[10px] font-black uppercase text-slate-600 transition-colors">Cancelar</button>
                            <button onClick={handleSalvarProduto} disabled={isSaving} className="cursor-pointer sflex-[2] bg-indigo-600 p-4 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />} Salvar Dados
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCatModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase italic italic tracking-tighter">Categorias</h2>
                            <button className="cursor-pointer " onClick={() => setShowCatModal(false)}><X size={20} /></button>
                        </div>
                        <div className="flex gap-2 mb-6">
                            <input placeholder="NOVA CATEGORIA..." className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-black outline-none focus:border-indigo-500" value={nomeNovaCat} onChange={e => setNomeNovaCat(e.target.value)} />
                            <button onClick={handleAddCategoria} className="cursor-pointer bg-indigo-600 p-4 rounded-xl hover:bg-indigo-500 transition-all"><Plus size={18} /></button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scroll">
                            {categorias.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{c.nome}</span>
                                    <button onClick={() => DeletarCategoria(c.id).then(carregarDados)} className="cursor-pointer text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <AnimatePresence>
                {showCartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[120] flex justify-end"
                    >
                        <div className="absolute inset-0" onClick={() => setShowCartModal(false)} />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative h-full w-full max-w-lg bg-[#0c0c0e] border-l border-white/10 p-8 lg:p-12 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Area do <span className="text-amber-500">Carrinho</span></h2>
                                    <p className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase">Itens selecionados para compra</p>
                                </div>
                                <button
                                    onClick={() => setShowCartModal(false)}
                                    className="cursor-pointer p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scroll">
                                {itensNoCarrinho.length > 0 ? (
                                    itensNoCarrinho.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                                    <Package size={20} className="text-amber-500/50" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-white uppercase tracking-tight">
                                                        {item.nome}
                                                    </h4>
                                                    <p className="text-[9px] font-bold text-indigo-500 uppercase">
                                                        {item.quantidadeAtual} {item.unidade} em estoque
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    const res = await RemoverDaLista(item.produtoId);
                                                    if (res.success) carregarDados();
                                                }}
                                                className="p-3 text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <ShoppingCart size={48} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center">
                                            Seu carrinho está vazio
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/5">
                                <button
                                    disabled={itensNoCarrinho.length === 0}
                                    onClick={async () => {
                                        const res = await ConfirmarCarrinhoParaLista();
                                        if (res.success) {
                                            setShowCartModal(false);
                                            carregarDados();
                                        }
                                    }}
                                    className="w-full bg-white text-black p-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-20 cursor-pointer"
                                >
                                    Confirmar e Enviar para Lista <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}