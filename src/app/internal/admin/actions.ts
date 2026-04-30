"use server";

import {
  CompetitionStatus,
  DiscountType,
  PaymentStatus,
  RegistrationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireOwnerSession } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

function toInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function disableVenueAction(formData: FormData) {
  await requireOwnerSession();
  const venueId = String(formData.get("venueId") ?? "");
  const disable = String(formData.get("disable") ?? "true") === "true";
  if (!venueId) return;
  await prisma.venue.update({ where: { id: venueId }, data: { isDisabled: disable } });
  revalidatePath("/internal/admin");
}

export async function deleteVenueAction(formData: FormData) {
  await requireOwnerSession();
  const venueId = String(formData.get("venueId") ?? "");
  if (!venueId) return;
  await prisma.venue.delete({ where: { id: venueId } });
  revalidatePath("/internal/admin");
}

export async function unpublishCompetitionAction(formData: FormData) {
  await requireOwnerSession();
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) return;
  await prisma.competition.update({
    where: { id: competitionId },
    data: {
      status: CompetitionStatus.DRAFT,
      publishedAt: null,
    },
  });
  revalidatePath("/internal/admin");
}

export async function deleteCompetitionAction(formData: FormData) {
  await requireOwnerSession();
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) return;
  await prisma.competition.delete({ where: { id: competitionId } });
  revalidatePath("/internal/admin");
}

export async function markRegistrationCompAction(formData: FormData) {
  await requireOwnerSession();
  const registrationId = String(formData.get("registrationId") ?? "");
  if (!registrationId) return;

  const reg = await prisma.competitionRegistration.findUnique({
    where: { id: registrationId },
    select: { paymentId: true },
  });
  if (!reg) return;

  await prisma.competitionRegistration.update({
    where: { id: registrationId },
    data: { status: RegistrationStatus.CONFIRMED },
  });

  if (reg.paymentId) {
    await prisma.payment.update({
      where: { id: reg.paymentId },
      data: {
        status: PaymentStatus.SUCCEEDED,
        provider: "admin_comp_placeholder",
        paidAt: new Date(),
      },
    });
  }
  revalidatePath("/internal/admin");
}

export async function refundPaymentPlaceholderAction(formData: FormData) {
  await requireOwnerSession();
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return;
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      provider: "admin_refund_placeholder",
    },
  });
  revalidatePath("/internal/admin");
}

export async function createPromoCodeAction(formData: FormData) {
  await requireOwnerSession();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;

  const venueIdRaw = String(formData.get("venueId") ?? "").trim();
  const discountTypeRaw = String(formData.get("discountType") ?? "PERCENT");
  const amount = toInt(formData.get("amount"));
  if (!amount || amount <= 0) return;

  const usageLimit = toInt(formData.get("usageLimit"));
  const expiresAt = toDate(formData.get("expiresAt"));
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  await prisma.promoCode.create({
    data: {
      code,
      venueId: venueIdRaw || null,
      discountType: discountTypeRaw === "FLAT" ? DiscountType.FLAT : DiscountType.PERCENT,
      amount,
      usageLimit: usageLimit && usageLimit > 0 ? usageLimit : null,
      expiresAt,
      isActive,
    },
  });
  revalidatePath("/internal/admin");
}

export async function togglePromoCodeAction(formData: FormData) {
  await requireOwnerSession();
  const promoCodeId = String(formData.get("promoCodeId") ?? "");
  const isActive = String(formData.get("isActive") ?? "false") === "true";
  if (!promoCodeId) return;
  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { isActive },
  });
  revalidatePath("/internal/admin");
}
