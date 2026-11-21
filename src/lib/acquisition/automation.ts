/**
 * Owner kill switches and status for the acquisition automation (AppSetting, flip from
 * /internal/acquisition, no deploy). Both default ON: neither one contacts a prospect. Qualification
 * only reads public pages of businesses already in the outreach list; the report only emails the
 * owner. Sending to prospects always stays a manual Approve + Send.
 */
import { prisma } from "@/lib/db";
import { getBoolSetting, setSetting } from "@/lib/app-settings";
import { isVsOutreachEnabled, LP_OUTREACH_ENABLED_KEY } from "@/lib/outreach-email";

export const AUTO_QUALIFY_KEY = "acq_auto_qualify_enabled";
export const DAILY_REPORT_KEY = "acq_daily_report_enabled";

export async function automationSwitches() {
  const [qualify, report] = await Promise.all([getBoolSetting(AUTO_QUALIFY_KEY, true), getBoolSetting(DAILY_REPORT_KEY, true)]);
  return { qualify, report };
}

export async function setAutomationSwitch(key: typeof AUTO_QUALIFY_KEY | typeof DAILY_REPORT_KEY, on: boolean) {
  await setSetting(key, on ? "true" : "false");
}

/**
 * Production-readable proof of the cold-email lanes' state, read from the live database: whether
 * each automatic lane is enabled and the most recent automatic send per lane. Logged at scheduler
 * start and on every acquisition-daily run, so the Hostinger runtime log shows it.
 */
export async function outreachLaneStatus() {
  const [vsOn, lpOn, lastVs, lastLp, vsKeyRow] = await Promise.all([
    isVsOutreachEnabled(),
    getBoolSetting(LP_OUTREACH_ENABLED_KEY, false),
    prisma.outreachContact.findFirst({ where: { vsEmailSentAt: { not: null } }, orderBy: { vsEmailSentAt: "desc" }, select: { vsEmailSentAt: true } }),
    prisma.outreachContact.findFirst({ where: { emailSentAt: { not: null } }, orderBy: { emailSentAt: "desc" }, select: { emailSentAt: true } }),
    prisma.appSetting.findUnique({ where: { key: "vs_outreach_enabled_after_2026_11_pause" }, select: { value: true } }),
  ]);
  return {
    vsAutomatic: vsOn ? "ON" : "PAUSED",
    vsSwitchRow: vsKeyRow ? vsKeyRow.value : "absent (defaults to paused)",
    lpAutomatic: lpOn ? "ON" : "PAUSED",
    lastVsSendAt: lastVs?.vsEmailSentAt?.toISOString() ?? "never",
    lastLpSendAt: lastLp?.emailSentAt?.toISOString() ?? "never",
  };
}

export function formatLaneStatus(s: Awaited<ReturnType<typeof outreachLaneStatus>>): string {
  return `[outreach-status] VS automatic cold email: ${s.vsAutomatic} (switch row: ${s.vsSwitchRow}); last VS send: ${s.lastVsSendAt}; LP automatic: ${s.lpAutomatic}; last LP send: ${s.lastLpSendAt}`;
}
