"use server";

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