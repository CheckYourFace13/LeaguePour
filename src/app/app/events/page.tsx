import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-blue-50 text-blue-700",
  PROPOSAL_OUT: "bg-purple-50 text-purple-700",
  CONTRACT_OUT: "bg-indigo-50 text-indigo-700",
  DEPOSIT_DUE: "bg-orange-50 text-orange-700",
  CONFIRMED: "bg-green-50 text-green-700",
  BEO_DRAFT: "bg-yellow-50 text-yellow-700",
  BEO_FINAL: "bg-teal-50 text-teal-700",
  IN_PROGRESS: "bg-lime-50 text-lime-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
};

export default async function VsEventsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const events = await prisma.privateEvent.findMany({
    where: { venueId: access.venueId },
    orderBy: [{ eventDate: "asc" }],
    include: {
      lead: { select: { customerName: true, customerEmail: true } },
      proposals: { select: { id: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
      contracts: { select: { id: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
      beos: { select: { id: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const upcoming = events.filter((e) => e.eventDate >= new Date());
  const past = events.filter((e) => e.eventDate < new Date());

  function EventRow({ ev }: { ev: (typeof events)[0] }) {
    return (
      <Link
        href={`/app/events/${ev.id}`}
        className="flex flex-col gap-1 rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-4 hover:border-[var(--vs-accent)] transition-colors sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--vs-text)] truncate">{ev.eventName}</p>
          <p className="text-sm text-[var(--vs-muted)] mt-0.5">
            {ev.eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            {" · "}
            {ev.startTime} – {ev.endTime}
            {ev.guestCountEstimated ? ` · ${ev.guestCountEstimated} guests` : ""}
          </p>
          {ev.lead && <p className="text-xs text-[var(--vs-muted)]">{ev.lead.customerName}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ev.proposals[0] && (
            <span className="text-xs font-semibold text-[var(--vs-muted)]">
              Prop: {ev.proposals[0].status}
            </span>
          )}
          {ev.beos[0] && (
            <span className="text-xs font-semibold text-[var(--vs-muted)]">
              BEO: {ev.beos[0].status}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[ev.status] ?? "bg-gray-50 text-gray-600"}`}>
            {ev.status.replace(/_/g, " ")}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Events</h1>
        <p className="mt-1 text-[var(--vs-muted)]">All private events</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No events yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">Convert a lead into an event to get started.</p>
          <Link href="/app/leads" className="mt-4 inline-flex rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white">
            View leads
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">
                Upcoming ({upcoming.length})
              </h2>
              {upcoming.map((ev) => <EventRow key={ev.id} ev={ev} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[var(--vs-muted)]">
                Past ({past.length})
              </h2>
              {past.map((ev) => <EventRow key={ev.id} ev={ev} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
