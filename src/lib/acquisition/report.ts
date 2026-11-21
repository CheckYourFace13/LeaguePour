/**
 * Daily acquisition report for the owner: yesterday's real numbers per brand (Chicago day), what
 * the automated pieces did, and what needs a decision. Sent by email to the owner allowlist only
 * when something happened or the open decisions changed. A quiet day with nothing new produces
 * no email, just a "skipped" JobRun.
 */
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSetting, setSetting } from "@/lib/app-settings";
import { isVsOutreachEnabled, LP_OUTREACH_ENABLED_KEY } from "@/lib/outreach-email";
import { getBoolSetting } from "@/lib/app-settings";
import { sendEmail, escHtml } from "@/lib/email";
import { chicagoDay, PROGRAM_TARGETS, type AcqBrand } from "./program";
import { dailyRows, trackingSince } from "./daily";
import { ensureAcquisitionTable } from "./store";

const DIGEST_KEY = "acq_report_last_digest";
const DAY_MS = 24 * 60 * 60 * 1000;

function ownerRecipients(): string[] {
  const raw = process.env.INTERNAL_OWNER_EMAILS ?? process.env.OWNER_EMAIL ?? "";
  return raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
}

export type BrandDay = {
  sessions: number | null;
  topSources: string[];
  signups: number;
  signupsFromOutreach: number;
  activations: number;
  paidConversions: number;
  emailsSent: number;
  replies: number;
  optOuts: number;
  autoQualified: number;
};

export type DailySnapshot = {
  day: string;
  lp: BrandDay;
  vs: BrandDay;
  totals: { prospectsQueued: number; prospectsApproved: number; registrations30d: number; paid30d: number };
  decisions: string[];
  vsAutoOutreach: "paused" | "ON";
  lpAutoOutreach: "paused" | "ON";
};

