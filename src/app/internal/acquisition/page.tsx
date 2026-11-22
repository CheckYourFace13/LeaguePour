import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getBoolSetting } from "@/lib/app-settings";
import { isVsOutreachEnabled } from "@/lib/outreach-email";
import { formatUsdCents } from "@/lib/pricing";
import { BRAND_INFO, DAILY_SEND_CAP, PROGRAM_DAYS, PROGRAM_END, PROGRAM_START, PROGRAM_TARGETS, PROSPECT_STATUSES, type AcqBrand } from "@/lib/acquisition/program";
import { getAcquisitionMetrics, getDailyTable, getFunnel } from "@/lib/acquisition/metrics";
import { automationSwitches, outreachLaneStatus } from "@/lib/acquisition/automation";
import { getLatestJobRuns } from "@/lib/job-runs";
import { renderEmail } from "@/lib/acquisition/drafts";
import {
  approveProspectAction,
  findPublicEmailAction,
  importProspectsAction,
  toggleAutomationAction,
  saveDiscoverySettingsAction,
  saveDraftAction,
  sendProspectAction,
  setProspectStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Acquisition program (owner)" };

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function pct(n: number, d: number): string {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : "-";
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-lp-border bg-lp-bg/60 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-lp-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-lp-text">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-lp-muted">{sub}</p> : null}
    </div>
  );
}

