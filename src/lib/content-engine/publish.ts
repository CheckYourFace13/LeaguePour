import { prisma } from "@/lib/db";
import { getBoolSetting } from "@/lib/app-settings";
import { BRANDS } from "./brand-config";
import { runQualityChecks } from "./quality-gate";
import { buildOutline, classifySearchIntent, nextTopic } from "./topics";
import type { Brand } from "./types";
import { AUTHORED_BODIES } from "./authored";

export const KILL_SWITCH_KEY = "content-engine-enabled";

export type PublishOutcome =
  | { status: "skipped"; reason: string }
  | { status: "queued"; slug: string; title: string }
  | { status: "needs-revision"; slug: string; title: string; failures: string[] }
  | { status: "published"; slug: string; title: string; url: string };

function startOfIsoWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7; // Sunday -> 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

async function publishedThisWeek(brand: Brand): Promise<number> {
  const weekStart = startOfIsoWeek(new Date());
  return prisma.guide.count({
    where: { brand, status: "PUBLISHED", datePublished: { gte: weekStart } },
  });
}

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

/** Relative paths a body may link to: each brand's static product/guide pages plus every
 * currently-PUBLISHED Guide slug for that brand. Used by quality-gate.ts's internal-link check
 * and re-used by refresh.ts's drift check. */
export async function internalPathsForBrand(brand: Brand): Promise<Set<string>> {
  const config = BRANDS[brand];
  const published = await prisma.guide.findMany({ where: { brand, status: "PUBLISHED" }, select: { slug: true } });
  const set = new Set(config.staticKnownPaths);
  for (const g of published) set.add(`${config.guidesBasePath}/${g.slug}`);
  return set;
}

async function allKnownTitles(brand: Brand): Promise<string[]> {
  const config = BRANDS[brand];
  const rows = await prisma.guide.findMany({ where: { brand }, select: { title: true } });
  return [...config.existingGuideTitles, ...rows.map((r) => r.title)];
}

/**
 * Copies repo-authored bodies (see authored/index.ts) into their matching queued NEEDS_CONTENT
 * rows. This is how "someone writes the body" works without direct database access: the body is
 * written and reviewed in the repo, and the next engine run picks it up. While a row is still
 * unpublished the repo copy stays the source of truth, so a body that failed a check can be fixed
 * by editing the file. Never touches PUBLISHED rows, and never publishes anything itself - Phase A
 * below still runs every check and enforces the weekly cap.
 */
async function syncAuthoredBodies(brand: Brand): Promise<void> {
  const authored = AUTHORED_BODIES[brand];
  const keys = Object.keys(authored);
  if (keys.length === 0) return;
  const rows = await prisma.guide.findMany({
    where: { brand, status: "NEEDS_CONTENT", topicKey: { in: keys } },
    select: { id: true, topicKey: true, bodyHtml: true },
  });
  for (const row of rows) {
    const a = authored[row.topicKey];
    if (!a || row.bodyHtml === a.bodyHtml) continue;
    await prisma.guide.update({
      where: { id: row.id },
      data: { bodyHtml: a.bodyHtml, description: a.description, faq: a.faq ?? undefined, rejectReason: null },
    });
  }
}

/** Dry-run counterpart of syncAuthoredBodies(): the oldest queued row that has an authored body,
 * with that body overlaid in memory. Nothing is written. */
async function authoredReadyRow(brand: Brand) {
  const authored = AUTHORED_BODIES[brand];
  const keys = Object.keys(authored);
  if (keys.length === 0) return null;
  const row = await prisma.guide.findFirst({
    where: { brand, status: "NEEDS_CONTENT", topicKey: { in: keys } },
    orderBy: { createdAt: "asc" },
  });
  if (!row) return null;
  const a = authored[row.topicKey];
  return { ...row, bodyHtml: a.bodyHtml, description: a.description, faq: a.faq ?? null };
}

/**
 * Runs one content-engine step for `brand`: checks the kill switch, then does at most one of two
 * things per call (never both, and never more than one article's worth of action) -
 *
 * Phase A - if a queued NEEDS_CONTENT row already has a written body (filled in by hand, through
 * normal Claude/Cursor development work - never by this function), run every deterministic check
 * against it and publish it if they all pass (respecting the weekly cap), or record why it failed
 * and leave it queued for revision.
 *
 * Phase B - otherwise, if the queue isn't already full, pick the next backlog topic and queue it
 * as a new NEEDS_CONTENT row with just a brief/outline/metadata - no body, nothing published.
 *
 * This function never writes a body itself and never publishes anything without every
 * deterministic check passing - "no completed high-quality article available" always means
 * "publish nothing," not "publish something anyway to hit cadence."
 */
