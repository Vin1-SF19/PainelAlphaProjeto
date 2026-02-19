import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");

    if (!cnpj) {
      return NextResponse.json(
        { error: "CNPJ obrigatório" },
        { status: 400 }
      );
    }

    const resp = await fetch(
      `https://www.receitaws.com.br/v1/CNPJ/${cnpj}`,
      { cache: "no-store" }
    );

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Erro ReceitaWS HTTP ${resp.status}` },
        { status: resp.status }
      );
    }

    const d = await resp.json();

    console.log("CNAE Principal:", d.atividade_principal?.[0]?.code);
    console.log("Descrição da Atividade:", d.atividade_principal?.[0]?.text);
    

    if (d.status && d.status !== "OK") {
      return NextResponse.json(
        { error: d.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      razaoSocial: d.nome || "",
      nomeFantasia: d.fantasia || "Sem nome fantasia",
      municipio: d.municipio || "",
      uf: d.uf || "",
      dataConstituicao: d.abertura || "",
      regimeTributario:
        d.simples?.optante
          ? "Simples Nacional"
          : "Regime Normal",
      capitalSocial: d.capital_social
        ? `R$ ${Number(d.capital_social).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`
        : "",
      data_opcao: d.simples?.data_opcao || d.opcao_pelo_simples_data || null,
      optante_simples: !!d.simples?.optante,
    });
  } catch (err) {
    console.error("ReceitaWS ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno ReceitaWS" },
      { status: 500 }
    );
  }
}
