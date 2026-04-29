"use server";

import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  PaymentStatus,
  RegistrationFormat,
  RegistrationStatus,
} from "@/generated/prisma/enums";
import { CAP_COUNT_STATUSES } from "@/lib/registration-cap";
import { revalidatePath } from "next/cache";

export type RegistrationResult =
  | { ok: true; flow: "confirmed" }
  | { ok: true; flow: "pay"; registrationId: string }
  | {
      ok: false;
      error: "auth" | "profile" | "closed" | "full" | "exists" | "waiver" | "team_name" | "unknown";
    };

export async function submitCompetitionRegistration(
  competitionId: string,
  venueSlug: string,
  competitionSlug: string,
  form: { waiverAccepted: boolean; teamName?: string },
): Promise<RegistrationResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "auth" };
  if (!session.hasPlayerProfile) return { ok: false, error: "profile" };
  if (!form.waiverAccepted) return { ok: false, error: "waiver" };

  const comp = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      _count: {
        select: {
          registrations: { where: { status: { in: CAP_COUNT_STATUSES } } },
        },
      },
    },
  });
  if (!comp) return { ok: false, error: "unknown" };

  const open = comp.status === "SIGNUP_OPEN" || comp.status === "PUBLISHED";
  if (!open || comp.signupCloseAt < new Date()) return { ok: false, error: "closed" };

  if (comp.participantCap != null && comp._count.registrations >= comp.participantCap) {
    return { ok: false, error: "full" };
  }

  const existing = await prisma.competitionRegistration.findFirst({
    where: { competitionId, userId: session.user.id },
  });
  if (existing) return { ok: false, error: "exists" };

  const uid = session.user.id;
  const needsPay = comp.entryFeeCents > 0;
  const regStatus = needsPay ? RegistrationStatus.PENDING_PAYMENT : RegistrationStatus.CONFIRMED;

  if (comp.teamFormat === RegistrationFormat.SOLO) {
    const reg = await prisma.$transaction(async (tx) => {
      let paymentId: string | undefined;
      if (needsPay) {
        const pay = await tx.payment.create({
          data: {
            amountCents: comp.entryFeeCents,
            currency: comp.entryFeeCurrency,
            status: PaymentStatus.PENDING,
            provider: "stripe",
            externalRef: `reg_pending:${competitionId}:${uid}`,
          },
        });
        paymentId = pay.id;
      }
      return tx.competitionRegistration.create({
        data: {
          competitionId,
          userId: uid,
          status: regStatus,
          roleLabel: "Solo",
          waiverAcceptedAt: new Date(),
          paymentId: paymentId ?? undefined,
        },
      });
    });
    revalidatePath(`/c/${venueSlug}/${competitionSlug}`);
    revalidatePath("/player/dashboard");
    revalidatePath("/player/competitions");
    revalidatePath("/venue/dashboard");
    revalidatePath("/venue/registrations");
    if (needsPay) return { ok: true, flow: "pay", registrationId: reg.id };
    return { ok: true, flow: "confirmed" };
  }

  const name = (form.teamName ?? "").trim();
  if (!name) return { ok: false, error: "team_name" };

  const reg = await prisma.$transaction(async (tx) => {
    let inviteCode = "";
    for (let i = 0; i < 8; i++) {
      inviteCode = randomBytes(4).toString("hex").toUpperCase();
      const clash = await tx.team.findUnique({ where: { inviteCode } });
      if (!clash) break;
    }
    const team = await tx.team.create({
      data: {
        competitionId,
        name,
        captainUserId: uid,
        inviteCode,
      },
    });
    await tx.teamMember.create({
      data: { teamId: team.id, userId: uid },
    });
    let paymentId: string | undefined;
    if (needsPay) {
      const pay = await tx.payment.create({
        data: {
          amountCents: comp.entryFeeCents,
          currency: comp.entryFeeCurrency,
          status: PaymentStatus.PENDING,
          provider: "stripe",
          externalRef: `reg_pending:${competitionId}:${uid}`,
        },
      });
      paymentId = pay.id;
    }
    return tx.competitionRegistration.create({
      data: {
        competitionId,
        userId: uid,
        status: regStatus,
        roleLabel: "Captain",
        teamId: team.id,
        waiverAcceptedAt: new Date(),
        paymentId: paymentId ?? undefined,
      },
    });
  });

  revalidatePath(`/c/${venueSlug}/${competitionSlug}`);
  revalidatePath("/player/dashboard");
  revalidatePath("/player/competitions");
  revalidatePath("/venue/dashboard");
  revalidatePath("/venue/registrations");
  if (needsPay) return { ok: true, flow: "pay", registrationId: reg.id };
  return { ok: true, flow: "confirmed" };
}
