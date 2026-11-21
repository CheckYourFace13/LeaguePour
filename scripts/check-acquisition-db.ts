/**
 * Acquisition program store checks against a REAL throwaway Postgres (never production):
 * runtime table creation, import dedupe/suppression, approve -> send (Resend stubbed), 4xx revert,
 * one-click unsubscribe, visit tracking, bounce suppression, signup attribution and metrics.
 *
 *   TEST_DATABASE_URL="postgresql://postgres@127.0.0.1:55433/acqtest?schema=leaguepour_lp" \
 *     npx tsx scripts/check-acquisition-db.ts
 *
 * Refuses to run unless TEST_DATABASE_URL is a loopback host: it deletes rows in the tables it uses.
 */
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  console.error("TEST_DATABASE_URL must point at a local throwaway database (127.0.0.1/localhost).");
  process.exit(1);
}
process.env.DATABASE_URL = url;
process.env.RESEND_API_KEY = "re_test_stub";
process.env.RESEND_VS_API_KEY = "re_test_stub_vs";
process.env.OUTREACH_POSTAL_ADDRESS = "1 Test St, Glenview IL 60026";

type FetchReply = { status: number; body: unknown };
let replies: FetchReply[] = [];
const sent: { url: string; body: Record<string, unknown>; headers: Record<string, string> }[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const u = String(input);
  if (!u.startsWith("https://api.resend.com/")) throw new Error(`unexpected fetch ${u}`);
  sent.push({ url: u, body: JSON.parse(String(init?.body ?? "{}")), headers: (init?.headers ?? {}) as Record<string, string> });
  const r = replies.shift() ?? { status: 200, body: { id: "email_stub" } };
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { "Content-Type": "application/json" } });
}) as typeof fetch;

