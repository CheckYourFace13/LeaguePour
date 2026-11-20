// LeaguePour demo recording against the LOCAL QA server + throwaway DB. Real clicks/typing.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { launch, newRecordingPage, recorder, sleep, glide, center, click, typeInto, highlight, scrollTo, smoothScrollY, settle, shot } from "./lib.mjs";
import { showCard, startCard } from "./cards.mjs";

const S = process.env.SCRATCH;
const OUT = path.join(S, "clips", "lp");
fs.mkdirSync(OUT, { recursive: true });
const durs = JSON.parse(fs.readFileSync(path.join(S, "vo", "durations.json"), "utf8"))["lp-main"];
const BASE = "http://leaguepour.com";
const W = 1280, H = 720, SCALE = 1.5;
const only = process.argv[2] ? process.argv[2].split(",") : null;
const want = (id) => !only || only.includes(id);
const target = (id, extra = 0.9) => (durs[id] + extra) * 1000;
const stateFile = path.join(OUT, "state.json");
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 1));

const browser = await launch();
const { ctx, page } = await newRecordingPage(browser, { width: W, height: H, scale: SCALE, storageState: state.storage });
const rec = await recorder(page, { width: W * SCALE, height: H * SCALE });
const mob = await newRecordingPage(browser, { width: 390, height: 844, scale: 2, mobile: true });
const mrec = await recorder(mob.page, { width: 780, height: 1688 });

async function seg(id, fn, extra, r = rec, suffix = "") {
  const t0 = Date.now();
  await r.start();
  await fn();
  const left = target(id, extra) - (Date.now() - t0);
  if (left > 0) await sleep(left);
  const took = (Date.now() - t0) / 1000;
  await r.stop(path.join(OUT, `${id}${suffix}.mp4`));
  console.log("clip", id + suffix, took.toFixed(2), "s (narration", durs[id], ")");
}

if (want("intro")) {
  await page.goto(BASE + "/tools", { waitUntil: "load" });
  await page.evaluate(() => (document.body.innerHTML = ""));
  await showCard(page, "lp", {
      kicker: "Bar leagues & tournaments",
      title: "Signups, brackets, scores and standings. One place.",
      sub: "A real walkthrough of LeaguePour with demo data - from the free bracket tool to a live scoreboard.",
      pills: ["Free bracket tools", "QR signup", "Live standings"],
    });
  await seg("intro", async () => {
    await startCard(page);
  }, 1.0);
}

