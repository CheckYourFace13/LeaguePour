"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAppBaseUrl, isStripePaymentsConfigured } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";

export async function startDepositCheckout(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) redirect("/");

  if (!isStripePaymentsConfigured()) {
    redirect(`/deposit/pay?token=${token}&notice=stripe_not_configured`);
  }

  const contract = await prisma.vsContract.findUnique({
    where: { publicToken: token },
    include: {
      proposal: { select: { depositAmount: true } },
      privateEvent: {
        select: {
          id: true,
          venueId: true,
          eventName: true,
          venue: { select: { name: true, stripeAccountId: true } },
        },
      },
    },
  });

  if (!contract || contract.status !== "SIGNED") {
    redirect(`/deposit/pay?token=${token}&notice=not_signed`);
  }

  const depositAmountCents = contract.proposal?.depositAmount ?? 0;
  if (depositAmountCents <= 0) {
    redirect(`/deposit/success?token=${token}&no_deposit=1`);
  }

  const venue = contract.privateEvent.venue;
  if (!venue.stripeAccountId) {
    redirect(`/deposit/pay?token=${token}&notice=no_stripe`);
  }

  // Already paid?
  const alreadyPaid = await prisma.vsPayment.findFirst({
    where: { privateEventId: contract.privateEvent.id, type: "deposit", status: "PAID" },
  });
  if (alreadyPaid) redirect(`/deposit/success?token=${token}&already_paid=1`);

  // Reuse existing open session
  const pendingPayment = await prisma.vsPayment.findFirst({
    where: {
      privateEventId: contract.privateEvent.id,
      type: "deposit",
      status: "PENDING",
      stripeCheckoutSessionId: { not: null },
    },
  });
  if (pendingPayment?.stripeCheckoutSessionId) {
    try {
      const stripe = getStripe();
      const existing = await stripe.checkout.sessions.retrieve(
        pendingPayment.stripeCheckoutSessionId
      );
      if (existing.status === "open" && existing.url) redirect(existing.url);
    } catch {
      // stale session — create new one below
    }
  }

  const stripe = getStripe();
  const base = getAppBaseUrl();

  const payment = await prisma.vsPayment.create({
    data: {
      venueId: contract.privateEvent.venueId,
      privateEventId: contract.privateEvent.id,
      amountCents: depositAmountCents,
      currency: "usd",
      type: "deposit",
      status: "PENDING",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: depositAmountCents,
          product_data: {
            name: `Event deposit — ${contract.privateEvent.eventName}`,
            description: `Non-refundable deposit for your private event at ${venue.name}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      transfer_data: { destination: venue.stripeAccountId },
      on_behalf_of: venue.stripeAccountId,
      metadata: {
        vsPaymentId: payment.id,
        contractToken: token,
        type: "vs_deposit",
      },
    },
    metadata: {
      vsPaymentId: payment.id,
      contractToken: token,
      type: "vs_deposit",
    },
    success_url: `${base}/deposit/success?session_id={CHECKOUT_SESSION_ID}&token=${token}`,
    cancel_url: `${base}/deposit/pay?token=${token}&stripe_cancel=1`,
    client_reference_id: payment.id,
  });

  if (!session.url) redirect(`/deposit/pay?token=${token}&notice=session_failed`);

  await prisma.vsPayment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  redirect(session.url);
}
