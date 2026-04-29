import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import {
  applyStripeChargeRefunded,
  fulfillStripeCheckoutSessionId,
  markCheckoutSessionAsyncFailed,
} from "@/lib/stripe/fulfillment";
import { revalidateRegistrationPaymentPaths } from "@/lib/stripe/revalidate-payment-paths";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.id) {
          const res = await fulfillStripeCheckoutSessionId(session.id, event.id);
          if (res.ok && session.metadata?.registrationId) {
            await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
          }
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.id) {
          const res = await fulfillStripeCheckoutSessionId(session.id, event.id);
          if (res.ok && session.metadata?.registrationId) {
            await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
          }
        }
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.id) await markCheckoutSessionAsyncFailed(session.id, event.id);
        if (session.metadata?.registrationId) {
          await revalidateRegistrationPaymentPaths(session.metadata.registrationId);
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
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
