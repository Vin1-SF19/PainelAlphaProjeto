import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!session;

  if (pathname.startsWith("/PainelAlpha/cadastro") && session?.user?.role !== "Admin") {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/PainelAlpha/:path*"],
};