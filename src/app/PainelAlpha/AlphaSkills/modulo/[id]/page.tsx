import { getModulos, getVideos, getUserProgresso } from "@/actions/GetVideos";
import ModuloDetalhesClient from "./ModuloDetalhesClient";
import { redirect, notFound } from "next/navigation";
import { auth } from "../../../../../../auth";


export default async function ModuloPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params; 

    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const [mods, vids, progresso] = await Promise.all([
        getModulos(),
        getVideos(),
        getUserProgresso(session.user.id || "")
    ]);

    const moduloEncontrado = mods.find((m: any) => String(m.id) === String(id));

    if (!moduloEncontrado) {
        notFound();
    }

    const aulasDoModulo = vids
        .filter((v: any) => {
            const relacaoModulo = v.modulo || v.modulos || [];
            return relacaoModulo.some((m: any) => String(m.id) === String(id));
        })
        .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

    return (
        <ModuloDetalhesClient 
            session={session}
            modulo={moduloEncontrado}
            aulasIniciais={aulasDoModulo}
            progressoInicial={progresso}
        />
    );
}