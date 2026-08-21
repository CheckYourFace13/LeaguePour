import { NextResponse } from "next/server";
import { sendVsOutreachCore, vsOutreachSentWithinHours } from "@/lib/outreach-email";
import { runJob } from "@/lib/job-runs";
import { getBoolSetting } from "@/lib/app-settings";

/**
 * Daily VenueSprocket outreach batch - a separate lane from LeaguePour's (see
 * .github/workflows/outreach-daily.yml and src/app/api/cron/outreach-send/route.ts for that
 * one). Triggered by .github/workflows/vs-outreach-daily.yml.
 *
 * Deliberately conservative for a brand-new communication channel with zero track record:
 *  - Kill switch: reads the "vs_outreach_enabled" AppSetting (default enabled) - flip it off
 *    from /internal/outreach for an instant stop, no deploy or restart needed.
 *  - Small batch: 5 recipients per run (sendVsOutreachCore already caps at this from the
 *    calling side - see VS_SEND_PER_RUN below).
 *  - Throttle: refuses if a VS batch already went out in the past 20 hours, so at most one
 *    batch per day no matter who calls it (matches the LP lane's throttle).
 *  - Time window: only runs 10am-12pm America/Chicago - offset an hour from LP's 9-11am window
 *    so the two lanes' scheduled runs don't land in the same GitHub Actions minute.
 *  - manual=1 skips the time window (still throttled and still respects the kill switch);
 *    requires CRON_SECRET when one is configured.
 *  - Does NOT touch LeaguePour's send rate or throttle in any way.
 */
const VS_SEND_PER_RUN = 5;
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
    if (hour < 10 || hour > 11) {
      return NextResponse.json({
        ok: true,
        skipped: `Outside send window (America/Chicago hour ${hour}); runs 10am-12pm.`,
      });
    }
  }

  const enabled = await getBoolSetting("vs_outreach_enabled", true);
  if (!enabled) {
    return NextResponse.json({ ok: true, skipped: "VS outreach is disabled (kill switch off)." });
  }

  type Outcome = {
    ok: boolean;
    skipped?: string;
    send?: Awaited<ReturnType<typeof sendVsOutreachCore>>;
  };

  try {
    const outcome = await runJob<Outcome>("vs-outreach-send", async () => {
      if (await vsOutreachSentWithinHours(THROTTLE_HOURS)) {
        const detail = "VS batch already sent in the past 20 hours.";
        return { status: "skipped", detail, result: { ok: true, skipped: detail } };
      }

      const send = await sendVsOutreachCore(VS_SEND_PER_RUN);
      console.log("[vs-outreach cron]", { send });
      return {
        status: send.error ? "failure" : send.sent > 0 ? "success" : "skipped",
        detail: `sent ${send.sent}, remaining ${send.remaining}${send.error ? ` - ${send.error}` : ""}`,
        result: { ok: !send.error, send },
      };
    });

    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[vs-outreach cron] failed", err);
    return NextResponse.json({ ok: false, error: "VS outreach cron failed." }, { status: 500 });
  }
}
