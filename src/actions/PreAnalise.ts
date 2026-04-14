"use server";

import db from "@/lib/prisma";
import { auth } from "../../auth";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchApi(endpoint: string, cnpj: string) {
    const session = await auth();
    if (!session) return { error: "Sessão expirada" };

    try {
        const res = await fetch(`${baseUrl}/api/${endpoint}?cnpj=${cnpj}`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Erro na resposta da API");
        return await res.json();
    } catch (error) {
        return { error: true };
    }
}

export async function consultarReceita(cnpj: string) {
    return await fetchApi("ReceitaFederal", cnpj);
}

export async function consultarRadar(cnpj: string) {
    return await fetchApi("ConsultaRadar", cnpj);
}

export async function consultarEmpresaAqui(cnpj: string) {
    return await fetchApi("RadarFiscal", cnpj);
}


export async function upsertConsulta(payload: any) {
    const { rfb, empresaqui, radar, extra } = payload;

    if (!rfb?.dados?.cnpj) return { error: "CNPJ não identificado" };

    const cnpjLimpo = rfb.dados.cnpj.replace(/\D/g, "");

    try {
        const registro = await db.consultaPreAnalise.upsert({
            where: { cnpj: cnpjLimpo },
            update: {
                razaoSocial: rfb.dados.razaoSocial,
                nomeFantasia: rfb.dados.nomeFantasia,
                situacao: rfb.dados.situacao,
                uf: rfb.dados.uf,
                municipio: rfb.dados.municipio,
                regimeEA: empresaqui?.dados?.regimeEA,
                qualificacao: empresaqui?.dados?.qualificacao,
                submodalidade: radar?.dados?.submodalidade,
                capitalSocial: Number(rfb.dados.capitalSocial) || 0,
                dadosBrutos: payload,
                nomeResponsavel: extra?.nomeResponsavel,
                telefoneContato: extra?.telefone,
                observacoes: extra?.observacoes,
            },
            create: {
                cnpj: cnpjLimpo,
                razaoSocial: rfb.dados.razaoSocial,
                nomeFantasia: rfb.dados.nomeFantasia,
                situacao: rfb.dados.situacao,
                uf: rfb.dados.uf,
                municipio: rfb.dados.municipio,
                regimeEA: empresaqui?.dados?.regimeEA,
                qualificacao: empresaqui?.dados?.qualificacao,
                submodalidade: radar?.dados?.submodalidade,
                capitalSocial: Number(rfb.dados.capitalSocial) || 0,
                dadosBrutos: payload,
                nomeResponsavel: extra?.nomeResponsavel,
                telefoneContato: extra?.telefone,
                observacoes: extra?.observacoes,
            },
        });

        return { success: true, id: registro.id };
    } catch (error) {
        console.error("Erro ao salvar consulta:", error);
        return { error: "Erro interno no banco de dados" };
    }
}

export async function buscarHistorico() {
    try {
        const consultas = await db.consultaPreAnalise.findMany({
            take: 20,
            orderBy: { updatedAt: 'desc' }
        });
        return { success: true, data: consultas };
    } catch (error) {
        return { error: "Erro ao carregar histórico" };
    }
}