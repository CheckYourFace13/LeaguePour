import { prisma } from "@/lib/db";
import { CampaignStatus } from "@/generated/prisma/enums";
import { resolveCampaignRecipientUserIds, filterRecipientsByPrefs } from "@/lib/campaign-audience";
import { sendEmailBatch } from "@/lib/email";
import { getPublicSiteUrl } from "@/lib/site-url";

const BATCH_SIZE = 100; // Resend batch limit

type SendResult = {
  ok: boolean;
  recipientCount: number;
  sent: number;
  failed: number;
  error?: string;
};

/**
 * Deliver a DRAFT campaign to all eligible recipients and mark it SENT.
 * Safe to call from a server action - does not throw, returns a result object.
 */
export async function sendCampaign(campaignId: string, venueId: string): Promise<SendResult> {
  const campaign = await prisma.messageCampaign.findFirst({
    where: { id: campaignId, venueId },
    include: {
      venue: { select: { name: true, slug: true } },
    },
  });

  if (!campaign) return { ok: false, recipientCount: 0, sent: 0, failed: 0, error: "Campaign not found" };
  if (campaign.status !== CampaignStatus.DRAFT) {
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error: "Campaign is not a draft" };
  }
  if (campaign.channel !== "EMAIL") {
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error: "SMS delivery not yet available" };
  }
  if (!campaign.subject || !campaign.body) {
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error: "Campaign missing subject or body" };
  }

  // Resolve recipients
  const allUserIds = await resolveCampaignRecipientUserIds({
    venueId: campaign.venueId,
    competitionId: campaign.competitionId,
    channel: campaign.channel,
    audienceFilter: campaign.audienceFilter,
  });
  const filteredUserIds = await filterRecipientsByPrefs(allUserIds, campaign.channel);

  if (filteredUserIds.length === 0) {
    await prisma.messageCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SENT, sentAt: new Date() },
    });
    return { ok: true, recipientCount: 0, sent: 0, failed: 0 };
  }

  // Fetch email addresses for filtered recipients
  const users = await prisma.user.findMany({
    where: { id: { in: filteredUserIds }, email: { not: "" } },
    select: { id: true, name: true, email: true },
  });

  const siteUrl = getPublicSiteUrl();
  const venueUrl = `${siteUrl}/v/${campaign.venue.slug}`;

  // Build email list - personalise greeting but keep subject/body from campaign
  const emails = users.map((u) => ({
    to: u.email,
    subject: campaign.subject!,
    html: buildCampaignHtml({
      recipientName: u.name ?? "there",
      venueName: campaign.venue.name,
      venueUrl,
      body: campaign.body,
    }),
  }));

  // Send in batches
  let totalSent = 0;
  let totalFailed = 0;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const result = await sendEmailBatch(batch);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  // Mark sent regardless of partial failures (avoid re-sending to recipients who already got it)
  await prisma.messageCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.SENT, sentAt: new Date() },
  });

  console.info(
    `[campaign] Sent campaign ${campaignId} - ${totalSent} delivered, ${totalFailed} failed of ${users.length} recipients`,
  );

  return {
    ok: totalFailed === 0,
    recipientCount: users.length,
    sent: totalSent,
    failed: totalFailed,
  };
}

function buildCampaignHtml(opts: {
  recipientName: string;
  venueName: string;
  venueUrl: string;
  body: string;
}): string {
  // Convert plain-text line breaks to <br> for basic HTML formatting
  const bodyHtml = opts.body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f7ff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#1a1f36; }
  .wrap { max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .header { background:#0d1b40; padding:28px 32px; }
  .header h1 { margin:0; font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
  .header h1 span { color:#1a73ff; }
  .header p { margin:4px 0 0; font-size:14px; color:#8fa3c8; }
  .body { padding:32px; }
  .body p { margin:0 0 16px; line-height:1.7; color:#4a5568; font-size:15px; }
  .cta { display:inline-block; background:#1a73ff; color:#ffffff !important; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; font-size:15px; margin:8px 0 20px; }
  .footer { padding:20px 32px; border-top:1px solid #e8edf5; }
  .footer p { margin:0; font-size:12px; color:#9aa5b4; line-height:1.5; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>League<span>Pour</span></h1>
    <p>Message from ${escHtml(opts.venueName)}</p>
  </div>
  <div class="body">
    <p>Hi ${escHtml(opts.recipientName)},</p>
    <p>${bodyHtml}</p>
    <a class="cta" href="${opts.venueUrl}">View ${escHtml(opts.venueName)}</a>
  </div>
  <div class="footer">
    <p>You're receiving this because you follow ${escHtml(opts.venueName)} on LeaguePour.<br>
    Manage your email preferences in your <a href="${getPublicSiteUrl()}/player/preferences" style="color:#9aa5b4">account settings</a>.</p>
  </div>
</div>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
