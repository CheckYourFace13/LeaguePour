import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPublicSiteUrl } from "@/lib/site-url";

const protectedPrefixes = ["/venue", "/player", "/app"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  // Hostinger and similar reverse proxies can present HTTP internally while
  // the browser is on HTTPS, so probe both secure and non-secure cookie names.
  let token = await getToken({
    req: request,
    secret,
    secureCookie: true,
  });
  if (!token) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: false,
    });
  }

  if (!token) {
    const callbackPath = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL("/login", getPublicSiteUrl());
    const response = NextResponse.redirect(loginUrl);
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
  matcher: ["/venue/:path*", "/player/:path*", "/app/:path*"],
};
