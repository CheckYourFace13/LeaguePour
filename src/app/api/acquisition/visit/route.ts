import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/acquisition/store";
import { incrementDaily, sourceLabel } from "@/lib/acquisition/daily";
import { signupBrandFromHost } from "@/lib/signup-plans";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Session beacon from src/components/analytics/acquisition-capture.tsx, sent once per browser
 * session on marketing pages. Increments aggregated daily counters (sessions per brand and
 * source) and, when the landing carried an outreach token, counts a visit against that prospect.
 * Stores no IP, user agent or other visitor data. Per-IP rate limited plus a per-process ceiling.
 */
export async function POST(req: Request) {
  if (!rateLimit(`acq-visit:${clientIp(req)}`, 20, 10 * 60_000).ok || !rateLimit("acq-visit:all", 20_000, 24 * 60 * 60_000).ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  let body: { ref?: unknown; source?: unknown; referrerHost?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const brand = signupBrandFromHost(req.headers.get("host"), null);
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  try {
    const source = sourceLabel({ source: str(body.source), referrerHost: str(body.referrerHost) });
    await incrementDaily(brand, "sessions", "all");
    await incrementDaily(brand, "sessions", source);
    const ref = str(body.ref);
    if (ref) await recordVisit(ref);
  } catch (err) {
    console.error("[acquisition visit] failed", err);
  }
  return NextResponse.json({ ok: true });
}
