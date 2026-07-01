import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; venue?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { name, email, venue, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  await sendEmail({
    to: "hello@leaguepour.com",
    replyTo: email,
    subject: `LeaguePour contact: ${name}${venue ? ` — ${venue}` : ""}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${venue ? `<p><strong>Venue:</strong> ${venue}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${message}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
