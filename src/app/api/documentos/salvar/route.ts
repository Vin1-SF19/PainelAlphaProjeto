import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(req: Request) {
  const { titulo, url, setor, tipo } = await req.json();

  try {
    await client.execute({
      sql: "INSERT INTO documentos (titulo, url, setor, tipo) VALUES (?, ?, ?, ?)",
      args: [titulo, url, setor, tipo]
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar no Turso" }, { status: 500 });
  }
}
