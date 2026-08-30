import { NextResponse } from "next/server";
import { getSetting } from "@/lib/app-settings";

export const runtime = "nodejs";

// Decisive test for whether this route is served by a persistent process (increments across
// requests) or a fresh instance per request (always 1).
let hitCount = 0;
const processStartedAt = new Date().toISOString();

const JOB_PATHS = [
  "/api/cron/lp-lifecycle",
  "/api/cron/vs-lifecycle",
  "/api/cron/outreach-send",
  "/api/cron/vs-outreach-send",
  "/api/cron/indexnow-submit",
  "/api/cron/supabase-heartbeat",
];

/**
 * Diagnostic: reports whether the in-process cron scheduler (src/lib/scheduler.ts) is actually
 * alive in the running production process - built to verify the fix for Hostinger's CDN
 * challenging GitHub-Actions-originated cron requests without needing to wait for a real
 * scheduled trigger time. Reads AppSetting rather than importing scheduler.ts's in-memory state
 * directly - Next's standalone output does not guarantee this route and instrumentation.ts
 * share one module instance, so DB-persisted state is the only reliable cross-module signal
 * (see scheduler.ts's own doc comment). Always requires CRON_SECRET.
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
  const [registerError, registerEntered, startedAt, lastTick, lastRuns] = await Promise.all([
    getSetting("scheduler_register_error", ""),
    getSetting("scheduler_register_entered", ""),
    getSetting("scheduler_started_at", ""),
    getSetting("scheduler_last_tick", ""),
    Promise.all(
      JOB_PATHS.map(async (path) => ({
        path,
        lastRun: (await getSetting(`scheduler_last_run${path.replace(/\//g, "_")}`, "")) || null,
      })),
    ),
  ]);

  return NextResponse.json({
    ok: true,
    registerError: registerError || null,
    registerEntered: registerEntered || null,
    schedulerStartedAt: startedAt || null,
    lastTick: lastTick || null,
    jobs: lastRuns,
    processStartedAt,
    hitCount,
    pid: process.pid,
  });
}
