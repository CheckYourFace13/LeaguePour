import { prisma } from "@/lib/db";
import { getBoolSetting } from "@/lib/app-settings";
import { BRANDS } from "./brand-config";
import { generateDraft } from "./generate";
import { evaluateDraft, PASS_THRESHOLD_RATIO } from "./quality-gate";
import { nextTopic } from "./topics";
import { LlmNotConfiguredError } from "./llm";
import type { Brand } from "./types";

export const KILL_SWITCH_KEY = "content-engine-enabled";

export type PublishOutcome =
  | { status: "skipped"; reason: string }
  | { status: "rejected"; slug: string; title: string; reason: string }
  | { status: "published"; slug: string; title: string; url: string };

function startOfIsoWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7; // Sunday -> 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err instanceof LlmNotConfiguredError) throw err; // not transient, don't retry
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw lastErr;
}

async function publishedThisWeek(brand: Brand): Promise<number> {
  const weekStart = startOfIsoWeek(new Date());
  return prisma.guide.count({
    where: { brand, status: "PUBLISHED", datePublished: { gte: weekStart } },
  });
}

/** Existing published guides for this brand, used as internal-link candidates for the writer. */
async function relatedLinks(brand: Brand, guidesBasePath: string): Promise<string[]> {
  const rows = await prisma.guide.findMany({
    where: { brand, status: "PUBLISHED" },
    select: { title: true, slug: true },
    orderBy: { datePublished: "desc" },
    take: 8,
  });
  return rows.map((r) => `${r.title} (${guidesBasePath}/${r.slug})`);
}

/**
 * Runs one publish attempt for `brand`: checks the kill switch and weekly cap, picks the next
 * unpublished topic, generates a draft, runs it through the quality gate, and persists either a
 * PUBLISHED or REJECTED Guide row. Deliberately does at most one article per call - the cron
 * route calls this once; the caller (GH Actions workflow or in-process scheduler) controls
 * cadence, this function never loops to "catch up" on missed runs.
 */
export async function runContentEngine(brand: Brand, opts: { dryRun?: boolean } = {}): Promise<PublishOutcome> {
  const enabled = opts.dryRun || (await getBoolSetting(KILL_SWITCH_KEY, true));
  if (!enabled) return { status: "skipped", reason: "Kill switch (content-engine-enabled) is off." };

  const config = BRANDS[brand];
  if (!opts.dryRun) {
    const publishedCount = await publishedThisWeek(brand);
    if (publishedCount >= config.weeklyCap) {
      return { status: "skipped", reason: `Weekly cap reached (${publishedCount}/${config.weeklyCap} published this ISO week).` };
    }
  }

  const topic = await nextTopic(brand);
  if (!topic) return { status: "skipped", reason: "Topic backlog exhausted - no undedup'd topic left to generate." };

  const links = await relatedLinks(brand, config.guidesBasePath);
  const draft = await withRetry(() => generateDraft(brand, topic, links));
  const score = await withRetry(() => evaluateDraft(brand, draft));

  if (opts.dryRun) {
    return score.passed
      ? { status: "published", slug: draft.slug, title: draft.title, url: `[dry run - not persisted] score ${score.total}/${score.maxTotal}` }
      : { status: "rejected", slug: draft.slug, title: draft.title, reason: `[dry run - not persisted] ${score.notes}` };
  }

  const now = new Date();
  if (!score.passed) {
    await prisma.guide.create({
      data: {
        brand,
        slug: draft.slug,
        topicKey: topic.topicKey,
        status: "REJECTED",
        category: draft.category,
        title: draft.title,
        description: draft.description,
        bodyHtml: draft.bodyHtml,
        faq: draft.faq ?? undefined,
        qualityScore: score,
        rejectReason:
          score.deterministicFailures.length > 0
            ? score.deterministicFailures.join(" ")
            : `Score ${score.total}/${score.maxTotal} below ${Math.round(PASS_THRESHOLD_RATIO * 100)}% threshold. ${score.notes}`,
      },
    });
    return { status: "rejected", slug: draft.slug, title: draft.title, reason: score.notes };
  }

  await prisma.guide.create({
    data: {
      brand,
      slug: draft.slug,
      topicKey: topic.topicKey,
      status: "PUBLISHED",
      category: draft.category,
      title: draft.title,
      description: draft.description,
      bodyHtml: draft.bodyHtml,
      faq: draft.faq ?? undefined,
      qualityScore: score,
      datePublished: now,
      dateModified: now,
    },
  });

  return {
    status: "published",
    slug: draft.slug,
    title: draft.title,
    url: `https://${config.host}${config.guidesBasePath}/${draft.slug}`,
  };
}
