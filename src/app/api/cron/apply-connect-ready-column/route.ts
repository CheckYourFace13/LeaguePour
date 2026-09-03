import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time, additive-only application of Venue.stripeConnectReadyNotifiedAt (see
 * prisma/migrations/20260903041000_venue_connect_ready_notified) directly through the app's own
 * live DB connection - same pattern as apply-outreach-indexes. Idempotent
 * (ADD COLUMN IF NOT EXISTS). Always requires CRON_SECRET.
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

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "leaguepour_lp"."Venue" ADD COLUMN IF NOT EXISTS "stripeConnectReadyNotifiedAt" TIMESTAMP(3)`,
    );
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'leaguepour_lp' AND table_name = 'Venue' AND column_name = 'stripeConnectReadyNotifiedAt'
    `;
    return NextResponse.json({ ok: true, columnExists: cols.length > 0 });
  } catch (err) {
    console.error("[apply-connect-ready-column] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed." },
      { status: 500 },
    );
  }
}
