import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function parseDateBR(value: string | null | undefined): Date | null {
    if (!value || value === "" || value === "N/A") return null;
    const parts = value.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day, 12, 0, 0);
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cnpjRaw = searchParams.get("cnpj") || "";
        const cnpj = cnpjRaw.replace(/\D/g, "").padStart(14, "0").substring(0, 14);
        const forcar = searchParams.get("forcar") === "true";

        if (!cnpj) return NextResponse.json({ error: "CNPJ obrigatório" }, { status: 400 });

        if (forcar) {
            await db.consultas_radar.deleteMany({ where: { cnpj } }).catch(() => null);
        } else {
            const existente = await db.consultas_radar.findUnique({
                where: { cnpj },
            });

            if (existente && existente.razao_social && existente.razao_social !== "NÃO ENCONTRADO") {
                return NextResponse.json({
                    ...existente,
                    razaoSocial: existente.razao_social,
                    nomeFantasia: existente.nome_fantasia,
                    situacao: existente.situacao_radar,
                    dataSituacao: existente.data_situacao,
                    submodalidade: existente.submodalidade,
                    dataConstituicao: existente.data_constituicao,
                    regimeTributario: existente.regime_tributario,
                    capitalSocial: existente.capital_social,
                    dataConsulta: existente.data_consulta,
                    data_opcao: existente.data_opcao
                });
            }
        }

        const baseUrl = process.env.APP_URL || "http://localhost:3000";

        const receitaRes = await fetch(`${baseUrl}/api/ReceitaFederal?cnpj=${cnpj}`, { cache: 'no-store' });
        const receita = await receitaRes.json();

        if (receita.error || !receita.razaoSocial) {
            throw new Error(receita.error || "Dados da Receita não encontrados");
        }

        let radar = { situacao: "NÃO HABILITADA", submodalidade: "N/A", contribuinte: "", dataSituacao: "" };
        try {
            const radarRes = await fetch(`${baseUrl}/api/ConsultaRadar?cnpj=${cnpj}`, { cache: 'no-store' });
            if (radarRes.ok) {
                const dadosRadar = await radarRes.json();
                if (dadosRadar) radar = dadosRadar;
            }
        } catch (e) {
            console.log("Radar não localizado ou erro na consulta externa");
        }

        console.log("======================================================");
        console.log(`DADOS BRUTOS DO CNPJ: ${cnpj}`);
        console.log("------------------------------------------------------");
        console.log("RECEITA FEDERAL (FULL):", JSON.stringify(receita, null, 2));
        console.log("------------------------------------------------------");
        console.log("RADAR (FULL):", JSON.stringify(radar, null, 2));
        console.log("======================================================");

        const situacaoDefinitiva = (radar.situacao && radar.situacao !== "ERRO")
            ? radar.situacao
            : "NÃO HABILITADA";

        const payload = {
            cnpj,
            razao_social: receita.razaoSocial || "NÃO ENCONTRADO",
            nome_fantasia: receita.nomeFantasia || "",
            situacao_radar: situacaoDefinitiva,
            submodalidade: radar.submodalidade || "N/A",
            data_situacao: parseDateBR(radar.dataSituacao),
            municipio: receita.municipio || "",
            uf: receita.uf || "",
            regime_tributario: receita.regimeTributario || "",
            data_opcao: parseDateBR(receita.data_opcao),
            capital_social: String(receita.capitalSocial || ""),
            data_constituicao: parseDateBR(receita.dataConstituicao),
            contribuinte: radar.contribuinte || receita.razaoSocial || "",
            fonte: forcar ? "Reconsulta" : "API",
            json_completo: JSON.stringify({ radar, receita })
        };

        const salvo = await db.consultas_radar.create({ data: payload });

        return NextResponse.json({
            ...salvo,
            cnpj: salvo.cnpj,
            contribuinte: salvo.contribuinte,
            razaoSocial: salvo.razao_social,
            nomeFantasia: salvo.nome_fantasia,
            situacao: salvo.situacao_radar,
            dataSituacao: salvo.data_situacao,
            submodalidade: salvo.submodalidade,
            dataConstituicao: salvo.data_constituicao,
            regimeTributario: salvo.regime_tributario,
            capitalSocial: salvo.capital_social,
            data_opcao: salvo.data_opcao,
            dataConsulta: salvo.data_consulta
        });

    } catch (error: any) {
        console.error("ERRO CONSULTA COMPLETA:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
