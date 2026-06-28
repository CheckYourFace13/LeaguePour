import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-600",
  SENT: "bg-blue-50 text-blue-700",
  VIEWED: "bg-purple-50 text-purple-700",
  ACCEPTED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  EXPIRED: "bg-orange-50 text-orange-700",
};

export default async function VsProposalsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const proposals = await prisma.vsProposal.findMany({
    where: { privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: {
        include: { lead: true, vsCustomer: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Proposals</h1>
        <p className="mt-1 text-[var(--vs-muted)]">{proposals.length} proposals</p>
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No proposals yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">Create proposals from individual event pages.</p>
          <Link href="/app/events" className="mt-4 inline-flex rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white">
            View events
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Event / customer</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Total</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Sent</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const name = p.privateEvent.lead?.customerName ?? p.privateEvent.vsCustomer?.name ?? "—";
                return (
                  <tr key={p.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--vs-text)]">{p.privateEvent.eventName}</p>
                      <p className="text-xs text-[var(--vs-muted)]">{name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-[var(--vs-text)] hidden sm:table-cell">
                      ${(p.totalAmount / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] ?? ""}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">
                      {p.acceptedAt?.toLocaleDateString() ?? p.status === "DRAFT" ? "Draft" : "Sent"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/app/proposals/${p.id}`} className="text-xs font-semibold text-[var(--vs-accent)] hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
