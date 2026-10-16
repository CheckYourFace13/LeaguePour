/**
 * Outreach email support: harvest addresses from venue websites, build the
 * cold-outreach email, and run harvest/send batches. Google Places provides no
 * email addresses, so we scan each venue's own site (homepage + common contact
 * pages) for one. The batch cores here are shared by the owner-only server
 * actions and the daily cron route.
 */

import { prisma } from "@/lib/db";
import { createHash } from "node:crypto";
import { sendEmailBatch } from "@/lib/email";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getBoolSetting } from "@/lib/app-settings";

// Cross-brand suppression checks (LP/VS status != SIGNED_UP) are done in JS on fetched rows
// throughout this file, not as a Prisma WHERE filter - observed live in production that every
// enum-negation/inclusion form Prisma emits for the OutreachStatus column (`not`, `notIn`, `in`)
// fails against Postgres with "operator does not exist", while plain equality and fetching the
// column via `select` both work fine. Batch sizes here are small enough that filtering in JS
// after the fetch is cheap and sidesteps the bug entirely.

// The production DB may not have the new columns until the migration is applied
// somewhere; this makes every outreach entry point self-healing. Idempotent.
let columnsEnsured = false;
export async function ensureOutreachEmailColumns(): Promise<void> {
  if (columnsEnsured) return;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "email" TEXT`,
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "emailCheckedAt" TIMESTAMP(3)`,
    );
    columnsEnsured = true;
  } catch (err) {
    console.error("[outreach] ensure email columns failed", err);
  }
}

// ── Email harvesting ─────────────────────────────────────────────────────────

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/**
 * Strict last-word validator: mailto: links and scraped HTML can leave stray
 * trailing characters (backslashes from escaped JSON-in-HTML, quotes,
 * trailing punctuation) on an otherwise-plausible address. Resend's batch
 * send API rejects the whole batch if even one recipient fails this shape,
 * so this check is the final gate before an email is ever stored or sent.
 */
// Conservative, send-safe shape (what an email API will accept, not everything RFC 5322 allows):
// local part of letters/digits/._+- with no leading, trailing, or doubled dot and no "%" (URL
// encoding left over from scraped mailto: links, e.g. "%20info@..."); domain labels that don't
// start or end with "-"; an alphabetic TLD.
const STRICT_EMAIL_RE =
  /^[A-Z0-9_+-]+(?:\.[A-Z0-9_+-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,24}$/i;

/** Hosts/patterns that show up in page source but are never a venue's contact address. */
const JUNK_PATTERNS = [
  /\.(png|jpe?g|gif|webp|svg|css|js|woff2?)$/i,
  /@(sentry|wixpress|wix|example|domain|yourdomain|email|squarespace|godaddy|placeholder|2x|3x)\./i,
  /^(noreply|no-reply|donotreply|mailer-daemon|postmaster)@/i,
  /@(sentry\.io|schema\.org|w3\.org|googleapis\.com|gstatic\.com)$/i,
  /^[0-9a-f]{16,}@/i,
];

export function isPlausibleEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (trimmed.split("@")[0].length > 64) return false;
  if (!STRICT_EMAIL_RE.test(trimmed)) return false;
  return !JUNK_PATTERNS.some((re) => re.test(trimmed));
}

/** Prefer generic venue inboxes, then same-domain addresses, then anything plausible. */
function pickBestEmail(emails: string[], siteHost: string | null): string | null {
  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()))].filter(isPlausibleEmail);
  if (unique.length === 0) return null;
  const generic = unique.find((e) =>
    /^(info|contact|hello|events|booking|bookings|inquiries|manager|office|bar)@/.test(e),
  );
  if (generic) return generic;
  if (siteHost) {
    const bare = siteHost.replace(/^www\./, "");
    const sameDomain = unique.find((e) => e.endsWith(`@${bare}`) || e.endsWith(`.${bare}`));
    if (sameDomain) return sameDomain;
  }
  return unique[0];
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeaguePourBot/1.0)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("text/plain")) return null;
    const text = await res.text();
    return text.slice(0, 500_000);
  } catch {
    return null;
  }
}

/**
 * Signals that a business's own website shows evidence of private-event business - the
 * VenueSprocket eligibility bar. Deliberately conservative (checks for actual event-booking
 * language, not just "party" appearing anywhere) so VS outreach targets businesses that plausibly
 * sell private events, not every restaurant with a website.
 */
const VS_EVENT_SIGNAL_RE =
  /private\s+(dining|event|party|parties)|book\s+(your|a)\s+(event|party)|event\s+space|banquet|corporate\s+event|host\s+your\s+(event|party)|rehearsal\s+dinner|buyout|catering\s*(&|and)?\s*events?|weddings?|holiday\s+part(y|ies)/i;

