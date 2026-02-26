"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function CadastrarCliente(dados: any, socios: any[]) {
  console.log("TABELAS QUE O PRISMA ENXERGA:", Object.keys(db).filter(key => !key.startsWith('_')));

  try {
    const res = await db.clientes.create({
      data: {
        cnpj: dados.cnpj.replace(/\D/g, ""),
        razaoSocial: dados.razaoSocial || "",
        nomeFantasia: dados.nomeFantasia || "",
        dataConstituicao: dados.dataConstituicao || "",
        uf: dados.uf || "",
        regimeTributario: dados.regimeTributario || "",
        servicos: Array.isArray(dados.servicos) ? dados.servicos.join(", ") : dados.servicos,
        analistaResponsavel: dados.analistaResponsavel || "",
        dataContratacao: new Date(dados.dataContratacao),

        socios: {
          create: socios.map(s => ({
            nome: s.nome,
            telefone: s.telefone || "",
            obs: s.obs || ""
          }))
        }
      }
    });

    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error: any) {

    console.error("--- ERRO NO PRISMA/TURSO ---");
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("Meta:", error.meta);

    if (error.code === 'P2002') return { success: false, error: "CNPJ já existe!" };


    return { success: false, error: `Erro: ${error.message.substring(0, 50)}...` };
  }
}

export async function buscarClientes() {
  try {
    const lista = await db.clientes.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        socios: true,
        log_cs: true,
        logFeedback: true,
        logAlteracao: true,
      }
    });
    return lista;
  } catch (error: any) {
    console.log("-----------------------------------------");
    console.error("ERRO DO PRISMA:", error);
    console.log("-----------------------------------------");
    return [];
  }
}

export async function salvarLogCS(clienteId: number, dados: { colaborador: string, sentimento: string, observacao: string }) {
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO log_cs (colaborador, sentimento, observacao, clienteId, dataRegistro) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      dados.colaborador,
      dados.sentimento,
      dados.observacao,
      clienteId
    );

    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO NO SQL DIRETO:", error.message);
    return { success: false, error: "Erro crítico no banco." };
  }
}

export async function atualizarDadosGestao(clienteId: number, dados: any) {
  try {
    await db.clientes.update({
      where: { id: clienteId },
      data: {
        nps: Number(dados.nps),
        feedbackGoogle: Boolean(dados.feedbackGoogle),
        nomeGoogle: dados.nomeGoogle,
        status: dados.status
      }
    });
    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function salvarLogFeedback(clienteId: number, dados: any) {
  try {
    const colaborador = dados.colaborador || "Analista";
    const sentimento = dados.sentimento || "na";
    const observacao = dados.observacao || "";

    await db.$executeRawUnsafe(
      `INSERT INTO logFeedback (colaborador, sentimento, observacao, clienteId) 
       VALUES (?, ?, ?, ?)`,
      colaborador,
      sentimento,
      observacao,
      Number(clienteId)
    );

    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO CRÍTICO TURSO FEEDBACK:", error.message);
    return { success: false, error: error.message };
  }
}

export async function salvarAlteracoesGestao(clienteId: number, novosDados: any, colaborador: string) {
  try {
    const estadoAntesDaMudanca = await db.clientes.findUnique({
      where: { id: clienteId }
    });

    if (!estadoAntesDaMudanca) return { success: false, error: "Cliente não encontrado" };

    await db.logAlteracao.create({
      data: {
        clienteId: clienteId,
        colaborador: colaborador,
        acao: "Edição de Dados",
        dadosAnteriores: JSON.stringify(estadoAntesDaMudanca) 
      }
    });

    await db.clientes.update({
      where: { id: clienteId },
      data: {
        status: novosDados.status,
        nps: Number(novosDados.nps),
        feedbackGoogle: novosDados.feedbackGoogle,
        nomeGoogle: novosDados.nomeGoogle,
        dataExito: novosDados.status === "Deferido" ? new Date() : estadoAntesDaMudanca.dataExito
      }
    });

    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error: any) {
    console.error("Erro na Auditoria:", error.message);
    return { success: false, error: error.message };
  }
}


export async function restaurarVersaoCliente(clienteId: number, jsonAntigo: string, colaborador: string) {
  try {
    const dadosBrutos = JSON.parse(jsonAntigo);

    const { 
        id, 
        createdAt, 
        updatedAt, 
        log_cs, 
        logFeedback, 
        logAlteracao, 
        socios, 
        ...dadosLimpos 
    } = dadosBrutos;

    const estadoAtualParaLog = await db.clientes.findUnique({ where: { id: clienteId } });

    await db.clientes.update({
      where: { id: clienteId },
      data: {
        ...dadosLimpos, 
        logAlteracao: { 
          create: {
            colaborador: colaborador,
            acao: "Restauração de Backup",
            dadosAnteriores: JSON.stringify(estadoAtualParaLog)
          }
        }
      }
    });

    revalidatePath("/PainelAlpha/CadastroClientes");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO CRÍTICO NO RESTORE:", error.message);
    return { success: false, error: error.message };
  }
}








