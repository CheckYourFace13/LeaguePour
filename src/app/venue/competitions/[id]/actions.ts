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
import {
  buildRoundRobinSchedule,
  buildSingleEliminationRound1,
  pairNextRound,
  type Participant,
} from "@/lib/tournament";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

/** Bracket kinds the engine can actually run end-to-end today. */
const RUNNABLE_BRACKET_KINDS: BracketKind[] = [BracketKind.SINGLE_ELIMINATION, BracketKind.ROUND_ROBIN];

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

/**
 * Resolves the real, registered "entrants" a bracket/schedule should be built from - reusing the
 * existing Team model as the generic bracket-entrant record rather than inventing new schema.
 * SOLO competitions have no Team rows at all today (teams are otherwise only ever created as a
 * side effect of a captain registering), so a solo entrant's Team row is created here, lazily and
 * idempotently, the first time a tournament is started - safe to call more than once, it never
 * creates a duplicate for the same registrant.
 */
async function resolveTournamentParticipants(
  competitionId: string,
  teamFormat: RegistrationFormat,
): Promise<Participant[]> {
  const registrations = await prisma.competitionRegistration.findMany({
    where: { competitionId, status: "CONFIRMED" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (teamFormat === RegistrationFormat.SOLO) {
    const participants: Participant[] = [];
    for (const reg of registrations) {
      let team = await prisma.team.findFirst({
        where: { competitionId, captainUserId: reg.userId },
        select: { id: true, name: true },
      });
      if (!team) {
        team = await prisma.team.create({
          data: {
            competitionId,
            captainUserId: reg.userId,
            name: reg.user.name?.trim() || reg.user.email,
          },
          select: { id: true, name: true },
        });
      }
      participants.push({ id: team.id, name: team.name });
    }
    return participants;
  }

  // CAPTAIN_TEAM / TEAM_MEMBERS - one entrant per distinct team, ordered by that team's earliest
  // registration. A registration with no team yet (mid-signup) isn't a real entrant yet.
  const seen = new Set<string>();
  const participants: Participant[] = [];
  for (const reg of registrations) {
    if (!reg.team || seen.has(reg.team.id)) continue;
    seen.add(reg.team.id);
    participants.push({ id: reg.team.id, name: reg.team.name });
  }
  return participants;
}

/**
 * Recomputes every Standing row for a round-robin competition from scratch off the current Match
 * results - idempotent (safe to call after every score save) rather than incrementing, so
 * correcting a score never double-counts. Win = 3 pts, tie = 1 pt, standard round-robin scoring.
 */
async function recomputeRoundRobinStandings(competitionId: string, participants: Participant[]) {
  const matches = await prisma.match.findMany({
    where: { competitionId },
    select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, completedAt: true },
  });

  const stats = new Map(participants.map((p) => [p.id, { wins: 0, losses: 0, ties: 0, points: 0 }]));
  for (const m of matches) {
    if (!m.completedAt || m.homeScore == null || m.awayScore == null || !m.homeTeamId || !m.awayTeamId) continue;
    const home = stats.get(m.homeTeamId);
    const away = stats.get(m.awayTeamId);
    if (!home || !away) continue;
    if (m.homeScore > m.awayScore) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (m.homeScore < m.awayScore) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.ties++;
      away.ties++;
      home.points += 1;
      away.points += 1;
    }
  }

  const ranked = [...participants].sort((a, b) => {
    const sa = stats.get(a.id)!;
    const sb = stats.get(b.id)!;
    return sb.points - sa.points || sb.wins - sa.wins;
  });

  for (let i = 0; i < ranked.length; i++) {
    const p = ranked[i];
    const s = stats.get(p.id)!;
    const existing = await prisma.standing.findFirst({ where: { competitionId, teamId: p.id } });
    const data = { wins: s.wins, losses: s.losses, ties: s.ties, points: s.points, rank: i + 1 };
    if (existing) {
      await prisma.standing.update({ where: { id: existing.id }, data });
    } else {
      await prisma.standing.create({ data: { competitionId, teamId: p.id, ...data } });
    }
  }

  return matches;
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
    include: { competition: { select: { bracketKind: true } } },
  });
  if (!match) redirect(`/venue/competitions/${competitionId}`);

  // A single-elimination match has to produce a winner - advanceRoundFormAction breaks a tie by
  // silently crediting the away side (homeScore > awayScore is false on a tie), with no signal to
  // the organizer that's what happened. Found live: the form has no client- or server-side
  // objection to saving a 5-5 match today. Reject it here instead, before it's ever saved, so the
  // organizer is prompted to resolve the tie (overtime, sudden death, whatever the house rule is)
  // the same moment they'd notice it in real life, rather than discovering an unexplained
  // "wrong" winner after advancing.
  if (
    match.competition.bracketKind === BracketKind.SINGLE_ELIMINATION &&
    match.awayTeamId !== null &&
    parsed.data.homeScore === parsed.data.awayScore
  ) {
    redirect(`/venue/competitions/${competitionId}?notice=elimination-tie`);
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      completedAt: new Date(),
    },
  });

  // Round robin has no separate "advance" step - the full schedule already exists, so standings
  // recompute automatically off every score save, and the tournament completes itself the moment
  // every scheduled match has a result.
  const comp = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { bracketKind: true, teamFormat: true, status: true },
  });
  if (comp?.bracketKind === BracketKind.ROUND_ROBIN && comp.status === CompetitionStatus.IN_PROGRESS) {
    const participants = await resolveTournamentParticipants(competitionId, comp.teamFormat);
    const allMatches = await recomputeRoundRobinStandings(competitionId, participants);
    const allComplete = allMatches.length > 0 && allMatches.every((m) => m.completedAt);
    if (allComplete) {
      await prisma.competition.update({ where: { id: competitionId }, data: { status: CompetitionStatus.COMPLETED } });
    }
  }

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

