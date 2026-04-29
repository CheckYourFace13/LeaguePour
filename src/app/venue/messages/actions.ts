"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CampaignStatus, NotificationStatus } from "@/generated/prisma/enums";
import { filterRecipientsByPrefs, resolveCampaignRecipientUserIds } from "@/lib/campaign-audience";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendDraftCampaignFormAction(formData: FormData) {
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) redirect("/venue/messages?notice=missing");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/messages?notice=read-only");

  const campaign = await prisma.messageCampaign.findFirst({
    where: { id: campaignId, venueId: access.venueId },
  });
  if (!campaign || campaign.status !== CampaignStatus.DRAFT) {
    redirect("/venue/messages?notice=not-draft");
  }

  let userIds = await resolveCampaignRecipientUserIds({
    venueId: campaign.venueId,
    competitionId: campaign.competitionId,
    channel: campaign.channel,
    audienceFilter: campaign.audienceFilter,
  });
  userIds = await filterRecipientsByPrefs(userIds, campaign.channel);

  if (userIds.length === 0) {
    redirect("/venue/messages?notice=no-recipients");
  }

  await prisma.$transaction(async (tx) => {
    for (const userId of userIds) {
      await tx.notification.create({
        data: {
          userId,
          channel: campaign.channel,
          template: "CAMPAIGN_IN_APP_OUTBOX",
          payload: {
            campaignId: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            body: campaign.body,
            note: "In-app notification log — connect ESP/SMS to deliver externally.",
          },
          status: NotificationStatus.QUEUED,
        },
      });
    }
    await tx.messageCampaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.SENT, sentAt: new Date() },
    });
  });

  revalidatePath("/venue/messages");
  revalidatePath("/venue/marketing");
  revalidatePath("/venue/dashboard");
  redirect(`/venue/messages?notice=sent&count=${userIds.length}`);
}
