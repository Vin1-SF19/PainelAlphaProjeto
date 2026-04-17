import { auth } from "../../../../auth";
import { getModulos, getVideos, getUserProgresso } from "@/actions/GetVideos";
import AlphaSkillsClient from "./AlphaSkillsClient";

export default async function AlphaSkillsPage() {
  const session = await auth();
  
  const [mods, vids, progress] = await Promise.all([
    getModulos(),
    getVideos(),
    getUserProgresso(session?.user?.id || "")
  ]);

  const modulosProcessados = mods.map(mod => {
    if (!mod.bloqueado || !mod.requerModuloId) {
      return { ...mod, isLiberado: true };
    }

    const aulasRequisito = vids.filter(v =>
      v.modulo?.some((m: any) => m.id === mod.requerModuloId)
    );

    const concluidas = progress.filter(p =>
      aulasRequisito.some(a => a.id === p.aulaId)
    );

    const pct = aulasRequisito.length > 0 ? (concluidas.length / aulasRequisito.length) * 100 : 0;

    return {
      ...mod,
      isLiberado: pct >= (mod.percentualMinimo || 100)
    };
  });

  return (
    <AlphaSkillsClient 
      session={session} 
      initialModulos={modulosProcessados} 
      initialVideos={vids} 
    />
  );
}