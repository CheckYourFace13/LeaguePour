import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { VS_FEATURE_LABEL, VS_FEATURE_TIER, type VsFeature } from "@/lib/entitlements/vs";
import { VsBillingPanel } from "@/components/venuesprocket/vs-billing-panel";

export const dynamic = "force-dynamic";

const FEATURE_DETAIL: Record<VsFeature, string> = {
  pipeline: "Move inquiries through your pipeline (contacted, proposal sent, booked, lost) instead of just reading them.",
  proposals: "Build a proposal with a room fee, food & beverage minimum and line items, and send the customer a link to accept it.",
  deposits: "Ask for a deposit on a proposal and collect it by card after the customer signs.",
  contracts: "Generate a private-event contract from the proposal and send it for typed e-signature.",
  beos: "Create a banquet event order for your kitchen and floor team, with a print-ready view.",
  followUps: "Get an email reminder when a new inquiry has gone a couple of days without a reply.",
};

export default async function VsUpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string; from?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const { feature: rawFeature, from } = await searchParams;
  const feature = rawFeature && rawFeature in VS_FEATURE_TIER ? (rawFeature as VsFeature) : null;
  const tier = feature && VS_FEATURE_TIER[feature] === "pro" ? "Pro" : "Starter";
  const back = from && from.startsWith("/app/") ? from : "/app/dashboard";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={back} className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
          ← Back
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[var(--vs-text)]">
          {feature ? `${VS_FEATURE_LABEL[feature]} is on ${tier}` : "Your plan"}
        </h1>
        {feature ? <p className="mt-2 text-[var(--vs-text-soft)]">{FEATURE_DETAIL[feature]}</p> : null}
        <p className="mt-2 text-sm text-[var(--vs-muted)]">
          Nothing you already have is affected: your inquiries, customers, events, documents and payments stay
          available on every plan, and customers can still finish anything you already sent them.
        </p>
      </div>
      <VsBillingPanel venueId={access.venueId} />
    </div>
  );
}
