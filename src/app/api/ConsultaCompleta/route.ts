import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function parseDateBR(value: string | null | undefined): string | null {
    if (!value || value === "" || value === "N/A") return null;
    const parts = value.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;

    return new Date(year, month - 1, day, 12, 0, 0).toISOString();
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

            if (existente && existente.razao_social && existente.razao_social !== "NÃO ENCONTRADO" && existente.situacao_radar !== "NÃO HABILITADA") {
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

        let radar = { situacao: "", submodalidade: "N/A", contribuinte: "", dataSituacao: "" };
        let erroRadar = false;

        try {
            const radarRes = await fetch(`${baseUrl}/api/ConsultaRadar?cnpj=${cnpj}`, { cache: 'no-store' });
            if (radarRes.ok) {
                const dadosRadar = await radarRes.json();
                if (dadosRadar && dadosRadar.situacao) {
                    radar = dadosRadar;
                } else {
                    erroRadar = true;
                }
            } else {
                erroRadar = true;
            }
        } catch (e) {
            erroRadar = true;
            console.log("Erro na consulta externa do Radar");
        }

        const radarVazioTotal = !radar.situacao && !radar.submodalidade && !radar.dataSituacao && !radar.contribuinte;
        const radarIncompleto = !radar.situacao || !radar.submodalidade || !radar.dataSituacao;


        let situacaoDefinitiva = "";

        if (radarVazioTotal && !erroRadar) {
            situacaoDefinitiva = "NÃO HABILITADA";
        } else if (radarIncompleto || erroRadar) {
            situacaoDefinitiva = "NÃO HABILITADA";
        } else {
            situacaoDefinitiva = radar.situacao.toUpperCase();
        }

        const payload = {
           cnpj,
            razao_social: (receita.razaoSocial || "NÃO ENCONTRADO").toUpperCase(),
            nome_fantasia: (receita.nomeFantasia || "").toUpperCase(),
            situacao_radar: situacaoDefinitiva,
            submodalidade: radar.submodalidade || "N/A",
            data_situacao: parseDateBR(radar.dataSituacao || receita.data_situacao_cadastral || receita.dataSituacao),
            municipio: (receita.municipio || "").toUpperCase(),
            uf: (receita.uf || "").toUpperCase(),
            regime_tributario: receita.regimeTributario || "",
            data_opcao: parseDateBR(receita.data_opcao || receita.DataSimples),
            capital_social: String(receita.capitalSocial || ""),
            data_constituicao: parseDateBR(receita.dataConstituicao || receita.data_inicio_atividade),
            contribuinte: (radar.contribuinte || receita.razaoSocial || "").toUpperCase(),
            fonte: forcar ? "Reconsulta" : "API",
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
            municipio: salvo.municipio,
            uf: salvo.uf,
            data_opcao: salvo.data_opcao,
            dataConsulta: salvo.data_consulta,
            fonte: salvo.fonte
        });


    } catch (error: any) {
        console.error("ERRO CONSULTA COMPLETA:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
