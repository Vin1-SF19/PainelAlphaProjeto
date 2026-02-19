import { compareSync } from "bcryptjs";
import db from "./prisma";

type User = {
  usuario: string;
  id: string;
  nome: string;
  email: string;
  senha?: string;
  role: string;
  permissoes: string[];
};

export async function findUserByCredentials(
  email: string,
  senha: string,
): Promise<User | null> {
  const user = await db.usuarios.findFirst({
    where: { email },
  });
  
  console.log("EMAIL:", email)
  if (!user) return null;

  const passwordMatch = compareSync(senha, user.senha);
  if (!passwordMatch) return null;

  return {
    id: String(user.id),
    email: user.email,
    usuario: user.usuario,
    nome: user.nome,
    role: user.role,
    permissoes: user.permissoes?.split(",") ?? [],
  };
}
