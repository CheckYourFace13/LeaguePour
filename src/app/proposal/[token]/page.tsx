import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { acceptProposal, markProposalViewed } from "@/lib/actions/vs";

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const proposal = await prisma.vsProposal.findUnique({
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

  if (!proposal) notFound();

  // Mark as viewed (fire and forget)
  if (!proposal.viewedAt) {
    void markProposalViewed(token);
  }

  const event = proposal.privateEvent;
  const venueName = event.venue.name;
  const customerName = event.lead?.customerName ?? event.vsCustomer?.name ?? "";
  const lineItems = (proposal.lineItems as { description: string; qty: number; unitCents: number }[]) ?? [];
  const isAccepted = proposal.status === "ACCEPTED";

  return (
    <div className="min-h-screen bg-[var(--vs-bg)] px-4 py-12">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-1">
            Private event proposal
          </p>
          <h1 className="font-display text-2xl font-extrabold text-[var(--vs-text)]">{venueName}</h1>
          <p className="mt-1 text-[var(--vs-muted)]">{event.venue.city}</p>
        </div>

        {/* Accepted banner */}
        {isAccepted && (
          <div className="mb-6 rounded-xl border border-[var(--vs-accent)]/30 bg-[color-mix(in_oklab,var(--vs-accent)_6%,transparent)] p-5 text-center">
            <p className="font-bold text-[var(--vs-accent)] text-lg">Proposal accepted!</p>
            <p className="text-sm text-[var(--vs-text-soft)] mt-1">
              {venueName} will be in touch shortly with your contract.
            </p>
          </div>
        )}

        {/* Proposal card */}
        <div className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
          <div className="bg-[var(--vs-surface-2)] px-6 py-5 border-b border-[var(--vs-border)]">
            <h2 className="font-display text-xl font-bold text-[var(--vs-text)]">{event.eventName}</h2>
            <p className="text-sm text-[var(--vs-muted)] mt-1">
              {event.eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {" · "}
              {event.startTime} – {event.endTime}
              {event.guestCountEstimated ? ` · ~${event.guestCountEstimated} guests` : ""}
            </p>
            {customerName && <p className="text-sm text-[var(--vs-muted)]">Prepared for: {customerName}</p>}
          </div>

          <div className="px-6 py-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--vs-border)]">
                  <th className="pb-3 text-left text-xs font-bold uppercase text-[var(--vs-muted)]">Item</th>
                  <th className="pb-3 text-right text-xs font-bold uppercase text-[var(--vs-muted)]">Qty</th>
                  <th className="pb-3 text-right text-xs font-bold uppercase text-[var(--vs-muted)]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.roomFee > 0 && (
                  <tr className="border-b border-[var(--vs-border)]/40">
                    <td className="py-3 text-[var(--vs-text)]">Room fee</td>
                    <td className="py-3 text-right text-[var(--vs-muted)]">1</td>
                    <td className="py-3 text-right font-medium text-[var(--vs-text)]">${(proposal.roomFee / 100).toFixed(2)}</td>
                  </tr>
                )}
                {proposal.minimumSpend > 0 && (
                  <tr className="border-b border-[var(--vs-border)]/40">
                    <td className="py-3 text-[var(--vs-text)]">Food & beverage minimum</td>
                    <td className="py-3 text-right text-[var(--vs-muted)]">1</td>
                    <td className="py-3 text-right font-medium text-[var(--vs-text)]">${(proposal.minimumSpend / 100).toFixed(2)}</td>
                  </tr>
                )}
                {lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-[var(--vs-border)]/40">
                    <td className="py-3 text-[var(--vs-text)]">{li.description}</td>
                    <td className="py-3 text-right text-[var(--vs-muted)]">{li.qty}</td>
                    <td className="py-3 text-right font-medium text-[var(--vs-text)]">${((li.qty * li.unitCents) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--vs-border)]">
                  <td colSpan={2} className="pt-4 font-bold text-[var(--vs-text)]">Estimated total</td>
                  <td className="pt-4 text-right font-bold text-[var(--vs-text)]">${(proposal.totalAmount / 100).toFixed(2)}</td>
                </tr>
                {proposal.depositAmount > 0 && (
                  <tr>
                    <td colSpan={2} className="pt-2 text-sm text-[var(--vs-muted)]">Deposit to reserve date</td>
                    <td className="pt-2 text-right font-bold text-[var(--vs-accent)]">${(proposal.depositAmount / 100).toFixed(2)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>

        {/* Accept action */}
        {!isAccepted && (
          <div className="mt-6 space-y-4">
            <form
              action={async () => {
                "use server";
                await acceptProposal(token);
              }}
            >
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--vs-accent)] py-4 text-base font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors"
              >
                Accept this proposal
              </button>
            </form>
            <p className="text-center text-xs text-[var(--vs-muted)]">
              Accepting this proposal lets {venueName} know you're interested. A contract will follow.
            </p>
          </div>
        )}

        {isAccepted && (
          <p className="mt-6 text-center text-sm text-[var(--vs-muted)]">
            Accepted {proposal.acceptedAt?.toLocaleDateString()}. Watch your email for the contract.
          </p>
        )}

        <p className="mt-8 text-center text-xs text-[var(--vs-muted)]">
          Powered by <span className="font-semibold">VenueSprocket</span>
        </p>
      </div>
    </div>
  );
}
