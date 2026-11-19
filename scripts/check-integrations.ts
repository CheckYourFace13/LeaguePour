/**
 * Checks for the integration helpers: iCalendar writer, CSV writer, calendar-feed tokens,
 * webhook URL policy / SSRF guard and signatures, and lead reply templates. No database needed.
 *
 *   npx tsx scripts/check-integrations.ts
 */
import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";

process.env.DATABASE_URL ??= "postgresql://unused:unused@127.0.0.1:1/unused";
process.env.AUTH_SECRET ??= "check-integrations-secret";

let checks = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  checks++;
  console.log("ok -", name);
}

async function main() {
  const ics = await import("../src/lib/integrations/ics");
  const csv = await import("../src/lib/integrations/csv");
  const tok = await import("../src/lib/integrations/calendar-token");
  const wh = await import("../src/lib/integrations/webhooks");
  const replies = await import("../src/lib/vs-reply-templates");

  // ── ICS ────────────────────────────────────────────────────────────────────
  await check("ics text escaping", () => {
    assert.equal(ics.escapeIcsText("a,b;c\\d\ne"), "a\\,b\\;c\\\\d\\ne");
  });

  await check("ics lines fold at 75 octets, including multi-byte characters", () => {
    const line = `DESCRIPTION:${"é".repeat(100)}`;
    const folded = ics.foldIcsLine(line);
    for (const part of folded.split("\r\n")) assert.ok(new TextEncoder().encode(part).length <= 75, part);
    assert.equal(folded.replace(/\r\n /g, ""), line);
  });

  await check("clock time parsing", () => {
    assert.equal(ics.parseClockTime("18:00"), 18 * 60);
    assert.equal(ics.parseClockTime("6:30 PM"), 18 * 60 + 30);
    assert.equal(ics.parseClockTime("12am"), 0);
    assert.equal(ics.parseClockTime("12:15 pm"), 12 * 60 + 15);
    assert.equal(ics.parseClockTime("6"), null);
    assert.equal(ics.parseClockTime("evening"), null);
    assert.equal(ics.parseClockTime("25:00"), null);
  });

  await check("venue-local times convert to UTC across DST", () => {
    // Chicago is UTC-5 in July (CDT) and UTC-6 in December (CST).
    assert.equal(ics.zonedWallTimeToUtc("2026-07-10", 18 * 60, "America/Chicago").toISOString(), "2026-07-10T23:00:00.000Z");
    assert.equal(ics.zonedWallTimeToUtc("2026-12-10", 18 * 60, "America/Chicago").toISOString(), "2026-12-11T00:00:00.000Z");
    assert.equal(ics.zonedWallTimeToUtc("2026-12-10", 9 * 60, "Not/AZone").toISOString(), "2026-12-10T09:00:00.000Z");
  });

  await check("event timing: past-midnight end, missing end, unparseable start", () => {
    const late = ics.eventTiming("2026-12-31", "21:00", "1:00 AM", "America/New_York");
    assert.equal(late.start?.toISOString(), "2027-01-01T02:00:00.000Z");
    assert.equal(late.end?.toISOString(), "2027-01-01T06:00:00.000Z");
    const noEnd = ics.eventTiming("2026-05-01", "18:00", "", "UTC");
    assert.equal(noEnd.end!.getTime() - noEnd.start!.getTime(), 3 * 3600_000);
    assert.deepEqual(ics.eventTiming("2026-05-01", "TBD", "late", "UTC"), { allDayDate: "2026-05-01" });
  });

  await check("calendar document is well formed", () => {
    const body = ics.buildIcsCalendar({
      prodId: "-//Test//EN",
      name: "Q's Test, Room",
      refreshHours: 1,
      now: new Date("2026-11-20T00:00:00Z"),
      events: [
        { uid: "a@x", summary: "Party; 40 guests", start: new Date("2026-12-01T23:00:00Z"), end: new Date("2026-12-02T02:00:00Z"), status: "CONFIRMED" },
        { uid: "b@x", summary: "All day", allDayDate: "2026-12-31" },
      ],
    });
    assert.ok(body.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
    assert.ok(body.endsWith("END:VCALENDAR\r\n"));
    assert.ok(!/[^\r]\n/.test(body), "every line must end in CRLF");
    assert.match(body, /X-WR-CALNAME:Q's Test\\, Room/);
    assert.match(body, /DTSTART:20261201T230000Z/);
    assert.match(body, /DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101/);
    assert.match(body, /SUMMARY:Party\\; 40 guests/);
    assert.equal(body.match(/BEGIN:VEVENT/g)?.length, 2);
  });

  // ── CSV ────────────────────────────────────────────────────────────────────
  await check("csv quoting and formula-injection guard", () => {
    assert.equal(csv.csvCell('He said "hi", ok'), '"He said ""hi"", ok"');
    assert.equal(csv.csvCell("=HYPERLINK(\"x\")"), '"\'=HYPERLINK(""x"")"');
    assert.equal(csv.csvCell("+1 555"), "\"'+1 555\"");
    assert.equal(csv.csvCell("@SUM(A1)"), "\"'@SUM(A1)\"");
    assert.equal(csv.csvCell(null), '""');
    assert.equal(csv.csvCell(new Date("2026-01-02T03:04:05Z")), '"2026-01-02T03:04:05.000Z"');
    const doc = csv.toCsv(["A", "B"], [["x\ny", 2]]);
    assert.ok(doc.startsWith("﻿\"A\",\"B\"\r\n"));
    assert.ok(doc.includes('"x\ny","2"'));
  });

  // ── Calendar tokens ────────────────────────────────────────────────────────
  await check("calendar tokens verify, and reject tampering", () => {
    const venueId = "cmabc123def456ghi789jkl0";
    const t = tok.signCalendarToken(venueId, 3);
    assert.deepEqual(tok.parseCalendarToken(t), { venueId, version: 3 });
    assert.equal(tok.parseCalendarToken(t.replace(".3.", ".4.")), null, "version bump must invalidate the MAC");
    assert.equal(tok.parseCalendarToken(t.replace(venueId, "cmzzz123def456ghi789jkl0")), null);
    assert.equal(tok.parseCalendarToken(`${t.slice(0, -1)}${t.endsWith("A") ? "B" : "A"}`), null);
    assert.equal(tok.parseCalendarToken("garbage"), null);
    assert.equal(tok.parseCalendarToken(t, "other-secret"), null);
  });

  // ── Webhooks ───────────────────────────────────────────────────────────────
  await check("blocked address ranges", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "224.0.0.1"]) {
      assert.equal(wh.isBlockedAddress(ip), true, ip);
    }
    for (const ip of ["8.8.8.8", "172.32.0.1", "104.16.0.1", "2606:4700::1111"]) {
      assert.equal(wh.isBlockedAddress(ip), false, ip);
    }
  });

  await check("webhook URL shape policy", () => {
    assert.equal(wh.validateWebhookUrl("https://hooks.zapier.com/hooks/catch/1/abc/"), null);
    assert.ok(wh.validateWebhookUrl("http://hooks.zapier.com/x"));
    assert.ok(wh.validateWebhookUrl("https://user:pw@example.com/x"));
    assert.ok(wh.validateWebhookUrl("https://example.com:8443/x"));
    assert.ok(wh.validateWebhookUrl("https://127.0.0.1/x"));
    assert.ok(wh.validateWebhookUrl("https://[::1]/x"));
    assert.ok(wh.validateWebhookUrl("https://localhost/x"));
    assert.ok(wh.validateWebhookUrl("https://printer.local/x"));
    assert.ok(wh.validateWebhookUrl("not a url"));
  });

  await check("signature matches the documented verification recipe", () => {
    const secret = wh.newWebhookSecret();
    assert.match(secret, /^whsec_[0-9a-f]{48}$/);
    const body = JSON.stringify({ type: "lead.created", data: { x: 1 } });
    const header = wh.signWebhookBody(secret, body, 1_800_000_000);
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
    const expected = createHmac("sha256", secret).update(parts.t + "." + body).digest("hex");
    assert.ok(timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1)));
    assert.equal(parts.t, "1800000000");
  });

  await check("delivery refuses private targets before any request", async () => {
    const r = await wh.deliverWebhook({ url: "https://127.0.0.1/hook", secret: "s", createdAt: "" }, "webhook.test", {}, { retry: false });
    assert.equal(r.ok, false);
  });

  await check("connect-time DNS guard blocks a public name that resolves to loopback", async () => {
    // localtest.me is a public DNS name that resolves to 127.0.0.1 - the rebinding case.
    const r = await wh.deliverWebhook({ url: "https://localtest.me/hook", secret: "s", createdAt: "" }, "webhook.test", {}, { retry: false });
    assert.equal(r.ok, false);
    if (r.error && !/ENOTFOUND|EAI_AGAIN/.test(r.error)) assert.match(r.error, /private or reserved/);
    else console.log("   (DNS unavailable here; shape-only)");
  });

  // ── Reply templates ────────────────────────────────────────────────────────
  await check("reply templates encode safely and use the date in UTC", () => {
    const lead = {
      customerName: "Sam & Alex?",
      customerEmail: "sam+events@example.com",
      eventType: "BIRTHDAY",
      preferredDate: new Date("2026-12-12T00:00:00Z"),
      guestCount: 40,
    };
    const ts = replies.replyTemplates(lead, "Demo Brewing");
    assert.equal(ts.length, 4);
    const available = ts.find((t) => t.key === "available")!;
    assert.match(available.body, /Saturday, December 12 is open for about 40 guests/);
    const href = replies.mailtoHref(lead.customerEmail, available);
    assert.ok(href.startsWith("mailto:sam%2Bevents@example.com?subject="));
    assert.ok(!href.includes("&body=Hi Sam"), "body must be encoded");
    assert.equal(decodeURIComponent(href.split("&body=")[1]), available.body);
    assert.match(ts[0].body, /^Hi Sam,/);
  });

  console.log(`\n${checks} integration checks passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
