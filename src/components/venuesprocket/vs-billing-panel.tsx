import Link from "next/link";
import { VsPlan } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { holdsSubscription, subscriptionStatusLabel } from "@/lib/stripe/billing";
import { VS_FEATURE_LABEL, VS_FREE_MONTHLY_INQUIRIES, getVsEntitlements, inquiriesThisMonth } from "@/lib/entitlements/vs";
import { VsManageBillingButton } from "@/components/venuesprocket/vs-manage-billing-button";

export const VS_PLAN_NAME: Record<VsPlan, string> = {
  [VsPlan.VS_FREE]: "Free",
  [VsPlan.VS_STARTER]: "Starter",
  [VsPlan.VS_PRO]: "Pro",
  [VsPlan.VS_GROWTH]: "Growth",
  [VsPlan.VS_ENTERPRISE]: "Custom",
};

/** Current VenueSprocket plan, what it includes, and the one next step (subscribe or manage). */
export async function VsBillingPanel({ venueId }: { venueId: string }) {
  const [config, ent, monthCount] = await Promise.all([
    prisma.venueVsConfig.findUnique({
      where: { venueId },
      select: { vsSubscriptionId: true, vsSubscriptionStatus: true, vsPlan: true },
    }),
    getVsEntitlements(venueId),
    inquiriesThisMonth(venueId),
  ]);
  const subscribed = holdsSubscription(config?.vsSubscriptionId, config?.vsSubscriptionStatus);
  const pastDue = config?.vsSubscriptionStatus === "past_due" || config?.vsSubscriptionStatus === "unpaid";

  return (
    <div id="billing" className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--vs-muted)]">Plan</p>
        <p className="font-display text-xl font-bold text-[var(--vs-text)]">{VS_PLAN_NAME[ent.plan]}</p>
        {config?.vsSubscriptionStatus ? (
          <span className="rounded-full border border-[var(--vs-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--vs-muted)]">
            {subscriptionStatusLabel(config.vsSubscriptionStatus)}
          </span>
        ) : null}
      </div>
      {ent.plan === VsPlan.VS_FREE ? (
        <p className="text-sm text-[var(--vs-text-soft)]">
          {monthCount} {monthCount === 1 ? "inquiry" : "inquiries"} this month. The Free plan includes{" "}
          {VS_FREE_MONTHLY_INQUIRIES} a month; every inquiry is still received and kept.
        </p>
      ) : null}
      {ent.grandfathered.length > 0 ? (
        <p className="text-sm text-[var(--vs-text-soft)]">
          Kept from before plan limits started (no charge): {ent.grandfathered.map((f) => VS_FEATURE_LABEL[f]).join(", ")}.
        </p>
      ) : null}
      {subscribed ? (
        <div className="space-y-2">
          {pastDue ? (
            <p className="text-sm text-[var(--vs-text-soft)]">Your last payment didn&apos;t go through. Update your card to keep your plan.</p>
          ) : (
            <p className="text-sm text-[var(--vs-text-soft)]">Change plans, update your card, or cancel in the billing portal.</p>
          )}
          <VsManageBillingButton label={pastDue ? "Update payment method" : "Manage subscription"} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/signup/venue?plan=starter"
            className="rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)]"
          >
            Starter · $29/mo
          </Link>
          <Link
            href="/signup/venue?plan=pro"
            className="rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
          >
            Pro · $79/mo
          </Link>
          <Link href="/pricing" className="px-2 py-2 text-sm font-semibold text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
            Compare plans
          </Link>
        </div>
      )}
    </div>
  );
}
