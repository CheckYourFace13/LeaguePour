/**
 * Concurrency / retry checks for scheduled-job claims and outreach sends, against a REAL Postgres
 * (advisory locks and unique keys need the real thing) with MOCKED email sends - nothing here can
 * reach Resend.
 *
 *   TEST_DATABASE_URL="postgresql://postgres@127.0.0.1:55432/lpqa?schema=leaguepour_lp" \
 *     npx tsx scripts/check-outreach-concurrency.ts
 *
 * Refuses to run unless TEST_DATABASE_URL points at a loopback host: it deletes and seeds
 * OutreachContact / AppSetting rows.
 */
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  console.error("TEST_DATABASE_URL must point at a local throwaway database (127.0.0.1/localhost).");
  process.exit(2);
}
process.env.DATABASE_URL = url;
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_VS_API_KEY;
process.env.CRON_SECRET = "test-cron-secret";

type Email = { to: string | string[] };
type Call = { brand: string; to: string[]; key?: string };

async function main() {
  const { prisma } = await import("../src/lib/db");
  const claims = await import("../src/lib/job-claims");
  const outreach = await import("../src/lib/outreach-email");
  const { setSetting } = await import("../src/lib/app-settings");

  // Run the module's one-time ALTER TABLE ... IF NOT EXISTS up front: left to the first concurrent
  // call, its table lock queues the other callers and hides real overlap (production runs it once
  // per process, long before any send).
  await outreach.ensureOutreachEmailColumns();

  let n = 0;
  const check = async (name: string, fn: () => Promise<void>) => {
    await prisma.outreachContact.deleteMany({});
    await prisma.appSetting.deleteMany({});
    await fn();
    n++;
    console.log("ok -", name);
  };

  const seed = async (count: number, extra: Record<string, unknown> = {}) => {
    for (let i = 0; i < count; i++) {
      await prisma.outreachContact.create({
        data: {
          placeId: `p${i}`,
          name: `Bar ${i}`,
          address: "1 Main St",
          city: "Testville",
          state: "IN",
          email: `owner${i}@bar${i}.example.com`,
          rating: 5 - i / 100,
          ...extra,
        },
      });
    }
  };

  // Holds every caller that reaches the barrier until `n` have arrived (or a short timeout, since
  // callers turned away by the lock never arrive) - forces real overlap inside the transaction.
  const barrier = (n: number) => {
    let arrived = 0;
    let open!: () => void;
    const gate = new Promise<void>((r) => (open = r));
    setTimeout(() => open(), 1500);
    return async () => {
      arrived++;
      if (arrived >= n) open();
      await gate;
    };
  };

  // A mock sender that records every recipient, optionally slow, with a scripted result.
  const recorder = (result: { ok: boolean; rejected?: boolean; status?: number }, delayMs = 0) => {
    const calls: Call[] = [];
    const send = (async (emails: Email[], brand = "lp", o: { idempotencyKey?: string } = {}) => {
      calls.push({ brand, to: emails.flatMap((e) => (Array.isArray(e.to) ? e.to : [e.to])), key: o.idempotencyKey });
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      return { ...result, sent: result.ok ? emails.length : 0, failed: result.ok ? 0 : emails.length };
    }) as unknown as typeof import("../src/lib/email").sendEmailBatch;
    return { calls, send };
  };

  await check("validator rejects send-unsafe shapes, keeps normal ones", async () => {
    for (const bad of ["%20info@bar.com", "a..b@bar.com", ".a@bar.com", "a.@bar.com", "info@-bar.com", "info@bar-.com", "info@bar", "in fo@bar.com"]) {
      assert.equal(outreach.isPlausibleEmail(bad), false, bad);
    }
    for (const good of ["info@bar.com", "first.last+tag@sub.bar.co", "events_2@my-bar.io", "Owner@Bar.COM"]) {
      assert.equal(outreach.isPlausibleEmail(good), true, good);
    }
  });

  await check("job claim: 25 concurrent claimers, exactly one wins; only the owner can release", async () => {
    const results = await Promise.all(
      Array.from({ length: 25 }, (_, i) => claims.claimScheduledRun("/api/cron/outreach-send", "2026-10-16", `inst-${i}`)),
    );
    assert.equal(results.filter(Boolean).length, 1);
    const winner = `inst-${results.indexOf(true)}`;
    await claims.releaseScheduledRun("/api/cron/outreach-send", "2026-10-16", "inst-other");
    assert.equal(await claims.claimScheduledRun("/api/cron/outreach-send", "2026-10-16", "inst-late"), false, "non-owner release is a no-op");
    await claims.finishScheduledRun("/api/cron/outreach-send", "2026-10-16", winner, "HTTP 200");
    assert.equal(await claims.claimScheduledRun("/api/cron/outreach-send", "2026-10-16", "inst-late"), false, "finished slot never re-runs");
    // A never-responded run is released by its owner and can be retried.
    assert.equal(await claims.claimScheduledRun("/api/cron/lp-lifecycle", "2026-10-16", "a"), true);
    await claims.releaseScheduledRun("/api/cron/lp-lifecycle", "2026-10-16", "a");
    assert.equal(await claims.claimScheduledRun("/api/cron/lp-lifecycle", "2026-10-16", "b"), true);
  });

  await check("LP paused by default: nothing sent, contacts untouched", async () => {
    await seed(5);
    const m = recorder({ ok: true });
    const r = await outreach.sendOutreachCore(25, { send: m.send });
    assert.equal(m.calls.length, 0);
    assert.ok(r.skipped?.includes("paused"));
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 0);
  });

  await check("LP: 8 concurrent senders -> one batch, no recipient twice, invalid addresses cleared", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(40);
    await prisma.outreachContact.create({
      data: { placeId: "bad1", name: "Bad", address: "x", city: "x", state: "IN", email: "%20info@bad.example.com", rating: 9 },
    });
    const m = recorder({ ok: true }, 300);
    const gate = barrier(8);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => outreach.sendOutreachCore(25, { send: m.send, throttleHours: 20, afterSelect: gate })),
    );
    const all = m.calls.flatMap((c) => c.to);
    assert.equal(m.calls.length, 1, "exactly one Resend call");
    assert.equal(all.length, 25);
    assert.equal(new Set(all).size, all.length, "no duplicate recipient");
    assert.ok(!all.includes("%20info@bad.example.com"));
    assert.equal(results.filter((r) => r.sent > 0).length, 1);
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25);
    assert.equal((await prisma.outreachContact.findUnique({ where: { placeId: "bad1" } }))?.email, null);
    assert.equal(await prisma.appSetting.count({ where: { key: "outreach_pending_batch:lp" } }), 0, "pending cleared");
    // Next day-run inside the throttle window: throttled, no send.
    const again = await outreach.sendOutreachCore(25, { send: m.send, throttleHours: 20 });
    assert.ok(again.skipped);
    assert.equal(m.calls.length, 1);
  });

  await check("LP: Resend rejection (422) -> nothing marked, contacts stay eligible", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(10);
    const m = recorder({ ok: false, rejected: true, status: 422 });
    const r = await outreach.sendOutreachCore(25, { send: m.send, throttleHours: 20 });
    assert.ok(r.error?.includes("rejected"));
    assert.equal(await prisma.outreachContact.count({ where: { status: "NOT_CONTACTED", emailSentAt: null } }), 10);
    assert.equal(await prisma.appSetting.count({ where: { key: "outreach_pending_batch:lp" } }), 0);
  });

  await check("LP: unknown outcome -> held; in-flight blocks; later retry reuses same contacts + key", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date();
    const first = recorder({ ok: false, rejected: false });
    const r1 = await outreach.sendOutreachCore(25, { send: first.send, throttleHours: 20, now: () => t0 });
    assert.ok(r1.error?.includes("unknown"));
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25, "held, not reverted");

    const during = recorder({ ok: true });
    const r2 = await outreach.sendOutreachCore(25, { send: during.send, throttleHours: 20, now: () => new Date(t0.getTime() + 60_000) });
    assert.equal(during.calls.length, 0, "in-flight: no second send");
    assert.ok(r2.error?.includes("in progress"));

    const retry = recorder({ ok: true });
    await outreach.sendOutreachCore(25, { send: retry.send, throttleHours: 20, now: () => new Date(t0.getTime() + 11 * 60_000) });
    assert.equal(retry.calls.length, 1);
    assert.deepEqual([...retry.calls[0].to].sort(), [...first.calls[0].to].sort(), "same recipients");
    assert.equal(retry.calls[0].key, first.calls[0].key, "same idempotency key");
    assert.equal(await prisma.appSetting.count({ where: { key: "outreach_pending_batch:lp" } }), 0);
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25, "never a second batch");
  });

  await check("LP: unsettled batch older than 23h -> dropped, kept marked, not resent", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date(Date.now() - 2 * 24 * 3600_000);
    await outreach.sendOutreachCore(25, { send: recorder({ ok: false }).send, now: () => t0 });
    const later = recorder({ ok: true });
    await outreach.sendOutreachCore(25, { send: later.send, throttleHours: 20 });
    const resent = later.calls.flatMap((c) => c.to);
    const held = (await prisma.outreachContact.findMany({ where: { emailSentAt: t0 }, select: { email: true } })).map((c) => c.email);
    assert.equal(held.length, 25);
    assert.ok(held.every((e) => !resent.includes(e as string)), "held contacts never resent");
  });

  await check("VS: 8 concurrent senders -> one batch of 5, no recipient twice, LP marks untouched", async () => {
    await seed(20, { vsEligible: true });
    const m = recorder({ ok: true }, 300);
    const gate = barrier(8);
    await Promise.all(Array.from({ length: 8 }, () => outreach.sendVsOutreachCore(5, { send: m.send, throttleHours: 20, afterSelect: gate })));
    const all = m.calls.flatMap((c) => c.to);
    assert.equal(m.calls.length, 1);
    assert.equal(all.length, 5);
    assert.equal(new Set(all).size, 5);
    assert.equal(m.calls[0].brand, "vs");
    assert.equal(await prisma.outreachContact.count({ where: { vsStatus: "EMAIL_SENT" } }), 5);
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 0);
  });

  await check("VS: rejection reverts only this claim", async () => {
    await seed(8, { vsEligible: true });
    const r = await outreach.sendVsOutreachCore(5, { send: recorder({ ok: false, rejected: true, status: 422 }).send });
    assert.ok(r.error?.includes("rejected"));
    assert.equal(await prisma.outreachContact.count({ where: { vsStatus: null, vsEmailSentAt: null } }), 8);
  });

  // ---------------------------------------------------------------- lost responses / crash recovery
  const slotReq = (slot?: string, secret = "test-cron-secret") =>
    new Request(`http://127.0.0.1/api/cron/x${slot ? `?scheduler_slot=${slot}` : ""}`, {
      headers: { Authorization: `Bearer ${secret}`, ...(slot ? { "x-scheduler-slot": slot } : {}) },
    });

  await check("scheduled job completes but its response is lost: the retry does not re-run it", async () => {
    let sideEffects = 0;
    const GET = claims.withScheduledSlot("demo-job", async () => {
      sideEffects++;
      return Response.json({ ok: true });
    });
    const first = await GET(slotReq("2026-10-16"));
    assert.equal(first.status, 200);
    // The scheduler never saw that response (timeout / 503), released its own claim and retried -
    // from this or another instance, possibly several at once.
    const retries = await Promise.all(Array.from({ length: 6 }, () => GET(slotReq("2026-10-16"))));
    assert.equal(sideEffects, 1, "side effect ran exactly once");
    for (const r of retries) assert.ok(((await r.json()) as { skipped?: string }).skipped?.includes("Already executed"));
    // The next day's slot runs normally (cadence preserved); manual calls without a slot always run.
    await GET(slotReq("2026-10-17"));
    await GET(slotReq());
    await GET(slotReq());
    assert.equal(sideEffects, 4);
  });

  await check("unauthenticated slot requests never create a claim", async () => {
    let ran = 0;
    const GET = claims.withScheduledSlot("demo-job", async () => {
      ran++;
      return Response.json({ ok: false }, { status: 401 });
    });
    await GET(slotReq("2026-10-16", "wrong"));
    assert.equal(await prisma.appSetting.count({ where: { key: { startsWith: "job_claim:exec:" } } }), 0);
    assert.equal(ran, 1, "the handler still answers (and rejects) it");
  });

  await check("a job that throws keeps its slot claimed (no duplicate partial work)", async () => {
    let ran = 0;
    const GET = claims.withScheduledSlot("demo-job", async () => {
      ran++;
      throw new Error("boom");
    });
    await assert.rejects(GET(slotReq("2026-10-16")));
    await GET(slotReq("2026-10-16"));
    assert.equal(ran, 1);
  });

  // An idempotent fake provider: stores the first request body per key, answers a different body
  // under a reused key with a 409 conflict, and counts actual deliveries.
  const provider = () => {
    const byKey = new Map<string, string>();
    const deliveries: string[] = [];
    let crashAfterAccept = false;
    const send = (async (emails: Email[], _brand = "lp", o: { idempotencyKey?: string } = {}) => {
      const body = JSON.stringify(emails);
      const key = o.idempotencyKey ?? "";
      const seen = byKey.get(key);
      if (seen !== undefined && seen !== body) return { ok: false, rejected: true, status: 409, sent: 0, failed: emails.length };
      if (seen === undefined) {
        byKey.set(key, body);
        deliveries.push(...emails.flatMap((e) => (Array.isArray(e.to) ? e.to : [e.to])));
      }
      if (crashAfterAccept) {
        crashAfterAccept = false;
        throw new Error("process crashed after the provider accepted");
      }
      return { ok: true, sent: emails.length, failed: 0 };
    }) as unknown as typeof import("../src/lib/email").sendEmailBatch;
    return { send, byKey, deliveries, crashNextAfterAccept: () => (crashAfterAccept = true) };
  };

  await check("crash after claim, before send: retry sends the exact same batch, payload and key", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date();
    let captured: { body: string; key?: string } | null = null;
    const crashing = (async (emails: Email[], _b = "lp", o: { idempotencyKey?: string } = {}) => {
      captured = { body: JSON.stringify(emails), key: o.idempotencyKey };
      throw new Error("crash before the request left the process");
    }) as unknown as typeof import("../src/lib/email").sendEmailBatch;
    await assert.rejects(outreach.sendOutreachCore(25, { send: crashing, throttleHours: 20, now: () => t0 }));
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25, "held while unsettled");

    const p = provider();
    await outreach.sendOutreachCore(25, { send: p.send, throttleHours: 20, now: () => new Date(t0.getTime() + 11 * 60_000) });
    const [key] = [...p.byKey.keys()];
    const c = captured as { body: string; key?: string } | null;
    assert.equal(key, c?.key, "same idempotency key");
    assert.equal(p.byKey.get(key), c?.body, "byte-identical payload");
    assert.equal(p.deliveries.length, 25);
    assert.equal(new Set(p.deliveries).size, 25);
  });

  await check("crash after the provider accepted: retry is deduplicated, exactly one delivery", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date();
    const p = provider();
    p.crashNextAfterAccept();
    await assert.rejects(outreach.sendOutreachCore(25, { send: p.send, throttleHours: 20, now: () => t0 }));
    assert.equal(p.deliveries.length, 25, "delivered once before the crash");
    const r = await outreach.sendOutreachCore(25, { send: p.send, throttleHours: 20, now: () => new Date(t0.getTime() + 11 * 60_000) });
    assert.equal(p.deliveries.length, 25, "the retry delivered nothing new");
    assert.equal(r.sent, 25);
    assert.equal(await prisma.appSetting.count({ where: { key: "outreach_pending_batch:lp" } }), 0, "settled");
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25, "no second batch");
  });

  await check("retry whose payload changed is held, never sent", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date();
    await outreach.sendOutreachCore(25, { send: recorder({ ok: false }).send, now: () => t0 });
    const marked = await prisma.outreachContact.findFirst({ where: { status: "EMAIL_SENT" } });
    await prisma.outreachContact.update({ where: { id: marked!.id }, data: { name: "Renamed Bar" } });
    const m = recorder({ ok: true });
    const r = await outreach.sendOutreachCore(25, { send: m.send, now: () => new Date(t0.getTime() + 11 * 60_000) });
    assert.equal(m.calls.length, 0);
    assert.ok(r.error?.includes("could not be reproduced"));
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT" } }), 25, "held");
  });

  await check("a 4xx on retry never reverts (the first attempt may have been delivered)", async () => {
    await setSetting(outreach.LP_OUTREACH_ENABLED_KEY, "true");
    await seed(30);
    const t0 = new Date();
    await outreach.sendOutreachCore(25, { send: recorder({ ok: false }).send, now: () => t0 });
    const r = await outreach.sendOutreachCore(25, {
      send: recorder({ ok: false, rejected: true, status: 409 }).send,
      now: () => new Date(t0.getTime() + 11 * 60_000),
    });
    assert.ok(r.error?.includes("Retry refused"));
    assert.equal(await prisma.outreachContact.count({ where: { status: "EMAIL_SENT", emailSentAt: t0 } }), 25);
  });

  await check("VS: crash after the provider accepted -> one delivery per recipient", async () => {
    await seed(10, { vsEligible: true });
    const t0 = new Date();
    const p = provider();
    p.crashNextAfterAccept();
    await assert.rejects(outreach.sendVsOutreachCore(5, { send: p.send, now: () => t0 }));
    await outreach.sendVsOutreachCore(5, { send: p.send, now: () => new Date(t0.getTime() + 11 * 60_000) });
    assert.equal(p.deliveries.length, 5);
    assert.equal(await prisma.outreachContact.count({ where: { vsStatus: "EMAIL_SENT" } }), 5);
  });

  await prisma.outreachContact.deleteMany({});
  await prisma.appSetting.deleteMany({});
  console.log(`\n${n} checks passed`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