/** Snapshot for one Chicago calendar day (default: yesterday). */
export async function buildDailySnapshot(now = new Date(), day = chicagoDay(new Date(now.getTime() - DAY_MS))): Promise<DailySnapshot> {
  await ensureAcquisitionTable();
  const windowStart = new Date(now.getTime() - 3 * DAY_MS);
  const onDay = (d: Date | null | undefined) => !!d && chicagoDay(d) === day;

  const [since, rows, venues, attrRows, conversions, competitions, leads, prospects, vsOn, lpOn] = await Promise.all([
    trackingSince(),
    dailyRows(day),
    prisma.venue.findMany({ where: { createdAt: { gte: windowStart } }, select: { id: true, createdAt: true, vsConfig: { select: { createdAt: true } } } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "acq:venue:" }, updatedAt: { gte: windowStart } }, select: { key: true, value: true } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "conversion:subscription_activated:" }, updatedAt: { gte: windowStart } }, select: { value: true } }),
    prisma.competition.findMany({ where: { publishedAt: { gte: windowStart } }, select: { publishedAt: true } }),
    prisma.privateEventLead.findMany({ where: { createdAt: { gte: windowStart } }, select: { createdAt: true } }),
    prisma.acquisitionProspect.findMany({ select: { brand: true, status: true, sentAt: true, repliedAt: true, updatedAt: true, createdAt: true, segment: true } }),
    isVsOutreachEnabled(),
    getBoolSetting(LP_OUTREACH_ENABLED_KEY, false),
  ]);

  const attr = new Map<string, { brand?: string; campaign?: string; prospectId?: string | null }>();
  for (const r of attrRows) {
    try {
      attr.set(r.key.slice("acq:venue:".length), JSON.parse(r.value));
    } catch {
      /* skip */
    }
  }
  const tracked = !!since && day >= since;
  const brandDay = (brand: AcqBrand): BrandDay => {
    const sessionsRow = rows.find((r) => r.brand === brand && r.metric === "sessions" && r.dim === "all");
    const sources = rows
      .filter((r) => r.brand === brand && r.metric === "sessions" && r.dim !== "all")
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((r) => `${r.dim} ${r.count}`);
    const dayVenues = venues.filter((v) => {
      if (!onDay(v.createdAt)) return false;
      const a = attr.get(v.id);
      const b = a?.brand ?? (v.vsConfig && Math.abs(v.vsConfig.createdAt.getTime() - v.createdAt.getTime()) < 3_600_000 ? "vs" : "lp");
      return b === brand;
    });
    const p = prospects.filter((x) => x.brand === brand);
    return {
      sessions: tracked ? (sessionsRow?.count ?? 0) : null,
      topSources: sources,
      signups: dayVenues.length,
      signupsFromOutreach: dayVenues.filter((v) => attr.get(v.id)?.campaign === "acq-2026-11" || attr.get(v.id)?.prospectId).length,
      activations: brand === "lp" ? competitions.filter((c) => onDay(c.publishedAt)).length : leads.filter((l) => onDay(l.createdAt)).length,
      paidConversions: conversions.filter((c) => {
        try {
          const d = JSON.parse(c.value) as { product?: string; at?: string };
          return (d.product === "vs" ? "vs" : "lp") === brand && !!d.at && chicagoDay(new Date(d.at)) === day;
        } catch {
          return false;
        }
      }).length,
      emailsSent: p.filter((x) => onDay(x.sentAt)).length,
      replies: p.filter((x) => onDay(x.repliedAt)).length,
      optOuts: p.filter((x) => ["UNSUBSCRIBED", "BOUNCED", "COMPLAINED"].includes(x.status) && onDay(x.updatedAt)).length,
      autoQualified: p.filter((x) => x.segment.includes("auto-qualified") && onDay(x.createdAt)).length,
    };
  };

  const queued = prospects.filter((x) => x.status === "QUEUED").length;
  const approved = prospects.filter((x) => x.status === "APPROVED").length;
  const d30 = new Date(now.getTime() - 30 * DAY_MS);
  const [registrations30d, paidRows] = await Promise.all([
    prisma.venue.count({ where: { createdAt: { gte: d30 } } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "conversion:subscription_activated:" }, updatedAt: { gte: d30 } }, select: { key: true } }),
  ]);

  const decisions: string[] = [];
  if (queued > 0) decisions.push(`${queued} prospect draft(s) waiting for your review in the approval queue.`);
  if (approved > 0) decisions.push(`${approved} approved prospect(s) not sent yet (press Send on each).`);
  if (!since) decisions.push("Visitor counting has no data yet (it starts with the first marketing-site session after deploy).");
  if (!process.env.OUTREACH_POSTAL_ADDRESS?.trim()) decisions.push("OUTREACH_POSTAL_ADDRESS is not set, so the queue cannot send.");
  if (vsOn) decisions.push("VenueSprocket automatic cold email is ON. It was ordered paused; turn it off in /internal/outreach.");

  return {
    day,
    lp: brandDay("lp"),
    vs: brandDay("vs"),
    totals: { prospectsQueued: queued, prospectsApproved: approved, registrations30d, paid30d: paidRows.length },
    decisions,
    vsAutoOutreach: vsOn ? "ON" : "paused",
    lpAutoOutreach: lpOn ? "ON" : "paused",
  };
}

/** True when the day had any real activity worth a report. */
export function hasActivity(s: DailySnapshot): boolean {
  const b = (x: BrandDay) => (x.sessions ?? 0) + x.signups + x.activations + x.paidConversions + x.emailsSent + x.replies + x.optOuts + x.autoQualified;
  return b(s.lp) + b(s.vs) > 0;
}

export function snapshotDigest(s: DailySnapshot): string {
  return createHash("sha256").update(JSON.stringify({ lp: s.lp, vs: s.vs, decisions: s.decisions, vsAuto: s.vsAutoOutreach })).digest("hex");
}

