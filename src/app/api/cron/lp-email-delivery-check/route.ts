import { NextResponse } from "next/server";
import {
  sendRegistrationConfirmationEmail,
  sendConnectReadyEmail,
} from "@/lib/email";
import { sendLpNudge } from "@/lib/lifecycle-nudges";

export const runtime = "nodejs";

/**
 * LP counterpart to /api/cron/vs-email-delivery-check - proves the real LP transactional email
 * functions (registration confirmation, Connect-ready owner notification, and a lifecycle nudge
 * via sendLpNudge) actually reach Resend correctly and get delivered, via Resend's own API - not
 * just a local sendEmail() ok:true. All three go to delivered@resend.dev, Resend's own sandbox
 * address (simulates a full successful send+delivery, no real inbox). Always requires
 * CRON_SECRET. The lifecycle-nudge send uses a throwaway key so it never collides with (or gets
 * permanently blocked by) a real nudge's claim row.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const to = "delivered@resend.dev";

  try {
    const [registrationRes, connectReadyRes, nudgeSent] = await Promise.all([
      sendRegistrationConfirmationEmail({
        to,
        playerName: "Delivery Check Player",
        competitionTitle: "Delivery Check Competition",
        venueName: "CLAUDE-TEST-EMAIL-DELIVERY-CHECK-DELETE-ME",
        competitionUrl: "https://leaguepour.com/c/delivery-check",
        entryFeeCents: 500,
        currency: "usd",
      }),
      sendConnectReadyEmail({
        to,
        venueName: "CLAUDE-TEST-EMAIL-DELIVERY-CHECK-DELETE-ME",
        chargesEnabled: true,
        payoutsEnabled: true,
      }),
      sendLpNudge({
        key: `delivery-check-${Date.now()}`, // unique every run - never collides with a real nudge key
        to,
        subject: "[delivery check] lifecycle nudge",
        title: "Delivery check nudge",
        bodyHtml: "<p>Delivery check - lifecycle nudge</p>",
        ctaPath: "/venue/dashboard",
        ctaLabel: "Open dashboard",
      }),
    ]);

    const key = process.env.RESEND_API_KEY?.trim() || null;
    if (!key) {
      return NextResponse.json({
        ok: true,
        wrapperSendResults: { registrationRes, connectReadyRes, nudgeSent },
        resendStatus: "RESEND_API_KEY not set",
      });
    }

    // Same duplicate-send-to-get-an-id approach as vs-email-delivery-check - sendEmail()'s id
    // isn't surfaced through these wrapper functions' {ok: boolean} return type.
    const rawSend = async (subject: string, html: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.RESEND_FROM?.trim() || "LeaguePour <onboarding@resend.dev>", to: [to], subject, html }),
      });
      const body = await res.json().catch(() => ({}));
      return { httpOk: res.ok, id: body.id as string | undefined };
    };

    const sent = await Promise.all([
      rawSend("[delivery check] registration confirmation", "<p>Delivery check - registration confirmation</p>"),
      rawSend("[delivery check] connect ready", "<p>Delivery check - connect ready</p>"),
      rawSend("[delivery check] lifecycle nudge", "<p>Delivery check - lifecycle nudge</p>"),
    ]);

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
      wrapperFunctionSendResults: { registrationRes, connectReadyRes, nudgeSent },
      rawResendSendAccepted: sent.map((s) => ({ httpOk: s.httpOk, id: s.id })),
      resendDeliveryStatus: statuses,
    });
  } catch (err) {
    console.error("[lp-email-delivery-check] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Check failed." },
      { status: 500 },
    );
  }
}
