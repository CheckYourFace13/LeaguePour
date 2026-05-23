import { OUTREACH_CITIES, type OutreachCity } from "@/lib/outreach-cities";

export type OutreachCityRecord = {
  slug: string;
  name: string;
  state: string;
  country: "US" | "CA";
};

function baseSlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Build slug for a city/state pair (matches bar-leagues static params). */
export function getOutreachCitySlug(city: string, state: string): string {
  const slugCounts = new Map<string, number>();
  for (const c of OUTREACH_CITIES) {
    const base = baseSlug(c.city);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }
  const base = baseSlug(city);
  const needsDisambig = (slugCounts.get(base) ?? 0) > 1;
  let slug = needsDisambig ? `${base}-${state.toLowerCase()}` : base;
  if (city === "Portland" && state === "OR") slug = "portland";
  return slug;
}

export function getAllOutreachCityRecords(): OutreachCityRecord[] {
  const slugCounts = new Map<string, number>();
  for (const c of OUTREACH_CITIES) {
    const base = baseSlug(c.city);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }

  const seen = new Set<string>();
  const records: OutreachCityRecord[] = [];

  for (const c of OUTREACH_CITIES) {
    const key = `${c.city}|${c.state}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const base = baseSlug(c.city);
    const needsDisambig = (slugCounts.get(base) ?? 0) > 1;
    let slug = needsDisambig ? `${base}-${c.state.toLowerCase()}` : base;
    if (c.city === "Portland" && c.state === "OR") slug = "portland";

    records.push({
      slug,
      name: c.city,
      state: c.state,
      country: c.country,
    });
  }

  return records;
}

export function getOutreachCityBySlug(slug: string): OutreachCityRecord | null {
  return getAllOutreachCityRecords().find((r) => r.slug === slug) ?? null;
}

export function getAllOutreachCitySlugs(): string[] {
  return getAllOutreachCityRecords().map((r) => r.slug);
}

export function getBarsDescription(city: OutreachCityRecord): string {
  return city.country === "CA"
    ? `${city.name}, ${city.state} bars and pubs`
    : `${city.name}'s bars and venues`;
}

export function matchOutreachCity(c: OutreachCity, slug: string): boolean {
  return getOutreachCitySlug(c.city, c.state) === slug;
}
