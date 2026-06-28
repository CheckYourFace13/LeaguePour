import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUSES = ["NEW", "CONTACTED", "PROPOSAL_SENT", "CONTRACT_SENT", "DEPOSIT_PENDING", "BOOKED", "COMPLETED", "LOST"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROPOSAL_SENT: "bg-purple-50 text-purple-700 border-purple-200",
  CONTRACT_SENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DEPOSIT_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  BOOKED: "bg-green-50 text-green-700 border-green-200",
  COMPLETED: "bg-gray-50 text-gray-600 border-gray-200",
  LOST: "bg-red-50 text-red-600 border-red-200",
};

export default async function VsLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const { status } = await searchParams;
  const venueId = access.venueId;

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { slug: true },
  });

  const leads = await prisma.privateEventLead.findMany({
    where: {
      venueId,
      ...(status && STATUSES.includes(status) ? { status: status as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = await prisma.privateEventLead.groupBy({
    by: ["status"],
    where: { venueId },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Leads</h1>
          <p className="mt-1 text-[var(--vs-muted)]">All private event inquiries</p>
        </div>
        {venue && (
          <a
            href={`/v/${venue.slug}/inquire`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            Share inquiry page ↗
          </a>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/leads"
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${!status ? "border-[var(--vs-accent)] bg-[var(--vs-accent)] text-white" : "border-[var(--vs-border)] bg-[var(--vs-surface)] text-[var(--vs-muted)] hover:border-[var(--vs-accent)]"}`}
        >
          All ({leads.length})
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/app/leads?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${status === s ? "border-[var(--vs-accent)] bg-[var(--vs-accent)] text-white" : "border-[var(--vs-border)] bg-[var(--vs-surface)] text-[var(--vs-muted)] hover:border-[var(--vs-accent)]"}`}
          >
            {s.replace(/_/g, " ")} {countMap[s] ? `(${countMap[s]})` : ""}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No leads yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">
            Share your inquiry page link with customers to start collecting private event requests.
          </p>
          {venue && (
            <a
              href={`/v/${venue.slug}/inquire`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
            >
              View your inquiry page
            </a>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Event</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Date</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Guests</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/app/leads/${lead.id}`} className="block">
                      <p className="font-semibold text-[var(--vs-text)] hover:text-[var(--vs-accent)]">{lead.customerName}</p>
                      <p className="text-xs text-[var(--vs-muted)]">{lead.customerEmail}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--vs-text-soft)] hidden sm:table-cell">
                    {lead.eventType.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">
                    {lead.preferredDate?.toLocaleDateString() ?? "TBD"}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">
                    {lead.guestCount ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[lead.status] ?? ""}`}>
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
  );
}
