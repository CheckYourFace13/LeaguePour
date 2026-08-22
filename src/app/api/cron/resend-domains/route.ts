import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnostic: lists Resend's configured sending domains and their verification status. Built to
 * answer one question without needing Resend dashboard access - is venuesprocket.com verified,
 * given hello@venuesprocket.com is the from-address for both VS outreach and VS's live
 * transactional email (inquiry notifications/confirmations) and batch sends started failing.
 * Read-only (GET against Resend's own /domains listing), returns only domain names/status - no
 * keys, no recipient data. Always requires CRON_SECRET.
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

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY is not configured on the server." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body }, { status: 502 });
    }
    const domains = (body?.data ?? []).map((d: { name: string; status: string; region: string }) => ({
      name: d.name,
      status: d.status,
      region: d.region,
    }));
    return NextResponse.json({ ok: true, domains });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
