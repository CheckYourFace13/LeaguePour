import { NextResponse } from "next/server";
import {
  harvestEmailsCore,
  outreachSentWithinHours,
  sendOutreachCore,
} from "@/lib/outreach-email";
import { runJob } from "@/lib/job-runs";

/**
 * Daily outreach batch: harvest emails from more venue websites, then send the
 * outreach email to the next 25 contacts. Triggered by the scheduled GitHub
 * Actions workflow (.github/workflows/outreach-daily.yml).
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

    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[outreach cron] failed", err);
    return NextResponse.json({ ok: false, error: "Outreach cron failed." }, { status: 500 });
  }
}
