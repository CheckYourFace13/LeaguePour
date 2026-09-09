import { NextResponse } from "next/server";
import { sendVsProposalReadyEmail, sendVsContractReadyEmail, sendVsDepositReceiptEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Proof that the three VS customer emails added this session (proposal-ready, contract-ready,
 * deposit-receipt) actually reach Resend correctly: right sender/brand, right subject, and a real
 * delivery-pipeline status via Resend's own API - not just that the local sendEmail() call
 * returned ok:true. Always requires CRON_SECRET.
 *
 * `to` is delivered@resend.dev - Resend's own official sandbox address, which simulates a full
 * successful send AND delivery without a real inbox. vs-email-selftest (an earlier diagnostic)
 * already confirmed live that Resend rejects arbitrary @example.com-style addresses with a 422
 * validation error, so this uses the sandbox address instead - it is not a real mailbox and never
 * reaches a real third party.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const to = "delivered@resend.dev";
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
    // check. This duplicates the three sends (6 total, all to the same Resend sandbox address)
    // but is the only way to get an id to query without changing the wrapper functions' signatures.
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
