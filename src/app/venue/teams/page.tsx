import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function TeamsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");

  const teams = await prisma.team.findMany({
    where: { competition: { venueId: access.venueId } },
    include: {
      competition: { select: { title: true } },
      captain: { select: { name: true, email: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Teams / players</h1>
        <p className="mt-2 text-lp-muted">Rosters, captains, and invite codes per competition.</p>
      </div>
      <FieldHelp title="Roster codes">
        <p>
          When a captain registers, LeaguePour generates a team invite code in the database. Member-claim flows are not
          wired yet — use the roster list here for check-in until invites ship.
        </p>
      </FieldHelp>
      <div className="grid gap-4 md:grid-cols-2">
        {teams.length === 0 ? (
          <Card>
            <p className="text-sm text-lp-muted">No teams yet — publish a captain-led competition.</p>
          </Card>
        ) : (
          teams.map((t) => (
            <Card key={t.id}>
              <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">{t.competition.title}</p>
              <p className="mt-2 font-display text-lg font-semibold">{t.name}</p>
              <p className="mt-1 text-sm text-lp-muted">
                Captain {t.captain.name ?? t.captain.email} · {t._count.members} members
              </p>
              {t.inviteCode ? (
                <p className="mt-3 rounded-lg border border-lp-border bg-lp-bg/60 px-3 py-2 text-xs font-mono text-lp-accent">
                  Code {t.inviteCode}
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
