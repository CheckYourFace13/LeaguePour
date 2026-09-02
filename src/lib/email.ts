/**
 * Resend email delivery. LeaguePour and VenueSprocket are on separate Resend teams (separate
 * free quotas), each with its own API key and webhook signing secret - see getResendKey below
 * and src/app/api/webhooks/resend/route.ts. Sender addresses stay brand-specific regardless
 * (hello@leaguepour.com / hello@venuesprocket.com); only the API key differs.
 *
 * Env vars required: RESEND_API_KEY (LP), RESEND_VS_API_KEY (VS), RESEND_FROM (optional LP
 * default, falls back to onboarding@resend.dev). VS calls always pass an explicit `from`.
 */

const RESEND_API = "https://api.resend.com";

export type EmailBrand = "lp" | "vs";

function getResendKey(brand: EmailBrand): string | null {
  const envVar = brand === "vs" ? "RESEND_VS_API_KEY" : "RESEND_API_KEY";
  return process.env[envVar]?.trim() ?? null;
}

function getFrom(): string {
  return process.env.RESEND_FROM?.trim() ?? "LeaguePour <onboarding@resend.dev>";
}

type SendEmailOpts = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  /** Which Resend team's API key to send with. Defaults to "lp". */
  brand?: EmailBrand;
};

/** Send a single email via Resend. Soft-fails (logs) when the brand's API key is not set. */
export async function sendEmail(opts: SendEmailOpts): Promise<{ ok: boolean; id?: string; error?: string }> {
  const brand = opts.brand ?? "lp";
  const key = getResendKey(brand);
  if (!key) {
    const error = `${brand === "vs" ? "RESEND_VS_API_KEY" : "RESEND_API_KEY"} not set`;
    console.warn(`[email] ${error} - skipping email to`, opts.to, "Subject:", opts.subject);
    return { ok: false, error };
  }

  const res = await fetch(`${RESEND_API}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: opts.from ?? getFrom(),
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[email] Resend error", res.status, text);
    return { ok: false, error: `Resend HTTP ${res.status}: ${text}`.slice(0, 500) };
  }

  const data = await res.json().catch(() => ({})) as { id?: string };
  return { ok: true, id: data.id };
}

/**
 * Send up to 100 emails in a single Resend batch request, all under one brand's API key/team.
 * Each recipient gets their own personalised email (not a group send).
 */
export async function sendEmailBatch(
  emails: SendEmailOpts[],
  brand: EmailBrand = "lp",
): Promise<{ ok: boolean; sent: number; failed: number }> {
  const key = getResendKey(brand);
  if (!key) {
    console.warn(
      `[email] ${brand === "vs" ? "RESEND_VS_API_KEY" : "RESEND_API_KEY"} not set - skipping batch of`,
      emails.length,
      "emails",
    );
    return { ok: false, sent: 0, failed: emails.length };
  }
  if (emails.length === 0) return { ok: true, sent: 0, failed: 0 };

  const from = getFrom();
  const payload = emails.map((e) => ({
    from: e.from ?? from,
    to: Array.isArray(e.to) ? e.to : [e.to],
    subject: e.subject,
    html: e.html,
    ...(e.replyTo ? { reply_to: e.replyTo } : {}),
  }));

  const res = await fetch(`${RESEND_API}/emails/batch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[email] Resend batch error", res.status, text);
    return { ok: false, sent: 0, failed: emails.length };
  }

  const data = await res.json().catch(() => ({ data: [] })) as { data?: { id: string }[] };
  const sent = data.data?.length ?? emails.length;
  return { ok: true, sent, failed: emails.length - sent };
}

/**
 * Escapes user-supplied text before interpolating it into an HTML email. Every email template
 * in this file that includes visitor/customer-supplied text (name, message, notes, etc.) must
 * run it through this first - unescaped interpolation lets a form submitter inject arbitrary
 * HTML into an email your team reads (found via security audit: src/app/api/contact/route.ts
 * and the VS lead-notification emails below were missing this).
 */
