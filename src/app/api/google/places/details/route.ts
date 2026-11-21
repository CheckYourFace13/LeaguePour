import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanSessionToken, googlePlaceDetails } from "@/lib/google-places";
import { placesLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Details for one selected suggestion (closes the autocomplete session). Also says whether a
 * venue on LeaguePour/VenueSprocket is already linked to this Google place, so the form can warn
 * before signup instead of failing on the unique Place ID.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = (url.searchParams.get("placeId") ?? "").trim();
  if (!/^[A-Za-z0-9_-]{10,300}$/.test(placeId.replace(/^places\//, ""))) {
    return NextResponse.json({ place: null }, { status: 400, headers: noStore });
  }
  const limited = placesLimit(request, "details");
  if (limited) return limited;
  try {
    const place = await googlePlaceDetails(placeId, cleanSessionToken(url.searchParams.get("session")));
    if (!place) return NextResponse.json({ place: null }, { status: 404, headers: noStore });
    const existing = await prisma.venue.findUnique({ where: { googlePlaceId: place.placeId }, select: { id: true } });
    return NextResponse.json({ place, alreadyRegistered: Boolean(existing) }, { headers: noStore });
  } catch (error) {
    const e = error as { status?: number; body?: unknown; message?: string };
    console.error("[places details] failed", { placeId, status: e.status, message: e.message, body: e.body });
    return NextResponse.json(
      { place: null, error: "details_unavailable", message: "Could not load this venue from Google. Type your details instead." },
      { status: 502, headers: noStore },
    );
  }
}
