import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time: adds charge.dispute.created to the EXISTING production webhook endpoint's
 * enabled_events (does not create a new endpoint, does not touch the signing secret). Required
 * for the new charge.dispute.created case in api/webhooks/stripe/route.ts to ever actually fire
 * - Stripe only sends event types an endpoint is explicitly subscribed to. Always requires
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
  const endpoint = endpoints.data.find((e) => e.url === "https://leaguepour.com/api/webhooks/stripe");
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "Production webhook endpoint not found" }, { status: 404 });
  }
  if (endpoint.enabled_events.includes("charge.dispute.created")) {
    return NextResponse.json({ ok: true, note: "Already subscribed.", enabled_events: endpoint.enabled_events });
  }

  const updated = await stripe.webhookEndpoints.update(endpoint.id, {
    enabled_events: [...endpoint.enabled_events, "charge.dispute.created"] as Stripe.WebhookEndpointUpdateParams.EnabledEvent[],
  });

  return NextResponse.json({ ok: true, enabled_events: updated.enabled_events });
}
