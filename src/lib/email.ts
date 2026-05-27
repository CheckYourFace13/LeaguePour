/**
 * Resend email delivery.
 * Env vars required: RESEND_API_KEY, RESEND_FROM (optional, defaults to onboarding@resend.dev).
 *
 * For production: set RESEND_FROM to a verified domain address, e.g. "LeaguePour <no-reply@leaguepour.com>"
 */

const RESEND_API = "https://api.resend.com";

function getResendKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() ?? null;
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
};

/** Send a single email via Resend. Soft-fails (logs) when RESEND_API_KEY is not set. */
export async function sendEmail(opts: SendEmailOpts): Promise<{ ok: boolean; id?: string }> {
  const key = getResendKey();
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set - skipping email to", opts.to, "Subject:", opts.subject);
    return { ok: false };
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
    return { ok: false };
  }

  const data = await res.json().catch(() => ({})) as { id?: string };
  return { ok: true, id: data.id };
}

/**
 * Send up to 100 emails in a single Resend batch request.
 * Each recipient gets their own personalised email (not a group send).
 */
export async function sendEmailBatch(
  emails: SendEmailOpts[],
): Promise<{ ok: boolean; sent: number; failed: number }> {
  const key = getResendKey();
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set - skipping batch of", emails.length, "emails");
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
