import { prisma } from "@/lib/db";
import { CampaignChannel, RegistrationStatus } from "@/generated/prisma/enums";
import { parseAudienceFilter } from "@/lib/campaign-audience-meta";

type CampaignAudienceInput = {
  venueId: string;
  competitionId: string | null;
  channel: CampaignChannel;
  audienceFilter: unknown;
};

/**
 * Resolves recipient user IDs for a draft campaign.
 * - Linked competition → confirmed registrants for that competition.
 * - Segment (audience tag) → users with that tag at this venue.
 * - Otherwise → users following the venue.
 */
export async function resolveCampaignRecipientUserIds(campaign: CampaignAudienceInput): Promise<string[]> {
  if (campaign.competitionId) {
    const regs = await prisma.competitionRegistration.findMany({
      where: {
        competitionId: campaign.competitionId,
        status: RegistrationStatus.CONFIRMED,
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    return regs.map((r) => r.userId);
  }

  const filter = parseAudienceFilter(campaign.audienceFilter);
  if (filter?.source === "segment" && filter.tag) {
    const tagged = await prisma.audienceTag.findMany({
      where: { venueId: campaign.venueId, tag: filter.tag },
      select: { userId: true },
      distinct: ["userId"],
    });
    return tagged.map((t) => t.userId);
  }

  const follows = await prisma.venueFollow.findMany({
    where: { venueId: campaign.venueId },
    select: { userId: true },
  });
  return follows.map((f) => f.userId);
}

/** Drop recipients who cannot receive this channel (placeholder deliverability rules). */
export async function filterRecipientsByPrefs(
  userIds: string[],
  channel: CampaignChannel,
): Promise<string[]> {
  if (userIds.length === 0) return [];
  const prefs = await prisma.communicationPreference.findMany({
    where: { userId: { in: userIds } },
  });
  const prefMap = new Map(prefs.map((p) => [p.userId, p]));
  return userIds.filter((uid) => {
    const p = prefMap.get(uid);
    if (p?.globalOptOut) return false;
    if (channel === CampaignChannel.EMAIL && p && !p.emailOffers) return false;
    if (channel === CampaignChannel.SMS && p && !p.smsOffers) return false;
    return true;
  });
}
