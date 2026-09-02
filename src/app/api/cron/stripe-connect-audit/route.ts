import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

/**
 * Read-only, platform-wide Stripe Connect audit for the Q's Wine Bar P0. Never creates,
 * modifies, or deletes anything in Stripe or the DB. Always requires CRON_SECRET.
 *
 * Reports (no venue names/PII beyond aggregate counts):
 * - Whether the platform Stripe account itself has Connect-type capabilities present (a real
 *   signal Connect is active, not just "the dashboard said so").
 * - The raw shape of every registered webhook endpoint (minus secrets) - specifically whether
 *   any endpoint is scoped to receive events from CONNECTED accounts, since account.updated for
 *   a connected account is a Connect-scoped event and is NOT delivered to a plain
 *   account-scoped endpoint even if "account.updated" is in its enabled_events list.
 * - Platform-wide venue counts by Connect/payment-readiness state.
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

  try {
    const stripe = getStripe();

    // Platform account's own capabilities - not directly conclusive about Connect being
    // enabled (Connect is a platform *setting*, not a capability object), but confirms the key
    // still resolves to the right live account and hasn't changed.
    const platformAccount = await stripe.accounts.retrieve();

    let webhookEndpoints: unknown[] = [];
    let webhookListError: string | null = null;
    try {
      const list = await stripe.webhookEndpoints.list({ limit: 20 });
      webhookEndpoints = list.data.map((e) => ({
        id: e.id,
        url: e.url,
        status: e.status,
        enabled_events: e.enabled_events,
        application: e.application,
        livemode: e.livemode,
        api_version: e.api_version,
      }));
    } catch (err) {
      webhookListError = err instanceof Error ? err.message : String(err);
    }

    const totalVenues = await prisma.venue.count();
    const withConnectAccountId = await prisma.venue.count({ where: { stripeAccountId: { not: null } } });
    const chargesEnabled = await prisma.venue.count({ where: { stripeChargesEnabled: true } });
    const payoutsEnabled = await prisma.venue.count({ where: { stripePayoutsEnabled: true } });
    const detailsSubmittedNotCharges = await prisma.venue.count({
      where: { stripeDetailsSubmitted: true, stripeChargesEnabled: false },
    });
    const accountIdButNothingEnabled = await prisma.venue.count({
      where: {
        stripeAccountId: { not: null },
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        stripeDetailsSubmitted: false,
      },
    });

    return NextResponse.json({
      ok: true,
      platformAccountId: platformAccount.id,
      platformAccountType: platformAccount.type ?? null,
      platformCapabilities: platformAccount.capabilities ?? null,
      webhookEndpoints,
      webhookListError,
      venueCounts: {
        totalVenues,
        withConnectAccountId,
        chargesEnabled,
        payoutsEnabled,
        detailsSubmittedButChargesNotEnabled: detailsSubmittedNotCharges,
        hasAccountIdButNothingEnabledYet: accountIdButNothingEnabled,
      },
    });
  } catch (err) {
    console.error("[stripe-connect-audit] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Audit failed." },
      { status: 500 },
    );
  }
}
