import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // IMPORTANTE: O secret deve ser EXATAMENTE o mesmo do seu auth.ts
  // No NextAuth v5, a variável padrão é AUTH_SECRET
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  const token = await getToken({ 
    req, 
    secret,
    // Aqui usamos EXATAMENTE o nome que você definiu no seu auth.ts
    raw: false,
    cookieName: process.env.NODE_ENV === "production" 
      ? "next-auth.session-token" 
      : "next-auth.session-token"
  });

  const isLoggedIn = !!token;

  // Se estiver na home e logado, manda para o Painel (evita login duplo)
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  // Se não estiver logado e tentar acessar o Painel
  if (!isLoggedIn && pathname.startsWith("/PainelAlpha")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Regra de Admin
  if (
    pathname.startsWith("/PainelAlpha/cadastro") &&
    token?.role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};