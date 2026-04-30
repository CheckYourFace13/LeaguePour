import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  const origin = new URL(request.url).origin;
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", origin));
  }
  const next =
    session.venueAccess?.length > 0
      ? "/venue/dashboard"
      : session.hasPlayerProfile
        ? "/player/dashboard"
        : "/";
  return NextResponse.redirect(new URL(next, origin));
}
