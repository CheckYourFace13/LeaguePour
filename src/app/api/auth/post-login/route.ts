import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function GET() {
  const session = await auth();
  const siteOrigin = getPublicSiteUrl();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", siteOrigin));
  }
  const next =
    session.venueAccess?.length > 0
      ? "/venue/dashboard"
      : session.hasPlayerProfile
        ? "/player/dashboard"
        : "/";
  return NextResponse.redirect(new URL(next, siteOrigin));
}
