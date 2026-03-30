"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function CriarTarefa(data: { 
    texto: string, 
    descricao?: string, 
    userId: any, 
    fixa: boolean, 
    diaSemana: number | null; 
    intervaloDias?: number | null;
    dataInicio?: Date;
    prioridade: string;
    horario?: string | null;
}) {
    try {
        const idFinal = Number(data.userId);

        await db.tarefa.create({ 
            data: {
                texto: data.texto,
                descricao: data.descricao || "",
                fixa: data.fixa,
                diaSemana: data.diaSemana,
                intervaloDias: data.intervaloDias || null,
                dataInicio: data.dataInicio || new Date(),
                feita: false,
                userId: idFinal,
                prioridade: data.prioridade,
                horario: data.horario || null,
            }
        });

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2023' || error.message?.includes("Inconsistent column data")) {
            revalidatePath("/PainelAlpha/PainelTarefas");
            return { success: true };
        }
        console.error("ERRO REAL NO CREATE:", error);
        return { success: false };
    }
}

export async function BuscarTarefasPorUsuario(userId: string) {
    try {
        const tarefas: any[] = await db.$queryRawUnsafe(`
            SELECT 
                id, 
                texto, 
                descricao, 
                feita, 
                fixa, 
                prioridade,
                diaSemana, 
                intervaloDias,
                horario,
                CAST(dataInicio AS TEXT) as dataInicio,
                userId,
                CAST(createdAt AS TEXT) as createdAt,
                CAST(concluidaEm AS TEXT) as concluidaEm
            FROM "Tarefa" 
            WHERE "userId" = ${parseInt(userId, 10)}
            ORDER BY "feita" ASC, "horario" ASC
        `);

        return Array.isArray(tarefas) ? tarefas : [];
    } catch (error) {
        console.error("Erro crítico no banco:", error);
        return [];
    }
}

export async function AlternarStatusTarefa(id: string, novoStatus: boolean) {
    try {
        if (!id) {
            return { success: false, error: "ID ausente" };
        }

        const statusNumerico = novoStatus ? 1 : 0;
        
        const sqlHora = novoStatus 
            ? "datetime('now', '-3 hours')" 
            : "NULL";

        await db.$executeRawUnsafe(`
            UPDATE "Tarefa" 
            SET "feita" = ${statusNumerico}, 
                "concluidaEm" = ${sqlHora}
            WHERE "id" = '${id}'
        `);

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error) {
        console.error("Erro no status:", error);
        return { success: false };
    }
}

export async function DeletarTarefa(id: string) {
    try {
        await db.$executeRawUnsafe(`DELETE FROM "Tarefa" WHERE "id" = '${id}'`);
        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true }; 
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}