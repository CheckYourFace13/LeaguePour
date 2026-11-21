/**
 * Researched prospect rows for the acquisition program. The list itself is NOT in this repository
 * (the repo is public): the owner keeps it in the gitignored private/acquisition/ folder and
 * uploads the JSON on /internal/acquisition, where it is validated, deduped and stored.
 *
 * Rules every row follows: a public source URL that shows the activity; the business's own
 * website where it has one; an email ONLY when the business publishes it (never guessed, never a
 * personal address); no Google Maps scraping.
 */
import type { AcqBrand } from "./program";

export type ProspectSeed = {
  brand: AcqBrand;
  name: string;
  city: string;
  state: string;
  segment: string;
  website?: string | null;
  sourceUrl: string;
  sourceNote: string;
  relevance: "high" | "medium";
  useCase: string;
  offer: string;
  contactRoute: "email" | "form" | "phone";
  contactValue?: string | null;
  email?: string | null;
  verifiedAt: string;
};

const MAX_ROWS = 1000;
const STR_FIELDS = ["name", "city", "state", "segment", "sourceUrl", "sourceNote", "useCase", "offer", "verifiedAt"] as const;

function clip(v: unknown, max: number): string | undefined {
  return typeof v === "string" ? v.trim().slice(0, max) : undefined;
}

/** Parses an uploaded prospect file. Shape problems reject the whole file; row-level rules are checked at import. */
export function parseProspectFile(raw: string): { seeds: ProspectSeed[]; error?: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { seeds: [], error: "Not valid JSON." };
  }
  if (!Array.isArray(data)) return { seeds: [], error: "Expected a JSON array of prospects." };
  if (data.length > MAX_ROWS) return { seeds: [], error: `Too many rows (max ${MAX_ROWS}).` };
  const seeds: ProspectSeed[] = [];
  for (const [i, r] of data.entries()) {
    if (!r || typeof r !== "object") return { seeds: [], error: `Row ${i + 1} is not an object.` };
    const o = r as Record<string, unknown>;
    if (o.brand !== "lp" && o.brand !== "vs") return { seeds: [], error: `Row ${i + 1}: brand must be "lp" or "vs".` };
    for (const f of STR_FIELDS) if (typeof o[f] !== "string") return { seeds: [], error: `Row ${i + 1}: missing ${f}.` };
    seeds.push({
      brand: o.brand,
      name: clip(o.name, 200)!,
      city: clip(o.city, 100)!,
      state: clip(o.state, 40)!,
      segment: clip(o.segment, 60)!,
      website: clip(o.website, 300) ?? null,
      sourceUrl: clip(o.sourceUrl, 500)!,
      sourceNote: clip(o.sourceNote, 500)!,
      relevance: o.relevance === "high" ? "high" : "medium",
      useCase: clip(o.useCase, 300)!,
      offer: clip(o.offer, 200)!,
      contactRoute: o.contactRoute === "email" || o.contactRoute === "form" || o.contactRoute === "phone" ? o.contactRoute : ("" as never),
      contactValue: clip(o.contactValue, 500) ?? null,
      email: clip(o.email, 200)?.toLowerCase() ?? null,
      verifiedAt: clip(o.verifiedAt, 10)!,
    });
  }
  return { seeds };
}
