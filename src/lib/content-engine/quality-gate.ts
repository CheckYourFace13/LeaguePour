import { FORBIDDEN_CLAIM_PATTERNS } from "./facts";
import { isDuplicateTitle } from "./topics";
import type { Brand, CheckResult } from "./types";

const MIN_WORD_COUNT = 500;
const FORBIDDEN_PHRASES = [
  "in today's fast-paced world",
  "in conclusion",
  "it's important to note that",
  "at the end of the day",
  "studies show",
  "research shows",
  "according to a survey",
  "experts agree",
  "lorem ipsum",
  "todo",
  "tbd",
  "placeholder",
];
// Matches an invented-sounding statistic like "73% of bars" or "9 out of 10 venues" - a real,
// FACTS-grounded number (like the 3-1-0 point system) won't match this shape.
const SUSPICIOUS_STAT = /\b\d{1,3}%\s+of\s+(bars|venues|restaurants|players|customers|owners)\b/i;

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

/** Extracts href targets from anchor tags in the body. */
function extractLinks(html: string): string[] {
  const matches = [...html.matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)];
  return matches.map((m) => m[1]);
}

export type GuideForCheck = {
  title: string;
  description: string;
  category: string;
  bodyHtml: string;
  faq: { q: string; a: string }[] | null;
};

/**
 * Every check here is deterministic - no LLM, no external call. This is intentionally a denylist
 * plus structural checks, not a claim of perfect editorial judgment; it catches the specific,
 * known failure modes (filler, invented stats, known-false product claims, broken internal
 * links, malformed metadata, duplicate titles) that would otherwise slip into an auto-published
 * page.
 */
export function runQualityChecks(
  brand: Brand,
  guide: GuideForCheck,
  existingTitles: string[],
  validInternalPaths: Set<string>,
): CheckResult {
  const failures: string[] = [];

  const words = wordCount(guide.bodyHtml);
  if (words < MIN_WORD_COUNT) failures.push(`Body is only ${words} words (minimum ${MIN_WORD_COUNT}).`);

  const lowerBody = guide.bodyHtml.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerBody.includes(phrase)) failures.push(`Contains forbidden filler/placeholder phrase: "${phrase}".`);
  }
  if (SUSPICIOUS_STAT.test(guide.bodyHtml)) {
    failures.push("Contains an unattributed statistic that looks invented (e.g. \"NN% of venues\").");
  }
  for (const pattern of FORBIDDEN_CLAIM_PATTERNS[brand]) {
    if (pattern.test(guide.bodyHtml)) failures.push(`Body appears to claim an unsupported product feature (matched pattern: ${pattern}).`);
  }

  if (/<h1[\s>]/i.test(guide.bodyHtml)) failures.push("Body contains an <h1> - the page title is the h1, body must start at h2.");
  if (/<script/i.test(guide.bodyHtml)) failures.push("Body contains a <script> tag.");
  if (!/<h2[\s>]/i.test(guide.bodyHtml)) failures.push("Body has no <h2> heading - needs real structure, not one undifferentiated block.");

  const dupe = isDuplicateTitle(guide.title, existingTitles);
  if (dupe) failures.push(`Title is a near-duplicate of an existing guide: "${dupe}".`);

  if (!guide.title || guide.title.length > 90) failures.push("Title missing or too long for a clean <title>.");
  if (!guide.description || guide.description.length < 80 || guide.description.length > 170) {
    failures.push(`Meta description length (${guide.description?.length ?? 0}) is out of the 80-170 char range.`);
  }
  if (!guide.category) failures.push("Category is empty.");

  if (guide.faq) {
    if (guide.faq.length < 2 || guide.faq.length > 6) failures.push(`FAQ has ${guide.faq.length} items - expected 2-6 if present at all.`);
    for (const f of guide.faq) {
      if (!f.q?.trim() || !f.a?.trim()) failures.push("FAQ has an empty question or answer.");
    }
  }

  for (const link of extractLinks(guide.bodyHtml)) {
    if (/^https?:\/\//i.test(link)) continue; // external links aren't checked here
    if (!validInternalPaths.has(link)) failures.push(`Internal link "${link}" doesn't match any known page or published guide.`);
  }

  return { failures, passed: failures.length === 0 };
}