export async function runContentEngine(
  brand: Brand,
  opts: { dryRun?: boolean; publishOnly?: boolean } = {},
): Promise<PublishOutcome> {
  const enabled = opts.dryRun || (await getBoolSetting(KILL_SWITCH_KEY, true));
  if (!enabled) return { status: "skipped", reason: "Kill switch (content-engine-enabled) is off." };

  const config = BRANDS[brand];

  // Repo-authored bodies (authored/*.ts) fill their queued rows before Phase A looks for one.
  // Dry runs don't persist this, so they overlay the authored body in memory instead.
  const authoredOverlay = opts.dryRun ? await authoredReadyRow(brand) : (await syncAuthoredBodies(brand), null);

  // Phase A: a written-but-unpublished body is waiting - try to publish it.
  const ready =
    authoredOverlay ??
    (await prisma.guide.findFirst({
      where: { brand, status: "NEEDS_CONTENT", bodyHtml: { not: null } },
      orderBy: { createdAt: "asc" },
    }));

  if (ready && ready.bodyHtml && ready.bodyHtml.trim().length > 0) {
    if (!opts.dryRun) {
      const publishedCount = await publishedThisWeek(brand);
      if (publishedCount >= config.weeklyCap) {
        return { status: "skipped", reason: `Weekly cap reached (${publishedCount}/${config.weeklyCap} published this ISO week) - "${ready.title}" stays queued for next week.` };
      }
    }

    const existingTitles = (await allKnownTitles(brand)).filter((t) => t !== ready.title);
    const validPaths = await internalPathsForBrand(brand);
    const check = runQualityChecks(
      brand,
      { title: ready.title, description: ready.description, category: ready.category, bodyHtml: ready.bodyHtml, faq: ready.faq as { q: string; a: string }[] | null },
      existingTitles,
      validPaths,
    );

    if (!check.passed) {
      if (!opts.dryRun) {
        await prisma.guide.update({ where: { id: ready.id }, data: { rejectReason: check.failures.join(" ") } });
      }
      return { status: "needs-revision", slug: ready.slug, title: ready.title, failures: check.failures };
    }

    if (opts.dryRun) return { status: "published", slug: ready.slug, title: ready.title, url: "[dry run - not persisted]" };

    const now = new Date();
    await prisma.guide.update({
      where: { id: ready.id },
      data: { status: "PUBLISHED", datePublished: now, dateModified: now, rejectReason: null },
    });
    return { status: "published", slug: ready.slug, title: ready.title, url: `https://${config.host}${config.guidesBasePath}/${ready.slug}` };
  }

  // publishOnly (used by publishAuthoredNow below): never queue a new topic.
  if (opts.publishOnly) return { status: "skipped", reason: "No written article ready to publish." };

  // Phase B: nothing ready to publish - top up the queue if there's room.
  const pendingCount = await prisma.guide.count({ where: { brand, status: "NEEDS_CONTENT", bodyHtml: null } });
  if (pendingCount >= config.queueBuffer) {
    return { status: "skipped", reason: `Queue already has ${pendingCount}/${config.queueBuffer} unfilled topics - not queueing another.` };
  }

  const picked = await nextTopic(brand);
  if (!picked) return { status: "skipped", reason: "Topic backlog exhausted - no undedup'd topic left to queue." };
  const { topic, score: priorityScore } = picked;

  const slug = await uniqueSlug(brand, slugify(topic.title));
  const intent = classifySearchIntent(topic.title);
  const outline = buildOutline(topic);
  const related = (await prisma.guide.findMany({
    where: { brand, status: "PUBLISHED" },
    select: { title: true, slug: true },
    orderBy: { datePublished: "desc" },
    take: 5,
  })).map((r) => `${r.title} (${config.guidesBasePath}/${r.slug})`);

  if (opts.dryRun) return { status: "queued", slug, title: topic.title };

  await prisma.guide.create({
    data: {
      brand,
      slug,
      topicKey: topic.topicKey,
      status: "NEEDS_CONTENT",
      category: topic.category,
      title: topic.title,
      description: `${topic.brief.slice(0, 150)}`,
      bodyHtml: null,
      searchIntent: intent,
      outline: outline as unknown as object,
      relatedPages: related as unknown as object,
      suggestedCta: `${config.ctaLabel} (${config.ctaHref})`,
      priorityScore,
    },
  });

  return { status: "queued", slug, title: topic.title };
}

/**
 * Publishes every repo-authored article that's ready for `brand`, one runContentEngine() step at a
 * time - so every quality-gate check, the weekly cap, and the kill switch apply exactly as on a
 * scheduled run - and never queues a new topic. Stops at the first step that doesn't publish
 * (cap reached, nothing ready, or a body that needs revision). Run once per server boot by
 * scheduler.ts, because authored bodies only ever arrive with a deploy; on any boot with nothing
 * ready it's a no-op.
 */
export async function publishAuthoredNow(brand: Brand): Promise<PublishOutcome[]> {
  const outcomes: PublishOutcome[] = [];
  for (let i = 0; i < BRANDS[brand].weeklyCap; i++) {
    const outcome = await runContentEngine(brand, { publishOnly: true });
    outcomes.push(outcome);
    if (outcome.status !== "published") break;
  }
  return outcomes;
}
