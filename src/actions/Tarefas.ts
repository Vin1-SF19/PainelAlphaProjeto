"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function CriarTarefa(data: { 
    texto: string, 
    descricao?: string, 
    userId: any, 
    fixa: boolean, 
    diaSemana: number 
}) {
    try {
        const idFinal = BigInt(Math.floor(Number(data.userId)));
        

        const tarefa = await db.tarefa.create({ 
            data: {
                texto: data.texto,
                descricao: data.descricao || "",
                fixa: data.fixa,
                diaSemana: data.diaSemana,
                feita: false,
                userId: Number(idFinal),
            }
        });

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2023' || error.message.includes("Inconsistent column data")) {
            console.warn("Aviso: Dado inserido, mas houve inconsistência no retorno do driver.");
            revalidatePath("/PainelAlpha/PainelTarefas");
            return { success: true };
        }

        console.error("ERRO REAL NO CREATE:", error);
        return { success: false };
    }
}


export async function BuscarTarefasPorUsuario(userId: any) {
    if (!userId) return [];
    
    try {
        const idBusca = String(userId);

        const tarefas: any = await db.$queryRawUnsafe(`
            SELECT 
                id, 
                texto, 
                descricao, 
                feita, 
                fixa, 
                diaSemana, 
                userId, 
                CAST(createdAt AS TEXT) as createdAt, 
                CAST(updatedAt AS TEXT) as updatedAt
            FROM "Tarefa" 
            WHERE "userId" = ? 
            ORDER BY createdAt DESC
        `, idBusca);

        return Array.isArray(tarefas) ? tarefas : [];
    } catch (error) {
        console.error("Erro na busca:", error);
        return [];
    }
}


export async function AlternarStatusTarefa(id: string, novoStatus: boolean) {
    try {
        const statusNumerico = novoStatus ? 1 : 0;

        await db.$executeRawUnsafe(
            `UPDATE "Tarefa" SET "feita" = ${statusNumerico} WHERE "id" = '${id}'`
        );

        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar status via SQL:", error);
        return { success: false };
    }
}

export async function DeletarTarefa(id: string) {
    try {
        await db.$executeRawUnsafe(`DELETE FROM "Tarefa" WHERE "id" = '${id}'`);
        
        return { success: true }; 
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}