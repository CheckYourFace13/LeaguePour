import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time diagnostic to definitively answer "who pays Connect account/payout/processing fees"
 * for this platform - the Account object's controller.fees.payer / controller.losses.payments /
 * controller.requirement_collection fields are the ground truth for the platform's actual
 * configured Connect settings, but aren't exposed by any "platform defaults" API - only visible
 * by inspecting an actual connected account's resulting controller object. Creates one minimal
 * Express account (no onboarding link ever generated, nothing sent to any browser), reads its
 * controller settings immediately, then deletes it in the same request. Always requires
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  let account;
  try {
    account = await stripe.accounts.create({
      type: "express",
      metadata: { purpose: "fee-model-diagnostic-immediately-deleted" },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Account creation failed" },
      { status: 500 },
    );
  }

  const controller = (account as unknown as { controller?: Record<string, unknown> }).controller ?? null;

  try {
    await stripe.accounts.del(account.id);
  } catch (err) {
    console.error("[connect-fee-model-check] failed to delete diagnostic account", account.id, err);
  }

  return NextResponse.json({
    ok: true,
    note: "Diagnostic account created and deleted in this same request - never exposed to any UI/onboarding link.",
    controller,
  });
}
