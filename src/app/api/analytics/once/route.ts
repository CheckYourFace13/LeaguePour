import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CompetitionStatus } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Once-only key events. The browser asks before sending; the server answers `send` to exactly one
 * request per (event, subject) by inserting a claim row (primary key = the identity), so reloads,
 * extra tabs and revisited URLs never count the same milestone twice. Each event checks its own
 * precondition server-side and is scoped to the signed-in venue.
 */
const CHECKS: Record<string, (venueId: string, subject: string) => Promise<boolean>> = {
  // One per venue: the inquiry page exists as soon as the venue does.
  inquiry_page_ready: async (venueId, subject) => subject === venueId,
  // One per competition, only once it is actually live.
  competition_published: async (venueId, subject) =>
    (await prisma.competition.count({
      where: {
        id: subject,
        venueId,
        status: { in: [CompetitionStatus.PUBLISHED, CompetitionStatus.SIGNUP_OPEN, CompetitionStatus.SIGNUP_CLOSED, CompetitionStatus.IN_PROGRESS] },
      },
    })) === 1,
};

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string } } | null;
  return e?.code === "P2002" || e?.cause?.code === "23505" || /Unique constraint|duplicate key/i.test(e?.message ?? "");
}

export async function POST(req: Request) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ send: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { event?: string; subject?: string };
  const check = body.event ? CHECKS[body.event] : undefined;
  const subject = String(body.subject ?? "").slice(0, 64);
  if (!check || !subject || !(await check(access.venueId, subject))) return NextResponse.json({ send: false });
  try {
    await prisma.appSetting.create({
      data: { key: `analytics_once:${body.event}:${subject}`, value: new Date().toISOString() },
    });
    return NextResponse.json({ send: true });
  } catch (err) {
    if (isUniqueViolation(err)) return NextResponse.json({ send: false });
    throw err;
  }
}
