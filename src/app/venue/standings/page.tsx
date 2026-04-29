import Link from "next/link";
import { auth } from "@/auth";
import { BracketPreview } from "@/components/app/bracket-preview";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function StandingsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const canCreateCompetition = venueStaffCanCreateAndPublish(access.role);

  const competitions = await prisma.competition.findMany({
    where: { venueId: access.venueId },
    include: {
      matches: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        include: { homeTeam: true, awayTeam: true },
      },
      standings: {
        orderBy: [{ rank: "asc" }, { points: "desc" }],
        include: { team: { select: { name: true } } },
      },
    },
    orderBy: { startAt: "desc" },
  });

  const elimKinds = ["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Standings / brackets</h1>
        <p className="mt-2 text-lp-muted">Leaderboards and bracket cards — edit scores from each competition next.</p>
      </div>
      <FieldHelp title="Manual score entry">
        <p>
          Record winners as you go. Bracket view pulls from matches; standings table is great for round robin and season
          points.
        </p>
      </FieldHelp>

      {competitions.length === 0 ? (
        <EmptyState
          title="No competitions yet"
          description="Create a competition to generate standings and bracket rows."
          action={
            canCreateCompetition ? (
              <Link
                href={venueAppRoutes.createCompetition}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-lp-accent px-5 text-sm font-semibold text-white hover:brightness-110"
              >
                Create competition
              </Link>
            ) : (
              <Link
                href={venueAppRoutes.dashboard}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-lp-border px-5 text-sm font-semibold text-lp-text hover:bg-white/[0.04]"
              >
                Back to dashboard
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-10">
          {competitions.map((c) => {
            const bracketMatches = c.matches
              .filter((m) => m.homeTeam && m.awayTeam)
              .map((m) => ({
                id: m.id,
                label: m.label,
                homeName: m.homeTeam!.name,
                awayName: m.awayTeam!.name,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                completed: Boolean(m.completedAt),
              }));

            return (
              <section key={c.id} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold">{c.title}</h2>
                    <p className="text-xs text-lp-muted">
                      {c.bracketKind.replaceAll("_", " ")} · {c.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Link
                    href={`${venueAppRoutes.competitions}/${c.id}`}
                    className="text-sm font-semibold text-lp-accent hover:underline"
                  >
                    Manage competition
                  </Link>
                </div>

                {elimKinds.includes(c.bracketKind) && bracketMatches.length > 0 ? (
                  <BracketPreview title="Bracket (from matches)" matches={bracketMatches} />
                ) : null}

                {c.standings.length > 0 ? (
                  <Card className="p-0">
                    <div className="border-b border-lp-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-lp-muted">
                      Standings
                    </div>
                    <ul className="divide-y divide-lp-border">
                      {c.standings.map((s) => (
                        <li key={s.id} className="flex items-center justify-between px-4 py-3 md:px-5">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{s.team?.name ?? "Solo / TBD"}</p>
                          </div>
                          <div className="shrink-0 text-right text-sm tabular-nums">
                            <p className="font-semibold">#{s.rank ?? "—"}</p>
                            <p className="text-lp-muted">
                              {s.wins}W · {s.losses}L · {s.points} pts
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <Card className="p-5">
                    <p className="text-sm text-lp-muted">No standings rows for this event yet.</p>
                  </Card>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
