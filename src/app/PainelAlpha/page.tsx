import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import PainelAlphaClient from "@/Components/PainelAlphaClient";
import db from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PainelAlpha() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userId = Number(session?.user?.id);
  const isAdmin = session?.user?.role === "Admin";

  const chamados = await db.chamados.findMany({
    where: { 
      ...(isAdmin ? {} : { usuarioId: userId }) 
    },
    select: {
      id: true,
      _count: {
        select: {
          mensagens: {
            where: {
              AND: [
                { autorId: { not: userId } },
                isAdmin ? { lida_admin: false } : { lida_usuario: false }
              ]
            }
          }
        }
      }
    }
  });

  return (
    <PainelAlphaClient 
      session={session} 
      chamadosIniciais={chamados} 
    />
  );
}
