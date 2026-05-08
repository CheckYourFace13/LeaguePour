import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/venue", "/player"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const callbackPath = `${pathname}${request.nextUrl.search}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("lp_callback", callbackPath, {
      path: "/",
      maxAge: 10 * 60,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/venue/:path*", "/player/:path*"],
};
