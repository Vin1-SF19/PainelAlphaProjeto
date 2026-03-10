import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!session;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (
    pathname.startsWith("/PainelAlpha/cadastro") &&
    session?.user?.role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/PainelAlpha", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/PainelAlpha/:path*"
  ],
};