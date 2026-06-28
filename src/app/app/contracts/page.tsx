import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-600",
  SENT: "bg-blue-50 text-blue-700",
  SIGNED: "bg-green-50 text-green-700",
  VOIDED: "bg-red-50 text-red-700",
};

export default async function VsContractsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const contracts = await prisma.vsContract.findMany({
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
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Contracts</h1>
        <p className="mt-1 text-[var(--vs-muted)]">{contracts.length} contracts</p>
      </div>

      {contracts.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No contracts yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">Generate contracts from individual event pages once a proposal is accepted.</p>
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
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Signed</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const name = c.privateEvent.lead?.customerName ?? c.privateEvent.vsCustomer?.name ?? "—";
                return (
                  <tr key={c.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--vs-text)]">{c.privateEvent.eventName}</p>
                      <p className="text-xs text-[var(--vs-muted)]">{name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[c.status] ?? ""}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">
                      {c.signedAt ? (
                        <span>{c.signerName} · {c.signedAt.toLocaleDateString()}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/app/contracts/${c.id}`} className="text-xs font-semibold text-[var(--vs-accent)] hover:underline">
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
