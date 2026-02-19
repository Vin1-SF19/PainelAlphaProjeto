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
    const file = formData.get("file") as File;
    const titulo = formData.get("titulo")?.toString() || file.name;
    const setor = formData.get("setor")?.toString();

    if (!file || file.size === 0) return { success: false, error: "Arquivo vazio" };
    if (!setor) return { success: false, error: "Selecione um setor" };

    const blob = await put(file.name, file, { 
      access: "public",
      addRandomSuffix: true,
    });

    await client.execute({
      sql: "INSERT INTO documentos (titulo, url, setor, tipo) VALUES (?, ?, ?, ?)",
      args: [titulo, blob.url, setor, "PDF"]
    });

    revalidatePath("/PainelAlpha/DocsAlpha");
    return { success: true };

  } catch (error: any) {
    console.error("ERRO:", error.message);
    return { success: false, error: error.message };
  }
}
