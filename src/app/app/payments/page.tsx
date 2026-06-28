import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-700",
  PAID: "bg-green-50 text-green-700",
  REFUNDED: "bg-gray-50 text-gray-600",
  FAILED: "bg-red-50 text-red-600",
};

export default async function VsPaymentsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const payments = await prisma.vsPayment.findMany({
    where: { venueId: access.venueId },
    include: {
      privateEvent: {
        include: { lead: true, vsCustomer: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amountCents, 0);
  const totalPending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Payments</h1>
        <p className="mt-1 text-[var(--vs-muted)]">Deposits and event payments</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Collected</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-[var(--vs-accent)]">
            ${(totalPaid / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Pending</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-[var(--vs-warning)]">
            ${(totalPending / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No payments yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">Deposits are created when customers sign contracts and pay online.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Event</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Type</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const name = p.privateEvent.lead?.customerName ?? p.privateEvent.vsCustomer?.name ?? "—";
                return (
                  <tr key={p.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5">
                      <Link href={`/app/events/${p.privateEventId}`} className="font-semibold text-[var(--vs-text)] hover:text-[var(--vs-accent)]">
                        {p.privateEvent.eventName}
                      </Link>
                      <p className="text-xs text-[var(--vs-muted)]">{name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] capitalize hidden sm:table-cell">{p.type}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-[var(--vs-text)]">
                      ${(p.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] ?? ""}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">
                      {(p.paidAt ?? p.createdAt).toLocaleDateString()}
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
