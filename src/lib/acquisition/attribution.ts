/**
 * First-touch signup attribution. Before this, a venue signup recorded no source at all, so a
 * registration from outreach, search or a referral looked identical.
 *
 * The client (src/components/analytics/acquisition-capture.tsx) stores the first landing's UTM
 * params + outreach ref in a first-party cookie; /api/register reads it and saves one AppSetting
 * row per venue (`acq:venue:<venueId>`), so no schema change is needed. No PII is stored: only
 * campaign labels, the landing path and an opaque prospect token.
 */

export const ACQ_COOKIE = "lp_acq";
export const ACQ_COOKIE_MAX_AGE = 60 * 24 * 60 * 60; // 60 days

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  ref?: string;
  landing?: string;
  referrerHost?: string;
  at?: string;
};

const FIELD_RE = /^[A-Za-z0-9._~\-+/ ]{1,100}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{8,64}$/;

function safe(v: unknown, re = FIELD_RE): string | undefined {
  return typeof v === "string" && re.test(v) ? v : undefined;
}

/** Validates and trims an untrusted attribution object; returns null when nothing usable is left. */
export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const a: Attribution = {
    source: safe(r.source),
    medium: safe(r.medium),
    campaign: safe(r.campaign),
    content: safe(r.content),
    ref: safe(r.ref, TOKEN_RE),
    landing: safe(r.landing, /^\/[A-Za-z0-9._~\-/]{0,150}$/),
    referrerHost: safe(r.referrerHost, /^[a-z0-9.-]{1,100}$/),
    at: safe(r.at, /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/),
  };
  for (const k of Object.keys(a) as (keyof Attribution)[]) if (a[k] === undefined) delete a[k];
  if (!a.source && !a.ref && !a.referrerHost) return null;
  return a;
}

export function parseAttributionCookie(value: string | undefined | null): Attribution | null {
  if (!value) return null;
  try {
    return sanitizeAttribution(JSON.parse(decodeURIComponent(value)));
  } catch {
    return null;
  }
}

export function serializeAttribution(a: Attribution): string {
  return encodeURIComponent(JSON.stringify(a));
}

/** Reads a named cookie from a raw Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/**
 * Builds the first-touch record from a landing URL (client side). Internal navigation and our own
 * hosts don't count as a source; a landing with neither UTM/ref nor an external referrer is ignored.
 */
export function attributionFromLanding(url: URL, referrer: string, ownHosts: string[], now = new Date()): Attribution | null {
  const q = url.searchParams;
  let referrerHost: string | undefined;
  try {
    const h = referrer ? new URL(referrer).hostname.toLowerCase().replace(/^www\./, "") : "";
    if (h && !ownHosts.some((o) => h === o || h.endsWith(`.${o}`))) referrerHost = h;
  } catch {
    /* ignore bad referrer */
  }
  return sanitizeAttribution({
    source: q.get("utm_source") ?? undefined,
    medium: q.get("utm_medium") ?? undefined,
    campaign: q.get("utm_campaign") ?? undefined,
    content: q.get("utm_content") ?? undefined,
    ref: q.get("ref") ?? undefined,
    landing: url.pathname,
    referrerHost,
    at: now.toISOString(),
  });
}

export function attributionSettingKey(venueId: string): string {
  return `acq:venue:${venueId}`;
}
