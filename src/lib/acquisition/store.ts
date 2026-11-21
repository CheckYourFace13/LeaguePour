/**
 * Acquisition program persistence: prospect import with dedupe, owner-approved sending, opt-outs,
 * visit tracking and signup attribution. Every send path requires an APPROVED row and an explicit
 * owner action; nothing here runs on a schedule.
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { isPlausibleEmail } from "@/lib/outreach-email";
import { logOperationalFailure } from "@/lib/operational-failure";
import {
  BRAND_INFO,
  DAILY_SEND_CAP,
  businessKeys,
  chicagoDay,
  dedupeKey,
  domainOf,
  type AcqBrand,
} from "./program";
import { buildDraft, renderEmail, unsubscribeUrl } from "./drafts";
import { attributionSettingKey, type Attribution } from "./attribution";
import type { ProspectSeed } from "./prospects.data";

const DDL = [
  `CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionProspect" (
    "id" TEXT NOT NULL, "brand" TEXT NOT NULL, "dedupeKey" TEXT NOT NULL, "name" TEXT NOT NULL,
    "city" TEXT NOT NULL, "state" TEXT NOT NULL, "segment" TEXT NOT NULL, "website" TEXT,
    "sourceUrl" TEXT NOT NULL, "sourceNote" TEXT NOT NULL, "relevance" TEXT NOT NULL,
    "useCase" TEXT NOT NULL, "offer" TEXT NOT NULL, "contactRoute" TEXT NOT NULL,
    "contactValue" TEXT, "email" TEXT, "verifiedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED', "suppressReason" TEXT, "draftSubject" TEXT NOT NULL,
    "draftBody" TEXT NOT NULL, "token" TEXT NOT NULL, "outreachContactId" TEXT,
    "approvedAt" TIMESTAMP(3), "sentAt" TIMESTAMP(3), "resendId" TEXT, "sendError" TEXT,
    "repliedAt" TIMESTAMP(3), "firstVisitAt" TIMESTAMP(3), "visitCount" INTEGER NOT NULL DEFAULT 0,
    "signedUpVenueId" TEXT, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcquisitionProspect_pkey" PRIMARY KEY ("id"))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AcquisitionProspect_dedupeKey_key" ON "leaguepour_lp"."AcquisitionProspect"("dedupeKey")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AcquisitionProspect_token_key" ON "leaguepour_lp"."AcquisitionProspect"("token")`,
  `CREATE INDEX IF NOT EXISTS "AcquisitionProspect_brand_status_idx" ON "leaguepour_lp"."AcquisitionProspect"("brand", "status")`,
  `CREATE INDEX IF NOT EXISTS "AcquisitionProspect_email_idx" ON "leaguepour_lp"."AcquisitionProspect"("email")`,
];

let ensured = false;
/** Idempotent: Hostinger builds don't run migrations, so the table creates itself on first use. */
export async function ensureAcquisitionTable(): Promise<void> {
  if (ensured) return;
  for (const sql of DDL) await prisma.$executeRawUnsafe(sql);
  ensured = true;
}

export function newToken(): string {
  return randomBytes(16).toString("base64url");
}

function postalAddress(): string {
  return process.env.OUTREACH_POSTAL_ADDRESS?.trim() || "LeaguePour, Chicago, IL, USA";
}

const SUPPRESS_STATUSES = new Set(["NOT_INTERESTED", "BOUNCED", "COMPLAINED"]);
const CROSS_BRAND_COOLING_DAYS = 60;

type ExistingContact = {
  id: string;
  name: string;
  city: string;
  website: string | null;
  email: string | null;
  status: string;
  vsStatus: string | null;
  emailSentAt: Date | null;
  vsEmailSentAt: Date | null;
};

export type ImportResult = {
  created: number;
  queued: number;
  suppressed: number;
  alreadyImported: number;
  invalid: string[];
  byBrand: Record<AcqBrand, { queued: number; suppressed: number }>;
};

