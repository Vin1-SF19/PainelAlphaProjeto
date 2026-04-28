"use server"

import db from "@/lib/prisma";
import { startOfMonth, startOfWeek, startOfDay, endOfDay, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getPerformanceColaborador(colaboradoraId: string, data: Date) {
  try {
    const registros = await db.comercialPerformance.findMany({
      where: {
        colaboradoraId,
        dataRegistro: {
          gte: startOfDay(new Date(data)),
          lte: endOfDay(new Date(data)),
        },
      },
    });

    return registros;
  } catch (error) {
    console.error("Erro ao buscar performance:", error);
    return [];
  }
}

export async function upsertPerformance(dados: any) {
  try {
    const dataNormalizada = startOfDay(new Date(dados.dataRegistro));

    const registro = await db.comercialPerformance.upsert({
      where: {
        performance_pk: {
          dataRegistro: dataNormalizada,
          colaboradoraId: dados.colaboradoraId,
          canal: dados.canal,
          servico: dados.servico,
        },
      },
      update: {
        leadsRecebidos: Number(dados.leadsRecebidos) || 0,
        leadsDesqualificados: Number(dados.leadsDesqualificados) || 0,
        reunioesAgendadas: Number(dados.reunioesAgendadas) || 0,
        reunioesRealizadas: Number(dados.reunioesRealizadas) || 0,
        noShow: Number(dados.noShow) || 0,
        contratosHabilitacao: Number(dados.contratosHabilitacao) || 0,
        contratosRevisao: Number(dados.contratosRevisao) || 0,
        HotLeadsHabilitacao: Number(dados.HotLeadsHabilitacao) || 0,
        HotLeadsRevisao: Number(dados.HotLeadsRevisao) || 0,
      },
      create: {
        dataRegistro: dataNormalizada,
        colaboradoraId: dados.colaboradoraId,
        canal: dados.canal,
        servico: dados.servico,
        leadsRecebidos: Number(dados.leadsRecebidos) || 0,
        leadsDesqualificados: Number(dados.leadsDesqualificados) || 0,
        reunioesAgendadas: Number(dados.reunioesAgendadas) || 0,
        reunioesRealizadas: Number(dados.reunioesRealizadas) || 0,
        noShow: Number(dados.noShow) || 0,
        contratosHabilitacao: Number(dados.contratosHabilitacao) || 0,
        contratosRevisao: Number(dados.contratosRevisao) || 0,
        HotLeadsHabilitacao: Number(dados.HotLeadsHabilitacao) || 0,
        HotLeadsRevisao: Number(dados.HotLeadsRevisao) || 0,
      },
    });

    revalidatePath("/PainelAlpha/ControleLeads/Lancamentos");
    return { success: true, data: registro };
  } catch (error) {
    console.error("Erro ao salvar performance:", error);
    return { success: false, error: "Falha ao sincronizar com o banco." };
  }
}

export async function getPerformanceDiaria(colaboradoraId: string, data: Date, canal: string) {
  try {
    const registros = await db.comercialPerformance.findMany({
      where: {
        colaboradoraId,
        canal,
        dataRegistro: {
          gte: startOfDay(new Date(data)),
          lte: endOfDay(new Date(data)),
        },
      },
    });

    return registros.reduce((acc, reg) => ({
      leads_recebidos: acc.leads_recebidos + (reg.leadsRecebidos || 0),
      leads_desqualificados: acc.leads_desqualificados + (reg.leadsDesqualificados || 0),
      reunioes_agendadas: acc.reunioes_agendadas + (reg.reunioesAgendadas || 0),
      reunioes_realizadas: acc.reunioes_realizadas + (reg.reunioesRealizadas || 0),
      no_show: acc.no_show + (reg.noShow || 0),
      contratos_Habilit: acc.contratos_Habilit + (reg.contratosHabilitacao || 0),
      contratos_Revisao: acc.contratos_Revisao + (reg.contratosRevisao || 0),
      // ADICIONE ESTAS DUAS LINHAS EXATAMENTE ASSIM:
      HotLeadsHabilitacao: acc.HotLeadsHabilitacao + (reg.HotLeadsHabilitacao || 0),
      HotLeadsRevisao: acc.HotLeadsRevisao + (reg.HotLeadsRevisao || 0)
    }), {
      leads_recebidos: 0, leads_desqualificados: 0, reunioes_agendadas: 0,
      reunioes_realizadas: 0, no_show: 0, contratos_Habilit: 0, contratos_Revisao: 0,
      HotLeadsHabilitacao: 0, HotLeadsRevisao: 0 
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPerformanceAcumulada(colaboradoraId: string, mes: number, ano: number) {
  try {
    const dataReferencia = new Date(ano, mes, 1);
    const inicioMes = startOfMonth(dataReferencia);
    const fimMes = endOfMonth(dataReferencia);

    const registrosMes = await db.comercialPerformance.findMany({
      where: {
        colaboradoraId,
        dataRegistro: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    const soma = (regs: any[]) => regs.reduce((acc, reg) => ({
      leads: acc.leads + (reg.leadsRecebidos || 0),
      leadsDesqualificados: acc.leadsDesqualificados + (reg.leadsDesqualificados || 0),
      agendadas: acc.agendadas + (reg.reunioesAgendadas || 0),
      realizadas: acc.realizadas + (reg.reunioesRealizadas || 0),
      noShow: acc.noShow + (reg.noShow || 0),
      habilitacao: acc.habilitacao + (reg.contratosHabilitacao || 0),
      revisao: acc.revisao + (reg.contratosRevisao || 0),
      HotLeadsHabilitacao: acc.HotLeadsHabilitacao + (reg.HotLeadsHabilitacao || 0),
      HotLeadsRevisao: acc.HotLeadsRevisao + (reg.HotLeadsRevisao || 0)
    }), { 
      leads: 0, 
      leadsDesqualificados: 0, 
      agendadas: 0, 
      realizadas: 0, 
      noShow: 0, 
      habilitacao: 0, 
      revisao: 0, 
      HotLeadsHabilitacao: 0, 
      HotLeadsRevisao: 0 
    });

    return {
      canais: {
        TRAFEGO_PAGO: soma(registrosMes.filter(r => r.canal === "TRAFEGO_PAGO")),
        CALLIX: soma(registrosMes.filter(r => r.canal === "CALLIX")),
        INDICACAO: soma(registrosMes.filter(r => r.canal === "INDICACAO")),
        EVENTOS: soma(registrosMes.filter(r => r.canal === "EVENTOS")),
        CHINA: soma(registrosMes.filter(r => r.canal === "CHINA")),
      }
    };
  } catch (error) {
    console.error("Erro no acumulado:", error);
    const vazio = { leads: 0, leadsDesqualificados: 0, agendadas: 0, realizadas: 0, noShow: 0, habilitacao: 0, revisao: 0, HotLeadsHabilitacao: 0, HotLeadsRevisao: 0 };
    return {
      canais: {
        TRAFEGO_PAGO: vazio,
        CALLIX: vazio,
        INDICACAO: vazio,
        EVENTOS: vazio,
        CHINA: vazio
      }
    };
  }
}