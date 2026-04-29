import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CampaignDraftEditor } from "@/components/venue/campaign-draft-editor";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { CampaignStatus } from "@/generated/prisma/enums";
import { inferAudienceSourceFromCampaign, parseAudienceFilter } from "@/lib/campaign-audience-meta";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";

const notices: Record<string, string> = {
  created: "Draft saved. Edit more or send from Messages (in-app log).",
  saved: "Draft updated.",
  forbidden: "Only owners or managers can edit campaigns.",
  "missing-name": "Add a campaign name.",
  "missing-competition": "Pick a competition for this audience.",
  "invalid-competition": "That competition is not on this venue.",
  "missing-segment": "Pick a saved segment tag.",
  "invalid-segment": "That tag is not on file for this venue yet.",
  invalid: "Check your audience selection.",
  "invalid-type": "Pick a valid message goal.",
  "invalid-channel": "Pick email or SMS.",
  "missing-subject": "Add a subject line.",
  "missing-body": "Add message body text.",
};

export default async function EditCampaignDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect(`${venueAppRoutes.messages}?notice=forbidden`);

  const campaign = await prisma.messageCampaign.findFirst({
    where: { id, venueId: access.venueId },
    include: { competition: { select: { title: true } } },
  });
  if (!campaign) notFound();
  if (campaign.status !== CampaignStatus.DRAFT) {
    redirect(venueAppRoutes.messages);
  }

  const [venue, competitions, segmentRows] = await Promise.all([
    prisma.venue.findUnique({ where: { id: access.venueId }, select: { name: true } }),
    prisma.competition.findMany({
      where: { venueId: access.venueId },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: { id: true, title: true },
    }),
    prisma.audienceTag.findMany({
      where: { venueId: access.venueId },
      distinct: ["tag"],
      select: { tag: true },
      orderBy: { tag: "asc" },
    }),
  ]);

  if (!venue) notFound();

  const segmentTags = segmentRows.map((r) => r.tag);
  const audienceSource = inferAudienceSourceFromCampaign(campaign);
  const filter = parseAudienceFilter(campaign.audienceFilter);
  const segmentTag = audienceSource === "segment" && filter?.tag ? filter.tag : "";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href={venueAppRoutes.messages} className="text-sm font-semibold text-lp-accent hover:underline">
          ← Messages
        </Link>
        <h1 className="lp-page-title mt-4 text-3xl md:text-4xl">Edit draft</h1>
        <p className="mt-2 text-lp-muted">{campaign.name}</p>
      </div>

      {notice && notices[notice] ? (
        <div
          className={
            notice === "saved" || notice === "created"
              ? "rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text"
              : "rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text"
          }
        >
          {notices[notice]}
        </div>
      ) : null}

      <FieldHelp title="Sent campaigns are read-only">
        <p>After you send from Messages, this draft locks — duplicate in the database if you need a variant later.</p>
      </FieldHelp>

      <CampaignDraftEditor
        mode="edit"
        campaignId={campaign.id}
        venueName={venue.name}
        competitions={competitions}
        segmentTags={segmentTags}
        initial={{
          name: campaign.name,
          audienceSource,
          competitionId: campaign.competitionId ?? "",
          segmentTag,
          channel: campaign.channel,
          type: campaign.type,
          subject: campaign.subject ?? "",
          body: campaign.body,
        }}
      />
    </div>
  );
}
