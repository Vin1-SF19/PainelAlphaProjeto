"use server";

import  db  from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function SalvarTransacoesLote(transacoes: any[], bancoId: number) {
    try {
        const dadosParaSalvar = transacoes.map(t => {
            return {
                data: String(t.data || ""),
                descricao: String(t.descricao || "SEM DESCRIÇÃO").toUpperCase(),
                valor: parseFloat(t.valor) || 0,
                bancoId: String(t.bancoId || ""),
                mesReferencia: String(t.mesReferencia || ""),
                BancosVinculadosId: Number(bancoId)
            };
        });

        const resultado = await db.transacao.createMany({
            data: dadosParaSalvar,
        });

        revalidatePath("/");
        return { success: true, count: resultado.count };
    } catch (error) {
        console.error("ERRO CRÍTICO NO PRISMA:", error);
        return { success: false, error: "Falha ao salvar transações." };
    }
}


export async function BuscarTransacoesPorBanco(bancoId: number) {
    try {
        const transacoes = await db.transacao.findMany({
            where: { BancosVinculadosId: bancoId },
            orderBy: { data: 'asc' }
        });
        return { success: true, data: transacoes };
    } catch (error) {
        return { success: false, data: [] };
    }
}


export async function DeletarTransacoesLote(ids: string[]) {
    try {
        await db.transacao.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return { success: false, error: "Erro ao excluir do banco." };
    }
}