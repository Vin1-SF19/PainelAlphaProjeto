"use server";

import { createClient } from "@libsql/client";
import { revalidatePath } from "next/cache";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function adicionarColaboradorCoreAction(formData: FormData) {
  try {
    const nome = formData.get("nome")?.toString().toUpperCase().trim();
    const setor = formData.get("setor")?.toString().toUpperCase().trim();
    const cargo = formData.get("cargo")?.toString().toUpperCase().trim();
    const data = formData.get("data")?.toString();

    if (!nome || !setor || !cargo) {
      return { success: false, error: "DADOS OBRIGATÓRIOS AUSENTES" };
    }

    await client.execute({
      sql: "INSERT INTO colaboradores_core (nome, setor, cargo, data_contratacao, status) VALUES (?, ?, ?, ?, 'ATIVO')",
      args: [nome, setor, cargo, data || null]
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_CORE:", error.message);
    return { success: false, error: error.message };
  }
}

export async function atualizarAgenteSistemaAction(formData: FormData) {
  try {
    const idBruto = formData.get("id")?.toString();
    const cargo = formData.get("cargo")?.toString().toUpperCase().trim();
    const data = formData.get("data")?.toString();
    const status = formData.get("status")?.toString();
    const setor = formData.get("setor")?.toString().toUpperCase().trim();

    if (!idBruto) return { success: false, error: "ID NÃO LOCALIZADO" };

    const isCore = idBruto.startsWith("ext-");
    const idReal = isCore ? idBruto.replace("ext-", "") : idBruto;

    if (isCore) {
      await client.execute({
        sql: "UPDATE colaboradores_core SET cargo = ?, data_contratacao = ?, status = ?, setor = ? WHERE id = ?",
        args: [cargo || null, data || null, status || "ATIVO", setor || "OPERACIONAL", idReal]
      });
    } else {
      await client.execute({
        sql: "UPDATE usuarios SET cargo = ?, data_contratacao = ?, status = ?, role = ? WHERE id = ?",
        args: [cargo || null, data || null, status || "ATIVO", setor || "ADMIN", idReal]
      });
    }

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_AO_SALVAR:", error.message);
    return { success: false, error: error.message };
  }
}


export async function adicionarSistemaCoreAction(formData: FormData) {
  try {
    const nome = formData.get("nome")?.toString().toUpperCase().trim();
    const link = formData.get("link")?.toString().trim();
    const icone = formData.get("icone")?.toString();

    if (!nome || !link) {
      

return { success: false, error: "NOME E LINK SÃO OBRIGATÓRIOS" };
    }

    await client.execute({
      sql: "INSERT INTO sistemas_core (nome, link, icone) VALUES (?, ?, ?)",
      args: [nome, link, icone || "google"]
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_SISTEMA_CORE:", error.message);
    return { success: false, error: error.message };
  }
}

export async function adicionarRecursoVaultAction(formData: FormData) {
  try {
    const colabId = formData.get("colaborador_id")?.toString();
    const sistemaId = formData.

get("sistema_id")?.toString();
    const login = formData.get("login")?.toString().trim();
    const senha = formData.get("senha")?.toString().trim();

    if (!colabId || !sistemaId || !login || !senha) {
      return { success: false, error: "TODOS OS CAMPOS SÃO OBRIGATÓRIOS" };
    }

    await client.execute({
      sql: "INSERT INTO vault_recursos (colaborador_id, sistema_id, login, senha) VALUES (?, ?, ?, ?)",
      args: [colabId, sistemaId, login, senha]
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


