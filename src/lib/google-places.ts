export type GooglePlaceSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
};

type TextSearchResponse = {
  results?: Array<{
    place_id?: string;
    name?: string;
    formatted_address?: string;
  }>;
};

type DetailsResponse = {
  result?: {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
    website?: string;
    formatted_phone_number?: string;
  };
};

function getGooglePlacesKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is missing.");
  return key;
}

export async function googlePlacesTextSearch(query: string): Promise<GooglePlaceSearchResult[]> {
  const key = getGooglePlacesKey();
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as TextSearchResponse;
  return (data.results ?? [])
    .filter((r) => r.place_id && r.name)
    .slice(0, 8)
    .map((r) => ({
      placeId: r.place_id!,
      name: r.name!,
      formattedAddress: r.formatted_address ?? "",
    }));
}

export async function googlePlaceDetails(placeId: string) {
  const key = getGooglePlacesKey();
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,geometry,website,formatted_phone_number",
  );
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as DetailsResponse;
  const p = data.result;
  if (!p?.place_id || !p.name) return null;
  return {
    placeId: p.place_id,
    name: p.name,
    formattedAddress: p.formatted_address ?? "",
    latitude: p.geometry?.location?.lat ?? null,
    longitude: p.geometry?.location?.lng ?? null,
    websiteUrl: p.website ?? null,
    phone: p.formatted_phone_number ?? null,
  };
}
