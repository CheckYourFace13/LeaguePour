import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runJob } from "@/lib/job-runs";
import { getVsNotifyEmail, sendVsNudge } from "@/lib/lifecycle-nudges";

/**
 * Daily VenueSprocket lifecycle nudges - each check fires an email at most once per subject
 * (see src/lib/lifecycle-nudges.ts's claimNudge). "New inquiry -> immediate notification"
 * already exists (sendVsLeadNotificationEmail, fired synchronously on submission in
 * src/lib/actions/vs.ts) and is NOT duplicated here - this route only covers the follow-up/
 * stale-state nudges that nothing currently sends.
 */
const MIN_CONFIG_AGE_DAYS = 2;
const MIN_LEAD_UNTOUCHED_DAYS = 2;
const MIN_PROPOSAL_AGE_DAYS = 3;
const MIN_CONTRACT_AGE_DAYS = 3;
const MIN_DEPOSIT_AGE_DAYS = 3;
const BEO_REMINDER_WINDOW_DAYS = 7;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function checkSetupIncomplete(): Promise<number> {
  const configs = await prisma.venueVsConfig.findMany({
    where: { publicEmail: null, createdAt: { lte: daysAgo(MIN_CONFIG_AGE_DAYS) } },
    select: { venueId: true, venue: { select: { name: true } } },
    take: 200,
  });
  let sent = 0;
  for (const c of configs) {
    const email = await getVsNotifyEmail(c.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `venue:${c.venueId}:vs-setup-incomplete`,
      to: email,
      subject: "One thing left to finish your VenueSprocket setup",
      title: "Add a contact email for inquiries",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">${c.venue.name}'s inquiry page is live, but there's no contact email set - that's where new inquiry notifications go. Add one in settings so you don't miss a lead.</p>`,
      ctaPath: "/app/settings",
      ctaLabel: "Add contact email",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkLeadUntouched(): Promise<number> {
  const leads = await prisma.privateEventLead.findMany({
    where: { status: "NEW", createdAt: { lte: daysAgo(MIN_LEAD_UNTOUCHED_DAYS) } },
    select: { id: true, venueId: true, customerName: true, eventType: true },
    take: 200,
  });
  let sent = 0;
  for (const l of leads) {
    const email = await getVsNotifyEmail(l.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `lead:${l.id}:untouched`,
      to: email,
      subject: `Still waiting on a reply: ${l.customerName}`,
      title: "A lead is waiting for a response",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">${l.customerName}'s inquiry has been sitting for a couple of days with no response. Fast replies win more bookings - most people are asking more than one venue.</p>`,
      ctaPath: `/app/leads/${l.id}`,
      ctaLabel: "View inquiry",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkProposalPending(): Promise<number> {
  const proposals = await prisma.vsProposal.findMany({
    where: { status: "SENT", createdAt: { lte: daysAgo(MIN_PROPOSAL_AGE_DAYS) } },
    select: { id: true, privateEvent: { select: { eventName: true, venueId: true } } },
    take: 200,
  });
  let sent = 0;
  for (const p of proposals) {
    const email = await getVsNotifyEmail(p.privateEvent.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `proposal:${p.id}:pending-followup`,
      to: email,
      subject: `Proposal for "${p.privateEvent.eventName}" still pending`,
      title: "Follow up on a sent proposal",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">The proposal for "${p.privateEvent.eventName}" hasn't been accepted yet. A quick follow-up call or email often moves things along.</p>`,
      ctaPath: "/app/proposals",
      ctaLabel: "View proposal",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkContractPending(): Promise<number> {
  const contracts = await prisma.vsContract.findMany({
    where: { status: "SENT", createdAt: { lte: daysAgo(MIN_CONTRACT_AGE_DAYS) } },
    select: { id: true, privateEvent: { select: { eventName: true, venueId: true } } },
    take: 200,
  });
  let sent = 0;
  for (const c of contracts) {
    const email = await getVsNotifyEmail(c.privateEvent.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `contract:${c.id}:pending-signature`,
      to: email,
      subject: `Contract for "${c.privateEvent.eventName}" awaiting signature`,
      title: "A contract is still waiting to be signed",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">"${c.privateEvent.eventName}"'s contract went out a few days ago and hasn't been signed. Worth a nudge to the customer.</p>`,
      ctaPath: "/app/contracts",
      ctaLabel: "View contract",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkDepositUnpaid(): Promise<number> {
  const payments = await prisma.vsPayment.findMany({
    where: { status: "PENDING", createdAt: { lte: daysAgo(MIN_DEPOSIT_AGE_DAYS) } },
    select: { id: true, venueId: true, privateEvent: { select: { eventName: true } } },
    take: 200,
  });
  let sent = 0;
  for (const p of payments) {
    const email = await getVsNotifyEmail(p.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `payment:${p.id}:deposit-unpaid`,
      to: email,
      subject: `Deposit still unpaid for "${p.privateEvent.eventName}"`,
      title: "Deposit hasn't come through yet",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">The deposit for "${p.privateEvent.eventName}" is still marked unpaid. Consider following up before the date gets closer.</p>`,
      ctaPath: "/app/payments",
      ctaLabel: "View payment",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkBeoReadiness(): Promise<number> {
  const events = await prisma.privateEvent.findMany({
    where: {
      status: { in: ["CONFIRMED", "BEO_DRAFT"] },
      eventDate: { gte: new Date(), lte: daysFromNow(BEO_REMINDER_WINDOW_DAYS) },
    },
    select: { id: true, eventName: true, venueId: true, eventDate: true },
    take: 200,
  });
  let sent = 0;
  for (const e of events) {
    const email = await getVsNotifyEmail(e.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `event:${e.id}:beo-readiness`,
      to: email,
      subject: `BEO check: "${e.eventName}" is coming up`,
      title: "Event is coming up soon",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">"${e.eventName}" is happening on ${e.eventDate.toLocaleDateString()}. Make sure the BEO is finalized so your staff know the plan.</p>`,
      ctaPath: `/app/events/${e.id}`,
      ctaLabel: "Review BEO",
    });
    if (ok) sent++;
  }
  return sent;
}

async function checkCompletedFollowUp(): Promise<number> {
  const events = await prisma.privateEvent.findMany({
    where: { status: "COMPLETED" },
    select: { id: true, eventName: true, venueId: true },
    take: 200,
  });
  let sent = 0;
  for (const e of events) {
    const email = await getVsNotifyEmail(e.venueId);
    if (!email) continue;
    const ok = await sendVsNudge({
      key: `event:${e.id}:completed-followup`,
      to: email,
      subject: `"${e.eventName}" is done - worth a rebooking follow-up?`,
      title: "Event wrapped up",
      bodyHtml: `<p style="margin:0 0 14px;line-height:1.6;font-size:15px;color:#4a4038;">"${e.eventName}" is complete. A quick thank-you note to the customer, with an offer to book their next event, is one of the highest-return follow-ups you can send.</p>`,
      ctaPath: `/app/events/${e.id}`,
      ctaLabel: "View event",
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
    const outcome = await runJob("vs-lifecycle-nudges", async () => {
      const [setupIncomplete, leadUntouched, proposalPending, contractPending, depositUnpaid, beoReadiness, completedFollowUp] =
        await Promise.all([
          checkSetupIncomplete(),
          checkLeadUntouched(),
          checkProposalPending(),
          checkContractPending(),
          checkDepositUnpaid(),
          checkBeoReadiness(),
          checkCompletedFollowUp(),
        ]);
      const counts = {
        setupIncomplete,
        leadUntouched,
        proposalPending,
        contractPending,
        depositUnpaid,
        beoReadiness,
        completedFollowUp,
      };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      return {
        status: "success" as const,
        detail: `sent ${total}: ${JSON.stringify(counts)}`,
        result: { ok: true, total, counts },
      };
    });
    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[vs-lifecycle] failed", err);
    return NextResponse.json({ ok: false, error: "VS lifecycle cron failed." }, { status: 500 });
  }
}
