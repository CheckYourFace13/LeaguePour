import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { createEventFromLead } from "@/lib/actions/vs";

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[var(--vs-text)]">
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function VsDashboardPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const venueId = access.venueId;

  const [
    newLeads,
    proposalsSent,
    contractsSigned,
    depositsOwed,
    upcomingEvents,
    recentLeads,
  ] = await Promise.all([
    prisma.privateEventLead.count({ where: { venueId, status: "NEW" } }),
    prisma.vsProposal.count({
      where: { privateEvent: { venueId }, status: { in: ["SENT", "VIEWED"] } },
    }),
    prisma.vsContract.count({
      where: { privateEvent: { venueId }, status: "SIGNED" },
    }),
    prisma.vsPayment.count({
      where: { venueId, status: "PENDING" },
    }),
    prisma.privateEvent.findMany({
      where: { venueId, eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 5,
      include: { lead: true },
    }),
    prisma.privateEventLead.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-yellow-100 text-yellow-700",
    PROPOSAL_SENT: "bg-purple-100 text-purple-700",
    BOOKED: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    LOST: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Dashboard</h1>
        <p className="mt-1 text-[var(--vs-muted)]">Your private event overview</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/leads"
          className="rounded-lg bg-[var(--vs-accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors"
        >
          View all leads
        </Link>
        <Link
          href="/app/events"
          className="rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-4 py-2.5 text-sm font-bold text-[var(--vs-text)] hover:border-[var(--vs-accent)] transition-colors"
        >
          View events
        </Link>
        <Link
          href="/app/settings"
          className="rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface)] px-4 py-2.5 text-sm font-bold text-[var(--vs-muted)] hover:text-[var(--vs-text)] transition-colors"
        >
          Venue settings
        </Link>
      </div>

      {/* LeaguePour cross-sell */}
      <div className="rounded-xl border border-[var(--vs-border)] border-l-4 border-l-[#1a73ff] bg-[var(--vs-surface)] p-5">
        <p className="font-bold text-[var(--vs-text)]">
          Slow weeknights? Fill them with <span className="text-[#1a73ff]">LeaguePour</span> game nights
        </p>
        <p className="mt-1 text-sm text-[var(--vs-muted)]">
          Trivia, darts, cornhole, pool — QR signups, paid entries via Stripe, and live standings run
          from this same account. VenueSprocket venues get 50% off forever.
        </p>
        <Link
          href="/venue/dashboard"
          className="mt-3 inline-flex rounded-lg border border-[#1a73ff] px-4 py-2 text-sm font-bold text-[#1a73ff] hover:bg-[#1a73ff]/5 transition-colors"
        >
          Open game nights →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New leads" value={newLeads} href="/app/leads?status=NEW" />
        <StatCard label="Proposals out" value={proposalsSent} href="/app/proposals" />
        <StatCard label="Contracts signed" value={contractsSigned} href="/app/contracts" />
        <StatCard label="Deposits pending" value={depositsOwed} href="/app/payments" />
      </div>

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--vs-text)]">Upcoming events</h2>
          <Link href="/app/events" className="text-sm font-semibold text-[var(--vs-accent)] hover:underline">
            See all →
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-8 text-center">
            <p className="text-[var(--vs-muted)]">No upcoming events yet.</p>
            <p className="mt-1 text-sm text-[var(--vs-muted)]">
              Convert a lead into an event to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/app/events/${ev.id}`}
                className="flex items-center justify-between rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] px-5 py-4 hover:border-[var(--vs-accent)] transition-colors"
              >
                <div>
                  <p className="font-semibold text-[var(--vs-text)]">{ev.eventName}</p>
                  <p className="mt-0.5 text-sm text-[var(--vs-muted)]">
                    {ev.eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {ev.startTime} – {ev.endTime}
                    {ev.guestCountEstimated ? ` · ${ev.guestCountEstimated} guests` : ""}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[var(--vs-muted)]">
                  {ev.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--vs-text)]">Recent leads</h2>
          <Link href="/app/leads" className="text-sm font-semibold text-[var(--vs-accent)] hover:underline">
            See all →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-8 text-center">
            <p className="text-[var(--vs-muted)]">No leads yet.</p>
            <p className="mt-2 text-sm text-[var(--vs-muted)]">
              Share your inquiry page link and leads will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-4 py-3">
                      <Link href={`/app/leads/${lead.id}`} className="font-semibold text-[var(--vs-text)] hover:text-[var(--vs-accent)]">
                        {lead.customerName}
                      </Link>
                      <p className="text-xs text-[var(--vs-muted)]">{lead.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--vs-text-soft)]">
                      {lead.eventType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-[var(--vs-muted)]">
                      {lead.preferredDate?.toLocaleDateString() ?? "TBD"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {lead.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