function Progress({ label, value, target }: { label: string; value: number; target: string | number }) {
  const t = typeof target === "number" ? target : Number(String(target).split("-")[0]);
  const w = t > 0 ? Math.min(100, Math.round((value / t) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-lp-text">
        <span>{label}</span>
        <span className="tabular-nums">
          {value} / {target}
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-lp-border">
        <div className="h-2 rounded bg-lp-accent" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  QUEUED: "bg-zinc-500/10 text-zinc-600",
  APPROVED: "bg-blue-500/10 text-blue-700",
  SENT: "bg-indigo-500/10 text-indigo-700",
  REPLIED: "bg-yellow-500/10 text-yellow-700",
  POSITIVE: "bg-green-500/10 text-green-700",
  NOT_INTERESTED: "bg-red-500/10 text-red-700",
  UNSUBSCRIBED: "bg-red-500/10 text-red-700",
  BOUNCED: "bg-red-500/10 text-red-700",
  COMPLAINED: "bg-red-500/10 text-red-700",
  SKIPPED: "bg-zinc-500/10 text-zinc-500",
  SUPPRESSED: "bg-zinc-500/10 text-zinc-500",
};

export default async function AcquisitionPage({ searchParams }: Props) {
  await requireOwnerSession();
  const params = searchParams ? await searchParams : {};
  const notice = one(params.notice).slice(0, 300);
  const error = one(params.error).slice(0, 300);
  const brandFilter = one(params.brand) === "vs" ? "vs" : one(params.brand) === "lp" ? "lp" : "";
  const statusFilter = (PROSPECT_STATUSES as readonly string[]).includes(one(params.status)) ? one(params.status) : "";
  const open = one(params.open);

  const metrics = await getAcquisitionMetrics();
  const [daily, lanes, switches, jobs, funnel] = await Promise.all([
    getDailyTable(14),
    outreachLaneStatus(),
    automationSwitches(),
    getLatestJobRuns(["acquisition-discover", "acquisition-qualify", "acquisition-report"]),
    getFunnel(),
  ]);
  const [rows, imported, vsLaneOn, lpLaneOn] = await Promise.all([
    prisma.acquisitionProspect.findMany({
      where: { ...(brandFilter ? { brand: brandFilter } : {}), ...(statusFilter ? { status: statusFilter } : {}) },
      orderBy: [{ brand: "asc" }, { relevance: "asc" }, { city: "asc" }, { name: "asc" }],
      take: 400,
    }),
    prisma.acquisitionProspect.count(),
    isVsOutreachEnabled(),
    getBoolSetting("lp_outreach_enabled", false),
  ]);
  const postal = process.env.OUTREACH_POSTAL_ADDRESS?.trim() || "LeaguePour, Chicago, IL, USA";
  const dayOf = Math.min(PROGRAM_DAYS, Math.max(1, Math.ceil((metrics.now.getTime() - PROGRAM_START.getTime()) / 86_400_000)));
  const totalProspects = metrics.lp.prospects + metrics.vs.prospects;
  const totalRegs = metrics.lp.registrations + metrics.vs.registrations;
  const totalPaid = metrics.lp.paidConversions + metrics.vs.paidConversions;

  const filterHref = (b: string, s: string) => {
    const q = new URLSearchParams();
    if (b) q.set("brand", b);
    if (s) q.set("status", s);
    const qs = q.toString();
    return `/internal/acquisition${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <p className="lp-kicker">Owner only</p>
        <h1 className="font-display text-4xl font-extrabold text-lp-text">30-day acquisition program</h1>
        <p className="mt-2 text-sm text-lp-text-soft">
          Day {dayOf} of {PROGRAM_DAYS} ({PROGRAM_START.toLocaleDateString("en-US", { timeZone: "America/Chicago" })} to{" "}
          {PROGRAM_END.toLocaleDateString("en-US", { timeZone: "America/Chicago" })}). Every number below is a live query. Nothing is
          sent unless you approve a prospect and then press Send for it. Max {DAILY_SEND_CAP} sends per brand per day.
        </p>
        <p className="mt-1 text-sm">
          <Link className="font-semibold text-lp-accent hover:underline" href="/internal/admin">
            Admin
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-lp-accent hover:underline" href="/internal/outreach">
            Older outreach lists
          </Link>
        </p>
      </div>

      {notice ? <p className="rounded-lg border border-green-600/30 bg-green-500/10 px-4 py-3 text-sm text-green-800">{notice}</p> : null}
      {error ? <p className="rounded-lg border border-red-600/30 bg-red-500/10 px-4 py-3 text-sm text-red-800">{error}</p> : null}

      <Card className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold text-lp-text">Targets (both brands)</h2>
        <p className="text-sm text-lp-text-soft">Goals you set for the 30 days, not forecasts.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Progress label="Researched prospects" value={totalProspects} target={PROGRAM_TARGETS.prospects} />
          <Progress label="Venue registrations" value={totalRegs} target={PROGRAM_TARGETS.registrations} />
          <Progress label="Paid conversions" value={totalPaid} target={`${PROGRAM_TARGETS.paidConversionsLow}-${PROGRAM_TARGETS.paidConversionsHigh}`} />
        </div>
        <p className="text-xs text-lp-muted">
          Older automated lanes: VenueSprocket daily outreach is {vsLaneOn ? "ON" : "paused"}, LeaguePour daily outreach is{" "}
          {lpLaneOn ? "ON" : "paused"} (controls on the older outreach page). Sending a prospect here marks its matching
          old-list contact so neither lane emails that business again.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold text-lp-text">Prospect funnel</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Discovered (new places)" value={funnel.discovered} sub={`${funnel.checked} checked · ${funnel.pendingCheck} waiting`} />
          <Stat label="Existing list scanned" value={funnel.existingListScanned} sub="already-listed businesses checked" />
          <Stat label="Qualified · LeaguePour" value={funnel.brands.lp.qualified} sub={Object.entries(funnel.brands.lp.bySource).map(([k, v]) => `${v} ${k}`).join(" · ") || "-"} />
          <Stat label="Qualified · VenueSprocket" value={funnel.brands.vs.qualified} sub={Object.entries(funnel.brands.vs.bySource).map(([k, v]) => `${v} ${k}`).join(" · ") || "-"} />
          <Stat label="Pending approval" value={funnel.brands.lp.pendingApproval + funnel.brands.vs.pendingApproval} sub={`LP ${funnel.brands.lp.pendingApproval} · VS ${funnel.brands.vs.pendingApproval}`} />
          <Stat label="Contacted" value={funnel.brands.lp.contacted + funnel.brands.vs.contacted} sub={`LP ${funnel.brands.lp.contacted} · VS ${funnel.brands.vs.contacted}`} />
          <Stat label="Converted (signed up)" value={funnel.brands.lp.converted + funnel.brands.vs.converted} sub={`LP ${funnel.brands.lp.converted} · VS ${funnel.brands.vs.converted}`} />
          <Stat label="Suppressed" value={funnel.brands.lp.suppressed + funnel.brands.vs.suppressed} sub="existing venue, opted out or already contacted" />
        </div>
        <p className="text-xs text-lp-muted">
          Discovery outcomes: {funnel.discoveryByStatus.map((d) => `${d.status} ${d.count}`).join(", ") || "none yet"}. Expansion: query{" "}
          {Math.min(funnel.config.cursor, funnel.config.totalQueries)} of {funnel.config.totalQueries}
          {funnel.nextQuery ? ` (next: "${funnel.nextQuery}")` : " (all Chicagoland queries used)"}.
        </p>
        <div className="rounded-lg border border-lp-border p-3 text-sm">
          <p className="font-semibold text-lp-text">
            Daily discovery: {funnel.config.enabled ? "ON" : "OFF"} · last run:{" "}
            {jobs["acquisition-discover"]
              ? `${jobs["acquisition-discover"].status} ${jobs["acquisition-discover"].startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC (${(jobs["acquisition-discover"].detail ?? "").slice(0, 200)})`
              : "never"}
          </p>
          <p className="text-xs text-lp-muted">
            Google Places (New) text search returns place IDs and website links only (nothing else from Google is stored); each business&apos;s own
            site is then read (robots.txt respected, max 4 pages). Matches join the approval queue. Nothing is emailed automatically.
          </p>
          <form action={saveDiscoverySettingsAction} className="mt-2 flex flex-wrap items-end gap-3">
            <label className="text-xs">
              Discovery
              <select name="enabled" defaultValue={funnel.config.enabled ? "true" : "false"} className="ml-1 rounded border border-lp-border px-1 py-0.5">
                <option value="true">on</option>
                <option value="false">off</option>
              </select>
            </label>
            <label className="text-xs">
              Places searches/day (max 8)
              <input name="queries" type="number" min={0} max={8} defaultValue={funnel.config.queriesPerDay} className="ml-1 w-16 rounded border border-lp-border px-1 py-0.5" />
            </label>
            <label className="text-xs">
              Websites checked/day (max 40)
              <input name="sites" type="number" min={0} max={40} defaultValue={funnel.config.sitesPerDay} className="ml-1 w-16 rounded border border-lp-border px-1 py-0.5" />
            </label>
            <Button type="submit" variant="secondary" className="min-h-0 px-3 py-1.5 text-sm">
              Save
            </Button>
          </form>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold text-lp-text">Automation status</h2>
        <ul className="space-y-1 text-sm text-lp-text-soft">
          <li>
            <strong>VenueSprocket automatic cold email: {lanes.vsAutomatic}</strong> (switch: {lanes.vsSwitchRow}; last automatic send{" "}
            {lanes.lastVsSendAt}). LeaguePour automatic cold email: {lanes.lpAutomatic} (last send {lanes.lastLpSendAt}).
          </li>
          <li>Acquisition cost: $0 (no paid channels or tools are connected).</li>
        </ul>
        <div className="grid gap-3 md:grid-cols-2">
          {([
            ["qualify", "Daily website qualification (12 listed businesses/day into the approval queue)", switches.qualify, jobs["acquisition-qualify"]],
            ["report", "Daily owner report email (only when something changed)", switches.report, jobs["acquisition-report"]],
          ] as const).map(([key, label, on, job]) => (
            <div key={key} className="rounded-lg border border-lp-border p-3 text-sm">
              <p className="font-semibold text-lp-text">{label}</p>
              <p className="text-lp-muted">
                {on ? "ON" : "OFF"} · last run:{" "}
                {job ? `${job.status} ${job.startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC${job.detail ? ` (${job.detail.slice(0, 160)})` : ""}` : "never"}
              </p>
              <form action={toggleAutomationAction} className="mt-2">
                <input type="hidden" name="key" value={key} />
                <input type="hidden" name="on" value={on ? "false" : "true"} />
                <Button type="submit" variant="secondary" className="min-h-0 px-3 py-1.5 text-sm">
                  Turn {on ? "off" : "on"}
                </Button>
              </form>
            </div>
          ))}
        </div>
        <p className="text-xs text-lp-muted">Runs daily at 14:45 UTC (8:45am Chicago in winter). Neither one contacts a prospect.</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-2xl font-extrabold text-lp-text">Daily metrics (last 14 days)</h2>
        <p className="text-xs text-lp-muted">
          Sessions are first-party counts (one per browser session on marketing pages); &quot;no data&quot; means the day is before counting
          started, 0 means counted and none. Activation: LP = competitions published; VS = inquiries received.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs uppercase text-lp-muted">
                <th className="py-1 pr-3">Day</th>
                <th className="py-1 pr-3">Brand</th>
                <th className="py-1 pr-3 text-right">Sessions</th>
                <th className="py-1 pr-3 text-right">Signups</th>
                <th className="py-1 pr-3 text-right">Activation</th>
                <th className="py-1 pr-3 text-right">Paid</th>
                <th className="py-1 pr-3 text-right">Emails sent</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((r) => (
                <tr key={`${r.day}-${r.brand}`} className="border-t border-lp-border">
                  <td className="py-1 pr-3">{r.brand === "lp" ? r.day : ""}</td>
                  <td className="py-1 pr-3">{BRAND_INFO[r.brand].name}</td>
                  <td className="py-1 pr-3 text-right">{r.sessions === null ? "no data" : r.sessions}</td>
                  <td className="py-1 pr-3 text-right">{r.signups}</td>
                  <td className="py-1 pr-3 text-right">{r.activations}</td>
                  <td className="py-1 pr-3 text-right">{r.paid}</td>
                  <td className="py-1 pr-3 text-right">{r.emailsSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(["lp", "vs"] as AcqBrand[]).map((brand) => {
        const b = metrics[brand];
        return (
          <Card key={brand} className="space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-lp-text">{BRAND_INFO[brand].name}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Prospects" value={b.prospects} sub={`${b.queued} queued · ${b.approved} approved · ${b.suppressed} suppressed`} />
              <Stat label="With public email" value={b.withEmail} sub="others: contact form or phone" />
              <Stat label="Contact attempts" value={b.contacted} sub="emails sent from this queue" />
              <Stat label="Replies" value={b.replied} sub={`${pct(b.replied, b.contacted)} of contacted · ${b.positive} positive`} />
              <Stat label="Demo visits" value={b.demoVisits} sub={`prospects who opened a tracked link (${pct(b.demoVisits, b.contacted)})`} />
              <Stat label="Registrations" value={b.registrations} sub={`${b.registrationsFromOutreach} from this outreach`} />
              <Stat
                label={brand === "lp" ? "Activated venues" : "Venues with a lead"}
                value={b.activated}
                sub={brand === "lp" ? "new venues that published a competition" : "new venues that received an inquiry"}
              />
              {brand === "lp" ? (
                <Stat label="Tournaments" value={b.tournamentsCreated} sub={`${b.tournamentsPublished} published (all venues)`} />
              ) : (
                <Stat label="Opt-outs" value={b.unsubscribed} sub={`${b.bounced} bounced · ${b.complained} complaints`} />
              )}
              <Stat label="Paid conversions" value={b.paidConversions} sub={`${b.paidFromOutreach} from this outreach`} />
              <Stat label="New MRR" value={formatUsdCents(b.newMrrCents)} sub={`${formatUsdCents(b.outreachMrrCents)} attributable to outreach`} />
              {brand === "lp" ? <Stat label="Opt-outs" value={b.unsubscribed} sub={`${b.bounced} bounced · ${b.complained} complaints`} /> : null}
            </div>
            <div className="text-xs text-lp-muted">
              Signup sources this window:{" "}
              {b.sourceBreakdown.length ? b.sourceBreakdown.map((s) => `${s.label} (${s.count})`).join(", ") : "none yet"}. Sources are
              recorded for signups from the attribution release onward; earlier venues show as &quot;no source recorded&quot;.
            </div>
          </Card>
        );
      })}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold text-lp-text">Approval queue</h2>
          <form action={importProspectsAction} className="flex flex-wrap items-center gap-2">
            <input type="file" name="file" accept="application/json,.json" required className="text-sm" aria-label="Prospect JSON file" />
            <Button type="submit" variant="secondary" className="min-h-0 px-3 py-1.5 text-sm">
              Import prospect file ({imported} in queue)
            </Button>
          </form>
        </div>
        <p className="text-sm text-lp-text-soft">
          Upload the researched list (private/acquisition/prospects-2026-11.json on your computer; it is
          kept out of the public repo). Import is safe to repeat: it skips businesses already imported and stores anything that matches an existing venue,
          an earlier outreach contact or an opt-out as Suppressed, with the reason.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {["", "lp", "vs"].map((b) => (
            <Link key={b || "all"} href={filterHref(b, statusFilter)} className={`rounded border px-2 py-1 ${brandFilter === b ? "border-lp-accent font-bold" : "border-lp-border"}`}>
              {b ? BRAND_INFO[b as AcqBrand].name : "Both brands"}
            </Link>
          ))}
          <span className="mx-2 text-lp-muted">|</span>
          {["", ...PROSPECT_STATUSES].map((s) => (
            <Link key={s || "any"} href={filterHref(brandFilter, s)} className={`rounded border px-2 py-1 ${statusFilter === s ? "border-lp-accent font-bold" : "border-lp-border"}`}>
              {s ? s.toLowerCase().replace("_", " ") : "any status"}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? <p className="text-sm text-lp-muted">No prospects match. Upload the researched list to start.</p> : null}
        <ul className="space-y-3">
          {rows.map((p) => {
            const preview = renderEmail({ brand: p.brand as AcqBrand, name: p.name, body: p.draftBody, token: p.token, postalAddress: postal }).text;
            return (
              <li key={p.id} className="rounded-lg border border-lp-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-lp-text">
                      {p.name} <span className="text-sm font-normal text-lp-muted">· {p.city}, {p.state} · {p.segment} · {BRAND_INFO[p.brand as AcqBrand].name}</span>
                    </p>
                    <p className="text-sm text-lp-text-soft">{p.useCase}</p>
                    <p className="mt-1 text-xs text-lp-muted">
                      Source:{" "}
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                        {p.sourceUrl.replace(/^https?:\/\//, "").slice(0, 70)}
                      </a>{" "}
                      ({p.sourceNote}) · verified {p.verifiedAt.toISOString().slice(0, 10)} · relevance {p.relevance}
                      {p.website ? (
                        <>
                          {" "}
                          ·{" "}
                          <a href={p.website} target="_blank" rel="noreferrer" className="underline">
                            website
                          </a>
                        </>
                      ) : null}
                    </p>
                    <p className="text-xs text-lp-muted">
                      Contact: {p.email ? `email ${p.email}` : `${p.contactRoute} ${p.contactValue ?? ""}`}
                      {p.suppressReason ? ` · suppressed: ${p.suppressReason}` : ""}
                      {p.sendError ? ` · last error: ${p.sendError}` : ""}
                      {p.sentAt ? ` · sent ${p.sentAt.toISOString().slice(0, 10)}` : ""}
                      {p.visitCount ? ` · ${p.visitCount} link visit(s)` : ""}
                      {p.signedUpVenueId ? " · SIGNED UP" : ""}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[p.status] ?? ""}`}>{p.status.toLowerCase().replace("_", " ")}</span>
                </div>

                <details className="mt-3" open={open === p.id}>
                  <summary className="cursor-pointer text-sm font-semibold text-lp-accent">Draft: {p.draftSubject}</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-lp-bg p-3 text-xs text-lp-text-soft">{preview}</pre>
                  {["QUEUED", "APPROVED", "SKIPPED"].includes(p.status) ? (
                    <form action={saveDraftAction} className="mt-3 space-y-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="subject" defaultValue={p.draftSubject} className="w-full rounded border border-lp-border px-2 py-1 text-sm" aria-label="Subject" />
                      <textarea name="body" defaultValue={p.draftBody} rows={12} className="w-full rounded border border-lp-border px-2 py-1 font-mono text-xs" aria-label="Body" />
                      <input name="email" defaultValue={p.email ?? ""} placeholder="Published business email (never guessed)" className="w-full rounded border border-lp-border px-2 py-1 text-sm" aria-label="Email" />
                      <input name="notes" defaultValue={p.notes ?? ""} placeholder="Notes" className="w-full rounded border border-lp-border px-2 py-1 text-sm" aria-label="Notes" />
                      <p className="text-xs text-lp-muted">{"{{link:/path}}"} becomes a tracked link; the footer with your postal address and unsubscribe link is added automatically.</p>
                      <Button type="submit" variant="secondary" className="min-h-0 px-3 py-1.5 text-sm">
                        Save draft
                      </Button>
                    </form>
                  ) : null}
                </details>

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.status === "QUEUED" ? (
                    <>
                      <form action={approveProspectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" className="min-h-0 px-3 py-1.5 text-sm">Approve</Button>
                      </form>
                      <StatusButton id={p.id} status="SKIPPED" label="Skip" />
                    </>
                  ) : null}
                  {p.status === "APPROVED" && p.email ? (
                    <form action={sendProspectAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit" className="min-h-0 px-3 py-1.5 text-sm">Send this email</Button>
                    </form>
                  ) : null}
                  {["APPROVED", "SKIPPED"].includes(p.status) ? <StatusButton id={p.id} status="QUEUED" label="Back to queue" /> : null}
                  {!p.email && p.website && ["QUEUED", "APPROVED"].includes(p.status) ? (
                    <form action={findPublicEmailAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit" className="min-h-0 px-3 py-1.5 text-sm" variant="secondary">Find email on their site</Button>
                    </form>
                  ) : null}
                  {["SENT", "REPLIED", "APPROVED"].includes(p.status) ? (
                    <>
                      <StatusButton id={p.id} status="REPLIED" label="Replied" />
                      <StatusButton id={p.id} status="POSITIVE" label="Positive" />
                      <StatusButton id={p.id} status="NOT_INTERESTED" label="Not interested" />
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setProspectStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" className="min-h-0 px-3 py-1.5 text-sm" variant="secondary">
        {label}
      </Button>
    </form>
  );
}
