/**
 * Selected-plan resolution for the shared venue signup (both brands). Prices come from the same
 * definitions the pricing pages render, so signup can never show a different number than pricing.
 */
import { PLAN_DEFINITIONS } from "@/lib/pricing";
import { LP_HOST, VS_HOST } from "@/lib/vs-routing";

export type SignupBrand = "lp" | "vs";
export type SignupInterval = "monthly" | "annual";

export type SelectedPlan = {
  /** Key sent to the brand's subscribe API (lower-case). */
  key: string;
  name: string;
  interval: SignupInterval;
  /** e.g. "$29/mo" or "$290/yr (about $24.17/mo)". */
  priceLabel: string;
};

/**
 * Brand from the request host, which a visitor can't fake by editing a link. The legacy
 * ?from=vs flag is only honored on non-production hosts (local dev / previews), so an old
 * "from=vs" link on leaguepour.com can't push someone into the VenueSprocket app or vice versa.
 */
export function signupBrandFromHost(host: string | null | undefined, fromParam: string | null | undefined): SignupBrand {
  const h = (host ?? "").split(":")[0].toLowerCase().replace(/^www\./, "");
  if (h === VS_HOST) return "vs";
  if (h === LP_HOST.replace(/^www\./, "")) return "lp";
  return fromParam === "vs" ? "vs" : "lp";
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

// VenueSprocket's public paid plans and prices (venuesprocket/pricing). "growth" is no longer
// shown publicly but stays accepted so an old link still resolves to the plan it named.
const VS_PLANS: Record<string, { name: string; monthlyCents: number }> = {
  starter: { name: "Starter", monthlyCents: 2900 },
  pro: { name: "Pro", monthlyCents: 7900 },
  growth: { name: "Growth", monthlyCents: 14900 },
};

/** The paid plan a visitor picked, or null for the free start (unknown/blank plan = free). */
export function resolveSelectedPlan(
  brand: SignupBrand,
  planParam: string | null | undefined,
  intervalParam: string | null | undefined,
): SelectedPlan | null {
  const key = (planParam ?? "").trim().toLowerCase();
  if (!key || key === "free") return null;
  if (brand === "vs") {
    const p = VS_PLANS[key];
    // VenueSprocket sells monthly plans only.
    return p ? { key, name: p.name, interval: "monthly", priceLabel: `${usd(p.monthlyCents)}/mo` } : null;
  }
  const def = PLAN_DEFINITIONS.find((d) => d.plan.toLowerCase() === key);
  if (!def) return null;
  const interval: SignupInterval = intervalParam === "annual" ? "annual" : "monthly";
  const priceLabel =
    interval === "annual"
      ? `${usd(def.annualCents)}/yr (about ${usd(Math.round(def.annualCents / 12))}/mo)`
      : `${usd(def.monthlyCents)}/mo`;
  return { key, name: def.name, interval, priceLabel };
}
