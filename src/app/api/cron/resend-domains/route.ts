import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnostic: lists Resend's configured sending domains and their verification status, for
 * BOTH brands' separate Resend teams (RESEND_API_KEY for LP, RESEND_VS_API_KEY for VS). Built
 * to answer "is this domain verified" without needing Resend dashboard access. Read-only (GET
 * against Resend's own /domains listing), returns only domain names/status - no keys, no
 * recipient data. Always requires CRON_SECRET.
 */
async function listDomains(resendKey: string) {
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${resendKey}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) return { ok: false as const, status: res.status, body };
  const domains = (body?.data ?? []).map((d: { name: string; status: string; region: string }) => ({
    name: d.name,
    status: d.status,
    region: d.region,
  }));
  return { ok: true as const, domains };
}

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

  const lpKey = process.env.RESEND_API_KEY?.trim();
  const vsKey = process.env.RESEND_VS_API_KEY?.trim();

  try {
    const lp = lpKey ? await listDomains(lpKey) : { ok: false as const, error: "RESEND_API_KEY not configured" };
    const vs = vsKey ? await listDomains(vsKey) : { ok: false as const, error: "RESEND_VS_API_KEY not configured" };
    return NextResponse.json({ ok: true, lp, vs });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
