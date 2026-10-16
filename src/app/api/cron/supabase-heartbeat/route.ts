import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withScheduledSlot } from "@/lib/job-claims";

function getCronSecret(): string | undefined {
  const secret = process.env.CRON_SECRET?.trim();
  return secret || undefined;
}

function isAuthorized(request: Request, secret: string): boolean {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret === secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  return false;
}

async function handle(request: Request): Promise<Response> {
  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.$queryRaw<{ now: Date }[]>`SELECT now() as now`;
    const timestamp = rows[0]?.now?.toISOString() ?? new Date().toISOString();
    return NextResponse.json({ ok: true, timestamp });
  } catch {
    return NextResponse.json({ ok: false, error: "Database heartbeat failed." }, { status: 500 });
  }
}

// Scheduler-triggered runs execute at most once per slot, even if a response is lost - see job-claims.ts.
export const GET = withScheduledSlot("supabase-heartbeat", handle);
