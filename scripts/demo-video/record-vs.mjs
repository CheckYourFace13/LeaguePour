// VenueSprocket demo recording against the LOCAL QA server + throwaway DB. Real clicks/typing.
// Fictional brewery + fictional guest (example.com address).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { launch, newRecordingPage, recorder, sleep, glide, center, click, typeInto, highlight, scrollTo, smoothScrollY, settle, shot } from "./lib.mjs";
import { showCard, startCard } from "./cards.mjs";

const S = process.env.SCRATCH;
const OUT = path.join(S, "clips", "vs");
fs.mkdirSync(OUT, { recursive: true });
const durs = JSON.parse(fs.readFileSync(path.join(S, "vo", "durations.json"), "utf8"))["vs-main"];
const BASE = "http://venuesprocket.com";
const W = 1280, H = 720, SCALE = 1.5;
const only = process.argv[2] ? process.argv[2].split(",") : null;
const want = (id) => !only || only.includes(id);
const target = (id, extra = 0.9) => (durs[id] + extra) * 1000;
const stateFile = path.join(OUT, "state.json");
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 1));
const local = (u) => u.replace(/^https?:\/\/[^/]+/, BASE);

const browser = await launch();
const { ctx, page } = await newRecordingPage(browser, { width: W, height: H, scale: SCALE, storageState: state.storage });
const rec = await recorder(page, { width: W * SCALE, height: H * SCALE });
// Mobile "guest" context, separate cookies (guests never log in)
const mob = await newRecordingPage(browser, { width: 390, height: 844, scale: 2, mobile: true });
const mrec = await recorder(mob.page, { width: 780, height: 1688 });

async function seg(id, fn, extra, r = rec, suffix = "") {
  const t0 = Date.now();
  await r.start();
  await fn();
  const left = target(id, extra) - (Date.now() - t0);
  if (left > 0) await sleep(left);
  await r.stop(path.join(OUT, `${id}${suffix}.mp4`));
  console.log("clip", id + suffix, ((Date.now() - t0) / 1000).toFixed(2), "s (narration", durs[id], ")");
}

if (want("intro")) {
  await page.goto(BASE + "/tools", { waitUntil: "load" });
  await showCard(page, "vs", {
      kicker: "Private event bookings",
      title: "From first inquiry to event-day sheet.",
      sub: "A real walkthrough of VenueSprocket with a sample brewery and a fictional guest.",
      pills: ["Inquiry page", "Proposals", "E-sign contracts", "Deposits", "BEOs"],
    });
  await seg("intro", async () => {
    await startCard(page);
  }, 1.2);
}

if (want("signup")) {
  await page.goto(BASE + "/signup/venue", { waitUntil: "load" });
  await page.mouse.move(640, 600);
  state.email = "morgan@example.com";
  await seg("signup", async () => {
    await sleep(300);
    await typeInto(page, page.locator("#name"), "Morgan Lee", { delay: 45 });
    await typeInto(page, page.locator("#email"), state.email, { delay: 22 });
    await typeInto(page, page.locator("#password"), "demo-pass-2026", { delay: 30 });
    await typeInto(page, page.locator("#venueName"), "Lantern Hall Brewing (Demo)", { delay: 35 });
    await click(page, page.getByRole("button", { name: /Create free account/i }));
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await settle(page);
    await page.mouse.move(640, 360);
    await sleep(500);
    const live = page.getByText("Your inquiry page is live");
    await highlight(page, live.locator("xpath=.."), 1800);
  }, 0.6);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "vs-01-dashboard", {
    link: page.locator("p.font-mono").first(),
    share: page.getByRole("link", { name: /Put the form on your website/i }).first(),
  });
  state.storage = await ctx.storageState();
  // slug from the inquiry URL shown on the dashboard
  const txt = await page.locator("p.font-mono").first().innerText();
  state.inquiryUrl = local(txt.trim());
  state.slug = new URL(state.inquiryUrl).pathname.split("/")[2];
  save();
  // demo plan: Pro (narrated in the video). Throwaway DB only.
  execFileSync("node", [path.join(S, "rec", "vs-pro.mjs"), state.slug], { stdio: "inherit", cwd: path.join(S, "rec") });
}

if (want("share")) {
  await page.goto(BASE + "/app/settings", { waitUntil: "load" });
  await page.mouse.move(640, 300);
  await seg("share", async () => {
    await sleep(300);
    const snip = page.getByText(/website|button|embed/i).first();
    if (await snip.count()) {
      await scrollTo(page, snip, 0.3, 1200);
      await highlight(page, snip.locator("xpath=ancestor::*[self::section or self::div][2]"), 1800);
      const c = await center(snip);
      await glide(page, c.x, c.y + 40, 700);
    }
  }, 0.6);
}

