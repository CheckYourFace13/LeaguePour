import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runJob } from "@/lib/job-runs";

export const runtime = "nodejs";

/**
 * Resend delivers webhooks in Svix's format (svix-id / svix-timestamp / svix-signature headers,
 * HMAC-SHA256 over "id.timestamp.body" keyed by the base64 payload after "whsec_"). Hand-rolled
 * here rather than adding the svix package as a dependency for three lines of crypto.
 */
function verifySignature(secret: string, id: string, timestamp: string, body: string, signatureHeader: string): boolean {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();

  for (const part of signatureHeader.split(" ")) {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) continue;
    const given = Buffer.from(sig, "base64");
    if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
  }
  return false;
}

type ResendWebhookEvent = {
  type: string;
  data?: { to?: string[] | string };
};

/**
 * Suppresses future cold outreach to an address that hard-bounced or was marked spam, on
 * whichever lane(s) it was contacted through - a bounce/complaint from one brand's send is a
 * signal the address (or the recipient's patience) is bad regardless of which brand triggered it.
 * Both outreach send queries only ever select NOT_CONTACTED (LP) or null (vsStatus), so setting
 * either field to BOUNCED/COMPLAINED is sufficient to exclude the contact going forward - no
 * separate "suppressed" flag needed.
 */
async function suppressContact(email: string, kind: "BOUNCED" | "COMPLAINED") {
  const normalized = email.trim().toLowerCase();
  const result = await prisma.outreachContact.updateMany({
    where: { email: { equals: normalized, mode: "insensitive" } },
    data: { status: kind, vsStatus: kind },
  });
  return result.count;
}

export async function POST(request: Request) {
  // LP and VS are on separate Resend teams (see src/lib/email.ts), each with its own webhook
  // signing secret - a single endpoint accepts events from either, verifying against whichever
  // secret is actually configured. If at least one secret is configured, every request MUST
  // verify against one of the configured secrets; only if NEITHER is configured does it fall
  // back to accepting unverified (matches the original single-secret behavior for a
  // not-yet-configured deployment, never silently downgrades a deployment that has configured
  // at least one).
  const lpSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const vsSecret = process.env.RESEND_VS_WEBHOOK_SECRET?.trim();
  const configuredSecrets = [lpSecret, vsSecret].filter((s): s is string => Boolean(s));
  const body = await request.text();

  if (configuredSecrets.length > 0) {
    const id = request.headers.get("svix-id");
    const timestamp = request.headers.get("svix-timestamp");
    const signature = request.headers.get("svix-signature");
    const verified =
      id && timestamp && signature
        ? configuredSecrets.some((s) => verifySignature(s, id, timestamp, body, signature))
        : false;
    if (!verified) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[resend webhook] No webhook secret configured (RESEND_WEBHOOK_SECRET / RESEND_VS_WEBHOOK_SECRET) - accepting request unverified");
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type !== "email.bounced" && event.type !== "email.complained") {
    return NextResponse.json({ ok: true, skipped: `Ignored event type ${event.type}` });
  }

  const kind = event.type === "email.bounced" ? "BOUNCED" : "COMPLAINED";
  const recipients = Array.isArray(event.data?.to)
    ? event.data.to
    : event.data?.to
      ? [event.data.to]
      : [];

  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, skipped: "No recipient in payload" });
  }

  try {
    const outcome = await runJob("resend-webhook-suppress", async () => {
      let suppressed = 0;
      for (const to of recipients) {
        suppressed += await suppressContact(to, kind);
      }
      return {
        status: "success" as const,
        detail: `${event.type}: suppressed ${suppressed} contact row(s) for ${recipients.join(", ")}`,
        result: { suppressed, recipients, kind },
      };
    });
    return NextResponse.json({ ok: true, ...outcome });
  } catch (err) {
    console.error("[resend webhook] failed", err);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
