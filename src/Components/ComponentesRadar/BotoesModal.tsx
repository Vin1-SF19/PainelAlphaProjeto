"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, Database, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ModalHistorico from "./ModalHistorico";
import FiltrosTabela from "./FiltroTabela/FiltroTabela";

const MODAL_CONFIG = {
    limpar: {
        titulo: "Limpar tabela?",
        texto: (
            <>
                Ao limpar a tabela,
                <strong> todos os registros exibidos aqui serão apagados</strong>,
                incluindo os dados salvos no navegador (localStorage).
                <br />
                <strong>Essa ação não pode ser desfeita.</strong>
            </>
        ),
        confirmarTexto: "Sim, limpar tudo",
    },
    exportar: {
        titulo: "Exportar Excel?",
        texto: <>Deseja definir um nome para o arquivo antes de exportar?</>,
        confirmarTexto: "Sim, exportar",
    },
    reconsultar: {
        titulo: "Reconsultar erros?",
        texto: (
            <>
                Os registros com problemas serão consultados novamente.
                <br />
                Este processo pode levar alguns minutos.
            </>
        ),
        confirmarTexto: "Sim, reconsultar",
    },
} as const;

type AcaoModal = "limpar" | "exportar" | "reconsultar" | "duplicado" | null;
type ModalAberto = "historico" | null;

type Props = {
    onImportarHistorico: (ids: number[]) => void;
    onLimparTabela: () => void;
    onExportarExcel: (nome: string) => void;
    onReconsultarErros: () => void;
    processando: boolean;
    empresas: any[];
    selecionados: Set<string>;
    ordem: "asc" | "desc" | null;
    ordemData: "recentes" | "antigos" | null;
    empresasExibidas: any[];
    handleAlternarOrdemNome: () => void;
    handleAlternarOrdemData: () => void;
    handleRemoverSelecionados: () => void;
    handleSelecionarTudo: () => void;
    filtroErro: boolean;
    setFiltroErro: (v: boolean) => void;
    loading: boolean;
    totalEmpresas: number;

    setOrdem: (v: "asc" | "desc" | null) => void;
    setOrdemData: (v: "recentes" | "antigos" | null) => void;

    onSalvarBanco: (nome: string) => Promise<any>;


    filtroStatus: "todos" | "erro" | "sucesso";
    setFiltroStatus: (v: "todos" | "erro" | "sucesso") => void;
    temSelecionadoNoBanco: boolean;
    onDeletarDoBanco: () => void;

    totalSelecionados: number;

    filtroSituacao: "todos" | "DEFERIDA" | "NÃO HABILITADA" | "SUSPENSA";
    setFiltroSituacao: React.Dispatch<
        React.SetStateAction<
            "todos" | "DEFERIDA" | "NÃO HABILITADA" | "SUSPENSA"
        >
    >;
};

