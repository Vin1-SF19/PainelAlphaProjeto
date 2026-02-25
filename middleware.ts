import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!session;

  //BLOQUEIA ACESSO SE NÃO ESTIVER LOGADO
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // BLOQUEIA USER COMUM DE ENTRAR NO CADASTRO (EXIGE ADMIN)
  if (
    pathname.startsWith("/PainelAlpha/cadastro") &&
    session?.user?.role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/PainelAlpha/:path*"],
};
