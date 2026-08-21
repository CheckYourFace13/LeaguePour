/**
 * LeaguePour SaaS billing helpers.
 *
 * Stripe price lookup keys (already created in Stripe dashboard):
 *   leaguepour_starter_monthly   - $29/mo
 *   leaguepour_growth_monthly    - $79/mo
 *   leaguepour_pro_monthly       - $149/mo
 *   leaguepour_elite_monthly     - $299/mo
 *   leaguepour_starter_annual    - $290/yr
 *   leaguepour_growth_annual     - $790/yr
 *   leaguepour_pro_annual        - $1,490/yr
 *   leaguepour_elite_annual      - $2,990/yr
 *
 * Webhook events to register in Stripe dashboard:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_failed
 */

import type { BillingPlan } from "@/generated/prisma/enums";
import { getStripe } from "@/lib/stripe/server";
import { getAppBaseUrl } from "@/lib/stripe/env";

export type BillingInterval = "monthly" | "annual";

export const BUNDLE_COUPON_ID = "VSBUNDLE50";

export function billingPriceLookupKey(plan: BillingPlan, interval: BillingInterval): string {
  return `leaguepour_${plan.toLowerCase()}_${interval}`;
}

/** Find or create a Stripe Customer for SaaS billing (not the Connect account). */
export async function getOrCreateBillingCustomer(venueId: string, venueName: string, email: string): Promise<string> {
  const stripe = getStripe();
  const existing = await stripe.customers.search({
    query: `metadata["venueId"]:"${venueId}"`,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const customer = await stripe.customers.create({
    name: venueName,
    email,
    metadata: { venueId },
  });
  return customer.id;
}

/** Ensure the bundle coupon exists in Stripe (50% off forever). Idempotent. */
export async function getOrCreateBundleCoupon(): Promise<string> {
  const stripe = getStripe();
  try {
    const existing = await stripe.coupons.retrieve(BUNDLE_COUPON_ID);
    if (existing && !existing.deleted) return existing.id;
  } catch {
    // Not found — create it
  }
  const coupon = await stripe.coupons.create({
    id: BUNDLE_COUPON_ID,
    name: "VenueSprocket + LeaguePour Bundle — 50% off",
    percent_off: 50,
    duration: "forever",
    metadata: { source: "bundle_discount" },
  });
  return coupon.id;
}

/**
 * Which product this subscription belongs to. LeaguePour and VenueSprocket subscriptions
 * for the same venue are separate Stripe Subscription objects sharing one Stripe Customer -
 * this tag lets the webhook route each one's state to the correct DB fields instead of both
 * writing to Venue.subscriptionId and clobbering each other.
 */
export type BillingProduct = "lp" | "vs";

/** Create a Stripe Checkout session in subscription mode for a venue plan. */
export async function createSubscriptionCheckoutUrl(opts: {
  customerId: string;
  plan: BillingPlan;
  interval: BillingInterval;
  venueId: string;
  product?: BillingProduct;
  /** For product "vs": the VenueSprocket-native plan tier to persist on VenueVsConfig.vsPlan. */
  vsPlan?: string;
  successPath?: string;
  cancelPath?: string;
  bundleDiscount?: boolean;
}): Promise<string> {
  const stripe = getStripe();
  const base = getAppBaseUrl();
  const lookupKey = billingPriceLookupKey(opts.plan, opts.interval);
  const product = opts.product ?? "lp";

  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  if (!prices.data[0]) {
    throw new Error(
      `Stripe price not found for lookup key "${lookupKey}". ` +
        `Create it in the Stripe dashboard with that exact lookup key.`,
    );
  }

  // Bundle discount: auto-apply 50% coupon; can't combine with allow_promotion_codes
  const discountOpts: Record<string, unknown> = opts.bundleDiscount
    ? { discounts: [{ coupon: await getOrCreateBundleCoupon() }] }
    : { allow_promotion_codes: true };

  const subscriptionMetadata: Record<string, string> = {
    venueId: opts.venueId,
    plan: opts.plan,
    product,
    ...(opts.vsPlan ? { vsPlan: opts.vsPlan } : {}),
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: opts.customerId,
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    metadata: { ...subscriptionMetadata, interval: opts.interval },
    subscription_data: { metadata: subscriptionMetadata },
    success_url: `${base}${opts.successPath ?? "/venue/settings"}?notice=subscribed`,
    cancel_url: `${base}${opts.cancelPath ?? "/venue/settings"}?notice=subscribe-cancel`,
    ...discountOpts,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Create a Stripe Customer Portal session for self-service plan management. */
export async function createBillingPortalUrl(customerId: string, returnPath = "/venue/settings"): Promise<string> {
  const stripe = getStripe();
  const base = getAppBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}${returnPath}`,
  });
  return session.url;
}

/** Map a Stripe subscription status to a human-readable label. */
export function subscriptionStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trial";
    case "past_due":
      return "Past due - update payment method";
    case "canceled":
      return "Canceled";
    case "unpaid":
      return "Unpaid - update payment method";
    case "incomplete":
      return "Incomplete - finish checkout";
    case "incomplete_expired":
      return "Expired";
    default:
      return "No active subscription";
  }
}

export function subscriptionIsActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