if (want("inquiry")) {
  await mob.page.goto(state.inquiryUrl, { waitUntil: "load" });
  await mob.page.mouse.move(200, 500);
  const mp = mob.page;
  await seg("inquiry", async () => {
    await sleep(300);
    await typeInto(mp, mp.locator('[name="customerName"]'), "Dana Example", { delay: 40 });
    await typeInto(mp, mp.locator('[name="customerEmail"]'), "dana@example.com", { delay: 30 });
    await click(mp, mp.locator('[name="eventType"]'));
    await mp.locator('[name="eventType"]').selectOption("REHEARSAL_DINNER");
    await sleep(200);
    await scrollTo(mp, mp.locator('[name="preferredDate"]'), 0.3, 700);
    const d = new Date(); d.setDate(d.getDate() + 75);
    await mp.locator('[name="preferredDate"]').fill(d.toISOString().slice(0, 10));
    await typeInto(mp, mp.locator('[name="guestCount"]'), "40", { delay: 90 });
    await mp.locator('[name="budgetRange"]').selectOption({ index: 3 });
    await typeInto(mp, mp.locator('[name="notes"]'), "Back room if possible. Two vegetarian guests.", { delay: 22 });
    const send = mp.getByRole("button", { name: "Send inquiry" });
    await scrollTo(mp, send, 0.5, 700);
    await shot(mp, "vs-02-inquiry-mobile", {});
    await click(mp, send);
    await sleep(1500);
  }, 0.4, mrec, "-m");
}

