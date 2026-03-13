"use server";

import db from "@/lib/prisma";
import { auth } from "../../auth";

export async function getContatosChat() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const agora = new Date();
  const limiteOnline = new Date(agora.getTime() - 10000); 

  const usuarios = await db.usuarios.findMany({
    where: {
      NOT: { id: Number(session.user.id) } 
    },
    select: {
      id: true,
      nome: true,
      role: true,
      tema_interface: true,
      ultimo_aviso: true,
      imagemUrl: true
    },
    orderBy: { nome: 'asc' }
  });

  return usuarios.map(u => ({
    ...u,
    isOnline: u.ultimo_aviso ? new Date(u.ultimo_aviso) >= limiteOnline : false
  }));
}
