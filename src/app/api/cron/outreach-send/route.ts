import { NextResponse } from "next/server";
import {
  backfillVsEligibilityCore,
  harvestEmailsCore,
  outreachSentWithinHours,
  sendOutreachCore,
} from "@/lib/outreach-email";
import { runJob } from "@/lib/job-runs";

/**
 * Daily outreach batch: harvest emails from more venue websites, backfill VS eligibility
 * classification for contacts harvested before that logic existed, then send the outreach email
 * to the next 25 contacts. Triggered by the scheduled GitHub Actions workflow
 * (.github/workflows/outreach-daily.yml).
 *
 * Safety gates (no shared secret needed for the scheduled path):
 *  - Throttle: refuses if a batch already went out in the past 20 hours,
 *    so at most one batch per day no matter who calls it.
 *  - Time window: only runs 9-11am America/Chicago. The workflow's single
 *    15:00 UTC schedule lands at 10am Chicago in summer (CDT) or 9am in
 *    winter (CST) - both fall inside this window without needing a second
 *    schedule entry (a second entry previously caused two near-simultaneous
 *    requests to race for the same DB connection).
 *  - manual=1 skips the time window (still throttled); requires CRON_SECRET
 *    when one is configured.
 */

// Kept to 1 batch: the backlog is already thousands of emails deep, and each
// site check can take a few seconds in the worst case (dead/slow domains) -
// harvesting too many per run risks exceeding the workflow's request timeout.
const HARVEST_BATCHES_PER_RUN = 1;
const HARVEST_PER_BATCH = 60;
const SEND_PER_RUN = 25;
const THROTTLE_HOURS = 20;
// Same per-site cost as HARVEST_PER_BATCH (one fetch pass per site either way), run as its own
// phase so it makes steady progress on the pre-existing backlog (contacts harvested before VS
// eligibility detection existed) without depending on the send throttle below - this runs every
// day this route fires, whether or not today's LP batch has already gone out.
const VS_BACKFILL_PER_RUN = 60;

function chicagoHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const manual = url.searchParams.get("manual") === "1";

  if (manual) {
    const secret = process.env.CRON_SECRET?.trim();
    if (secret) {
      const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
      if (given !== secret) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }
  } else {
    const hour = chicagoHour();
    if (hour < 9 || hour > 11) {
      return NextResponse.json({
        ok: true,
        skipped: `Outside send window (America/Chicago hour ${hour}); runs 9-11am.`,
      });
    }
  }

  type Outcome = {
    ok: boolean;
    skipped?: string;
    harvest?: { checked: number; found: number; remaining: number };
    send?: Awaited<ReturnType<typeof sendOutreachCore>>;
  };

  try {
    // Own JobRun, own try/catch: a failure here should never take down the LP harvest/send phase
    // below, and vice versa - they're independent concerns sharing one cron trigger.
    const vsBackfill = await runJob("vs-eligibility-backfill", async () => {
      const result = await backfillVsEligibilityCore(VS_BACKFILL_PER_RUN);
      console.log("[vs-eligibility-backfill]", result);
      return {
        status: "success" as const,
        detail: `checked ${result.checked}, ${result.eligible} eligible, ${result.remaining} remaining in backlog`,
        result,
      };
    }).catch((err) => {
      console.error("[vs-eligibility-backfill] failed", err);
      return { checked: 0, eligible: 0, remaining: -1, error: String(err) };
    });

    const outcome = await runJob<Outcome>("lp-outreach-send", async () => {
      if (await outreachSentWithinHours(THROTTLE_HOURS)) {
        const detail = "Batch already sent in the past 20 hours.";
        return { status: "skipped", detail, result: { ok: true, skipped: detail } };
      }

      let harvest = { checked: 0, found: 0, remaining: 0 };
      for (let i = 0; i < HARVEST_BATCHES_PER_RUN; i++) {
        const h = await harvestEmailsCore(HARVEST_PER_BATCH);
        harvest = {
          checked: harvest.checked + h.checked,
          found: harvest.found + h.found,
          remaining: h.remaining,
        };
        if (h.remaining === 0) break;
      }
      const send = await sendOutreachCore(SEND_PER_RUN);

      console.log("[outreach cron]", { harvest, send });
      return {
        status: send.error ? "failure" : "success",
        detail: `harvested ${harvest.found}/${harvest.checked}, sent ${send.sent}, remaining ${send.remaining}${send.error ? ` - ${send.error}` : ""}`,
        result: { ok: !send.error, harvest, send },
      };
    });

    return NextResponse.json({ ...outcome, vsBackfill });
  } catch (err) {
    console.error("[outreach cron] failed", err);
    // Detail included in the response (not just server logs) because this route is only
    // reachable with CRON_SECRET, and the generic message alone gave no way to diagnose a
    // real production failure without server log access.
    return NextResponse.json(
      { ok: false, error: "Outreach cron failed.", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