function classifyVsEligibility(pagesText: string[]): { eligible: boolean; note: string } {
  const hit = pagesText.find((t) => VS_EVENT_SIGNAL_RE.test(t));
  if (!hit) return { eligible: false, note: "No private-event language found on site" };
  const match = hit.match(VS_EVENT_SIGNAL_RE);
  return { eligible: true, note: `Site mentions "${match?.[0] ?? "private events"}"` };
}

/**
 * Scan a venue website (homepage + common contact paths) for a contact email, and separately
 * for VenueSprocket eligibility signals - one fetch pass serves both, since eligibility scanning
 * needs the same pages email harvesting already downloads.
 */
export async function probeWebsite(
  website: string,
): Promise<{ email: string | null; vsEligible: boolean; vsEligibilityNote: string }> {
  let base: URL;
  try {
    base = new URL(website.startsWith("http") ? website : `https://${website}`);
  } catch {
    return { email: null, vsEligible: false, vsEligibilityNote: "Invalid website URL" };
  }
  // Social/profile links never expose a venue inbox worth scraping.
  if (/(facebook|instagram|twitter|x|linktr|tiktok|untappd|yelp)\.(com|ee)$/i.test(base.hostname.replace(/^www\./, ""))) {
    return { email: null, vsEligible: false, vsEligibilityNote: "Website is a social profile, not scanned" };
  }

  // Same 3 pages email harvesting already fetches - a business that books private events
  // almost always mentions it on the homepage or contact page, so this needs no extra fetches.
  const candidates = [
    base.href,
    new URL("/contact", base).href,
    new URL("/contact-us", base).href,
  ];

  const found: string[] = [];
  const pagesText: string[] = [];
  for (const [i, url] of candidates.entries()) {
    const html = await fetchPageText(url);
    // Homepage totally unreachable (timeout/DNS/refused) - the domain is dead,
    // don't burn the time budget probing the rest.
    if (!html) {
      if (i === 0) break;
      continue;
    }
    pagesText.push(html);
    // mailto: links first — they're deliberate contact addresses
    const mailtos = [...html.matchAll(/mailto:([^"'?\s\\<>]+)/gi)].map((m) => decodeURIComponent(m[1]));
    found.push(...mailtos);
    found.push(...(html.match(EMAIL_RE) ?? []));
    if (mailtos.length > 0 && found.some(isPlausibleEmail)) break;
  }

  const { eligible, note } = classifyVsEligibility(pagesText);
  return { email: pickBestEmail(found, base.hostname), vsEligible: eligible, vsEligibilityNote: note };
}

/** @deprecated use probeWebsite - kept for any external callers expecting the old shape. */
export async function findEmailOnWebsite(website: string): Promise<string | null> {
  return (await probeWebsite(website)).email;
}

/**
 * Backfills vsEligible/vsEligibilityNote for contacts that were harvested before VS eligibility
 * detection existed - harvestEmailsCore() only ever re-probes email: null AND emailCheckedAt: null
 * rows, so anything checked before that logic was added is permanently skipped by the normal
 * harvest path and needs this separate pass. Deliberately does NOT touch the email field at all
 * (not even to overwrite with a fresh probe result) - a contact's already-harvested email is left
 * exactly as-is regardless of what this re-probe of the same site finds, per instruction not to
 * erase or redo good existing email data. Batched/resumable/per-contact-isolated the same way
 * harvestEmailsCore is: a fetch timeout or parse failure on one site never blocks the rest of the
 * batch, and running this again later picks up wherever the backlog (vsEligibilityNote: null)
 * left off - safe to call repeatedly until remaining hits 0.
 */
export async function backfillVsEligibilityCore(limit: number): Promise<{
  checked: number;
  eligible: number;
  remaining: number;
}> {
  const batch = await prisma.outreachContact.findMany({
    where: { website: { not: null }, emailCheckedAt: { not: null }, vsEligibilityNote: null },
    orderBy: { rating: "desc" },
    take: Math.min(Math.max(limit, 1), 60),
    select: { id: true, website: true },
  });

  let eligible = 0;
  const CONCURRENCY = 6;
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (c) => {
        try {
          const probe = c.website
            ? await probeWebsite(c.website)
            : { vsEligible: false, vsEligibilityNote: "No website on file" };
          if (probe.vsEligible) eligible++;
          await prisma.outreachContact.update({
            where: { id: c.id },
            data: { vsEligible: probe.vsEligible, vsEligibilityNote: probe.vsEligibilityNote },
          });
        } catch (err) {
          // Isolated per-contact: mark it checked with a note explaining the failure rather than
          // leaving vsEligibilityNote null forever (which would make this same row retry - and
          // potentially fail the same way - on every future backfill run).
          console.warn("[vs-eligibility-backfill] failed for contact", c.id, err);
          await prisma.outreachContact.update({
            where: { id: c.id },
            data: { vsEligible: false, vsEligibilityNote: "Probe failed - see server logs" },
          }).catch(() => {});
        }
      }),
    );
  }

  const remaining = await prisma.outreachContact.count({
    where: { website: { not: null }, emailCheckedAt: { not: null }, vsEligibilityNote: null },
  });
  return { checked: batch.length, eligible, remaining };
}

// ── Outreach email content ───────────────────────────────────────────────────

/** CAN-SPAM requires a real postal address in commercial email. */
function getPostalAddress(): string {
  return (
    process.env.OUTREACH_POSTAL_ADDRESS?.trim() ||
    "LeaguePour, Chicago, IL, USA"
  );
}

// ── Batch cores (shared by owner actions and the daily cron) ────────────────

export async function harvestEmailsCore(limit: number): Promise<{
  checked: number;
  found: number;
  remaining: number;
}> {
  await ensureOutreachEmailColumns();

  const batch = await prisma.outreachContact
    .findMany({
      where: { email: null, emailCheckedAt: null, website: { not: null }, status: "NOT_CONTACTED" },
      orderBy: { rating: "desc" },
      take: Math.min(Math.max(limit, 1), 60),
      select: { id: true, website: true },
    })
    .catch((err) => {
      throw new Error(`[stage:harvest-batch-query] ${err instanceof Error ? err.message : String(err)}`);
    });

  let found = 0;
  const CONCURRENCY = 6;
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (c) => {
        try {
          const probe = c.website
            ? await probeWebsite(c.website)
            : { email: null, vsEligible: false, vsEligibilityNote: "No website on file" };
          if (probe.email) found++;
          await prisma.outreachContact.update({
            where: { id: c.id },
            data: {
              email: probe.email,
              emailCheckedAt: new Date(),
              vsEligible: probe.vsEligible,
              vsEligibilityNote: probe.vsEligibilityNote,
            },
          });
        } catch (err) {
          // One bad site/write must never crash the whole batch and kill the LP send phase
          // that runs right after this in the same cron invocation - see the identical pattern
          // in backfillVsEligibilityCore below.
          console.warn("[harvest] failed for contact", c.id, err);
          await prisma.outreachContact
            .update({ where: { id: c.id }, data: { emailCheckedAt: new Date() } })
            .catch(() => {});
        }
      }),
    );
  }

  const remaining = await prisma.outreachContact
    .count({
      where: { email: null, emailCheckedAt: null, website: { not: null }, status: "NOT_CONTACTED" },
    })
    .catch((err) => {
      throw new Error(`[stage:harvest-remaining-count] ${err instanceof Error ? err.message : String(err)}`);
    });
  return { checked: batch.length, found, remaining };
}

