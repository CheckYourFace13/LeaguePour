/**
 * Automated discovery of NEW prospects (businesses not yet in any list), small and capped.
 *
 * Sources and rules:
 *  - Google Places API (New) Text Search, server-side with the production key, field mask
 *    `places.id,places.websiteUri,places.businessStatus` only: a few queries per day (owner cap,
 *    default 3, max 8). Nothing else from Google is stored: no names, addresses, ratings, phones
 *    or reviews. The place ID is kept (allowed indefinitely) to avoid re-checking a business; the
 *    website URL is used only to read the business's own site. No Maps scraping, no bulk export.
 *  - The business's own public website: homepage plus a few likely pages, after checking its
 *    robots.txt. Name, email (only a role-based address the business publishes) and the
 *    qualification evidence come from there.
 * Matches become QUEUED prospects in the owner approval queue (personalized draft, provenance:
 * query, page, phrase, date). Nothing is ever sent automatically.
 *
 * Expansion: a persisted cursor walks query templates x Chicagoland municipalities (Chicago first,
 * then the inner suburbs, then further out), so coverage grows a little each day and no query
 * repeats until the list is exhausted.
 */
import { prisma } from "@/lib/db";
import { getSetting, setSetting, getBoolSetting } from "@/lib/app-settings";
import { isPlausibleEmail } from "@/lib/outreach-email";
import { ensureAcquisitionTable, importProspects } from "./store";
import { LP_SIGNAL_RE, VS_SIGNAL_RE } from "./qualify";
import { domainOf, isPublicWebUrl, isSharedHost, type AcqBrand } from "./program";
export { isPublicWebUrl };
import type { ProspectSeed } from "./prospects.data";

export const DISCOVERY_ENABLED_KEY = "acq_discovery_enabled";
export const DISCOVERY_QUERIES_KEY = "acq_discovery_queries_per_day";
export const DISCOVERY_SITES_KEY = "acq_discovery_sites_per_day";
const CURSOR_KEY = "acq_discovery_cursor";
export const DEFAULT_QUERIES_PER_DAY = 3;
export const MAX_QUERIES_PER_DAY = 8;
export const DEFAULT_SITES_PER_DAY = 20;
export const MAX_SITES_PER_DAY = 40;
const FETCH_TIMEOUT_MS = 5000;
const SITE_BUDGET_MS = 60_000;
const UA = "Mozilla/5.0 (compatible; LeaguePourBot/1.0; +https://leaguepour.com)";
const BOT_TOKEN = "leaguepourbot";

/** Chicagoland, nearest first. */
export const DISCOVERY_CITIES = [
  "Chicago", "Evanston", "Oak Park", "Skokie", "Cicero", "Berwyn", "Forest Park", "Park Ridge",
  "Des Plaines", "Niles", "Elmhurst", "Oak Lawn", "Evergreen Park", "Blue Island", "Wilmette",
  "Glenview", "Northbrook", "Arlington Heights", "Schaumburg", "Palatine", "Mount Prospect",
  "Lombard", "Downers Grove", "Wheaton", "Naperville", "Aurora", "Joliet", "Orland Park",
  "Tinley Park", "Bolingbrook", "Elgin", "St. Charles", "Geneva", "Waukegan", "Libertyville",
  "Highland Park", "Lake Forest", "Crystal Lake", "Woodstock", "Homewood",
];

type Template = { brand: AcqBrand; organizer?: boolean; text: (city: string) => string };
export const DISCOVERY_TEMPLATES: Template[] = [
  { brand: "lp", text: (c) => `bar with trivia night in ${c}, IL` },
  { brand: "vs", text: (c) => `restaurant with private dining room in ${c}, IL` },
  { brand: "lp", text: (c) => `bar with dart league or cornhole league in ${c}, IL` },
  { brand: "vs", text: (c) => `brewery with private event space in ${c}, IL` },
  { brand: "lp", organizer: true, text: (c) => `adult social sports league organizer in ${c}, IL` },
  { brand: "vs", text: (c) => `event venue for private parties in ${c}, IL` },
];

