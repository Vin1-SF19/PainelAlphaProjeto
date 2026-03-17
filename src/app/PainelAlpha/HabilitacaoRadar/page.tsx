"use client";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import ModalButtons from "@/components/ComponentesRadar/BotoesModal";
import LoadingImport from "@/components/ComponentesRadar/ImportacaoLoading";
import ImportarPlanilha from "@/components/ComponentesRadar/ImportacaoLote";
import { ModalDetalhesEmpresa } from "@/components/ModalDetalhesEmpresa";
import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { deletarRegistrosBanco, registrarNovoArquivo, salvarConsultaIndividual, salvarDadosNoBanco, salvarPlanilhaCompleta } from "@/actions/RadarAction";
import { toast } from "sonner";
import React from "react";
import { BarChart3, Loader2, WifiOff } from "lucide-react";
import { prepararReconsultaLote } from "@/app/api/Reconsulta/ReconsultaRadar";
import ModalOpcoesReconsulta from "@/components/ComponentesRadar/BotaoReconsulta/BotaoReconsulta";

export default function HabilitacaoRadar() {


  const [processando, setProcessando] = useState(false);
  const [totalLote, setTotalLote] = useState(0);
  const [processadas, setProcessadas] = useState(0);
  const [statusLote, setStatusLote] = useState("");
  const cancelarProcessamento = useRef<Boolean>(false);
  const [modalRenomear, setModalRenomear] = useState(false);
  const [nomeTentativa, setNomeTentativa] = useState("")

  const [nomeArquivo, setNomeArquivo] = useState(`Planilha_${new Date().toLocaleDateString('pt-BR')}`);
  const [arquivoId, setArquivoId] = useState<number | undefined>(undefined);

  const [infosimples, setInfosimples] = useState<any>(null);

  const [filtroSituacao, setFiltroSituacao] = useState<
    "todos" | "DEFERIDA" | "NÃO HABILITADA" | "SUSPENSA" | "SEM STATUS"
  >("todos");



  const [showModalReconsulta, setShowModalReconsulta] = useState(false);

  const [isOffline, setIsOffline] = useState(typeof window !== "undefined" ? !navigator.onLine : false);


  const executarLimpezaEReconsulta = async (tipo: 'ERROS' | 'NAO_HABILITADOS') => {
    setProcessando(true);
    setShowModalReconsulta(false);

    const res = await prepararReconsultaLote(tipo);

    if (res.success) {
      toast.success(`${res.count} registros limpos. Iniciando reconsulta...`);

    } else {
      toast.error("Falha ao limpar registros.");
    }
    setProcessando(false);
  };


  useEffect(() => {
    const handleStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    handleStatus();

    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);





  useEffect(() => {
    const buscarSaldo = async () => {
      const res = await fetch("/api/InfoSimples");
      const data = await res.json();
      setInfosimples(data);
    };

    buscarSaldo();

    const interval = setInterval(buscarSaldo, 30000);

    return () => clearInterval(interval);
  }, []);



  const handleSalvarNoBanco = async (nomeArquivoDigitado: string) => {
    if (empresas.some(e => e.situacao === "ERRO")) {
      toast.error("Existem itens com erro na tabela.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sincronizando com a nuvem...");

    try {
      const res = await salvarPlanilhaCompleta(empresas, nomeArquivoDigitado) as any;

      if (res && res.success) {
        const novosCount = res.novos || 0;
        const existentesCount = res.existentes || 0;

        if (novosCount === 0 && existentesCount > 0) {
          toast.info("Todos os dados já estão na nuvem!", { id: toastId });
        } else {
          toast.success(
            `Sucesso! ${novosCount} novos registros salvos. (${existentesCount} já estavam na nuvem)`,
            { id: toastId, duration: 5000 }
          );
        }
      } else {
        toast.error(res?.error || "Erro ao salvar.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha na conexão.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  type EmpresaRadar = {
    dataConsulta: string;
    cnpj: string;
    contribuinte: string;
    situacao: string;
    dataSituacao: string;
    submodalidade: string;
    razaoSocial: string;
    nomeFantasia: string;
    municipio: string;
    uf: string;
    dataConstituicao: string;
    regimeTributario: string;
    data_opcao: string;
    optante: boolean;
    capitalSocial: string;

    salvo?: boolean;
    origem?: string;
  };

  const [cnpj, setCnpj] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaRadar[]>([]);
  const [loading, setLoading] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<any | null>(null);


  function limparTabela() {
    setEmpresas([]);
    localStorage.removeItem("radar_dados");
  }

  function exportarExcel(nomeDoArquivoDigitado: string) {
    if (empresas.length === 0) return alert("Nenhum dado para exportar");

    const formatarData = (valor: any) => {
      if (!valor || valor === "N/A") return "N/A";
      const data = new Date(valor);
      return isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    };

    const dadosFormatados = empresas.map(emp => ({
      "Data Consulta": formatarData(emp.dataConsulta),
      "CNPJ": emp.cnpj,
      "Contribuinte": emp.contribuinte || "",
      "Situação": emp.situacao || "",
      "Data Situação": formatarData(emp.dataSituacao),
      "Submodalidade": emp.submodalidade || "",
      "Razão Social": emp.razaoSocial || "",
      "Nome Fantasia": emp.nomeFantasia || "",
      "Município": emp.municipio || "",
      "UF": emp.uf || "",
      "Data Const.": formatarData(emp.dataConstituicao),
      "Regime": emp.regimeTributario || "",
      "Data Opção": formatarData(emp.data_opcao),
      "Capital Social": emp.capitalSocial || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Radar");

    const nomeFinal = nomeDoArquivoDigitado.trim() || "consulta_radar";
    XLSX.writeFile(workbook, `${nomeFinal}.xlsx`);
  }



  async function handleBuscar(cnpjOpcional?: string, isReconsulta: boolean = false, dadosOriginaisPlanilha?: any, isLote: boolean = false) {
    const cnpjAlvo = cnpjOpcional || cnpj;
    if (!cnpjAlvo) return null;

    const cnpjLimpo = String(cnpjAlvo).replace(/\D/g, "").trim();

    try {
      if (!cnpjOpcional) {
        setLoading(true);
        setTotalLote(1);
        setProcessadas(0);
      }


      if (isLote) {
        await new Promise(r => setTimeout(r, Math.random() * 500 + 400));
      }



      if (!isReconsulta && !isLote) {
        try {
          const resBanco = await fetch("/api/BuscaLote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cnpjs: [cnpjLimpo] }),
          });

          if (resBanco.ok) {
            const dados = await resBanco.json();
            if (dados && dados.length > 0 && dados[0].razao_social) {
              const r = dados[0];
              const formatado = {
                dataConsulta: formatarData(r.data_consulta),
                cnpj: r.cnpj,
                contribuinte: r.contribuinte || "",
                situacao: r.situacao_radar || "",
                dataSituacao: formatarData(r.data_situacao),
                submodalidade: r.submodalidade || "",
                razaoSocial: r.razao_social,
                nomeFantasia: r.nome_fantasia || "",
                municipio: r.municipio || "",
                uf: r.uf || "",
                dataConstituicao: formatarData(r.data_constituicao),
                regimeTributario: r.regime_tributario || "",
                data_opcao: formatarData(r.DataSimples),
                optante: r.optante,
                capitalSocial: r.capital_social || "",
              };
              setEmpresas(prev => [...prev.filter(e => e.cnpj !== cnpjLimpo), formatado]);
              return formatado;
            }
          }


          if (!cnpjOpcional) setProcessadas(0);

        } catch (errBanco) {
          console.log("Banco falhou, tentando API...");
        }
      }

      const resApi = await fetch(`/api/ConsultaCompleta?cnpj=${cnpjLimpo}`, { cache: 'no-store' });
      if (!resApi.ok) throw new Error("Falha total na API");

      const empresa = await resApi.json();

      console.log("DADO QUE CHEGOU NO FRONT:", empresa);

      const novoDado: EmpresaRadar = {
        dataConsulta: dadosOriginaisPlanilha?.dataConsulta || formatarData(new Date()),
        cnpj: cnpjLimpo,
        contribuinte: empresa.contribuinte || dadosOriginaisPlanilha?.contribuinte || "",
        situacao: empresa.situacao || dadosOriginaisPlanilha?.situacao || "ATIVO",
        dataSituacao: formatarData(empresa.dataSituacao || dadosOriginaisPlanilha?.dataSituacao),
        submodalidade: empresa.submodalidade || dadosOriginaisPlanilha?.submodalidade || "",
        razaoSocial: empresa.razaoSocial || empresa.razao_social || dadosOriginaisPlanilha?.razaoSocial || "NÃO ENCONTRADO",
        nomeFantasia: empresa.nomeFantasia || empresa.nome_fantasia || dadosOriginaisPlanilha?.nomeFantasia || "",
        municipio: empresa.municipio || dadosOriginaisPlanilha?.municipio || "",
        uf: empresa.uf || dadosOriginaisPlanilha?.uf || "",
        dataConstituicao: formatarData(empresa.dataConstituicao || dadosOriginaisPlanilha?.dataConstituicao),
        regimeTributario: empresa.regimeTributario || dadosOriginaisPlanilha?.regimeTributario || "",
        optante: empresa.optante,
        data_opcao: formatarData(
          empresa.data_opcao ||
          empresa.DataSimples ||
          dadosOriginaisPlanilha?.data_opcao ||
          dadosOriginaisPlanilha?.DataSimples ||
          empresa.dataOpcao
        ),

        capitalSocial: empresa.capitalSocial || empresa.capital_social || dadosOriginaisPlanilha?.capitalSocial || "",



      };
      setEmpresas(prev => [...prev.filter(e => e.cnpj !== cnpjLimpo), novoDado]);
      await salvarConsultaIndividual(novoDado);

      return novoDado;

    } catch (err) {
      console.error("Erro crítico na busca:", err);
      return null;
    } finally {
      if (!cnpjOpcional) setLoading(false);
    }
  }






  async function handleImportarHistorico(ids: number[]) {
    if (ids.length === 0) return;

    const res = await fetch("/api/ImportarHistorico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    const registros = await res.json();

    setEmpresas((prev) => {
      const existentes = new Set(prev.map((e) => e.cnpj));

      const novos = registros
        .filter((r: any) => !existentes.has(r.cnpj))
        .map((r: any, index: number) => ({
          numero: prev.length + index + 1,
          dataConsulta: r.data_consulta ? new Date(r.data_consulta).toLocaleDateString("pt-BR") : "-",
          cnpj: r.cnpj,
          contribuinte: r.contribuinte,
          situacao: r.situacao_radar,
          dataSituacao: r.data_situacao ? new Date(r.data_situacao).toLocaleDateString("pt-BR") : "-",
          submodalidade: r.submodalidade,
          razaoSocial: r.razao_social,
          nomeFantasia: r.nome_fantasia,
          municipio: r.municipio,
          uf: r.uf,
          dataConstituicao: r.data_constituicao ? new Date(r.data_constituicao).toLocaleDateString("pt-BR") : "-",
          regimeTributario: r.regime_tributario,
          data_opcao: r.data_opcao
            ? new Date(r.data_opcao).toLocaleDateString("pt-BR", { timeZone: 'UTC' })
            : "N/A",

          capitalSocial: r.capital_social,
        }));


      return [...prev, ...novos];
    });
  }


  const handleReconsultarErros = async () => {
    setShowModalReconsulta(false);

    const listaAlvo = empresas.filter(e => {
      const s = (e.situacao || "").toUpperCase().trim();
      return !e.razaoSocial || s === "" || s === "ERRO" || s === "PENDENTE RADAR" || s === "ERRO NA CONSULTA";
    });

    if (listaAlvo.length === 0) {
      toast.info("Nenhum erro pendente para processar.");
      return;
    }

    setProcessando(true);
    setLoading(true);
    setTotalLote(listaAlvo.length);
    setProcessadas(0);
    cancelarProcessamento.current = false;

    for (let i = 0; i < listaAlvo.length; i++) {

      if (isOffline) {
        setStatusLote("PAUSADO: Aguardando conexão de rede...");
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      if (cancelarProcessamento.current) break;

      const emp = listaAlvo[i];
      const cnpjLimpo = String(emp.cnpj).replace(/\D/g, "").padStart(14, "0");
      let sucessoOuFinal = false;
      let tentativa = 0;

      while (!sucessoOuFinal && tentativa < 10) {
        setStatusLote(`Processando ${i + 1}/${listaAlvo.length} (Tentativa ${tentativa + 1}/10): ${cnpjLimpo}`);

        try {
          const res = await fetch(`/api/ConsultaCompleta?cnpj=${cnpjLimpo}&forcar=true&t=${Date.now()}`, {
            cache: 'no-store'
          });

          if (!res.ok) throw new Error("Erro na API");
          const api = await res.json();

          if (api.salvo !== false) {
            setEmpresas(prev => prev.map(e => e.cnpj === emp.cnpj ? { ...e, ...api } : e));
            sucessoOuFinal = true;
          } else {
            throw new Error("Dados ainda incompletos");
          }
        } catch (err) {
          tentativa++;
          if (tentativa < 10) {
            await new Promise(r => setTimeout(r, 25000));
          }
        }
      }

      setProcessadas(i + 1);
      await new Promise(r => setTimeout(r, 5000));
    }

    setProcessando(false);
    setLoading(false);
    setStatusLote("Processamento finalizado!");
    toast.success("Reconsulta concluída!");
  };







  const formatarDataExibicao = (valor: any) => {
    if (!valor) return "N/A";
    const data = new Date(valor);
    if (isNaN(data.getTime())) return String(valor);
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };



  const handleImportarLote = async (dadosNovos: EmpresaRadar[]) => {
    const cnpjsNaTela = new Set(empresas.map(e => String(e.cnpj).replace(/\D/g, "").padStart(14, "0")));

    const dadosFiltrados = dadosNovos.reduce((acc: EmpresaRadar[], item) => {
      const cnpjLimpo = String(item.cnpj).replace(/\D/g, "").padStart(14, "0").substring(0, 14);
      if (cnpjLimpo !== "" && !cnpjsNaTela.has(cnpjLimpo) && !acc.some(e => e.cnpj === cnpjLimpo)) {
        acc.push({ ...item, cnpj: cnpjLimpo, salvo: false });
      }
      return acc;
    }, []);

    if (dadosFiltrados.length === 0) return toast.info("Registros já estão na tela.");

    setLoading(true);
    setProcessadas(0);
    setTotalLote(dadosFiltrados.length);
    setProcessando(true);
    setStatusLote("Verificando banco de dados...");

    const toastId = toast.loading("Sincronizando com o banco Alpha...");

    try {
      const promessas = dadosFiltrados.map(async (item) => {
        const res = await fetch(`/api/ConsultaCompleta?cnpj=${item.cnpj}&somenteBanco=true`);

        setProcessadas(prev => prev + 1);

        if (res.ok) {
          const banco = await res.json();
          if (banco && banco.razao_social) {
            return { ...item, ...banco, salvo: true };
          }
        }
        return { ...item, salvo: false };
      });

      const resultadosBanco = await Promise.all(promessas);
      
      const jaSincronizados = resultadosBanco.filter(e => e.salvo);
      const paraConsultarExterno = resultadosBanco.filter(e => !e.salvo);

      setEmpresas(prev => [...prev, ...resultadosBanco]);

      if (paraConsultarExterno.length > 0) {
        toast.loading(`Encontrados ${jaSincronizados.length} no banco. Consultando ${paraConsultarExterno.length} novos...`, { id: toastId });

        const processarEmLotesExternos = async () => {
          for (const item of paraConsultarExterno) {
            try {
              const res = await fetch(`/api/ConsultaCompleta?cnpj=${item.cnpj}`);
              if (res.ok) {
                const dados = await res.json();
                setEmpresas(prev => prev.map(emp => 
                  emp.cnpj === item.cnpj ? { ...emp, ...dados, salvo: true } : emp
                ));
              }
            } catch (err) {
              console.error("Erro na consulta externa:", item.cnpj);
            }
          }
          toast.success("Importação e sincronização concluída!", { id: toastId });
        };

        processarEmLotesExternos();
      } else {
        toast.success(`${jaSincronizados.length} registros recuperados do banco.`, { id: toastId });
      }

    } catch (err) {
      toast.error("Erro ao processar lote", { id: toastId });
      setEmpresas(prev => [...prev, ...dadosFiltrados]);
    } finally {
      setLoading(false);
      setProcessando(false);
    }
  };



  const formatarDataParaPlanilha = (valor: any) => {
    if (!valor) return "N/A";
    const data = new Date(valor);
    if (isNaN(data.getTime())) return valor;

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const handleExportarPlanilha = () => {
    const dadosParaExportar = empresas.map(emp => ({
      CNPJ: emp.cnpj,
      "Razão Social": emp.razaoSocial,
      "Data Consulta": formatarDataParaPlanilha(emp.dataConsulta),
      "Data Situação": formatarDataParaPlanilha(emp.dataSituacao),
      "Data Constituição": formatarDataParaPlanilha(emp.dataConstituicao),
      "Data Opção": formatarDataParaPlanilha(emp.data_opcao),
      Submodalidade: emp.submodalidade,
      Situação: emp.situacao,
      Capital: emp.capitalSocial
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Radar");
    XLSX.writeFile(workbook, "Relatorio_Radar.xlsx");
  };


  const iniciarProcessamentoAutomatico = async () => {
    setProcessando(true);

    const pendentes = empresas.filter(emp =>
      !emp.razaoSocial ||
      emp.razaoSocial === "" ||
      emp.razaoSocial === "NÃO ENCONTRADO" ||
      emp.situacao === "ERRO" ||
      emp.situacao === "SEM STATUS - RECONSULTAR"
    );

    if (pendentes.length === 0) {
      toast.info("Nenhum registro pendente para consulta.");
      setProcessando(false);
      return;
    }

    toast.success(`Iniciando consulta de ${pendentes.length} registros...`);

    for (const emp of pendentes) {
      if (cancelarProcessamento.current) break;

      try {
        const cnpjLimpo = String(emp.cnpj).replace(/\D/g, "").padStart(14, "0");

        const res = await fetch(`/api/ConsultaCompleta?cnpj=${cnpjLimpo}&forcar=true&t=${Date.now()}`, {
          cache: 'no-store'
        });

        if (res.ok) {
          const api = await res.json();

          const novoDado = {
            ...emp,
            razaoSocial: api.razaoSocial || api.razao_social,
            situacao: api.situacao || api.situacao_radar,
            dataSituacao: api.dataSituacao,
            submodalidade: api.submodalidade,
            nomeFantasia: api.nomeFantasia,
            uf: api.uf,
            municipio: api.municipio,
            salvo: true
          };

          setEmpresas(prev => prev.map(e => e.cnpj === emp.cnpj ? novoDado : e));
        }

        await new Promise(r => setTimeout(r, 3000));

      } catch (e) {
        console.error(`Erro ao consultar ${emp.cnpj}:`, e);
      }
    }

    setProcessando(false);
    toast.success("Processamento concluído!");
  };








  const formatarData = (dataRaw: any) => {
    if (!dataRaw) return "";
    const d = new Date(dataRaw);
    return isNaN(d.getTime()) ? String(dataRaw) : d.toLocaleDateString("pt-BR");
  };



  //LOGICA DE FILTROS

  const [ordem, setOrdem] = useState<"todos" | "asc" | "desc" | null>(null);
  const [ordemData, setOrdemData] = useState<"todos" | "recentes" | "antigos" | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [filtroErro, setFiltroErro] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<"todos" | "erro" | "sucesso">("todos");

  const [filtroSubmodalidade, setFiltroSubmodalidade] = useState<"todos" | "LIMITADA (ATÉ US$ 50.000)" | "LIMITADA (ATÉ US$ 150.000)" | "ILIMITADA">("todos");


  const empresasExibidas = React.useMemo(() => {
    let resultado = [...empresas];

    if (filtroSubmodalidade !== "todos") {
      resultado = resultado.filter(
        emp => emp.submodalidade?.trim() === filtroSubmodalidade
      );
    }

    console.log("FILTRO ATIVO NO MOMENTO:", filtroSubmodalidade);

    resultado = resultado.filter(e => {
      const subOriginal = String(e.submodalidade || "");
      const subNormal = subOriginal.toUpperCase();

      let condSub = true;

      if (filtroSubmodalidade === "LIMITADA (ATÉ US$ 50.000)") {
        condSub = subNormal.includes("LIMITADA (ATÉ US$ 50.000)");

      }
      else if (filtroSubmodalidade === "LIMITADA (ATÉ US$ 150.000)") {
        condSub = subNormal.includes("LIMITADA (ATÉ US$ 150.000)");
      }
      else if (filtroSubmodalidade === "ILIMITADA") {
        condSub = subNormal.includes("ILIMITADA") && !subNormal.includes("50") && !subNormal.includes("150");
      }

      // FILTROS DE SITUAÇÃO E STATUS 
      const sitNormal = (e.situacao || "").toUpperCase().trim();
      let condSit = true;
      if (filtroSituacao === "SEM STATUS") {
        condSit = !e.razaoSocial || sitNormal === "" || sitNormal === "PENDENTE RADAR";
      } else if (filtroSituacao !== "todos") {
        condSit = sitNormal === filtroSituacao.toUpperCase();
      }

      return condSub && condSit;
    });

    console.log("TOTAL APÓS FILTRAR:", resultado.length);

    // ORDENAÇÃO
    if (ordem && ordem !== "todos") {
      resultado.sort((a, b) =>
        ordem === "asc"
          ? (a.razaoSocial || "").localeCompare(b.razaoSocial || "")
          : (b.razaoSocial || "").localeCompare(a.razaoSocial || "")
      );
    }

    if (ordemData && ordemData !== "todos") {
      resultado.sort((a, b) => {
        const parse = (d: string) => {
          if (!d) return 0;
          return d.includes('-') ? new Date(d).getTime() : new Date(d.split('/').reverse().join('-')).getTime();
        };
        const dataA = parse(a.dataConsulta);
        const dataB = parse(b.dataConsulta);
        return ordemData === "recentes" ? dataB - dataA : dataA - dataB;
      });
    }

    return resultado;
  }, [empresas, filtroSubmodalidade, filtroSituacao, filtroStatus, ordem, ordemData]);




  const handleAlternarOrdemNome = () => {
    setOrdemData(null);
    setOrdem(prev => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
  };

  const handleAlternarOrdemData = () => {
    setOrdem(null);
    setOrdemData(prev => (prev === "recentes" ? "antigos" : prev === "antigos" ? null : "recentes"));
  };

  const handleRemoverSelecionados = () => {
    setEmpresas(prev => prev.filter(emp => !selecionados.has(emp.cnpj)));
    setSelecionados(new Set());
    toast.success("Itens removidos da visualização.");
  };

  const handleSelecionarTudo = () => {
    if (selecionados.size === empresasExibidas.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(empresasExibidas.map(e => e.cnpj)));
    }
  };

  const toggleSelecionarUm = (cnpj: string) => {
    const novos = new Set(selecionados);
    if (novos.has(cnpj)) novos.delete(cnpj);
    else novos.add(cnpj);
    setSelecionados(novos);
  };


  const [tempoInicio, setTempoInicio] = useState<number>(Date.now());


  const temSelecionadoNoBanco = React.useMemo(() => {
    return Array.from(selecionados).some(cnpj => {
      const emp = empresas.find(e => e.cnpj === cnpj);
      return emp?.salvo === true;
    });
  }, [selecionados, empresas]);


  const handleDeletarDoBanco = async () => {
    const confirmacao = confirm("Deseja apagar estes registros PERMANENTEMENTE do banco de dados?");
    if (!confirmacao) return;

    setLoading(true);
    const cnpjs = Array.from(selecionados);
    const res = await deletarRegistrosBanco(cnpjs);

    if (res.success) {
      toast.success("Registros removidos do Banco!");
    }
    setLoading(false);
  };


  return (



    <div className="w-full min-h-screen mx-auto px-2 md:px-6 py-6 md:py-10 space-y-8 text-white bg-transparent">

      {isOffline && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-rose-600/90 backdrop-blur-xl border border-rose-400/30 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.4)] flex items-center gap-4">
            <div className="relative">
              <WifiOff size={20} className="text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Conexão Interrompida</span>
              <span className="text-[9px] font-bold text-rose-100 uppercase opacity-80">Tentando restabelecer sinal...</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="relative flex flex-col gap-4 bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-900/50 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col gap-2 pr-16">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">
            CONSULTA <span className="text-blue-500">RADAR</span> EM LOTE
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
            Gestão de habilitações com expansão dinâmica de registros.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <BotaoVoltar />
        </div>

        <div className=" top-6 right-6 lg:top-8 lg:right-8">
        </div>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5 text-sm text-gray-300 shadow">
          🔍 <strong>Consulta unitária:</strong> informe o CNPJ e consulte via API
          ou manualmente no site da Receita.
        </div>

        <div className="rounded-3xl border border-blue-900/30 bg-gray-900/60 p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border transition-all duration-500 ${processando ? "bg-blue-600/20 border-blue-500/20 animate-pulse" : "bg-slate-800/40 border-white/5"
              }`}>
              <BarChart3 className={processando ? "text-blue-400" : "text-slate-600"} size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white leading-none">
                Monitor de Processamento
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">
                {processando ? "Robô em execução" : "Aguardando comando"} • {empresas.length} registros totais
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-blue-900/30 hidden md:block" />

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Concluído</span>
            <span className={`text-xs font-bold uppercase ${processando ? "text-blue-400" : "text-slate-400"}`}>
              {empresas.length > 0
                ? Math.round((empresas.filter(e => e.situacao && e.situacao !== "" && e.situacao !== "PENDENTE RADAR").length / empresas.length) * 100)
                : 0}% Finalizado
            </span>
          </div>

          <div className="flex items-center gap-6 pr-2">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sinal de Rede</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${isOffline ? "text-rose-500" : "text-emerald-400"}`}>
                  {isOffline ? "Desconectado" : "Online"}
                </span>
                <div className={`h-2 w-2 rounded-full ${isOffline ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
              </div>
            </div>

            <div className="h-8 w-px bg-blue-900/30 hidden md:block" />

            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Eficiência</span>
              <span className="text-xs font-bold text-indigo-400 uppercase">
                {empresas.length > 0
                  ? empresas.filter(e => ["DEFERIDA", "HABILITADA", "LIMITADA", "ILIMITADA"].includes(e.situacao?.toUpperCase())).length
                  : 0} Deferidos
              </span>
            </div>
          </div>
        </div>


      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 bg-gray-900/60 border border-gray-700 rounded-3xl p-6 shadow-lg">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">CNPJ para consulta</label>
            <input
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="w-full rounded-xl bg-slate-950 border border-gray-700 px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="flex gap-3">


            <button onClick={() => handleBuscar()} className="flex-1 rounded-xl bg-blue-700 hover:bg-blue-600 transition-all py-3 font-bold">🔍 Consultar via API</button>

            <button onClick={() => window.open("https://servicos.receita.fazenda.gov.br/servicos/radar/consultaSituacaoCpfCnpj.asp", "_blank")} className="flex-1 rounded-xl bg-gray-600 hover:bg-gray-700 transition-all py-3 font-bold text-xs sm:text-sm">🌐 Abrir Receita</button>
          </div>


          <ImportarPlanilha
            onImportar={handleImportarLote}
            processando={processando}
            onCancelar={() => {
              cancelarProcessamento.current = true;
              setProcessando(false);
              setStatusLote("Operação cancelada.");
            }}
            statusLote={statusLote}
            processadas={processadas}
            totalLote={totalLote}
          />


          <LoadingImport
            totalLote={totalLote}
            processadas={processadas}
            statusLote={statusLote}
            processando={processando || loading}
            onCancelar={() => {
              cancelarProcessamento.current = true;
              setProcessando(false);
              setStatusLote("Cancelando...");
              setLoading(false);
            }}
          />

        </div>

        <div className="bg-gray-900/60 border border-gray-700 rounded-3xl p-6 shadow-lg flex flex-col">
          <label className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            Resumo da Operação
          </label>

          <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
            <div className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Sucessos</span>
              <span className="text-xl font-bold text-emerald-400">
                {empresas.filter(e => e.situacao !== "ERRO" && e.razaoSocial !== "" && e.razaoSocial !== "NÃO ENCONTRADO").length}
              </span>
            </div>

            <div className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Falhas</span>
              <span className="text-xl font-bold text-rose-500">
                {empresas.filter(e => e.situacao === "ERRO" || e.razaoSocial === "NÃO ENCONTRADO").length}
              </span>
            </div>

            {/* NOVA SEÇÃO DE SUBMODALIDADES SEPARADAS */}
            <div className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex flex-col justify-center col-span-2 space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest border-b border-white/5 pb-1 mb-1">
                Habilitação por Submodalidade
              </span>

              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const normalize = (val: any) => String(val || "").toUpperCase();
                  const ate50k = empresas.filter(e => {
                    const txt = normalize(e.submodalidade);
                    return txt.includes("50.000") && !txt.includes("150.000");
                  }).length;
                  const ate150k = empresas.filter(e => normalize(e.submodalidade).includes("150.000")).length;

                  const ilimitada = empresas.filter(e => {
                    const txt = normalize(e.submodalidade);
                    return txt.includes("ILIMITADA") && !txt.includes("50.000") && !txt.includes("150.000");
                  }).length;

                  return (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-blue-400/70 font-bold uppercase tracking-tighter">Até 50k</span>
                        <span className="text-sm font-bold text-blue-300">
                          {ate50k} <small className="text-[9px] font-normal text-slate-500 italic">un.</small>
                        </span>
                      </div>

                      <div className="flex flex-col border-x border-white/5 px-2">
                        <span className="text-[9px] text-orange-400/70 font-bold uppercase tracking-tighter">Até 150k</span>
                        <span className="text-sm font-bold text-orange-300">
                          {ate150k} <small className="text-[9px] font-normal text-slate-500 italic">un.</small>
                        </span>
                      </div>

                      <div className="flex flex-col pl-1">
                        <span className="text-[9px] text-purple-400/70 font-bold uppercase tracking-tighter">Ilimitada</span>
                        <span className="text-sm font-bold text-purple-300">
                          {ilimitada} <small className="text-[9px] font-normal text-slate-500 italic">un.</small>
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>


          </div>

          <div className="space-y-4">

            {/* LINHA DE CARDS SUPERIORES */}
            <div className="grid grid-cols-2 gap-3">

              {/* REGISTROS */}
              <div className="bg-[#0b1220] p-3 rounded-xl border border-purple-500/20 shadow-md">
                <p className="text-[10px] uppercase font-bold text-gray-500">
                  Registros
                </p>
                <h2 className="text-lg font-black text-purple-400">
                  {empresas.filter(e => e.salvo).length}
                </h2>
                <span className="text-[9px] text-purple-500/40">Sincronizados</span>
              </div>

              {/* SALDO INFO SIMPLES */}
              <div
                className={`relative bg-[#0b1220] p-3 rounded-xl border shadow-md transition-all duration-500 ${infosimples
                  ? infosimples.saldo < 100
                    ? "border-rose-500/40 animate-pulse"
                    : infosimples.saldo < 200
                      ? "border-yellow-500/40"
                      : "border-emerald-500/20"
                  : "border-emerald-500/20"
                  }`}
              >
                <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  Saldo Atual
                  <span
                    className={`h-2 w-2 rounded-full animate-ping ${infosimples
                      ? infosimples.saldo < 100
                        ? "bg-rose-400"
                        : infosimples.saldo < 200
                          ? "bg-yellow-400"
                          : "bg-emerald-400"
                      : "bg-emerald-400"
                      }`}
                  ></span>
                </p>

                <h2 className={`text-2xl font-black mt-1 ${isOffline ? "" : ""}`}>
                  {isOffline ? (
                    <span className="flex items-center gap-2 text-xs">
                      <Loader2 size={14} className="animate-spin" /> AGUARDANDO REDE...
                    </span>
                  ) : (
                    `R$ ${Number(infosimples?.saldo || 0).toFixed(2)}`
                  )}
                </h2>



                <span className="text-[9px] text-gray-500">
                  Atualiza automaticamente
                </span>
              </div>

            </div>

            {/* CONSUMO MENSAL REESTILIZADO */}
            {infosimples && (
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-cyan-500/10 shadow-lg">

                <div className="flex justify-between items-center">

                  {/* LADO ESQUERDO */}
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                      Consumo Mensal
                    </p>
                    <h2 className={`text-2xl font-black mt-1 transition-all ${infosimples?.consumo === undefined ? "text-slate-700 italic text-sm" : "text-cyan-400"
                      }`}>
                      {infosimples?.consumo !== undefined
                        ? `R$ ${Number(infosimples.consumo).toFixed(2)}`
                        : "OFFLINE / SEM SALDO"}
                    </h2>

                  </div>

                  {/* LADO DIREITO */}
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-500">
                      Titular da conta:
                    </p>
                    <p className={`text-sm font-bold text-red-500
        }`}>
                      {infosimples.name}
                    </p>
                  </div>

                </div>

                {/* Linha visual animada */}
                <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 animate-pulse" />

              </div>
            )}


          </div>


        </div>


      </section>

      <ModalButtons
        onImportarHistorico={handleImportarHistorico}
        onLimparTabela={limparTabela}
        onExportarExcel={exportarExcel}
        onReconsultarErros={handleReconsultarErros}
        processando={processando}
        onSalvarBanco={handleSalvarNoBanco}
        empresas={empresas}
        selecionados={selecionados}
        ordem={ordem}
        ordemData={ordemData}
        empresasExibidas={empresasExibidas}
        handleAlternarOrdemNome={handleAlternarOrdemNome}
        handleAlternarOrdemData={handleAlternarOrdemData}
        handleRemoverSelecionados={handleRemoverSelecionados}
        handleSelecionarTudo={handleSelecionarTudo}
        filtroErro={filtroErro}
        setFiltroErro={setFiltroErro}
        loading={loading}
        totalEmpresas={empresas.length}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroSituacao={filtroSituacao}
        setFiltroSituacao={setFiltroSituacao}
        temSelecionadoNoBanco={temSelecionadoNoBanco}
        onDeletarDoBanco={handleDeletarDoBanco}
        setOrdem={setOrdem}
        setOrdemData={setOrdemData}
        totalSelecionados={selecionados.size}
        onAbrirReconsulta={() => setShowModalReconsulta(true)}

        filtroSubmodalidade={filtroSubmodalidade}
        setFiltroSubmodalidade={setFiltroSubmodalidade}
      />


      <ModalOpcoesReconsulta
        isOpen={showModalReconsulta}
        onClose={() => setShowModalReconsulta(false)}
        onExecutar={handleReconsultarErros}
      />





      <div className="w-full rounded-2xl border border-blue-900/50 bg-[#0b1220] shadow-2xl overflow-hidden">


        <table id="resultTable" className="w-full border-collapse text-center">
          <thead className="bg-blue-900/40 text-gray-100">
            <tr className="text-[10px] md:text-xs uppercase tracking-tighter">
              <th className="p-2 border-b border-blue-800 w-10">
                <input
                  type="checkbox"
                  className="cursor-pointer accent-blue-500"
                  checked={selecionados.size === empresasExibidas.length && empresasExibidas.length > 0}
                  onChange={handleSelecionarTudo}
                />
              </th>
              <th className="p-2 border-b border-blue-800">N°</th>
              <th className="p-2 border-b border-blue-800">Consulta</th>
              <th className="p-2 border-b border-blue-800">CNPJ</th>
              <th className="p-2 border-b border-blue-800">Contribuinte</th>
              <th className="p-2 border-b border-blue-800">Situação</th>
              <th className="p-2 border-b border-blue-800">Data</th>
              <th className="p-2 border-b border-blue-800">Submodal</th>
              <th className="p-2 border-b border-blue-800">Razão Social</th>
              <th className="p-2 border-b border-blue-800">Fantasia</th>
              <th className="p-2 border-b border-blue-800">Município</th>
              <th className="p-2 border-b border-blue-800">UF</th>
              <th className="p-2 border-b border-blue-800">Const.</th>
              <th className="p-2 border-b border-blue-800">Regime</th>
              <th className="p-2 border-b border-blue-800">Data Opção</th>
              <th className="p-2 border-b border-blue-800">Capital</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-900/20">
            {empresasExibidas.map((empresa, index) => (
              <tr
                key={empresa.cnpj}
                className={`transition-all text-[10px] md:text-xs cursor-pointer group border-b border-blue-900/10 
                ${selecionados.has(empresa.cnpj) ? "bg-blue-600/20" : ""}
                ${empresa.salvo ? "bg-purple-900/20 hover:bg-purple-900/30" : "hover:bg-blue-600/10"} 
                `}
              >
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="cursor-pointer accent-blue-500"
                    checked={selecionados.has(empresa.cnpj)}
                    onChange={() => toggleSelecionarUm(empresa.cnpj)}
                  />
                </td>
                <td className="p-2 text-slate-500" onClick={() => setEmpresaSelecionada(empresa)}>
                  {index + 1}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {formatarDataExibicao(empresa.dataConsulta)}
                </td>
                <td className="p-2 font-bold text-blue-400" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.cnpj}
                </td>
                <td className="p-2 truncate max-w-[80px]" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.contribuinte}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-black ${empresa.situacao === "DEFERIDA" || empresa.situacao === "ATIVO"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : empresa.situacao === "NÃO HABILITADA"
                        ? "text-orange-400 bg-orange-500/10"
                        : "text-rose-400 bg-rose-500/10"
                      }`}
                  >
                    {empresa.situacao || "SEM STATUS"}
                  </span>
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {formatarDataExibicao(empresa.dataSituacao)}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.submodalidade}
                </td>
                <td className="p-2 truncate max-w-[100px]" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.razaoSocial}
                </td>
                <td className="p-2 truncate max-w-[80px]" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.nomeFantasia}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.municipio}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.uf}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {formatarDataExibicao(empresa.dataConstituicao)}
                </td>
                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.regimeTributario}
                </td>

                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {formatarDataExibicao(empresa.data_opcao || "N/A")}
                </td>


                <td className="p-2" onClick={() => setEmpresaSelecionada(empresa)}>
                  {empresa.capitalSocial}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalDetalhesEmpresa
        empresa={empresaSelecionada}
        open={!!empresaSelecionada}
        onOpenChange={(aberto: boolean) => !aberto && setEmpresaSelecionada(null)}
      />
    </div>




  );
}
