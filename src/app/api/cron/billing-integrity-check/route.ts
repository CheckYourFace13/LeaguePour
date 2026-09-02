import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only. Two things:
 * 1) If ?venue= is given: deep-verifies ONE venue's LP subscription against Stripe directly -
 *    customer id, discount/coupon state, period end, price/amount - for a specific support case.
 * 2) Always: scans every venue with an LP subscriptionId for null/inconsistent billing metadata
 *    (the class of bug fixed in the webhook this pass) - reports which ones, doesn't touch any.
 * Never writes anything. Always requires CRON_SECRET.
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
    // --- Part 2: platform-wide null/inconsistent billing metadata scan ---
    const activeSubs = await prisma.venue.findMany({
      where: { subscriptionId: { not: null } },
      select: {
        id: true,
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        subscriptionInterval: true,
        billingPlan: true,
        stripeBillingCustomerId: true,
      },
    });
    const inconsistent = activeSubs
      .filter(
        (v) =>
          v.subscriptionStatus === "active" &&
          (v.subscriptionPeriodEnd === null || v.subscriptionInterval === null || v.stripeBillingCustomerId === null),
      )
      .map((v) => ({
        id: v.id,
        missingPeriodEnd: v.subscriptionPeriodEnd === null,
        missingInterval: v.subscriptionInterval === null,
        missingCustomerId: v.stripeBillingCustomerId === null,
      }));

    // Duplicate subscriptionId across venues (platform-wide)
    const dupCheck = await prisma.venue.groupBy({
      by: ["subscriptionId"],
      where: { subscriptionId: { not: null } },
      _count: { subscriptionId: true },
      having: { subscriptionId: { _count: { gt: 1 } } },
    });

    let venueDetail: unknown = null;
    const venueName = url.searchParams.get("venue");
    if (venueName) {
      const venue = await prisma.venue.findFirst({
        where: { name: venueName },
        select: {
          id: true,
          billingPlan: true,
          subscriptionStatus: true,
          subscriptionInterval: true,
          subscriptionPeriodEnd: true,
          subscriptionId: true,
          stripeBillingCustomerId: true,
          stripeAccountId: true,
          vsConfig: { select: { vsSubscriptionId: true, vsSubscriptionStatus: true } },
        },
      });
      if (!venue) {
        venueDetail = { error: "not found" };
      } else if (!venue.subscriptionId) {
        venueDetail = { error: "no subscriptionId" };
      } else {
        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(venue.subscriptionId, {
          expand: ["discount.coupon", "customer"],
        });
        const item = sub.items.data[0];
        const discount = (sub as unknown as { discount?: unknown }).discount;
        venueDetail = {
          dbCustomerId: venue.stripeBillingCustomerId,
          liveCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          customerIdMatches: venue.stripeBillingCustomerId === (typeof sub.customer === "string" ? sub.customer : sub.customer?.id),
          status: sub.status,
          priceId: item?.price.id,
          priceUnitAmount: item?.price.unit_amount,
          priceInterval: item?.price.recurring?.interval,
          quantity: item?.quantity,
          discount,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          hasStripeAccountId: venue.stripeAccountId !== null,
          vsCollision: Boolean(venue.vsConfig?.vsSubscriptionId) && venue.vsConfig?.vsSubscriptionStatus === "active",
        };
      }
    }

    return NextResponse.json({
      ok: true,
      platformWide: {
        activeSubscriptionCount: activeSubs.length,
        inconsistentBillingMetadata: inconsistent,
        duplicateSubscriptionIds: dupCheck.map((d) => d.subscriptionId),
      },
      venueDetail,
    });
  } catch (err) {
    console.error("[billing-integrity-check] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Check failed." },
      { status: 500 },
    );
  }
}
