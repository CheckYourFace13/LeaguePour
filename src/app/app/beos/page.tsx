import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-600",
  NEEDS_REVIEW: "bg-orange-50 text-orange-700",
  FINAL: "bg-green-50 text-green-700",
  SENT: "bg-blue-50 text-blue-700",
};

export default async function VsBeosPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const beos = await prisma.vsBeo.findMany({
    where: { privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: {
        select: {
          id: true,
          eventName: true,
          eventDate: true,
          lead: { select: { customerName: true } },
          vsCustomer: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">BEOs</h1>
        <p className="mt-1 text-[var(--vs-muted)]">Banquet Event Orders · {beos.length} total</p>
      </div>

      {beos.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No BEOs yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">
            Create BEOs from individual event pages to coordinate food, beverage, and setup details.
          </p>
          <Link href="/app/events" className="mt-4 inline-flex rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white">
            View events
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Event</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Date</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {beos.map((b) => {
                const contactName = b.privateEvent.lead?.customerName ?? b.privateEvent.vsCustomer?.name ?? "—";
                return (
                  <tr key={b.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--vs-text)]">{b.privateEvent.eventName}</p>
                      <p className="text-xs text-[var(--vs-muted)]">{contactName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden sm:table-cell">
                      {b.privateEvent.eventDate.toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-3">
                      <Link href={`/app/beos/${b.id}/print`} className="text-xs text-[var(--vs-muted)] hover:text-[var(--vs-text)]">
                        Print
                      </Link>
                      <Link href={`/app/beos/${b.id}`} className="text-xs font-semibold text-[var(--vs-accent)] hover:underline">
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