/**
 * Imports researched prospects. Dedupes against: prospects already imported (same brand +
 * business), existing venues on either brand, the existing outreach list and its suppression
 * statuses (unsubscribed/bounced/complained), and recent contact by the other brand's lane.
 * Matches that must not be contacted are still stored, as SUPPRESSED with the reason, so the
 * count stays honest and nothing is silently dropped.
 */
export async function importProspects(seeds: ProspectSeed[], now = new Date()): Promise<ImportResult> {
  await ensureAcquisitionTable();
  const result: ImportResult = {
    created: 0,
    queued: 0,
    suppressed: 0,
    alreadyImported: 0,
    invalid: [],
    byBrand: { lp: { queued: 0, suppressed: 0 }, vs: { queued: 0, suppressed: 0 } },
  };

  const [venues, contacts, existing] = await Promise.all([
    prisma.venue.findMany({ select: { id: true, name: true, city: true, websiteUrl: true } }),
    prisma.outreachContact.findMany({
      select: {
        id: true, name: true, city: true, website: true, email: true,
        status: true, vsStatus: true, emailSentAt: true, vsEmailSentAt: true,
      },
    }) as Promise<ExistingContact[]>,
    prisma.acquisitionProspect.findMany({ select: { dedupeKey: true, email: true, status: true } }),
  ]);

  const venueKeys = new Map<string, string>();
  for (const v of venues) for (const k of businessKeys({ name: v.name, city: v.city, website: v.websiteUrl })) venueKeys.set(k, v.id);

  const contactByKey = new Map<string, ExistingContact>();
  const contactByEmail = new Map<string, ExistingContact>();
  for (const c of contacts) {
    for (const k of businessKeys({ name: c.name, city: c.city, website: c.website })) contactByKey.set(k, c);
    if (c.email) contactByEmail.set(c.email.toLowerCase(), c);
  }
  const existingKeys = new Set(existing.map((e) => e.dedupeKey));
  const optedOutEmails = new Set(
    existing.filter((e) => e.email && ["UNSUBSCRIBED", "BOUNCED", "COMPLAINED"].includes(e.status)).map((e) => e.email!.toLowerCase()),
  );
  const coolingSince = new Date(now.getTime() - CROSS_BRAND_COOLING_DAYS * 24 * 60 * 60 * 1000);

  for (const s of seeds) {
    const problem = validateSeed(s);
    if (problem) {
      result.invalid.push(`${s.name}: ${problem}`);
      continue;
    }
    const key = dedupeKey(s.brand, s);
    if (existingKeys.has(key)) {
      result.alreadyImported++;
      continue;
    }
    existingKeys.add(key);

    const email = s.email?.trim().toLowerCase() || null;
    const keys = businessKeys(s);
    let suppressReason: string | null = null;
    let outreachContactId: string | null = null;

    if (keys.some((k) => venueKeys.has(k))) suppressReason = "Already has a LeaguePour/VenueSprocket venue account";
    const contact = keys.map((k) => contactByKey.get(k)).find(Boolean) ?? (email ? contactByEmail.get(email) : undefined);
    if (!suppressReason && email && optedOutEmails.has(email)) suppressReason = "Address opted out or bounced earlier";
    if (!suppressReason && contact) {
      outreachContactId = contact.id;
      if (SUPPRESS_STATUSES.has(contact.status) || SUPPRESS_STATUSES.has(contact.vsStatus ?? "")) {
        suppressReason = `On the outreach suppression list (${contact.vsStatus && SUPPRESS_STATUSES.has(contact.vsStatus) ? contact.vsStatus : contact.status})`;
      } else if (s.brand === "lp" && contact.status !== "NOT_CONTACTED") {
        suppressReason = `Already contacted by LeaguePour outreach (${contact.status})`;
      } else if (s.brand === "vs" && contact.vsStatus) {
        suppressReason = `Already contacted by VenueSprocket outreach (${contact.vsStatus})`;
      } else if (s.brand === "lp" && contact.vsEmailSentAt && contact.vsEmailSentAt > coolingSince) {
        suppressReason = "VenueSprocket emailed this business in the last 60 days";
      } else if (s.brand === "vs" && contact.emailSentAt && contact.emailSentAt > coolingSince) {
        suppressReason = "LeaguePour emailed this business in the last 60 days";
      }
    }

    const token = newToken();
    const draft = buildDraft({ brand: s.brand, name: s.name, segment: s.segment, useCase: s.useCase, token });
    await prisma.acquisitionProspect.create({
      data: {
        brand: s.brand,
        dedupeKey: key,
        name: s.name,
        city: s.city,
        state: s.state,
        segment: s.segment,
        website: s.website ?? null,
        sourceUrl: s.sourceUrl,
        sourceNote: s.sourceNote,
        relevance: s.relevance,
        useCase: s.useCase,
        offer: s.offer,
        contactRoute: s.contactRoute,
        contactValue: s.contactValue ?? null,
        email,
        verifiedAt: new Date(`${s.verifiedAt}T12:00:00Z`),
        status: suppressReason ? "SUPPRESSED" : "QUEUED",
        suppressReason,
        draftSubject: draft.subject,
        draftBody: draft.body,
        token,
        outreachContactId,
      },
    });
    result.created++;
    if (suppressReason) {
      result.suppressed++;
      result.byBrand[s.brand].suppressed++;
    } else {
      result.queued++;
      result.byBrand[s.brand].queued++;
    }
  }
  return result;
}

