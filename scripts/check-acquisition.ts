/**
 * Offline checks for the acquisition program (no DB, no network): researched prospect data,
 * draft claims, CAN-SPAM footer, tracked links, dedupe keys and signup attribution parsing.
 * The prospect list is private (gitignored): its checks run only when the file is present.
 *
 *   npx tsx scripts/check-acquisition.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { parseProspectFile, type ProspectSeed } from "../src/lib/acquisition/prospects.data";
import { validateSeed } from "../src/lib/acquisition/store";
import * as d from "../src/lib/acquisition/discover";
import { buildDraft, draftProblems, renderEmail, unsubscribeUrl } from "../src/lib/acquisition/drafts";
import { CAMPAIGN_ID, chicagoDay, dedupeKey, domainOf, isSharedHost, normalizeName, trackedUrl } from "../src/lib/acquisition/program";
import {
  attributionFromLanding,
  parseAttributionCookie,
  readCookie,
  sanitizeAttribution,
  serializeAttribution,
} from "../src/lib/acquisition/attribution";

const PRIVATE_FILE = process.env.ACQ_PROSPECTS_FILE ?? "private/acquisition/prospects-2026-11.json";
let PROSPECTS: ProspectSeed[] = [];
if (existsSync(PRIVATE_FILE)) {
  const parsed = parseProspectFile(readFileSync(PRIVATE_FILE, "utf8"));
  if (parsed.error) throw new Error(`${PRIVATE_FILE}: ${parsed.error}`);
  PROSPECTS = parsed.seeds;
} else {
  console.log(`(no ${PRIVATE_FILE}; prospect-data checks skipped)`);
}

let n = 0;
const check = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};

// Only role/business addresses: the local part must name a role or the business, never a person.
const ROLE_LOCAL = /(info|event|part|hello|contact|store|taproom|banquet|help|play|reserv|pub|tavern)/i;

check("every researched prospect is valid and sourced", () => {
  for (const p of PROSPECTS) {
    assert.equal(validateSeed(p), null, `${p.name}: ${validateSeed(p)}`);
    assert.ok(p.sourceUrl.startsWith("http"), `${p.name}: source`);
    if (p.email) assert.ok(ROLE_LOCAL.test(p.email.split("@")[0]), `${p.name}: not a role/business address ${p.email}`);
  }
});

check("no duplicate businesses within a brand, and no business in both brands", () => {
  const keys = new Set<string>();
  const domains = new Map<string, string>();
  for (const p of PROSPECTS) {
    const k = dedupeKey(p.brand, p);
    assert.ok(!keys.has(k), `duplicate ${k}`);
    keys.add(k);
    const d = domainOf(p.website);
    if (d) {
      assert.ok(!domains.has(d) || domains.get(d) === p.brand, `${p.name} appears in both brands`);
      domains.set(d, p.brand);
    }
  }
});

check("drafts for every prospect pass the forbidden-claim gate", () => {
  for (const p of PROSPECTS) {
    const d = buildDraft({ brand: p.brand, name: p.name, segment: p.segment, useCase: p.useCase, token: "tok_test_12345" });
    assert.deepEqual(draftProblems(d), [], `${p.name}: ${draftProblems(d).join(", ")}`);
    assert.ok(d.body.includes(p.name), "personalized greeting");
    assert.ok(!/\{\{(?!link:|demo:)/.test(d.body), "unknown placeholder");
  }
});

check("forbidden-claim gate catches unsupported claims", () => {
  assert.ok(draftProblems({ subject: "x", body: "Trusted by hundreds of bars" }).length > 0);
  assert.ok(draftProblems({ subject: "x", body: "Get free contracts and deposits" }).length > 0);
  assert.ok(draftProblems({ subject: "x", body: "We guarantee more players" }).length > 0);
  assert.ok(draftProblems({ subject: "x", body: "Text message reminders" }).length > 0);
});

check("rendered email has sender identity, postal address, unsubscribe and tracked links", () => {
  for (const brand of ["lp", "vs"] as const) {
    const d = buildDraft({ brand, name: "Test Tap", segment: "bar", useCase: "your Tuesday trivia", token: "tok_test_12345" });
    const { html, text } = renderEmail({ brand, name: "Test Tap", body: d.body, token: "tok_test_12345", postalAddress: "1 Main St, Glenview IL 60026" });
    const unsub = unsubscribeUrl(brand, "tok_test_12345");
    assert.ok(html.includes(unsub) && text.includes(unsub), "unsubscribe link");
    assert.ok(html.includes("1 Main St, Glenview IL 60026") && text.includes("1 Main St"), "postal address");
    assert.ok(text.includes(brand === "lp" ? "LeaguePour" : "VenueSprocket"), "sender brand");
    assert.ok(text.includes("ref=tok_test_12345") && text.includes(`utm_campaign=${CAMPAIGN_ID}`), "tracked link");
    assert.ok(!html.includes("<script"), "no script");
    assert.ok(!/\{\{/.test(text), "all placeholders filled");
  }
});

check("HTML rendering escapes owner-edited text", () => {
  const { html } = renderEmail({ brand: "lp", name: "<b>X</b>", body: "Hi <img src=x onerror=alert(1)>", token: "tok_test_12345", postalAddress: "addr" });
  assert.ok(!html.includes("<img"), "escaped");
});

check("tracked URL keeps the real page and adds attribution", () => {
  const u = new URL(trackedUrl("vs", "/start", "tok_abcdefgh", "start"));
  assert.equal(u.origin, "https://venuesprocket.com");
  assert.equal(u.pathname, "/start");
  assert.equal(u.searchParams.get("ref"), "tok_abcdefgh");
  assert.equal(u.searchParams.get("utm_source"), "outreach");
});

check("dedupe keys: domain first, shared hosts fall back to name+city", () => {
  assert.equal(domainOf("https://www.Example-Bar.test/x"), "example-bar.test");
  assert.equal(domainOf("not a url"), null);
  assert.ok(isSharedHost("facebook.com") && isSharedHost("m.facebook.com"));
  assert.equal(dedupeKey("lp", { name: "Example Bar", city: "Chicago", website: "https://example-bar.test" }), "lp:d:example-bar.test");
  assert.equal(
    dedupeKey("lp", { name: "The Joe's Bar", city: "Chicago", website: "https://facebook.com/joes" }),
    dedupeKey("lp", { name: "Joes", city: "chicago", website: null }),
  );
  assert.equal(normalizeName("Kibbitznest Books, Brews & Blarney"), "kibbitznest books brews and blarney");
});

check("attribution: landing capture, own-host referrers ignored, cookie round trip", () => {
  const own = ["leaguepour.com", "venuesprocket.com"];
  const now = new Date("2026-11-22T15:00:00.000Z");
  const a = attributionFromLanding(new URL("https://leaguepour.com/tools?utm_source=outreach&utm_medium=email&utm_campaign=acq-2026-11&ref=tok_abcdefgh"), "", own, now);
  assert.equal(a?.ref, "tok_abcdefgh");
  assert.equal(a?.landing, "/tools");
  assert.equal(attributionFromLanding(new URL("https://leaguepour.com/pricing"), "https://leaguepour.com/", own, now), null);
  assert.equal(attributionFromLanding(new URL("https://leaguepour.com/pricing"), "https://www.venuesprocket.com/x", own, now), null);
  const g = attributionFromLanding(new URL("https://leaguepour.com/"), "https://www.google.com/", own, now);
  assert.equal(g?.referrerHost, "google.com");
  const cookie = serializeAttribution(a!);
  assert.deepEqual(parseAttributionCookie(readCookie(`x=1; lp_acq=${cookie}; y=2`, "lp_acq")), a);
});

check("attribution: untrusted values are rejected", () => {
  assert.equal(parseAttributionCookie("%7Bnot json"), null);
  assert.equal(sanitizeAttribution({ source: "<script>" }), null);
  const s = sanitizeAttribution({ source: "outreach", ref: "../../etc", landing: "javascript:alert(1)" });
  assert.equal(s?.ref, undefined);
  assert.equal(s?.landing, undefined);
});

check("upload parser rejects malformed files", () => {
  assert.ok(parseProspectFile("{").error);
  assert.ok(parseProspectFile("{}").error);
  assert.ok(parseProspectFile('[{"brand":"xx"}]').error);
  assert.equal(parseProspectFile("[]").seeds.length, 0);
});

check("discovery helpers: robots.txt, site name, role email, expansion order", () => {
  const robots = ["User-agent: Googlebot", "Disallow: /", "", "User-agent: *", "Disallow: /private", "# comment", ""].join("\n");
  assert.deepEqual(d.robotsDisallows(robots), ["/private"]);
  assert.equal(d.pathAllowed("/events", ["/private"]), true);
  assert.equal(d.pathAllowed("/private-events", ["/private"]), false);
  assert.equal(d.pathAllowed("/", ["/"]), false);
  assert.deepEqual(d.robotsDisallows(["User-agent: LeaguePourBot", "Disallow: /", "User-agent: *", "Disallow:"].join("\n")), ["/"]);
  assert.equal(d.siteName('<title>The Corner Tap | Bar &amp; Grill in Evanston</title>'), "The Corner Tap");
  assert.equal(d.siteName('<meta property="og:site_name" content="Hop Hall"><title>Home</title>'), "Hop Hall");
  assert.equal(d.siteName("<title>Home</title>"), null);
  assert.equal(d.roleEmail(['<a href="mailto:jane.doe@cornertap.test">x</a> events@cornertap.test'], "cornertap.test"), "events@cornertap.test");
  assert.equal(d.roleEmail(["info@other-domain.test"], "cornertap.test"), null, "only the business's own domain");
  assert.equal(d.roleEmail(["jane@cornertap.test"], "cornertap.test"), null, "never personal-name addresses");
  assert.equal(d.isPublicWebUrl("https://cornertap.test/"), true);
  for (const bad of ["http://127.0.0.1/", "http://localhost:3000/", "ftp://x.test/", "http://intranet/", "http://[::1]/", "http://db.internal/"]) assert.equal(d.isPublicWebUrl(bad), false, bad);
  assert.equal(d.queryAt(0)?.city, "Chicago");
  assert.equal(d.queryAt(d.DISCOVERY_TEMPLATES.length)?.city, d.DISCOVERY_CITIES[1]);
  assert.equal(d.queryAt(d.DISCOVERY_CITIES.length * d.DISCOVERY_TEMPLATES.length), null);
});

check("Chicago day boundaries", () => {
  assert.equal(chicagoDay(new Date("2026-11-22T05:59:00Z")), "2026-11-21");
  assert.equal(chicagoDay(new Date("2026-11-22T06:01:00Z")), "2026-11-22");
});

console.log(`\n${n} checks passed (${PROSPECTS.length} prospects: ${PROSPECTS.filter((p) => p.brand === "lp").length} LP, ${PROSPECTS.filter((p) => p.brand === "vs").length} VS)`);
