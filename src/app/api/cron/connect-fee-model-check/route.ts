import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { MANAGED_RISK_CONTROLLER } from "@/lib/stripe/connect-controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time diagnostic verifying the Managed Risk controller correction (connect-controller.ts)
 * actually takes effect on a real account, using the exact same MANAGED_RISK_CONTROLLER
 * production account creation now uses - not a hand-rolled reimplementation. Creates one
 * minimal account (no onboarding link ever generated, nothing sent to any browser), reads its
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

  // ?dashboard=full tests losses.payments=stripe with stripe_dashboard.type=full instead of the
  // production MANAGED_RISK_CONTROLLER's express - Stripe's own account-creation validation
  // rejected losses.payments=stripe paired with type=express outright ("the Connect application
  // must control losses"), so this checks whether "full" is the combination that actually
  // allows Stripe-managed risk, per the two options named as candidates. This does NOT change
  // what production account creation uses - see connect-controller.ts for that.
  const dashboardType = url.searchParams.get("dashboard") === "full" ? "full" : undefined;
  const controllerToTest = dashboardType
    ? { ...MANAGED_RISK_CONTROLLER, stripe_dashboard: { type: dashboardType as "full" } }
    : MANAGED_RISK_CONTROLLER;

  const stripe = getStripe();
  let account;
  try {
    account = await stripe.accounts.create({
      controller: controllerToTest,
      metadata: { purpose: "managed-risk-diagnostic-immediately-deleted" },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Account creation failed" },
      { status: 500 },
    );
  }

  const controller = (account as unknown as { controller?: Record<string, unknown> }).controller ?? null;

  let deleted = false;
  let deleteError: string | null = null;
  try {
    await stripe.accounts.del(account.id);
    deleted = true;
  } catch (err) {
    deleteError = err instanceof Error ? err.message : String(err);
    console.error("[connect-fee-model-check] failed to delete diagnostic account", account.id, err);
  }

  const expected = {
    losses: { payments: "stripe" },
    requirement_collection: "stripe",
    stripe_dashboard: { type: dashboardType ?? "express" },
  };
  const actual = controller as { losses?: { payments?: string }; fees?: { payer?: string }; requirement_collection?: string; stripe_dashboard?: { type?: string } } | null;
  const matches =
    actual?.losses?.payments === "stripe" &&
    actual?.requirement_collection === "stripe" &&
    actual?.stripe_dashboard?.type === (dashboardType ?? "express");

  return NextResponse.json({
    ok: true,
    note: "Diagnostic account created and deleted in this same request - never exposed to any UI/onboarding link.",
    managedRiskConfirmed: matches,
    expected,
    controller,
    deleted,
    deleteError,
  });
}
