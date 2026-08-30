import { NextResponse } from "next/server";
import { getSchedulerStatus } from "@/lib/scheduler";

export const runtime = "nodejs";

/**
 * Diagnostic: reports whether the in-process cron scheduler (src/lib/scheduler.ts) is actually
 * alive in the running production process - built to verify the fix for Hostinger's CDN
 * challenging GitHub-Actions-originated cron requests without needing to wait for a real
 * scheduled trigger time or having database access. Always requires CRON_SECRET.
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

  return NextResponse.json({ ok: true, ...getSchedulerStatus() });
}
