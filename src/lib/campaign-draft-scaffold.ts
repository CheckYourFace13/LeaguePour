import { CampaignChannel, CampaignType } from "@/generated/prisma/enums";

/** Admin-only copy helpers — not shown on public pages. */
export function buildCampaignDraftScaffold(params: {
  type: CampaignType;
  venueName: string;
  competitionTitle: string | null;
  channel: CampaignChannel;
}): { subject: string; body: string } {
  const { type, venueName, competitionTitle, channel } = params;
  const comp = competitionTitle?.trim() || "your event";
  const channelNote =
    channel === CampaignChannel.SMS
      ? "SMS: LeaguePour logs this in-app until a carrier is connected."
      : "Email: LeaguePour logs this in-app until an ESP is connected.";

  switch (type) {
    case CampaignType.SIGNUP_CLOSING:
      return {
        subject: `Signup closing soon — ${comp}`,
        body: `Hey {{first_name}},\n\nSignup for "${comp}" at ${venueName} is closing soon. Grab your spot before the deadline.\n\n— ${venueName}\n\n(${channelNote})`,
      };
    case CampaignType.STARTS_TOMORROW:
      return {
        subject: `Tomorrow night — ${comp}`,
        body: `Hey {{first_name}},\n\n"${comp}" at ${venueName} starts tomorrow. See you at the venue.\n\n— ${venueName}\n\n(${channelNote})`,
      };
    case CampaignType.JOIN_NEXT:
      return {
        subject: `Join the next one at ${venueName}`,
        body: `Hey {{first_name}},\n\nWe're lining up the next run at ${venueName}. Reply at the bar or grab the next signup when it drops.\n\n— ${venueName}\n\n(${channelNote})`,
      };
    case CampaignType.WINNER_RECAP:
      return {
        subject: `Thanks for playing — ${venueName}`,
        body: `Hey {{first_name}},\n\nThanks for being part of "${comp}" at ${venueName}. Finals energy was huge — watch for the next bracket.\n\n— ${venueName}\n\n(${channelNote})`,
      };
    case CampaignType.CUSTOM:
    default:
      return {
        subject: `Message from ${venueName}`,
        body: `Hey {{first_name}},\n\n[Write your update here — keep it short and specific to this audience.]\n\n— ${venueName}\n\n(${channelNote})`,
      };
  }
}
