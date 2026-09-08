import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only: lists a venue's competitions by exact venue name (title/status/registration count
 * only - no player PII). Built for the Q's Wine Bar draft-gridlock P0. Never writes anything.
 * Always requires CRON_SECRET.
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
  const venueName = url.searchParams.get("venue");
  if (!venueName) {
    return NextResponse.json({ ok: false, error: "Missing ?venue=<exact name>" }, { status: 400 });
  }

  const venue = await prisma.venue.findFirst({ where: { name: venueName }, select: { id: true, billingPlan: true } });
  if (!venue) return NextResponse.json({ ok: true, found: false });

  const competitions = await prisma.competition.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const activeCount = competitions.filter((c) =>
    ["PUBLISHED", "SIGNUP_OPEN", "SIGNUP_CLOSED", "IN_PROGRESS"].includes(c.status),
  ).length;

  return NextResponse.json({
    ok: true,
    found: true,
    billingPlan: venue.billingPlan,
    activeCountUnderNewLogic: activeCount,
    competitions: competitions.map((c) => ({
      title: c.title,
      status: c.status,
      registrations: c._count.registrations,
      createdAt: c.createdAt,
    })),
  });
}
