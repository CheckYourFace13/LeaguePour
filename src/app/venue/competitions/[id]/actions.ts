"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CompetitionStatus } from "@/generated/prisma/enums";
import {
  resolvePrimaryVenueAccess,
  venueStaffCanCreateAndPublish,
  venueStaffCanEditCompetitionResults,
} from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const scoresSchema = z.object({
  homeScore: z.coerce.number().int().min(0).max(999),
  awayScore: z.coerce.number().int().min(0).max(999),
});

const standingSchema = z.object({
  wins: z.coerce.number().int().min(0).max(99),
  losses: z.coerce.number().int().min(0).max(99),
  ties: z.coerce.number().int().min(0).max(99),
  points: z.coerce.number().min(0).max(99999),
});

async function assertVenueCompetition(competitionId: string, venueId: string) {
  const comp = await prisma.competition.findFirst({
    where: { id: competitionId, venueId },
    select: { id: true },
  });
  return Boolean(comp);
}

export async function updateMatchScoreFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  if (!competitionId || !matchId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanEditCompetitionResults(access.role)) redirect(`/venue/competitions/${competitionId}?notice=read-only`);
  if (!(await assertVenueCompetition(competitionId, access.venueId))) redirect("/venue/competitions");

  const parsed = scoresSchema.safeParse({
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
  });
  if (!parsed.success) redirect(`/venue/competitions/${competitionId}?notice=invalid-scores`);

  const match = await prisma.match.findFirst({
    where: { id: matchId, competitionId, competition: { venueId: access.venueId } },
  });
  if (!match) redirect(`/venue/competitions/${competitionId}`);

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/standings");
  redirect(`/venue/competitions/${competitionId}?notice=match-saved`);
}

export async function updateStandingRowFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  const standingId = String(formData.get("standingId") ?? "");
  if (!competitionId || !standingId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanEditCompetitionResults(access.role)) redirect(`/venue/competitions/${competitionId}?notice=read-only`);
  if (!(await assertVenueCompetition(competitionId, access.venueId))) redirect("/venue/competitions");

  const parsed = standingSchema.safeParse({
    wins: formData.get("wins"),
    losses: formData.get("losses"),
    ties: formData.get("ties"),
    points: formData.get("points"),
  });
  if (!parsed.success) redirect(`/venue/competitions/${competitionId}?notice=invalid-standing`);

  const row = await prisma.standing.findFirst({
    where: { id: standingId, competitionId, competition: { venueId: access.venueId } },
  });
  if (!row) redirect(`/venue/competitions/${competitionId}`);

  await prisma.standing.update({
    where: { id: standingId },
    data: {
      wins: parsed.data.wins,
      losses: parsed.data.losses,
      ties: parsed.data.ties,
      points: parsed.data.points,
    },
  });

  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/standings");
  redirect(`/venue/competitions/${competitionId}?notice=standing-saved`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

export async function duplicateCompetitionFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role))
    redirect(`/venue/competitions/${competitionId}?notice=read-only`);

  const source = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    include: { prizeStructure: true },
  });
  if (!source) redirect("/venue/competitions");

  const baseSlug = slugify(`${source.slug}-copy`);
  let slug = `${baseSlug}-${Math.random().toString(36).slice(2, 5)}`;
  const taken = await prisma.competition.findUnique({
    where: { venueId_slug: { venueId: access.venueId, slug } },
  });
  if (taken) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  const now = new Date();
  const addDays = (days: number) => {
    const x = new Date(now);
    x.setUTCDate(x.getUTCDate() + days);
    return x;
  };

  const signupOpenAt = now;
  const signupCloseAt = addDays(14);
  const startAt = addDays(21);
  const endAt = addDays(21);
  endAt.setUTCHours(endAt.getUTCHours() + 5);

  const copy = await prisma.competition.create({
    data: {
      venueId: access.venueId,
      title: `Copy · ${source.title}`,
      slug,
      kind: source.kind,
      description: source.description,
      signupOpenAt,
      signupCloseAt,
      startAt,
      endAt,
      entryFeeCents: source.entryFeeCents,
      entryFeeCurrency: source.entryFeeCurrency,
      teamFormat: source.teamFormat,
      teamSize: source.teamSize,
      captainRequired: source.captainRequired,
      participantCap: source.participantCap,
      waitlistEnabled: source.waitlistEnabled,
      rules: source.rules,
      waiverText: source.waiverText,
      scheduleKind: source.scheduleKind,
      bracketKind: source.bracketKind,
      recurringRule: source.recurringRule,
      status: CompetitionStatus.DRAFT,
      publishedAt: null,
      prizeStructure: source.prizeStructure
        ? {
            create: {
              summary: source.prizeStructure.summary,
              tiers: source.prizeStructure.tiers ?? undefined,
              payoutNotes: source.prizeStructure.payoutNotes ?? undefined,
            },
          }
        : undefined,
    },
  });

  revalidatePath("/venue/competitions");
  revalidatePath("/venue/dashboard");
  redirect(`/venue/competitions/${copy.id}?notice=duplicated`);
}
