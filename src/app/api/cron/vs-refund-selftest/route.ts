import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { VsPaymentStatus, VsEventStatus } from "@/generated/prisma/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY certification-only helper for the VS deposit refund flow (src/lib/actions/
 * vs-deposit-refund.ts). Creates two disposable venues, each with an owner account and a
 * PrivateEvent, plus VsPayment rows whose Stripe fields are DELIBERATELY fake
 * (pi_selftest_nonexistent_*) so the refund action's real stripe.refunds.create() call fails
 * safely - this exercises authorization, venue-scoping, the already-refunded guard, the
 * failure path, OperationalFailure logging, and the UI states WITHOUT ever creating a real
 * charge. Remove this route (and its workflow) once the refund flow is verified.
 *
 * GET ?seed=1     -> create/refresh the disposable data, return credentials + ids
 * GET ?failures=1 -> return the most recent OperationalFailure rows (to confirm logging)
 * Always requires CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  if (url.searchParams.get("failures") === "1") {
    const rows = await prisma.operationalFailure.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, category: true, summary: true, venueId: true, retryable: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, recentFailures: rows });
  }

  if (url.searchParams.get("seed") !== "1") {
    return NextResponse.json({ ok: false, error: "pass ?seed=1 or ?failures=1" }, { status: 400 });
  }

  const password = "TestPass123!";
  const passwordHash = await bcrypt.hash(password, 10);
  const out: Record<string, unknown>[] = [];

  for (const tag of ["A", "B"]) {
    const venueName = `CLAUDE-VS-REFUND-TEST-${tag}-DELETE-ME`;
    const slug = `claude-vs-refund-test-${tag.toLowerCase()}-delete-me`;
    const ownerEmail = `${slug}-owner@example.com`;

    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: { passwordHash },
      create: { email: ownerEmail, name: `VS Refund Test Owner ${tag}`, passwordHash },
    });

    let venue = await prisma.venue.findFirst({ where: { name: venueName } });
    if (!venue) {
      venue = await prisma.venue.create({
        data: {
          name: venueName,
          slug,
          venueType: "bar",
          description: "Disposable venue for the VS deposit-refund flow selftest.",
          // A fake connected-account id so the action's venue.stripeAccountId guard passes and
          // it proceeds to the (failing) stripe.refunds.create() call.
          stripeAccountId: `acct_selftest_${tag}_nonexistent`,
          staff: { create: { userId: owner.id, role: "OWNER" } },
        },
      });
    } else {
      await prisma.venueStaff.upsert({
        where: { venueId_userId: { venueId: venue.id, userId: owner.id } },
        update: { role: "OWNER" },
        create: { venueId: venue.id, userId: owner.id, role: "OWNER" },
      });
    }

    const event = await prisma.privateEvent.create({
      data: {
        venueId: venue.id,
        eventName: `Refund Selftest Event ${tag}`,
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startTime: "18:00",
        endTime: "22:00",
        status: VsEventStatus.CONFIRMED,
      },
    });

    const paidPayment = await prisma.vsPayment.create({
      data: {
        venueId: venue.id,
        privateEventId: event.id,
        amountCents: 2500,
        currency: "USD",
        type: "deposit",
        status: VsPaymentStatus.PAID,
        paidAt: new Date(),
        stripePaymentIntentId: `pi_selftest_nonexistent_${tag}_${Date.now()}`,
        stripeCheckoutSessionId: `cs_selftest_${tag}_${Date.now()}`,
      },
    });

    const refundedPayment = await prisma.vsPayment.create({
      data: {
        venueId: venue.id,
        privateEventId: event.id,
        amountCents: 1500,
        currency: "USD",
        type: "deposit",
        status: VsPaymentStatus.REFUNDED,
        paidAt: new Date(Date.now() - 86400000),
        stripePaymentIntentId: `pi_selftest_refunded_${tag}_${Date.now()}`,
      },
    });

    out.push({
      tag,
      venueName,
      ownerEmail,
      password,
      eventId: event.id,
      paidVsPaymentId: paidPayment.id,
      refundedVsPaymentId: refundedPayment.id,
    });
  }

  return NextResponse.json({ ok: true, venues: out });
}
