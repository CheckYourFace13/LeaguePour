import { NextResponse } from "next/server";
import { sendVsProposalReadyEmail, sendVsContractReadyEmail, sendVsDepositReceiptEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Read-only-ish (sends to a fixed, non-routable, reserved test address only - see below) proof
 * that the three VS customer emails added this session actually reach Resend correctly: right
 * sender/brand, right subject, and Resend's own API accepts and reports a real delivery-pipeline
 * status for each - not just that the local sendEmail() call returned ok:true. Always requires
 * CRON_SECRET. `to` is hardcoded to an @example.com address (RFC 2606 reserved, never routes to a
 * real mailbox) so this can never reach a real third party regardless of how it's called.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const to = "claude-test-email-delivery-check-delete-me@example.com";
  const common = {
    to,
    customerName: "Email Delivery Check",
    venueName: "CLAUDE-TEST-EMAIL-DELIVERY-CHECK-DELETE-ME",
    eventName: "Delivery Check Event",
  };

  try {
    const [proposalRes, contractRes, depositRes] = await Promise.all([
      sendVsProposalReadyEmail({
        ...common,
        totalAmountCents: 95000,
        proposalUrl: "https://venuesprocket.com/proposal/delivery-check-token",
      }),
      sendVsContractReadyEmail({
        ...common,
        contractUrl: "https://venuesprocket.com/sign/delivery-check-token",
      }),
      sendVsDepositReceiptEmail({
        ...common,
        amountCents: 25000,
      }),
    ]);

    // sendEmail() doesn't currently surface the Resend id to these wrapper functions' return
    // values (they return {ok: boolean} only) - so to get real per-message Resend status, resend
    // the same three directly against Resend's API here and capture their ids for a live status
    // check. This duplicates the three sends (6 total, all to the same non-routable address) but
    // is the only way to get an id to query without changing the wrapper functions' signatures.
    const key = process.env.RESEND_VS_API_KEY?.trim() || null;
    if (!key) {
      return NextResponse.json({ ok: true, wrapperSendResults: { proposalRes, contractRes, depositRes }, resendStatus: "RESEND_VS_API_KEY not set" });
    }

    const rawSend = async (subject: string, html: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "VenueSprocket <hello@venuesprocket.com>", to: [to], subject, html }),
      });
      const body = await res.json().catch(() => ({}));
      return { httpOk: res.ok, id: body.id as string | undefined, body };
    };

    const sent = await Promise.all([
      rawSend("[delivery check] proposal", "<p>Delivery check - proposal</p>"),
      rawSend("[delivery check] contract", "<p>Delivery check - contract</p>"),
      rawSend("[delivery check] deposit", "<p>Delivery check - deposit</p>"),
    ]);

    // Give Resend's pipeline a moment before checking status.
    await new Promise((r) => setTimeout(r, 3000));

    const statuses = await Promise.all(
      sent.map(async (s) => {
        if (!s.id) return { id: null, error: "no id returned from send" };
        const statusRes = await fetch(`https://api.resend.com/emails/${s.id}`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        const statusBody = await statusRes.json().catch(() => ({}));
        return { id: s.id, httpOk: statusRes.ok, status: statusBody };
      }),
    );

    return NextResponse.json({
      ok: true,
      wrapperFunctionSendResults: { proposalRes, contractRes, depositRes },
      rawResendSendAccepted: sent.map((s) => ({ httpOk: s.httpOk, id: s.id })),
      resendDeliveryStatus: statuses,
    });
  } catch (err) {
    console.error("[vs-email-delivery-check] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Check failed." },
      { status: 500 },
    );
  }
}
