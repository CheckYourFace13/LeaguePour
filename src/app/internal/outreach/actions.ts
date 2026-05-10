"use server";

import { auth } from "@/auth";
import { requireOwnerSession } from "@/lib/admin-auth";

type Bar = {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  placeId: string;
};

export async function searchBarsForOutreach(
  city: string,
): Promise<{ bars?: Bar[]; error?: string }> {
  try {
    await requireOwnerSession();
  } catch {
    return { error: "Not authorised" };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { error: "Google Places API key not configured" };

  const queries = [
    `bars in ${city}`,
    `taverns in ${city}`,
    `pubs in ${city}`,
    `sports bars in ${city}`,
  ];

  const seen = new Set<string>();
  const bars: Bar[] = [];

  for (const query of queries) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("type", "bar");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = await res.json() as {
      results: {
        place_id: string;
        name: string;
        formatted_address: string;
        rating?: number;
        formatted_phone_number?: string;
        website?: string;
      }[];
    };

    for (const place of data.results ?? []) {
      if (seen.has(place.place_id)) continue;
      seen.add(place.place_id);

      // Fetch place details for phone + website
      const detailUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      detailUrl.searchParams.set("place_id", place.place_id);
      detailUrl.searchParams.set("fields", "formatted_phone_number,website");
      detailUrl.searchParams.set("key", apiKey);

      let phone: string | undefined;
      let website: string | undefined;
      try {
        const detailRes = await fetch(detailUrl.toString());
        const detail = await detailRes.json() as { result: { formatted_phone_number?: string; website?: string } };
        phone = detail.result?.formatted_phone_number;
        website = detail.result?.website;
      } catch {
        // skip details if unavailable
      }

      bars.push({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        phone,
        website,
      });

      if (bars.length >= 40) break;
    }
    if (bars.length >= 40) break;
  }

  return { bars };
}