// Fixed key for a Postgres advisory lock around the send-and-mark critical section below.
// Session-level advisory locks don't play safely with a pooled connection (the release could
// land on a different connection than the acquire and never take effect), so this uses the
// transaction-scoped variant (`pg_try_advisory_xact_lock`), which always releases automatically
// when the transaction ends - no way to leak a stuck lock. Without this, two near-simultaneous
// invocations (the daily cron plus a manual "Send batch" click, or a duplicate cron trigger)
// could both pass the outreachSentWithinHours() throttle check before either had written
// emailSentAt, sending the same batch of contacts a cold email twice.
const OUTREACH_SEND_LOCK_KEY = BigInt(729_312_400_123);
const VS_OUTREACH_SEND_LOCK_KEY = BigInt(729_312_400_124);

// Neither brand cold-emails a business the other brand has contacted within this window, and
// neither cold-emails a business that has already signed up for either product - see the
// cross-brand suppression rules in sendOutreachLocked / sendVsOutreachLocked below.
const CROSS_BRAND_COOLING_OFF_HOURS = 14 * 24;

type BatchSender = typeof sendEmailBatch;
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
type Candidate = { id: string; name: string; email: string };
type SendOutcome = { sent: number; failed: number; remaining: number; error?: string; skipped?: string };

/** A batch is "in flight" for this long after it's claimed; after that an unsettled batch is retried. */
const IN_FLIGHT_MS = 10 * 60 * 1000;
/** Resend keeps idempotency keys for 24h, so a retry with the same key is only safe inside this. */
const RETRY_WITH_SAME_KEY_MS = 23 * 60 * 60 * 1000;

type Lane = {
  name: "lp" | "vs";
  lockKey: bigint;
  /** AppSetting key holding the claimed-but-unsettled batch (contact ids only, no addresses). */
  pendingKey: string;
  select: (tx: Tx, take: number) => Promise<{ batch: Candidate[]; invalidIds: string[] }>;
  sentWithin: (tx: Tx, since: Date) => Promise<boolean>;
  /** Mark the batch sent (the claim). Only rows still unsent are marked. */
  markSent: (tx: Tx, ids: string[], at: Date) => Promise<void>;
  /** Ids among `ids` whose sent timestamp is exactly `at` - i.e. rows this caller actually claimed. */
  claimed: (tx: Tx, ids: string[], at: Date) => Promise<string[]>;
  /** Undo this claim's marks - rows whose sent timestamp is exactly `at`, nothing else. */
  revert: (ids: string[], at: Date) => Promise<void>;
  remaining: () => Promise<number>;
  build: (c: Candidate) => Parameters<BatchSender>[0][number];
  brand: "lp" | "vs";
};