if (want("lead")) {
  await page.goto(BASE + "/app/dashboard", { waitUntil: "load" });
  await page.mouse.move(640, 250);
  await seg("lead", async () => {
    await sleep(400);
    const lead = page.getByRole("link", { name: "Dana Example" }).first();
    await scrollTo(page, lead, 0.45, 1000);
    await highlight(page, lead.locator("xpath=ancestor::tr[1] | ancestor::li[1]").first(), 1200);
    await click(page, lead);
    await page.waitForURL(/\/app\/leads\//);
    await settle(page);
    await page.mouse.move(640, 300);
    await sleep(500);
    const det = page.getByRole("heading", { name: "Event details" });
    await highlight(page, det.locator("xpath=.."), 1800);
  }, 0.4);
  await shot(page, "vs-03-lead", {
    details: page.getByRole("heading", { name: "Event details" }),
    convert: page.getByRole("button", { name: /Convert to event/i }),
  });
  state.leadUrl = page.url();
  save();
}

if (want("proposal")) {
  if (!page.url().includes("/app/leads/")) await page.goto(state.leadUrl, { waitUntil: "load" });
  await seg("proposal", async () => {
    await click(page, page.getByRole("button", { name: /Convert to event/i }));
    await page.waitForURL(/\/app\/events\//);
    await settle(page);
    await page.mouse.move(640, 300);
    const room = page.locator('input[name="roomFee"]');
    await scrollTo(page, room, 0.4, 900);
    await click(page, room);
    await room.fill("");
    await room.pressSequentially("250", { delay: 90 });
    const min = page.locator('input[name="minimumSpend"]');
    await click(page, min);
    await min.fill("");
    await min.pressSequentially("1500", { delay: 90 });
    await typeInto(page, page.locator('input[name="depositAmount"]'), "400", { delay: 90 });
    await shot(page, "vs-04-proposal-builder", {
      room: page.locator('input[name="roomFee"]'),
      min: page.locator('input[name="minimumSpend"]'),
      deposit: page.locator('input[name="depositAmount"]'),
      create: page.getByRole("button", { name: /Create proposal/i }),
    });
    await click(page, page.getByRole("button", { name: /Create proposal/i }));
    await page.waitForURL(/\/app\/proposals\//);
    await settle(page);
    await page.mouse.move(640, 300);
    await sleep(300);
    await click(page, page.getByRole("button", { name: "Send to customer" }));
    await settle(page);
    await sleep(500);
  }, 0.4);
  state.proposalUrl = page.url();
  state.eventUrl = null;
  const link = await page.locator('text=/\\/proposal\\//').first().innerText().catch(() => null);
  state.publicProposal = link ? local(link.trim().match(/https?:\/\/\S+/)?.[0] ?? link.trim()) : null;
  save();
}

if (want("accept")) {
  await mob.page.goto(state.publicProposal, { waitUntil: "load" });
  const mp = mob.page;
  await mp.mouse.move(200, 400);
  await seg("accept", async () => {
    await sleep(300);
    const btn = mp.getByRole("button", { name: /Accept this proposal/i });
    await scrollTo(mp, btn, 0.55, 1300);
    await shot(mp, "vs-05-proposal-mobile", {});
    await click(mp, btn);
    await settle(mp);
    await sleep(700);
  }, 0.4, mrec, "-m");
}

if (want("contract")) {
  // venue generates + activates the contract (desktop), guest signs on phone
  await page.goto(state.proposalUrl, { waitUntil: "load" });
  const back = page.locator('a[href*="/app/events/"]').first();
  state.eventUrl = new URL(await back.getAttribute("href"), BASE).toString();
  await page.goto(state.eventUrl, { waitUntil: "load" });
  await page.mouse.move(640, 300);
  await seg("contract", async () => {
    const gen = page.getByRole("button", { name: /Generate contract/i });
    await scrollTo(page, gen, 0.45, 900);
    await click(page, gen);
    await page.waitForURL(/\/app\/contracts\//);
    await settle(page);
    await page.mouse.move(640, 300);
    await click(page, page.getByRole("button", { name: /Activate for signing/i }));
    await settle(page);
    await sleep(600);
  }, -durs.contract + 5.5);
  const link = await page.locator('text=/\\/sign\\//').first().innerText().catch(() => null);
  state.signUrl = link ? local(link.trim().match(/https?:\/\/\S+/)?.[0] ?? link.trim()) : null;
  state.contractUrl = page.url();
  save();
  await mob.page.goto(state.signUrl, { waitUntil: "load" });
  const mp = mob.page;
  await mp.mouse.move(200, 400);
  await seg("contract", async () => {
    const sig = mp.locator('input[name="typedSignature"]');
    await scrollTo(mp, sig, 0.45, 900);
    const nm = mp.locator('input[name="signerName"]');
    if (!(await nm.inputValue())) await typeInto(mp, nm, "Dana Example", { delay: 40 });
    const em = mp.locator('input[name="signerEmail"]');
    if (!(await em.inputValue())) await typeInto(mp, em, "dana@example.com", { delay: 30 });
    await typeInto(mp, sig, "Dana Example", { delay: 70 });
    await click(mp, mp.locator('input[name="agreed"]'));
    const b = mp.getByRole("button", { name: "Sign contract" });
    await scrollTo(mp, b, 0.5, 600);
    await shot(mp, "vs-06-sign-mobile", {});
    await click(mp, b);
    await settle(mp);
    await sleep(1500);
  }, -durs.contract + 6.5, mrec, "-m");
}

if (want("beo")) {
  await page.goto(state.eventUrl, { waitUntil: "load" });
  await page.mouse.move(640, 300);
  await seg("beo", async () => {
    const b = page.getByRole("button", { name: /Create BEO/i });
    await scrollTo(page, b, 0.45, 900);
    await click(page, b);
    await page.waitForURL(/\/app\/beos\//);
    await settle(page);
    await page.mouse.move(640, 300);
    await typeInto(page, page.locator('[name="roomSetup"]'), "Back room: four rounds of ten, welcome table by the door.", { delay: 18 });
    await typeInto(page, page.locator('[name="foodDetails"]'), "Family-style: flatbreads, salad, smoked chicken. 2 vegetarian.", { delay: 18 });
    const print = page.getByRole("link", { name: /print/i }).first();
    if (await print.count()) { await scrollTo(page, print, 0.4, 700); await highlight(page, print, 1400); }
  }, 0.4);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "vs-07-beo", {
    room: page.locator('[name="roomSetup"]'),
    food: page.locator('[name="foodDetails"]'),
  });
  state.beoUrl = page.url();
  save();
}

if (want("price")) {
  await page.goto(BASE + "/pricing", { waitUntil: "load" });
  await page.mouse.move(640, 200);
  await seg("price", async () => {
    await sleep(600);
    const plans = page.getByText("Starter", { exact: true }).first();
    if (await plans.count()) await scrollTo(page, plans, 0.25, 1500);
    await sleep(1200);
    for (const n of ["Free", "Starter", "Pro"]) {
      const el = page.getByText(n, { exact: true }).first();
      if (await el.count()) { const c = await center(el); await glide(page, c.x, c.y, 700); await highlight(page, el.locator("xpath=ancestor::div[2]"), 1500); await sleep(1500); }
    }
  });
}

if (want("cta")) {
  await page.goto(BASE + "/tools", { waitUntil: "load" });
  await showCard(page, "vs", {
      kicker: "Start free",
      title: "Your inquiry page, live today.",
      sub: "Free plan: inquiry page and lead inbox. No card. Upgrade when you want proposals, contracts and deposits.",
      url: "venuesprocket.com",
    });
  await seg("cta", async () => {
    await startCard(page);
  }, 2.2);
}

await browser.close();
console.log("done");
