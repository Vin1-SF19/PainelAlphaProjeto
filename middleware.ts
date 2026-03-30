import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token"
  });

  const isLoggedIn = !!token;

  if (pathname === "/") return NextResponse.next();

  if (!isLoggedIn && pathname.startsWith("/PainelAlpha")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (
    pathname.startsWith("/PainelAlpha/cadastro") &&
    token?.role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/PainelAlpha/:path*"],
};