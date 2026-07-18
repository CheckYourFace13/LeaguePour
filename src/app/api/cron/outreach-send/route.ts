import { NextResponse } from "next/server";
import {
  harvestEmailsCore,
  outreachSentWithinHours,
  sendOutreachCore,
} from "@/lib/outreach-email";

/**
 * Daily outreach batch: harvest emails from more venue websites, then send the
 * outreach email to the next 25 contacts. Triggered by the scheduled GitHub
 * Actions workflow (.github/workflows/outreach-daily.yml).
 *
 * Safety gates (no shared secret needed for the scheduled path):
 *  - Throttle: refuses if a batch already went out in the past 20 hours,
 *    so at most one batch per day no matter who calls it.
 *  - Time window: only runs 9-11am America/Chicago (the workflow fires at
 *    both 14:00 and 15:00 UTC so 9am survives DST; the wrong-hour hit is
 *    rejected here and the right one proceeds).
 *  - manual=1 skips the time window (still throttled); requires CRON_SECRET
 *    when one is configured.
 */

const HARVEST_PER_RUN = 60;
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

  try {
    if (await outreachSentWithinHours(THROTTLE_HOURS)) {
      return NextResponse.json({ ok: true, skipped: "Batch already sent in the past 20 hours." });
    }

    const harvest = await harvestEmailsCore(HARVEST_PER_RUN);
    const send = await sendOutreachCore(SEND_PER_RUN);

    console.log("[outreach cron]", { harvest, send });
    return NextResponse.json({ ok: !send.error, harvest, send });
  } catch (err) {
    console.error("[outreach cron] failed", err);
    return NextResponse.json({ ok: false, error: "Outreach cron failed." }, { status: 500 });
  }
}
