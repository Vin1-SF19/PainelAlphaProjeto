"use server";

import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { Layout } from "lucide-react";

const client = new TextractClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const converterValor = (t: string) => {
    if (!t) return 0;
    let limpo = t.replace(/[^\d.,-]/g, "");
    if (limpo.includes(",") && limpo.includes(".")) {
        limpo = limpo.replace(/\./g, "").replace(",", ".");
    } else {
        limpo = limpo.replace(",", ".");
    }
    return parseFloat(limpo) || 0;
};

export async function ProcessarExtratoIA(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const layoutRaw = String(formData.get("layoutAlvo") || "");
        const layoutAlvo = layoutRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        let dataCorrente = String(formData.get("ultimaData") || "");

        if (!file) return { success: false, error: "Arquivo vazio" };
        const buffer = Buffer.from(await file.arrayBuffer());

        const response = await client.send(new AnalyzeDocumentCommand({
            Document: { Bytes: buffer },
            FeatureTypes: ["TABLES"],
        }));

        const blocks = response.Blocks || [];
        const tables = blocks.filter(b => b.BlockType === "TABLE");
        const extratoFinal: any[] = [];

        const eItau = layoutAlvo.includes("itau");
        const eBB = layoutAlvo.includes("brasil") || layoutAlvo.includes("bb");
        const eBradesco = layoutAlvo.includes("bradesco");
        const eSantander = layoutAlvo.includes("santander");


        tables.forEach((table, tIdx) => {
            const rows: Record<number, Record<number, string>> = {};
            const cellIds = table.Relationships?.[0]?.Ids || [];

            cellIds.forEach(id => {
                const cell = blocks.find(b => b.Id === id);
                if (cell && cell.RowIndex !== undefined && cell.ColumnIndex !== undefined) {
                    const txt = blocks
                        .filter(b => cell.Relationships?.[0]?.Ids?.includes(b.Id || ""))
                        .map(b => b.Text).join(" ").trim();
                    if (!rows[cell.RowIndex]) rows[cell.RowIndex] = {};
                    rows[cell.RowIndex][cell.ColumnIndex] = txt;
                }
            });

            Object.keys(rows).map(Number).sort((a, b) => a - b).forEach(idx => {
                const r = rows[idx];

                if (r[1] && r[1].includes("/")) {
                    const match = r[1].match(/(\d{2}\/\d{2}(\/\d{4})?)/);
                    if (match) {
                        dataCorrente = match[0];
                    }
                }

                if (eItau) {
                    const vE = converterValor(r[3]);
                    const vS = converterValor(r[4]);
                    if (vE !== 0 || vS !== 0) {
                        extratoFinal.push({
                            id: `it-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO",
                            valor: vS !== 0 ? -Math.abs(vS) : vE
                        });
                    }
                }
                else if (eBB) {
                    const vBB = converterValor(r[5]);
                    if (vBB !== 0 && !(r[4] || "").toLowerCase().includes("saldo")) {
                        extratoFinal.push({
                            id: `bb-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[4] || "LANÇAMENTO BB",
                            valor: vBB
                        });
                    }
                }
                else if (eBradesco) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);
                    if (vE !== 0 || vS !== 0) {
                        extratoFinal.push({
                            id: `it-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO Bradesco",
                            valor: vS !== 0 ? -Math.abs(vS) : vE
                        });
                    }
                }
                else if (eSantander) {
                    const vE = converterValor(r[4]);
                    const vS = converterValor(r[5]);
                    if (vE !== 0 || vS !== 0) {
                        extratoFinal.push({
                            id: `it-${tIdx}-${idx}-${Math.random()}`,
                            data: dataCorrente,
                            descricao: r[2] || "LANÇAMENTO Bradesco",
                            valor: vS !== 0 ? -Math.abs(vS) : vE
                        });
                    }
                }
            });
        });

        return { success: true, data: extratoFinal, ultimaDataEncontrada: dataCorrente };
    } catch (e) {
        return { success: false, error: "Erro" };
    }
}