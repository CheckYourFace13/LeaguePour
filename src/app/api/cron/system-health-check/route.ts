import { NextResponse } from "next/server";
import { getSystemHealthMetrics } from "@/lib/admin-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time diagnostic: calls the exact same getSystemHealthMetrics() the /internal/admin System
 * health panel renders, to prove the data layer computes without error in production (I have no
 * owner login to screenshot the authenticated page itself). Read-only. Always requires
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

  try {
    const health = await getSystemHealthMetrics();
    return NextResponse.json({ ok: true, health });
  } catch (err) {
    console.error("[system-health-check] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Check failed." },
      { status: 500 },
    );
  }
}
