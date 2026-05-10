import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { BillingPlan } from "@/generated/prisma/enums";
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

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const venueId = sub.metadata?.venueId;
  if (!venueId) {
    console.warn("[stripe webhook] subscription missing venueId metadata", sub.id);
    return;
  }

  const plan = parseBillingPlan(sub.metadata?.plan);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;

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
      // ——— Entry fee payments ———
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          // Subscription checkout — pull the subscription and upsert billing state
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

      // ——— Connect account status ———
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

      // ——— SaaS subscription lifecycle ———
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
