import { NextResponse } from "next/server";
import { backfillVsEligibilityCore } from "@/lib/outreach-email";
import { runJob } from "@/lib/job-runs";

export const runtime = "nodejs";

/**
 * Standalone trigger for the same VS eligibility backfill phase that also runs inside
 * src/app/api/cron/outreach-send/route.ts on every scheduled run. Exists so the backfill can be
 * exercised - or re-run to make faster progress on the pre-existing backlog - without also
 * touching LP's send throttle/window: this route never calls sendOutreachCore or
 * sendVsOutreachCore, so it can't send email or affect either lane's "already sent today" check.
 * Always requires CRON_SECRET (no time window - a read/write-only backfill has no reason to be
 * restricted to a send hour).
 */
const DEFAULT_LIMIT = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT;

  try {
    const result = await runJob("vs-eligibility-backfill", async () => {
      const r = await backfillVsEligibilityCore(limit);
      return {
        status: "success" as const,
        detail: `checked ${r.checked}, ${r.eligible} eligible, ${r.remaining} remaining in backlog`,
        result: r,
      };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[vs-eligibility-backfill route] failed", err);
    return NextResponse.json({ ok: false, error: "Backfill failed." }, { status: 500 });
  }
}
