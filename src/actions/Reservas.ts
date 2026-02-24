"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function agendarSala(dados: { sala: string, usuario: string, data: string, inicio: string, fim: string }) {
  try {
    const dataHoraInicio = new Date(`${dados.data}T${dados.inicio}:00`);
    const dataHoraFim = new Date(`${dados.data}T${dados.fim}:00`);

    if (isNaN(dataHoraInicio.getTime()) || isNaN(dataHoraFim.getTime())) {
      return { success: false, error: "Data ou hora inválida." };
    }

    const conflito = await db.reservas.findFirst({
      where: {
        sala: dados.sala,
        status: "Agendado",
        OR: [
          { inicio: { lt: dataHoraFim }, fim: { gt: dataHoraInicio } }
        ]
      }
    });

    if (conflito) return { success: false, error: "Horário já ocupado!" };

    await db.reservas.create({
      data: {
        sala: dados.sala,
        usuario: dados.usuario,
        data: new Date(dados.data),
        inicio: dataHoraInicio,
        fim: dataHoraFim,
        status: "Agendado"
      }
    });

    revalidatePath("/PainelAlpha/ReservaSalas");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao gravar no banco." };
  }
}

export async function liberarSala(id: number) {
  await db.reservas.update({
    where: { id },
    data: { status: "Concluído" }
  });
  revalidatePath("/PainelAlpha/ReservaSalas");
}

export async function cancelarReserva(id: any) {
  try {
    const idLimpo = Number(id);
    if (isNaN(idLimpo)) return { success: false, error: "ID inválido" };

    await db.reservas.delete({ where: { id: idLimpo } });
    revalidatePath("/PainelAlpha/ReservaSalas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro interno no servidor" };
  }
}

export async function buscarReservasAtivas() {
  return await db.reservas.findMany({
    where: { status: "Agendado" },
    orderBy: { inicio: 'asc' }
  });
}

export async function editarReserva(id: number, dados: { data: string, inicio: string, fim: string, sala: string }) {
  try {
    const dataHoraInicio = new Date(`${dados.data}T${dados.inicio}:00`);
    const dataHoraFim = new Date(`${dados.data}T${dados.fim}:00`);

    await db.reservas.update({
      where: { id },
      data: {
        sala: dados.sala,
        data: new Date(dados.data),
        inicio: dataHoraInicio,
        fim: dataHoraFim
      }
    });
    revalidatePath("/PainelAlpha/ReservaSalas");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function buscarHistoricoReservas() {
  try {
    return await db.reservas.findMany({
      where: { status: "Concluído" },
      orderBy: { inicio: 'desc' },
      take: 10
    });
  } catch (error) {
    return [];
  }
}
