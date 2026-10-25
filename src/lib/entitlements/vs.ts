import { VsPlan } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

/**
 * VenueSprocket plan entitlements (server-side source of truth).
 *
 *   Free     inquiry page, lead dashboard, customer records, lead notifications, events list
 *   Starter  + lead pipeline (status changes) and the basic proposal builder
 *   Pro      + deposits on proposals, contracts with e-signature, BEO creation, and
 *              untouched-lead follow-up reminders
 *
 * Never gated: receiving inquiries, viewing anything already created, anything a guest does with a
 * document they were already sent (view/accept a proposal, sign a contract, pay a deposit), and
 * refunds of existing payments.
 *
 * Grandfathering: a venue keeps any feature it was already using before VS_ENTITLEMENTS_CUTOFF
 * (it has a record of that kind created before the cutoff), whatever its plan - so nobody loses
 * something they had. A paid plan counts while its subscription is active, trialing, or in
 * Stripe's payment-failure grace (past_due / unpaid). An LP subscription never grants VS access.
 */
export const VS_ENTITLEMENTS_CUTOFF = new Date("2026-10-26T00:00:00Z");

export type VsFeature = "pipeline" | "proposals" | "deposits" | "contracts" | "beos" | "followUps";

export const VS_FEATURE_TIER: Record<VsFeature, "starter" | "pro"> = {
  pipeline: "starter",
  proposals: "starter",
  deposits: "pro",
  contracts: "pro",
  beos: "pro",
  followUps: "pro",
};

export const VS_FEATURE_LABEL: Record<VsFeature, string> = {
  pipeline: "Lead pipeline",
  proposals: "Proposals",
  deposits: "Deposits on proposals",
  contracts: "Contracts with e-signature",
  beos: "BEO builder",
  followUps: "Follow-up reminders",
};

const TIER_RANK: Record<VsPlan, number> = {
  [VsPlan.VS_FREE]: 0,
  [VsPlan.VS_STARTER]: 1,
  [VsPlan.VS_PRO]: 2,
  [VsPlan.VS_GROWTH]: 3,
  [VsPlan.VS_ENTERPRISE]: 4,
};
const REQUIRED_RANK = { starter: 1, pro: 2 } as const;

const PAID_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

/** The VS plan a venue is paying for right now (VS_FREE without a current subscription). */
export function effectiveVsPlan(config: { vsPlan: VsPlan; vsSubscriptionStatus: string | null } | null): VsPlan {
  if (!config) return VsPlan.VS_FREE;
  return PAID_STATUSES.has(config.vsSubscriptionStatus ?? "") ? config.vsPlan : VsPlan.VS_FREE;
}

export function planIncludes(plan: VsPlan, feature: VsFeature): boolean {
  return TIER_RANK[plan] >= REQUIRED_RANK[VS_FEATURE_TIER[feature]];
}

export type VsEntitlements = {
  plan: VsPlan;
  features: Record<VsFeature, boolean>;
  /** Features available only because the venue was using them before the cutoff. */
  grandfathered: VsFeature[];
};

/** Pre-cutoff usage per feature - the grandfathering evidence. */
async function legacyUsage(venueId: string): Promise<Record<VsFeature, boolean>> {
  const before = { lt: VS_ENTITLEMENTS_CUTOFF };
  const [venue, workedLead, event, proposal, depositProposal, contract, beo] = await Promise.all([
    prisma.venue.findUnique({ where: { id: venueId }, select: { createdAt: true } }),
    prisma.privateEventLead.count({ where: { venueId, createdAt: before, status: { not: "NEW" } } }),
    prisma.privateEvent.count({ where: { venueId, createdAt: before } }),
    prisma.vsProposal.count({ where: { privateEvent: { venueId }, createdAt: before } }),
    prisma.vsProposal.count({ where: { privateEvent: { venueId }, createdAt: before, depositAmount: { gt: 0 } } }),
    prisma.vsContract.count({ where: { privateEvent: { venueId }, createdAt: before } }),
    prisma.vsBeo.count({ where: { privateEvent: { venueId }, createdAt: before } }),
  ]);
  const existedBefore = !!venue && venue.createdAt < VS_ENTITLEMENTS_CUTOFF;
  return {
    pipeline: workedLead + event > 0,
    proposals: proposal > 0,
    deposits: depositProposal > 0,
    contracts: contract > 0,
    beos: beo > 0,
    // Reminders went to every venue before the cutoff; keep them for venues that existed then.
    followUps: existedBefore,
  };
}

export async function getVsEntitlements(venueId: string): Promise<VsEntitlements> {
  const config = await prisma.venueVsConfig.findUnique({
    where: { venueId },
    select: { vsPlan: true, vsSubscriptionStatus: true },
  });
  const plan = effectiveVsPlan(config);
  const features = {} as Record<VsFeature, boolean>;
  const grandfathered: VsFeature[] = [];
  const missing = (Object.keys(VS_FEATURE_TIER) as VsFeature[]).filter((f) => !planIncludes(plan, f));
  const legacy = missing.length ? await legacyUsage(venueId) : null;
  for (const f of Object.keys(VS_FEATURE_TIER) as VsFeature[]) {
    if (planIncludes(plan, f)) features[f] = true;
    else if (legacy?.[f]) {
      features[f] = true;
      grandfathered.push(f);
    } else features[f] = false;
  }
  return { plan, features, grandfathered };
}

/** Where a locked action sends the venue: a page that explains which plan includes it. */
export function vsUpgradePath(feature: VsFeature, from?: string): string {
  const params = new URLSearchParams({ feature });
  if (from && from.startsWith("/app/")) params.set("from", from);
  return `/app/upgrade?${params.toString()}`;
}

export const VS_FREE_MONTHLY_INQUIRIES = 10;

/** Inquiries received this calendar month (UTC). Informational only - inquiries are never capped. */
export async function inquiriesThisMonth(venueId: string, now = new Date()): Promise<number> {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return prisma.privateEventLead.count({ where: { venueId, createdAt: { gte: start } } });
}
