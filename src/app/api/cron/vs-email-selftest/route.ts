import { NextResponse } from "next/server";
import { sendVsLeadNotificationEmail } from "@/lib/email";

export const runtime = "nodejs";
// Forces this route to always execute on request rather than being statically
// prerendered/cached - observed in production returning a stale, cached 404 (Next's own
// x-nextjs-cache/x-nextjs-prerender headers) despite the file existing and deploying
// correctly, while sibling cron routes without this line rendered dynamically on their own.
export const dynamic = "force-dynamic";

/**
 * Proves the VS transactional email path (sendVsLeadNotificationEmail, the same function the
 * real inquiry flow calls) actually gets ACCEPTED by Resend under the correct team/sender,
 * using Resend's own API response - not by requiring inbox access. Sends one real email via
 * RESEND_VS_API_KEY to a safe, clearly-labeled test address (never a real prospect/customer).
 * Resend's response at send time confirms the request was accepted by their system under the
 * correct account/domain; it does not confirm final inbox delivery (that happens
 * asynchronously and isn't observable without inbox access, which is the exact limitation this
 * proves rather than papers over). Always requires CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendVsLeadNotificationEmail({
    to: "claude-email-selftest-delete-me@example.com",
    venueName: "Selftest Venue (diagnostic, not a real venue)",
    customerName: "Selftest Customer",
    customerEmail: "claude-email-selftest-customer@example.com",
    eventType: "OTHER",
    dashboardUrl: "https://venuesprocket.com/app/leads",
  });

  return NextResponse.json({
    ok: result.ok,
    note: "result.ok=true means Resend's API accepted the send under RESEND_VS_API_KEY - it does not confirm inbox delivery, which cannot be observed without inbox access.",
    sendAccepted: result.ok,
    error: result.error,
  });
}
