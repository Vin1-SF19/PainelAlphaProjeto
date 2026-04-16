"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Tags, Loader2, FolderPlus, Edit3, Save, RotateCcw, Link as LinkIcon, Upload, Image as ImageIcon, AlignLeft } from 'lucide-react';
import { createModulo, getModulos, updateModulo } from '@/actions/GetVideos';
import { upload } from '@vercel/blob/client';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

const SETORES = ["T.I", "Comercial", "Operacional", "Financeiro", "RH", "Serviços Gerais"];

export default function ModalModulos({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [setoresSelected, setSetoresSelected] = useState<string[]>([]);
    const [modulos, setModulos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [modoUpload, setModoUpload] = useState(true);
    const [logoLink, setLogoLink] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [editandoId, setEditandoId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) fetchModulos();
    }, [isOpen]);

    const fetchModulos = async () => {
        const data = await getModulos();
        setModulos(data);

        router.refresh();
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setNome("");
        setDescricao("");
        setSetoresSelected([]);
        setLogoFile(null);
        setLogoLink("");
        fetchModulos();
    };

    const carregarParaEdicao = (m: any) => {
        setEditandoId(m.id);
        setNome(m.nome);
        setDescricao(m.descricao || "");
        setSetoresSelected(m.setor ? m.setor.split(", ") : []);
        setLogoLink(m.imagemUrl || "");
        setModoUpload(false); 
    };

    const handleAction = async () => {
        if (!nome || setoresSelected.length === 0) return toast.error("Preencha os campos obrigatórios!");
        
        setLoading(true);
        try {
            let finalImageUrl = logoLink;

            if (modoUpload && logoFile) {
                const blob = await upload(logoFile.name, logoFile, {
                    access: 'public',
                    handleUploadUrl: '/api/UploadSkills',
                });
                finalImageUrl = blob.url;
            }

            const setorString = setoresSelected.join(", ");
            let res;

            if (editandoId) {
                res = await updateModulo(editandoId, nome, setorString, finalImageUrl, descricao);
            } else {
                res = await createModulo(nome, setorString, finalImageUrl, descricao);
            }

            if (res.success) {
                toast.success(editandoId ? "Módulo atualizado!" : "Módulo criado!");
                fetchModulos();
                cancelarEdicao();
                onClose();
            }

            fetchModulos();



        } catch (e) {
            toast.error("Erro no processamento.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[#111] border border-white/10 rounded-[3rem] max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                
                <div className="p-8 border-b border-white/5 bg-[#161616] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FolderPlus className={editandoId ? "text-blue-500" : "text-orange-500"} size={24} />
                        <h3 className="text-white font-black uppercase text-sm tracking-widest">
                            {editandoId ? "Editando Módulo" : "Gestão de Módulos"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer"><X /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    
                    {/* FORMULÁRIO HÍBRIDO (AZUL SE EDITANDO) */}
                    <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${editandoId ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#161616] border-white/5'}`}>
                        <div className="space-y-5">
                            {/* Nome */}
                            <input 
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Nome do Módulo"
                                className="w-full bg-[#1C1C1C] border border-white/5 p-4 rounded-xl text-xs text-white outline-none focus:border-orange-500 transition-all"
                            />

                            {/* Descrição */}
                            <div className="relative">
                                <AlignLeft size={14} className="absolute left-4 top-4 text-slate-600" />
                                <textarea 
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descrição opcional..."
                                    className="w-full bg-[#1C1C1C] border border-white/5 pl-10 pr-4 py-4 rounded-xl text-xs text-white outline-none focus:border-orange-500 min-h-[80px] resize-none"
                                />
                            </div>

                            {/* Logo Toggle */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase">Logo / Ícone</label>
                                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                        <button onClick={() => setModoUpload(true)} className={`px-3 py-1 text-[8px] font-black uppercase rounded-md cursor-pointer transition-all ${modoUpload ? 'bg-orange-600 text-white' : 'text-slate-600'}`}>Upload</button>
                                        <button onClick={() => setModoUpload(false)} className={`px-3 py-1 text-[8px] font-black uppercase rounded-md cursor-pointer transition-all ${!modoUpload ? 'bg-orange-600 text-white' : 'text-slate-600'}`}>Link</button>
                                    </div>
                                </div>

                                {modoUpload ? (
                                    <div className="relative border-2 border-dashed border-white/5 bg-[#1C1C1C] rounded-2xl p-4 text-center cursor-pointer group hover:border-orange-500/30 transition-all">
                                        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="flex items-center justify-center gap-3">
                                            <Upload size={16} className={logoFile ? "text-orange-500" : "text-slate-600"} />
                                            <p className="text-[10px] font-bold text-white uppercase truncate max-w-[200px]">{logoFile ? logoFile.name : "Selecionar Logo"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input value={logoLink} onChange={(e) => setLogoLink(e.target.value)} placeholder="URL da imagem..." className="w-full bg-[#1C1C1C] border border-white/5 pl-10 pr-4 py-4 rounded-xl text-xs text-white outline-none focus:border-orange-500" />
                                    </div>
                                )}
                            </div>

                            {/* Setores */}
                            <div className="grid grid-cols-3 gap-2">
                                {SETORES.map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setSetoresSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                        className={`py-2 rounded-lg text-[8px] font-black uppercase border cursor-pointer transition-all ${setoresSelected.includes(s) ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#1C1C1C] border-white/5 text-slate-600 hover:border-white/20'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2">
                                {editandoId && (
                                    <button onClick={cancelarEdicao} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer">
                                        <RotateCcw size={14} /> Cancelar
                                    </button>
                                )}
                                <button 
                                    onClick={handleAction} 
                                    disabled={loading}
                                    className={`flex-[2] py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all text-white shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${editandoId ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-950/20'}`}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : (editandoId ? <Save size={14} /> : <Plus size={14} />)}
                                    {editandoId ? "Salvar Alterações" : "Criar Módulo"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Módulos Ativos</p>
                        {modulos.map((m: any) => (
                            <div key={m.id} className="p-4 bg-[#161616] rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {m.imagemUrl ? <img src={m.imagemUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-800" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase leading-none">{m.nome}</h4>
                                        <p className="text-[8px] text-slate-600 font-black uppercase mt-1.5">{m.setor}</p>
                                    </div>
                                </div>
                                <button onClick={() => carregarParaEdicao(m)} className="p-2.5 bg-white/5 text-slate-600 hover:bg-orange-600 hover:text-white rounded-xl transition-all cursor-pointer">
                                    <Edit3 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}