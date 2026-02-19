"use server"

import { auth } from "../../auth";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";




export async function updateChamadosStatus(id: number, novoStatus: any, solucao?: string){
  try {
    await db.chamados.update({
      where: { id },
      data: { 
        status: novoStatus,
        ...(solucao && { solucao }) // Salva a solução apenas se for enviada
      }
    });

    revalidatePath("/PainelAlpha/Chamados");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}


export async function createChamadoAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const titulo = formData.get("titulo") as string;
  const categoria = formData.get("categoria") as string;
  const prioridade = formData.get("prioridade") as any;
  const descricao = formData.get("descricao") as string;

  try {
    await db.chamados.create({
      data: {
        titulo,
        categoria,
        prioridade,
        descricao,
        usuarioId: Number(session.user.id),
        status: "ABERTO",
      },
    });
  } catch (error) {
    console.error("Erro ao criar chamado:", error);
    throw new Error ("Falha ao registrar chamado." );
  }

  revalidatePath("/PainelAlpha/Chamados");
  redirect("/PainelAlpha/Chamados");
}
