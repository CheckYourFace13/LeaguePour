import { prisma } from "@/lib/db";
import { PRODUCT_FACTS } from "./facts";
import { callClaude, extractJson } from "./llm";
import type { Brand } from "./types";

const STALE_AFTER_DAYS = 90;

const REFRESH_SYSTEM = `You are checking one existing published guide article for a software product against that
product's current FACTS list, to catch content decay - claims that were true when written but no
longer match the product, or links/references that have gone stale. Most articles need NO change;
only flag a change when something is materially wrong, not for stylistic polish.
Output ONLY a JSON object, no other text:
{
  "needsUpdate": boolean,
  "reason": string (empty string if needsUpdate is false),
  "revisedBodyHtml": string or null (the full corrected body HTML, only if needsUpdate is true - otherwise null)
}`;

export type RefreshResult = { slug: string; title: string; updated: boolean; reason: string };

export async function refreshBrandGuides(brand: Brand): Promise<RefreshResult[]> {
  const cutoff = new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const stale = await prisma.guide.findMany({
    where: { brand, status: "PUBLISHED", dateModified: { lt: cutoff } },
    select: { id: true, slug: true, title: true, bodyHtml: true },
  });

  const facts = PRODUCT_FACTS[brand].map((f) => `- ${f}`).join("\n");
  const results: RefreshResult[] = [];

  for (const guide of stale) {
    const prompt = `FACTS:\n${facts}\n\nExisting article title: ${guide.title}\nExisting article body (HTML):\n${guide.bodyHtml}`;
    try {
      const text = await callClaude({ system: REFRESH_SYSTEM, prompt, maxTokens: 8192 });
      const parsed = extractJson<{ needsUpdate: boolean; reason: string; revisedBodyHtml: string | null }>(text);

      if (parsed.needsUpdate && parsed.revisedBodyHtml) {
        await prisma.guide.update({
          where: { id: guide.id },
          data: { bodyHtml: parsed.revisedBodyHtml, dateModified: new Date() },
        });
        results.push({ slug: guide.slug, title: guide.title, updated: true, reason: parsed.reason });
      } else {
        results.push({ slug: guide.slug, title: guide.title, updated: false, reason: "No material staleness found." });
      }
    } catch (err) {
      results.push({
        slug: guide.slug,
        title: guide.title,
        updated: false,
        reason: `Refresh check failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return results;
}