export async function closeSignupFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect(`/venue/competitions/${competitionId}?notice=read-only`);

  const existing = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    select: { id: true, status: true },
  });
  if (!existing) redirect("/venue/competitions");
  if (existing.status !== CompetitionStatus.SIGNUP_OPEN) {
    redirect(`/venue/competitions/${competitionId}?notice=cannot-close-signup`);
  }

  await prisma.competition.update({ where: { id: competitionId }, data: { status: CompetitionStatus.SIGNUP_CLOSED } });
  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/competitions");
  redirect(`/venue/competitions/${competitionId}?notice=signup-closed`);
}

/**
 * The actual "generate the bracket" action the product never had. Ownership + role checked,
 * rejects anything that isn't SIGNUP_OPEN/SIGNUP_CLOSED, rejects unsupported bracket kinds, and -
 * critically - rejects outright if any Match already exists for this competition, so a duplicate
 * click (or a resubmitted form) can never generate a second, duplicate Round 1.
 */
export async function startTournamentFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect(`/venue/competitions/${competitionId}?notice=read-only`);

  const existing = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    select: { id: true, status: true, bracketKind: true, teamFormat: true, _count: { select: { matches: true } } },
  });
  if (!existing) redirect("/venue/competitions");
  if (existing.status !== CompetitionStatus.SIGNUP_OPEN && existing.status !== CompetitionStatus.SIGNUP_CLOSED) {
    redirect(`/venue/competitions/${competitionId}?notice=cannot-start`);
  }
  if (!RUNNABLE_BRACKET_KINDS.includes(existing.bracketKind)) {
    redirect(`/venue/competitions/${competitionId}?notice=format-not-supported`);
  }
  if (existing._count.matches > 0) {
    redirect(`/venue/competitions/${competitionId}?notice=already-started`);
  }

  const participants = await resolveTournamentParticipants(competitionId, existing.teamFormat);
  if (participants.length < 2) {
    redirect(`/venue/competitions/${competitionId}?notice=not-enough-participants`);
  }

  if (existing.bracketKind === BracketKind.SINGLE_ELIMINATION) {
    const { pairings } = buildSingleEliminationRound1(participants);
    // Created one at a time (not Promise.all) so insertion order - and therefore bracket slot
    // order recovered later by sorting on id (cuids are chronologically sortable) - is preserved.
    for (const pairing of pairings) {
      const isBye = pairing.away === null;
      await prisma.match.create({
        data: {
          competitionId,
          round: 1,
          homeTeamId: pairing.home.id,
          awayTeamId: pairing.away?.id ?? null,
          label: isBye ? `${pairing.home.name} - first-round bye, advances automatically` : null,
          homeScore: isBye ? 1 : null,
          awayScore: isBye ? 0 : null,
          completedAt: isBye ? new Date() : null,
        },
      });
    }
  } else {
    const { rounds } = buildRoundRobinSchedule(participants);
    for (let r = 0; r < rounds.length; r++) {
      for (const m of rounds[r]) {
        await prisma.match.create({
          data: { competitionId, round: r + 1, homeTeamId: m.home.id, awayTeamId: m.away.id },
        });
      }
    }
    // Seed every entrant onto the standings board at 0-0-0 immediately, so the board isn't empty
    // before the first result comes in.
    for (const p of participants) {
      const already = await prisma.standing.findFirst({ where: { competitionId, teamId: p.id } });
      if (!already) {
        await prisma.standing.create({ data: { competitionId, teamId: p.id, wins: 0, losses: 0, ties: 0, points: 0 } });
      }
    }
  }

  await prisma.competition.update({ where: { id: competitionId }, data: { status: CompetitionStatus.IN_PROGRESS } });

  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/competitions");
  revalidatePath("/venue/standings");
  redirect(`/venue/competitions/${competitionId}?notice=tournament-started`);
}

