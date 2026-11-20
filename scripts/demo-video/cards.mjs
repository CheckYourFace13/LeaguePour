// Branded opening / closing cards, rendered in the real app origin so the site's own fonts load.
const LP = { bg1: "#0a1a3f", bg2: "#0057d9", accent: "#ffe042", text: "#ffffff", logo: "/logos/leaguepour-full-logo.png", font: "'Barlow Condensed'", body: "Inter" };
const VS = { bg1: "#1d1612", bg2: "#2c3e50", accent: "#e0a46b", text: "#ffffff", logo: "/logos/venuesprocket-full-logo.png", font: "'Barlow Condensed'", body: "Inter" };

export function cardHtml(brand, { kicker, title, sub, url, pills = [] }) {
  const b = brand === "vs" ? VS : LP;
  return `
<style>
  html,body{margin:0;height:100%;overflow:hidden}
  body{background:radial-gradient(1200px 700px at 78% 18%, ${b.bg2} 0%, ${b.bg1} 62%);color:${b.text};font-family:${b.body},system-ui,sans-serif;display:flex;align-items:center;justify-content:center}
  .wrap{width:1040px}
  .logo{display:inline-flex;align-items:center;background:#fff;border-radius:18px;padding:14px 22px;box-shadow:0 20px 50px -20px rgba(0,0,0,.6)}
  .logo img{height:54px;display:block}
  .k{margin-top:38px;font:700 20px/1 ${b.body},sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${b.accent}}
  h1{color:#fff !important;margin:14px 0 0;font:800 84px/0.98 ${b.font},sans-serif;letter-spacing:-.01em;text-transform:none}
  p{margin:22px 0 0 !important;font:500 27px/1.4 ${b.body},sans-serif;color:rgba(255,255,255,.86);max-width:900px}
  .pills{margin-top:30px;display:flex;gap:12px;flex-wrap:wrap}
  .pill{border:1.5px solid rgba(255,255,255,.35);border-radius:999px;padding:9px 18px;font:600 19px ${b.body},sans-serif;color:#fff;background:rgba(255,255,255,.06)}
  .url{margin-top:34px;display:inline-block;background:${b.accent};color:${b.bg1};font:800 30px ${b.body},sans-serif;border-radius:14px;padding:14px 26px}
  .a{opacity:0;transform:translateY(14px);animation:in .7s cubic-bezier(.2,.7,.2,1) forwards}
  .d1{animation-delay:.05s}.d2{animation-delay:.25s}.d3{animation-delay:.45s}.d4{animation-delay:.65s}.d5{animation-delay:.85s}
  @keyframes in{to{opacity:1;transform:none}}
  #__demo_cursor{display:none}
  .paused .a{animation-play-state:paused}
</style>
<div class="wrap paused" id="__card">
  <div class="logo a d1"><img src="${b.logo}" alt=""></div>
  ${kicker ? `<div class="k a d2">${kicker}</div>` : ""}
  <h1 class="a d3">${title}</h1>
  ${sub ? `<p class="a d4">${sub}</p>` : ""}
  ${pills.length ? `<div class="pills a d5">${pills.map((p) => `<span class="pill">${p}</span>`).join("")}</div>` : ""}
  ${url ? `<div class="url a d5">${url}</div>` : ""}
</div>`;
}

/** Replace the current (same-origin) document's content with a card. Keeps stylesheets for fonts. */
export async function showCard(page, brand, opts) {
  // Static document on the app origin (no React to re-render over it); reuse the app's stylesheets for fonts.
  const origin = new URL(page.url()).origin;
  const css = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href));
  await page.goto(origin + "/robots.txt", { waitUntil: "load" });
  const html = `<!doctype html><html><head><meta charset="utf-8">${css.map((h) => `<link rel="stylesheet" href="${h}">`).join("")}</head><body>${cardHtml(brand, opts)}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
}

export async function startCard(page) {
  await page.evaluate(() => document.getElementById("__card")?.classList.remove("paused"));
}