/** The query at a cursor position: cycles templates within a city, then moves to the next city. */
export function queryAt(cursor: number): { city: string; template: Template; query: string } | null {
  const total = DISCOVERY_CITIES.length * DISCOVERY_TEMPLATES.length;
  if (cursor >= total) return null;
  const city = DISCOVERY_CITIES[Math.floor(cursor / DISCOVERY_TEMPLATES.length)];
  const template = DISCOVERY_TEMPLATES[cursor % DISCOVERY_TEMPLATES.length];
  return { city, template, query: template.text(city) };
}

const DISCOVERY_DDL = `CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionDiscovery" (
  "placeId" TEXT NOT NULL, "query" TEXT NOT NULL, "city" TEXT NOT NULL, "brandHint" TEXT NOT NULL,
  "organizer" BOOLEAN NOT NULL DEFAULT false, "website" TEXT, "status" TEXT NOT NULL DEFAULT 'pending',
  "detail" TEXT, "prospectId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkedAt" TIMESTAMP(3), CONSTRAINT "AcquisitionDiscovery_pkey" PRIMARY KEY ("placeId"))`;

let ensured = false;
export async function ensureDiscoveryTable(): Promise<void> {
  if (ensured) return;
  await prisma.$executeRawUnsafe(DISCOVERY_DDL);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AcquisitionDiscovery_status_idx" ON "leaguepour_lp"."AcquisitionDiscovery"("status")`);
  ensured = true;
}

export async function discoveryConfig() {
  const clamp = (raw: string, def: number, max: number) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), max) : def;
  };
  const [enabled, q, s] = await Promise.all([
    getBoolSetting(DISCOVERY_ENABLED_KEY, true),
    getSetting(DISCOVERY_QUERIES_KEY, String(DEFAULT_QUERIES_PER_DAY)),
    getSetting(DISCOVERY_SITES_KEY, String(DEFAULT_SITES_PER_DAY)),
  ]);
  return {
    enabled,
    queriesPerDay: clamp(q, DEFAULT_QUERIES_PER_DAY, MAX_QUERIES_PER_DAY),
    sitesPerDay: clamp(s, DEFAULT_SITES_PER_DAY, MAX_SITES_PER_DAY),
    cursor: Number(await getSetting(CURSOR_KEY, "0")) || 0,
    totalQueries: DISCOVERY_CITIES.length * DISCOVERY_TEMPLATES.length,
  };
}

// ── Google Places (New): place IDs + website only ────────────────────────────

export type PlaceHit = { placeId: string; website: string | null; open: boolean };

export async function placesTextSearchIds(query: string): Promise<PlaceHit[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.websiteUri,places.businessStatus",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "en", regionCode: "US", pageSize: 20 }),
  });
  if (!res.ok) throw new Error(`Places text search failed (HTTP ${res.status})`);
  const data = (await res.json().catch(() => ({}))) as { places?: { id?: string; websiteUri?: string; businessStatus?: string }[] };
  return (data.places ?? [])
    .filter((p): p is { id: string; websiteUri?: string; businessStatus?: string } => typeof p.id === "string")
    .map((p) => ({ placeId: p.id, website: p.websiteUri ?? null, open: !p.businessStatus || p.businessStatus === "OPERATIONAL" }));
}

// ── robots.txt (minimal, conservative) ───────────────────────────────────────

/** Disallow prefixes that apply to us (our token or "*"), from a robots.txt body. */
export function robotsDisallows(body: string): string[] {
  const groups: { agents: string[]; disallow: string[] }[] = [];
  let current: { agents: string[]; disallow: string[] } | null = null;
  let lastWasAgent = false;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (field === "disallow" && current && value) current.disallow.push(value);
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a.includes(BOT_TOKEN)));
  const chosen = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
  return chosen.flatMap((g) => g.disallow);
}

export function pathAllowed(path: string, disallows: string[]): boolean {
  return !disallows.some((d) => d === "/" || path.startsWith(d.replace(/\*.*$/, "")));
}