/**
 * Single-elimination only. Requires every match in the current round to be complete and refuses
 * to run if the next round already exists (blocks accidental double-advance/duplication). If the
 * round just finished was the final (exactly one match), declares the winner and completes the
 * competition instead of generating another round.
 */
export async function advanceRoundFormAction(formData: FormData) {
  const competitionId = String(formData.get("competitionId") ?? "");
  if (!competitionId) redirect("/venue/competitions");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanEditCompetitionResults(access.role)) redirect(`/venue/competitions/${competitionId}?notice=read-only`);

  const existing = await prisma.competition.findFirst({
    where: { id: competitionId, venueId: access.venueId },
    select: { id: true, status: true, bracketKind: true },
  });
  if (!existing) redirect("/venue/competitions");
  if (existing.status !== CompetitionStatus.IN_PROGRESS || existing.bracketKind !== BracketKind.SINGLE_ELIMINATION) {
    redirect(`/venue/competitions/${competitionId}?notice=cannot-advance`);
  }

  const allMatches = await prisma.match.findMany({
    where: { competitionId },
    orderBy: [{ round: "asc" }, { id: "asc" }],
    include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } },
  });
  if (allMatches.length === 0) redirect(`/venue/competitions/${competitionId}?notice=not-started`);

  const currentRound = Math.max(...allMatches.map((m) => m.round));
  const currentRoundMatches = allMatches.filter((m) => m.round === currentRound);
  const nextRoundExists = allMatches.some((m) => m.round === currentRound + 1);
  if (nextRoundExists) redirect(`/venue/competitions/${competitionId}?notice=already-advanced`);

  const incomplete = currentRoundMatches.some((m) => !m.completedAt || m.homeScore == null || m.awayScore == null);
  if (incomplete) redirect(`/venue/competitions/${competitionId}?notice=round-not-complete`);

  const winners: Participant[] = currentRoundMatches.map((m) => {
    const homeWins = m.awayTeamId === null || (m.homeScore ?? 0) > (m.awayScore ?? 0);
    const winnerTeam = homeWins ? m.homeTeam : m.awayTeam;
    return { id: winnerTeam!.id, name: winnerTeam!.name };
  });

  if (currentRoundMatches.length === 1) {
    const champion = winners[0];
    const finalMatch = currentRoundMatches[0];
    const runnerUpTeam = finalMatch.homeTeamId === champion.id ? finalMatch.awayTeam : finalMatch.homeTeam;

    const upsertRank = async (teamId: string, rank: number) => {
      const row = await prisma.standing.findFirst({ where: { competitionId, teamId } });
      if (row) await prisma.standing.update({ where: { id: row.id }, data: { rank } });
      else await prisma.standing.create({ data: { competitionId, teamId, rank, wins: rank === 1 ? 1 : 0 } });
    };
    await upsertRank(champion.id, 1);
    if (runnerUpTeam) await upsertRank(runnerUpTeam.id, 2);

    await prisma.competition.update({ where: { id: competitionId }, data: { status: CompetitionStatus.COMPLETED } });
    revalidatePath(`/venue/competitions/${competitionId}`);
    revalidatePath("/venue/standings");
    redirect(`/venue/competitions/${competitionId}?notice=tournament-completed`);
  }

  const nextPairings = pairNextRound(winners);
  for (const pairing of nextPairings) {
    await prisma.match.create({
      data: {
        competitionId,
        round: currentRound + 1,
        homeTeamId: pairing.home.id,
        awayTeamId: pairing.away?.id ?? null,
      },
    });
  }

  revalidatePath(`/venue/competitions/${competitionId}`);
  revalidatePath("/venue/standings");
  redirect(`/venue/competitions/${competitionId}?notice=round-advanced`);
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
