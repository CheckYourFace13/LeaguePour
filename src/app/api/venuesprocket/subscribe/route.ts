/**
 * VenueSprocket subscription checkout.
 *
 * VS plan names map to LP billing plans (same Stripe price lookup keys):
 *   vs/starter ($29/mo)  → STARTER  → leaguepour_starter_monthly
 *   vs/pro     ($79/mo)  → GROWTH   → leaguepour_growth_monthly
 *   vs/growth  ($149/mo) → PRO      → leaguepour_pro_monthly
 *
 * Success redirects back to the VS dashboard (/venue/dashboard).
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BillingPlan, VsPlan } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import {
  createSubscriptionCheckoutUrl,
  getOrCreateBillingCustomer,
  subscriptionIsActive,
} from "@/lib/stripe/billing";
import { isStripePaymentsConfigured } from "@/lib/stripe/env";
import type { BillingInterval } from "@/lib/stripe/billing";

// VS plan name → LP BillingPlan enum (Stripe price catalog is shared; VS plans map onto
// LP price tiers of the same dollar amount - see comment in lib/stripe/billing.ts).
const VS_PLAN_MAP: Record<string, BillingPlan> = {
  starter: BillingPlan.STARTER,
  pro: BillingPlan.GROWTH,
  growth: BillingPlan.PRO,
};

// VS plan name → VenueSprocket-native plan tier, persisted to VenueVsConfig.vsPlan
// (kept separate from the LP price-tier mapping above, which only exists to pick a Stripe price).
const VS_PLAN_TIER: Record<string, VsPlan> = {
  starter: VsPlan.VS_STARTER,
  pro: VsPlan.VS_PRO,
  growth: VsPlan.VS_GROWTH,
};

export async function POST(req: Request) {
  if (!isStripePaymentsConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let vsPlanName: string;
  let interval: BillingInterval;
  try {
    const body = await req.json();
    vsPlanName = String(body.plan ?? "").toLowerCase();
    interval = (body.interval ?? "monthly") as BillingInterval;
    if (!VS_PLAN_MAP[vsPlanName]) throw new Error("bad vs plan");
    if (interval !== "monthly" && interval !== "annual") throw new Error("bad interval");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = VS_PLAN_MAP[vsPlanName];

  const venue = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: {
      id: true,
      name: true,
      stripeBillingCustomerId: true,
      subscriptionStatus: true,
      vsConfig: { select: { id: true } },
    },
  });
  if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

  const userEmail = session?.user?.email ?? "";
  let customerId = venue.stripeBillingCustomerId;
  if (!customerId) {
    customerId = await getOrCreateBillingCustomer(venue.id, venue.name, userEmail);
    await prisma.venue.update({
      where: { id: venue.id },
      data: { stripeBillingCustomerId: customerId },
    });
  }

  // Bundle discount: LP subscriber gets 50% off VS
  const hasLpActive = subscriptionIsActive(venue.subscriptionStatus);
  const bundleDiscount = hasLpActive;

  try {
    const url = await createSubscriptionCheckoutUrl({
      customerId,
      plan,
      interval,
      venueId: venue.id,
      product: "vs",
      vsPlan: VS_PLAN_TIER[vsPlanName],
      bundleDiscount,
      // Return to VS dashboard after payment
      successPath: "/app/dashboard?notice=vs-subscribed",
      cancelPath: "/pricing?notice=subscribe-cancel",
    });
    return NextResponse.json({ url, bundleDiscount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[vs billing subscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
