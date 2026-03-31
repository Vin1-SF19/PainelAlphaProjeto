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

export async function BuscarTarefasPorUsuario(userId: string, role: string) {
    try {
        const condicaoUsuario = role === "Admin" 
            ? "1=1" 
            : `"userId" = ${parseInt(userId, 10)}`;

        const filtroEquipe = `LOWER("descricao") NOT LIKE '%equipe%'`;

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
            WHERE (${condicaoUsuario}) AND (${filtroEquipe})
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
        if (!id) return { success: false, error: "ID ausente" };

        await db.tarefa.update({
            where: { id: id },
            data: {
                feita: novoStatus,
                concluidaEm: novoStatus ? new Date() : null
            }
        });

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
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

export async function EditarTarefa(id: string, data: {
    texto: string,
    descricao?: string,
    fixa: boolean,
    diasSemana?: number[];
    intervaloDias?: number | null;
    dataInicio?: Date;
    prioridade: string;
    horario?: string | null;
}) {
    try {

        const feitaStatus = 0;
        const diaSemanaFinal = data.diasSemana && data.diasSemana.length > 0 ? data.diasSemana[0] : null;

        await db.$executeRawUnsafe(`
            UPDATE "Tarefa" 
            SET "texto" = '${data.texto.replace(/'/g, "''")}', 
                "descricao" = '${(data.descricao || "").replace(/'/g, "''")}', 
                "prioridade" = '${data.prioridade}',
                "fixa" = ${data.fixa ? 1 : 0},
                "diaSemana" = ${diaSemanaFinal !== null ? diaSemanaFinal : 'NULL'},
                "intervaloDias" = ${data.intervaloDias !== null ? data.intervaloDias : 'NULL'},
                "horario" = ${data.horario ? `'${data.horario}'` : 'NULL'},
                "dataInicio" = '${data.dataInicio?.toISOString()}'
            WHERE "id" = '${id}'
        `);

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error) {
        console.error("ERRO AO EDITAR:", error);
        return { success: false };
    }
}