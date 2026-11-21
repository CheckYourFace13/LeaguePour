import { NextResponse } from "next/server";
import { googlePlacesTextSearch } from "@/lib/google-places";
import { placesLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Kept for older clients; the signup form now uses /api/google/places/autocomplete. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 3) return NextResponse.json({ results: [] });
  const limited = placesLimit(request, "search");
  if (limited) return limited;
  try {
    return NextResponse.json({ results: await googlePlacesTextSearch(q) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const e = error as { status?: number; body?: unknown; message?: string };
    console.error("[places search] failed", { status: e.status, message: e.message, body: e.body });
    return NextResponse.json(
      { results: [], error: "search_unavailable", message: "Location search is temporarily unavailable." },
      { status: 502 },
    );
  }
}
