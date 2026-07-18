export type GooglePlaceSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
};

type GooglePlacesError = Error & { status?: number; body?: unknown };

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

type NewTextSearchResponse = {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
  }>;
};

type NewDetailsResponse = {
  id?: string;
  name?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
  nationalPhoneNumber?: string;
};

function getGooglePlacesKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is missing.");
  return key;
}

function placeIdFromNewPlace(place: { id?: string; name?: string }): string | null {
  if (place.id?.trim()) return place.id.trim();
  if (place.name?.startsWith("places/")) return place.name.slice("places/".length);
  return null;
}

async function parseJsonOrNull<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function googlePlacesTextSearchNew(query: string, key: string): Promise<GooglePlaceSearchResult[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.name,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "en",
      regionCode: "US",
      pageSize: 8,
    }),
  });
  const data = await parseJsonOrNull<NewTextSearchResponse>(res);
  if (!res.ok) {
    const err = new Error("Google Places (new) text search failed") as GooglePlacesError;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return (data?.places ?? [])
    .map((p) => ({
      placeId: placeIdFromNewPlace(p),
      name: p.displayName?.text?.trim() || "",
      formattedAddress: p.formattedAddress ?? "",
    }))
    .filter((p): p is GooglePlaceSearchResult => Boolean(p.placeId) && Boolean(p.name));
}

async function googlePlacesTextSearchLegacy(query: string, key: string): Promise<GooglePlaceSearchResult[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await parseJsonOrNull<TextSearchResponse>(res);
  if (!res.ok) {
    const err = new Error("Google Places (legacy) text search failed") as GooglePlacesError;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return (data?.results ?? [])
    .filter((r) => r.place_id && r.name)
    .slice(0, 8)
    .map((r) => ({
      placeId: r.place_id!,
      name: r.name!,
      formattedAddress: r.formatted_address ?? "",
    }));
}

export async function googlePlacesTextSearch(query: string): Promise<GooglePlaceSearchResult[]> {
  const key = getGooglePlacesKey();
  const errors: GooglePlacesError[] = [];
  try {
    const r = await googlePlacesTextSearchNew(query, key);
    if (r.length > 0) return r;
  } catch (e) {
    errors.push(e as GooglePlacesError);
  }
  try {
    return await googlePlacesTextSearchLegacy(query, key);
  } catch (e) {
    errors.push(e as GooglePlacesError);
  }
  console.error("[google places] text search failed", {
    query,
    errors: errors.map((e) => ({ message: e.message, status: e.status, body: e.body })),
  });
  return [];
}

async function googlePlaceDetailsNew(placeId: string, key: string) {
  const resource = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const url = `https://places.googleapis.com/v1/${resource}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "id,name,displayName,formattedAddress,location,websiteUri,nationalPhoneNumber",
    },
  });
  const data = await parseJsonOrNull<NewDetailsResponse>(res);
  if (!res.ok) {
    const err = new Error("Google Places (new) details failed") as GooglePlacesError;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  const resolvedId = data?.id?.trim() || (data?.name?.startsWith("places/") ? data.name.slice(7) : "");
  if (!resolvedId || !data?.displayName?.text) return null;
  return {
    placeId: resolvedId,
    name: data.displayName.text,
    formattedAddress: data.formattedAddress ?? "",
    latitude: data.location?.latitude ?? null,
    longitude: data.location?.longitude ?? null,
    websiteUrl: data.websiteUri ?? null,
    phone: data.nationalPhoneNumber ?? null,
  };
}

async function googlePlaceDetailsLegacy(placeId: string, key: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,geometry,website,formatted_phone_number",
  );
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await parseJsonOrNull<DetailsResponse>(res);
  if (!res.ok) {
    const err = new Error("Google Places (legacy) details failed") as GooglePlacesError;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  const p = data?.result;
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

export type OutreachBarResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating: number | null;
  phone: string | null;
  websiteUrl: string | null;
};

type BarSweepResponse = {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    websiteUri?: string;
    nationalPhoneNumber?: string;
  }>;
  nextPageToken?: string;
};

/**
 * Bulk bar search for outreach sweeps (Places API v1 only — the legacy API is not
 * enabled for this key). Contact fields ride along in the field mask, so no
 * per-place details calls are needed. Throws on API failure so callers can
 * surface the error instead of silently recording an empty sweep.
 */
export async function googlePlacesBarSweep(query: string, maxResults = 40): Promise<OutreachBarResult[]> {
  const key = getGooglePlacesKey();
  const out: OutreachBarResult[] = [];
  let pageToken: string | undefined;

  while (out.length < maxResults) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.name,places.displayName,places.formattedAddress,places.rating,places.websiteUri,places.nationalPhoneNumber,nextPageToken",
      },
      body: JSON.stringify({
        textQuery: query,
        includedType: "bar",
        languageCode: "en",
        pageSize: 20,
        ...(pageToken ? { pageToken } : {}),
      }),
    });
    const data = await parseJsonOrNull<BarSweepResponse>(res);
    if (!res.ok) {
      const err = new Error(`Google Places sweep failed (HTTP ${res.status})`) as GooglePlacesError;
      err.status = res.status;
      err.body = data;
      throw err;
    }

    for (const p of data?.places ?? []) {
      const placeId = placeIdFromNewPlace(p);
      const name = p.displayName?.text?.trim();
      if (!placeId || !name) continue;
      out.push({
        placeId,
        name,
        formattedAddress: p.formattedAddress ?? "",
        rating: typeof p.rating === "number" ? p.rating : null,
        phone: p.nationalPhoneNumber ?? null,
        websiteUrl: p.websiteUri ?? null,
      });
    }

    pageToken = data?.nextPageToken;
    if (!pageToken) break;
  }

  return out.slice(0, maxResults);
}

export async function googlePlaceDetails(placeId: string) {
  const key = getGooglePlacesKey();
  const errors: GooglePlacesError[] = [];
  try {
    const r = await googlePlaceDetailsNew(placeId, key);
    if (r) return r;
  } catch (e) {
    errors.push(e as GooglePlacesError);
  }
  try {
    return await googlePlaceDetailsLegacy(placeId, key);
  } catch (e) {
    errors.push(e as GooglePlacesError);
  }
  console.error("[google places] details failed", {
    placeId,
    errors: errors.map((e) => ({ message: e.message, status: e.status, body: e.body })),
  });
  return null;
}
