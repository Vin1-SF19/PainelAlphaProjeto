"use server"

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const toBRT = (dateStr: string, timeStr: string) => {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
};

const formatToISO = (date: Date) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
};

export async function agendarSala(dados: { sala: string, usuario: string, data: string, inicio: string, fim: string }) {
  try {
    const dataHoraInicio = toBRT(dados.data, dados.inicio);
    const dataHoraFim = toBRT(dados.data, dados.fim);

    if (isNaN(dataHoraInicio.getTime()) || isNaN(dataHoraFim.getTime())) {
      return { success: false, error: "Data ou hora inválida." };
    }

    if (dataHoraInicio >= dataHoraFim) {
      return { success: false, error: "O início deve ser antes do fim." };
    }

    const conflito = await db.reservas.findFirst({
      where: {
        sala: dados.sala,
        status: "Agendado",
        OR: [
          {
            AND: [
              { inicio: { lt: dataHoraFim } },
              { fim: { gt: dataHoraInicio } }
            ]
          }
        ]
      }
    });

    if (conflito) return { success: false, error: "Horário já ocupado!" };

    await db.reservas.create({
      data: {
        sala: dados.sala,
        usuario: dados.usuario,
        data: toBRT(dados.data, "00:00"),
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
  try {
    await db.reservas.update({
      where: { id },
      data: { status: "Concluído" }
    });
    revalidatePath("/PainelAlpha/ReservaSalas");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
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
  try {
    return await db.reservas.findMany({
      where: { status: "Agendado" },
      orderBy: { inicio: 'asc' }
    });
  } catch (e) {
    return [];
  }
}

export async function editarReserva(id: number, dados: { data: string, inicio: string, fim: string, sala: string }) {
  try {
    const dataHoraInicio = toBRT(dados.data, dados.inicio);
    const dataHoraFim = toBRT(dados.data, dados.fim);

    const conflito = await db.reservas.findFirst({
      where: {
        id: { not: id },
        sala: dados.sala,
        status: "Agendado",
        AND: [
          { inicio: { lt: dataHoraFim } },
          { fim: { gt: dataHoraInicio } }
        ]
      }
    });

    if (conflito) return { success: false, error: "Conflito com outra reserva!" };

    await db.reservas.update({
      where: { id },
      data: {
        sala: dados.sala,
        data: toBRT(dados.data, "00:00"),
        inicio: dataHoraInicio,
        fim: dataHoraFim
      }
    });
    revalidatePath("/PainelAlpha/ReservaSalas");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erro ao atualizar." };
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
