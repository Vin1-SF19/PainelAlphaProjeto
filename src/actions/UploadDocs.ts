"use server";

import { put } from "@vercel/blob";
import { createClient } from "@libsql/client";
import { revalidatePath } from "next/cache";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function uploadDocumento(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const urlPrevia = formData.get("url")?.toString();

    const titulo = (formData.get("titulo")?.toString() || file?.name || "SEM TITULO").toUpperCase().trim();
    const setor = formData.get("setor")?.toString().toUpperCase().trim();
    const pasta = formData.get("tipo_pasta")?.toString().toUpperCase().trim();
    const criado_por = formData.get("criado_por")?.toString() || "SISTEMA";
    const protecao = formData.get("protecao")?.toString() || "ATIVO";
    const ordem_manual = parseInt(formData.get("ordem_manual")?.toString() || "0");
    
    let tipo_midia = formData.get("tipo_midia")?.toString();
    if (!tipo_midia) {
      tipo_midia = file?.type?.startsWith("video/") ? "VIDEO" : "PDF";
    }

    if (!setor || !pasta) return { success: false, error: "DADOS OBRIGATORIOS AUSENTES" };

    let finalUrl = urlPrevia;

    if (!finalUrl) {
      if (!file || file.size === 0) return { success: false, error: "ARQUIVO NAO DETECTADO" };
      
      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      finalUrl = blob.url;
    }

    await client.execute({
      sql: "INSERT INTO documentos (titulo, PastaArquivos, url, setor, tipo, criado_por, protecao, ordem_manual, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')",
      args: [
        titulo,
        pasta,
        finalUrl,
        setor,
        tipo_midia,
        criado_por,
        protecao,
        ordem_manual
      ]
    });

    revalidatePath("/PainelAlpha/DocsAlpha");
    return { success: true };

  } catch (error: any) {
    console.error("FALHA_ACTION:", error.message);
    return { success: false, error: error.message };
  }
}

export async function desativarDocumentoAction(id: number) {
  try {
    await client.execute({
      sql: "UPDATE documentos SET status = 'INATIVO' WHERE id = ?",
      args: [id]
    });

    revalidatePath("/PainelAlpha/DocsAlpha");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_DESATIVAR:", error.message);
    return { success: false, error: error.message };
  }
}
