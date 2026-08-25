import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { getSetting, setSetting } from "@/lib/app-settings";
import { submitToIndexNow, type IndexNowSubmitResult } from "@/lib/seo/indexnow";
import lpSitemap from "@/app/sitemap";
import vsSitemap from "@/app/venuesprocket/sitemap";

export const runtime = "nodejs";

/**
 * Daily batch submission of the full indexable sitemap to IndexNow for both brands. Dynamic
 * pages that change at a known moment (venue/competition publish) should ideally ping IndexNow
 * immediately via submitToIndexNow/pingIndexNow at that point instead of waiting for this job -
 * this route is the fallback/bulk sweep that guarantees eventual notification even for
 * anything that doesn't have (or hasn't yet gotten) a direct hook, and re-affirms the whole set
 * on a low-frequency cadence rather than firing per-request. Throttled to once per 20h via the
 * same AppSetting pattern used elsewhere so it can't be triggered into spamming the API.
 */
const THROTTLE_HOURS = 20;

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

  const force = url.searchParams.get("force") === "1";

  try {
    const outcome = await runJob("indexnow-submit", async () => {
      if (!force) {
        const lastRun = await getSetting("indexnow_last_run", "");
        if (lastRun) {
          const hoursSince = (Date.now() - new Date(lastRun).getTime()) / (60 * 60 * 1000);
          if (hoursSince < THROTTLE_HOURS) {
            const detail = `Skipped - last run ${hoursSince.toFixed(1)}h ago (throttle ${THROTTLE_HOURS}h)`;
            return {
              status: "skipped" as const,
              detail,
              result: {
                ok: true,
                skipped: detail as string | null,
                lp: null as IndexNowSubmitResult | null,
                vs: null as IndexNowSubmitResult | null,
              },
            };
          }
        }
      }

      const [lpEntries, vsEntries] = await Promise.all([lpSitemap(), vsSitemap()]);
      const lpUrls = lpEntries.map((e) => e.url);
      const vsUrls = vsEntries.map((e) => e.url);

      const lp = await submitToIndexNow("leaguepour.com", lpUrls);
      const vs = await submitToIndexNow("venuesprocket.com", vsUrls);
      await setSetting("indexnow_last_run", new Date().toISOString());

      return {
        status: lp.ok && vs.ok ? ("success" as const) : ("failure" as const),
        detail: `LP: ${lp.ok ? `submitted ${lp.submitted} (HTTP ${lp.status})` : `failed - ${lp.error}`}; VS: ${vs.ok ? `submitted ${vs.submitted} (HTTP ${vs.status})` : `failed - ${vs.error}`}`,
        result: { ok: lp.ok && vs.ok, skipped: null as string | null, lp, vs },
      };
    });
    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[indexnow-submit cron] failed", err);
    return NextResponse.json({ ok: false, error: "IndexNow submission failed." }, { status: 500 });
  }
}
