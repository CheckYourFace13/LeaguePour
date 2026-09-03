import { Card } from "@/components/ui/card";
import { formatUsdCents } from "@/lib/pricing";
import type { getLeaguePourMetrics, getSystemHealthMetrics, getVenueSprocketMetrics } from "@/lib/admin-metrics";

type LpMetrics = Awaited<ReturnType<typeof getLeaguePourMetrics>>;
type VsMetrics = Awaited<ReturnType<typeof getVenueSprocketMetrics>>;
type SystemHealth = Awaited<ReturnType<typeof getSystemHealthMetrics>>;

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-lp-border bg-lp-bg/60 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-lp-text">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-lp-muted">{sub}</p> : null}
    </div>
  );
}

// Some job details legitimately mention a contact's email (e.g. a bounce/complaint
// suppression) - this is an internal-only, owner-authenticated page, but the redaction happens
// anyway so this panel never becomes a place that displays a real person's address.
function redactEmails(text: string): string {
  return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redacted]");
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
  const detail = job.detail ? redactEmails(job.detail) : null;
  return `${badge} · ${when}${detail ? ` · ${detail}` : ""}`;
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
          Real counts from production data. MRR is computed from each active subscription&apos;s
          real billing interval where known (annual ÷ 12); subscriptions from before interval
          tracking was added fall back to the monthly rate for that subscription specifically.
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
          <Stat
            label="MRR"
            value={formatUsdCents(lp.mrrCents)}
            sub={lp.legacyIntervalCount > 0 ? `${lp.legacyIntervalCount} on assumed-monthly fallback` : "interval-accurate"}
          />
          <Stat label="Outreach eligible" value={lp.outreachEligible} sub={`${lp.outreachSent7} sent in 7d`} />
        </div>
        <p className={`mt-3 text-sm ${jobColor(lp.latestOutreachJob)}`}>
          Latest outreach job: {jobLine(lp.latestOutreachJob)}
        </p>
        <p className={`mt-1 text-sm ${jobColor(lp.latestLifecycleJob)}`}>
          Latest lifecycle nudge job: {jobLine(lp.latestLifecycleJob)}
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
          <Stat
            label="MRR"
            value={formatUsdCents(vs.mrrCents)}
            sub={vs.legacyIntervalCount > 0 ? `${vs.legacyIntervalCount} on assumed-monthly fallback` : "interval-accurate"}
          />
          <Stat
            label="Outreach eligible"
            value={vs.vsOutreachEligible}
            sub={`${vs.vsOutreachSent7} sent in 7d`}
          />
        </div>
        <p className={`mt-3 text-sm ${jobColor(vs.latestVsOutreachJob)}`}>
          Latest outreach job: {jobLine(vs.latestVsOutreachJob)}
        </p>
        <p className={`mt-1 text-sm ${jobColor(vs.latestLifecycleJob)}`}>
          Latest lifecycle nudge job: {jobLine(vs.latestLifecycleJob)}
        </p>
      </div>
    </Card>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const JOB_LABELS: Record<string, string> = {
  "lp-outreach-send": "LP outreach send",
  "vs-outreach-send": "VS outreach send",
  "vs-eligibility-backfill": "VS eligibility backfill",
  "lp-lifecycle-nudges": "LP lifecycle nudges",
  "vs-lifecycle-nudges": "VS lifecycle nudges",
  "indexnow-submit": "IndexNow submission",
  "resend-webhook-suppress": "Resend webhook (bounce/complaint handling)",
  "stripe-dispute-created": "Stripe disputes (Connect)",
};

/**
 * "Is anything customer-blocking happening right now" at a glance - built entirely from data
 * this app already records (JobRun rows + the scheduler's own AppSetting heartbeat + direct
 * production counts). Not a new tracking system, just a place to see it. See
 * getSystemHealthMetrics's own doc comment for exactly what each signal means.
 */
export function SystemHealthPanel({ health }: { health: SystemHealth }) {
  const schedulerStale = health.scheduler.stale;
  const dbHeartbeatStale = health.dbHeartbeatStale;

  return (
    <Card className="space-y-5">
      <div>
        <p className="lp-kicker">Owner operating panel</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-lp-text">System health</h2>
        <p className="mt-1 text-sm text-lp-text-soft">
          Everything below is a live read of production state - no separate monitoring system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-lg border px-4 py-3 ${schedulerStale ? "border-red-500/40 bg-red-500/5" : "border-lp-border bg-lp-bg/60"}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">Internal scheduler</p>
          <p className={`mt-1 text-sm font-semibold ${schedulerStale ? "text-red-600" : "text-green-600"}`}>
            {schedulerStale ? "Stale / not ticking" : "Ticking normally"}
          </p>
          <p className="mt-0.5 text-xs text-lp-muted">
            Last tick {timeAgo(health.scheduler.lastTick)} · started {timeAgo(health.scheduler.startedAt)}
          </p>
        </div>
        <div className={`rounded-lg border px-4 py-3 ${dbHeartbeatStale ? "border-red-500/40 bg-red-500/5" : "border-lp-border bg-lp-bg/60"}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">Database heartbeat</p>
          <p className={`mt-1 text-sm font-semibold ${dbHeartbeatStale ? "text-red-600" : "text-green-600"}`}>
            {dbHeartbeatStale ? "Stale / overdue" : "Healthy"}
          </p>
          <p className="mt-0.5 text-xs text-lp-muted">
            {health.dbHeartbeat ? health.dbHeartbeat.slice(0, 80) : "No heartbeat recorded yet"}
          </p>
        </div>
        <div
          className={`rounded-lg border px-4 py-3 ${
            health.subscriptionIssues > 0 || health.connectRestricted > 0
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-lp-border bg-lp-bg/60"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">Billing/Connect flags</p>
          <p className="mt-1 text-sm font-semibold text-lp-text">
            {health.subscriptionIssues} subscription{health.subscriptionIssues === 1 ? "" : "s"} non-active
          </p>
          <p className="mt-0.5 text-xs text-lp-muted">
            {health.connectRestricted} venue{health.connectRestricted === 1 ? "" : "s"} submitted to Stripe but still
            charges-off
          </p>
        </div>
        <div
          className={`rounded-lg border px-4 py-3 ${
            health.connectStartedNotReady > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-lp-border bg-lp-bg/60"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">Stripe Connect readiness</p>
          <p className="mt-1 text-sm font-semibold text-green-600">
            {health.connectReady} venue{health.connectReady === 1 ? "" : "s"} - Stripe setup completed
          </p>
          <p className="mt-0.5 text-xs text-lp-muted">
            {health.connectStartedNotReady} venue{health.connectStartedNotReady === 1 ? "" : "s"} - Stripe setup
            incomplete
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">Scheduled job runs</p>
        {Object.entries(JOB_LABELS).map(([key, label]) => (
          <p key={key} className={`text-sm ${jobColor(health.jobs[key] ?? null)}`}>
            {label}: {jobLine(health.jobs[key] ?? null)}
          </p>
        ))}
      </div>
    </Card>
  );
}
