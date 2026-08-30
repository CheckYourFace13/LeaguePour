import { NextResponse } from "next/server";
import { getSchedulerStatus } from "@/lib/scheduler";
import { getSetting } from "@/lib/app-settings";

export const runtime = "nodejs";

// Decisive test for whether this route is served by a persistent process (increments across
// requests) or a fresh instance per request (always 1) - see this route's registerError field
// for context on what this is diagnosing.
let hitCount = 0;
const processStartedAt = new Date().toISOString();

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

  hitCount += 1;
  const [registerError, registerEntered] = await Promise.all([
    getSetting("scheduler_register_error", ""),
    getSetting("scheduler_register_entered", ""),
  ]);
  return NextResponse.json({
    ok: true,
    ...getSchedulerStatus(),
    registerError: registerError || null,
    registerEntered: registerEntered || null,
    processStartedAt,
    hitCount,
    pid: process.pid,
  });
}
