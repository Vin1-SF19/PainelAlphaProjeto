"use client";
import { getTema } from "@/lib/temas";



export default function TabelaConsultaAlpha({ dados, tema }: { dados: any[], tema: string }) {
    const visual = getTema(tema);

    return (
        <div className="w-full rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
                <thead className="bg-white/5 text-slate-400">
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">

                        <th className="p-4">Data Consulta</th>
                        <th className="p-4">Razão Social</th>
                        <th className="p-4">CNPJ</th>
                        <th className="p-4">Razão Social</th>
                        <th className="p-4">Nome Fantasia</th>
                        <th className="p-4">Situação</th>
                        <th className="p-4">Submodalidade</th>
                        <th className="p-4">Município/UF</th>
                        <th className="p-4">Regime</th>
                        <th className="p-4">Capital</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                    {dados.map((empresa, index) => (
                        <tr
                            key={index}
                            className="group hover:bg-white/[0.02] transition-colors cursor-pointer text-[10px] text-slate-300 font-medium"
                        >
                            <td className="p-4">
                                {empresa.data_consulta instanceof Date
                                    ? empresa.data_consulta.toLocaleDateString('pt-BR')
                                    : String(empresa.data_consulta)}
                            </td>
                            <td className={`p-4 font-mono font-bold ${visual.text}`}>
                                {empresa.cnpj}
                            </td>
                            <td className="p-4 uppercase font-black italic max-w-[200px] truncate text-white">
                                {empresa.razaoSocial}
                            </td>
                            <td className="p-4 uppercase font-black italic max-w-[200px] truncate text-white">
                                {empresa.nomeFantasia}
                            </td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${empresa.situacao === "DEFERIDA"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                    }`}>
                                    {empresa.situacao || "SEM STATUS"}
                                </span>
                            </td>
                            <td className="p-4 text-[9px] font-bold text-slate-500 uppercase">
                                {empresa.submodalidade}
                            </td>
                            <td className="p-4 uppercase">
                                {empresa.municipio} / {empresa.uf}
                            </td>
                            <td className="p-4 text-slate-500">
                                {empresa.regimeTributario}
                            </td>
                            <td className="p-4 font-mono text-slate-400">
                                {empresa.capitalSocial}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}