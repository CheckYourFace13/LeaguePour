/**
 * Outreach email support: harvest addresses from venue websites, build the
 * cold-outreach email, and run harvest/send batches. Google Places provides no
 * email addresses, so we scan each venue's own site (homepage + common contact
 * pages) for one. The batch cores here are shared by the owner-only server
 * actions and the daily cron route.
 */

import { prisma } from "@/lib/db";
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
const STRICT_EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}$/i;

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

export async function sendOutreachCore(limit: number): Promise<{
  sent: number;
  failed: number;
  remaining: number;
  error?: string;
}> {
  await ensureOutreachEmailColumns();

  if (!process.env.RESEND_API_KEY?.trim()) {
    return { sent: 0, failed: 0, remaining: 0, error: "RESEND_API_KEY not configured" };
  }

  // Observed live in production: this transaction (which holds the advisory lock through the
  // Resend batch call, not just the DB reads/writes either side of it) timed out at the default
  // 30s with a real batch of up to SEND_PER_RUN=25 personalized emails. 90s gives the Resend
  // call real-world headroom without changing the locking/atomicity semantics at all.
  return prisma.$transaction(
    async (tx) => sendOutreachLocked(tx, limit),
    { timeout: 90_000 },
  );
}

async function sendOutreachLocked(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  limit: number,
): Promise<{ sent: number; failed: number; remaining: number; error?: string }> {
  const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
    SELECT pg_try_advisory_xact_lock(${OUTREACH_SEND_LOCK_KEY}) AS locked
  `;
  if (!locked) {
    return { sent: 0, failed: 0, remaining: 0, error: "Another outreach send is already in progress" };
  }

  const take = Math.min(Math.max(limit, 1), 50);

  // Pull candidates in pages, screening out any with a malformed email (a
  // single bad `to` address fails Resend's whole batch call). Bad rows are
  // self-healed by clearing their email so they never recur; the remainder
  // is backfilled from the next page until the batch is full or contacts
  // run out. Capped at a few pages so a corrupted run can't loop forever.
  const vsCoolingOffSince = new Date(Date.now() - CROSS_BRAND_COOLING_OFF_HOURS * 60 * 60 * 1000);
  const batch: { id: string; name: string; email: string }[] = [];
  const invalidIds: string[] = [];
  for (let page = 0; batch.length < take && page < 5; page++) {
    // Cross-brand suppression (vsStatus not SIGNED_UP, or never contacted by VS within the
    // cooling-off window) is filtered in JS below, not in this WHERE clause - Postgres rejects
    // every enum-comparison form Prisma emits for OutreachStatus here (confirmed live: plain
    // equality on `status` works fine, but `not`/`notIn`/`in` on this nullable field all throw
    // "operator does not exist"). Batch sizes are small (take <= 50, a few pages), so filtering
    // the fetched rows in JS instead of in SQL is cheap and sidesteps the bug entirely.
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
      if (c.email && isPlausibleEmail(c.email)) {
        batch.push({ id: c.id, name: c.name, email: c.email });
      } else {
        invalidIds.push(c.id);
      }
    }
    if (candidates.length < take) break;
  }

  if (invalidIds.length > 0) {
    console.warn("[outreach] clearing malformed emails", invalidIds);
    await tx.outreachContact.updateMany({
      where: { id: { in: invalidIds } },
      data: { email: null, emailCheckedAt: null },
    });
  }

  if (batch.length === 0) {
    return { sent: 0, failed: 0, remaining: 0 };
  }

  const result = await sendEmailBatch(
    batch.map((c) => ({
      to: c.email as string,
      subject: outreachEmailSubject(c.name),
      html: outreachEmailHtml(c.name, c.id),
      replyTo: "hello@leaguepour.com",
    })),
  );

  // Only mark the batch EMAIL_SENT on a full clean success. Resend's batch response doesn't
  // reliably tell us *which* recipients failed on a partial success (result.sent < batch.length),
  // so guessing would risk marking someone EMAIL_SENT who never actually received anything -
  // silently losing them from the pipeline forever, since retries only target NOT_CONTACTED
  // contacts. Leaving the whole batch untouched on partial failure risks a few duplicate sends
  // to whoever *did* succeed on the next run - a much smaller cost than losing a lead outright.
  if (result.ok && result.sent === batch.length) {
    await tx.outreachContact.updateMany({
      where: { id: { in: batch.map((c) => c.id) } },
      data: { status: "EMAIL_SENT", emailSentAt: new Date() },
    });
  } else if (result.ok && result.sent > 0) {
    console.warn(
      `[outreach] partial batch send (${result.sent}/${batch.length}) - leaving all contacts NOT_CONTACTED to avoid mismarking`,
    );
  }

  const remaining = await tx.outreachContact
    .count({
      where: { email: { not: null }, status: "NOT_CONTACTED" },
    })
    .catch((err) => {
      throw new Error(`[stage:lp-send-remaining-count] ${err instanceof Error ? err.message : String(err)}`);
    });
  const fullSuccess = result.ok && result.sent === batch.length;
  return {
    sent: fullSuccess ? batch.length : 0,
    failed: fullSuccess ? 0 : batch.length,
    remaining,
    ...(fullSuccess
      ? {}
      : {
          error: result.ok
            ? `Resend accepted only ${result.sent}/${batch.length} - batch left unmarked for retry`
            : "Resend batch send failed - check server logs",
        }),
  };
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

export async function sendVsOutreachCore(limit: number): Promise<{
  sent: number;
  failed: number;
  remaining: number;
  error?: string;
}> {
  if (!process.env.RESEND_VS_API_KEY?.trim()) {
    return { sent: 0, failed: 0, remaining: 0, error: "RESEND_VS_API_KEY not configured" };
  }
  // Same headroom as sendOutreachCore above, for the same reason (the Resend call happens
  // inside this transaction).
  return prisma.$transaction(async (tx) => sendVsOutreachLocked(tx, limit), { timeout: 90_000 });
}

async function sendVsOutreachLocked(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  limit: number,
): Promise<{ sent: number; failed: number; remaining: number; error?: string }> {
  const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
    SELECT pg_try_advisory_xact_lock(${VS_OUTREACH_SEND_LOCK_KEY}) AS locked
  `;
  if (!locked) {
    return { sent: 0, failed: 0, remaining: 0, error: "Another VenueSprocket outreach send is already in progress" };
  }

  const take = Math.min(Math.max(limit, 1), 50);
  const lpCoolingOffSince = new Date(Date.now() - CROSS_BRAND_COOLING_OFF_HOURS * 60 * 60 * 1000);

  const vsBatch: { id: string; name: string; email: string }[] = [];
  const invalidIds: string[] = [];
  for (let page = 0; vsBatch.length < take && page < 5; page++) {
    // Cross-brand suppression (LP status not SIGNED_UP, or never contacted by LP within the
    // cooling-off window) is filtered in JS below, not in this WHERE clause - see the matching
    // comment in sendOutreachLocked above for why (every enum-negation/inclusion form Prisma
    // emits for OutreachStatus fails against Postgres here, but plain equality works fine).
    const candidates = await tx.outreachContact.findMany({
      where: { email: { not: null }, vsEligible: true, vsStatus: null },
      orderBy: { rating: "desc" },
      skip: page * take,
      take,
      select: { id: true, name: true, email: true, status: true, emailSentAt: true },
    });
    if (candidates.length === 0) break;
    for (const c of candidates) {
      if (vsBatch.length >= take) break;
      const lpCrossBrandOk =
        c.status !== "SIGNED_UP" && (c.emailSentAt === null || c.emailSentAt < lpCoolingOffSince);
      if (!lpCrossBrandOk) continue;
      if (c.email && isPlausibleEmail(c.email)) {
        vsBatch.push({ id: c.id, name: c.name, email: c.email });
      } else {
        invalidIds.push(c.id);
      }
    }
    if (candidates.length < take) break;
  }

  if (invalidIds.length > 0) {
    await tx.outreachContact.updateMany({
      where: { id: { in: invalidIds } },
      data: { email: null, emailCheckedAt: null },
    });
  }

  if (vsBatch.length === 0) {
    return { sent: 0, failed: 0, remaining: 0 };
  }

  const result = await sendEmailBatch(
    vsBatch.map((c) => ({
      to: c.email as string,
      subject: vsOutreachEmailSubject(c.name),
      html: vsOutreachEmailHtml(c.name, c.id),
      from: "VenueSprocket <hello@venuesprocket.com>",
      replyTo: "hello@venuesprocket.com",
    })),
    "vs",
  );

  if (result.ok && result.sent === vsBatch.length) {
    await tx.outreachContact.updateMany({
      where: { id: { in: vsBatch.map((c) => c.id) } },
      data: { vsStatus: "EMAIL_SENT", vsEmailSentAt: new Date() },
    });
  } else if (result.ok && result.sent > 0) {
    console.warn(
      `[vs-outreach] partial batch send (${result.sent}/${vsBatch.length}) - leaving all contacts unmarked to avoid mismarking`,
    );
  }

  const remaining = await tx.outreachContact.count({
    where: { email: { not: null }, vsEligible: true, vsStatus: null },
  });
  const fullSuccess = result.ok && result.sent === vsBatch.length;
  return {
    sent: fullSuccess ? vsBatch.length : 0,
    failed: fullSuccess ? 0 : vsBatch.length,
    remaining,
    ...(fullSuccess
      ? {}
      : {
          error: result.ok
            ? `Resend accepted only ${result.sent}/${vsBatch.length} - batch left unmarked for retry`
            : "Resend batch send failed - check server logs",
        }),
  };
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
