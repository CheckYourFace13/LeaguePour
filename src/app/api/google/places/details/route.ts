import { NextResponse } from "next/server";
import { googlePlaceDetails } from "@/lib/google-places";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId")?.trim() ?? "";
  if (!placeId) return NextResponse.json({ place: null }, { status: 400 });
  try {
    const place = await googlePlaceDetails(placeId);
    return NextResponse.json({ place });
  } catch (error) {
    console.error("[places details] request failed", { placeId, error });
    return NextResponse.json(
      {
        place: null,
        error: "details_unavailable",
        message: "Could not load location details right now. You can continue without matching location.",
      },
      { status: 502 },
    );
  }
}