export function validateSeed(s: ProspectSeed): string | null {
  if (s.brand !== "lp" && s.brand !== "vs") return "bad brand";
  if (!s.name?.trim() || !s.city?.trim() || !s.state?.trim()) return "missing name/city/state";
  if (!/^https?:\/\//.test(s.sourceUrl ?? "")) return "missing public source URL";
  if (!s.sourceNote?.trim() || !s.useCase?.trim()) return "missing source note or use case";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.verifiedAt ?? "")) return "missing verification date";
  if (!["email", "form", "phone"].includes(s.contactRoute)) return "bad contact route";
  if (s.contactRoute === "email" && (!s.email || !isPlausibleEmail(s.email))) return "email route without a valid published email";
  if (s.email && !isPlausibleEmail(s.email)) return "implausible email";
  if (s.contactRoute !== "email" && !s.contactValue && !s.email) return "no contact value";
  return null;
}

// ── Sending (owner action only) ──────────────────────────────────────────────

export type SendResult = { ok: boolean; error?: string };

async function sentTodayCount(brand: AcqBrand, now: Date): Promise<number> {
  const rows = await prisma.acquisitionProspect.findMany({
    where: { brand, sentAt: { gte: new Date(now.getTime() - 30 * 60 * 60 * 1000) } },
    select: { sentAt: true },
  });
  const today = chicagoDay(now);
  return rows.filter((r) => r.sentAt && chicagoDay(r.sentAt) === today).length;
}

