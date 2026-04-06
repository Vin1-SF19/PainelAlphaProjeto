import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function parseDateBR(value: any): string | null {
    if (!value || value === "" || value === "N/A" || typeof value === 'undefined') return null;

    try {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) return dateObj.toISOString();

        if (typeof value === 'string' && value.includes("/")) {
            const parts = value.split("/");
            if (parts.length === 3) {
                const [day, month, year] = parts.map(Number);
                const d = new Date(year, month - 1, day, 12, 0, 0);
                if (!isNaN(d.getTime())) return d.toISOString();
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cnpjRaw = searchParams.get("cnpj") || "";
        const cnpj = cnpjRaw.replace(/\D/g, "").padStart(14, "0").substring(0, 14);
        const forcar = searchParams.get("forcar") === "true";

        if (!cnpj || cnpj === "00000000000000") {
            return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
        }

        if (forcar) {
            await db.consultas_radar.deleteMany({ where: { cnpj } }).catch(() => null);
        } else {
            const existente = await db.consultas_radar.findUnique({ where: { cnpj } });
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
                    data_opcao: existente.data_opcao,
                    fonte: "Banco Local"
                });
            }
        }

        // URL CORRIGIDA PARA LOCALHOST:3000
        const baseUrl = process.env.APP_URL || "http://localhost:3000";

        const receitaRes = await fetch(`${baseUrl}/api/ReceitaFederal?cnpj=${cnpj}`, { 
            cache: 'no-store'
        });
        const receita = await receitaRes.json();

        if (!receita || receita.error || !receita.razaoSocial) {
            return NextResponse.json({ error: receita?.error || "CNPJ não encontrado" }, { status: 404 });
        }

        let radar = { situacao: "NÃO HABILITADA", submodalidade: "N/A", contribuinte: "", dataSituacao: "" };
        try {
            const radarRes = await fetch(`${baseUrl}/api/ConsultaRadar?cnpj=${cnpj}`, { 
                cache: 'no-store'
            });
            if (radarRes.ok) {
                const dadosRadar = await radarRes.json();
                if (dadosRadar && !dadosRadar.error) radar = dadosRadar;
            }
        } catch (e) {
            // Falha silenciosa no radar para não impedir o salvamento dos dados da receita
        }

        const payload = {
            cnpj,
            razao_social: String(receita.razaoSocial || "NÃO ENCONTRADO").toUpperCase(),
            nome_fantasia: String(receita.nomeFantasia || "").toUpperCase(),
            situacao_radar: String(radar.situacao || "NÃO HABILITADA").toUpperCase(),
            submodalidade: String(radar.submodalidade || "N/A"),
            data_situacao: parseDateBR(radar.dataSituacao || receita.data_situacao_cadastral || receita.dataSituacao),
            municipio: String(receita.municipio || "").toUpperCase(),
            uf: String(receita.uf || "").toUpperCase(),
            regime_tributario: String(receita.regimeTributario || ""),
            data_opcao: parseDateBR(receita.data_opcao || receita.DataSimples || receita.dataOpcao),
            capital_social: String(receita.capitalSocial || "0"),
            data_constituicao: parseDateBR(receita.dataConstituicao || receita.data_inicio_atividade),
            contribuinte: String(radar.contribuinte || receita.razaoSocial || "").toUpperCase(),
            fonte: forcar ? "Reconsulta" : "API Externa",
            json_completo: JSON.stringify({ radar, receita }),
            data_consulta: new Date().toISOString()
        };

        const salvo = await db.consultas_radar.upsert({
            where: { cnpj },
            update: payload,
            create: payload
        });

        return NextResponse.json({
            ...salvo,
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
        console.error("ERRO CRÍTICO NA ROTA:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}