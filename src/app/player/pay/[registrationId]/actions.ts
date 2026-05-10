"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";
import { getAppBaseUrl, isStripePaymentsConfigured } from "@/lib/stripe/env";
import { revalidateRegistrationPaymentPaths } from "@/lib/stripe/revalidate-payment-paths";
import { connectApplicationFeeCents, PLATFORM_FEE_BPS, playerTotalCents } from "@/lib/stripe/connect-fees";
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

  // Always read entry fee from the competition record — it's the venue's listed price and the ground truth.
  const entryFeeCents = reg.competition.entryFeeCents;
  if (entryFeeCents <= 0) {
    redirect("/player/competitions");
  }

  const connectReady =
    Boolean(reg.competition.venue.stripeAccountId) &&
    reg.competition.venue.stripeChargesEnabled &&
    reg.competition.venue.stripePayoutsEnabled;
  if (!connectReady) {
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
  // application_fee = 5% of entry (venue side) + $1.50 service fee (player side)
  const applicationFeeAmount = connectApplicationFeeCents(entryFeeCents, true);
  // Total charged to the player: entry fee + $1.50 service fee
  const totalCents = playerTotalCents(entryFeeCents);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: reg.payment.currency.toLowerCase(),
          unit_amount: entryFeeCents,
          product_data: {
            name: `${reg.competition.venue.name}: ${reg.competition.title}`,
            description: "Competition entry fee",
          },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: reg.payment.currency.toLowerCase(),
          unit_amount: 150,
          product_data: {
            name: "LeaguePour service fee",
            description: "Platform booking fee",
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
      application_fee_amount: applicationFeeAmount,
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
      // Store total charged to player so fulfillment amount check matches Stripe's amount_total.
      amountCents: totalCents,
      provider: "stripe",
      providerCheckoutSessionId: checkoutSession.id,
      externalRef: checkoutSession.id,
      stripeApplicationFeeCents: applicationFeeAmount,
      stripeConnectDestinationId: destinationId,
      platformFeeBpsSnapshot: PLATFORM_FEE_BPS,
    },
  });

  await revalidateRegistrationPaymentPaths(reg.id);
  redirect(checkoutSession.url);
}
