import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByCredentials } from "@/lib/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        senha: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const user = await findUserByCredentials(
          String(credentials.email),
          String(credentials.senha)
        );

        if (!user) return null;

        // RETORNO COMPLETO
        return {
          id: String(user.id),
          email: user.email,
          nome: user.nome,
          usuario: user.usuario,
          role: user.role,
          permissoes: (user as any).permissoes,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // Expira em 24h se o navegador continuar aberto
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  jwt: {
    maxAge:

      60 * 60 * 24,
  },

  callbacks: {
    async jwt({ token, user }) {
      // PRIMEIRO LOGIN
      maxAge: 60 * 60 * 24
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nome = user.nome;
        token.usuario = user.usuario;
        token.role = user.role;
        token.permissoes = (user as any).permissoes;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.usuario = token.usuario as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;

        (session.user as any).setor = token.role as string;

        session.user.permissoes = token.permissoes as string[];
      }

      return session;
    },
  },
});
