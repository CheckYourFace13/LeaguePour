"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";
import { getAppBaseUrl, isStripePaymentsConfigured } from "@/lib/stripe/env";
import { revalidateRegistrationPaymentPaths } from "@/lib/stripe/revalidate-payment-paths";
import { connectApplicationFeeCents } from "@/lib/stripe/connect-fees";
import { getStripe } from "@/lib/stripe/server";
import { redirect } from "next/navigation";

export async function startStripeCheckoutForRegistrationFormAction(formData: FormData) {
  const registrationId = String(formData.get("registrationId") ?? "").trim();
  if (!registrationId) redirect("/player/competitions");

  if (!isStripePaymentsConfigured()) {
    redirect(`/player/pay/${registrationId}?notice=stripe_not_configured`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/player/pay/${registrationId}`)}`);
  }

  const reg = await prisma.competitionRegistration.findFirst({
    where: { id: registrationId, userId: session.user.id },
    include: {
      payment: true,
      competition: {
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
              stripeAccountId: true,
              stripeChargesEnabled: true,
              stripePayoutsEnabled: true,
              platformFeeBps: true,
            },
          },
        },
      },
    },
  });
  if (!reg?.payment) redirect("/player/competitions");

  if (reg.payment.status === PaymentStatus.SUCCEEDED && reg.status === RegistrationStatus.CONFIRMED) {
    redirect(`/player/pay/${registrationId}?notice=paid`);
  }

  if (reg.status !== RegistrationStatus.PENDING_PAYMENT) {
    redirect("/player/competitions");
  }

  if (reg.payment.amountCents <= 0) {
    redirect("/player/competitions");
  }

  const connectReady =
    Boolean(reg.competition.venue.stripeAccountId) &&
    reg.competition.venue.stripeChargesEnabled &&
    reg.competition.venue.stripePayoutsEnabled;
  if (reg.payment.amountCents > 0 && !connectReady) {
    redirect(`/player/pay/${registrationId}?notice=venue_connect_required`);
  }

  const stripe = getStripe();
  const base = getAppBaseUrl();

  if (reg.payment.providerCheckoutSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(reg.payment.providerCheckoutSessionId);
      if (existing.status === "open" && existing.url) {
        redirect(existing.url);
      }
    } catch (e) {
      console.warn("[stripe checkout] could not reuse session, creating new", e);
    }
  }

  const successUrl = `${base}/player/pay/${registrationId}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/player/pay/${registrationId}?stripe_cancel=1`;

  const destinationId = reg.competition.venue.stripeAccountId!;
  const applicationFeeAmount = connectApplicationFeeCents(
    reg.payment.amountCents,
    reg.competition.venue.platformFeeBps,
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: reg.payment.currency.toLowerCase(),
          unit_amount: reg.payment.amountCents,
          product_data: {
            name: `${reg.competition.venue.name}: ${reg.competition.title}`,
            description: "Competition entry fee (processed by Stripe)",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      registrationId: reg.id,
      competitionId: reg.competitionId,
      venueId: reg.competition.venue.id,
      playerUserId: reg.userId,
    },
    payment_intent_data: {
      metadata: {
        registrationId: reg.id,
        competitionId: reg.competitionId,
        venueId: reg.competition.venue.id,
        playerUserId: reg.userId,
      },
      transfer_data: { destination: destinationId },
      on_behalf_of: destinationId,
      ...(applicationFeeAmount > 0 ? { application_fee_amount: applicationFeeAmount } : {}),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: reg.id,
  });

  if (!checkoutSession.url) {
    redirect(`/player/pay/${registrationId}?notice=stripe_session_failed`);
  }

  await prisma.payment.update({
    where: { id: reg.payment.id },
    data: {
      provider: "stripe",
      providerCheckoutSessionId: checkoutSession.id,
      externalRef: checkoutSession.id,
      stripeApplicationFeeCents: applicationFeeAmount,
      stripeConnectDestinationId: destinationId,
      platformFeeBpsSnapshot: reg.competition.venue.platformFeeBps,
    },
  });

  await revalidateRegistrationPaymentPaths(reg.id);
  redirect(checkoutSession.url);
}
