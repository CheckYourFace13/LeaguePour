"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BracketKind, CompetitionKind, CompetitionStatus, RegistrationFormat, ScheduleKind } from "@/generated/prisma/enums";
import { ACTIVE_COMPETITION_LIMITS_BY_PLAN } from "@/lib/pricing";
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
      title: `Copy | ${source.title}`,
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

function parseEnum<T extends string>(val: FormDataEntryValue | null, allowed: readonly T[], fallback: T): T {
  const s = val ? String(val) : "";
  return (allowed.includes(s as T) ? s : fallback) as T;
}

const editableKinds = Object.values(CompetitionKind);
const editableBrackets = Object.values(BracketKind);
const editableSchedules = Object.values(ScheduleKind);
const editableFormats = Object.values(RegistrationFormat);

// Statuses where changing core setup (dates, fees, format) is still safe - once a competition is
// running or finished, editing these fields out from under real registrations/results would
// corrupt state, so those need archive/cancel flows instead, not this form.
const EDITABLE_STATUSES: CompetitionStatus[] = [
  CompetitionStatus.DRAFT,
  CompetitionStatus.PUBLISHED,
  CompetitionStatus.SIGNUP_OPEN,
  CompetitionStatus.SIGNUP_CLOSED,
];

export async function updateCompetitionAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) {
    redirect(`/venue/competitions/${competitionId}?notice=read-only`);
  }

  const existing = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    select: { id: true, status: true, slug: true },
  });
  if (!existing) redirect("/venue/competitions");
  if (!EDITABLE_STATUSES.includes(existing.status)) {
    redirect(`/venue/competitions/${competitionId}?notice=not-editable`);
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/venue/competitions/${competitionId}/edit?error=title`);

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(title);
  if (slug !== existing.slug) {
    const taken = await prisma.competition.findUnique({
      where: { venueId_slug: { venueId: access.venueId, slug } },
    });
    if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
  }

  const kind = parseEnum(formData.get("kind"), editableKinds, CompetitionKind.CUSTOM);
  const description = String(formData.get("description") ?? "").trim() || "See public page for format and rules.";
  const signupOpenAt = new Date(String(formData.get("signupOpenAt")));
  const signupCloseAt = new Date(String(formData.get("signupCloseAt")));
  const startAt = new Date(String(formData.get("startAt")));
  const endAt = new Date(String(formData.get("endAt")));
  if ([signupOpenAt, signupCloseAt, startAt, endAt].some((d) => Number.isNaN(d.getTime()))) {
    redirect(`/venue/competitions/${competitionId}/edit?error=dates`);
  }

  const entryDollars = Number(String(formData.get("entryFee") ?? "0"));
  const entryFeeCents = Math.max(0, Math.round(entryDollars * 100));

  const teamFormat = parseEnum(formData.get("teamFormat"), editableFormats, RegistrationFormat.SOLO);
  const teamSizeRaw = String(formData.get("teamSize") ?? "").trim();
  const teamSize = teamSizeRaw ? Math.min(20, Math.max(1, Number(teamSizeRaw))) : null;
  const captainRequired = formData.get("captainRequired") === "on";
  const participantCapRaw = String(formData.get("participantCap") ?? "").trim();
  const participantCap = participantCapRaw ? Math.max(1, Number(participantCapRaw)) : null;
  const waitlistEnabled = formData.get("waitlistEnabled") === "on";
  const rules = String(formData.get("rules") ?? "").trim() || "House rules posted night-of.";
  const waiverText = String(formData.get("waiverText") ?? "").trim() || null;
  const scheduleKind = parseEnum(formData.get("scheduleKind"), editableSchedules, ScheduleKind.ONE_TIME);
  const bracketKind = parseEnum(formData.get("bracketKind"), editableBrackets, BracketKind.ROUND_ROBIN);
  const recurringRule = String(formData.get("recurringRule") ?? "").trim() || null;
  const prizeSummary = String(formData.get("prizeSummary") ?? "").trim() || "Prizes TBA";
  const payoutNotes = String(formData.get("payoutNotes") ?? "").trim() || null;

  const publish = formData.get("publishNow") === "on";
  // Never downgrade a competition that's already live back to draft just because the checkbox
  // was left unchecked while editing - publishing is one-way through this form. Once published,
  // status only moves forward via the real lifecycle (signup close, in-progress, completed).
  const status = existing.status === CompetitionStatus.DRAFT && !publish ? CompetitionStatus.DRAFT : publish ? CompetitionStatus.SIGNUP_OPEN : existing.status;

  // Same concurrent-active-events cap as creation (see new/actions.ts) - only enforced when
  // this edit would newly publish a still-draft competition, and only counts other
  // competitions (this one is excluded so re-saving an already-published event never
  // double-counts itself against its own limit).
  if (existing.status === CompetitionStatus.DRAFT && publish) {
    const venueForPlan = await prisma.venue.findUnique({
      where: { id: access.venueId },
      select: { billingPlan: true },
    });
    if (venueForPlan) {
      const activeCount = await prisma.competition.count({
        where: {
          venueId: access.venueId,
          id: { not: competitionId },
          status: {
            in: [
              CompetitionStatus.PUBLISHED,
              CompetitionStatus.SIGNUP_OPEN,
              CompetitionStatus.SIGNUP_CLOSED,
              CompetitionStatus.IN_PROGRESS,
            ],
          },
        },
      });
      const planLimit = ACTIVE_COMPETITION_LIMITS_BY_PLAN[venueForPlan.billingPlan];
      if (Number.isFinite(planLimit) && activeCount >= planLimit) {
        redirect(`/venue/competitions/${competitionId}/edit?error=upgrade-plan`);
      }
    }
  }

  await prisma.competition.update({
    where: { id: competitionId },
    data: {
      title,
      slug,
      kind,
      description,
      signupOpenAt,
      signupCloseAt,
      startAt,
      endAt,
      entryFeeCents,
      teamFormat,
      teamSize,
      captainRequired,
      participantCap,
      waitlistEnabled,
      rules,
      waiverText,
      scheduleKind,
      bracketKind,
      recurringRule,
      status,
      // Only set publishedAt the moment this specific edit actually publishes a still-draft
      // competition - never touch it on any other save (re-saving an already-published event
      // must not reset its original publish timestamp).
      ...(existing.status === CompetitionStatus.DRAFT && status !== CompetitionStatus.DRAFT
        ? { publishedAt: new Date() }
        : {}),
      prizeStructure: {
        upsert: {
          create: { summary: prizeSummary, payoutNotes },
          update: { summary: prizeSummary, payoutNotes },
        },
      },
    },
  });

  revalidatePath("/venue/competitions");
  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/dashboard");
  revalidatePath(`/c/${access.slug}/${slug}`);
  redirect(`/venue/competitions/${competitionId}?notice=saved`);
}

/**
 * Minimal, safe way for an organizer to actually create the first round of a bracket - nothing
 * in this app auto-generates matches, and there was previously no UI anywhere to create one at
 * all (only to score an existing one). Uses Match.label (free text) rather than requiring real
 * Team rows, since teams are otherwise only created as a side effect of a captain-led
 * registration - an organizer running a solo blind-draw night has no teams to pick from.
 */
export async function addMatchFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanEditCompetitionResults(access.role)) {
    redirect(`/venue/competitions/${competitionId}?notice=read-only`);
  }

  const ok = await assertVenueCompetition(competitionId, access.venueId);
  if (!ok) redirect("/venue/competitions");

  const round = Math.max(1, Number(String(formData.get("round") ?? "1")) || 1);
  const label = String(formData.get("label") ?? "").trim();
  if (!label) redirect(`/venue/competitions/${competitionId}?notice=match-label-required`);

  await prisma.match.create({
    data: { competitionId, round, label },
  });

  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/standings");
  redirect(`/venue/competitions/${competitionId}?notice=match-added`);
}

export async function deleteCompetitionAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) {
    redirect(`/venue/competitions/${competitionId}?notice=read-only`);
  }

  // Ownership check + only DRAFT is safe to hard-delete here - anything a player may have
  // registered/paid for or that has real match/standing history needs archive, not deletion.
  const existing = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    select: { id: true, status: true, title: true, _count: { select: { registrations: true } } },
  });
  if (!existing) redirect("/venue/competitions");
  if (existing.status !== CompetitionStatus.DRAFT || existing._count.registrations > 0) {
    redirect(`/venue/competitions/${competitionId}?notice=not-deletable`);
  }

  // Schema cascades (PrizeStructure, CompetitionRegistration, Team/TeamMember, Match, Standing
  // all onDelete: Cascade from Competition) clean up everything under it - a draft with zero
  // registrations has nothing else to worry about.
  await prisma.competition.delete({ where: { id: competitionId } });

  revalidatePath("/venue/competitions");
  revalidatePath("/venue/dashboard");
  redirect("/venue/competitions?notice=draft-deleted");
}