/** Reasons a prospect must not be emailed right now, checked again at send time. */
async function sendBlocker(p: { id: string; brand: string; email: string | null; website: string | null; outreachContactId: string | null }): Promise<string | null> {
  if (!p.email || !isPlausibleEmail(p.email)) return "No published email for this prospect";
  const optedOut = await prisma.acquisitionProspect.findFirst({
    where: { email: { equals: p.email, mode: "insensitive" }, status: { in: ["UNSUBSCRIBED", "BOUNCED", "COMPLAINED"] } },
    select: { id: true },
  });
  if (optedOut) return "This address unsubscribed, bounced or complained";
  const contact = await prisma.outreachContact.findFirst({
    where: {
      OR: [
        { email: { equals: p.email, mode: "insensitive" } },
        ...(p.outreachContactId ? [{ id: p.outreachContactId }] : []),
      ],
    },
    select: { status: true, vsStatus: true },
  });
  if (contact && (SUPPRESS_STATUSES.has(contact.status) || SUPPRESS_STATUSES.has(contact.vsStatus ?? ""))) {
    return "On the outreach suppression list";
  }
  const d = domainOf(p.website);
  if (d) {
    const other = await prisma.acquisitionProspect.findFirst({
      where: {
        id: { not: p.id },
        brand: { not: p.brand },
        website: { contains: d, mode: "insensitive" },
        sentAt: { gte: new Date(Date.now() - CROSS_BRAND_COOLING_DAYS * 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (other) return "The other brand emailed this business in the last 60 days";
  }
  return null;
}

/**
 * Sends ONE approved prospect's email. Claims the row first (APPROVED -> SENT) so a double click
 * or a second tab can't send twice, and uses a per-prospect Resend idempotency key.
 */
export async function sendApprovedProspect(id: string, now = new Date()): Promise<SendResult> {
  await ensureAcquisitionTable();
  const p = await prisma.acquisitionProspect.findUnique({ where: { id } });
  if (!p) return { ok: false, error: "Prospect not found" };
  if (p.status !== "APPROVED") return { ok: false, error: "Only approved prospects can be sent" };
  const brand = p.brand as AcqBrand;
  const keyVar = brand === "vs" ? "RESEND_VS_API_KEY" : "RESEND_API_KEY";
  const apiKey = process.env[keyVar]?.trim();
  if (!apiKey) return { ok: false, error: `${keyVar} not configured` };
  // CAN-SPAM needs a real postal address; never send with the generic fallback.
  if (!process.env.OUTREACH_POSTAL_ADDRESS?.trim()) return { ok: false, error: "OUTREACH_POSTAL_ADDRESS not configured" };
  if ((await sentTodayCount(brand, now)) >= DAILY_SEND_CAP) {
    return { ok: false, error: `Daily cap of ${DAILY_SEND_CAP} ${BRAND_INFO[brand].name} sends reached (Chicago day)` };
  }
  if (!p.email || !isPlausibleEmail(p.email)) return { ok: false, error: "No published email for this prospect" };
  const blocker = await sendBlocker(p);
  if (blocker) {
    await prisma.acquisitionProspect.update({ where: { id }, data: { status: "SUPPRESSED", suppressReason: blocker } });
    return { ok: false, error: blocker };
  }

  const claim = await prisma.acquisitionProspect.updateMany({
    where: { id, status: "APPROVED" },
    data: { status: "SENT", sentAt: now, sendError: null },
  });
  if (claim.count !== 1) return { ok: false, error: "Already being sent" };

  const { html, text } = renderEmail({ brand, name: p.name, body: p.draftBody, token: p.token, postalAddress: postalAddress() });
  const unsub = unsubscribeUrl(brand, p.token);
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `acq-${p.id}` },
      body: JSON.stringify({
        from: BRAND_INFO[brand].from,
        to: [p.email],
        reply_to: BRAND_INFO[brand].replyTo,
        subject: p.draftSubject,
        html,
        text,
        headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    // Unknown outcome: keep it marked SENT (never risk a duplicate); the key dedupes a manual retry.
    await prisma.acquisitionProspect.update({ where: { id }, data: { sendError: `Outcome unknown: ${String(err).slice(0, 200)}` } });
    return { ok: false, error: "Send outcome unknown (network). Marked sent to avoid a duplicate." };
  }
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 300);
    if (res.status >= 400 && res.status < 500) {
      await prisma.acquisitionProspect.update({ where: { id }, data: { status: "APPROVED", sentAt: null, sendError: `Resend ${res.status}: ${body}` } });
    } else {
      await prisma.acquisitionProspect.update({ where: { id }, data: { sendError: `Resend ${res.status} (outcome unknown): ${body}` } });
    }
    await logOperationalFailure({ category: "email-send", summary: `Acquisition send failed (Resend ${res.status})`, detail: body, retryable: false });
    return { ok: false, error: `Resend HTTP ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  await prisma.acquisitionProspect.update({ where: { id }, data: { resendId: data.id ?? null } });
  // Keep the older automated lanes from emailing the same business again.
  if (p.outreachContactId) {
    await prisma.outreachContact
      .updateMany({
        where: brand === "lp" ? { id: p.outreachContactId, status: "NOT_CONTACTED" } : { id: p.outreachContactId, vsStatus: null },
        data: brand === "lp" ? { status: "EMAIL_SENT", emailSentAt: now } : { vsStatus: "EMAIL_SENT", vsEmailSentAt: now },
      })
      .catch(() => {});
  }
  return { ok: true };
}

// ── Opt-outs, bounces, visits ────────────────────────────────────────────────

/** One-click opt-out. Stops this prospect, every prospect with the same address, and both old lanes. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return false;
  await ensureAcquisitionTable();
  const p = await prisma.acquisitionProspect.findUnique({ where: { token } });
  if (!p) return false;
  await prisma.acquisitionProspect.update({ where: { id: p.id }, data: { status: "UNSUBSCRIBED" } });
  if (p.email) {
    await prisma.acquisitionProspect.updateMany({
      where: { id: { not: p.id }, email: { equals: p.email, mode: "insensitive" }, status: { in: ["QUEUED", "APPROVED"] } },
      data: { status: "SUPPRESSED", suppressReason: "Same address unsubscribed" },
    });
  }
  const contactWhere = p.outreachContactId
    ? { id: p.outreachContactId }
    : p.email
      ? { email: { equals: p.email, mode: "insensitive" as const } }
      : null;
  if (contactWhere) {
    await prisma.outreachContact.updateMany({ where: contactWhere, data: { status: "NOT_INTERESTED", vsStatus: "NOT_INTERESTED" } }).catch(() => {});
  }
  return true;
}

/** Called by the Resend webhook for hard bounces and spam complaints. */
export async function suppressProspectsByEmail(email: string, kind: "BOUNCED" | "COMPLAINED"): Promise<number> {
  try {
    await ensureAcquisitionTable();
    const r = await prisma.acquisitionProspect.updateMany({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      data: { status: kind },
    });
    return r.count;
  } catch (err) {
    console.error("[acquisition] suppress by email failed", err);
    return 0;
  }
}

export async function recordVisit(token: string, now = new Date()): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return false;
  await ensureAcquisitionTable();
  const r = await prisma.acquisitionProspect.updateMany({ where: { token }, data: { visitCount: { increment: 1 } } });
  if (r.count === 0) return false;
  await prisma.acquisitionProspect.updateMany({ where: { token, firstVisitAt: null }, data: { firstVisitAt: now } });
  return true;
}

// ── Signup attribution ───────────────────────────────────────────────────────

/**
 * Saves first-touch attribution for a new venue and links it to the prospect / old outreach row
 * it came from. Never throws: attribution must not break signup.
 */
export async function recordSignupAttribution(opts: {
  venueId: string;
  brand: AcqBrand;
  attribution: Attribution | null;
  googlePlaceId?: string | null;
}): Promise<void> {
  try {
    let prospectId: string | null = null;
    if (opts.attribution?.ref) {
      await ensureAcquisitionTable();
      const p = await prisma.acquisitionProspect.findUnique({ where: { token: opts.attribution.ref }, select: { id: true, signedUpVenueId: true } });
      if (p) {
        prospectId = p.id;
        if (!p.signedUpVenueId) {
          await prisma.acquisitionProspect.update({ where: { id: p.id }, data: { signedUpVenueId: opts.venueId } });
        }
      }
    }
    const value = JSON.stringify({ brand: opts.brand, ...(opts.attribution ?? {}), prospectId, recordedAt: new Date().toISOString() });
    await prisma.appSetting.upsert({
      where: { key: attributionSettingKey(opts.venueId) },
      create: { key: attributionSettingKey(opts.venueId), value },
      update: {},
    });
    if (opts.googlePlaceId) {
      await prisma.outreachContact.updateMany({
        where: { placeId: opts.googlePlaceId },
        data: opts.brand === "vs" ? { vsStatus: "SIGNED_UP" } : { status: "SIGNED_UP" },
      });
    }
  } catch (err) {
    console.error("[acquisition] recordSignupAttribution failed", err);
  }
}
