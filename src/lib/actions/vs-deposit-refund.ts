"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { VsPaymentStatus } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { getStripe } from "@/lib/stripe/server";
import { logOperationalFailure } from "@/lib/operational-failure";
import { sendVsDepositRefundEmail } from "@/lib/email";

/**
 * Owner/manager-only: issue a full Stripe refund for a real, PAID VenueSprocket deposit.
 *
 * Built to close the one product gap the whole-business audit left open (a VS deposit refund
 * previously had no flow at all - VsPayment.status had to be hand-corrected). Deliberately
 * full-refund only: VS does not support partial deposit refunds anywhere in the product, and this
 * is not the place to introduce them. Mirrors the LP refund actions' safety shape:
 *   - Stripe must succeed BEFORE any DB status change
 *   - the connected-account context comes from the venue record, never the client
 *   - no client-controlled amount
 *   - duplicate refunds are blocked several ways over
 *   - a Stripe failure is logged to OperationalFailure and shown to the venue, never silently
 *     marked "refunded"
 */
export async function refundVsDepositAction(formData: FormData) {
  const vsPaymentId = String(formData.get("vsPaymentId") ?? "").trim();
  if (!vsPaymentId) redirect("/app/payments?notice=refund-invalid");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");
  if (!venueStaffCanCreateAndPublish(access.role)) {
    redirect("/app/payments?notice=refund-forbidden");
  }

  // Scoped to this venue - a payment for any other venue simply isn't found here.
  const payment = await prisma.vsPayment.findFirst({
    where: { id: vsPaymentId, venueId: access.venueId },
    include: {
      venue: { select: { name: true, stripeAccountId: true } },
      privateEvent: {
        select: {
          eventName: true,
          eventDate: true,
          lead: { select: { customerName: true, customerEmail: true } },
          vsCustomer: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!payment) redirect("/app/payments?notice=refund-not-found");
  if (payment.status === VsPaymentStatus.REFUNDED) {
    redirect("/app/payments?notice=refund-already");
  }
  if (payment.status !== VsPaymentStatus.PAID) {
    redirect("/app/payments?notice=refund-not-paid");
  }
  if (!payment.stripePaymentIntentId) {
    redirect("/app/payments?notice=refund-no-charge");
  }
  if (!payment.venue.stripeAccountId) {
    redirect("/app/payments?notice=refund-no-connect");
  }

  const stripe = getStripe();
  try {
    // Full refund: no `amount` passed, so Stripe refunds the entire PaymentIntent. The
    // connected account context is the venue's own account (direct charge), server-derived.
    await stripe.refunds.create(
      { payment_intent: payment.stripePaymentIntentId },
      { stripeAccount: payment.venue.stripeAccountId },
    );
  } catch (e) {
    console.error("[vs deposit refund] Stripe API error", vsPaymentId, e);
    // Only swallow the error if the payment is now genuinely REFUNDED already (a concurrent
    // refund, or Stripe reporting "charge_already_refunded" while our DB lagged) - then fall
    // through to sync the DB. Anything else is a real failure: log it and show the venue.
    const fresh = await prisma.vsPayment.findUnique({ where: { id: vsPaymentId } });
    if (!fresh || fresh.status !== VsPaymentStatus.REFUNDED) {
      await logOperationalFailure({
        category: "vs-deposit-refund",
        summary: `Deposit refund failed for event ${payment.privateEventId}`,
        venueId: access.venueId,
        detail: e instanceof Error ? e.message : String(e),
        retryable: true,
      });
      redirect("/app/payments?notice=refund-failed");
    }
  }

  await prisma.$transaction([
    prisma.vsPayment.update({
      where: { id: vsPaymentId },
      data: { status: VsPaymentStatus.REFUNDED, refundedAt: new Date() },
    }),
  ]);

  // Retry-safe: the refund is already done and recorded, so a failed email corrupts nothing.
  // Failure surfaces in owner monitoring via sendEmail()'s own OperationalFailure hook.
  const customer = payment.privateEvent.vsCustomer
    ? { name: payment.privateEvent.vsCustomer.name, email: payment.privateEvent.vsCustomer.email }
    : payment.privateEvent.lead
      ? { name: payment.privateEvent.lead.customerName, email: payment.privateEvent.lead.customerEmail }
      : null;
  if (customer?.email) {
    void sendVsDepositRefundEmail({
      to: customer.email,
      customerName: customer.name,
      venueName: payment.venue.name,
      eventName: payment.privateEvent.eventName,
      eventDate: payment.privateEvent.eventDate,
      amountCents: payment.amountCents,
    }).catch((err) => console.error("[vs deposit refund email]", err));
  }

  revalidatePath("/app/payments");
  revalidatePath(`/app/events/${payment.privateEventId}`);
  redirect("/app/payments?notice=refunded");
}
