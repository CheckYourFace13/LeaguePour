import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { withScheduledSlot } from "@/lib/job-claims";
import { automationSwitches, formatLaneStatus, outreachLaneStatus } from "@/lib/acquisition/automation";
import { runQualificationBatch } from "@/lib/acquisition/qualify";
import { sendDailyReport } from "@/lib/acquisition/report";

export const runtime = "nodejs";

/**
 * Daily acquisition job (in-process scheduler, 14:45 UTC). Two independent phases, each with its
 * own owner kill switch (/internal/acquisition) and its own JobRun row:
 *  1. acquisition-qualify: scan a small batch of already-listed businesses' own websites and
 *     queue matches for owner approval (src/lib/acquisition/qualify.ts). Sends nothing.
 *  2. acquisition-report: email the owner yesterday's numbers, only when something changed.
 * Also logs the cold-email lanes' live state ([outreach-status]) so the runtime log proves the
 * VenueSprocket automatic lane is paused. CRON_SECRET required; one execution per slot.
 */
async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const lanes = await outreachLaneStatus().catch((err) => ({ error: String(err) }));
  console.log("error" in lanes ? `[outreach-status] read failed: ${lanes.error}` : formatLaneStatus(lanes));

  const switches = await automationSwitches();
  const qualify = await runJob("acquisition-qualify", async () => {
    if (!switches.qualify) return { status: "skipped" as const, detail: "Kill switch off", result: null };
    const r = await runQualificationBatch();
    return {
      status: "success" as const,
      detail: `scanned ${r.scanned}: ${r.lp} LP, ${r.vs} VS matches, ${r.queued} queued, ${r.noSignal} no signal, ${r.unreachable} unreachable`,
      result: r,
    };
  }).catch((err) => ({ error: String(err) }));

  const report = await runJob("acquisition-report", async () => {
    if (!switches.report) return { status: "skipped" as const, detail: "Kill switch off", result: null };
    const r = await sendDailyReport();
    return { status: r.status === "sent" ? ("success" as const) : r.status, detail: r.detail, result: r };
  }).catch((err) => ({ error: String(err) }));

  console.log("[acquisition-daily]", JSON.stringify({ qualify, report }).slice(0, 800));
  return NextResponse.json({ ok: true, lanes, qualify, report });
}

export const GET = withScheduledSlot("acquisition-daily", handle);
