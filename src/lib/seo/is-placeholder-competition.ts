/**
 * True for a competition whose title or slug is just a placeholder word - "Test", "Testing",
 * "Demo", "Sample", "asdf" - the kind of record a venue creates while trying the product out.
 * Those pages stay reachable (it's the venue's own data, never modified or hidden from them), but
 * they're kept out of the sitemap and marked noindex so a search result never shows a real venue
 * hosting a competition called "Test". Deliberately narrow: only an exact placeholder title or
 * slug matches, so a real event like "Test Your Trivia Tuesdays" is unaffected.
 */
const PLACEHOLDER = /^(test|testing|test\s*\d+|demo|sample|dummy|asdf|tmp|temp|delete\s*me|do\s*not\s*use)$/i;

export function isPlaceholderCompetition(c: { title?: string | null; slug?: string | null }): boolean {
  const title = c.title?.trim() ?? "";
  const slug = (c.slug ?? "").replace(/[-_]+/g, " ").trim();
  return PLACEHOLDER.test(title) || PLACEHOLDER.test(slug);
}
