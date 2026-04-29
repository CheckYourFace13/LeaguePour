"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";
import { revalidateRegistrationPaymentPaths } from "@/lib/stripe/revalidate-payment-paths";
import { getStripe } from "@/lib/stripe/server";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function isLegacyPlaceholderProvider(provider: string | null | undefined) {
  return provider === "leaguepour_placeholder" || provider === "placeholder";
}

/**
 * Owner/manager: refund a paid registration.
 * - Stripe: issues a refund via Stripe API, then updates DB (webhook will align state too).
 * - Legacy placeholder: DB-only test hook (no card network).
 */
export async function refundRegistrationPaymentFormAction(formData: FormData) {
  const registrationId = String(formData.get("registrationId") ?? "");
  if (!registrationId) redirect("/venue/registrations?notice=invalid");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/registrations?notice=forbidden");

  const reg = await prisma.competitionRegistration.findFirst({
    where: { id: registrationId, competition: { venueId: access.venueId } },
    include: {
      payment: true,
      competition: { select: { id: true } },
    },
  });
  if (!reg?.paymentId || !reg.payment) redirect("/venue/registrations?notice=missing-pay");
  if (reg.payment.status !== PaymentStatus.SUCCEEDED) redirect("/venue/registrations?notice=not-paid");

  if (reg.payment.provider === "stripe" && reg.payment.providerPaymentIntentId) {
    const stripe = getStripe();
    try {
      await stripe.refunds.create({
        payment_intent: reg.payment.providerPaymentIntentId,
      });
    } catch (e) {
      console.error("[stripe refund] API error", e);
      const fresh = await prisma.payment.findUnique({ where: { id: reg.paymentId } });
      if (fresh?.status === PaymentStatus.REFUNDED) {
        await revalidateRegistrationPaymentPaths(reg.id);
        redirect("/venue/registrations?notice=refunded");
      }
      redirect("/venue/registrations?notice=stripe_refund_failed");
    }
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: reg.paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          externalRef: `stripe_refund:${reg.payment.providerPaymentIntentId}`,
        },
      }),
      prisma.competitionRegistration.update({
        where: { id: reg.id },
        data: { status: RegistrationStatus.CANCELLED },
      }),
    ]);
  } else if (isLegacyPlaceholderProvider(reg.payment.provider)) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: reg.paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          externalRef: `placeholder_refund:${reg.payment.id}`,
        },
      }),
      prisma.competitionRegistration.update({
        where: { id: reg.id },
        data: { status: RegistrationStatus.CANCELLED },
      }),
    ]);
  } else {
    redirect("/venue/registrations?notice=unsupported_refund");
  }

  await revalidateRegistrationPaymentPaths(reg.id);
  revalidatePath("/venue/registrations");
  revalidatePath("/venue/dashboard");
  revalidatePath("/venue/competitions");
  revalidatePath(`/venue/competitions/${reg.competitionId}`);
  redirect("/venue/registrations?notice=refunded");
}
