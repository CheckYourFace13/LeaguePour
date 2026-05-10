"use server";

import { auth } from "@/auth";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { sendCampaign } from "@/lib/campaign-send";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendCampaignNowAction(campaignId: string): Promise<{ error?: string; sent?: number }> {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return { error: "Not authorised" };
  if (!venueStaffCanCreateAndPublish(access.role)) return { error: "Not authorised" };
  if (!campaignId) return { error: "Missing campaign" };

  const result = await sendCampaign(campaignId, access.venueId);

  if (!result.ok && result.error) return { error: result.error };

  revalidatePath(`/venue/campaigns/${campaignId}`);
  revalidatePath("/venue/messages");
  revalidatePath("/venue/marketing");
  revalidatePath("/venue/dashboard");

  redirect(`/venue/messages?notice=campaign-sent&count=${result.sent}`);
}
