import * as XLSX from "xlsx";
import { useRef } from "react";

type Empresa = {
    dataConsulta: string;
    cnpj: string;
    contribuinte: string;
    situacao: string;
    dataSituacao: string;
    submodalidade: string;
    razaoSocial: string;
    nomeFantasia: string;
    municipio: string;
    uf: string;
    dataConstituicao: string;
    regimeTributario: string;
    data_opcao: string;
    capitalSocial: string;
};

type Props = {
    onImportar: (dados: any[]) => void;
    processando: boolean;
    onCancelar: () => void;
    statusLote: string;
    processadas: number;
    totalLote: number;
};

export default function ImportarPlanilha({
    onImportar,
    processando,
    onCancelar,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const converterDataExcel = (valor: any) => {
        if (!valor || valor === "" || valor === "N/A") return "";
        if (typeof valor === 'number') {
            const data = new Date((valor - 25569) * 86400 * 1000);
            return data.toLocaleDateString("pt-BR");
        }
        return String(valor);
    };

    function abrirSeletorArquivo() {
        if (processando) {
            onCancelar();
        } else {
            fileInputRef.current?.click();
        }
    }

    async function handleArquivoSelecionado(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let empresasImportadas: Empresa[] = [];

        for (const file of Array.from(files)) {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            rows.forEach((row) => {
                const valorCnpj = row["CNPJ"] || row["cnpj"] || Object.values(row)[0];
                const cnpjBruto = String(valorCnpj || "").replace(/\D/g, "");
                
                const cnpjLimpo = cnpjBruto.padStart(14, "0").substring(0, 14);

                if (cnpjLimpo.length < 11) return;

                empresasImportadas.push({
                    dataConsulta: converterDataExcel(row["Data Consulta"] || row["dataConsulta"]),
                    cnpj: cnpjLimpo,
                    contribuinte: String(row["Contribuinte"] || row["contribuinte"] || ""),
                    situacao: String(row["Situação"] || row["Situacao"] || row["situacao"] || ""),
                    dataSituacao: converterDataExcel(row["Data Situacao"] || row["dataSituacao"] || row["Data"]),
                    submodalidade: String(row["Submodalidade"] || row["submodalidade"] || ""),
                    razaoSocial: String(row["Razão Social"] || row["Razao Social"] || row["razaoSocial"] || ""),
                    nomeFantasia: String(row["Nome Fantasia"] || row["nomeFantasia"] || ""),
                    municipio: String(row["Município"] || row["Municipio"] || row["municipio"] || ""),
                    uf: String(row["UF"] || row["uf"] || ""),
                    dataConstituicao: converterDataExcel(row["Data Constituição"] || row["dataConstituicao"]),
                    regimeTributario: String(row["Regime Tributário"] || row["Regime Tributario"] || row["regimeTributario"] || ""),
                    data_opcao: converterDataExcel(row["Data Opção"] || row["data_opcao"] || row.DataSimples),
                    capitalSocial: String(row["Capital Social"] || row["capitalSocial"] || row["Capital"] || ""),
                });
            });
        }

        if (empresasImportadas.length > 0) {
            onImportar(empresasImportadas);
        }
        event.target.value = "";
    }


    return (
        <div className="pt-6 border-t border-white/5 space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
        {processando ? "Status do Processamento" : "Carga de Dados em Lote"}
        </label>
        
            <div className="relative group">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleArquivoSelecionado}
                />
                
                <button
                    onClick={abrirSeletorArquivo}
                    className={`w-full h-16 rounded-[1.5rem] flex items-center justify-between px-8 transition-all duration-500 border ${
                        processando 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 text-white shadow-2xl hover:shadow-blue-500/10'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                            processando ? 'border-red-500/20 bg-red-500/20 animate-pulse' : 'border-white/10 bg-white/5'
                        }`}>
                            {processando ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            )}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest italic">
                            {processando ? "INTERROMPER IMPORTAÇÃO" : "CARREGAR PLANILHA"}
                        </span>
                    </div>
        
                    {!processando && (
                        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold uppercase tracking-tighter">CSV / XLSX</span>
                        </div>
                    )}
                </button>
        
                {processando && (
                    <div className="absolute -bottom-1 left-0 h-[2px] bg-red-500 transition-all duration-300 w-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                )}
            </div>
        </div>
        
        );
}
