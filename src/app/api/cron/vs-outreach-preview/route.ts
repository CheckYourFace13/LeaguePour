import { NextResponse } from "next/server";
import { getVsOutreachPreviewCore } from "@/lib/outreach-email";

export const runtime = "nodejs";

/**
 * Read-only pre-send sanity check for the VS outreach lane - reports counts only (no email
 * addresses, no other PII) so it's safe to log in a GitHub Actions run. Never sends anything,
 * never takes the send advisory lock. Always requires CRON_SECRET (no time window - a read-only
 * route has no reason to be send-hour-restricted).
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

  try {
    const preview = await getVsOutreachPreviewCore(5);
    return NextResponse.json({ ok: true, ...preview });
  } catch (err) {
    console.error("[vs-outreach-preview route] failed", err);
    return NextResponse.json({ ok: false, error: "Preview failed." }, { status: 500 });
  }
}
