import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Read-only verification that the OutreachContact indexes (migration
 * 20260901235007_outreach_contact_indexes) actually exist in the live database after a
 * `db:push`, and that vsStatus's real column type matches what schema.prisma now declares
 * (String, migration 20260902011524_outreach_contact_vsstatus_type_reconcile) - both via
 * Postgres's own system catalogs, not by trusting the migration files were applied. Never
 * writes anything. Always requires CRON_SECRET.
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
    const indexes = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'leaguepour_lp' AND tablename = 'OutreachContact'
      ORDER BY indexname
    `;
    const expected = [
      "OutreachContact_status_email_emailCheckedAt_idx",
      "OutreachContact_vsEligible_vsStatus_idx",
      "OutreachContact_website_emailCheckedAt_vsEligibilityNote_idx",
    ];
    const found = indexes.map((i) => i.indexname);
    const missing = expected.filter((name) => !found.includes(name));

    const columnType = await prisma.$queryRaw<{ column_name: string; data_type: string; udt_name: string }[]>`
      SELECT column_name, data_type, udt_name FROM information_schema.columns
      WHERE table_schema = 'leaguepour_lp' AND table_name = 'OutreachContact' AND column_name = 'vsStatus'
    `;

    return NextResponse.json({
      ok: missing.length === 0,
      allIndexes: found,
      expectedIndexesPresent: expected.filter((name) => found.includes(name)),
      missingIndexes: missing,
      vsStatusColumn: columnType[0] ?? null,
    });
  } catch (err) {
    console.error("[db-schema-check] failed", err);
    return NextResponse.json({ ok: false, error: "Query failed." }, { status: 500 });
  }
}
