import { BillingPlan } from "@/generated/prisma/enums";

export type PlanDefinition = {
  plan: BillingPlan;
  name: string;
  monthlyCents: number;
  annualCents: number;
  eventLimitLabel: string;
  featured?: boolean;
};

function annualWithDiscount(monthlyCents: number): number {
  return Math.round(monthlyCents * 12 * 0.9);
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    plan: BillingPlan.STARTER,
    name: "Starter",
    monthlyCents: 999,
    annualCents: annualWithDiscount(999),
    eventLimitLabel: "1–2 events",
  },
  {
    plan: BillingPlan.STANDARD,
    name: "Standard",
    monthlyCents: 1999,
    annualCents: annualWithDiscount(1999),
    eventLimitLabel: "3–9 events",
    featured: true,
  },
  {
    plan: BillingPlan.PRO,
    name: "Pro",
    monthlyCents: 2999,
    annualCents: annualWithDiscount(2999),
    eventLimitLabel: "10–19 events",
  },
  {
    plan: BillingPlan.MAX,
    name: "Max",
    monthlyCents: 3999,
    annualCents: annualWithDiscount(3999),
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
