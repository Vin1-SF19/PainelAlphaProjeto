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
        <div className="space-y-2 pt-6 border-t">
            <label className="label">
                {processando ? "Processamento em andamento..." : "Importar planilha de CNPJs (lote)"}
            </label>
            <div className="btn-row items-center gap-4">
                <button
                    type="button"
                    className={processando ? "btn-secondary !text-rose-500 border-rose-500/20" : "btn-secondary"}
                    onClick={abrirSeletorArquivo}
                >
                    {processando ? "🛑 Interromper" : "📂 Importar planilha"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleArquivoSelecionado}
                />
            </div>
        </div>
    );
}
