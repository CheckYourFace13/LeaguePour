import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  resolvePrimaryVenueAccess,
  venueStaffCanCreateAndPublish,
  venueStaffCanEditCompetitionResults,
} from "@/lib/venue-permissions";
import { csvResponse, toCsv } from "@/lib/integrations/csv";
import { fileStem } from "@/lib/integrations/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CSV exports for one of the signed-in venue's competitions:
 *  - registrations: player names, emails and payment status (owners/managers only)
 *  - standings / results: no contact details (any staff who can enter results)
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await params;
  const access = await resolvePrimaryVenueAccess(await auth());
  if (!access) return new Response("Unauthorized", { status: 401 });

  const comp = await prisma.competition.findFirst({
    where: { id, venueId: access.venueId },
    select: { id: true, slug: true, title: true },
  });
  if (!comp) return new Response("Not found", { status: 404 });
  const stem = fileStem(comp.slug || comp.title);

  if (kind === "registrations") {
    if (!venueStaffCanCreateAndPublish(access.role)) {
      return new Response("Only owners and managers can export registrations.", { status: 403 });
    }
    const rows = await prisma.competitionRegistration.findMany({
      where: { competitionId: comp.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true, email: true } },
        team: { select: { name: true } },
        payment: { select: { status: true, amountCents: true, currency: true, paidAt: true } },
      },
    });
    return csvResponse(
      `${stem}-registrations.csv`,
      toCsv(
        ["Registered", "Name", "Email", "Team", "Status", "Payment", "Amount", "Currency", "Paid at", "Waiver accepted"],
        rows.map((r) => [
          r.createdAt,
          r.user.name,
          r.user.email,
          r.team?.name,
          r.status,
          r.payment?.status ?? "",
          r.payment ? (r.payment.amountCents / 100).toFixed(2) : "",
          r.payment?.currency ?? "",
          r.payment?.paidAt ?? null,
          r.waiverAcceptedAt ? "yes" : "no",
        ]),
      ),
    );
  }

  if (!venueStaffCanEditCompetitionResults(access.role)) {
    return new Response("Not allowed for your role.", { status: 403 });
  }

  if (kind === "standings") {
    const rows = await prisma.standing.findMany({
      where: { competitionId: comp.id },
      orderBy: [{ rank: "asc" }, { points: "desc" }],
      include: { team: { select: { name: true } } },
    });
    const soloIds = rows.filter((r) => !r.teamId && r.playerUserId).map((r) => r.playerUserId as string);
    const players = soloIds.length
      ? await prisma.user.findMany({ where: { id: { in: soloIds } }, select: { id: true, name: true } })
      : [];
    const playerName = new Map(players.map((p) => [p.id, p.name]));
    return csvResponse(
      `${stem}-standings.csv`,
      toCsv(
        ["Rank", "Team / player", "Points", "Wins", "Losses", "Ties"],
        rows.map((r) => [
          r.rank,
          r.team?.name ?? (r.playerUserId ? playerName.get(r.playerUserId) : null) ?? "",
          r.points,
          r.wins,
          r.losses,
          r.ties,
        ]),
      ),
    );
  }

  if (kind === "results") {
    const rows = await prisma.match.findMany({
      where: { competitionId: comp.id },
      orderBy: [{ round: "asc" }, { id: "asc" }],
      include: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } },
    });
    return csvResponse(
      `${stem}-results.csv`,
      toCsv(
        ["Round", "Label", "Home", "Away", "Home score", "Away score", "Completed"],
        rows.map((m) => [
          m.round,
          m.label,
          m.homeTeam?.name ?? (m.homeTeamId ? "" : "TBD / bye"),
          m.awayTeam?.name ?? (m.awayTeamId ? "" : "TBD / bye"),
          m.homeScore,
          m.awayScore,
          m.completedAt,
        ]),
      ),
    );
  }

  return new Response("Not found", { status: 404 });
}
