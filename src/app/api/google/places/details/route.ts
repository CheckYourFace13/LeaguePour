import { NextResponse } from "next/server";
import { googlePlaceDetails } from "@/lib/google-places";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId")?.trim() ?? "";
  if (!placeId) return NextResponse.json({ place: null }, { status: 400 });
  try {
    const place = await googlePlaceDetails(placeId);
    return NextResponse.json({ place });
  } catch {
    return NextResponse.json({ place: null }, { status: 500 });
  }
}
