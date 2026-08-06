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

/** Scan a venue website (homepage + common contact paths) for a contact email. */
export async function findEmailOnWebsite(website: string): Promise<string | null> {
  let base: URL;
  try {
    base = new URL(website.startsWith("http") ? website : `https://${website}`);
  } catch {
    return null;
  }
  // Social/profile links never expose a venue inbox worth scraping.
  if (/(facebook|instagram|twitter|x|linktr|tiktok|untappd|yelp)\.(com|ee)$/i.test(base.hostname.replace(/^www\./, ""))) {
    return null;
  }

  const candidates = [
    base.href,
    new URL("/contact", base).href,
    new URL("/contact-us", base).href,
  ];

  const found: string[] = [];
  for (const [i, url] of candidates.entries()) {
    const html = await fetchPageText(url);
    // Homepage totally unreachable (timeout/DNS/refused) - the domain is dead,
    // don't burn the time budget probing /contact and /contact-us too.
    if (!html) {
      if (i === 0) break;
      continue;
    }
    // mailto: links first — they're deliberate contact addresses
    const mailtos = [...html.matchAll(/mailto:([^"'?\s\\<>]+)/gi)].map((m) => decodeURIComponent(m[1]));
    found.push(...mailtos);
    found.push(...(html.match(EMAIL_RE) ?? []));
    if (mailtos.length > 0) break;
    if (found.some(isPlausibleEmail)) break;
  }

  return pickBestEmail(found, base.hostname);
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

  const batch = await prisma.outreachContact.findMany({
    where: { email: null, emailCheckedAt: null, website: { not: null }, status: "NOT_CONTACTED" },
    orderBy: { rating: "desc" },
    take: Math.min(Math.max(limit, 1), 60),
    select: { id: true, website: true },
  });

  let found = 0;
  const CONCURRENCY = 6;
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (c) => {
        const email = c.website ? await findEmailOnWebsite(c.website) : null;
        if (email) found++;
        await prisma.outreachContact.update({
          where: { id: c.id },
          data: { email, emailCheckedAt: new Date() },
        });
      }),
    );
  }

  const remaining = await prisma.outreachContact.count({
    where: { email: null, emailCheckedAt: null, website: { not: null }, status: "NOT_CONTACTED" },
  });
  return { checked: batch.length, found, remaining };
}

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

  const take = Math.min(Math.max(limit, 1), 50);

  // Pull candidates in pages, screening out any with a malformed email (a
  // single bad `to` address fails Resend's whole batch call). Bad rows are
  // self-healed by clearing their email so they never recur; the remainder
  // is backfilled from the next page until the batch is full or contacts
  // run out. Capped at a few pages so a corrupted run can't loop forever.
  const batch: { id: string; name: string; email: string }[] = [];
  const invalidIds: string[] = [];
  for (let page = 0; batch.length < take && page < 5; page++) {
    const candidates = await prisma.outreachContact.findMany({
      where: { email: { not: null }, status: "NOT_CONTACTED" },
      orderBy: { rating: "desc" },
      skip: page * take,
      take,
      select: { id: true, name: true, email: true },
    });
    if (candidates.length === 0) break;
    for (const c of candidates) {
      if (batch.length >= take) break;
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
    await prisma.outreachContact.updateMany({
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

  if (result.ok && result.sent > 0) {
    await prisma.outreachContact.updateMany({
      where: { id: { in: batch.map((c) => c.id) } },
      data: { status: "EMAIL_SENT", emailSentAt: new Date() },
    });
  }

  const remaining = await prisma.outreachContact.count({
    where: { email: { not: null }, status: "NOT_CONTACTED" },
  });
  return {
    sent: result.ok ? batch.length : 0,
    failed: result.ok ? 0 : batch.length,
    remaining,
    ...(result.ok ? {} : { error: "Resend batch send failed - check server logs" }),
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
