import { NextResponse } from "next/server";
import { runJob } from "@/lib/job-runs";
import { getSetting, setSetting } from "@/lib/app-settings";
import { submitToIndexNow } from "@/lib/seo/indexnow";
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

  try {
    const outcome = await runJob("indexnow-submit", async () => {
      const lastRun = await getSetting("indexnow_last_run", "");
      if (lastRun) {
        const hoursSince = (Date.now() - new Date(lastRun).getTime()) / (60 * 60 * 1000);
        if (hoursSince < THROTTLE_HOURS) {
          const detail = `Skipped - last run ${hoursSince.toFixed(1)}h ago (throttle ${THROTTLE_HOURS}h)`;
          return {
            status: "skipped" as const,
            detail,
            result: { ok: true, skipped: detail as string | null, lpCount: 0, vsCount: 0 },
          };
        }
      }

      const [lpEntries, vsEntries] = await Promise.all([lpSitemap(), vsSitemap()]);
      const lpUrls = lpEntries.map((e) => e.url);
      const vsUrls = vsEntries.map((e) => e.url);

      await submitToIndexNow("leaguepour.com", lpUrls);
      await submitToIndexNow("venuesprocket.com", vsUrls);
      await setSetting("indexnow_last_run", new Date().toISOString());

      return {
        status: "success" as const,
        detail: `Submitted ${lpUrls.length} LP URLs, ${vsUrls.length} VS URLs`,
        result: { ok: true, skipped: null as string | null, lpCount: lpUrls.length, vsCount: vsUrls.length },
      };
    });
    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[indexnow-submit cron] failed", err);
    return NextResponse.json({ ok: false, error: "IndexNow submission failed." }, { status: 500 });
  }
}
