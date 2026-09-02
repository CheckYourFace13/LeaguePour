import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/server";
import { getAppBaseUrl } from "@/lib/stripe/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Temporary diagnostic: runs the exact same advisory-lock + stripe.accounts.create +
 * stripe.accountLinks.create sequence as createStripeConnectOnboardingAction, against one named
 * test venue, surfacing the real error instead of the generic connect-error redirect - to debug
 * why the real UI action failed after Connect activation. Never touches Rachel/Q's Wine Bar.
 * Always requires CRON_SECRET. Delete this route once the P0 is closed.
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
  const venueName = url.searchParams.get("venue");
  if (!venueName || !venueName.startsWith("CLAUDE-TEST-")) {
    return NextResponse.json({ ok: false, error: "Missing/invalid ?venue= (must be a CLAUDE-TEST- venue)" }, { status: 400 });
  }

  const venue = await prisma.venue.findFirst({ where: { name: venueName } });
  if (!venue) return NextResponse.json({ ok: false, error: "Venue not found" }, { status: 404 });

  const stripe = getStripe();
  const base = getAppBaseUrl();

  try {
    const link = await prisma.$transaction(
      async (tx) => {
        const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
          SELECT pg_try_advisory_xact_lock(842910100, hashtext(${venue.id})) AS locked
        `;
        if (!locked) throw new Error("lock not acquired");

        let accountId = venue.stripeAccountId;
        if (!accountId) {
          const account = await stripe.accounts.create({
            type: "express",
            metadata: { venueId: venue.id },
          });
          accountId = account.id;
          await tx.venue.update({ where: { id: venue.id }, data: { stripeAccountId: account.id } });
        }

        return stripe.accountLinks.create({
          account: accountId,
          refresh_url: `${base}/venue/profile?notice=connect-refresh`,
          return_url: `${base}/venue/profile?notice=connect-return`,
          type: "account_onboarding",
        });
      },
      { timeout: 30_000 },
    );
    return NextResponse.json({ ok: true, linkUrl: link.url });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : null,
        stripeErrorType: (err as { type?: string })?.type ?? null,
        stripeErrorCode: (err as { code?: string })?.code ?? null,
      },
      { status: 500 },
    );
  }
}
