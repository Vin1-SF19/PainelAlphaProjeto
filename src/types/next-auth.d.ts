import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      usuario: string;
      email: string;
      role: string;
      permissoes?: string[];
    };
  }

  interface User {
    id: string;
    nome: string;
    usuario: string;
    email: string;
    role: string;
    permissoes?: string | string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    nome?: string;
    usuario?: string;
    email?: string;
    role?: string;
    permissoes?: string[];
  }
}
