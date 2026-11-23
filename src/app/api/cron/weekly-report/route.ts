import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { withScheduledSlot } from "@/lib/job-claims";
import { sendWeeklyReportIfDue } from "@/lib/acquisition/weekly";

export const runtime = "nodejs";

/**
 * Weekly growth report (src/lib/acquisition/weekly.ts). The in-process scheduler calls this on
 * Mondays at 13:00, 14:00 and 16:00 UTC (?run=1|2|3); the route sends only during 8-11am America/
 * Chicago, so 8:00 local is hit in both CST and CDT and the later calls are retries. The weekly claim
 * inside sendWeeklyReportIfDue makes a second send for the same week impossible. CRON_SECRET required.
 */
async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const outcome = await runJob("acquisition-weekly-report", async () => {
    const r = await sendWeeklyReportIfDue();
    return { status: r.status === "sent" ? ("success" as const) : r.status, detail: r.detail, result: r };
  });
  console.log("[weekly-report]", JSON.stringify(outcome));
  return NextResponse.json({ ok: outcome.status !== "failure", ...outcome });
}

export async function GET(request: Request): Promise<Response> {
  const run = new URL(request.url).searchParams.get("run");
  const job = run === "1" || run === "2" || run === "3" ? `weekly-report-${run}` : "weekly-report";
  return withScheduledSlot(job, handle)(request);
}
