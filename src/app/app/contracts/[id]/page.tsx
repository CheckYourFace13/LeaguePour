import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { sendContract } from "@/lib/actions/vs";
import { TrackClick } from "@/components/analytics/track-click";

export default async function VsContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const contract = await prisma.vsContract.findFirst({
    where: { id, privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: { include: { lead: true, vsCustomer: true } },
    },
  });
  if (!contract) notFound();

  const event = contract.privateEvent;
  const customerName = event.lead?.customerName ?? event.vsCustomer?.name ?? "Customer";
  const customerEmail = event.lead?.customerEmail ?? event.vsCustomer?.email ?? "";
  const publicUrl = `${process.env.NEXTAUTH_URL ?? "https://leaguepour.com"}/sign/${contract.publicToken}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/app/events/${event.id}`} className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
          ← {event.eventName}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-[var(--vs-text)]">Contract</h1>
        <p className="mt-1 text-sm text-[var(--vs-muted)]">
          Status: <strong>{contract.status}</strong>
          {contract.signedAt && ` · Signed by ${contract.signerName} on ${contract.signedAt.toLocaleDateString()}`}
        </p>
      </div>

      {/* Signed confirmation */}
      {contract.status === "SIGNED" && (
        <div className="rounded-xl border border-[var(--vs-accent)]/30 bg-[color-mix(in_oklab,var(--vs-accent)_6%,transparent)] p-5">
          <p className="font-semibold text-[var(--vs-accent)]">Contract signed</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Signed by</p>
              <p className="font-medium text-[var(--vs-text)]">{contract.signerName}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Signature</p>
              <p className="font-medium text-[var(--vs-text)] italic">{contract.typedSignature}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--vs-muted)]">Date</p>
              <p className="font-medium text-[var(--vs-text)]">{contract.signedAt?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract text */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
        <div className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Contract text</p>
        </div>
        <pre className="px-5 py-4 text-sm text-[var(--vs-text-soft)] whitespace-pre-wrap leading-relaxed font-sans overflow-auto max-h-96">
          {contract.contractText}
        </pre>
      </div>

      {/* Share link */}
      {contract.status !== "DRAFT" && (
        <div className="rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface-2)] p-5">
          <p className="text-sm font-semibold text-[var(--vs-text)] mb-2">Customer signing link</p>
          <code className="block rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all">
            {publicUrl}
          </code>
          <p className="mt-2 text-xs text-[var(--vs-muted)]">
            Customers sign from this link — no account required. Their signature is recorded with timestamp and IP.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {contract.status === "DRAFT" && (
          <form action={sendContract.bind(null, contract.id)}>
            <TrackClick event="contract_sent" params={{ product: "vs", contractId: contract.id }}>
              <button type="submit" className="rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]">
                Activate for signing
              </button>
            </TrackClick>
          </form>
        )}
        {contract.status !== "DRAFT" && contract.status !== "SIGNED" && (
          <a
            href={`mailto:${customerEmail}?subject=Please sign your event contract&body=Hi ${customerName},%0D%0A%0D%0APlease review and sign your event contract at the link below:%0D%0A%0D%0A${publicUrl}%0D%0A%0D%0AThis only takes a moment on your phone.%0D%0A%0D%0AThank you!`}
            className="rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
          >
            Email signing link to customer
          </a>
        )}
        <Link
          href={`/app/events/${event.id}`}
          className="rounded-lg border border-[var(--vs-border)] px-5 py-2.5 text-sm font-semibold text-[var(--vs-muted)] hover:border-[var(--vs-accent)]"
        >
          Back to event
        </Link>
      </div>
    </div>
  );
}
