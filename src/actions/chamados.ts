"use server"

import { auth } from "../../auth";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Pusher from "pusher";


const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function updateChamadosStatus(id: number, novoStatus: any, solucao?: string) {
  try {
    await db.chamados.update({
      where: { id },
      data: {
        status: novoStatus,
        ...(solucao && { solucao })
      }
    });

    revalidatePath("/PainelAlpha/Chamados");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar status." };
  }
}

export async function createChamadoAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Sessão expirada. Refaça o login." };

  const titulo = (formData.get("titulo") as string).trim();
  const categoria = formData.get("categoria") as string;
  const prioridade = formData.get("prioridade") as any;
  const descricao = (formData.get("descricao") as string).trim();

  try {
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
    const duplicado = await db.chamados.findFirst({
      where: {
        usuarioId: Number(session.user.id),
        titulo,
        createdAt: { gte: cincoMinutosAtras }
      }
    });

    if (duplicado) {
      return { error: "Você já enviou um chamado similar recentemente. Aguarde 5 minutos." };
    }

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
    return { error: "Falha ao registrar chamado no banco de dados." };
  }

  revalidatePath("/PainelAlpha/Chamados");
  redirect("/PainelAlpha/Chamados");
}

export async function enviarMensagemAction(
  chamadoId: number, 
  texto?: string,
  arquivoUrl?: string, 
  arquivoTipo?: string
) {
  const session = await auth();
  if (!session) return { error: "Não autorizado" };

  try {
    const novaMsg = await db.mensagensChamado.create({
      data: {
        texto: texto || "",
        chamadoId: Number(chamadoId),
        autorId: Number(session.user.id),
        arquivoUrl: arquivoUrl || null,
        arquivoTipo: arquivoTipo || null,
      },
      include: { autor: true }
    });

    await pusher.trigger(`chat-${Number(chamadoId)}`, "nova-mensagem", novaMsg);
    return { success: true };

  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO NO PRISMA:", error.message || error);
    return { error: "Erro interno no banco de dados" };
  }
}


export async function marcarComoLidaAction(chamadoId: number, isAdmin: boolean) {
  try {
    await db.mensagensChamado.updateMany({
      where: {
        chamadoId: Number(chamadoId), 
      },
      data: isAdmin ? { lida_admin: true } : { lida_usuario: true }
    });

    revalidatePath("/PainelAlpha/Chamados"); 
    
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar" };
  }
}

