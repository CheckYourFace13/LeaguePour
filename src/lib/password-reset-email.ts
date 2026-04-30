export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() ?? "LeaguePour <onboarding@resend.dev>";
  if (!key) {
    console.warn(
      `[auth] Password reset requested for ${to}. Set RESEND_API_KEY (+ RESEND_FROM) to email the link. URL: ${resetUrl}`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your LeaguePour password",
      html: `<p>Reset your LeaguePour password:</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in one hour.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[auth] Resend email failed", res.status, text);
  }
}
