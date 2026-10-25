/**
 * Entitlement, grandfathering, concurrency and conversion-dedup checks against a REAL Postgres
 * (advisory locks and unique keys need the real thing). No Stripe or email calls.
 *
 *   TEST_DATABASE_URL="postgresql://postgres@127.0.0.1:55432/lpqa?schema=leaguepour_lp" \
 *     npx tsx scripts/check-entitlements.ts
 *
 * Refuses to run unless TEST_DATABASE_URL points at a loopback host: it deletes and seeds venues,
 * competitions, VS records and AppSetting rows.
 */
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  console.error("TEST_DATABASE_URL must point at a local throwaway database (127.0.0.1/localhost).");
  process.exit(2);
}
process.env.DATABASE_URL = url;

async function main() {
  const { prisma } = await import("../src/lib/db");
  const lp = await import("../src/lib/entitlements/lp-capacity");
  const vs = await import("../src/lib/entitlements/vs");
  const conv = await import("../src/lib/conversions");
  const { BillingPlan, VsPlan, CompetitionStatus } = await import("../src/generated/prisma/enums");

  const BEFORE = new Date(lp.LP_FREE_ALLOWANCE_CUTOFF.getTime() - 30 * 86_400_000);
  const AFTER = new Date(lp.LP_FREE_ALLOWANCE_CUTOFF.getTime() + 86_400_000);
  assert.equal(lp.LP_FREE_ALLOWANCE_CUTOFF.getTime(), vs.VS_ENTITLEMENTS_CUTOFF.getTime(), "one cutover for both brands");

  let n = 0;
  let seq = 0;
  const reset = async () => {
    await prisma.vsBeo.deleteMany({});
    await prisma.vsPayment.deleteMany({});
    await prisma.vsContract.deleteMany({});
    await prisma.vsProposal.deleteMany({});
    await prisma.privateEvent.deleteMany({});
    await prisma.privateEventLead.deleteMany({});
    await prisma.venueVsConfig.deleteMany({});
    await prisma.prizeStructure.deleteMany({});
    await prisma.competition.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.appSetting.deleteMany({});
  };
  const check = async (name: string, fn: () => Promise<void>) => {
    await reset();
    await fn();
    n++;
    console.log("ok -", name);
  };
  const venue = async (data: { createdAt: Date; billingPlan?: (typeof BillingPlan)[keyof typeof BillingPlan]; subscriptionStatus?: string | null; subscriptionId?: string | null }) =>
    prisma.venue.create({
      data: {
        name: `QA Venue ${++seq}`,
        slug: `qa-venue-${seq}`,
        venueType: "Bar",
        description: "QA",
        createdAt: data.createdAt,
        billingPlan: data.billingPlan ?? BillingPlan.STARTER,
        subscriptionStatus: data.subscriptionStatus ?? null,
        subscriptionId: data.subscriptionId ?? null,
      },
    });
  const comp = (venueId: string, status: (typeof CompetitionStatus)[keyof typeof CompetitionStatus]) => ({
    venueId,
    title: `Night ${++seq}`,
    slug: `night-${seq}`,
    kind: "DARTS" as const,
    description: "QA",
    signupOpenAt: new Date(),
    signupCloseAt: new Date(Date.now() + 86_400_000),
    startAt: new Date(Date.now() + 2 * 86_400_000),
    endAt: new Date(Date.now() + 3 * 86_400_000),
    teamFormat: "SOLO" as const,
    rules: "QA",
    scheduleKind: "ONE_TIME" as const,
    bracketKind: "ROUND_ROBIN" as const,
    status,
  });
  const limitOf = async (id: string) => {
    const v = await prisma.venue.findUniqueOrThrow({ where: { id }, select: { createdAt: true, billingPlan: true, subscriptionStatus: true } });
    return lp.activeCompetitionLimit(v);
  };

  // ── LeaguePour capacity ────────────────────────────────────────────────────
  await check("LP: existing (pre-cutover) venue without a plan keeps its 2 free", async () => {
    const v = await venue({ createdAt: BEFORE });
    assert.equal(await limitOf(v.id), 2);
  });
  await check("LP: existing venue with a manually set plan and no subscription is unchanged (grandfathered)", async () => {
    const v = await venue({ createdAt: BEFORE, billingPlan: BillingPlan.GROWTH });
    assert.equal(await limitOf(v.id), 9);
  });
  await check("LP: new venue without a subscription gets 1", async () => {
    const v = await venue({ createdAt: AFTER });
    assert.equal(await limitOf(v.id), 1);
  });
  await check("LP: new venue paid capacity per status (active/trialing/past_due/unpaid keep plan; others free)", async () => {
    const expect: Record<string, number> = { active: 9, trialing: 9, past_due: 9, unpaid: 9, incomplete: 1, incomplete_expired: 1, canceled: 1, paused: 1 };
    for (const [status, lim] of Object.entries(expect)) {
      const v = await venue({ createdAt: AFTER, billingPlan: BillingPlan.GROWTH, subscriptionStatus: status, subscriptionId: `sub_${status}_${seq}` });
      assert.equal(await limitOf(v.id), lim, status);
    }
    const s = await venue({ createdAt: AFTER, billingPlan: BillingPlan.STARTER, subscriptionStatus: "active" });
    assert.equal(await limitOf(s.id), 2, "Starter subscriber");
    const e = await venue({ createdAt: AFTER, billingPlan: BillingPlan.ELITE, subscriptionStatus: "active" });
    assert.equal(await limitOf(e.id), Number.POSITIVE_INFINITY, "Elite subscriber");
  });
  await check("LP: slot is refused at the limit and drafts/completed never count", async () => {
    const v = await venue({ createdAt: AFTER });
    await prisma.competition.create({ data: comp(v.id, CompetitionStatus.DRAFT) });
    await prisma.competition.create({ data: comp(v.id, CompetitionStatus.COMPLETED) });
    const first = await lp.withActiveCompetitionSlot(v.id, {}, (tx) => tx.competition.create({ data: comp(v.id, CompetitionStatus.SIGNUP_OPEN) }));
    assert.equal(first.ok, true);
    const second = await lp.withActiveCompetitionSlot(v.id, {}, (tx) => tx.competition.create({ data: comp(v.id, CompetitionStatus.SIGNUP_OPEN) }));
    assert.equal(second.ok, false);
    assert.equal(await prisma.competition.count({ where: { venueId: v.id } }), 3, "refused publish wrote nothing");
  });
  await check("LP: 10 simultaneous publishes on a 1-slot venue -> exactly 1 published", async () => {
    const v = await venue({ createdAt: AFTER });
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        lp.withActiveCompetitionSlot(v.id, {}, (tx) => tx.competition.create({ data: comp(v.id, CompetitionStatus.SIGNUP_OPEN) })),
      ),
    );
    assert.equal(results.filter((r) => r.ok).length, 1);
    assert.equal(await prisma.competition.count({ where: { venueId: v.id, status: CompetitionStatus.SIGNUP_OPEN } }), 1);
  });
  await check("LP: 10 simultaneous publishes on a Starter subscriber -> exactly 2", async () => {
    const v = await venue({ createdAt: AFTER, subscriptionStatus: "active", subscriptionId: "sub_starter" });
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        lp.withActiveCompetitionSlot(v.id, {}, (tx) => tx.competition.create({ data: comp(v.id, CompetitionStatus.SIGNUP_OPEN) })),
      ),
    );
    assert.equal(results.filter((r) => r.ok).length, 2);
  });
  await check("LP: publishing a draft never counts itself; re-saving a live one isn't blocked", async () => {
    const v = await venue({ createdAt: AFTER });
    const draft = await prisma.competition.create({ data: comp(v.id, CompetitionStatus.DRAFT) });
    const r = await lp.withActiveCompetitionSlot(v.id, { excludeCompetitionId: draft.id }, (tx) =>
      tx.competition.update({ where: { id: draft.id }, data: { status: CompetitionStatus.SIGNUP_OPEN } }),
    );
    assert.equal(r.ok, true);
    const again = await lp.withActiveCompetitionSlot(v.id, { excludeCompetitionId: draft.id }, async () => "resave");
    assert.equal(again.ok, true, "the competition being saved is excluded from its own count");
  });
  await check("LP: downgrade/cancel never unpublishes - only blocks the next publish", async () => {
    const v = await venue({ createdAt: AFTER, billingPlan: BillingPlan.GROWTH, subscriptionStatus: "active", subscriptionId: "sub_g" });
    for (let i = 0; i < 4; i++) await prisma.competition.create({ data: comp(v.id, CompetitionStatus.SIGNUP_OPEN) });
    // What handleSubscriptionDeleted writes:
    await prisma.venue.update({ where: { id: v.id }, data: { subscriptionId: null, subscriptionStatus: "canceled", billingPlan: BillingPlan.STARTER } });
    assert.equal(await prisma.competition.count({ where: { venueId: v.id, status: CompetitionStatus.SIGNUP_OPEN } }), 4, "all 4 still live");
    const r = await lp.withActiveCompetitionSlot(v.id, {}, async () => "x");
    assert.equal(r.ok, false);
    assert.equal(await prisma.competition.count({ where: { venueId: v.id } }), 4, "nothing deleted");
  });

  // ── VenueSprocket entitlements ─────────────────────────────────────────────
  const vsVenue = async (createdAt: Date, cfg?: { vsPlan: (typeof VsPlan)[keyof typeof VsPlan]; vsSubscriptionStatus: string | null }) => {
    const v = await venue({ createdAt });
    await prisma.venueVsConfig.create({ data: { venueId: v.id, createdAt, ...(cfg ?? {}) } });
    return v;
  };
  const feats = async (id: string) => (await vs.getVsEntitlements(id)).features;
  await check("VS: new free venue gets no paid features", async () => {
    const v = await vsVenue(AFTER);
    assert.deepEqual(await feats(v.id), { pipeline: false, proposals: false, deposits: false, contracts: false, beos: false, followUps: false });
  });
  await check("VS: Starter = pipeline + proposals; Pro = everything", async () => {
    const s = await vsVenue(AFTER, { vsPlan: VsPlan.VS_STARTER, vsSubscriptionStatus: "active" });
    assert.deepEqual(await feats(s.id), { pipeline: true, proposals: true, deposits: false, contracts: false, beos: false, followUps: false });
    const p = await vsVenue(AFTER, { vsPlan: VsPlan.VS_PRO, vsSubscriptionStatus: "active" });
    assert.deepEqual(await feats(p.id), { pipeline: true, proposals: true, deposits: true, contracts: true, beos: true, followUps: true });
  });
  await check("VS: canceled/incomplete fall back to Free; past_due keeps the plan (grace)", async () => {
    const c = await vsVenue(AFTER, { vsPlan: VsPlan.VS_PRO, vsSubscriptionStatus: "canceled" });
    assert.equal((await vs.getVsEntitlements(c.id)).plan, VsPlan.VS_FREE);
    const i = await vsVenue(AFTER, { vsPlan: VsPlan.VS_PRO, vsSubscriptionStatus: "incomplete" });
    assert.equal((await vs.getVsEntitlements(i.id)).plan, VsPlan.VS_FREE);
    const pd = await vsVenue(AFTER, { vsPlan: VsPlan.VS_PRO, vsSubscriptionStatus: "past_due" });
    assert.equal((await feats(pd.id)).contracts, true);
  });
  await check("VS: an LP subscription never grants VS features", async () => {
    const v = await venue({ createdAt: AFTER, billingPlan: BillingPlan.ELITE, subscriptionStatus: "active", subscriptionId: "sub_lp" });
    assert.equal((await feats(v.id)).proposals, false);
  });
  await check("VS: grandfathering keeps exactly the features used before the cutover", async () => {
    const v = await vsVenue(BEFORE);
    const lead = await prisma.privateEventLead.create({
      data: { venueId: v.id, customerName: "QA Guest", customerEmail: "guest@example.test", eventType: "BIRTHDAY", createdAt: BEFORE, status: "CONTACTED" },
    });
    const ev = await prisma.privateEvent.create({
      data: { venueId: v.id, leadId: lead.id, eventName: "QA", eventType: "BIRTHDAY", eventDate: AFTER, startTime: "18:00", endTime: "22:00", createdAt: BEFORE },
    });
    await prisma.vsProposal.create({ data: { privateEventId: ev.id, depositAmount: 25000, totalAmount: 50000, lineItems: [], createdAt: BEFORE } });
    const e = await vs.getVsEntitlements(v.id);
    assert.deepEqual(e.features, { pipeline: true, proposals: true, deposits: true, contracts: false, beos: false, followUps: true });
    assert.deepEqual(e.grandfathered.sort(), ["deposits", "followUps", "pipeline", "proposals"]);
  });
  await check("VS: usage after the cutover does not grandfather anything", async () => {
    const v = await vsVenue(BEFORE);
    const ev = await prisma.privateEvent.create({
      data: { venueId: v.id, eventName: "QA", eventType: "BIRTHDAY", eventDate: AFTER, startTime: "18:00", endTime: "22:00", createdAt: AFTER },
    });
    await prisma.vsContract.create({ data: { privateEventId: ev.id, contractText: "x", createdAt: AFTER } });
    const f = await feats(v.id);
    assert.equal(f.contracts, false);
    assert.equal(f.pipeline, false);
    assert.equal(f.followUps, true, "existing venues keep the reminders they already received");
  });
  await check("VS: inquiry count is informational and per calendar month", async () => {
    const v = await vsVenue(AFTER);
    const now = new Date("2026-11-15T12:00:00Z");
    for (let i = 0; i < 12; i++) {
      await prisma.privateEventLead.create({
        data: { venueId: v.id, customerName: `G${i}`, customerEmail: `g${i}@example.test`, eventType: "OTHER", createdAt: new Date("2026-11-02T00:00:00Z") },
      });
    }
    await prisma.privateEventLead.create({
      data: { venueId: v.id, customerName: "Old", customerEmail: "old@example.test", eventType: "OTHER", createdAt: new Date("2026-10-31T23:00:00Z") },
    });
    assert.equal(await vs.inquiriesThisMonth(v.id, now), 12);
    assert.equal(await prisma.privateEventLead.count({ where: { venueId: v.id } }), 13, "nothing over the allowance was dropped");
  });

  // ── Conversion dedup ───────────────────────────────────────────────────────
  await check("conversion: no marker (pre-existing subscriber) -> never reported", async () => {
    assert.equal(await conv.claimConversion("sub_existing"), null);
  });
  await check("conversion: 12 concurrent claims (tabs/reloads) -> exactly 1 report", async () => {
    await conv.markConversionPending("sub_new", { product: "lp", plan: "GROWTH", interval: "annual" });
    const results = await Promise.all(Array.from({ length: 12 }, () => conv.claimConversion("sub_new")));
    const won = results.filter(Boolean);
    assert.equal(won.length, 1);
    assert.deepEqual(won[0], { subscriptionId: "sub_new", product: "lp", plan: "GROWTH", interval: "annual" });
    assert.equal(await conv.claimConversion("sub_new"), null, "later reload");
    assert.equal(await conv.hasPendingConversion("sub_new"), false);
  });
  await check("conversion: a redelivered webhook can't re-arm a counted conversion", async () => {
    await conv.markConversionPending("sub_x", { product: "vs" });
    assert.ok(await conv.claimConversion("sub_x"));
    await conv.markConversionPending("sub_x", { product: "vs" });
    await conv.markConversionPending("sub_x", { product: "vs" });
    assert.equal(await conv.claimConversion("sub_x"), null);
  });

  await reset();
  await prisma.$disconnect();
  console.log(`\n${n} checks passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
