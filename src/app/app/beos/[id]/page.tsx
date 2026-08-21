import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { saveBeo } from "@/lib/actions/vs";
import { TrackView } from "@/components/analytics/track-view";

export default async function VsBeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const beo = await prisma.vsBeo.findFirst({
    where: { id, privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: {
        include: { lead: true, vsCustomer: true, eventSpace: true },
      },
    },
  });
  if (!beo) notFound();

  const event = beo.privateEvent;
  const customerName = event.lead?.customerName ?? event.vsCustomer?.name ?? "";
  const customerEmail = event.lead?.customerEmail ?? event.vsCustomer?.email ?? "";
  const customerPhone = event.lead?.customerPhone ?? event.vsCustomer?.phone ?? "";
  const contact = beo.contactInfo as { name?: string; email?: string; phone?: string } | null;

  function Field({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string | null; rows?: number }) {
    return (
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--vs-muted)] mb-1">{label}</label>
        {rows ? (
          <textarea
            name={name}
            defaultValue={defaultValue ?? ""}
            rows={rows}
            className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2 text-sm text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none"
          />
        ) : (
          <input
            type="text"
            name={name}
            defaultValue={defaultValue ?? ""}
            className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2 text-sm text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {created === "1" ? (
        <TrackView event="beo_created" params={{ product: "vs", beoId: beo.id }} />
      ) : null}
      <div>
        <Link href={`/app/events/${event.id}`} className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
          ← {event.eventName}
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[var(--vs-text)]">
              BEO — Banquet Event Order
            </h1>
            <p className="mt-1 text-sm text-[var(--vs-muted)]">
              Status: <strong>{beo.status}</strong>
              {beo.finalizedAt && ` · Finalized ${beo.finalizedAt.toLocaleDateString()}`}
            </p>
          </div>
          {beo.status === "FINAL" && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              FINAL
            </span>
          )}
        </div>
      </div>

      {/* Event summary (read-only) */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--vs-muted)] mb-3">Event summary</p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-[var(--vs-muted)]">Event: </span><strong>{event.eventName}</strong></div>
          <div><span className="text-[var(--vs-muted)]">Type: </span>{event.eventType.replace(/_/g, " ")}</div>
          <div><span className="text-[var(--vs-muted)]">Date: </span><strong>{event.eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong></div>
          <div><span className="text-[var(--vs-muted)]">Time: </span>{event.startTime} – {event.endTime}</div>
          {event.setupTime && <div><span className="text-[var(--vs-muted)]">Setup: </span>{event.setupTime}</div>}
          <div><span className="text-[var(--vs-muted)]">Est. guests: </span>{event.guestCountEstimated ?? "TBD"}</div>
          {event.eventSpace && <div><span className="text-[var(--vs-muted)]">Room: </span>{event.eventSpace.name}</div>}
        </div>
        <div className="mt-3 border-t border-[var(--vs-border)] pt-3 text-sm">
          <p className="text-[var(--vs-muted)] text-xs font-bold uppercase tracking-wide mb-1">Contact</p>
          <p>{contact?.name ?? customerName}</p>
          {(contact?.email ?? customerEmail) && <p className="text-[var(--vs-muted)]">{contact?.email ?? customerEmail}</p>}
          {(contact?.phone ?? customerPhone) && <p className="text-[var(--vs-muted)]">{contact?.phone ?? customerPhone}</p>}
        </div>
      </div>

      {/* Editable BEO fields */}
      <form action={saveBeo.bind(null, beo.id)}>
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--vs-muted)]">Event details</p>
          <Field label="Room setup & layout" name="roomSetup" defaultValue={beo.roomSetup} rows={3} />
          <Field label="Food details" name="foodDetails" defaultValue={beo.foodDetails} rows={4} />
          <Field label="Beverage details" name="beverageDetails" defaultValue={beo.beverageDetails} rows={3} />
          <Field label="Staffing notes" name="staffingNotes" defaultValue={beo.staffingNotes} rows={2} />
          <Field label="AV / tech needs" name="avNeeds" defaultValue={beo.avNeeds} rows={2} />
          <Field label="Allergies & dietary restrictions" name="allergies" defaultValue={beo.allergies} rows={2} />
          <Field label="Special instructions" name="specialInstructions" defaultValue={beo.specialInstructions} rows={3} />
          <Field label="Internal notes (staff only)" name="internalNotes" defaultValue={beo.internalNotes} rows={3} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            name="status"
            value="NEEDS_REVIEW"
            className="rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-5 py-2.5 text-sm font-bold text-[var(--vs-text)] hover:border-[var(--vs-accent)]"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="status"
            value="FINAL"
            className="rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
          >
            Save & finalize BEO
          </button>
        </div>
      </form>

      {/* Print / share */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`/app/beos/${beo.id}/print`}
          target="_blank"
          className="rounded-lg border border-[var(--vs-border)] px-4 py-2 text-sm font-semibold text-[var(--vs-muted)] hover:border-[var(--vs-accent)] hover:text-[var(--vs-accent)]"
        >
          Print / PDF ↗
        </a>
      </div>
    </div>
  );
}
