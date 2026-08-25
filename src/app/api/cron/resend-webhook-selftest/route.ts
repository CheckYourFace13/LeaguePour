import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getPublicSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

/**
 * Proves the dual-secret webhook verification in src/app/api/webhooks/resend actually works,
 * for each brand, without ever exposing either secret's value to a caller (including me) or
 * requiring one to be fabricated externally - the secret is read from this server's own env and
 * used to sign a synthetic test event server-side, then the real webhook endpoint is called
 * with that signature over the network like a genuine Resend delivery would be. Uses an
 * @example.invalid recipient (guaranteed to never match a real contact) with an event type that
 * still exercises the full suppression code path, so this is safe to run against production
 * without touching real data. Always requires CRON_SECRET.
 */
function sign(secret: string, id: string, timestamp: string, body: string): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const digest = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${digest}`;
}

async function testBrand(secret: string, brand: "lp" | "vs") {
  const id = `selftest_${brand}_${Date.now()}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = JSON.stringify({
    type: "email.bounced",
    data: { to: [`resend-webhook-selftest-${brand}@example.invalid`] },
  });
  const signature = sign(secret, id, timestamp, body);

  const res = await fetch(`${getPublicSiteUrl()}/api/webhooks/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    },
    body,
  });
  const responseBody = await res.json().catch(() => null);
  return { status: res.status, accepted: res.status === 200, body: responseBody };
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

  const lpSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const vsSecret = process.env.RESEND_VS_WEBHOOK_SECRET?.trim();

  try {
    const lp = lpSecret ? await testBrand(lpSecret, "lp") : { error: "RESEND_WEBHOOK_SECRET not configured" };
    const vs = vsSecret ? await testBrand(vsSecret, "vs") : { error: "RESEND_VS_WEBHOOK_SECRET not configured" };
    return NextResponse.json({ ok: true, lp, vs });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