async function main() {
  const { prisma } = await import("../src/lib/db");
  const store = await import("../src/lib/acquisition/store");
  const { getAcquisitionMetrics } = await import("../src/lib/acquisition/metrics");
  type Seed = import("../src/lib/acquisition/prospects.data").ProspectSeed;

  let n = 0;
  const check = async (name: string, fn: () => Promise<void>) => {
    await fn();
    n++;
    console.log("ok -", name);
  };

  // Clean slate for the tables this test touches.
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "leaguepour_lp"."AcquisitionProspect"`);
  await prisma.appSetting.deleteMany({ where: { key: { startsWith: "acq:venue:" } } });
  await prisma.outreachContact.deleteMany({ where: { placeId: { startsWith: "acqtest-" } } });
  await prisma.venueStaff.deleteMany({ where: { venue: { slug: { startsWith: "acqtest-" } } } });
  await prisma.venue.deleteMany({ where: { slug: { startsWith: "acqtest-" } } });

  const base = { state: "IL", segment: "bar", relevance: "high" as const, offer: "o", verifiedAt: "2026-11-21", sourceNote: "venue site", useCase: "your Tuesday trivia" };
  const seeds: Seed[] = [
    { ...base, brand: "lp", name: "Existing Venue Bar", city: "Chicago", website: "https://existing-venue.test/", sourceUrl: "https://existing-venue.test/events", contactRoute: "email", email: "info@existing-venue.test" },
    { ...base, brand: "lp", name: "Unsubscribed Pub", city: "Chicago", website: "https://unsub-pub.test/", sourceUrl: "https://unsub-pub.test/", contactRoute: "email", email: "info@unsub-pub.test" },
    { ...base, brand: "lp", name: "Linked Tavern", city: "Chicago", website: "https://linked-tavern.test/", sourceUrl: "https://linked-tavern.test/", contactRoute: "email", email: "hello@linked-tavern.test" },
    { ...base, brand: "vs", name: "Fresh Brewery", city: "Evanston", website: "https://fresh-brewery.test/", sourceUrl: "https://fresh-brewery.test/private-events", contactRoute: "email", email: "events@fresh-brewery.test" },
    { ...base, brand: "vs", name: "Form Only Hall", city: "Oak Park", website: "https://form-hall.test/", sourceUrl: "https://form-hall.test/", contactRoute: "form", contactValue: "https://form-hall.test/contact" },
    { ...base, brand: "lp", name: "Bad Row", city: "Chicago", sourceUrl: "", contactRoute: "email" } as Seed,
  ];

  await prisma.venue.create({ data: { name: "Existing Venue Bar", slug: "acqtest-existing", venueType: "Bar", description: "x", city: "Chicago", websiteUrl: "https://www.existing-venue.test" } });
  await prisma.outreachContact.create({ data: { placeId: "acqtest-unsub", name: "Unsubscribed Pub", address: "a", city: "Chicago", state: "IL", website: "https://unsub-pub.test", status: "NOT_INTERESTED", vsStatus: "NOT_INTERESTED" } });
  const linked = await prisma.outreachContact.create({ data: { placeId: "acqtest-linked", name: "Linked Tavern", address: "a", city: "Chicago", state: "IL", website: "https://linked-tavern.test" } });

  await check("runtime DDL creates the table the Prisma model expects", async () => {
    await store.ensureAcquisitionTable();
    assert.equal(await prisma.acquisitionProspect.count(), 0);
  });

  await check("import dedupes against venues, outreach suppression, and links old contacts", async () => {
    const r = await store.importProspects(seeds);
    assert.equal(r.created, 5);
    assert.equal(r.invalid.length, 1);
    assert.equal(r.suppressed, 2);
    assert.equal(r.queued, 3);
    const ev = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Existing Venue Bar" } });
    assert.equal(ev.status, "SUPPRESSED");
    assert.match(ev.suppressReason ?? "", /venue account/);
    const un = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Unsubscribed Pub" } });
    assert.equal(un.status, "SUPPRESSED");
    const lt = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Linked Tavern" } });
    assert.equal(lt.status, "QUEUED");
    assert.equal(lt.outreachContactId, linked.id);
    assert.ok(lt.draftBody.includes("your Tuesday trivia"));
  });

  await check("import is idempotent", async () => {
    const r = await store.importProspects(seeds);
    assert.equal(r.created, 0);
    assert.equal(r.alreadyImported, 5);
  });

  const lt = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Linked Tavern" } });

  await check("nothing sends without approval", async () => {
    const r = await store.sendApprovedProspect(lt.id);
    assert.equal(r.ok, false);
    assert.equal(sent.length, 0);
  });

  await check("approved prospect sends once, with unsubscribe headers, and marks the old lane", async () => {
    await prisma.acquisitionProspect.update({ where: { id: lt.id }, data: { status: "APPROVED" } });
    const r = await store.sendApprovedProspect(lt.id);
    assert.equal(r.ok, true, r.error);
    assert.equal(sent.length, 1);
    const req = sent[0];
    assert.deepEqual(req.body.to, ["hello@linked-tavern.test"]);
    assert.match(String(req.body.from), /LeaguePour <hello@leaguepour\.com>/);
    assert.match(String((req.body.headers as Record<string, string>)["List-Unsubscribe"]), /\/api\/acquisition\/unsubscribe\?t=/);
    assert.equal(req.headers["Idempotency-Key"], `acq-${lt.id}`);
    assert.match(String(req.body.text), /1 Test St, Glenview IL 60026/);
    const after = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: lt.id } });
    assert.equal(after.status, "SENT");
    assert.equal(after.resendId, "email_stub");
    const oc = await prisma.outreachContact.findUniqueOrThrow({ where: { id: linked.id } });
    assert.equal(oc.status, "EMAIL_SENT");
    const again = await store.sendApprovedProspect(lt.id);
    assert.equal(again.ok, false);
    assert.equal(sent.length, 1);
  });

  await check("a definite Resend rejection leaves the prospect approved and unsent", async () => {
    const fb = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Fresh Brewery" } });
    await prisma.acquisitionProspect.update({ where: { id: fb.id }, data: { status: "APPROVED" } });
    replies = [{ status: 422, body: { message: "invalid" } }];
    const r = await store.sendApprovedProspect(fb.id);
    assert.equal(r.ok, false);
    const after = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: fb.id } });
    assert.equal(after.status, "APPROVED");
    assert.equal(after.sentAt, null);
    assert.match(after.sendError ?? "", /422/);
  });

  await check("form-only prospects can't be emailed", async () => {
    const fo = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Form Only Hall" } });
    await prisma.acquisitionProspect.update({ where: { id: fo.id }, data: { status: "APPROVED" } });
    const before = sent.length;
    const r = await store.sendApprovedProspect(fo.id);
    assert.equal(r.ok, false);
    assert.equal(sent.length, before);
    const after = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: fo.id } });
    assert.equal(after.status, "APPROVED");
  });

  await check("visit tracking counts only known tokens", async () => {
    assert.equal(await store.recordVisit(lt.token), true);
    assert.equal(await store.recordVisit(lt.token), true);
    assert.equal(await store.recordVisit("unknown_token_xyz"), false);
    const after = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: lt.id } });
    assert.equal(after.visitCount, 2);
    assert.ok(after.firstVisitAt);
  });

  await check("signup attribution links the prospect and stores the source", async () => {
    const v = await prisma.venue.create({ data: { name: "Linked Tavern", slug: "acqtest-linked-venue", venueType: "Bar", description: "x", city: "Chicago" } });
    await store.recordSignupAttribution({
      venueId: v.id,
      brand: "lp",
      attribution: { source: "outreach", medium: "email", campaign: "acq-2026-11", ref: lt.token, landing: "/tools" },
      googlePlaceId: "acqtest-linked",
    });
    const p = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: lt.id } });
    assert.equal(p.signedUpVenueId, v.id);
    const row = await prisma.appSetting.findUniqueOrThrow({ where: { key: `acq:venue:${v.id}` } });
    assert.match(row.value, /"campaign":"acq-2026-11"/);
    const oc = await prisma.outreachContact.findUniqueOrThrow({ where: { id: linked.id } });
    assert.equal(oc.status, "SIGNED_UP");
  });

  await check("metrics count prospects, contacts, visits and outreach registrations per brand", async () => {
    const m = await getAcquisitionMetrics();
    assert.equal(m.lp.prospects, 3);
    assert.equal(m.lp.suppressed, 2);
    assert.equal(m.lp.contacted, 1);
    assert.equal(m.lp.demoVisits, 1);
    assert.ok(m.lp.registrationsFromOutreach >= 1);
    assert.equal(m.vs.prospects, 2);
    assert.equal(m.vs.contacted, 0);
  });

  await check("one-click unsubscribe stops the prospect and both old lanes", async () => {
    assert.equal(await store.unsubscribeByToken(lt.token), true);
    const p = await prisma.acquisitionProspect.findUniqueOrThrow({ where: { id: lt.id } });
    assert.equal(p.status, "UNSUBSCRIBED");
    const oc = await prisma.outreachContact.findUniqueOrThrow({ where: { id: linked.id } });
    assert.equal(oc.status, "NOT_INTERESTED");
    assert.equal(oc.vsStatus, "NOT_INTERESTED");
    assert.equal(await store.unsubscribeByToken("bad"), false);
  });

  await check("bounce/complaint webhook suppression reaches prospects", async () => {
    const c = await store.suppressProspectsByEmail("EVENTS@fresh-brewery.test", "BOUNCED");
    assert.equal(c, 1);
    const fb = await prisma.acquisitionProspect.findFirstOrThrow({ where: { name: "Fresh Brewery" } });
    assert.equal(fb.status, "BOUNCED");
  });

  await check("VS automatic outreach is paused by default even if the old switch says on, and can be re-enabled", async () => {
    const oe = await import("../src/lib/outreach-email");
    await prisma.appSetting.deleteMany({ where: { key: oe.VS_OUTREACH_ENABLED_KEY } });
    await prisma.appSetting.upsert({ where: { key: "vs_outreach_enabled" }, create: { key: "vs_outreach_enabled", value: "true" }, update: { value: "true" } });
    assert.equal(await oe.isVsOutreachEnabled(), false);
    const before = sent.length;
    const r = await oe.sendVsOutreachCore(5);
    assert.match(r.skipped ?? "", /paused/);
    assert.equal(sent.length, before);
    await prisma.appSetting.create({ data: { key: oe.VS_OUTREACH_ENABLED_KEY, value: "true" } });
    assert.equal(await oe.isVsOutreachEnabled(), true);
    await prisma.appSetting.deleteMany({ where: { key: { in: [oe.VS_OUTREACH_ENABLED_KEY, "vs_outreach_enabled"] } } });
  });

  console.log(`\n${n} DB checks passed`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
