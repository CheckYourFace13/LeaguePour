import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/acquisition/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Outreach-link visit beacon (src/components/analytics/acquisition-capture.tsx). Counts a visit
 * against the prospect whose opaque token was in the link. Unknown tokens are ignored; per-IP
 * rate limited. Stores no IP, user agent or other visitor data.
 */
export async function POST(req: Request) {
  if (!rateLimit(`acq-visit:${clientIp(req)}`, 20, 10 * 60_000).ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  let ref = "";
  try {
    const body = (await req.json()) as { ref?: unknown };
    ref = typeof body.ref === "string" ? body.ref : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await recordVisit(ref);
  } catch (err) {
    console.error("[acquisition visit] failed", err);
  }
  return NextResponse.json({ ok: true });
}
