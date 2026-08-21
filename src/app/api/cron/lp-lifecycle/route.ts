import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runJob } from "@/lib/job-runs";
import { getLpOwnerEmail, sendLpNudge } from "@/lib/lifecycle-nudges";

/**
 * Daily LeaguePour lifecycle nudges - each check below fires an email at most once per subject
 * (see src/lib/lifecycle-nudges.ts's claimNudge). Runs once/day; auth matches the existing
 * outreach cron pattern (CRON_SECRET only required for the manual=1 path).
 */
const MIN_ACCOUNT_AGE_DAYS = 2;
const MIN_CONNECT_NUDGE_AGE_DAYS = 3;
const MIN_NO_COMPETITION_AGE_DAYS = 3;
const MIN_UNPUBLISHED_AGE_DAYS = 3;
const MIN_ZERO_REG_AGE_DAYS = 5;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function checkNoVenueOnboarding(): Promise<number> {
  const users = await prisma.user.findMany({
    where: {
      createdAt: { lte: daysAgo(MIN_ACCOUNT_AGE_DAYS) },
      venueStaff: { none: {} },
      playerProfile: null,
    },
    select: { id: true, email: true, name: true },
    take: 200,
  });
  let sent = 0;
  for (const u of users) {
    const ok = await sendLpNudge({
      key: `user:${u.id}:no-venue-onboarding`,
      to: u.email,
      subject: "Finish setting up your LeaguePour venue",
      title: `Hi ${u.name ?? "there"}, your LeaguePour account is ready`,
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">Looks like you started creating an account but haven't set up a venue yet. It only takes about two minutes.</p>`,
      ctaPath: "/signup/venue",
      ctaLabel: "Finish setup",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkStripeConnectIncomplete(): Promise<number> {
  const venues = await prisma.venue.findMany({
    where: {
      isDisabled: false,
      stripeChargesEnabled: false,
      competitions: { some: { entryFeeCents: { gt: 0 }, createdAt: { lte: daysAgo(MIN_CONNECT_NUDGE_AGE_DAYS) } } },
    },
    select: { id: true, name: true, slug: true },
    take: 200,
  });
  let sent = 0;
  for (const v of venues) {
    const email = await getLpOwnerEmail(v.id);
    if (!email) continue;
    const ok = await sendLpNudge({
      key: `venue:${v.id}:stripe-connect-incomplete`,
      to: email,
      subject: `Players can't pay entry fees at ${v.name} yet`,
      title: "Connect Stripe to start collecting entry fees",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">You've set an entry fee on a competition, but ${v.name} hasn't connected Stripe yet - players can't pay until that's done. It takes a few minutes.</p>`,
      ctaPath: "/venue/profile",
      ctaLabel: "Connect Stripe",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkNoCompetitionCreated(): Promise<number> {
  const venues = await prisma.venue.findMany({
    where: {
      isDisabled: false,
      subscriptionStatus: { in: ["active", "trialing"] },
      updatedAt: { lte: daysAgo(MIN_NO_COMPETITION_AGE_DAYS) },
      competitions: { none: {} },
    },
    select: { id: true, name: true },
    take: 200,
  });
  let sent = 0;
  for (const v of venues) {
    const email = await getLpOwnerEmail(v.id);
    if (!email) continue;
    const ok = await sendLpNudge({
      key: `venue:${v.id}:no-competition-created`,
      to: email,
      subject: "Ready to publish your first competition?",
      title: "You're subscribed - let's get your first event live",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">${v.name} is all set up on LeaguePour, but you haven't created a competition yet. A dart league, trivia night, or cornhole tournament can be live in a few minutes.</p>`,
      ctaPath: "/venue/competitions/new",
      ctaLabel: "Create your first competition",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkUnpublishedCompetitions(): Promise<number> {
  const comps = await prisma.competition.findMany({
    where: { status: "DRAFT", createdAt: { lte: daysAgo(MIN_UNPUBLISHED_AGE_DAYS) } },
    select: { id: true, title: true, venueId: true, venue: { select: { name: true } } },
    take: 200,
  });
  let sent = 0;
  for (const c of comps) {
    const email = await getLpOwnerEmail(c.venueId);
    if (!email) continue;
    const ok = await sendLpNudge({
      key: `competition:${c.id}:unpublished`,
      to: email,
      subject: `"${c.title}" is still a draft`,
      title: "Ready to publish?",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">You created "${c.title}" for ${c.venue.name} a few days ago but haven't published it yet. Players can't sign up until it's live.</p>`,
      ctaPath: `/venue/competitions/${c.id}`,
      ctaLabel: "Review and publish",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkZeroRegistrations(): Promise<number> {
  const comps = await prisma.competition.findMany({
    where: {
      status: { in: ["SIGNUP_OPEN", "PUBLISHED"] },
      publishedAt: { lte: daysAgo(MIN_ZERO_REG_AGE_DAYS) },
      registrations: { none: {} },
    },
    select: { id: true, title: true, slug: true, venueId: true, venue: { select: { name: true, slug: true } } },
    take: 200,
  });
  let sent = 0;
  for (const c of comps) {
    const email = await getLpOwnerEmail(c.venueId);
    if (!email) continue;
    const ok = await sendLpNudge({
      key: `competition:${c.id}:zero-registrations`,
      to: email,
      subject: `No signups yet for "${c.title}"`,
      title: "Give it a push",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">"${c.title}" has been live for a few days with no registrations yet. Share the signup link or QR code - your venue's public page has both ready to go.</p>`,
      ctaPath: `/venue/competitions/${c.id}`,
      ctaLabel: "Get the signup link",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkCompletedCompetitions(): Promise<number> {
  const comps = await prisma.competition.findMany({
    where: { status: "COMPLETED" },
    select: { id: true, title: true, venueId: true, venue: { select: { name: true } } },
    take: 200,
  });
  let sent = 0;
  for (const c of comps) {
    const email = await getLpOwnerEmail(c.venueId);
    if (!email) continue;
    const ok = await sendLpNudge({
      key: `competition:${c.id}:completed-next-steps`,
      to: email,
      subject: `"${c.title}" wrapped up - run it again?`,
      title: "Keep the momentum going",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a5568;">"${c.title}" at ${c.venue.name} is complete. Duplicate it to start the next season or the next one-night event - all the settings carry over, you just pick new dates.</p>`,
      ctaPath: `/venue/competitions/${c.id}`,
      ctaLabel: "Duplicate this competition",
    });
    if (ok) sent++;
  }
  return sent;
}

export async function GET(request: Request) {
  // Sends real emails to real users, and has no time-window gate the way the outreach crons do
  // (there's no equivalent notion of "the scheduled path" here) - always requires CRON_SECRET,
  // same as the DB heartbeat route, rather than leaving it open to anyone who finds the URL.
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const outcome = await runJob("lp-lifecycle-nudges", async () => {
      const [noVenue, connectIncomplete, noCompetition, unpublished, zeroReg, completed] = await Promise.all([
        checkNoVenueOnboarding(),
        checkStripeConnectIncomplete(),
        checkNoCompetitionCreated(),
        checkUnpublishedCompetitions(),
        checkZeroRegistrations(),
        checkCompletedCompetitions(),
      ]);
      const counts = { noVenue, connectIncomplete, noCompetition, unpublished, zeroReg, completed };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      return {
        status: "success" as const,
        detail: `sent ${total}: ${JSON.stringify(counts)}`,
        result: { ok: true, total, counts },
      };
    });
    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[lp-lifecycle] failed", err);
    return NextResponse.json({ ok: false, error: "LP lifecycle cron failed." }, { status: 500 });
  }
}
