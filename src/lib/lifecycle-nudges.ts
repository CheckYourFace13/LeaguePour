/**
 * Shared plumbing for lifecycle nudge emails - see src/app/api/cron/lp-lifecycle/route.ts and
 * src/app/api/cron/vs-lifecycle/route.ts for the actual trigger conditions. Each nudge type
 * fires at most once per subject (a venue, competition, lead, etc), tracked in
 * LifecycleNudgeSent so a daily re-run never repeats one.
 */
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/** True if this exact nudge was already sent - claims the key atomically so a concurrent/retried
 * run can't send the same nudge twice (relies on the unique primary key, not a check-then-act
 * race window). */
export async function claimNudge(key: string): Promise<boolean> {
  try {
    await prisma.lifecycleNudgeSent.create({ data: { key } });
    return true;
  } catch {
    // Unique constraint violation - someone already claimed this key.
    return false;
  }
}

function baseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "https://leaguepour.com";
}

function lpEmailShell(title: string, bodyHtml: string, ctaHref: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1f36;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:#0d1b40;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">League<span style="color:#1a73ff;">Pour</span></h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#1a1f36;">${title}</p>
    ${bodyHtml}
    <a href="${ctaHref}" style="display:inline-block;background:#1a73ff;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;margin:6px 0 4px;">${ctaLabel}</a>
  </div>
</div>
</body>
</html>`;
}

function vsEmailShell(title: string, bodyHtml: string, ctaHref: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1512;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:#1a1512;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">Venue<span style="color:#b87333;">Sprocket</span></h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#1a1512;">${title}</p>
    ${bodyHtml}
    <a href="${ctaHref}" style="display:inline-block;background:#b87333;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;margin:6px 0 4px;">${ctaLabel}</a>
  </div>
</div>
</body>
</html>`;
}

export async function sendLpNudge(opts: {
  key: string;
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
  ctaPath: string;
  ctaLabel: string;
}): Promise<boolean> {
  if (!(await claimNudge(opts.key))) return false;
  const html = lpEmailShell(opts.title, opts.bodyHtml, `${baseUrl()}${opts.ctaPath}`, opts.ctaLabel);
  await sendEmail({ to: opts.to, subject: opts.subject, html });
  return true;
}

export async function sendVsNudge(opts: {
  key: string;
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
  ctaPath: string;
  ctaLabel: string;
}): Promise<boolean> {
  if (!(await claimNudge(opts.key))) return false;
  const html = vsEmailShell(opts.title, opts.bodyHtml, `${baseUrl()}${opts.ctaPath}`, opts.ctaLabel);
  await sendEmail({
    to: opts.to,
    subject: opts.subject,
    html,
    from: "VenueSprocket <hello@venuesprocket.com>",
    brand: "vs",
  });
  return true;
}

/** Best available notification address for a venue's LeaguePour side: the owner's account email. */
export async function getLpOwnerEmail(venueId: string): Promise<string | null> {
  const owner = await prisma.venueStaff.findFirst({
    where: { venueId, role: "OWNER" },
    select: { user: { select: { email: true } } },
  });
  return owner?.user.email ?? null;
}

/** Best available notification address for a venue's VenueSprocket side: publicEmail if set,
 * otherwise fall back to the account owner's email (same fallback the lead-notification email
 * already uses in spirit - see src/lib/actions/vs.ts). */
export async function getVsNotifyEmail(venueId: string): Promise<string | null> {
  const [config, owner] = await Promise.all([
    prisma.venueVsConfig.findUnique({ where: { venueId }, select: { publicEmail: true } }),
    prisma.venueStaff.findFirst({
      where: { venueId, role: "OWNER" },
      select: { user: { select: { email: true } } },
    }),
  ]);
  return config?.publicEmail ?? owner?.user.email ?? null;
}
