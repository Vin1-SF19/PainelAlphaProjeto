"use client";

import { getTema } from "@/lib/temas";



export default function TabelaConsultaAlpha({ dados, tema }: { dados: any[], tema: string }) {

    const visual = getTema(tema);



    const formatarData = (valor: any) => {

        if (!valor || valor === "N/A" || valor === "---") return "--/--/----";

        if (typeof valor === 'string' && valor.includes('/') && valor.length <= 10) return valor;

        const dateObj = new Date(valor);

        return isNaN(dateObj.getTime())

            ? String(valor).substring(0, 10)

            : dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    };



    return (

        <div className="w-full rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-x-auto custom-scrollbar">

            <table className="w-full border-collapse text-left">

                <thead className="bg-white/5 text-slate-400">

                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">

                        <th className="p-6">Data Consulta</th>

                        <th className="p-6">CNPJ</th>

                        <th className="p-6">Contribuinte</th>

                        <th className="p-6">Razão Social</th>

                        <th className="p-6">Nome Fantasia</th>

                        <th className="p-6">Data Situação</th>

                        <th className="p-6">Situação</th>

                        <th className="p-6">Submodalidade</th>

                        <th className="p-6">Município</th>

                        <th className="p-6">UF</th>

                        <th className="p-6">Data Const.</th>

                        <th className="p-6">Regime</th>

                        <th className="p-6">Data Opção</th>

                        <th className="p-6">Capital</th>

                    </tr>

                </thead>



                <tbody className="divide-y divide-white/5">

                    {dados.map((empresa, index) => (

                        <tr

                            key={index}

                            className="group hover:bg-white/[0.02] transition-colors cursor-pointer text-[12px] text-slate-300 font-medium"

                        >

                            <td className="p-6">

                                <div className="flex flex-col">

                                    <span className="text-xs font-mono font-bold text-slate-300">

                                        {formatarData(empresa.dataConsulta || empresa.data_consulta)}

                                    </span>

                                </div>

                            </td>

                            <td className={`p-6 font-mono font-bold  ${visual.text}`}>
                                {empresa.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                            </td>

                            <td className={`p-6 font-mono font-bold `}>

                                {empresa.contribuinte}

                            </td>

                            <td className="p-6 uppercase font-black italic max-w-[200px] truncate text-white">

                                {empresa.razaoSocial}

                            </td>

                            <td className="p-6 uppercase font-black italic max-w-[200px] truncate text-white">

                                {empresa.nomeFantasia}

                            </td>



                            <td className="p-6 font-mono">

                                {formatarData(empresa.dataSituacao || empresa.data_situacao)}

                            </td>

                            <td className="p-4">

                                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${empresa.situacao === "DEFERIDA" || empresa.situacao === "HABILITADO"

                                    ? "bg-emerald-500/10 text-emerald-400"

                                    : "bg-rose-500/10 text-rose-400"

                                    }`}>

                                    {empresa.situacao || "SEM STATUS"}

                                </span>

                            </td>

                            <td className="p-6 text-[9px] font-bold text-slate-500 uppercase">

                                {empresa.submodalidade}

                            </td>

                            <td className="p-6 uppercase">

                                {empresa.municipio}

                            </td>

                            <td className="p-6 uppercase">

                                {empresa.uf}

                            </td>

                            <td className="p-6 font-mono">

                                {formatarData(empresa.dataConstituicao || empresa.data_constituicao)}

                            </td>

                            <td className="p-6 text-slate-500 uppercase">

                                {empresa.regimeTributario}

                            </td>

                            <td className="p-6 font-mono text-slate-500">

                                {formatarData(empresa.dataOpcao || empresa.data_opcao)}

                            </td>

                            <td className="p-6">

                                <div className="flex flex-col">

                                    <span className="text-xs font-bold text-slate-200">

                                        {new Intl.NumberFormat('pt-BR', {

                                            style: 'currency',

                                            currency: 'BRL'

                                        }).format(Number(empresa.capitalSocial || 0))}

                                    </span>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}