/** `payloadHash` pins the exact request body sent under `key`; a retry must reproduce it byte for byte. */
type Pending = { ids: string[]; key: string; at: string; payloadHash?: string };

type Payload = Parameters<BatchSender>[0];

/** Deterministic payload: recipients ordered by contact id, built only from stored contact fields. */
function buildPayload(lane: Lane, rows: Candidate[]): Payload {
  return [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(lane.build);
}

function hashPayload(payload: Payload): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

type LaneOpts = {
  send?: BatchSender;
  throttleHours?: number;
  now?: () => Date;
  /** Test hook: awaited inside the claim transaction after selection (lets tests force overlap). */
  afterSelect?: () => Promise<void>;
};

function readPending(raw: string | null | undefined): Pending | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Pending;
    return Array.isArray(p.ids) && typeof p.key === "string" && typeof p.at === "string" ? p : null;
  } catch {
    return null;
  }
}

async function clearPending(lane: Lane, key: string): Promise<void> {
  await prisma.appSetting.deleteMany({ where: { key: lane.pendingKey, value: { contains: JSON.stringify(key) } } });
}

/**
 * Exactly-once-per-recipient outreach send, safe across concurrent instances and crashes.
 *
 * 1. Claim (one transaction, under a transaction-scoped advisory lock): re-check the throttle,
 *    pick the batch, mark those contacts sent, and record the batch as pending with a stable
 *    idempotency key. Committing the marks BEFORE the send means no other caller can pick the
 *    same contacts, and the throttle now sees the batch.
 * 2. Send with that idempotency key (Resend dedupes a repeated key for 24h).
 * 3. Settle: accepted -> clear pending. Definitely rejected (4xx) -> revert this claim's marks so
 *    the contacts stay eligible. Unknown (timeout/5xx/crash) -> keep the marks and the pending
 *    record; a later run retries the SAME contacts with the SAME key, so it can't double-deliver.
 *    A pending batch younger than IN_FLIGHT_MS is treated as another sender still in flight.
 */