export default function ModalButtons({
    onImportarHistorico,
    onLimparTabela,
    onExportarExcel,
    onReconsultarErros,
    processando,
    empresas,
    selecionados,
    ordem,
    ordemData,
    empresasExibidas,
    handleAlternarOrdemNome,
    handleAlternarOrdemData,
    handleRemoverSelecionados,
    handleSelecionarTudo,
    filtroErro,
    setFiltroErro,
    loading,
    onSalvarBanco,
    totalEmpresas,
    setOrdem,
    setOrdemData,
    filtroStatus,
    setFiltroStatus,
    temSelecionadoNoBanco,
    onDeletarDoBanco,
    totalSelecionados,
    filtroSituacao,
    setFiltroSituacao
}: Props) {
    const [acaoModal, setAcaoModal] = useState<AcaoModal>(null);
    const [modalAberto, setModalAberto] = useState<ModalAberto>(null);
    const [nomeArquivo, setNomeArquivo] = useState("consulta_radar");
    const [enabled, setEnabled] = useState(true);

    function fecharTudo() {
        setAcaoModal(null);
        setModalAberto(null);
    }

    async function confirmarAcao() {
        if (acaoModal === "limpar") {
            onLimparTabela();
            fecharTudo();
            return;
        }

        if (acaoModal === "exportar" || acaoModal === "duplicado") {
            if (empresas.length === 0) {
                toast.error("A tabela está vazia!");
                fecharTudo();
                return;
            }

            if (enabled) {
                try {

                    const res = await onSalvarBanco(nomeArquivo);

                    if (res && res.error === "duplicado") {
                        setAcaoModal("duplicado");
                        return;
                    }

                    if (res && !res.success) {
                        toast.error("Erro ao salvar no banco, mas o arquivo será exportado.");
                    }
                } catch (err) {
                    console.error("Erro no salvamento:", err);
                }
            }


            onExportarExcel(nomeArquivo);
            fecharTudo();
            return;
        }

        if (acaoModal === "reconsultar") {
            onReconsultarErros();
            fecharTudo();
        }
    }



    type SubmodalidadeType = "todos" | "LIMITADA (ATÉ US$ 50.000)" | "LIMITADA (ATÉ US$ 150.000)" | "ILIMITADA";
    const [filtroSubmodalidade, setFiltroSubmodalidade] = useState<SubmodalidadeType>("todos");

    const empresasFiltradas = empresas.filter(e => {

        if (filtroSubmodalidade === "todos") return true;

        const sub = e.submodalidade?.toString() || "";
        if (filtroSubmodalidade === "LIMITADA (ATÉ US$ 50.000)") return sub.includes("50.000");
        if (filtroSubmodalidade === "LIMITADA (ATÉ US$ 150.000)") return sub.includes("150.000");
        if (filtroSubmodalidade === "ILIMITADA") return sub.toLowerCase().includes("ILIMITADA");

        return true;
    });


    const config =
        acaoModal && acaoModal !== "duplicado"
            ? MODAL_CONFIG[acaoModal]
            : null;

    return (
        <>
            <section className="flex items-center flex-wrap gap-2 pt-6 border-t w-full">
                <button className="btn-primary whitespace-nowrap" onClick={() => setAcaoModal("exportar")}>
                    📊 Exportar Excel
                </button>

                <button className="btn-secondary whitespace-nowrap" onClick={() => setAcaoModal("limpar")}>
                    🧹 Limpar tabela
                </button>

                <button
                    className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                    onClick={() => setAcaoModal("reconsultar")}
                    disabled={processando}
                >
                    <RefreshCw className={processando ? "animate-spin" : ""} size={16} />
                    {processando ? "Processando..." : "Reconsultar erros"}
                </button>

                <button
                    className="btn-secondary whitespace-nowrap"
                    onClick={() => setModalAberto("historico")}
                >
                    📜 Histórico
                </button>

                <button
                    onClick={() => onSalvarBanco(nomeArquivo)}
                    disabled={loading || totalEmpresas === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 border-t border-white/30 whitespace-nowrap"
                >
                    <Database size={14} className={loading ? "animate-pulse" : ""} />
                    {loading ? "Processando..." : "Salvar"}
                </button>


                <FiltrosTabela
                    totalSelecionados={selecionados.size}
                    ordem={ordem}
                    ordemData={ordemData}
                    onAlternarOrdemNome={handleAlternarOrdemNome}
                    onAlternarOrdemData={handleAlternarOrdemData}
                    onRemoverSelecionados={handleRemoverSelecionados}
                    onSelecionarTodos={handleSelecionarTudo}
                    todosSelecionados={
                        selecionados.size === empresasExibidas.length &&
                        empresasExibidas.length > 0
                    }
                    filtroErro={filtroErro}
                    setFiltroErro={setFiltroErro}
                    loading={loading}
                    totalEmpresas={empresas.length}
                    filtroStatus={filtroStatus}
                    setFiltroStatus={setFiltroStatus}
                    temSelecionadoNoBanco={temSelecionadoNoBanco}
                    onDeletarDoBanco={onDeletarDoBanco}
                    filtroSituacao={filtroSituacao}
                    setOrdem={setOrdem}
                    setOrdemData={setOrdemData}
                    setFiltroSituacao={setFiltroSituacao}

                    filtroSubmodalidade={filtroSubmodalidade}
                    setFiltroSubmodalidade={setFiltroSubmodalidade}

                />

                <button
                    onClick={handleRemoverSelecionados}
                    disabled={totalSelecionados === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${totalSelecionados > 0
                        ? "bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/40 hover:bg-red-700"
                        : "bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                >
                    <Trash2 size={14} />
                    Excluir Selecionados ({totalSelecionados})
                </button>
            </section>


            {modalAberto === "historico" && (
                <ModalHistorico
                    onImportar={(ids) => {
                        onImportarHistorico(ids);
                        fecharTudo();
                    }}
                    onClose={fecharTudo}
                />
            )}

            {config && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2 className="modal-title">{config.titulo}</h2>
                        <p className="modal-text">{config.texto}</p>

                        {acaoModal === "exportar" && (
                            <div className="mt-4 space-y-2 text-left">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                                    Nome do Arquivo
                                </label>

                                <input
                                    type="text"
                                    value={nomeArquivo}
                                    onChange={(e) => setNomeArquivo(e.target.value)}
                                    placeholder="Ex: consulta_radar"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
                                />

                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 mt-4">
                                    <div className="flex flex-col text-left">
                                        <label
                                            htmlFor="save-db"
                                            className="text-xs font-bold text-slate-300 cursor-pointer"
                                        >
                                            Salvar no Banco?
                                        </label>
                                        <span className="text-[10px] text-slate-500 uppercase">
                                            Armazena registros no histórico
                                        </span>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id="save-db"
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={enabled}
                                            onChange={() => setEnabled((v) => !v)}
                                        />
                                        <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions mt-5">
                            <button className="btn-secondary modal-btn" onClick={fecharTudo}>
                                Cancelar
                            </button>
                            <button className="btn-primary modal-btn" onClick={confirmarAcao}>
                                {config.confirmarTexto}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {acaoModal === "duplicado" && (
                <div className="modal-overlay">
                    <div className="modal-card max-w-sm">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <AlertTriangle size={24} />
                            <h2 className="text-lg font-bold">Nome já existe!</h2>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 text-left">
                            Já existe uma planilha chamada{" "}
                            <span className="text-white font-bold">
                                "{nomeArquivo}"
                            </span>
                            . Escolha um novo nome abaixo:
                        </p>

                        <input
                            type="text"
                            value={nomeArquivo}
                            onChange={(e) => setNomeArquivo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white mb-6 outline-none focus:ring-2 focus:ring-amber-500"
                        />

                        <div className="modal-actions">
                            <button className="btn-secondary modal-btn" onClick={fecharTudo}>
                                Cancelar
                            </button>
                            <button
                                className="btn-primary modal-btn !bg-amber-600 hover:!bg-amber-500"
                                onClick={confirmarAcao}
                            >
                                Renomear e Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
