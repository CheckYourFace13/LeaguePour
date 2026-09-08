import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  BracketKind,
  CompetitionKind,
  CompetitionStatus,
  RegistrationFormat,
  ScheduleKind,
  StaffRole,
} from "@/generated/prisma/enums";

export const runtime = "nodejs";

/**
 * Test-only scaffolding for the tournament-engine P0: creates one disposable venue + owner
 * account + N disposable player accounts, already CONFIRMED-registered into one disposable
 * competition, so the actual tournament engine (start/score/advance - the part that actually
 * needs proving) can be exercised for real through the normal venue UI instead of clicking
 * through N public Stripe-checkout signups by hand (that flow was already verified separately).
 * Every created row is added to cleanup-test-data's exact-match allowlists and torn down the same
 * way as everything else this engagement - see that route for the deletion mechanics.
 *
 * Idempotent by (venue name, player index): re-running with the same `venue` name reuses the
 * existing venue/competition and only creates whatever players/registrations are still missing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const venueName = url.searchParams.get("venue");
  const players = Math.max(2, Math.min(32, Number(url.searchParams.get("players") ?? "8")));
  const bracketKind = (url.searchParams.get("bracketKind") ?? "SINGLE_ELIMINATION") as BracketKind;
  const kind = (url.searchParams.get("kind") ?? "TRIVIA") as CompetitionKind;
  const teamFormat = (url.searchParams.get("teamFormat") ?? "SOLO") as RegistrationFormat;
  const title = url.searchParams.get("title") ?? "Test tournament";
  if (!venueName) return NextResponse.json({ ok: false, error: "?venue= is required" }, { status: 400 });
  if (!Object.values(BracketKind).includes(bracketKind)) {
    return NextResponse.json({ ok: false, error: "invalid bracketKind" }, { status: 400 });
  }

  try {
    const slugBase = venueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 40);
    const ownerEmail = `${slugBase}-owner@example.com`;
    const testPassword = "TestPass123!";
    const passwordHash = await bcrypt.hash(testPassword, 10);

    let venue = await prisma.venue.findFirst({ where: { name: venueName } });
    if (!venue) {
      const owner = await prisma.user.upsert({
        where: { email: ownerEmail },
        update: { passwordHash },
        create: { email: ownerEmail, name: "Test Owner", passwordHash },
      });
      venue = await prisma.venue.create({
        data: {
          name: venueName,
          slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
          venueType: "bar",
          description: "Disposable test venue - tournament engine verification.",
          billingPlan: "STARTER",
          staff: { create: { userId: owner.id, role: StaffRole.OWNER } },
        },
      });
    }

    const playerUsers: { id: string; email: string }[] = [];
    for (let i = 1; i <= players; i++) {
      const email = `${slugBase}-player${i}@example.com`;
      const u = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: `Player ${i}`, passwordHash: await bcrypt.hash(testPassword, 10) },
      });
      playerUsers.push({ id: u.id, email: u.email });
    }

    const compSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 40);
    let competition = await prisma.competition.findFirst({ where: { venueId: venue.id, title } });
    if (!competition) {
      const now = new Date();
      competition = await prisma.competition.create({
        data: {
          venueId: venue.id,
          title,
          slug: compSlug,
          kind,
          description: "Disposable test competition - tournament engine verification.",
          signupOpenAt: new Date(now.getTime() - 60 * 60 * 1000),
          signupCloseAt: new Date(now.getTime() + 60 * 60 * 1000),
          startAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          endAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          teamFormat,
          rules: "Test rules.",
          scheduleKind: ScheduleKind.ONE_TIME,
          bracketKind,
          status: CompetitionStatus.SIGNUP_OPEN,
          publishedAt: now,
        },
      });
    }

    let createdRegistrations = 0;
    if (teamFormat === RegistrationFormat.SOLO) {
      for (const p of playerUsers) {
        const existing = await prisma.competitionRegistration.findFirst({
          where: { competitionId: competition.id, userId: p.id },
        });
        if (!existing) {
          await prisma.competitionRegistration.create({
            data: { competitionId: competition.id, userId: p.id, status: "CONFIRMED" },
          });
          createdRegistrations++;
        }
      }
    } else {
      // CAPTAIN_TEAM / TEAM_MEMBERS - one team per player, captained by that player, so each
      // player is its own single-member "team" and the tournament still has `players` entrants.
      for (const p of playerUsers) {
        let team = await prisma.team.findFirst({ where: { competitionId: competition.id, captainUserId: p.id } });
        if (!team) {
          team = await prisma.team.create({
            data: { competitionId: competition.id, captainUserId: p.id, name: `Team ${p.email.split("@")[0]}` },
          });
        }
        const existing = await prisma.competitionRegistration.findFirst({
          where: { competitionId: competition.id, userId: p.id },
        });
        if (!existing) {
          await prisma.competitionRegistration.create({
            data: { competitionId: competition.id, userId: p.id, status: "CONFIRMED", teamId: team.id },
          });
          createdRegistrations++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      venueId: venue.id,
      venueName: venue.name,
      venueSlug: venue.slug,
      ownerEmail,
      ownerLoginPassword: testPassword,
      competitionId: competition.id,
      competitionTitle: competition.title,
      competitionStatus: competition.status,
      playersRequested: players,
      registrationsCreatedThisRun: createdRegistrations,
    });
  } catch (err) {
    console.error("[seed-tournament-test] failed", err);
    return NextResponse.json(
      { ok: false, error: "Seeding failed.", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
