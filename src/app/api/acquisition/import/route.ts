import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSetting, setSetting } from "@/lib/app-settings";
import { parseProspectFile } from "@/lib/acquisition/prospects.data";
import { ensureAcquisitionTable, importProspects } from "@/lib/acquisition/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getLatestJobRun, runJob } from "@/lib/job-runs";
import { discoveryConfig, runDiscovery } from "@/lib/acquisition/discover";
import { buildWeeklySnapshot, maskEmail, renderWeekly, weeklyRecipients, weeklySubject } from "@/lib/acquisition/weekly";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * One-time, server-side bulk import of the researched prospect list (Nov 2026), so the owner does
 * not have to upload it by hand. The list never enters the public repository or a public URL: it
 * is POSTed over HTTPS from the operator's machine. Auth is a random bearer token whose SHA-256
 * is below (the token itself is not in the repo). The import is idempotent (importProspects dedupes
 * against prospects, venues, outreach history and suppressions) and the endpoint locks itself
 * after the first successful import. GET with the same token returns aggregate counts only (no
 * prospect data), to verify the result against the production database.
 *
 * POST ?action=discover (same token) runs one discovery pass now, with the same owner caps and kill
 * switch as the daily job, and refuses if discovery already ran in the last 20 hours, so it can
 * never add Google Places usage beyond one run per day.
 *
 * POST ?action=weekly-test (same token) sends ONE test copy of the weekly growth report (current
 * week to date) to the configured owner recipients, then locks (AppSetting weekly_report_test_sent).
 */
const TOKEN_SHA256 = "d32bd370c3e58369ca37cb0cf2d284e1c112d02b9232db8cdf266cc81d47ec4b";
const LOCK_KEY = "acq_bulk_import_used_at";

function authorized(req: Request): boolean {
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!given) return false;
  const a = Buffer.from(createHash("sha256").update(given).digest("hex"));
  const b = Buffer.from(TOKEN_SHA256);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function counts() {
  await ensureAcquisitionTable();
  const rows = await prisma.acquisitionProspect.groupBy({ by: ["brand", "status"], _count: { id: true } });
  const auto = await prisma.acquisitionProspect.count({ where: { segment: { contains: "auto-" } } });
  const total = rows.reduce((n, r) => n + r._count.id, 0);
  return {
    total,
    autoDiscoveredOrQualified: auto,
    byBrandStatus: rows.map((r) => ({ brand: r.brand, status: r.status, count: r._count.id })),
    importedAt: (await getSetting(LOCK_KEY, "")) || null,
  };
}

export async function GET(req: Request) {
  if (!rateLimit(`acq-import:${clientIp(req)}`, 10, 10 * 60_000).ok) return NextResponse.json({ ok: false }, { status: 429 });
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await counts()) });
}

export async function POST(req: Request) {
  if (!rateLimit(`acq-import:${clientIp(req)}`, 10, 10 * 60_000).ok) return NextResponse.json({ ok: false }, { status: 429 });
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (new URL(req.url).searchParams.get("action") === "discover") return discoverNow();
  if (new URL(req.url).searchParams.get("action") === "weekly-test") return weeklyTest();
  if (await getSetting(LOCK_KEY, "")) {
    return NextResponse.json({ ok: false, error: "Already imported; this endpoint is locked.", ...(await counts()) }, { status: 409 });
  }
  const raw = await req.text();
  if (raw.length > 2_000_000) return NextResponse.json({ ok: false, error: "Too large" }, { status: 413 });
  const { seeds, error } = parseProspectFile(raw);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
  const result = await importProspects(seeds);
  if (result.created > 0 || result.alreadyImported > 0) await setSetting(LOCK_KEY, new Date().toISOString());
  console.log(`[acquisition-import] rows ${seeds.length}: created ${result.created} (queued ${result.queued}, suppressed ${result.suppressed}), already ${result.alreadyImported}, invalid ${result.invalid.length}`);
  return NextResponse.json({ ok: true, rows: seeds.length, result: { ...result, invalid: result.invalid.length }, ...(await counts()) });
}

async function discoverNow(): Promise<Response> {
  const cfg = await discoveryConfig();
  if (!cfg.enabled) return NextResponse.json({ ok: false, error: "Discovery is switched off." }, { status: 409 });
  const last = await getLatestJobRun("acquisition-discover");
  if (last && Date.now() - last.startedAt.getTime() < 20 * 60 * 60 * 1000) {
    return NextResponse.json({ ok: false, error: `Discovery already ran at ${last.startedAt.toISOString()}.`, last: last.detail }, { status: 409 });
  }
  const outcome = await runJob("acquisition-discover", async () => {
    const r = await runDiscovery();
    return {
      status: r.error && r.queriesRun.length === 0 ? ("failure" as const) : ("success" as const),
      detail: `${r.queriesRun.length} queries, ${r.placesFound} places (${r.newPlaces} new), ${r.sitesChecked} sites checked, ${r.qualified} qualified, ${r.queued} queued${r.error ? ` - ${r.error}` : ""} (operator run)`,
      result: r,
    };
  });
  console.log("[acquisition-discover] operator run", JSON.stringify(outcome).slice(0, 800));
  return NextResponse.json({ ok: true, discovery: outcome, ...(await counts()) });
}

async function weeklyTest(): Promise<Response> {
  const sent = await getSetting("weekly_report_test_sent", "");
  if (sent) return NextResponse.json({ ok: false, error: `Test already sent at ${sent}.` }, { status: 409 });
  const to = weeklyRecipients();
  if (to.length === 0) return NextResponse.json({ ok: false, error: "No recipient configured (INTERNAL_OWNER_EMAILS / WEEKLY_REPORT_TO)." }, { status: 409 });
  const snap = await buildWeeklySnapshot(new Date(), { partial: true });
  const r = await sendEmail({ to, subject: `${weeklySubject(snap)} (test)`, html: renderWeekly(snap), from: "LeaguePour Reports <hello@leaguepour.com>", brand: "lp" });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error ?? "send failed", recipients: to.map(maskEmail) }, { status: 502 });
  await setSetting("weekly_report_test_sent", new Date().toISOString());
  console.log(`[weekly-report] test sent to ${to.map(maskEmail).join(", ")} (resend id ${r.id ?? "?"})`);
  return NextResponse.json({
    ok: true,
    resendId: r.id ?? null,
    recipients: to.map(maskEmail),
    subject: `${weeklySubject(snap)} (test)`,
    summary: { range: snap.range.label, lp: snap.lp, vs: snap.vs, refundsCents: snap.refundsCents, issues: snap.issues, next: snap.next },
  });
}