export function renderReport(s: DailySnapshot): { subject: string; html: string } {
  const cell = (v: number | null) => (v === null ? "no data" : String(v));
  const row = (label: string, lp: string, vs: string) =>
    `<tr><td style="padding:4px 10px;border-bottom:1px solid #eee;">${escHtml(label)}</td><td style="padding:4px 10px;border-bottom:1px solid #eee;text-align:right;">${escHtml(lp)}</td><td style="padding:4px 10px;border-bottom:1px solid #eee;text-align:right;">${escHtml(vs)}</td></tr>`;
  const table = [
    row("Site sessions (first-party)", cell(s.lp.sessions), cell(s.vs.sessions)),
    row("Top sources", s.lp.topSources.join(", ") || "-", s.vs.topSources.join(", ") || "-"),
    row("New venue signups", `${s.lp.signups} (${s.lp.signupsFromOutreach} outreach)`, `${s.vs.signups} (${s.vs.signupsFromOutreach} outreach)`),
    row("Competitions published / inquiries received", String(s.lp.activations), String(s.vs.activations)),
    row("Paid conversions", String(s.lp.paidConversions), String(s.vs.paidConversions)),
    row("Approved emails sent", String(s.lp.emailsSent), String(s.vs.emailsSent)),
    row("Replies marked", String(s.lp.replies), String(s.vs.replies)),
    row("Opt-outs / bounces / complaints", String(s.lp.optOuts), String(s.vs.optOuts)),
    row("New auto-qualified prospects", String(s.lp.autoQualified), String(s.vs.autoQualified)),
  ].join("");
  const decisions = s.decisions.length ? `<ul>${s.decisions.map((d) => `<li>${escHtml(d)}</li>`).join("")}</ul>` : "<p>No decisions needed.</p>";
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1f36;">
<h2 style="margin:0 0 6px;">Acquisition report: ${escHtml(s.day)}</h2>
<p style="margin:0 0 12px;color:#555;">Automatic cold email: VenueSprocket ${s.vsAutoOutreach}, LeaguePour ${s.lpAutoOutreach}. Spend: $0 (no paid channels).</p>
<table style="border-collapse:collapse;font-size:14px;"><tr><th></th><th style="padding:4px 10px;text-align:right;">LeaguePour</th><th style="padding:4px 10px;text-align:right;">VenueSprocket</th></tr>${table}</table>
<h3 style="margin:16px 0 4px;">Needs you</h3>${decisions}
<p style="font-size:13px;color:#555;">Last 30 days: ${s.totals.registrations30d} venue registrations (target ${PROGRAM_TARGETS.registrations}), ${s.totals.paid30d} paid conversions (target ${PROGRAM_TARGETS.paidConversionsLow}-${PROGRAM_TARGETS.paidConversionsHigh}). Dashboard: https://leaguepour.com/internal/acquisition</p>
</body></html>`;
  return { subject: `Acquisition ${s.day}: ${s.lp.signups + s.vs.signups} signups, ${s.lp.paidConversions + s.vs.paidConversions} paid`, html };
}

export type ReportOutcome = { status: "sent" | "skipped" | "failure"; detail: string };

export async function sendDailyReport(now = new Date(), opts: { send?: typeof sendEmail } = {}): Promise<ReportOutcome> {
  const to = ownerRecipients();
  if (to.length === 0) return { status: "skipped", detail: "No owner email configured (INTERNAL_OWNER_EMAILS / OWNER_EMAIL)." };
  const s = await buildDailySnapshot(now);
  const digest = snapshotDigest(s);
  const last = await getSetting(DIGEST_KEY, "");
  if (!hasActivity(s) && digest === last) return { status: "skipped", detail: `Nothing changed for ${s.day}.` };
  const { subject, html } = renderReport(s);
  const r = await (opts.send ?? sendEmail)({ to, subject, html, from: "LeaguePour Reports <hello@leaguepour.com>", brand: "lp" });
  if (!r.ok) return { status: "failure", detail: `Report email failed: ${r.error ?? "unknown"}` };
  await setSetting(DIGEST_KEY, digest);
  return { status: "sent", detail: `Report for ${s.day} sent to ${to.length} owner address(es).` };
}
