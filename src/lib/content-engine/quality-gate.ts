import { BRANDS } from "./brand-config";
import { PRODUCT_FACTS } from "./facts";
import { callClaude, extractJson } from "./llm";
import { isDuplicateTitle } from "./topics";
import type { ArticleDraft, Brand, QualityScore } from "./types";

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
];
// Matches an invented-sounding statistic like "73% of bars" or "9 out of 10 venues" - a real,
// FACTS-grounded number (like the 3-1-0 point system) won't match this shape.
const SUSPICIOUS_STAT = /\b\d{1,3}%\s+of\s+(bars|venues|restaurants|players|customers|owners)\b/i;

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

function runDeterministicChecks(draft: ArticleDraft, existingTitles: string[]): string[] {
  const failures: string[] = [];
  const words = wordCount(draft.bodyHtml);
  if (words < MIN_WORD_COUNT) failures.push(`Body is only ${words} words (minimum ${MIN_WORD_COUNT}).`);

  const lowerBody = draft.bodyHtml.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerBody.includes(phrase)) failures.push(`Contains forbidden filler phrase: "${phrase}".`);
  }
  if (SUSPICIOUS_STAT.test(draft.bodyHtml)) {
    failures.push("Contains an unattributed statistic that looks invented (e.g. \"NN% of venues\").");
  }
  if (/<h1[\s>]/i.test(draft.bodyHtml)) failures.push("Body contains an <h1> - the page title is the h1, body must start at h2.");
  if (/<script/i.test(draft.bodyHtml)) failures.push("Body contains a <script> tag.");

  const dupe = isDuplicateTitle(draft.title, existingTitles);
  if (dupe) failures.push(`Title is a near-duplicate of an existing guide: "${dupe}".`);

  if (!draft.title || draft.title.length > 90) failures.push("Title missing or too long for a clean <title>.");
  if (!draft.description || draft.description.length < 80 || draft.description.length > 170) {
    failures.push(`Meta description length (${draft.description?.length ?? 0}) is out of the 80-170 char range.`);
  }

  return failures;
}

const SCORER_SYSTEM = `You are a strict editorial quality reviewer for a B2B SaaS company's guide articles. You will
be given a product's FACTS list and a draft article. Score the draft honestly and harshly - most
drafts should NOT get a perfect score. Output ONLY a JSON object, no other text:
{
  "originality": 0-10,
  "usefulness": 0-10,
  "depth": 0-10,
  "productAccuracy": 0-10,
  "duplicationRisk": 0-10 (10 = no duplication risk, 0 = reads like an existing common article),
  "seoCompleteness": 0-10,
  "readability": 0-10,
  "notes": "one or two sentences explaining the score, mentioning any specific problems found"
}
productAccuracy must be 0 if the article claims the product does anything not in FACTS.`;

async function scoreDraft(brand: Brand, draft: ArticleDraft): Promise<Omit<QualityScore, "total" | "maxTotal" | "passed" | "deterministicFailures">> {
  const facts = PRODUCT_FACTS[brand].map((f) => `- ${f}`).join("\n");
  const prompt = `FACTS:\n${facts}\n\nDraft title: ${draft.title}\nDraft description: ${draft.description}\nDraft body (HTML):\n${draft.bodyHtml}`;
  const text = await callClaude({ system: SCORER_SYSTEM, prompt, maxTokens: 1024 });
  return extractJson(text);
}

export const PASS_THRESHOLD_RATIO = 0.8; // 80% of max possible score

export async function evaluateDraft(brand: Brand, draft: ArticleDraft): Promise<QualityScore> {
  const config = BRANDS[brand];
  const deterministicFailures = runDeterministicChecks(draft, config.existingGuideTitles);

  const scores = await scoreDraft(brand, draft);
  const total =
    scores.originality +
    scores.usefulness +
    scores.depth +
    scores.productAccuracy +
    scores.duplicationRisk +
    scores.seoCompleteness +
    scores.readability;
  const maxTotal = 70;
  const passed = deterministicFailures.length === 0 && scores.productAccuracy >= 8 && total / maxTotal >= PASS_THRESHOLD_RATIO;

  return { ...scores, total, maxTotal, passed, deterministicFailures };
}
