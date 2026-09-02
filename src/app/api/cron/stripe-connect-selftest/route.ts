import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/server";
import { getAppBaseUrl } from "@/lib/stripe/env";

export const runtime = "nodejs";

/**
 * Diagnostic-only: reproduces exactly what createStripeConnectOnboardingAction
 * (src/app/venue/profile/actions.ts) does - stripe.accounts.create + accountLinks.create - but
 * against a single, clearly-labeled test venue (name CLAUDE-TEST-MOBILE-DELETE-ME, created for
 * this pass's live mobile/registration testing) and returns the real Stripe error text instead
 * of Next's redacted production digest, so a 500 seen through the real UI can actually be
 * diagnosed. Never touches any other venue. Always requires CRON_SECRET.
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

  try {
    const venue = await prisma.venue.findFirst({
      where: { name: "CLAUDE-TEST-MOBILE-DELETE-ME" },
      select: { id: true, name: true, stripeAccountId: true },
    });
    if (!venue) {
      return NextResponse.json({ ok: false, error: "Test venue not found - has it already been cleaned up?" });
    }

    const stripe = getStripe();
    let accountId = venue.stripeAccountId;
    const steps: string[] = [];

    if (!accountId) {
      steps.push("creating account");
      const account = await stripe.accounts.create({
        type: "express",
        business_type: "company",
        metadata: { venueId: venue.id },
        company: { name: venue.name },
      });
      accountId = account.id;
      steps.push(`account created: ${account.id}`);
      await prisma.venue.update({ where: { id: venue.id }, data: { stripeAccountId: account.id } });
    } else {
      steps.push(`reusing existing account: ${accountId}`);
    }

    const base = getAppBaseUrl();
    steps.push(`base url: ${base}`);
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/venue/profile?notice=connect-refresh`,
      return_url: `${base}/venue/profile?notice=connect-return`,
      type: "account_onboarding",
    });
    steps.push("account link created");

    return NextResponse.json({ ok: true, steps, onboardingUrlHost: new URL(link.url).host });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      errorName: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
  }
}