async function sendLane(
  lane: Lane,
  limit: number,
  opts: LaneOpts = {},
): Promise<SendOutcome> {
  const send = opts.send ?? sendEmailBatch;
  const now = opts.now ?? (() => new Date());
  const take = Math.min(Math.max(limit, 1), 50);

  type Plan =
    | { kind: "busy" }
    | { kind: "throttled" }
    | { kind: "empty" }
    | { kind: "inflight" }
    | { kind: "send"; ids: string[]; key: string; at: Date; retry: false; payload: Payload }
    | { kind: "retry"; ids: string[]; key: string; at: Date; payloadHash?: string };

  const plan = await prisma.$transaction(
    async (tx): Promise<Plan> => {
      const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${lane.lockKey}) AS locked
      `;
      if (!locked) return { kind: "busy" };

      const t = now();
      const pendingRow = await tx.appSetting.findUnique({ where: { key: lane.pendingKey } });
      const pending = readPending(pendingRow?.value);
      if (pending) {
        const age = t.getTime() - new Date(pending.at).getTime();
        if (age < IN_FLIGHT_MS) return { kind: "inflight" };
        if (age < RETRY_WITH_SAME_KEY_MS) {
          return { kind: "retry", ids: pending.ids, key: pending.key, at: new Date(pending.at), payloadHash: pending.payloadHash };
        }
        // Too old to retry safely with the same key: assume it may have been delivered, keep the
        // marks (no duplicate), and drop the record.
        console.warn(`[outreach:${lane.name}] dropping stale unsettled batch ${pending.key} (${pending.ids.length} contacts kept marked)`);
        await tx.appSetting.delete({ where: { key: lane.pendingKey } });
      }

      if (opts.throttleHours && (await lane.sentWithin(tx, new Date(t.getTime() - opts.throttleHours * 3600_000)))) {
        return { kind: "throttled" };
      }

      const { batch, invalidIds } = await lane.select(tx, take);
      if (opts.afterSelect) await opts.afterSelect();
      if (invalidIds.length > 0) {
        console.warn(`[outreach:${lane.name}] clearing malformed emails`, invalidIds);
        await tx.outreachContact.updateMany({
          where: { id: { in: invalidIds } },
          data: { email: null, emailCheckedAt: null },
        });
      }
      if (batch.length === 0) return { kind: "empty" };

      await lane.markSent(tx, batch.map((c) => c.id), t);
      // Send only to rows this transaction actually marked (by its own timestamp). With the
      // advisory lock this is every selected row; it also holds if two claimers ever overlapped.
      const ids = (await lane.claimed(tx, batch.map((c) => c.id), t)).sort();
      if (ids.length === 0) return { kind: "empty" };
      const key = `${lane.name}-outreach-${t.toISOString()}-${createHash("sha256").update(ids.join(",")).digest("hex").slice(0, 32)}`;
      const idSet = new Set(ids);
      const payload = buildPayload(lane, batch.filter((c) => idSet.has(c.id)));
      const record: Pending = { ids, key, at: t.toISOString(), payloadHash: hashPayload(payload) };
      await tx.appSetting.upsert({
        where: { key: lane.pendingKey },
        create: { key: lane.pendingKey, value: JSON.stringify(record) },
        update: { value: JSON.stringify(record) },
      });
      return { kind: "send", ids, key, at: t, retry: false, payload };
    },
    { timeout: 30_000 },
  );

  if (plan.kind === "busy" || plan.kind === "inflight") {
    return { sent: 0, failed: 0, remaining: 0, error: "Another outreach send is already in progress" };
  }
  if (plan.kind === "throttled") {
    return { sent: 0, failed: 0, remaining: 0, skipped: "Batch already sent within the throttle window." };
  }
  if (plan.kind === "empty") return { sent: 0, failed: 0, remaining: await lane.remaining() };

  let payload: Payload;
  if (plan.kind === "send") {
    payload = plan.payload; // exactly what was hashed into the pending record
  } else {
    // Retry of an unsettled batch: rebuild from the same contacts in the same order and send only
    // if it reproduces the original request exactly - Resend's idempotency key covers an identical
    // request, and a changed body (edited name/email, a contact cleared since) could deliver a
    // different message. On any mismatch, hold: keep the contacts marked and send nothing.
    const rows = await prisma.outreachContact.findMany({
      where: { id: { in: plan.ids } },
      select: { id: true, name: true, email: true },
    });
    const usable = rows.filter((r): r is Candidate => !!r.email && isPlausibleEmail(r.email));
    payload = buildPayload(lane, usable);
    if (usable.length !== plan.ids.length || !plan.payloadHash || hashPayload(payload) !== plan.payloadHash) {
      console.warn(`[outreach:${lane.name}] retry of ${plan.key} would not reproduce the original request - held, not sent`);
      await clearPending(lane, plan.key);
      return {
        sent: 0,
        failed: 0,
        remaining: await lane.remaining(),
        error: "Unsettled batch could not be reproduced exactly - contacts held, nothing sent",
      };
    }
  }

  const result = await send(payload, lane.brand, { idempotencyKey: plan.key });

  if (result.ok) {
    await clearPending(lane, plan.key);
    if (result.sent < payload.length) {
      console.warn(`[outreach:${lane.name}] Resend accepted ${result.sent}/${payload.length}; contacts stay marked (no resend)`);
    }
    return { sent: payload.length, failed: 0, remaining: await lane.remaining() };
  }
  if (result.rejected && plan.kind === "send") {
    // First attempt, definitely refused: nothing went out, so the contacts stay eligible.
    await lane.revert(plan.ids, plan.at);
    await clearPending(lane, plan.key);
    return {
      sent: 0,
      failed: payload.length,
      remaining: await lane.remaining(),
      error: `Resend rejected the batch${result.status ? ` (HTTP ${result.status})` : ""} - nothing sent, contacts left eligible`,
    };
  }
  if (result.rejected) {
    // A retry refused: the ORIGINAL attempt's outcome is still unknown (it may have been delivered,
    // and an idempotency conflict is itself a 4xx), so never revert here. Hold and stop retrying.
    await clearPending(lane, plan.key);
    return {
      sent: 0,
      failed: payload.length,
      remaining: await lane.remaining(),
      error: `Retry refused${result.status ? ` (HTTP ${result.status})` : ""} - original outcome unknown, contacts held`,
    };
  }
  return {
    sent: 0,
    failed: payload.length,
    remaining: await lane.remaining(),
    error: `Send outcome unknown${result.status ? ` (HTTP ${result.status})` : ""} - contacts held; a later run retries with the same idempotency key`,
  };
}

const LP_LANE: Lane = {
  name: "lp",
  lockKey: OUTREACH_SEND_LOCK_KEY,
  pendingKey: "outreach_pending_batch:lp",
  brand: "lp",
  async select(tx, take) {
    // Cross-brand suppression is filtered in JS - see the note at the top of this file.
    const vsCoolingOffSince = new Date(Date.now() - CROSS_BRAND_COOLING_OFF_HOURS * 60 * 60 * 1000);
    const batch: Candidate[] = [];
    const invalidIds: string[] = [];
    for (let page = 0; batch.length < take && page < 5; page++) {
      const candidates = await tx.outreachContact
        .findMany({
          where: { email: { not: null }, status: "NOT_CONTACTED" },
          orderBy: { rating: "desc" },
          skip: page * take,
          take,
          select: { id: true, name: true, email: true, vsStatus: true, vsEmailSentAt: true },
        })
        .catch((err) => {
          throw new Error(`[stage:lp-send-candidates-query] ${err instanceof Error ? err.message : String(err)}`);
        });
      if (candidates.length === 0) break;
      for (const c of candidates) {
        if (batch.length >= take) break;
        const vsCrossBrandOk =
          c.vsStatus !== "SIGNED_UP" && (c.vsEmailSentAt === null || c.vsEmailSentAt < vsCoolingOffSince);
        if (!vsCrossBrandOk) continue;
        if (c.email && isPlausibleEmail(c.email)) batch.push({ id: c.id, name: c.name, email: c.email });
        else invalidIds.push(c.id);
      }
      if (candidates.length < take) break;
    }
    return { batch, invalidIds };
  },
  async sentWithin(tx, since) {
    return (await tx.outreachContact.count({ where: { emailSentAt: { gte: since } } })) > 0;
  },
  async markSent(tx, ids, at) {
    await tx.outreachContact.updateMany({
      where: { id: { in: ids }, status: "NOT_CONTACTED" },
      data: { status: "EMAIL_SENT", emailSentAt: at },
    });
  },
  async claimed(tx, ids, at) {
    const rows = await tx.outreachContact.findMany({
      where: { id: { in: ids }, status: "EMAIL_SENT", emailSentAt: at },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },
  async revert(ids, at) {
    await prisma.outreachContact.updateMany({
      where: { id: { in: ids }, status: "EMAIL_SENT", emailSentAt: at },
      data: { status: "NOT_CONTACTED", emailSentAt: null },
    });
  },
  async remaining() {
    return prisma.outreachContact.count({ where: { email: { not: null }, status: "NOT_CONTACTED" } }).catch((err) => {
      throw new Error(`[stage:lp-send-remaining-count] ${err instanceof Error ? err.message : String(err)}`);
    });
  },
  build: (c) => ({
    to: c.email,
    subject: outreachEmailSubject(c.name),
    html: outreachEmailHtml(c.name, c.id),
    replyTo: "hello@leaguepour.com",
  }),
};

/**
 * LeaguePour outreach on/off switch (AppSetting). Defaults to OFF: the LP lane had been failing
 * every batch (Resend 422) with a backlog of hundreds of contacts, so it stays paused until the
 * owner turns it on from /internal/outreach. Checked here so the daily cron and the manual
 * "Send batch" button are both covered.
 */
export const LP_OUTREACH_ENABLED_KEY = "lp_outreach_enabled";

export async function sendOutreachCore(
  limit: number,
  opts: LaneOpts = {},
): Promise<SendOutcome> {
  if (!(await getBoolSetting(LP_OUTREACH_ENABLED_KEY, false))) {
    return { sent: 0, failed: 0, remaining: 0, skipped: "LeaguePour outreach is paused (turn it on in /internal/outreach)." };
  }
  await ensureOutreachEmailColumns();
  if (!opts.send && !process.env.RESEND_API_KEY?.trim()) {
    return { sent: 0, failed: 0, remaining: 0, error: "RESEND_API_KEY not configured" };
  }
  return sendLane(LP_LANE, limit, opts);
}

/** True if an outreach batch already went out within the past `hours`. */
export async function outreachSentWithinHours(hours: number): Promise<boolean> {
  await ensureOutreachEmailColumns();
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recent = await prisma.outreachContact.count({
    where: { emailSentAt: { gte: since } },
  });
  return recent > 0;
}

// ── VenueSprocket outreach (separate lane, same infrastructure) ─────────────
//
// Reuses the harvested contact/email/eligibility data above, but is its own campaign end to
// end: its own eligibility gate (vsEligible, set from real website content - see
// classifyVsEligibility), its own throttle/lock/send cap, its own copy and sender, and its own
// status field (vsStatus) so an LP-contacted business and a VS-contacted business are tracked
// independently on the same row. Cross-brand suppression (no double cold-emailing the same
// business, no cold-emailing an existing customer of either product) is enforced in both
// directions - see the vsStatus/vsEmailSentAt filter in sendOutreachLocked above and the
// status/emailSentAt filter in sendVsOutreachLocked below.

/** True if a VenueSprocket outreach batch already went out within the past `hours`. */
export async function vsOutreachSentWithinHours(hours: number): Promise<boolean> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recent = await prisma.outreachContact.count({
    where: { vsEmailSentAt: { gte: since } },
  });
  return recent > 0;
}

/**
 * Read-only snapshot of the VS outreach pipeline for pre-send verification - mirrors
 * sendVsOutreachLocked's exact selection criteria below but only counts (never selects email
 * addresses out of the DB, never takes the advisory lock), so it's safe to call anytime without
 * risking a send or blocking a real send from acquiring the lock.
 */
export async function getVsOutreachPreviewCore(limit = 5): Promise<{
  backfillBacklog: number;
  vsEligibleTotal: number;
  nextBatchCount: number;
  killSwitchEnabled: boolean;
}> {
  const lpCoolingOffSince = new Date(Date.now() - CROSS_BRAND_COOLING_OFF_HOURS * 60 * 60 * 1000);
  const take = Math.min(Math.max(limit, 1), 50);

  // Sequenced rather than Promise.all'd - a serverless function opening several simultaneous
  // connections against a pool that's already under pressure (e.g. from a slow concurrent
  // request elsewhere) can starve waiting for more than one free slot at once, when running
  // one at a time only ever needs one.
  const backfillBacklog = await prisma.outreachContact.count({
    where: { website: { not: null }, emailCheckedAt: { not: null }, vsEligibilityNote: null },
  });
  const vsEligibleTotal = await prisma.outreachContact.count({ where: { vsEligible: true } });
  // Cross-brand check filtered in JS below - see the comment in sendOutreachLocked for why.
  const candidates = await prisma.outreachContact.findMany({
    where: { email: { not: null }, vsEligible: true, vsStatus: null },
    orderBy: { rating: "desc" },
    take,
    select: { email: true, status: true, emailSentAt: true },
  });
  const killSwitchEnabled = await getBoolSetting("vs_outreach_enabled", true);

  const nextBatchCount = candidates.filter(
    (c) =>
      c.email &&
      isPlausibleEmail(c.email) &&
      c.status !== "SIGNED_UP" &&
      (c.emailSentAt === null || c.emailSentAt < lpCoolingOffSince),
  ).length;
  return { backfillBacklog, vsEligibleTotal, nextBatchCount, killSwitchEnabled };
}

const VS_LANE: Lane = {
  name: "vs",
  lockKey: VS_OUTREACH_SEND_LOCK_KEY,
  pendingKey: "outreach_pending_batch:vs",
  brand: "vs",
  async select(tx, take) {
    // Cross-brand suppression filtered in JS - see the note at the top of this file.
    const lpCoolingOffSince = new Date(Date.now() - CROSS_BRAND_COOLING_OFF_HOURS * 60 * 60 * 1000);
    const batch: Candidate[] = [];
    const invalidIds: string[] = [];
    for (let page = 0; batch.length < take && page < 5; page++) {
      const candidates = await tx.outreachContact.findMany({
        where: { email: { not: null }, vsEligible: true, vsStatus: null },
        orderBy: { rating: "desc" },
        skip: page * take,
        take,
        select: { id: true, name: true, email: true, status: true, emailSentAt: true },
      });
      if (candidates.length === 0) break;
      for (const c of candidates) {
        if (batch.length >= take) break;
        const lpCrossBrandOk =
          c.status !== "SIGNED_UP" && (c.emailSentAt === null || c.emailSentAt < lpCoolingOffSince);
        if (!lpCrossBrandOk) continue;
        if (c.email && isPlausibleEmail(c.email)) batch.push({ id: c.id, name: c.name, email: c.email });
        else invalidIds.push(c.id);
      }
      if (candidates.length < take) break;
    }
    return { batch, invalidIds };
  },
  async sentWithin(tx, since) {
    return (await tx.outreachContact.count({ where: { vsEmailSentAt: { gte: since } } })) > 0;
  },
  async markSent(tx, ids, at) {
    await tx.outreachContact.updateMany({
      where: { id: { in: ids }, vsStatus: null },
      data: { vsStatus: "EMAIL_SENT", vsEmailSentAt: at },
    });
  },
  async claimed(tx, ids, at) {
    const rows = await tx.outreachContact.findMany({
      where: { id: { in: ids }, vsStatus: "EMAIL_SENT", vsEmailSentAt: at },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },
  async revert(ids, at) {
    await prisma.outreachContact.updateMany({
      where: { id: { in: ids }, vsStatus: "EMAIL_SENT", vsEmailSentAt: at },
      data: { vsStatus: null, vsEmailSentAt: null },
    });
  },
  async remaining() {
    return prisma.outreachContact.count({ where: { email: { not: null }, vsEligible: true, vsStatus: null } });
  },
  build: (c) => ({
    to: c.email,
    subject: vsOutreachEmailSubject(c.name),
    html: vsOutreachEmailHtml(c.name, c.id),
    from: "VenueSprocket <hello@venuesprocket.com>",
    replyTo: "hello@venuesprocket.com",
  }),
};

export async function sendVsOutreachCore(
  limit: number,
  opts: LaneOpts = {},
): Promise<SendOutcome> {
  if (!opts.send && !process.env.RESEND_VS_API_KEY?.trim()) {
    return { sent: 0, failed: 0, remaining: 0, error: "RESEND_VS_API_KEY not configured" };
  }
  return sendLane(VS_LANE, limit, opts);
}

export function outreachEmailSubject(barName: string): string {
  return `Run dart leagues & trivia nights at ${barName} — free to try`;
}

export function outreachEmailHtml(barName: string, contactId: string): string {
  const site = getPublicSiteUrl();
  const unsubscribeUrl = `${site}/api/outreach/unsubscribe?c=${contactId}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1f36;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:#0d1b40;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">League<span style="color:#1a73ff;">Pour</span></h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">Hi ${barName} team,</p>
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">
      I wanted to reach out about <strong>LeaguePour</strong>, a platform built specifically for bars like yours
      to run dart leagues, cornhole tournaments, trivia nights, pool leagues, and more.
    </p>
    <ul style="margin:0 0 14px;padding-left:20px;line-height:1.7;font-size:15px;color:#4a5568;">
      <li>Online player signup — no more paper sheets or phone calls</li>
      <li>Entry fee collection via Stripe — funds go directly to your account</li>
      <li>Standings, brackets, and player messaging built in</li>
      <li>Players get confirmation emails automatically</li>
    </ul>
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">
      Setup takes about 10 minutes and the first competition is free. If you already run any kind of weekly
      event or league night, LeaguePour will save you hours and help fill seats through repeat-player marketing.
    </p>
    <a href="${site}/signup/venue" style="display:inline-block;background:#1a73ff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;margin:6px 0 18px;">Try it free</a>
    <p style="margin:0;line-height:1.6;font-size:15px;color:#4a5568;">
      Happy to answer any questions — just reply to this email.<br><br>
      Best,<br>Chris<br>LeaguePour · <a href="${site}" style="color:#1a73ff;">leaguepour.com</a>
    </p>
  </div>
  <div style="padding:18px 32px;border-top:1px solid #e8edf5;">
    <p style="margin:0;font-size:12px;color:#9aa5b4;line-height:1.6;">
      You're receiving this one-time note because ${barName} is publicly listed as a bar/venue.
      ${getPostalAddress()}<br>
      <a href="${unsubscribeUrl}" style="color:#9aa5b4;">Unsubscribe — never hear from us again</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

// VenueSprocket's own copy/positioning - private-event booking and operations, not league
// software. Deliberately does not mention LeaguePour; that cross-sell happens in-app after
// signup, not in a cold email to a business that's never heard of either product.
export function vsOutreachEmailSubject(venueName: string): string {
  return `Turning private event inquiries into bookings at ${venueName}`;
}

export function vsOutreachEmailHtml(venueName: string, contactId: string): string {
  const site = "https://venuesprocket.com";
  const unsubscribeUrl = `${site}/api/outreach/unsubscribe?c=${contactId}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1512;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:#1a1512;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">Venue<span style="color:#b87333;">Sprocket</span></h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">Hi ${venueName} team,</p>
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">
      I wanted to reach out about <strong>VenueSprocket</strong>, built for restaurants, bars, and breweries that
      book private events - birthday parties, corporate events, rehearsal dinners, buyouts - and manage the whole
      process from first inquiry to the day of the event.
    </p>
    <ul style="margin:0 0 14px;padding-left:20px;line-height:1.7;font-size:15px;color:#4a4038;">
      <li>A public inquiry form so leads land in one place instead of scattered emails and DMs</li>
      <li>Proposals and contracts customers can review and sign from their phone</li>
      <li>Stripe deposit collection - no more chasing checks</li>
      <li>A clean BEO for your staff on the day of the event</li>
    </ul>
    <p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">
      The free plan gets your inquiry form live in about ten minutes, no card required - you can see how it works
      before paying for anything.
    </p>
    <a href="${site}/start" style="display:inline-block;background:#b87333;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;margin:6px 0 18px;">Start free</a>
    <p style="margin:0;line-height:1.6;font-size:15px;color:#4a4038;">
      Happy to answer any questions - just reply to this email.<br><br>
      Best,<br>Chris<br>VenueSprocket · <a href="${site}" style="color:#b87333;">venuesprocket.com</a>
    </p>
  </div>
  <div style="padding:18px 32px;border-top:1px solid #ece4d8;">
    <p style="margin:0;font-size:12px;color:#9a8f80;line-height:1.6;">
      You're receiving this one-time note because ${venueName} is publicly listed as a venue that hosts private
      events. ${getPostalAddress()}<br>
      <a href="${unsubscribeUrl}" style="color:#9a8f80;">Unsubscribe — never hear from us again</a>
    </p>
  </div>
</div>
</body>
</html>`;
}
