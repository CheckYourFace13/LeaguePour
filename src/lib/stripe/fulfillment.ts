import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";
import { getStripe } from "@/lib/stripe/server";

function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === "string") return pi;
  if (pi && typeof pi === "object" && "id" in pi) return pi.id;
  return null;
}

function customerIdFromSession(session: Stripe.Checkout.Session): string | null {
  const c = session.customer;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "id" in c) return c.id;
  return null;
}

function connectSnapshotFromPaymentIntent(pi: Stripe.PaymentIntent | null): {
  applicationFeeCents: number | null;
  destinationId: string | null;
} {
  if (!pi) return { applicationFeeCents: null, destinationId: null };
  const applicationFeeCents =
    typeof pi.application_fee_amount === "number" ? pi.application_fee_amount : null;
  const dest = pi.transfer_data?.destination;
  let destinationId: string | null = null;
  if (typeof dest === "string") destinationId = dest;
  else if (dest && typeof dest === "object" && "id" in dest) destinationId = String(dest.id);
  return { applicationFeeCents, destinationId };
}

/**
 * Fulfill a paid Checkout Session (writes Payment + Registration).
 * Stripe best practice: call **only** from verified webhooks — idempotent per session / event.
 */
export async function fulfillStripeCheckoutSessionId(
  sessionId: string,
  eventId?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "customer"],
  });

  if (session.mode !== "payment") {
    return { ok: false, reason: "not_payment_mode" };
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { ok: false, reason: `payment_status_${session.payment_status}` };
  }

  const registrationId = session.metadata?.registrationId;
  if (!registrationId) {
    console.error("[stripe fulfill] missing registrationId metadata", sessionId);
    return { ok: false, reason: "missing_registration_metadata" };
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  const customerId = customerIdFromSession(session);
  const piExpanded = session.payment_intent;
  const piObj =
    piExpanded && typeof piExpanded === "object" && "id" in piExpanded
      ? (piExpanded as Stripe.PaymentIntent)
      : null;
  const { applicationFeeCents: piAppFee, destinationId: piDest } = connectSnapshotFromPaymentIntent(piObj);

  const out = await prisma.$transaction(async (tx) => {
    const reg = await tx.competitionRegistration.findFirst({
      where: { id: registrationId },
      include: { payment: true, competition: { select: { id: true, venueId: true } } },
    });
    if (!reg?.payment) {
      console.error("[stripe fulfill] registration or payment row missing", registrationId);
      return { ok: false as const, reason: "registration_not_found" };
    }

    const pay = reg.payment;
    if (session.metadata?.competitionId && session.metadata.competitionId !== reg.competitionId) {
      console.error("[stripe fulfill] competitionId mismatch", session.metadata);
      return { ok: false as const, reason: "metadata_mismatch" };
    }
    if (session.metadata?.venueId && session.metadata.venueId !== reg.competition.venueId) {
      console.error("[stripe fulfill] venueId mismatch", session.metadata);
      return { ok: false as const, reason: "metadata_mismatch" };
    }

    const total = session.amount_total;
    if (total != null && total !== pay.amountCents) {
      console.error("[stripe fulfill] amount mismatch", { session: total, db: pay.amountCents, sessionId });
      return { ok: false as const, reason: "amount_mismatch" };
    }

    if (pay.status === PaymentStatus.SUCCEEDED && reg.status === RegistrationStatus.CONFIRMED) {
      if (eventId) {
        await tx.payment.update({
          where: { id: pay.id },
          data: { lastWebhookEventId: eventId },
        });
      }
      return { ok: true as const, reason: "already_fulfilled" };
    }

    await tx.payment.update({
      where: { id: pay.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        provider: "stripe",
        providerCheckoutSessionId: session.id,
        providerPaymentIntentId: paymentIntentId ?? pay.providerPaymentIntentId,
        providerCustomerId: customerId ?? pay.providerCustomerId,
        paidAt: pay.paidAt ?? new Date(),
        lastWebhookEventId: eventId ?? pay.lastWebhookEventId,
        externalRef: paymentIntentId ?? session.id,
        stripeApplicationFeeCents: piAppFee ?? pay.stripeApplicationFeeCents,
        stripeConnectDestinationId: piDest ?? pay.stripeConnectDestinationId,
      },
    });

    await tx.competitionRegistration.update({
      where: { id: reg.id },
      data: { status: RegistrationStatus.CONFIRMED },
    });

    return { ok: true as const, reason: "fulfilled" };
  });

  if (out.ok) {
    console.info("[stripe fulfill]", sessionId, "reason" in out ? out.reason : "", eventId ?? "");
  } else {
    console.warn("[stripe fulfill] skipped", sessionId, "reason" in out ? out.reason : "", eventId ?? "");
  }

  return { ok: out.ok, reason: "reason" in out ? (out as { reason?: string }).reason : undefined };
}

export async function markCheckoutSessionAsyncFailed(sessionId: string, eventId?: string): Promise<void> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const registrationId = session.metadata?.registrationId;
  if (!registrationId) return;

  await prisma.$transaction(async (tx) => {
    const reg = await tx.competitionRegistration.findFirst({
      where: { id: registrationId },
      include: { payment: true },
    });
    if (!reg?.payment) return;
    if (reg.payment.status === PaymentStatus.SUCCEEDED) return;

    await tx.payment.update({
      where: { id: reg.payment.id },
      data: {
        status: PaymentStatus.FAILED,
        providerCheckoutSessionId: session.id,
        lastWebhookEventId: eventId ?? reg.payment.lastWebhookEventId,
      },
    });
  });
  console.info("[stripe] marked payment failed from async failure", sessionId);
}

export async function applyStripeChargeRefunded(
  paymentIntentId: string,
  eventId?: string,
): Promise<{ ok: boolean; registrationId?: string }> {
  const out = await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.findFirst({
      where: { providerPaymentIntentId: paymentIntentId },
      include: { registration: true },
    });
    if (!pay) {
      console.warn("[stripe refund] no payment for intent", paymentIntentId);
      return { ok: false as const, registrationId: undefined };
    }
    if (pay.status === PaymentStatus.REFUNDED) {
      if (eventId) {
        await tx.payment.update({ where: { id: pay.id }, data: { lastWebhookEventId: eventId } });
      }
      return { ok: true as const, registrationId: pay.registration?.id };
    }

    await tx.payment.update({
      where: { id: pay.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: pay.refundedAt ?? new Date(),
        lastWebhookEventId: eventId ?? pay.lastWebhookEventId,
      },
    });

    if (pay.registration) {
      await tx.competitionRegistration.update({
        where: { id: pay.registration.id },
        data: { status: RegistrationStatus.CANCELLED },
      });
      return { ok: true as const, registrationId: pay.registration.id };
    }

    return { ok: true as const, registrationId: undefined };
  });

  if (out.ok) console.info("[stripe refund] applied for intent", paymentIntentId);
  return {
    ok: out.ok,
    registrationId: "registrationId" in out ? out.registrationId : undefined,
  };
}
