import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function AudiencePage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");

  const tags = await prisma.audienceTag.findMany({
    where: { venueId: access.venueId },
    include: { user: { select: { name: true, email: true } } },
  });

  const regs = await prisma.competitionRegistration.findMany({
    where: { competition: { venueId: access.venueId } },
    select: {
      userId: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const seenUsers = new Set<string>();
  const recentPlayers = regs.filter((r) => {
    if (seenUsers.has(r.userId)) return false;
    seenUsers.add(r.userId);
    return true;
  }).slice(0, 30);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Audience / CRM</h1>
        <p className="mt-2 text-lp-muted">Participants, tags, and who is eligible to hear from you.</p>
      </div>
      <FieldHelp title="Communication eligibility">
        <p>
          Players must opt in. Tags like “repeat darts” help you segment without stalking — combine
          with event type filters when you launch the next blind draw.
        </p>
      </FieldHelp>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Tags</h2>
          <ul className="mt-4 space-y-3">
            {tags.length === 0 ? (
              <Card>
                <p className="text-sm text-lp-muted">No tags yet.</p>
              </Card>
            ) : (
              tags.map((t) => (
                <Card key={t.id}>
                  <p className="font-medium">{t.user.name ?? t.user.email}</p>
                  <Badge className="mt-2" variant="accent">
                    {t.tag}
                  </Badge>
                </Card>
              ))
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Recent players</h2>
          <p className="mt-1 text-sm text-lp-muted">Unique players by latest signup at this venue.</p>
          <ul className="mt-4 space-y-3">
            {recentPlayers.length === 0 ? (
              <Card>
                <p className="text-sm text-lp-muted">No registrations yet.</p>
              </Card>
            ) : (
              recentPlayers.map((r) => (
                <Card key={r.userId}>
                  <p className="font-medium">{r.user.name ?? "Player"}</p>
                  <p className="text-sm text-lp-muted">{r.user.email}</p>
                  <p className="mt-2 text-sm text-lp-muted">Last reg {formatDate(r.createdAt)}</p>
                </Card>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
