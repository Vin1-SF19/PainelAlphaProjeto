import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exibirTodos = searchParams.get("todos") === "true";

    const query = exibirTodos 
      ? "SELECT * FROM documentos ORDER BY id DESC" 
      : "SELECT * FROM documentos WHERE status = 'ATIVO' OR status IS NULL ORDER BY id DESC";

    const result = await client.execute(query);
    
    const documentos = result.rows.map(row => ({
      id: row.id,
      titulo: row.titulo,
      PastaArquivos: row.PastaArquivos,
      url: row.url,
      setor: row.setor,
      tipo: row.tipo,
      data_criacao: row.data_criacao,
      status: row.status || 'ATIVO',
      criado_por: row.criado_por || "SISTEMA",
      protecao: row.protecao || 'ATIVO',
      ordem_manual: row.ordem_manual,
    }));

    return NextResponse.json(documentos);
  } catch (error) {
    console.error("Erro no Turso:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, titulo, setor, PastaArquivos, protecao, ordem_manual } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    if (titulo !== undefined || setor !== undefined || PastaArquivos !== undefined || protecao !== undefined) {
      await client.execute({
        sql: "UPDATE documentos SET titulo = ?, setor = ?, PastaArquivos = ?, status = ?, protecao = ?, ordem_manual = ? WHERE id = ?",
        args: [titulo, setor, PastaArquivos, status, protecao, ordem_manual || 0, id]
      });
    } else {
      await client.execute({
        sql: "UPDATE documentos SET status = ? WHERE id = ?",
        args: [status, id]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no PATCH:", error);
    return NextResponse.json({ error: "Erro ao atualizar documento" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    
    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });
    }

    await client.execute({
      sql: "DELETE FROM documentos WHERE id = ?",
      args: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao excluir do banco" }, { status: 500 });
  }
}