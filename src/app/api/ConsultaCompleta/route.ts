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
    } catch (e) { return null; }
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

        if (!forcar) {
            const existente = await db.consultas_radar.findUnique({ where: { cnpj } });
            if (existente && existente.razao_social && existente.razao_social !== "NÃO ENCONTRADO") {
                return NextResponse.json({
                    ...existente,
                    razaoSocial: existente.razao_social,
                    fonte: "Banco Local"
                });
            }
        }

        const baseUrl = process.env.APP_URL || "http://localhost:3000";

        const [receitaRes, radarRes] = await Promise.allSettled([
            fetch(`${baseUrl}/api/ReceitaFederal?cnpj=${cnpj}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) }),
            fetch(`${baseUrl}/api/ConsultaRadar?cnpj=${cnpj}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
        ]);

        if (receitaRes.status === "rejected" || !receitaRes.value.ok) {
            const status = receitaRes.status === "fulfilled" ? receitaRes.value.status : 504;
            return NextResponse.json({ error: "Receita Federal fora do ar ou limite excedido" }, { status });
        }

        const receita = await receitaRes.value.json();
        if (!receita || receita.error) {
            return NextResponse.json({ error: receita?.error || "Erro na Receita" }, { status: 404 });
        }

        let radar = { situacao: "NÃO HABILITADA", submodalidade: "N/A", contribuinte: "", dataSituacao: "" };
        if (radarRes.status === "fulfilled" && radarRes.value.ok) {
            try {
                const dadosRadar = await radarRes.value.json();
                if (dadosRadar && !dadosRadar.error) {
                    radar = {
                        situacao: dadosRadar.situacao || "NÃO HABILITADA",
                        submodalidade: dadosRadar.submodalidade || "N/A",
                        contribuinte: dadosRadar.contribuinte || "",
                        dataSituacao: dadosRadar.dataSituacao || ""
                    };
                }
            } catch (err) { console.error("Radar retornou JSON inválido"); }
        }

        const payload = {
            cnpj,
            razao_social: String(receita.razaoSocial || receita.nome || "NÃO ENCONTRADO").toUpperCase(),
            nome_fantasia: String(receita.nomeFantasia || receita.fantasia || "").toUpperCase(),
            situacao_radar: String(radar.situacao).toUpperCase(),
            submodalidade: String(radar.submodalidade),
            data_situacao: parseDateBR(radar.dataSituacao || receita.data_situacao_cadastral || receita.data_situacao),
            municipio: String(receita.municipio || "").toUpperCase(),
            uf: String(receita.uf || "").toUpperCase(),
            regime_tributario: String(receita.regimeTributario || ""),
            data_opcao: parseDateBR(receita.data_opcao || receita.data_opcao_simples),
            capital_social: String(receita.capitalSocial || "0"),
            data_constituicao: parseDateBR(receita.dataConstituicao || receita.abertura),
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

        return NextResponse.json({ ...salvo, razaoSocial: salvo.razao_social });

    } catch (error: any) {
        console.error("ERRO NO BACKEND:", error.message);
        return NextResponse.json({ error: "Falha interna" }, { status: 500 });
    }
}