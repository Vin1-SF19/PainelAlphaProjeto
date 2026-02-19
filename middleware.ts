import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const session = await auth();
    console.log("MIDDLEWARE SESSION:", session?.user);

  const pathname = req.nextUrl.pathname;

  // 🔒 BLOQUEIA NÃO LOGADO
  if (!session) {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  // 🔒 BLOQUEIA USER DE ENTRAR NO CADASTRO
  if (
    pathname.startsWith("/PainelAlpha/cadastro") &&
    session.user.role !== "Admin"
  ) {
    return NextResponse.redirect(
      new URL("/PainelAlpha", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/PainelAlpha/:path*"],
};
