/**
 * Setup-time only: pulls CJ-generated links for the approved advertisers, once per website PID,
 * via the official Link Search REST API (GET https://link-search.api.cj.com/v2/link-search,
 * Bearer personal access token, website-id = the property's PID). Nothing here runs on a public
 * page - chosen clickUrls get copied into src/lib/affiliate-registry.ts by hand.
 *
 *   npx tsx scripts/cj-fetch-links.ts            # minimal auth check + full pull
 *
 * Token: CJ_ACCESS_TOKEN from the environment, else %USERPROFILE%/.config/leaguepour/cj.env
 * (written by scripts/cj-set-token.ps1). It is sent only in the Authorization header and is
 * never printed or written to the output file.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { CJ_WEBSITE_PIDS, cjPidFromUrl, isValidTrackedDestination } from "../src/lib/affiliate-registry";

const ADVERTISERS: Record<string, string> = {
  "7711902": "AliExpress - Global",
  "6616496": "DailySteals",
  "4851771": "Adrenaline",
  "7081268": "Chef's Deal",
  "4544498": "LawDepot",
  "7895424": "Aurzen",
  "7461262": "Magnifique",
  "2346375": "Peet's Coffee",
  "304810": "Adagio + Lardera + Selefina",
  "4297609": "Click & Grow",
};

function token(): string {
  const fromEnv = process.env.CJ_ACCESS_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  try {
    const raw = readFileSync(join(homedir(), ".config", "leaguepour", "cj.env"), "utf8");
    const t = raw.match(/^CJ_ACCESS_TOKEN=(.+)$/m)?.[1]?.trim();
    if (t) return t;
  } catch {}
  console.error("No CJ token found. Run: powershell -ExecutionPolicy Bypass -File scripts/cj-set-token.ps1");
  process.exit(2);
}

const tag = (xml: string, name: string) =>
  xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim() ?? "";

async function search(pid: string, params: Record<string, string>) {
  const url = new URL("https://link-search.api.cj.com/v2/link-search");
  url.searchParams.set("website-id", pid);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
  const body = await res.text();
  if (!res.ok) return { ok: false as const, status: res.status, error: tag(body, "error-message") || body.slice(0, 200) };
  const total = body.match(/total-matched="(\d+)"/)?.[1] ?? "0";
  // Each record ends with its own <clickUrl>; split on the record-level closing tag.
  const records = body.split(/<\/clickUrl>/).slice(0, -1).map((chunk) => {
    const rec = chunk.slice(chunk.lastIndexOf("<advertiser-id>"));
    const clickUrl = chunk.slice(chunk.lastIndexOf("<clickUrl>") + "<clickUrl>".length).trim();
    return {
      advertiserId: tag(rec, "advertiser-id"),
      advertiserName: tag(rec, "advertiser-name"),
      linkId: tag(rec, "link-id"),
      linkName: tag(rec, "link-name"),
      description: tag(rec, "description"),
      linkType: tag(rec, "link-type"),
      destination: tag(rec, "destination"),
      relationship: tag(rec, "relationship-status"),
      allowDeepLinking: tag(rec, "allow-deep-linking"),
      promotionType: tag(rec, "promotion-type"),
      promotionEnd: tag(rec, "promotion-end-date"),
      coupon: tag(rec, "coupon-code"),
      targetedCountries: tag(rec, "targeted-countries"),
      clickUrl,
      clickUrlPid: cjPidFromUrl(clickUrl),
      passesRegistryChecks: isValidTrackedDestination("cj", clickUrl) && cjPidFromUrl(clickUrl) === pid,
    };
  });
  return { ok: true as const, status: res.status, total: Number(total), records };
}

(async () => {
  const sites = Object.entries(CJ_WEBSITE_PIDS).filter((e): e is [string, string] => !!e[1]);
  // 1. Minimal read-only authenticated request.
  const probe = await search(sites[0][1], { "advertiser-ids": "joined", "records-per-page": "1" });
  console.log(`auth check (${sites[0][0]} PID ${sites[0][1]}): HTTP ${probe.status}${probe.ok ? `, ${probe.total} joined links visible` : ` - ${probe.error}`}`);
  if (!probe.ok) process.exit(1);

  // 2. Links for the approved advertisers, per site PID (25 calls/min limit - stay well under).
  const out: Record<string, unknown> = { fetchedAt: new Date().toISOString(), sites: {} };
  for (const [site, pid] of sites) {
    const all = [];
    // One query per advertiser so a large catalog can't crowd out the others.
    for (const id of Object.keys(ADVERTISERS)) {
      for (let page = 1; page <= 10; page++) {
        const r = await search(pid, { "advertiser-ids": id, "records-per-page": "100", "page-number": String(page) });
        await new Promise((ok) => setTimeout(ok, 2600)); // 25 calls/min limit
        if (!r.ok) { console.log(`${site} ${id}: HTTP ${r.status} - ${r.error}`); break; }
        all.push(...r.records);
        if (r.records.length < 100) break;
      }
    }
    (out.sites as Record<string, unknown>)[site] = { pid, links: all };
    const by = new Map<string, number>();
    for (const l of all) by.set(l.advertiserId, (by.get(l.advertiserId) ?? 0) + 1);
    console.log(`${site} (PID ${pid}): ${all.length} links; all carry this PID: ${all.every((l) => l.clickUrlPid === pid)}; pass registry checks: ${all.filter((l) => l.passesRegistryChecks).length}`);
    for (const [id, name] of Object.entries(ADVERTISERS)) console.log(`   ${id.padEnd(8)} ${name.padEnd(30)} ${by.get(id) ?? 0}`);
    await new Promise((ok) => setTimeout(ok, 3000));
  }
  const dir = join(homedir(), ".config", "leaguepour");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "cj-links.json");
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`\nfull results (no token) -> ${file}`);
})().catch((e) => {
  console.error("request failed:", String(e?.message ?? e).replace(/Bearer\s+\S+/g, "Bearer ***"));
  process.exit(1);
});
