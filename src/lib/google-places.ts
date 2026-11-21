/**
 * Google Places (API "Places API (New)", places.googleapis.com/v1) - server side only. The key
 * (GOOGLE_PLACES_API_KEY) never reaches the browser; the venue signup form talks to our own
 * /api/google/places/* routes, which are rate limited (src/lib/rate-limit.ts).
 *
 * Venue lookup uses Autocomplete (New) with a session token, closed by one Place Details call
 * with the same token, so a whole lookup bills as a single session instead of per keystroke.
 * Text Search is only a fallback when Autocomplete returns nothing. The legacy Places API
 * (maps.googleapis.com/maps/api/place/*) is intentionally not used: it isn't enabled for this
 * key and new work should stay on the New API.
 *
 * Storage (Google Maps Platform terms): the place ID may be stored indefinitely. Name, address,
 * phone and website are shown to the venue owner to confirm or edit before they become the
 * venue's own profile; latitude/longitude are not stored from Google (they may only be cached
 * for 30 days and nothing here needs them).
 */

export type GooglePlaceSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
};

export type GooglePlaceDetails = {
  placeId: string;
  name: string;
  formattedAddress: string;
  addressLine1: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  /** ISO 3166-1 alpha-2, e.g. "US", "GB", "CA". */
  countryCode: string | null;
  websiteUrl: string | null;
  phone: string | null;
  /** Link back to the place on Google Maps (attribution / "view on Google Maps"). */
  googleMapsUri: string | null;
};

type GooglePlacesError = Error & { status?: number; body?: unknown };

type NewTextSearchResponse = {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
  }>;
};

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
      text?: { text?: string };
    };
  }>;
};

type AddressComponent = { longText?: string; shortText?: string; types?: string[] };

type NewDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  googleMapsUri?: string;
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

function placesError(message: string, status: number, body: unknown): GooglePlacesError {
  const err = new Error(message) as GooglePlacesError;
  err.status = status;
  err.body = body;
  return err;
}

/** Google session tokens: URL-safe base64, up to 36 chars. Anything else is dropped. */
export function cleanSessionToken(raw: string | null | undefined): string | undefined {
  const t = (raw ?? "").trim();
  return /^[A-Za-z0-9_-]{8,36}$/.test(t) ? t : undefined;
}

/** Venue-name suggestions (Autocomplete New). Worldwide - no region restriction. */
export async function googlePlacesAutocomplete(input: string, sessionToken?: string): Promise<GooglePlaceSearchResult[]> {
  const key = getGooglePlacesKey();
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.text",
    },
    body: JSON.stringify({ input, languageCode: "en", ...(sessionToken ? { sessionToken } : {}) }),
  });
  const data = await parseJsonOrNull<AutocompleteResponse>(res);
  if (!res.ok) throw placesError(`Google Places autocomplete failed (HTTP ${res.status})`, res.status, data);
  return (data?.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
    .slice(0, 6)
    .map((p) => ({
      placeId: p.placeId!,
      name: p.structuredFormat?.mainText?.text?.trim() || p.text?.text?.trim() || "",
      formattedAddress: p.structuredFormat?.secondaryText?.text?.trim() ?? "",
    }))
    .filter((p) => p.name);
}

/** Text Search (New) - fallback when autocomplete has no suggestions (e.g. "name + city" typed). */
export async function googlePlacesTextSearch(query: string): Promise<GooglePlaceSearchResult[]> {
  const key = getGooglePlacesKey();
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "en", pageSize: 6 }),
  });
  const data = await parseJsonOrNull<NewTextSearchResponse>(res);
  if (!res.ok) throw placesError(`Google Places text search failed (HTTP ${res.status})`, res.status, data);
  return (data?.places ?? [])
    .map((p) => ({
      placeId: placeIdFromNewPlace(p),
      name: p.displayName?.text?.trim() || "",
      formattedAddress: p.formattedAddress ?? "",
    }))
    .filter((p): p is GooglePlaceSearchResult => Boolean(p.placeId) && Boolean(p.name));
}

function component(components: AddressComponent[], ...types: string[]): AddressComponent | undefined {
  for (const t of types) {
    const c = components.find((x) => x.types?.includes(t));
    if (c) return c;
  }
  return undefined;
}

/** Split Google's address components into the venue profile's fields (works for non-US formats). */
export function addressFromComponents(components: AddressComponent[]) {
  const streetNumber = component(components, "street_number")?.longText;
  const route = component(components, "route")?.longText;
  const premise = component(components, "premise", "subpremise")?.longText;
  const country = component(components, "country");
  const countryCode = country?.shortText?.toUpperCase() ?? null;
  // US/CA/AU put the number first ("425 Lafayette St"); most of Europe after ("Hauptstraße 5").
  const numberFirst = !countryCode || ["US", "CA", "AU", "NZ", "GB", "IE", "PH"].includes(countryCode);
  const street = route ? (streetNumber ? (numberFirst ? `${streetNumber} ${route}` : `${route} ${streetNumber}`) : route) : premise ?? null;
  return {
    addressLine1: street || null,
    city:
      component(components, "locality", "postal_town", "sublocality_level_1", "administrative_area_level_3", "administrative_area_level_2")
        ?.longText ?? null,
    region: component(components, "administrative_area_level_1")?.shortText ?? null,
    postalCode: component(components, "postal_code")?.longText ?? null,
    countryCode: countryCode && /^[A-Z]{2}$/.test(countryCode) ? countryCode : null,
  };
}

export async function googlePlaceDetails(placeId: string, sessionToken?: string): Promise<GooglePlaceDetails | null> {
  const key = getGooglePlacesKey();
  const resource = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const url = new URL(`https://places.googleapis.com/v1/${resource}`);
  url.searchParams.set("languageCode", "en");
  if (sessionToken) url.searchParams.set("sessionToken", sessionToken);
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      "X-Goog-Api-Key": key,
      // Only what the venue form shows. (location is deliberately not requested.)
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,addressComponents,websiteUri,nationalPhoneNumber,internationalPhoneNumber,googleMapsUri",
    },
  });
  const data = await parseJsonOrNull<NewDetailsResponse>(res);
  if (res.status === 404) return null;
  if (!res.ok) throw placesError(`Google Places details failed (HTTP ${res.status})`, res.status, data);
  if (!data?.id || !data.displayName?.text) return null;
  const addr = addressFromComponents(data.addressComponents ?? []);
  // Domestic format reads naturally for a local venue; international format otherwise.
  const phone = (addr.countryCode === "US" ? data.nationalPhoneNumber : data.internationalPhoneNumber ?? data.nationalPhoneNumber) ?? null;
  return {
    placeId: data.id,
    name: data.displayName.text,
    formattedAddress: data.formattedAddress ?? "",
    ...addr,
    websiteUrl: data.websiteUri ?? null,
    phone,
    googleMapsUri: data.googleMapsUri ?? null,
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