// ── Website reading ──────────────────────────────────────────────────────────


type Fetcher = (url: string) => Promise<{ status: number; html: string | null; finalUrl: string }>;

const defaultFetcher: Fetcher = async (url) => {
  if (!isPublicWebUrl(url)) return { status: 0, html: null, finalUrl: url };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), redirect: "follow", headers: { "User-Agent": UA } });
    if (res.url && !isPublicWebUrl(res.url)) return { status: 0, html: null, finalUrl: url };
    const type = res.headers.get("content-type") ?? "";
    const html = res.ok && (type.includes("text/html") || type.includes("text/plain")) ? (await res.text()).slice(0, 400_000) : null;
    return { status: res.status, html, finalUrl: res.url || url };
  } catch {
    return { status: 0, html: null, finalUrl: url };
  }
};

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ");
}

/** Business name from its own page: og:site_name, else the <title> before a separator. */
export function siteName(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{2,80})["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']{2,80})["'][^>]+property=["']og:site_name["']/i)?.[1];
  const title = html.match(/<title[^>]*>([^<]{2,200})<\/title>/i)?.[1];
  const raw = (og ?? title ?? "").replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;/g, "'").trim();
  const name = raw.split(/\s+[|\-–—:•]\s+/)[0].trim();
  if (name.length < 2 || name.length > 60) return null;
  if (/^(home|welcome|index|untitled)$/i.test(name)) return null;
  return name;
}

const ROLE_LOCAL = /^(info|events?|event-?sales|privateevents|private-?events|parties|party|hello|contact|booking|bookings|reservations?|catering|taproom|bar|office|manager|sales|leagues?|play|inquiries|team)$/i;