export function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ------------------------------
// Transactional email templates
// ------------------------------

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f7ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1a1f36; }
  .wrap { max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .header { background:#0d1b40; padding:28px 32px; }
  .header h1 { margin:0; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; }
  .header h1 span { color:#1a73ff; }
  .body { padding:32px; }
  .body p { margin:0 0 16px; line-height:1.6; color:#4a5568; font-size:15px; }
  .body h2 { margin:0 0 8px; font-size:20px; font-weight:700; color:#1a1f36; }
  .cta { display:inline-block; background:#1a73ff; color:#ffffff !important; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; font-size:15px; margin:8px 0 20px; }
  .detail-box { background:#f4f7ff; border-radius:8px; padding:16px 20px; margin:16px 0; }
  .detail-box p { margin:4px 0; font-size:14px; color:#4a5568; }
  .detail-box strong { color:#1a1f36; }
  .footer { padding:20px 32px; border-top:1px solid #e8edf5; }
  .footer p { margin:0; font-size:12px; color:#9aa5b4; line-height:1.5; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header"><h1>League<span>Pour</span></h1></div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>LeaguePour | Venue competition platform<br>
    You're receiving this because you have an account on LeaguePour.
    Manage your email preferences in your account settings.</p>
  </div>
</div>
</body>
</html>`;
}

// ── VenueSprocket email templates ────────────────────────────────────────────

function vsBaseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f7f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0e0d0c; }
  .wrap { max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.10); }
  .header { background:#0e0d0c; padding:28px 32px; display:flex; align-items:center; gap:12px; }
  .header h1 { margin:0; font-size:20px; font-weight:800; color:#ffffff; letter-spacing:-0.3px; }
  .header h1 span { color:#b87333; }
  .body { padding:32px; }
  .body p { margin:0 0 16px; line-height:1.6; color:#3c3830; font-size:15px; }
  .body h2 { margin:0 0 12px; font-size:20px; font-weight:700; color:#0e0d0c; }
  .cta { display:inline-block; background:#b87333; color:#ffffff !important; text-decoration:none; padding:12px 26px; border-radius:8px; font-weight:700; font-size:15px; margin:8px 0 20px; }
  .detail-box { background:#f0efed; border-radius:8px; padding:16px 20px; margin:16px 0; border-left:3px solid #b87333; }
  .detail-box p { margin:5px 0; font-size:14px; color:#3c3830; }
  .detail-box strong { color:#0e0d0c; }
  .footer { padding:20px 32px; border-top:1px solid #dddbd7; }
  .footer p { margin:0; font-size:12px; color:#6b6560; line-height:1.5; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header"><h1>Venue<span>Sprocket</span></h1></div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>VenueSprocket — Private event management for bars, breweries &amp; restaurants<br>
    <a href="https://venuesprocket.com" style="color:#b87333;">venuesprocket.com</a></p>
  </div>
</div>
</body>
</html>`;
}

/** Notify venue owner of a new private event inquiry */
export function sendVsLeadNotificationEmail(opts: {
  to: string;
  venueName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  eventType: string;
  preferredDate?: Date | null;
  guestCount?: number | null;
  budgetRange?: string | null;
  notes?: string | null;
  dashboardUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const dateStr = opts.preferredDate
    ? opts.preferredDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "Not specified";

  const content = `
    <h2>New private event inquiry</h2>
    <p>Someone submitted an inquiry for a private event at <strong>${escHtml(opts.venueName)}</strong>. Here are the details:</p>
    <div class="detail-box">
      <p><strong>Name:</strong> ${escHtml(opts.customerName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${encodeURIComponent(opts.customerEmail)}" style="color:#b87333;">${escHtml(opts.customerEmail)}</a></p>
      ${opts.customerPhone ? `<p><strong>Phone:</strong> ${escHtml(opts.customerPhone)}</p>` : ""}
      <p><strong>Event type:</strong> ${escHtml(opts.eventType.replace(/_/g, " "))}</p>
      <p><strong>Preferred date:</strong> ${escHtml(dateStr)}</p>
      ${opts.guestCount ? `<p><strong>Est. guests:</strong> ${opts.guestCount}</p>` : ""}
      ${opts.budgetRange ? `<p><strong>Budget:</strong> ${escHtml(opts.budgetRange)}</p>` : ""}
      ${opts.notes ? `<p><strong>Notes:</strong> ${escHtml(opts.notes)}</p>` : ""}
    </div>
    <p>Reply quickly — leads that hear back within an hour are much more likely to book.</p>
    <a class="cta" href="${opts.dashboardUrl}">View lead in dashboard</a>
    <p style="font-size:13px;color:#6b6560;">You can also reply directly to this email to reach ${escHtml(opts.customerName)}.</p>
  `;
  return sendEmail({
    to: opts.to,
    subject: `New inquiry: ${opts.eventType.replace(/_/g, " ")} from ${opts.customerName}`,
    html: vsBaseHtml(content),
    replyTo: opts.customerEmail,
    from: "VenueSprocket <hello@venuesprocket.com>",
    brand: "vs",
  });
}

/** Confirmation email to the customer after they submit an inquiry */
export function sendVsInquiryConfirmationEmail(opts: {
  to: string;
  customerName: string;
  venueName: string;
  eventType: string;
  preferredDate?: Date | null;
}): Promise<{ ok: boolean }> {
  const dateStr = opts.preferredDate
    ? opts.preferredDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const content = `
    <h2>We got your inquiry!</h2>
    <p>Hi ${escHtml(opts.customerName)},</p>
    <p>Thanks for reaching out to <strong>${escHtml(opts.venueName)}</strong> about your private event. The venue team will be in touch shortly to discuss the details.</p>
    <div class="detail-box">
      <p><strong>Venue:</strong> ${escHtml(opts.venueName)}</p>
      <p><strong>Event type:</strong> ${escHtml(opts.eventType.replace(/_/g, " "))}</p>
      ${dateStr ? `<p><strong>Preferred date:</strong> ${escHtml(dateStr)}</p>` : ""}
    </div>
    <p>While you wait, feel free to reply to this email with any additional questions.</p>
    <p>We look forward to helping you host a great event!</p>
  `;
  return sendEmail({
    to: opts.to,
    subject: `Your inquiry to ${opts.venueName} — we'll be in touch soon`,
    html: vsBaseHtml(content),
    from: "VenueSprocket <hello@venuesprocket.com>",
    brand: "vs",
  });
}

export function sendRegistrationConfirmationEmail(opts: {
  to: string;
  playerName: string;
  competitionTitle: string;
  venueName: string;
  competitionUrl: string;
  entryFeeCents: number;
  currency: string;
}): Promise<{ ok: boolean }> {
  const freeEntry = opts.entryFeeCents === 0;
  const content = `
    <h2>You're registered!</h2>
    <p>Hi ${opts.playerName},</p>
    <p>Your spot is confirmed for <strong>${opts.competitionTitle}</strong> at <strong>${opts.venueName}</strong>.</p>
    <div class="detail-box">
      <p><strong>Event:</strong> ${opts.competitionTitle}</p>
      <p><strong>Venue:</strong> ${opts.venueName}</p>
      <p><strong>Entry:</strong> ${freeEntry ? "Free" : `$${(opts.entryFeeCents / 100).toFixed(2)} ${opts.currency.toUpperCase()} - paid`}</p>
    </div>
    <a class="cta" href="${opts.competitionUrl}">View competition</a>
    <p>See you there!</p>
  `;
  return sendEmail({
    to: opts.to,
    subject: `You're in - ${opts.competitionTitle} at ${opts.venueName}`,
    html: baseHtml(content),
  });
}

export function sendPaymentConfirmationEmail(opts: {
  to: string;
  playerName: string;
  competitionTitle: string;
  venueName: string;
  competitionUrl: string;
  amountCents: number;
  currency: string;
}): Promise<{ ok: boolean }> {
  const content = `
    <h2>Payment confirmed</h2>
    <p>Hi ${opts.playerName},</p>
    <p>Your entry fee payment is confirmed - you're locked in for <strong>${opts.competitionTitle}</strong> at <strong>${opts.venueName}</strong>.</p>
    <div class="detail-box">
      <p><strong>Event:</strong> ${opts.competitionTitle}</p>
      <p><strong>Venue:</strong> ${opts.venueName}</p>
      <p><strong>Amount paid:</strong> $${(opts.amountCents / 100).toFixed(2)} ${opts.currency.toUpperCase()}</p>
    </div>
    <a class="cta" href="${opts.competitionUrl}">View competition</a>
    <p>See you at the event!</p>
  `;
  return sendEmail({
    to: opts.to,
    subject: `Payment confirmed - ${opts.competitionTitle}`,
    html: baseHtml(content),
  });
}
