import { prisma } from "@/lib/db";
import { BRANDS } from "./brand-config";
import { runQualityChecks } from "./quality-gate";
import { internalPathsForBrand } from "./publish";
import type { Brand } from "./types";

const STALE_AFTER_DAYS = 90;

export type RefreshFlag = {
  slug: string;
  title: string;
  ageDays: number;
  staleByAge: boolean;
  claimDrift: string[]; // deterministic check failures re-run against CURRENT facts/patterns
};

/**
 * Deterministic (no LLM) monthly decay check for `brand`'s published guides. Flags candidates
 * for human review - it never mutates a live guide automatically, since unpublishing or rewriting
 * a live page is a content decision, not something safe to automate unsupervised. Two independent
 * signals: age (>90 days is "worth a look", not proof of staleness) and claim drift (the guide
 * now fails checks it would have failed had FACTS/FORBIDDEN_CLAIM_PATTERNS been what they are
 * today - i.e. the product changed underneath the article, or the denylist grew, since it was
 * published).
 */
export async function findStaleGuides(brand: Brand): Promise<RefreshFlag[]> {
  const cutoff = new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const all = await prisma.guide.findMany({
    where: { brand, status: "PUBLISHED" },
    select: { slug: true, title: true, description: true, category: true, bodyHtml: true, faq: true, dateModified: true, createdAt: true },
  });

  const config = BRANDS[brand];
  const existingTitles = [...config.existingGuideTitles, ...all.map((g) => g.title)];
  const validPaths = await internalPathsForBrand(brand);

  const flags: RefreshFlag[] = [];
  for (const g of all) {
    const modified = g.dateModified ?? g.createdAt;
    const ageDays = Math.floor((Date.now() - modified.getTime()) / (24 * 60 * 60 * 1000));
    const staleByAge = modified < cutoff;

    const otherTitles = existingTitles.filter((t) => t !== g.title);
    const check = runQualityChecks(
      brand,
      { title: g.title, description: g.description, category: g.category, bodyHtml: g.bodyHtml ?? "", faq: g.faq as { q: string; a: string }[] | null },
      otherTitles,
      validPaths,
    );

    if (staleByAge || !check.passed) {
      flags.push({ slug: g.slug, title: g.title, ageDays, staleByAge, claimDrift: check.failures });
    }
  }
  return flags;
}
