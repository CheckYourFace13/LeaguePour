import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPublicSiteUrl } from "@/lib/site-url";
import { LP_HOST, VS_HOST, isVsPath } from "@/lib/vs-routing";

const protectedPrefixes = ["/venue", "/player", "/app"];
// Shared/functional prefixes exempt from host gating below - authenticated app sections, auth
// utility pages (both brands' robots.txt already disallow these from indexing, which only makes
// sense if they're intentionally reachable on both domains), and API routes must keep working
// regardless of which domain a request arrives on. Static assets/framework internals were never
// part of the VS/LP path split in the first place.
const hostGateExemptPrefixes = [
  "/venue",
  "/player",
  "/app",
  "/api",
  "/venuesprocket",
  "/_next",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/internal",
  "/deposit",
  "/proposal",
  "/sign",
];

/**
 * Enforces the other half of brand/domain separation that next.config.ts's VS host rewrites
 * only set up one side of: previously nothing stopped an LP-only marketing path (e.g. /about)
 * from rendering in full on venuesprocket.com (wrong branding, wrong Organization schema), or
 * /venuesprocket/* from rendering on leaguepour.com. Redirects (301, permanent) to the correct
 * domain instead of a bare 404 - more useful for a real visitor and consolidates any accidental
 * backlinks/crawl attention onto the canonical location. Only fires for the two known
 * production hostnames, never for localhost/preview hosts, so local dev is unaffected.
 */
function hostRedirect(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const { pathname, search } = request.nextUrl;
  if (hostGateExemptPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  if (host === VS_HOST && !isVsPath(pathname)) {
    return NextResponse.redirect(`https://${LP_HOST}${pathname}${search}`, 301);
  }
  if (host === LP_HOST && pathname.startsWith("/venuesprocket")) {
    const stripped = pathname.replace(/^\/venuesprocket/, "") || "/";
    return NextResponse.redirect(`https://${VS_HOST}${stripped}${search}`, 301);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirect = hostRedirect(request);
  if (redirect) return redirect;

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
  // Broad match for the host-gating check above (needs to see every marketing/page path, not
  // just the auth-protected ones) - excludes Next internals and common static file extensions,
  // which were never part of the host split and don't need this middleware to run on them.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|webp|txt|xml|webmanifest)$).*)"],
};
