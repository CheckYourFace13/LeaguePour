import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { CampaignStatus } from "@/generated/prisma/enums";
import { campaignAudienceSummary } from "@/lib/campaign-audience-meta";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function MarketingPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const canCreate = venueStaffCanCreateAndPublish(access.role);

  const drafts = await prisma.messageCampaign.findMany({
    where: { venueId: access.venueId, status: CampaignStatus.DRAFT },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { competition: { select: { title: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Marketing</h1>
        <p className="mt-2 text-lp-muted">Drafts, audiences, consent-first sends.</p>
      </div>
      <FieldHelp title="Drafts & sends" example="Build here, send from Messages — in-app delivery until ESP/SMS is connected.">
        <p>
          Tie each send to followers, a competition’s confirmed players, or a saved CRM tag. Edit copy anytime before
          send.
        </p>
      </FieldHelp>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {canCreate ? (
          <Button asChild size="lg">
            <Link href={venueAppRoutes.campaignsNew}>New campaign draft</Link>
          </Button>
        ) : null}
        <Button asChild size="lg" variant="secondary">
          <Link href={venueAppRoutes.messages}>Open messages</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href={venueAppRoutes.audience}>View audience</Link>
        </Button>
      </div>
      {drafts.length === 0 ? (
        <EmptyState
          title="No draft campaigns"
          description="Create a draft with a goal template, audience, and channel. Nothing is delivered to a real ESP or carrier until integrations ship."
          action={
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {canCreate ? (
                <Button asChild size="lg">
                  <Link href={venueAppRoutes.campaignsNew}>New campaign draft</Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary" size="lg">
                <Link href={venueAppRoutes.competitions}>View competitions</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((d) => (
            <Card key={d.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-lg font-semibold text-lp-text">{d.name}</p>
                <Badge variant="muted">{d.type.replaceAll("_", " ")}</Badge>
              </div>
              <p className="text-xs text-lp-muted">
                {d.channel} · {campaignAudienceSummary(d)}
              </p>
              <p className="mt-1 text-sm text-lp-muted line-clamp-3">{d.body}</p>
              {canCreate ? (
                <Button variant="secondary" size="lg" className="mt-auto w-full sm:w-auto" asChild>
                  <Link href={`/venue/campaigns/${d.id}/edit`}>Open draft</Link>
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