/** A role-based email on the business's own domain, published on its pages. Never personal names. */
export function roleEmail(htmls: string[], domain: string): string | null {
  const found = new Set<string>();
  for (const html of htmls) {
    for (const m of html.matchAll(/mailto:([^"'?\s\\<>]+)/gi)) found.add(decodeURIComponent(m[1]).trim().toLowerCase());
    for (const m of html.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) found.add(m[0].trim().toLowerCase());
  }
  for (const e of found) {
    const [local, host] = e.split("@");
    if (!host || !isPlausibleEmail(e)) continue;
    if (host !== domain && !host.endsWith(`.${domain}`)) continue;
    if (ROLE_LOCAL.test(local)) return e;
  }
  return null;
}

const ORGANIZER_RE = /\b(?:adult|social|rec(?:reational)?|coed)\s+(?:sports?\s+)?leagues?\b|\bregister\s+(?:a|your)\s+team\b|\bleague\s+registration\b/i;

export type SiteVerdict =
  | { kind: "qualified"; seed: ProspectSeed }
  | { kind: "no-signal" | "unreachable" | "robots" | "no-name" | "shared-host"; detail: string };

/** Reads one business site (max 4 pages, robots-respecting) and returns a queue seed or why not. */
export async function evaluateSite(
  hit: { website: string; city: string; brandHint: AcqBrand; organizer: boolean; query: string },
  day: string,
  fetcher: Fetcher = defaultFetcher,
): Promise<SiteVerdict> {
  let base: URL;
  try {
    base = new URL(hit.website);
  } catch {
    return { kind: "unreachable", detail: "invalid URL" };
  }
  if (!isPublicWebUrl(base.href)) return { kind: "unreachable", detail: "not a public web URL" };
  const domain = domainOf(base.href);
  if (!domain || isSharedHost(domain)) return { kind: "shared-host", detail: domain ?? "no domain" };
  const robots = await fetcher(new URL("/robots.txt", base).href);
  const disallows = robots.status === 200 && robots.html ? robotsDisallows(robots.html) : [];
  if (!pathAllowed("/", disallows)) return { kind: "robots", detail: "robots.txt disallows the site" };

  const paths = hit.brandHint === "vs" ? ["/", "/private-events", "/events", "/contact"] : ["/", "/events", "/contact"];
  const pages: { url: string; html: string; text: string }[] = [];
  for (const p of paths) {
    if (!pathAllowed(p, disallows)) continue;
    const r = await fetcher(new URL(p, base).href);
    if (r.html) pages.push({ url: r.finalUrl, html: r.html, text: visibleText(r.html) });
    else if (p === "/") return { kind: "unreachable", detail: `homepage HTTP ${r.status}` };
  }
  const name = siteName(pages[0].html);
  if (!name) return { kind: "no-name", detail: "no usable site name" };

  let evidence: { brand: AcqBrand; phrase: string; url: string; organizer: boolean } | null = null;
  for (const pg of pages) {
    const org = hit.organizer ? pg.text.match(ORGANIZER_RE) : null;
    if (org) {
      evidence = { brand: "lp", phrase: org[0].toLowerCase(), url: pg.url, organizer: true };
      break;
    }
    const lp = pg.text.match(LP_SIGNAL_RE);
    const vs = pg.text.match(VS_SIGNAL_RE);
    const pick = hit.brandHint === "vs" ? (vs ? { b: "vs" as const, m: vs } : lp ? { b: "lp" as const, m: lp } : null) : lp ? { b: "lp" as const, m: lp } : vs ? { b: "vs" as const, m: vs } : null;
    if (pick && (!evidence || pick.b === hit.brandHint)) evidence = { brand: pick.b, phrase: pick.m[0].toLowerCase(), url: pg.url, organizer: false };
    if (evidence?.brand === hit.brandHint) break;
  }
  if (!evidence) return { kind: "no-signal", detail: `checked ${pages.length} page(s)` };

  const email = roleEmail(pages.map((p) => p.html), domain);
  const contactPage = pages.find((p) => /\/contact/.test(p.url))?.url ?? base.href;
  const seed: ProspectSeed = {
    brand: evidence.brand,
    name,
    city: hit.city,
    state: "IL",
    segment: evidence.organizer ? "league organizer (auto-discovered)" : evidence.brand === "lp" ? "bar/brewery (auto-discovered)" : "venue (auto-discovered)",
    website: `${base.protocol}//${base.host}/`,
    sourceUrl: evidence.url,
    sourceNote: `Found via Google Places search "${hit.query}"; the business's own site says "${evidence.phrase}" (${day}). Confirm before approving.`,
    relevance: "medium",
    useCase: evidence.organizer
      ? `the ${evidence.phrase} you organize`
      : evidence.brand === "lp"
        ? `the ${evidence.phrase} listed on your website`
        : `that your website mentions ${evidence.phrase}`,
    offer: evidence.brand === "lp" ? "Free bracket generator; first competition free, no card" : "Free inquiry form with unlimited inquiries",
    contactRoute: email ? "email" : "form",
    contactValue: email ? null : contactPage,
    email,
    verifiedAt: day,
  };
  return { kind: "qualified", seed };
}

// ── Daily run ────────────────────────────────────────────────────────────────

export type DiscoveryResult = {
  queriesRun: string[];
  placesFound: number;
  newPlaces: number;
  sitesChecked: number;
  qualified: number;
  queued: number;
  suppressedOrDuplicate: number;
  outcomes: Record<string, number>;
  error?: string;
};

export async function runDiscovery(
  now = new Date(),
  opts: { search?: (q: string) => Promise<PlaceHit[]>; fetcher?: Fetcher; budgetMs?: number } = {},
): Promise<DiscoveryResult> {
  await ensureAcquisitionTable();
  await ensureDiscoveryTable();
  const cfg = await discoveryConfig();
  const day = now.toISOString().slice(0, 10);
  const search = opts.search ?? placesTextSearchIds;
  const result: DiscoveryResult = { queriesRun: [], placesFound: 0, newPlaces: 0, sitesChecked: 0, qualified: 0, queued: 0, suppressedOrDuplicate: 0, outcomes: {} };

  // 1. Search: a few new queries per day, recording only place IDs we have never seen.
  const [knownDiscovery, knownContacts, knownVenues] = await Promise.all([
    prisma.acquisitionDiscovery.findMany({ select: { placeId: true } }),
    prisma.outreachContact.findMany({ select: { placeId: true } }),
    prisma.venue.findMany({ where: { googlePlaceId: { not: null } }, select: { googlePlaceId: true } }),
  ]);
  const seen = new Set<string>([...knownDiscovery.map((d) => d.placeId), ...knownContacts.map((c) => c.placeId), ...knownVenues.map((v) => v.googlePlaceId!)]);
  let cursor = cfg.cursor;
  for (let i = 0; i < cfg.queriesPerDay; i++) {
    const q = queryAt(cursor);
    if (!q) break;
    try {
      const hits = await search(q.query);
      result.queriesRun.push(q.query);
      result.placesFound += hits.length;
      for (const h of hits) {
        if (seen.has(h.placeId)) continue;
        seen.add(h.placeId);
        result.newPlaces++;
        const status = !h.open ? "closed" : !h.website ? "no-website" : "pending";
        await prisma.acquisitionDiscovery.create({
          data: { placeId: h.placeId, query: q.query, city: q.city, brandHint: q.template.brand, organizer: !!q.template.organizer, website: status === "pending" ? h.website : null, status },
        });
      }
      cursor++;
      await setSetting(CURSOR_KEY, String(cursor));
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      break; // don't advance the cursor past a failed query; retry tomorrow
    }
  }

  // 2. Check pending sites (oldest first, capped, 4 at a time, inside a time budget so the request
  //    stays well under proxy timeouts). Unchecked rows stay pending for the next run.
  const pending = await prisma.acquisitionDiscovery.findMany({ where: { status: "pending" }, orderBy: { createdAt: "asc" }, take: cfg.sitesPerDay });
  const seeds: { placeId: string; seed: ProspectSeed }[] = [];
  const deadline = Date.now() + (opts.budgetMs ?? SITE_BUDGET_MS);
  const CONCURRENCY = 4;
  for (let i = 0; i < pending.length && Date.now() < deadline; i += CONCURRENCY) {
    await Promise.all(
      pending.slice(i, i + CONCURRENCY).map(async (p) => {
        result.sitesChecked++;
        const verdict = await evaluateSite({ website: p.website!, city: p.city, brandHint: p.brandHint as AcqBrand, organizer: p.organizer, query: p.query }, day, opts.fetcher);
        result.outcomes[verdict.kind] = (result.outcomes[verdict.kind] ?? 0) + 1;
        // The Google-provided website URL is dropped once checked; only our verdict is kept.
        if (verdict.kind === "qualified") {
          seeds.push({ placeId: p.placeId, seed: verdict.seed });
          await prisma.acquisitionDiscovery.update({ where: { placeId: p.placeId }, data: { status: "qualified", checkedAt: now, detail: verdict.seed.sourceNote.slice(0, 300), website: null } });
        } else {
          await prisma.acquisitionDiscovery.update({ where: { placeId: p.placeId }, data: { status: verdict.kind, checkedAt: now, detail: verdict.detail.slice(0, 300), website: null } });
        }
      }),
    );
  }

  // 3. Queue qualified businesses for owner approval (import dedupes against everything known).
  if (seeds.length) {
    result.qualified = seeds.length;
    const r = await importProspects(seeds.map((s) => s.seed), now);
    result.queued = r.queued;
    result.suppressedOrDuplicate = r.suppressed + r.alreadyImported;
    for (const s of seeds) {
      const prospect = await prisma.acquisitionProspect.findFirst({ where: { name: s.seed.name, website: s.seed.website }, select: { id: true } });
      if (prospect) await prisma.acquisitionDiscovery.update({ where: { placeId: s.placeId }, data: { prospectId: prospect.id } });
    }
  }
  return result;
}

export async function setDiscoverySetting(key: typeof DISCOVERY_ENABLED_KEY | typeof DISCOVERY_QUERIES_KEY | typeof DISCOVERY_SITES_KEY, value: string) {
  await setSetting(key, value);
}
