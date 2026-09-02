import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Read-only, single-venue account health check for a specific support case - same anonymized
 * shape as customer-health (no name/email/address in the response) but targeted at one venue by
 * exact name, via ?venue=. Never writes anything. Always requires CRON_SECRET.
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
  const venueName = url.searchParams.get("venue");
  if (!venueName) {
    return NextResponse.json({ ok: false, error: "Missing ?venue=<exact name>" }, { status: 400 });
  }

  try {
    const venue = await prisma.venue.findFirst({
      where: { name: venueName },
      select: {
        billingPlan: true,
        subscriptionStatus: true,
        subscriptionInterval: true,
        subscriptionPeriodEnd: true,
        subscriptionId: true,
        isDisabled: true,
        staff: { select: { id: true, role: true } },
        vsConfig: { select: { vsSubscriptionId: true, vsSubscriptionStatus: true } },
        stripeAccountId: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
        stripeDetailsSubmitted: true,
      },
    });

    if (!venue) {
      return NextResponse.json({ ok: true, found: false });
    }

    // Duplicate-subscription check scoped to this one subscriptionId (not a full-table scan -
    // customer-health already proves 0 duplicates platform-wide, this just re-confirms for this
    // specific id in case that changed since).
    const duplicateCount = venue.subscriptionId
      ? await prisma.venue.count({ where: { subscriptionId: venue.subscriptionId } })
      : 1;

    return NextResponse.json({
      ok: true,
      found: true,
      subscription: {
        plan: venue.billingPlan,
        status: venue.subscriptionStatus,
        interval: venue.subscriptionInterval,
        hasPeriodEnd: venue.subscriptionPeriodEnd !== null,
        periodEndInFuture: venue.subscriptionPeriodEnd ? venue.subscriptionPeriodEnd > new Date() : null,
        hasStripeSubscriptionId: venue.subscriptionId !== null,
        duplicateSubscriptionIdRowCount: duplicateCount,
      },
      ownership: {
        staffRowCount: venue.staff.length,
        hasOwnerRole: venue.staff.some((s) => s.role === "OWNER"),
      },
      isDisabled: venue.isDisabled,
      vsCollision: Boolean(venue.vsConfig?.vsSubscriptionId) && venue.vsConfig?.vsSubscriptionStatus === "active",
      stripeConnect: {
        hasAccountId: venue.stripeAccountId !== null,
        chargesEnabled: venue.stripeChargesEnabled,
        payoutsEnabled: venue.stripePayoutsEnabled,
        detailsSubmitted: venue.stripeDetailsSubmitted,
        // If hasAccountId is true but everything else is false, that's a real partial/stuck
        // onboarding. If hasAccountId is false, no Connect account was ever created for this
        // venue at all (consistent with account creation failing before the DB write that
        // records the id - see createStripeConnectOnboardingAction).
      },
    });
  } catch (err) {
    console.error("[venue-account-check] failed", err);
    return NextResponse.json({ ok: false, error: "Query failed." }, { status: 500 });
  }
}
