import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function GET(request: Request) {
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
