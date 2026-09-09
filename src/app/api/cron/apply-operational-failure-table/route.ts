import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time, additive-only application of the OperationalFailure table (see
 * prisma/migrations/20260909213000_operational_failure_log) directly through the app's own live
 * DB connection - same pattern as apply-connect-ready-column/apply-outreach-indexes. Idempotent
 * (CREATE TABLE/INDEX IF NOT EXISTS). Always requires CRON_SECRET.
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
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "leaguepour_lp"."OperationalFailure" (
          "id" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "summary" TEXT NOT NULL,
          "venueId" TEXT,
          "detail" TEXT,
          "retryable" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "OperationalFailure_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "OperationalFailure_category_createdAt_idx" ON "leaguepour_lp"."OperationalFailure"("category", "createdAt")`,
    );
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'leaguepour_lp' AND table_name = 'OperationalFailure'
    `;
    return NextResponse.json({ ok: true, tableExists: tables.length > 0 });
  } catch (err) {
    console.error("[apply-operational-failure-table] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed." },
      { status: 500 },
    );
  }
}
