import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

export async function POST(req: Request) {
  try {
    const { documentos } = await req.json();
    for (const doc of documentos) {
      await client.execute({
        sql: "UPDATE documentos SET ordem_manual = ?, titulo = ? WHERE id = ?",
        args: [doc.ordem, doc.titulo, doc.id]
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
