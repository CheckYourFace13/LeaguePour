import Link from "next/link";
import { VS_FEATURE_LABEL, VS_FEATURE_TIER, vsUpgradePath, type VsFeature } from "@/lib/entitlements/vs";

/** Shown in place of a paid action the venue's plan doesn't include. The action itself is also gated server-side. */
export function VsLockedFeature({ feature, from }: { feature: VsFeature; from: string }) {
  const tier = VS_FEATURE_TIER[feature] === "pro" ? "Pro" : "Starter";
  return (
    <div className="rounded-lg border border-dashed border-[var(--vs-border-strong)] bg-[var(--vs-surface-2)] px-4 py-3 text-sm">
      <p className="text-[var(--vs-text)]">
        <span className="font-semibold">{VS_FEATURE_LABEL[feature]}</span> is included in the {tier} plan.
      </p>
      <Link href={vsUpgradePath(feature, from)} className="mt-1 inline-block font-semibold text-[var(--vs-accent)] hover:underline">
        See what {tier} includes →
      </Link>
    </div>
  );
}
