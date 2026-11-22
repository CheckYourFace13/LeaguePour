/**
 * 30-day customer acquisition program (started 2026-11-21) for LeaguePour and VenueSprocket.
 * Pure constants and helpers only - no DB, no network - so scripts/check-acquisition.ts can test
 * them directly. Targets are goals the owner set, not forecasts.
 */

export type AcqBrand = "lp" | "vs";

export const PROGRAM_START = new Date("2026-11-21T00:00:00-06:00");
export const PROGRAM_DAYS = 30;
export const PROGRAM_END = new Date(PROGRAM_START.getTime() + PROGRAM_DAYS * 24 * 60 * 60 * 1000);

/** Owner-set 30-day goals (combined across both brands). */
export const PROGRAM_TARGETS = {
  prospects: 300,
  registrations: 25,
  paidConversionsLow: 3,
  paidConversionsHigh: 5,
} as const;

/** Most approved sends per brand per Chicago calendar day (sender-reputation warm-up). */
export const DAILY_SEND_CAP = 20;

export const PROSPECT_STATUSES = [
  "QUEUED",
  "APPROVED",
  "SENT",
  "REPLIED",
  "POSITIVE",
  "NOT_INTERESTED",
  "UNSUBSCRIBED",
  "BOUNCED",
  "COMPLAINED",
  "SKIPPED",
  "SUPPRESSED",
] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

/** Statuses that mean "an email went out" (for contact-attempt counts). */
export const CONTACTED_STATUSES: ProspectStatus[] = [
  "SENT",
  "REPLIED",
  "POSITIVE",
  "NOT_INTERESTED",
  "UNSUBSCRIBED",
  "BOUNCED",
  "COMPLAINED",
];

/** Owner can move a prospect to these by hand (reply tracking happens in the owner's inbox). */
export const OWNER_SETTABLE: ProspectStatus[] = ["REPLIED", "POSITIVE", "NOT_INTERESTED", "SKIPPED", "QUEUED"];

export const BRAND_INFO: Record<AcqBrand, { name: string; site: string; from: string; replyTo: string }> = {
  lp: {
    name: "LeaguePour",
    site: "https://leaguepour.com",
    from: "Chris at LeaguePour <hello@leaguepour.com>",
    replyTo: "hello@leaguepour.com",
  },
  vs: {
    name: "VenueSprocket",
    site: "https://venuesprocket.com",
    from: "Chris at VenueSprocket <hello@venuesprocket.com>",
    replyTo: "hello@venuesprocket.com",
  },
};

/**
 * Approved demo material. YouTube deep links start at the segment the email talks about
 * (cue times from src/lib/demo-videos.data.ts).
 */
export const DEMO_LINKS = {
  lp: {
    full: "https://www.youtube.com/watch?v=MgynmsguBLc",
    bracketTool: "https://www.youtube.com/watch?v=MgynmsguBLc&t=6s",
    createEvent: "https://www.youtube.com/watch?v=MgynmsguBLc&t=32s",
    runNight: "https://www.youtube.com/watch?v=MgynmsguBLc&t=59s",
  },
  vs: {
    full: "https://www.youtube.com/watch?v=Q_q8CLHZ6Lw",
    inquiryToLead: "https://www.youtube.com/watch?v=Q_q8CLHZ6Lw&t=11s",
  },
} as const;

/** Campaign value for utm_campaign; also the program id in attribution records. */
export const CAMPAIGN_ID = "acq-2026-11";

/** Tracked landing URL for an outreach email: a real page plus first-touch attribution params. */
export function trackedUrl(brand: AcqBrand, path: string, token: string, content: string): string {
  const u = new URL(path, BRAND_INFO[brand].site);
  u.searchParams.set("utm_source", "outreach");
  u.searchParams.set("utm_medium", "email");
  u.searchParams.set("utm_campaign", CAMPAIGN_ID);
  u.searchParams.set("utm_content", content);
  u.searchParams.set("ref", token);
  return u.toString();
}

/** Website host without www, lower-case; null when not a usable http(s) URL. */
export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    const h = u.hostname.toLowerCase().replace(/^www\./, "");
    return h.includes(".") ? h : null;
  } catch {
    return null;
  }
}

/** Platform hosts where the domain says nothing about which business it is. */
const SHARED_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linktr.ee",
  "toasttab.com",
  "square.site",
  "wixsite.com",
  "godaddysites.com",
  "squarespace.com",
  "yelp.com",
  "google.com",
  "sites.google.com",
  "eventbrite.com",
];

export function isSharedHost(domain: string): boolean {
  return SHARED_HOSTS.some((h) => domain === h || domain.endsWith(`.${h}`));
}

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/\b(the|bar|pub|tavern|inc|llc|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * One prospect per brand per business: keyed by website domain when it identifies the business,
 * else by normalized name + city.
 */
export function dedupeKey(brand: AcqBrand, p: { name: string; city: string; website?: string | null }): string {
  const d = domainOf(p.website);
  if (d && !isSharedHost(d)) return `${brand}:d:${d}`;
  return `${brand}:n:${normalizeName(p.name)}|${normalizeName(p.city)}`;
}

/** Brand-agnostic business identity, for cross-brand and existing-venue checks. */
export function businessKeys(p: { name: string; city: string | null; website?: string | null }): string[] {
  const keys: string[] = [];
  const d = domainOf(p.website);
  if (d && !isSharedHost(d)) keys.push(`d:${d}`);
  if (p.city) keys.push(`n:${normalizeName(p.name)}|${normalizeName(p.city)}`);
  return keys;
}

/** Day key in America/Chicago (YYYY-MM-DD) for the daily send cap. */
export function chicagoDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Only public web hosts: http(s), a dotted name, no IP literals, no localhost/internal suffixes. */
export function isPublicWebUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost") || h === "localhost") return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.startsWith("[") || h.includes(":")) return false;
    return true;
  } catch {
    return false;
  }
}
