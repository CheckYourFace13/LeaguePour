import { BillingPlan } from "@/generated/prisma/enums";

export type PlanDefinition = {
  plan: BillingPlan;
  name: string;
  monthlyCents: number;
  annualCents: number;
  eventLimitLabel: string;
  featured?: boolean;
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    plan: BillingPlan.STARTER,
    name: "Starter",
    monthlyCents: 2900,
    annualCents: 29000,
    eventLimitLabel: "1–2 events",
  },
  {
    plan: BillingPlan.GROWTH,
    name: "Growth",
    monthlyCents: 7900,
    annualCents: 79000,
    eventLimitLabel: "3–9 events",
    featured: true,
  },
  {
    plan: BillingPlan.PRO,
    name: "Pro",
    monthlyCents: 14900,
    annualCents: 149000,
    eventLimitLabel: "10–19 events",
  },
  {
    plan: BillingPlan.ELITE,
    name: "Elite",
    monthlyCents: 29900,
    annualCents: 299000,
    eventLimitLabel: "Unlimited events",
  },
];

export function formatUsdCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Stripe price lookup keys (created in Stripe dashboard):
 *   leaguepour_starter_monthly   $29/mo
 *   leaguepour_growth_monthly    $79/mo
 *   leaguepour_pro_monthly       $149/mo
 *   leaguepour_elite_monthly     $299/mo
 *   leaguepour_starter_annual    $290/yr  (~17% off)
 *   leaguepour_growth_annual     $790/yr  (~17% off)
 *   leaguepour_pro_annual        $1,490/yr (~17% off)
 *   leaguepour_elite_annual      $2,990/yr (~17% off)
 */

/** Max active competitions per billing tier. */
export const ACTIVE_COMPETITION_LIMITS_BY_PLAN: Record<BillingPlan, number> = {
  [BillingPlan.STARTER]: 2,
  [BillingPlan.GROWTH]: 9,
  [BillingPlan.PRO]: 19,
  [BillingPlan.ELITE]: Number.POSITIVE_INFINITY,
};
