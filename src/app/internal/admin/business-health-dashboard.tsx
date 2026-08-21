import { Card } from "@/components/ui/card";
import { formatUsdCents } from "@/lib/pricing";
import type { getLeaguePourMetrics, getVenueSprocketMetrics } from "@/lib/admin-metrics";

type LpMetrics = Awaited<ReturnType<typeof getLeaguePourMetrics>>;
type VsMetrics = Awaited<ReturnType<typeof getVenueSprocketMetrics>>;

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-lp-border bg-lp-bg/60 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-lp-text">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-lp-muted">{sub}</p> : null}
    </div>
  );
}

function jobLine(
  job: { status: string; startedAt: Date; finishedAt: Date | null; detail: string | null } | null,
) {
  if (!job) return "Never run";
  const when = job.startedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const badge =
    job.status === "success"
      ? "✓ success"
      : job.status === "skipped"
        ? "– skipped"
        : job.status === "running"
          ? "… running"
          : "✗ failure";
  return `${badge} · ${when}${job.detail ? ` · ${job.detail}` : ""}`;
}

function jobColor(job: { status: string } | null) {
  if (!job) return "text-lp-muted";
  if (job.status === "success") return "text-green-600";
  if (job.status === "failure") return "text-red-600";
  return "text-lp-muted";
}

export function BusinessHealthDashboard({ lp, vs }: { lp: LpMetrics; vs: VsMetrics }) {
  return (
    <Card className="space-y-6">
      <div>
        <p className="lp-kicker">Owner operating panel</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-lp-text">Business health</h2>
        <p className="mt-1 text-sm text-lp-text-soft">
          Real counts from production data. MRR is an approximation - it assumes every active
          subscriber pays the monthly rate, since billing interval (monthly vs. annual) isn&apos;t
          tracked per venue yet.
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-lp-text">LeaguePour</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total venues" value={lp.totalVenues} />
          <Stat label="Paid venues" value={lp.paidVenues} sub={`${lp.freeVenues} free/unpaid`} />
          <Stat label="New venues (7d)" value={lp.newVenues7} sub={`${lp.newVenues30} in 30d`} />
          <Stat label="Active competitions" value={lp.activeCompetitions} />
          <Stat
            label="Competitions created"
            value={lp.competitionsCreated7}
            sub={`${lp.competitionsCreated30} in 30d`}
          />
          <Stat label="Registrations (7d)" value={lp.registrations7} sub={`${lp.registrations30} in 30d`} />
          <Stat label="Approx. MRR" value={formatUsdCents(lp.mrrCents)} />
          <Stat label="Outreach eligible" value={lp.outreachEligible} sub={`${lp.outreachSent7} sent in 7d`} />
        </div>
        <p className={`mt-3 text-sm ${jobColor(lp.latestOutreachJob)}`}>
          Latest outreach job: {jobLine(lp.latestOutreachJob)}
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-lp-text">VenueSprocket</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total VS venues" value={vs.totalVenues} />
          <Stat
            label="Plan mix"
            value={`${vs.freeCount}/${vs.starterCount}/${vs.proCount}/${vs.growthCount}`}
            sub="Free/Starter/Pro/Growth"
          />
          <Stat label="New venues (7d)" value={vs.newVenues7} sub={`${vs.newVenues30} in 30d`} />
          <Stat label="Leads (7d)" value={vs.leads7} sub={`${vs.leads30} in 30d`} />
          <Stat label="Proposals (7d)" value={vs.proposals7} sub={`${vs.proposals30} in 30d`} />
          <Stat label="Contracts signed" value={vs.contractsSigned7} sub={`${vs.contractsSigned30} in 30d`} />
          <Stat label="Deposits paid" value={vs.depositsPaid7} sub={`${vs.depositsPaid30} in 30d`} />
          <Stat label="Events booked" value={vs.eventsBooked7} sub={`${vs.eventsBooked30} in 30d`} />
          <Stat label="Approx. MRR" value={formatUsdCents(vs.mrrCents)} />
          <Stat
            label="Outreach eligible"
            value={vs.vsOutreachEligible}
            sub={`${vs.vsOutreachSent7} sent in 7d`}
          />
        </div>
        <p className={`mt-3 text-sm ${jobColor(vs.latestVsOutreachJob)}`}>
          Latest outreach job: {jobLine(vs.latestVsOutreachJob)}
        </p>
      </div>
    </Card>
  );
}
