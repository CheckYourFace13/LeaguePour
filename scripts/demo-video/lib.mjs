// Recording helpers: real Chrome via playwright-core, frames captured with CDP screencast,
// a visible cursor overlay that follows the real (synthetic) mouse events Playwright dispatches.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const CURSOR_JS = `
(() => {
  if (window.__demoCursor) return;
  window.__demoCursor = true;
  const install = () => {
    if (!document.body || document.getElementById('__demo_cursor')) return;
    const c = document.createElement('div');
    c.id = '__demo_cursor';
    c.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M5 3 L5 22 L10 17.5 L13.6 25 L17 23.4 L13.5 16 L20.5 16 Z" fill="#111" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {position:'fixed', left:'0px', top:'0px', width:'28px', height:'28px', zIndex:2147483647, pointerEvents:'none', transform:'translate(-5px,-3px)', transition:'none'});
    const x = window.__demoMouse || {x: -100, y: -100};
    c.style.left = x.x + 'px'; c.style.top = x.y + 'px';
    document.body.appendChild(c);
    const st = document.createElement('style');
    st.textContent = '@keyframes __demo_ripple{from{transform:translate(-50%,-50%) scale(.3);opacity:.55}to{transform:translate(-50%,-50%) scale(1.6);opacity:0}}' +
      '.__demo_ripple{position:fixed;width:44px;height:44px;border-radius:50%;background:rgba(255,166,0,.55);pointer-events:none;z-index:2147483646;animation:__demo_ripple .5s ease-out forwards}' +
      '.__demo_hl{position:fixed;border:3px solid #ffb020;border-radius:12px;box-shadow:0 0 0 6px rgba(255,176,32,.25);pointer-events:none;z-index:2147483645;transition:opacity .3s}' +
      'html{scrollbar-width:none} ::-webkit-scrollbar{display:none}';
    document.head.appendChild(st);
  };
  document.addEventListener('mousemove', (e) => {
    window.__demoMouse = {x: e.clientX, y: e.clientY};
    const c = document.getElementById('__demo_cursor');
    if (c) { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }
  }, true);
  document.addEventListener('mousedown', (e) => {
    const r = document.createElement('div'); r.className='__demo_ripple';
    r.style.left = e.clientX+'px'; r.style.top = e.clientY+'px';
    document.body.appendChild(r); setTimeout(() => r.remove(), 600);
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  new MutationObserver(install).observe(document.documentElement, {childList: true, subtree: false});
  setInterval(install, 300);
})();
`;

export async function launch() {
  return chromium.launch({ executablePath: CHROME, headless: true, args: [
    "--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none",
    // Production hostnames resolve to the LOCAL QA server inside this browser only, so on-screen
    // URLs read like the real product. Nothing here reaches production.
    "--host-resolver-rules=MAP leaguepour.com:80 127.0.0.1:3100, MAP venuesprocket.com:80 127.0.0.1:3100, MAP leaguepour.com:443 ~NOTFOUND, MAP venuesprocket.com:443 ~NOTFOUND",
  ] });
}

/** Creates a page that records. viewport is CSS px; scale is deviceScaleFactor. */
export async function newRecordingPage(browser, { width, height, scale, mobile = false, storageState } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: "no-preference",
    storageState,
    userAgent: mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  await ctx.addInitScript(CURSOR_JS);
  // Never send demo sessions to the production analytics/ads properties.
  await ctx.route(/googletagmanager|google-analytics|doubleclick|googlesyndication|fundingchoices|adtrafficquality/, (r) => r.abort());
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  return { ctx, page };
}

/** Screencast recorder. start() -> ... -> stop(outMp4). Produces CFR 30fps H.264 (intermediate, high quality). */
export async function recorder(page, { width, height }) {
  const cdp = await page.context().newCDPSession(page);
  let dir = null;
  let frames = [];
  let n = 0;
  let recording = false;
  cdp.on("Page.screencastFrame", async (f) => {
    try { await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch {}
    if (!recording || !dir) return;
    try {
      const file = path.join(dir, `f${String(n++).padStart(6, "0")}.jpg`);
      fs.writeFileSync(file, Buffer.from(f.data, "base64"));
      frames.push({ file, t: Date.now() / 1000 });
    } catch {}
  });
  return {
    async start() {
      dir = fs.mkdtempSync(path.join(process.env.SCRATCH, "frames-"));
      frames = [];
      n = 0;
      recording = true;
      await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: width, maxHeight: height, everyNthFrame: 1 });
      this.t0 = Date.now() / 1000;
    },
    async stop(out) {
      const tEnd = Date.now() / 1000;
      await new Promise((r) => setTimeout(r, 150));
      recording = false;
      await cdp.send("Page.stopScreencast");
      if (frames.length === 0) throw new Error("no frames");
      // concat list with real durations; last frame held until stop time
      let list = "ffconcat version 1.0\n";
      for (let i = 0; i < frames.length; i++) {
        const next = i + 1 < frames.length ? frames[i + 1].t : Math.max(tEnd, frames[i].t + 0.04);
        const d = Math.max(0.001, next - frames[i].t);
        list += `file '${frames[i].file.replace(/\\/g, "/")}'\nduration ${d.toFixed(4)}\n`;
      }
      list += `file '${frames[frames.length - 1].file.replace(/\\/g, "/")}'\n`;
      const lf = path.join(dir, "list.txt");
      fs.writeFileSync(lf, list);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lf,
        "-vf", `scale=${width}:${height}:flags=lanczos,fps=30,format=yuv420p`, "-c:v", "libx264", "-crf", "12", "-preset", "fast", out]);
      const d = dir;
      dir = null;
      fs.rmSync(d, { recursive: true, force: true });
      return out;
    },
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

/** Smooth human-ish mouse travel to a point. */
export async function glide(page, x, y, ms = 480) {
  const from = await page.evaluate(() => window.__demoMouse || { x: innerWidth / 2, y: innerHeight / 2 });
  const steps = Math.max(6, Math.round(ms / 30));
  const t0 = Date.now();
  for (let i = 1; i <= steps; i++) {
    const t = ease(i / steps);
    await page.mouse.move(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
    const due = t0 + (ms * i) / steps - Date.now();
    if (due > 0) await sleep(due);
  }
}

export async function center(locator) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw new Error("no box");
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b };
}

/** Smooth scroll so the element sits around `frac` of the viewport height. */
export async function scrollTo(page, locator, frac = 0.35, ms = 900) {
  const target = await locator.evaluate((el, frac) => {
    const r = el.getBoundingClientRect();
    return window.scrollY + r.top - window.innerHeight * frac;
  }, frac);
  await smoothScrollY(page, target, ms);
}

export async function smoothScrollY(page, targetY, ms = 900) {
  await page.evaluate(([targetY, ms]) => new Promise((res) => {
    const startY = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const end = Math.max(0, Math.min(max, targetY));
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, startY + (end - startY) * ease(t));
      if (t < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  }), [targetY, ms]);
}

export async function click(page, locator, { pause = 140, ms = 480 } = {}) {
  const { x, y } = await center(locator);
  await glide(page, x, y, ms);
  await sleep(pause);
  await page.mouse.down();
  await sleep(70);
  await page.mouse.up();
}

export async function typeInto(page, locator, text, { delay = 40, ms = 450 } = {}) {
  await click(page, locator, { ms });
  await locator.pressSequentially(text, { delay });
}

export async function highlight(page, locator, ms = 1400) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el, ms) => {
    const r = el.getBoundingClientRect();
    const h = document.createElement("div");
    h.className = "__demo_hl";
    Object.assign(h.style, { left: r.left - 6 + "px", top: r.top - 6 + "px", width: r.width + 12 + "px", height: r.height + 12 + "px" });
    document.body.appendChild(h);
    setTimeout(() => { h.style.opacity = "0"; setTimeout(() => h.remove(), 350); }, ms);
  }, ms);
}

export async function settle(page, ms = 700) {
  try { await page.waitForLoadState("load", { timeout: 15000 }); } catch {}
  await sleep(ms);
}

/** Full-viewport screenshot + bounding boxes (as % of viewport) of named controls, for annotations. */
export async function shot(page, name, marks = {}) {
  const dir = path.join(process.env.SCRATCH, "shots");
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => { const c = document.getElementById("__demo_cursor"); if (c) c.style.visibility = "hidden"; document.querySelectorAll(".__demo_hl,.__demo_ripple").forEach((e) => e.remove()); });
  await sleep(150);
  const vp = page.viewportSize();
  const boxes = {};
  for (const [k, loc] of Object.entries(marks)) {
    try {
      const b = await loc.boundingBox();
      if (b) boxes[k] = { x: +(100 * (b.x + b.width / 2) / vp.width).toFixed(1), y: +(100 * (b.y + b.height / 2) / vp.height).toFixed(1) };
    } catch {}
  }
  await page.screenshot({ path: path.join(dir, name + ".png") });
  fs.writeFileSync(path.join(dir, name + ".json"), JSON.stringify({ vp, boxes }, null, 1));
  await page.evaluate(() => { const c = document.getElementById("__demo_cursor"); if (c) c.style.visibility = "visible"; });
}
