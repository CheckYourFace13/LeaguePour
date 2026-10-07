/**
 * Runs every repo-authored guide body (src/lib/content-engine/authored) through the same
 * deterministic quality gate the content engine uses before publishing - without a database.
 * Valid internal links = the brand's static known paths plus the slugs of the other authored
 * guides (they publish one at a time, in queue order, so a link to a sibling only resolves once
 * that sibling is live - the output flags which links depend on another authored guide).
 *
 *   npx tsx scripts/check-authored-guides.ts
 */
import { AUTHORED_BODIES } from "../src/lib/content-engine/authored";
import { BRANDS } from "../src/lib/content-engine/brand-config";
import { runQualityChecks } from "../src/lib/content-engine/quality-gate";
import { BACKLOG } from "../src/lib/content-engine/topics";

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80).replace(/-$/, "");
}

let failed = 0;
for (const brand of ["VS", "LP"] as const) {
  const config = BRANDS[brand];
  const authored = AUTHORED_BODIES[brand];
  const siblingPaths = new Map<string, string>();
  for (const key of Object.keys(authored)) {
    const topic = BACKLOG[brand].find((t) => t.topicKey === key);
    if (topic) siblingPaths.set(`${config.guidesBasePath}/${slugify(topic.title)}`, key);
  }
  const validPaths = new Set([...config.staticKnownPaths, ...siblingPaths.keys()]);

  for (const [key, body] of Object.entries(authored)) {
    const topic = BACKLOG[brand].find((t) => t.topicKey === key);
    if (!topic) {
      console.log(`✗ ${brand} ${key}: no backlog topic with this topicKey`);
      failed++;
      continue;
    }
    const words = body.bodyHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const result = runQualityChecks(
      brand,
      { title: topic.title, description: body.description, category: topic.category, bodyHtml: body.bodyHtml, faq: body.faq ?? null },
      config.existingGuideTitles,
      validPaths,
    );
    const deps = [...body.bodyHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => siblingPaths.has(h) && siblingPaths.get(h) !== key);
    console.log(`${result.passed ? "✓" : "✗"} ${brand} ${key} (${words} words, ${body.description.length}-char description) -> ${config.guidesBasePath}/${slugify(topic.title)}`);
    if (deps.length) console.log(`    links to sibling authored guide(s), must publish first: ${deps.join(", ")}`);
    for (const f of result.failures) console.log(`    - ${f}`);
    if (!result.passed) failed++;
  }
}
process.exit(failed ? 1 : 0);
