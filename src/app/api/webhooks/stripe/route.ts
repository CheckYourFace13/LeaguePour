import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { BillingPlan, VsEventStatus, VsPlan } from "@/generated/prisma/enums";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import {
  applyStripeChargeRefunded,
  fulfillStripeCheckoutSessionId,
  markCheckoutSessionAsyncFailed,
} from "@/lib/stripe/fulfillment";
import { revalidateRegistrationPaymentPaths } from "@/lib/stripe/revalidate-payment-paths";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Map a Stripe subscription's metadata.plan value to our BillingPlan enum. */
function parseBillingPlan(raw: string | null | undefined): BillingPlan | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (Object.values(BillingPlan).includes(upper as BillingPlan)) return upper as BillingPlan;
  return null;
}

function parseVsPlan(raw: string | null | undefined): VsPlan | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (Object.values(VsPlan).includes(upper as VsPlan)) return upper as VsPlan;
  return null;
}

/**
 * LeaguePour and VenueSprocket subscriptions for the same venue are separate Stripe
 * Subscription objects, tagged with metadata.product ("lp" | "vs") at checkout. Subscriptions
 * created before that tag existed have no metadata.product - treat those as "lp" so existing
 * LeaguePour subscribers are unaffected. Routing on this tag (rather than always writing to
 * Venue.subscriptionId) is what prevents one product's webhook from overwriting the other's
 * tracked subscription state for venues that hold both.
 */
async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const venueId = sub.metadata?.venueId;
  if (!venueId) {
    console.warn("[stripe webhook] subscription missing venueId metadata", sub.id);
    return;
  }

  const product = sub.metadata?.product === "vs" ? "vs" : "lp";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;

  if (product === "vs") {
    const vsPlan = parseVsPlan(sub.metadata?.vsPlan);
    await prisma.venueVsConfig.upsert({
      where: { venueId },
      create: {
        venueId,
        vsSubscriptionId: sub.id,
        vsSubscriptionStatus: sub.status,
        vsSubscriptionPeriodEnd: periodEnd,
        ...(vsPlan ? { vsPlan } : {}),
      },
      update: {
        vsSubscriptionId: sub.id,
        vsSubscriptionStatus: sub.status,
        vsSubscriptionPeriodEnd: periodEnd,
        ...(vsPlan ? { vsPlan } : {}),
      },
    });
    if (customerId) {
      await prisma.venue.updateMany({
        where: { id: venueId, stripeBillingCustomerId: null },
        data: { stripeBillingCustomerId: customerId },
      });
    }
    return;
  }

  const plan = parseBillingPlan(sub.metadata?.plan);
  await prisma.venue.updateMany({
    where: { id: venueId },
    data: {
      subscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionPeriodEnd: periodEnd,
      ...(customerId ? { stripeBillingCustomerId: customerId } : {}),
      ...(plan ? { billingPlan: plan } : {}),
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const venueId = sub.metadata?.venueId;
  if (!venueId) return;

  const product = sub.metadata?.product === "vs" ? "vs" : "lp";

  if (product === "vs") {
    await prisma.venueVsConfig.updateMany({
      where: { venueId },
      data: {
        vsSubscriptionId: null,
        vsSubscriptionStatus: "canceled",
        vsSubscriptionPeriodEnd: null,
        vsPlan: VsPlan.VS_FREE,
      },
    });
    return;
  }

  await prisma.venue.updateMany({
    where: { id: venueId },
    data: {
      subscriptionId: null,
      subscriptionStatus: "canceled",
      subscriptionPeriodEnd: null,
      billingPlan: BillingPlan.STARTER,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // --- Entry fee payments ---
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          // Subscription checkout - pull the subscription and upsert billing state
          const stripe = getStripe();
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            // If metadata wasn't on subscription yet, use session metadata as fallback
            if (!sub.metadata?.venueId && session.metadata?.venueId) {
              sub.metadata = { ...sub.metadata, ...session.metadata };
            }
            await handleSubscriptionUpsert(sub);
          }
        } else if (session.metadata?.type === "vs_deposit") {
          // VenueSprocket private event deposit
          await fulfillVsDeposit(session);
        } else if (session.id) {
          const res = await fulfillStripeCheckoutSessionId(session.id, event.id);
          if (res.ok && session.metadata?.registrationId) {
            await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
          }
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.id && session.mode !== "subscription") {
          const res = await fulfillStripeCheckoutSessionId(session.id, event.id);
          if (res.ok && session.metadata?.registrationId) {
            await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
          }
        }
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") {
          if (session.id) await markCheckoutSessionAsyncFailed(session.id, event.id);
          if (session.metadata?.registrationId) {
            await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("[stripe webhook] payment_intent.payment_failed", pi.id, pi.last_payment_error?.message);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const raw = charge.payment_intent;
        const intentId = typeof raw === "string" ? raw : raw?.id ?? null;
        if (intentId) {
          const res = await applyStripeChargeRefunded(intentId, event.id);
          if (res.registrationId) await revalidateRegistrationPaymentPaths(res.registrationId);
        }
        break;
      }

      // --- Connect account status ---
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await prisma.venue.updateMany({
          where: { stripeAccountId: account.id },
          data: {
            stripeChargesEnabled: Boolean(account.charges_enabled),
            stripePayoutsEnabled: Boolean(account.payouts_enabled),
            stripeDetailsSubmitted: Boolean(account.details_submitted),
          },
        });
        break;
      }

      // --- SaaS subscription lifecycle ---
      case "customer.subscription.updated": {
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
        if (subId) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(subId);
          await handleSubscriptionUpsert(sub);
        }
        console.warn("[stripe webhook] invoice payment failed for subscription", subId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function fulfillVsDeposit(session: Stripe.Checkout.Session) {
  const vsPaymentId = session.metadata?.vsPaymentId;
  if (!vsPaymentId) return;

  const payment = await prisma.vsPayment.findUnique({ where: { id: vsPaymentId } });
  if (!payment || payment.status === "PAID") return;

  const piId = typeof session.payment_intent === "string" ? session.payment_intent : null;
  await prisma.vsPayment.update({
    where: { id: vsPaymentId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      ...(piId ? { stripePaymentIntentId: piId } : {}),
    },
  });
  await prisma.privateEvent.updateMany({
    where: { id: payment.privateEventId },
    data: { status: VsEventStatus.CONFIRMED },
  });
}
