import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Deletes ONLY the exact test records created during this session's live verification pass -
 * matched by exact venue name / exact email, never a pattern/prefix match, so this can never
 * touch real customer or prospect data. Defaults to a dry run (reports what it would delete);
 * pass ?confirm=1 to actually delete. Always requires CRON_SECRET.
 *
 * Relies on the schema's own onDelete: Cascade on every Venue-owned relation (VenueStaff,
 * VenueVsConfig -> PrivateEventLead/PrivateEvent/etc., Competition, ...) to clean up dependent
 * rows automatically - deleting the two test Venues removes everything under them. Users are a
 * separate root entity (VenueStaff cascades away, but the User row itself doesn't), so they're
 * deleted explicitly by exact email.
 */
const TEST_VENUE_NAMES = [
  "CLAUDE-TEST-VERIFY2-DELETE-ME",
  "CLAUDE-TEST-VS-DELETE-ME",
  "CLAUDE-TEST-MOBILE-DELETE-ME",
  "CLAUDE-TEST-MOBILE-VS-DELETE-ME",
  "CLAUDE-TEST-CONNECT-RETEST-DELETE-ME",
  "CLAUDE-TEST-CONNECT-E2E-DELETE-ME",
];
const TEST_USER_EMAILS = [
  "claude-test-verify2-delete-me@example.com",
  "claude-test-vs-delete-me@example.com",
  "claude-test-player-delete-me@example.com",
  "claude-test-mobile-delete-me@example.com",
  "claude-test-mobile-vs-delete-me@example.com",
  "claude-test-mobile-player-delete-me@example.com",
  "claude-test-connect-retest-delete-me@example.com",
  "claude-test-connect-e2e-delete-me@example.com",
  "claude-test-connect-player-delete-me@example.com",
];

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const confirm = url.searchParams.get("confirm") === "1";

  try {
    const venues = await prisma.venue.findMany({
      where: { name: { in: TEST_VENUE_NAMES } },
      select: {
        id: true,
        name: true,
        _count: { select: { staff: true, competitions: true, privateEventLeads: true, privateEvents: true } },
        competitions: {
          select: {
            registrations: { select: { paymentId: true }, where: { paymentId: { not: null } } },
          },
        },
      },
    });
    const users = await prisma.user.findMany({
      where: { email: { in: TEST_USER_EMAILS } },
      select: { id: true, email: true },
    });
    // Payment has no direct venue/competition FK - only CompetitionRegistration.paymentId points
    // to it (by design, so a Payment row always outlives the registration/venue/competition that
    // created it - see the Payment model's own schema comment). Cascading a venue/competition
    // delete removes the Registration row but would silently orphan the Payment it paid for, so
    // this captures those ids up front and deletes them explicitly after the cascade.
    const paymentIds = venues.flatMap((v) => v.competitions.flatMap((c) => c.registrations.map((r) => r.paymentId!)));

    if (!confirm) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        wouldDeleteVenues: venues.map((v) => ({
          name: v.name,
          staffRows: v._count.staff,
          competitions: v._count.competitions,
          privateEventLeads: v._count.privateEventLeads,
          privateEvents: v._count.privateEvents,
        })),
        wouldDeleteUserCount: users.length,
        wouldDeleteOrphanedPaymentCount: paymentIds.length,
        note: "Dry run only - pass ?confirm=1 to actually delete.",
      });
    }

    const venueIds = venues.map((v) => v.id);
    const userIds = users.map((u) => u.id);

    const deletedVenues = venueIds.length
      ? await prisma.venue.deleteMany({ where: { id: { in: venueIds } } })
      : { count: 0 };
    const deletedUsers = userIds.length
      ? await prisma.user.deleteMany({ where: { id: { in: userIds } } })
      : { count: 0 };
    const deletedPayments = paymentIds.length
      ? await prisma.payment.deleteMany({ where: { id: { in: paymentIds } } })
      : { count: 0 };

    return NextResponse.json({
      ok: true,
      dryRun: false,
      deletedVenues: deletedVenues.count,
      deletedUsers: deletedUsers.count,
      deletedOrphanedPayments: deletedPayments.count,
    });
  } catch (err) {
    console.error("[cleanup-test-data] failed", err);
    return NextResponse.json({ ok: false, error: "Cleanup failed." }, { status: 500 });
  }
}
