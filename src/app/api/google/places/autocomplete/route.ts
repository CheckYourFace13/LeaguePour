import { NextResponse } from "next/server";
import { cleanSessionToken, googlePlacesAutocomplete, googlePlacesTextSearch } from "@/lib/google-places";
import { placesLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

/** Venue-name suggestions for the signup form. Server-side proxy: the API key never leaves the server. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 3) return NextResponse.json({ results: [] }, { headers: noStore });
  const limited = placesLimit(request, "autocomplete");
  if (limited) return limited;
  const session = cleanSessionToken(url.searchParams.get("session"));
  try {
    let results: Awaited<ReturnType<typeof googlePlacesAutocomplete>> = [];
    let autocompleteFailed = false;
    try {
      results = await googlePlacesAutocomplete(q, session);
    } catch (error) {
      // e.g. Autocomplete (New) not permitted for the key: Text Search still serves the lookup.
      autocompleteFailed = true;
      const e = error as { status?: number; body?: unknown; message?: string };
      console.error("[places autocomplete] autocomplete failed, trying text search", { status: e.status, message: e.message, body: e.body });
    }
    // "Name + city" queries sometimes autocomplete to nothing; one text search as backup.
    if (results.length === 0 && (autocompleteFailed || q.length >= 6) && !placesLimit(request, "search")) {
      results = await googlePlacesTextSearch(q);
    }
    return NextResponse.json({ results }, { headers: noStore });
  } catch (error) {
    const e = error as { status?: number; body?: unknown; message?: string };
    console.error("[places autocomplete] failed", { status: e.status, message: e.message, body: e.body });
    return NextResponse.json(
      { results: [], error: "lookup_unavailable", message: "Google lookup is unavailable right now. Type your venue details instead." },
      { status: 502, headers: noStore },
    );
  }
}
