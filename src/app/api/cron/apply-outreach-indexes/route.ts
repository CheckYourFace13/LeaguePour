import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time, additive-only application of the OutreachContact indexes from
 * prisma/migrations/20260901235007_outreach_contact_indexes - executed directly through the
 * app's own live DATABASE_URL (no db push, no migrate deploy - this sandbox has never had a
 * direct DB connection string, but the deployed app does). Every statement is
 * CREATE INDEX IF NOT EXISTS, so this is idempotent and safe to call more than once; a later
 * db push/migrate deploy will see these already exist and no-op correctly. Always requires
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

  const statements = [
    `CREATE INDEX IF NOT EXISTS "OutreachContact_status_email_emailCheckedAt_idx" ON "leaguepour_lp"."OutreachContact" ("status", "email", "emailCheckedAt")`,
    `CREATE INDEX IF NOT EXISTS "OutreachContact_vsEligible_vsStatus_idx" ON "leaguepour_lp"."OutreachContact" ("vsEligible", "vsStatus")`,
    `CREATE INDEX IF NOT EXISTS "OutreachContact_website_emailCheckedAt_vsEligibilityNote_idx" ON "leaguepour_lp"."OutreachContact" ("website", "emailCheckedAt", "vsEligibilityNote")`,
  ];

  const results: { statement: string; ok: boolean; error?: string }[] = [];
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      results.push({ statement: stmt, ok: true });
    } catch (err) {
      results.push({ statement: stmt, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const allIndexes = await prisma.$queryRaw<{ indexname: string }[]>`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'leaguepour_lp' AND tablename = 'OutreachContact'
  `;

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    results,
    allIndexesNow: allIndexes.map((i) => i.indexname),
  });
}
