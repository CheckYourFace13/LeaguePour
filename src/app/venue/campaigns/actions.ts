"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { CampaignChannel, CampaignStatus, CampaignType } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const campaignTypes = Object.values(CampaignType);
const channels = Object.values(CampaignChannel);

function parseCampaignType(v: string): CampaignType | null {
  return campaignTypes.includes(v as CampaignType) ? (v as CampaignType) : null;
}

function parseChannel(v: string): CampaignChannel | null {
  return channels.includes(v as CampaignChannel) ? (v as CampaignChannel) : null;
}

async function parseAndValidateAudience(
  accessVenueId: string,
  audienceSource: string,
  formData: FormData,
): Promise<{ competitionId: string | null; segmentTag: string | null }> {
  if (audienceSource === "competition") {
    const cid = String(formData.get("competitionId") ?? "").trim();
    if (!cid) redirect("/venue/campaigns/new?notice=missing-competition");
    const ok = await prisma.competition.findFirst({
      where: { id: cid, venueId: accessVenueId },
      select: { id: true },
    });
    if (!ok) redirect("/venue/campaigns/new?notice=invalid-competition");
    return { competitionId: cid, segmentTag: null };
  }
  if (audienceSource === "segment") {
    const tag = String(formData.get("segmentTag") ?? "").trim();
    if (!tag) redirect("/venue/campaigns/new?notice=missing-segment");
    const exists = await prisma.audienceTag.findFirst({
      where: { venueId: accessVenueId, tag },
      select: { tag: true },
    });
    if (!exists) redirect("/venue/campaigns/new?notice=invalid-segment");
    return { competitionId: null, segmentTag: tag };
  }
  return { competitionId: null, segmentTag: null };
}

async function parseAndValidateAudienceEdit(
  accessVenueId: string,
  audienceSource: string,
  formData: FormData,
  campaignId: string,
) {
  if (audienceSource === "competition") {
    const cid = String(formData.get("competitionId") ?? "").trim();
    if (!cid) redirect(`/venue/campaigns/${campaignId}/edit?notice=missing-competition`);
    const ok = await prisma.competition.findFirst({
      where: { id: cid, venueId: accessVenueId },
      select: { id: true },
    });
    if (!ok) redirect(`/venue/campaigns/${campaignId}/edit?notice=invalid-competition`);
    return { competitionId: cid, segmentTag: null };
  }
  if (audienceSource === "segment") {
    const tag = String(formData.get("segmentTag") ?? "").trim();
    if (!tag) redirect(`/venue/campaigns/${campaignId}/edit?notice=missing-segment`);
    const exists = await prisma.audienceTag.findFirst({
      where: { venueId: accessVenueId, tag },
      select: { tag: true },
    });
    if (!exists) redirect(`/venue/campaigns/${campaignId}/edit?notice=invalid-segment`);
    return { competitionId: null, segmentTag: tag };
  }
  return { competitionId: null, segmentTag: null };
}

export async function createCampaignDraftFormAction(formData: FormData) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/campaigns/new?notice=forbidden");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/venue/campaigns/new?notice=missing-name");

  const audienceSource = String(formData.get("audienceSource") ?? "all");
  if (!["all", "competition", "segment"].includes(audienceSource)) redirect("/venue/campaigns/new?notice=invalid");

  const { competitionId, segmentTag } = await parseAndValidateAudience(access.venueId, audienceSource, formData);

  const type = parseCampaignType(String(formData.get("type") ?? ""));
  if (!type) redirect("/venue/campaigns/new?notice=invalid-type");
  const channel = parseChannel(String(formData.get("channel") ?? ""));
  if (!channel) redirect("/venue/campaigns/new?notice=invalid-channel");

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject) redirect("/venue/campaigns/new?notice=missing-subject");
  if (!body) redirect("/venue/campaigns/new?notice=missing-body");

  const audienceFilterData =
    competitionId != null
      ? {}
      : {
          audienceFilter:
            segmentTag != null
              ? ({ source: "segment", tag: segmentTag } as object)
              : ({ source: "venue_followers" } as object),
        };

  const campaign = await prisma.messageCampaign.create({
    data: {
      venueId: access.venueId,
      competitionId,
      type,
      name,
      subject,
      body,
      channel,
      ...audienceFilterData,
      status: CampaignStatus.DRAFT,
    },
  });

  revalidatePath("/venue/messages");
  revalidatePath("/venue/marketing");
  revalidatePath("/venue/dashboard");
  redirect(`/venue/campaigns/${campaign.id}/edit?notice=created`);
}

export async function updateCampaignDraftFormAction(formData: FormData) {
  const id = String(formData.get("campaignId") ?? "").trim();
  if (!id) redirect("/venue/messages?notice=missing");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect(`/venue/campaigns/${id}/edit?notice=forbidden`);

  const existing = await prisma.messageCampaign.findFirst({
    where: { id, venueId: access.venueId, status: CampaignStatus.DRAFT },
  });
  if (!existing) redirect("/venue/messages?notice=not-draft");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/venue/campaigns/${id}/edit?notice=missing-name`);

  const audienceSource = String(formData.get("audienceSource") ?? "all");
  if (!["all", "competition", "segment"].includes(audienceSource)) redirect(`/venue/campaigns/${id}/edit?notice=invalid`);

  const { competitionId, segmentTag } = await parseAndValidateAudienceEdit(
    access.venueId,
    audienceSource,
    formData,
    id,
  );

  const type = parseCampaignType(String(formData.get("type") ?? ""));
  if (!type) redirect(`/venue/campaigns/${id}/edit?notice=invalid-type`);
  const channel = parseChannel(String(formData.get("channel") ?? ""));
  if (!channel) redirect(`/venue/campaigns/${id}/edit?notice=invalid-channel`);

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject) redirect(`/venue/campaigns/${id}/edit?notice=missing-subject`);
  if (!body) redirect(`/venue/campaigns/${id}/edit?notice=missing-body`);

  const audienceFilterData =
    competitionId != null
      ? { audienceFilter: Prisma.DbNull }
      : {
          audienceFilter:
            segmentTag != null
              ? ({ source: "segment", tag: segmentTag } as object)
              : ({ source: "venue_followers" } as object),
        };

  await prisma.messageCampaign.update({
    where: { id },
    data: {
      name,
      competitionId,
      type,
      subject,
      body,
      channel,
      ...audienceFilterData,
    },
  });

  revalidatePath("/venue/messages");
  revalidatePath("/venue/marketing");
  revalidatePath("/venue/dashboard");
  revalidatePath(`/venue/campaigns/${id}/edit`);
  redirect(`/venue/campaigns/${id}/edit?notice=saved`);
}
