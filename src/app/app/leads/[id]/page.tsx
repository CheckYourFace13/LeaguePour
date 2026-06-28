import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { updateLeadStatus, createEventFromLead } from "@/lib/actions/vs";

const STATUSES = ["NEW", "CONTACTED", "PROPOSAL_SENT", "CONTRACT_SENT", "DEPOSIT_PENDING", "BOOKED", "COMPLETED", "LOST"];

export default async function VsLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const lead = await prisma.privateEventLead.findFirst({
    where: { id, venueId: access.venueId },
    include: { privateEvent: true },
  });
  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/app/leads" className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
            ← Leads
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-[var(--vs-text)]">
            {lead.customerName}
          </h1>
          <p className="mt-1 text-[var(--vs-muted)]">
            Received {lead.createdAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="mt-3 rounded-full bg-[var(--vs-surface-2)] border border-[var(--vs-border)] px-3 py-1 text-xs font-bold text-[var(--vs-muted)] uppercase tracking-wide">
          {lead.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-3">
        <h2 className="font-semibold text-[var(--vs-text)]">Contact info</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Email</p>
            <a href={`mailto:${lead.customerEmail}`} className="font-medium text-[var(--vs-accent)] hover:underline">
              {lead.customerEmail}
            </a>
          </div>
          {lead.customerPhone && (
            <div>
              <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Phone</p>
              <a href={`tel:${lead.customerPhone}`} className="font-medium text-[var(--vs-text)]">
                {lead.customerPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Event details */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-3">
        <h2 className="font-semibold text-[var(--vs-text)]">Event details</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Type</p>
            <p className="font-medium text-[var(--vs-text)]">{lead.eventType.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Preferred date</p>
            <p className="font-medium text-[var(--vs-text)]">
              {lead.preferredDate?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) ?? "TBD"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Guest count</p>
            <p className="font-medium text-[var(--vs-text)]">{lead.guestCount ?? "Not specified"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Budget</p>
            <p className="font-medium text-[var(--vs-text)]">{lead.budgetRange ?? "Not specified"}</p>
          </div>
        </div>
        {lead.notes && (
          <div>
            <p className="text-xs text-[var(--vs-muted)] uppercase tracking-wide mb-1">Notes from customer</p>
            <p className="text-[var(--vs-text-soft)] whitespace-pre-line">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-4">
        <h2 className="font-semibold text-[var(--vs-text)]">Actions</h2>

        {/* Convert to event */}
        {!lead.privateEvent ? (
          <form action={createEventFromLead.bind(null, lead.id)}>
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--vs-accent)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors"
            >
              Convert to event → create proposal
            </button>
          </form>
        ) : (
          <Link
            href={`/app/events/${lead.privateEvent.id}`}
            className="block text-center rounded-lg border border-[var(--vs-accent)] px-4 py-3 text-sm font-bold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            View event →
          </Link>
        )}

        {/* Update status */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--vs-text)]">Update pipeline status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.filter((s) => s !== lead.status).map((s) => (
              <form key={s} action={updateLeadStatus.bind(null, lead.id, s)}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-1 text-xs font-semibold text-[var(--vs-muted)] hover:border-[var(--vs-accent)] hover:text-[var(--vs-accent)] transition-colors"
                >
                  Move to {s.replace(/_/g, " ")}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Quick reply */}
        <div>
          <a
            href={`mailto:${lead.customerEmail}?subject=Re: Your private event inquiry&body=Hi ${lead.customerName},%0D%0A%0D%0AThank you for reaching out about your upcoming ${lead.eventType.toLowerCase().replace(/_/g, " ")}. We'd love to help you plan a great event.%0D%0A%0D%0ACould we schedule a quick call to go over the details?%0D%0A%0D%0ABest,%0D%0A`}
            className="block w-full text-center rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--vs-text)] hover:border-[var(--vs-accent)] transition-colors"
          >
            Reply by email ↗
          </a>
        </div>
      </div>
    </div>
  );
}
