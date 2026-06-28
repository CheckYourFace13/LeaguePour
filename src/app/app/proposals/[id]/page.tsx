import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { sendProposal } from "@/lib/actions/vs";

export default async function VsProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const proposal = await prisma.vsProposal.findFirst({
    where: { id, privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: {
        include: { lead: true, vsCustomer: true },
      },
    },
  });
  if (!proposal) notFound();

  const event = proposal.privateEvent;
  const customerName = event.lead?.customerName ?? event.vsCustomer?.name ?? "Customer";
  const customerEmail = event.lead?.customerEmail ?? event.vsCustomer?.email ?? "";
  const lineItems = (proposal.lineItems as { description: string; qty: number; unitCents: number }[]) ?? [];
  const publicUrl = `${process.env.NEXTAUTH_URL ?? "https://leaguepour.com"}/proposal/${proposal.publicToken}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/app/events/${event.id}`} className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
          ← {event.eventName}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-[var(--vs-text)]">Proposal</h1>
        <p className="mt-1 text-sm text-[var(--vs-muted)]">
          Status: <strong>{proposal.status}</strong>
          {proposal.viewedAt && ` · Viewed ${proposal.viewedAt.toLocaleDateString()}`}
          {proposal.acceptedAt && ` · Accepted ${proposal.acceptedAt.toLocaleDateString()}`}
        </p>
      </div>

      {/* Proposal preview */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
        <div className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-4">
          <p className="font-bold text-[var(--vs-text)]">{event.eventName}</p>
          <p className="text-sm text-[var(--vs-muted)]">
            {event.eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {" · "}
            {event.startTime} – {event.endTime}
          </p>
          <p className="text-sm text-[var(--vs-muted)]">For: {customerName} &lt;{customerEmail}&gt;</p>
        </div>

        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vs-border)]">
                <th className="pb-2 text-left text-xs font-bold uppercase text-[var(--vs-muted)]">Item</th>
                <th className="pb-2 text-right text-xs font-bold uppercase text-[var(--vs-muted)]">Qty</th>
                <th className="pb-2 text-right text-xs font-bold uppercase text-[var(--vs-muted)]">Unit</th>
                <th className="pb-2 text-right text-xs font-bold uppercase text-[var(--vs-muted)]">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.roomFee > 0 && (
                <tr className="border-b border-[var(--vs-border)]/50">
                  <td className="py-2 text-[var(--vs-text)]">Room fee</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">1</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">${(proposal.roomFee / 100).toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-[var(--vs-text)]">${(proposal.roomFee / 100).toFixed(2)}</td>
                </tr>
              )}
              {proposal.minimumSpend > 0 && (
                <tr className="border-b border-[var(--vs-border)]/50">
                  <td className="py-2 text-[var(--vs-text)]">Food & beverage minimum</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">1</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">${(proposal.minimumSpend / 100).toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-[var(--vs-text)]">${(proposal.minimumSpend / 100).toFixed(2)}</td>
                </tr>
              )}
              {lineItems.map((li, i) => (
                <tr key={i} className="border-b border-[var(--vs-border)]/50">
                  <td className="py-2 text-[var(--vs-text)]">{li.description}</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">{li.qty}</td>
                  <td className="py-2 text-right text-[var(--vs-muted)]">${(li.unitCents / 100).toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-[var(--vs-text)]">${((li.qty * li.unitCents) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--vs-border)]">
                <td colSpan={3} className="pt-3 font-bold text-[var(--vs-text)]">Total</td>
                <td className="pt-3 text-right font-bold text-[var(--vs-text)]">${(proposal.totalAmount / 100).toFixed(2)}</td>
              </tr>
              {proposal.depositAmount > 0 && (
                <tr>
                  <td colSpan={3} className="pt-1 text-sm text-[var(--vs-muted)]">Deposit due now</td>
                  <td className="pt-1 text-right text-sm font-semibold text-[var(--vs-accent)]">${(proposal.depositAmount / 100).toFixed(2)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Share link */}
      {proposal.status !== "DRAFT" && (
        <div className="rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface-2)] p-5">
          <p className="text-sm font-semibold text-[var(--vs-text)] mb-2">Customer link</p>
          <code className="block rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all">
            {publicUrl}
          </code>
          <p className="mt-2 text-xs text-[var(--vs-muted)]">
            Share this link with the customer. They can review and accept the proposal online.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {proposal.status === "DRAFT" && (
          <form action={sendProposal.bind(null, proposal.id)}>
            <button type="submit" className="rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]">
              Send to customer
            </button>
          </form>
        )}
        {proposal.status !== "DRAFT" && (
          <a
            href={`mailto:${customerEmail}?subject=Your event proposal&body=Hi ${customerName},%0D%0A%0D%0AHere is your event proposal. Please review and accept at the link below:%0D%0A%0D%0A${publicUrl}%0D%0A%0D%0ALet me know if you have any questions.`}
            className="rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
          >
            Email link to customer
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