const teams = ["Bag Daddies", "Lucky Darts", "The Pour Decisions", "Corn Stars", "Triple Twenty", "Bullseye Bandits", "Hole Patrol", "Last Call Legends"];
if (want("tool") || want("tool2")) {
  await page.goto(BASE + "/tools/double-elimination-bracket-generator", { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(900, 200);
}
if (want("tool")) {
  await seg("tool", async () => {
    await sleep(300);
    const ta = page.locator("textarea").first();
    await scrollTo(page, page.locator("h1").first(), 0.12, 600);
    await click(page, ta);
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Delete");
    for (let i = 0; i < teams.length; i++) {
      await ta.pressSequentially(teams[i], { delay: 30 });
      if (i < teams.length - 1) await page.keyboard.press("Enter");
    }
    const wb = page.getByRole("heading", { name: /Winners bracket/i }).first();
    const { x, y } = await center(wb);
    await glide(page, x + 220, y + 110, 600);
  }, 0.6);
  await shot(page, "lp-01-free-tool", {
    teams: page.locator("textarea").first(),
    winners: page.getByRole("heading", { name: /Winners bracket/i }).first(),
    share: page.getByRole("button", { name: /Copy share link/i }),
  });
}
if (want("tool2")) {
  await seg("tool2", async () => {
    await click(page, page.getByRole("button", { name: "Bag Daddies" }).first());
    await sleep(350);
    await click(page, page.getByRole("button", { name: "Corn Stars" }).first());
    await sleep(350);
    const lb = page.getByText(/Losers bracket/i).first();
    await scrollTo(page, lb, 0.22, 900);
    const lost = page.getByRole("button", { name: "Lucky Darts" }).last();
    const { x, y } = await center(lost);
    await glide(page, x, y, 500);
    await highlight(page, lost.locator("xpath=.."), 1600);
    await sleep(1500);
  }, 0.6);
}

if (want("signup")) {
  await page.goto(BASE + "/signup/venue", { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(640, 600);
  await shot(page, "lp-02-signup", { form: page.locator("#name"), aside: page.locator("#signup-what-next") });
  await seg("signup", async () => {
    await typeInto(page, page.locator("#name"), "Alex Rivera", { delay: 35 });
    await typeInto(page, page.locator("#email"), "alex@example.com", { delay: 28 });
    await typeInto(page, page.locator("#password"), "demo-pass-2026", { delay: 22 });
    await typeInto(page, page.locator("#venueName"), "Northside Tap & Trophy (Demo)", { delay: 26 });
    await click(page, page.getByRole("button", { name: /Create free account/i }));
    await page.waitForURL(/\/venue\/dashboard/, { timeout: 30000 });
    await settle(page, 400);
    await page.mouse.move(400, 260);
  }, 0.5);
  state.storage = await ctx.storageState();
  save();
}

if (want("create") || want("create2")) {
  if (!page.url().includes("/venue/dashboard") && !page.url().includes("/competitions/new")) {
    await page.goto(BASE + "/venue/dashboard", { waitUntil: "load" });
    await settle(page);
  }
}
if (want("create")) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "lp-03-dashboard", { create: page.getByRole("link", { name: "Create a competition" }).first() });
  await seg("create", async () => {
    const btn = page.getByRole("link", { name: "Create a competition" }).first();
    await click(page, btn);
    await page.waitForURL(/competitions\/new/);
    await settle(page, 300);
    await typeInto(page, page.locator("#title"), "Thursday Blind Draw Darts", { delay: 32 });
    await click(page, page.locator("#kind"));
    await page.locator("#kind").selectOption("DARTS");
    const bk = page.locator("#bracketKind");
    await scrollTo(page, bk, 0.45, 900);
    await click(page, bk);
    await bk.selectOption("SINGLE_ELIMINATION");
    await highlight(page, bk, 1400);
    await sleep(500);
  }, 0.5);
  await shot(page, "lp-04-builder-format", { format: page.locator("#bracketKind"), schedule: page.locator("#scheduleKind") });
}
if (want("create2")) {
  await seg("create2", async () => {
    const fee = page.locator("#entryFee");
    await scrollTo(page, fee, 0.4, 800);
    await highlight(page, fee.locator("xpath=.."), 1500);
    await typeInto(page, page.locator("#participantCap"), "16", { delay: 80 });
    const pub = page.locator('input[name="publishNow"]');
    await scrollTo(page, pub, 0.55, 800);
    await click(page, pub);
    await click(page, page.getByRole("button", { name: "Save competition" }));
    await page.waitForURL(/\/venue\/competitions\/[^/]+\?created=1/);
    await settle(page, 400);
  }, 0.4);
  state.compUrl = page.url().split("?")[0];
  save();
}

if (want("public")) {
  await page.goto(state.compUrl, { waitUntil: "load" });
  await settle(page);
  const href = await page.locator('a[href*="/c/"]').first().getAttribute("href");
  state.publicUrl = BASE + new URL(href, BASE).pathname;
  save();
  await page.goto(state.publicUrl, { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(900, 250);
  await shot(page, "lp-05-public-page", {
    entry: page.getByText(/\$0 entry/).first(),
  });
  const qr = page.locator('img[alt*="QR" i]').first();
  await seg("public", async () => {
    await scrollTo(page, qr, 0.35, 900);
    const c = await center(qr);
    await glide(page, c.x, c.y, 500);
    await highlight(page, qr, 1500);
    await sleep(1400);
  }, -durs.public + 3.6);
  await shot(page, "lp-06-qr", { qr, register: page.getByRole("link", { name: /Create player account/i }).first() });
  await mob.page.goto(state.publicUrl, { waitUntil: "load" });
  await settle(mob.page);
  await mob.page.mouse.move(195, 600);
  await seg("public", async () => {
    await sleep(500);
    const cta = mob.page.getByRole("link", { name: /Create player account|Sign up|Register/i }).first();
    await scrollTo(mob.page, cta, 0.6, 1400);
    await highlight(mob.page, cta, 1500);
    await sleep(1200);
  }, -durs.public + 5.2, mrec, "-m");
  await shot(mob.page, "lp-07-public-mobile", {});
}

if (want("run")) {
  const slug = new URL(state.publicUrl).pathname.split("/")[2];
  execFileSync("node", [path.join(S, "rec", "seed-regs.mjs"), slug, "8"], { stdio: "inherit", cwd: path.join(S, "rec") });
  await page.goto(state.compUrl, { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(700, 300);
  await seg("run", async () => {
    const start = page.getByRole("button", { name: /Start tournament/i });
    await scrollTo(page, start, 0.4, 1000);
    await highlight(page, start, 900);
    await click(page, start);
    await page.locator('input[name="homeScore"]').first().waitFor({ timeout: 15000 });
    await settle(page, 300);
    const h = page.locator('input[name="homeScore"]').first();
    await scrollTo(page, h, 0.5, 900);
    await typeInto(page, h, "3", { delay: 60 });
    await typeInto(page, page.locator('input[name="awayScore"]').first(), "1", { delay: 60 });
    await click(page, page.getByRole("button", { name: "Save match" }).first());
    await settle(page, 900);
  }, 0.3);
  await shot(page, "lp-08-score-entry", {
    home: page.locator('input[name="homeScore"]').nth(0),
    save: page.getByRole("button", { name: "Save match" }).nth(0),
  });
  for (let guard = 0; guard < 6; guard++) {
    const hs = page.locator('input[name="homeScore"]');
    const n = await hs.count();
    let did = false;
    for (let j = 0; j < n; j++) {
      if (!(await hs.nth(j).inputValue())) {
        await hs.nth(j).fill(String(2 + (j % 2)));
        await page.locator('input[name="awayScore"]').nth(j).fill(String(j % 2 === 0 ? 1 : 0));
        await page.getByRole("button", { name: "Save match" }).nth(j).click();
        await settle(page, 900);
        did = true;
        break;
      }
    }
    if (!did) break;
  }
  const adv = page.getByRole("button", { name: "Advance to next round" });
  if (await adv.count()) { await adv.click(); await settle(page, 900); }
  save();
}

if (want("board")) {
  await page.goto(state.publicUrl, { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(900, 300);
  await seg("board", async () => {
    await sleep(500);
    const live = page.getByRole("link", { name: /Live scoreboard/i }).first();
    await highlight(page, live, 900);
    await click(page, live);
    await page.waitForURL(/scoreboard/);
    await settle(page, 1200);
  }, 0.4);
  await shot(page, "lp-09-scoreboard", {});
}

if (want("price")) {
  await page.goto(BASE + "/pricing", { waitUntil: "load" });
  await settle(page);
  await page.mouse.move(640, 200);
  await seg("price", async () => {
    const start = page.getByText(/Start free:/i).first();
    if (await start.count()) { const c = await center(start); await glide(page, c.x, c.y, 500); await highlight(page, start.locator("xpath=.."), 1800); }
    await sleep(1000);
    await smoothScrollY(page, 480, 1100);
    await sleep(900);
    const fees = page.getByText(/Free \(\$0\) events have neither/i).first();
    if (await fees.count()) { await scrollTo(page, fees, 0.35, 1100); await highlight(page, fees, 1600); }
  }, 0.6);
}

if (want("cta")) {
  await page.goto(BASE + "/tools", { waitUntil: "load" });
  await showCard(page, "lp", {
      kicker: "Start free",
      title: "Your first competition is free.",
      sub: "No card. Or plan a night with the free bracket tools - no account needed.",
      url: "leaguepour.com",
    });
  await seg("cta", async () => {
    await startCard(page);
  }, 1.6);
}

await browser.close();
console.log("done");
