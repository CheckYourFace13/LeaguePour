import { NextResponse } from "next/server";
import { sendEmail, escHtml } from "@/lib/email";

const RECIPIENTS: Record<string, string> = {
  leaguepour: "hello@leaguepour.com",
  venuesprocket: "hello@venuesprocket.com",
};

const TOPICS = new Set([
  "General question",
  "Feature request / change",
  "Report a problem",
  "Billing & upgrades",
  "Book a demo",
]);

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    venue?: string;
    message?: string;
    product?: string;
    topic?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { name, email, venue, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const product = body.product === "venuesprocket" ? "venuesprocket" : "leaguepour";
  const isVs = product === "venuesprocket";
  const brandLabel = isVs ? "VenueSprocket" : "LeaguePour";
  const topic = body.topic && TOPICS.has(body.topic) ? body.topic : "General question";

  await sendEmail({
    to: RECIPIENTS[product],
    replyTo: email,
    subject: `${brandLabel} ${topic}: ${name}${venue ? ` — ${venue}` : ""}`,
    html: `
      <p><strong>Product:</strong> ${brandLabel}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Name:</strong> ${escHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${encodeURIComponent(email)}">${escHtml(email)}</a></p>
      ${venue ? `<p><strong>Venue:</strong> ${escHtml(venue)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escHtml(message)}</p>
    `,
    // VS's Resend team key can only send from a domain that team owns - the LP default `from`
    // (RESEND_FROM / onboarding@resend.dev fallback) belongs to LP's team, not VS's.
    ...(isVs ? { from: "VenueSprocket <hello@venuesprocket.com>" } : {}),
    brand: isVs ? "vs" : "lp",
  });

  return NextResponse.json({ ok: true });
}
