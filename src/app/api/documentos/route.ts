import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET() {
  try {
    const result = await client.execute("SELECT * FROM documentos ORDER BY id DESC");
    
    const documentos = result.rows.map(row => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      url: row.url,
      setor: row.setor,
      tipo: row.tipo,
      data_criacao: row.data_criacao,
    }));

    return NextResponse.json(documentos);
  } catch (error) {
    console.error("Erro no Turso:", error);
    return NextResponse.json({ error: "Erro ao buscar no Turso DB" }, { status: 500 });
  }
}
