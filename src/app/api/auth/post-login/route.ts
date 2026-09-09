import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublicSiteUrl } from "@/lib/site-url";
import { VS_HOST } from "@/lib/vs-routing";

// This is the fallback destination after a plain /login with no callbackUrl - exactly what a
// bookmarked venuesprocket.com/login hits. getPublicSiteUrl() always resolves to leaguepour.com
// (it has no way to know which domain the browser is actually on), so every venue owner who
// logged in via venuesprocket.com landed on leaguepour.com/venue/dashboard - the LeaguePour
// competition dashboard, not their actual VenueSprocket product - found via whole-business audit,
// confirmed live with a real disposable login. Read the real incoming Host header instead.
export async function GET(request: Request) {
  const session = await auth();
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const siteOrigin = host === VS_HOST ? `https://${VS_HOST}` : getPublicSiteUrl();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", siteOrigin));
  }
  const next =
    host === VS_HOST && session.venueAccess?.length > 0
      ? "/app/dashboard"
      : session.venueAccess?.length > 0
        ? "/venue/dashboard"
        : session.hasPlayerProfile
          ? "/player/dashboard"
          : "/";
  return NextResponse.redirect(new URL(next, siteOrigin));
}
