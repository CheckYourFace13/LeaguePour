import { NextResponse } from "next/server";
import { purgeHostingerCache } from "@/lib/hostinger-cache";

export const runtime = "nodejs";

/**
 * Purges the Hostinger CDN/server cache for both domains via Hostinger's own API - see
 * src/lib/hostinger-cache.ts for why this exists. Meant to be called once per deploy (see
 * .github/workflows/purge-cdn-on-deploy.yml), not on a recurring schedule - purging on every
 * tick would be pointless (nothing changed) and works against the CDN's own purpose. Always
 * requires CRON_SECRET.
 */
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

  const { configured, results } = await purgeHostingerCache();
  if (!configured) {
    // Not a failure - matches this project's established "skip, don't fail" convention for a
    // not-yet-configured optional integration (see outreach-send's throttle skips). Deploys and
    // everything else keep working; this just means the purge is a manual click for now.
    return NextResponse.json({
      ok: true,
      skipped: "HOSTINGER_API_TOKEN / HOSTINGER_USERNAME not configured - cache purge skipped.",
    });
  }
  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results });
}
