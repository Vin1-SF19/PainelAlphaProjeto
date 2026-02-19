"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseDateBR } from "../ConsultaCompleta/route";

const parseData = (valor: any): Date | null => {
  if (!valor || valor === "" || valor === "N/A") return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  const dataString = String(valor).trim();
  const partes = dataString.split('/');
  if (partes.length === 3) {
    const d = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]), 12, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  const isoDate = new Date(dataString);
  if (!isNaN(isoDate.getTime())) {
    isoDate.setHours(12, 0, 0, 0);
    return isoDate;
  }
  return null;
};

export async function registrarNovoArquivo(nome: string, total: number) {
  try {
    const res = await db.arquivos_radar.create({
      data: {
        nome_arquivo: nome,
        total_registros: total,
        data_upload: new Date()
      }
    });
    return { success: true, id: res.id };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "duplicado" };
    return { success: false, error: "Erro ao criar arquivo" };
  }
}

export async function salvarDadosNoBanco(empresas: any[], arquivoId?: number) {
  try {
    let novos = 0;
    let existentes = 0;

    const promessas = empresas.map(async (emp) => {
      const cnpjLimpo = String(emp.cnpj || "").replace(/\D/g, "").padStart(14, "0").substring(0, 14);

      if (!cnpjLimpo || cnpjLimpo.length < 14) return null;

      const registro = await db.consultas_radar.findUnique({
        where: { cnpj: cnpjLimpo },
        select: { id: true, razao_social: true }
      });

      const jaTemDadosReais = !!(registro && registro.razao_social && registro.razao_social !== "" && registro.razao_social !== "NÃO ENCONTRADO");

      if (jaTemDadosReais) {
        existentes++;
      } else {
        if (!registro) novos++;
      }

      const isApenasCnpj = !emp.razaoSocial && !emp.razao_social;

      if (isApenasCnpj && jaTemDadosReais) {
        return;
      }

      const payload = {
        razao_social: emp.razaoSocial || emp.razao_social || (isApenasCnpj ? "" : "NÃO ENCONTRADO"),
        nome_fantasia: emp.nomeFantasia || emp.nome_fantasia || "",
        situacao_radar: emp.situacao || emp.situacao_radar || (isApenasCnpj ? "" : "ERRO"),
        submodalidade: emp.submodalidade || "",
        data_situacao: parseDateBR(emp.dataSituacao || emp.data_situacao),
        municipio: emp.municipio || "",
        uf: emp.uf || "",
        data_constituicao: parseDateBR(emp.dataConstituicao || emp.data_constituicao),
        regime_tributario: emp.regimeTributario || emp.regime_tributario || "",
        capital_social: String(emp.capitalSocial || emp.capital_social || ""),
        contribuinte: emp.contribuinte || "",
        data_opcao: parseDateBR(emp.data_opcao || emp.DataSimples),
        arquivo_id: arquivoId || null,
        fonte: isApenasCnpj ? "Importação CNPJ" : "Importação Completa",
        json_completo: JSON.stringify(emp),
        data_consulta: parseDateBR(emp.dataConsulta || emp.data_consulta) || new Date(),
      };

      return db.consultas_radar.upsert({
        where: { cnpj: cnpjLimpo },
        update: payload,
        create: { cnpj: cnpjLimpo, ...payload }
      });
    });

    await Promise.all(promessas);
    revalidatePath("/PainelAlpha/ConsultarRadar");
    return { success: true, novos, existentes };
  } catch (error: any) {
    return { success: false, novos: 0, existentes: 0, error: error.message };
  }
}




export async function salvarPlanilhaCompleta(empresas: any[], nomeDoArquivo: string, arquivoIdExistente?: number) {
  if (!empresas || empresas.length === 0) return { success: false };

  try {
    let idDoArquivo = arquivoIdExistente;
    let totalCriados = 0;

    if (!idDoArquivo) {
      const resArquivo = await registrarNovoArquivo(nomeDoArquivo, empresas.length);
      if (!resArquivo.success || !resArquivo.id) return { success: false, error: resArquivo.error };
      idDoArquivo = resArquivo.id;
    }

    const TAMANHO_LOTE = 20;
    for (let i = 0; i < empresas.length; i += TAMANHO_LOTE) {
      const lote = empresas.slice(i, i + TAMANHO_LOTE);

      const res = await salvarDadosNoBanco(lote, idDoArquivo) as any;
      if (res.success && res.novos) totalCriados += res.novos;
      await new Promise(r => setTimeout(r, 50));
    }

    return { success: true, idGerado: idDoArquivo, totalCriados };
  } catch (error) {
    return { success: false };
  }
}

export async function salvarConsultaIndividual(empresa: any) {
  try {
    const cnpjLimpo = String(empresa.cnpj || "").replace(/\D/g, "");

    if (!empresa.razaoSocial || !empresa.situacao || empresa.situacao === "ERRO") {
      return { success: false, error: "Dados incompletos ou com erro. Abortando salvamento." };
    }

    const payload = {
      razao_social: empresa.razaoSocial || empresa.razao_social || "",
      nome_fantasia: empresa.nomeFantasia || empresa.nome_fantasia || "",
      situacao_radar: empresa.situacao || "",
      submodalidade: empresa.submodalidade || "",
      data_situacao: parseDateBR(empresa.dataSituacao || empresa.data_situacao),
      municipio: empresa.municipio || "",
      uf: empresa.uf || "",
      data_constituicao: parseDateBR(empresa.dataConstituicao || empresa.data_constituicao),
      regime_tributario: empresa.regimeTributario || "",
      capital_social: String(empresa.capitalSocial || ""),
      contribuinte: empresa.contribuinte || "",
      data_opcao: parseDateBR(empresa.data_opcao || empresa.DataSimples),
      json_completo: JSON.stringify(empresa),
      data_consulta: parseDateBR(empresa.dataConsulta) || new Date()
    };

    await db.consultas_radar.upsert({
      where: { cnpj: cnpjLimpo },
      update: payload,
      create: { cnpj: cnpjLimpo, fonte: "Consulta API Automática", ...payload },
    });

    revalidatePath("/PainelAlpha/ConsultarRadar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deletarRegistrosBanco(cnpjs: string[]) {
  try {
    await db.consultas_radar.deleteMany({
      where: { cnpj: { in: cnpjs } }
    });
    revalidatePath("/PainelAlpha/ConsultarRadar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function excluirCnpjsEmLote(ids: number[]) {
  try {
    const resultado = await db.consultas_radar.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePath("/PainelAlpha/ConsultarRadar");
    return { success: true, count: resultado.count };
  } catch {
    return { success: false };
  }
}
