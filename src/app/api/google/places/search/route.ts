import { NextResponse } from "next/server";
import { googlePlacesTextSearch } from "@/lib/google-places";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ results: [] });
  try {
    const results = await googlePlacesTextSearch(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[places search] request failed", { query: q, error });
    return NextResponse.json(
      {
        results: [],
        error: "search_unavailable",
        message: "Location search is temporarily unavailable. Try again in a moment.",
      },
      { status: 502 },
    );
  }
}
