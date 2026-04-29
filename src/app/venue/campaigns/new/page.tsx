import Link from "next/link";
import { auth } from "@/auth";
import { CampaignDraftEditor } from "@/components/venue/campaign-draft-editor";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { CampaignChannel, CampaignType } from "@/generated/prisma/enums";
import { buildCampaignDraftScaffold } from "@/lib/campaign-draft-scaffold";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const notices: Record<string, string> = {
  forbidden: "Only owners or managers can create campaigns.",
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

export default async function NewCampaignDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect(`${venueAppRoutes.messages}?notice=forbidden`);

  const { notice } = await searchParams;

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

  if (!venue) redirect("/signup/venue");

  const segmentTags = segmentRows.map((r) => r.tag);
  const defaultChannel = CampaignChannel.EMAIL;
  const defaultType = CampaignType.SIGNUP_CLOSING;
  const defaultCompTitle = competitions[0]?.title ?? null;
  const scaffold = buildCampaignDraftScaffold({
    type: defaultType,
    venueName: venue.name,
    competitionTitle: defaultCompTitle,
    channel: defaultChannel,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href={venueAppRoutes.messages} className="text-sm font-semibold text-lp-accent hover:underline">
          ← Messages
        </Link>
        <h1 className="lp-page-title mt-4 text-3xl md:text-4xl">New campaign draft</h1>
        <p className="mt-2 text-lp-muted">Compose in private — nothing is sent until you queue it from Messages.</p>
      </div>

      {notice && notices[notice] ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          {notices[notice]}
        </div>
      ) : null}

      <FieldHelp title="Audience (admin)">
        <p>
          Followers = anyone following this venue. Competition = confirmed signups only. Segment = audience tags you
          saved under Audience / CRM.
        </p>
      </FieldHelp>

      <CampaignDraftEditor
        mode="create"
        venueName={venue.name}
        competitions={competitions}
        segmentTags={segmentTags}
        initial={{
          name: "",
          audienceSource: competitions.length > 0 ? "competition" : "all",
          competitionId: competitions[0]?.id ?? "",
          segmentTag: segmentTags[0] ?? "",
          channel: defaultChannel,
          type: defaultType,
          subject: scaffold.subject,
          body: scaffold.body,
        }}
      />
    </div>
  );
}
