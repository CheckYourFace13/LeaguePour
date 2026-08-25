import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SignContractForm from "./sign-form";

// Token-gated contract-signing page - never indexable, regardless of who links to it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PublicSignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const contract = await prisma.vsContract.findUnique({
    where: { publicToken: token },
    include: {
      privateEvent: {
        include: {
          lead: true,
          vsCustomer: true,
          venue: { select: { name: true, city: true } },
        },
      },
    },
  });

  if (!contract) notFound();

  const event = contract.privateEvent;
  const venueName = event.venue.name;
  const isSigned = contract.status === "SIGNED";

  return (
    <div className="min-h-screen bg-[var(--vs-bg)] px-4 py-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-1">
            Private event contract
          </p>
          <h1 className="font-display text-2xl font-extrabold text-[var(--vs-text)]">{venueName}</h1>
          <p className="mt-1 text-[var(--vs-muted)]">{event.venue.city}</p>
        </div>

        {/* Signed banner */}
        {isSigned && (
          <div className="mb-6 rounded-xl border border-[var(--vs-accent)]/30 bg-[color-mix(in_oklab,var(--vs-accent)_6%,transparent)] p-5 text-center">
            <p className="font-bold text-[var(--vs-accent)] text-lg">Contract signed!</p>
            <p className="text-sm text-[var(--vs-text-soft)] mt-1">
              Signed by <strong>{contract.signerName}</strong> on{" "}
              {contract.signedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            </p>
            <p className="text-sm text-[var(--vs-muted)] mt-2">
              {venueName} will be in touch about your deposit to finalize the booking.
            </p>
          </div>
        )}

        {/* Event summary */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-3">Event details</p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Event</p>
              <p className="font-semibold text-[var(--vs-text)]">{event.eventName}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Date</p>
              <p className="font-semibold text-[var(--vs-text)]">
                {event.eventDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Time</p>
              <p className="font-semibold text-[var(--vs-text)]">{event.startTime} – {event.endTime}</p>
            </div>
            {event.guestCountEstimated && (
              <div>
                <p className="text-xs text-[var(--vs-muted)]">Est. guests</p>
                <p className="font-semibold text-[var(--vs-text)]">{event.guestCountEstimated}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contract text */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden mb-6">
          <div className="bg-[var(--vs-surface-2)] px-5 py-3 border-b border-[var(--vs-border)]">
            <p className="text-sm font-bold text-[var(--vs-text)]">Contract agreement</p>
          </div>
          <div className="px-5 py-4 max-h-96 overflow-y-auto">
            <pre className="text-xs text-[var(--vs-text)] whitespace-pre-wrap font-sans leading-relaxed">
              {contract.contractText}
            </pre>
          </div>
        </div>

        {/* Sign form */}
        {!isSigned ? (
          <SignContractForm token={token} venueName={venueName} />
        ) : (
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] p-5 text-sm text-[var(--vs-text-soft)] text-center">
            This contract has already been signed and is locked.
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[var(--vs-muted)]">
          Powered by <span className="font-semibold">VenueSprocket</span>
        </p>
      </div>
    </div>
  );
}
