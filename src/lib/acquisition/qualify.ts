/**
 * Continuous prospect qualification (daily, small batch). Takes businesses ALREADY in the outreach
 * list that have an email harvested from their own website, have never been contacted by either
 * brand and aren't suppressed. It reads that business's own homepage and /events page (no Google
 * API calls, no third-party scraping) and looks for public evidence of:
 *   - recurring games/leagues -> a LeaguePour prospect, or
 *   - private-event booking   -> a VenueSprocket prospect.
 * Each match becomes a QUEUED prospect in the owner approval queue with its provenance (the page
 * and the phrase found). Nothing is sent: every email still needs Approve, then Send. Each site is
 * scanned once (AcquisitionScan), BATCH sites per run, so server and site load stay small.
 */
import { prisma } from "@/lib/db";
import { isPlausibleEmail } from "@/lib/outreach-email";
import { importProspects, ensureAcquisitionTable } from "./store";
import type { ProspectSeed } from "./prospects.data";
import { isPublicWebUrl } from "./program";

export const QUALIFY_BATCH = 12;
const FETCH_TIMEOUT_MS = 4000;

const SCAN_DDL = `CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionScan" (
  "contactId" TEXT NOT NULL, "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "result" TEXT NOT NULL, CONSTRAINT "AcquisitionScan_pkey" PRIMARY KEY ("contactId"))`;

let scanEnsured = false;
async function ensureScanTable(): Promise<void> {
  if (scanEnsured) return;
  await prisma.$executeRawUnsafe(SCAN_DDL);
  scanEnsured = true;
}

/** Recurring game/league language (LeaguePour fit). Matches are quoted back as provenance. */
export const LP_SIGNAL_RE =
  /\b(?:(?:weekly|monday|tuesday|wednesday|thursday|friday|saturday|sunday|pub)\s+trivia|trivia\s+night|(?:dart|darts|cornhole|bags|pool|euchre|shuffleboard|skee-?ball|pinball)\s+(?:league|leagues|tournament|tournaments|night)|blind\s+draw|music\s+bingo|bingo\s+night)\b/i;

/** Private-event booking language (VenueSprocket fit). */
export const VS_SIGNAL_RE =
  /\b(?:private\s+(?:dining|events?|party|parties|room)|book\s+(?:your|a)\s+(?:event|party)|event\s+space|banquet\s+(?:room|hall)|host\s+your\s+(?:event|party)|rehearsal\s+dinners?|(?:full|venue)\s+buyouts?)\b/i;

function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

export function classifyPage(text: string): { brand: "lp" | "vs"; phrase: string } | null {
  const lp = text.match(LP_SIGNAL_RE);
  if (lp) return { brand: "lp", phrase: lp[0].toLowerCase() };
  const vs = text.match(VS_SIGNAL_RE);
  if (vs) return { brand: "vs", phrase: vs[0].toLowerCase() };
  return null;
}

async function fetchText(url: string): Promise<string | null> {
  if (!isPublicWebUrl(url)) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeaguePourBot/1.0; +https://leaguepour.com)" },
    });
    if (!res.ok || (res.url && !isPublicWebUrl(res.url))) return null;
    if (!(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    return textOf((await res.text()).slice(0, 400_000));
  } catch {
    return null;
  }
}

export function seedFromMatch(
  c: { name: string; city: string; state: string; website: string; email: string },
  m: { brand: "lp" | "vs"; phrase: string },
  pageUrl: string,
  day: string,
): ProspectSeed {
  return {
    brand: m.brand,
    name: c.name,
    city: c.city,
    state: c.state,
    segment: m.brand === "lp" ? "bar (auto-qualified)" : "venue (auto-qualified)",
    website: c.website,
    sourceUrl: pageUrl,
    sourceNote: `Automated check of the venue's own site found "${m.phrase}" (${day}); confirm before approving`,
    relevance: "medium",
    useCase: m.brand === "lp" ? `the ${m.phrase} listed on your website` : `that your website mentions ${m.phrase}`,
    offer: m.brand === "lp" ? "Free bracket generator; first competition free, no card" : "Free inquiry form with unlimited inquiries",
    contactRoute: "email",
    email: c.email,
    verifiedAt: day,
  };
}

export type QualifyResult = { scanned: number; lp: number; vs: number; queued: number; noSignal: number; unreachable: number };

export async function runQualificationBatch(now = new Date(), opts: { fetcher?: (url: string) => Promise<string | null> } = {}): Promise<QualifyResult> {
  await ensureAcquisitionTable();
  await ensureScanTable();
  const fetcher = opts.fetcher ?? fetchText;
  const day = now.toISOString().slice(0, 10);

  const scanned = await prisma.acquisitionScan.findMany({ select: { contactId: true } });
  const linked = await prisma.acquisitionProspect.findMany({ where: { outreachContactId: { not: null } }, select: { outreachContactId: true } });
  const skip = new Set<string>([...scanned.map((s) => s.contactId), ...linked.map((l) => l.outreachContactId!)]);

  const pool = await prisma.outreachContact.findMany({
    where: { email: { not: null }, website: { not: null }, status: "NOT_CONTACTED", vsStatus: null },
    orderBy: [{ rating: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, city: true, state: true, website: true, email: true },
    take: 400,
  });
  const batch = pool.filter((c) => !skip.has(c.id) && c.email && isPlausibleEmail(c.email)).slice(0, QUALIFY_BATCH);

  const result: QualifyResult = { scanned: 0, lp: 0, vs: 0, queued: 0, noSignal: 0, unreachable: 0 };
  const seeds: ProspectSeed[] = [];
  for (const c of batch) {
    result.scanned++;
    let base: URL;
    try {
      base = new URL(c.website!.startsWith("http") ? c.website! : `https://${c.website}`);
    } catch {
      await prisma.acquisitionScan.create({ data: { contactId: c.id, result: "invalid-url" } });
      continue;
    }
    let match: { brand: "lp" | "vs"; phrase: string } | null = null;
    let pageUrl = base.href;
    let reachable = false;
    for (const url of [base.href, new URL("/events", base).href]) {
      const text = await fetcher(url);
      if (!text) continue;
      reachable = true;
      const m = classifyPage(text);
      if (m && (!match || (match.brand === "vs" && m.brand === "lp"))) {
        match = m;
        pageUrl = url;
      }
      if (match?.brand === "lp") break;
    }
    const outcome = match ? `${match.brand}: ${match.phrase}` : reachable ? "no-signal" : "unreachable";
    await prisma.acquisitionScan.create({ data: { contactId: c.id, result: outcome.slice(0, 200) } });
    if (!match) {
      if (reachable) result.noSignal++;
      else result.unreachable++;
      continue;
    }
    result[match.brand]++;
    seeds.push(seedFromMatch({ name: c.name, city: c.city, state: c.state, website: base.href, email: c.email! }, match, pageUrl, day));
  }
  if (seeds.length) result.queued = (await importProspects(seeds, now)).queued;
  return result;
}
