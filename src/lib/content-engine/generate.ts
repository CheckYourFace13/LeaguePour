import { prisma } from "@/lib/db";
import { BRANDS } from "./brand-config";
import { PRODUCT_FACTS } from "./facts";
import { callClaude, extractJson } from "./llm";
import type { ArticleDraft, Brand, TopicCandidate } from "./types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");
}

async function uniqueSlug(brand: Brand, base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.guide.findUnique({ where: { brand_slug: { brand, slug } } })) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

const SYSTEM_PROMPT = `You are a senior content writer producing one editorial guide article for a real
software company's public /guides section. You write for operators (bar owners, restaurant/venue
managers) who are solving a real operational problem - not for search engines, and not generic
"AI blog" filler.

Hard rules:
- Every claim about what the product does must come ONLY from the FACTS list given to you. Never
  invent or assume a feature. If the topic invites a product claim not covered by FACTS, write
  around it in product-neutral terms instead.
- No invented statistics, no invented customer stories, no fake quotes, no fake testimonials, no
  fake reviews.
- No generic filler phrases ("In today's fast-paced world", "In conclusion", "It's important to
  note that", "at the end of the day").
- No keyword stuffing - write naturally.
- Give genuinely specific, actionable advice: concrete numbers, concrete steps, concrete examples
  a real operator could use tonight - not vague platitudes.
- Product mentions belong naturally in the article and once more, briefly, near the end as a
  single CTA paragraph - do not turn the whole article into a pitch.
- Output ONLY a single JSON object, no other text, no markdown fence, matching exactly this shape:
{
  "title": string,
  "description": string (meta description, 140-160 chars),
  "bodyHtml": string (article body as semantic HTML - h2/h3/p/ul/ol/strong only, no h1, no
    <html>/<head>/<body> wrapper, no inline styles, no script tags),
  "faq": [{"q": string, "a": string}] or null (3-5 items only if genuinely useful for this topic,
    otherwise null - do not force an FAQ)
}`;

function buildPrompt(brand: Brand, topic: TopicCandidate, internalLinks: string[]): string {
  const config = BRANDS[brand];
  const facts = PRODUCT_FACTS[brand].map((f) => `- ${f}`).join("\n");
  return `Product: ${config.name}
FACTS (the only things you may say the product does):
${facts}

Article topic: ${topic.title}
Category: ${topic.category}
Brief: ${topic.brief}

Related existing guides you may link to naturally where relevant (do not force all of them in):
${internalLinks.map((l) => `- ${l}`).join("\n")}

Write the full article now, following the hard rules exactly. Minimum useful depth for this topic
- typically 700-1400 words of actual body content, whatever the topic genuinely needs, not a fixed
count. Include at least one concrete example, checklist, or step-by-step list somewhere in the
body. End with one short paragraph mentioning ${config.name} as the natural tool for the workflow
just described, with no unsupported claims.`;
}

export async function generateDraft(
  brand: Brand,
  topic: TopicCandidate,
  internalLinks: string[],
): Promise<ArticleDraft> {
  const text = await callClaude({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(brand, topic, internalLinks),
    maxTokens: 8192,
  });
  const parsed = extractJson<{
    title: string;
    description: string;
    bodyHtml: string;
    faq: { q: string; a: string }[] | null;
  }>(text);

  const slug = await uniqueSlug(brand, slugify(parsed.title));

  return {
    slug,
    title: parsed.title,
    description: parsed.description,
    category: topic.category,
    bodyHtml: parsed.bodyHtml,
    faq: parsed.faq && parsed.faq.length > 0 ? parsed.faq : null,
  };
}
