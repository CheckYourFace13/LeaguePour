import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { VsRefundButton } from "@/components/venuesprocket/vs-refund-button";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-700",
  PAID: "bg-green-50 text-green-700",
  REFUNDED: "bg-gray-50 text-gray-600",
  FAILED: "bg-red-50 text-red-600",
};

const NOTICES: Record<string, { text: string; tone: "ok" | "err" }> = {
  refunded: { text: "Deposit refunded. The customer has been emailed a confirmation.", tone: "ok" },
  "refund-already": { text: "That deposit was already refunded.", tone: "err" },
  "refund-not-paid": { text: "Only a paid deposit can be refunded.", tone: "err" },
  "refund-not-found": { text: "That payment could not be found for your venue.", tone: "err" },
  "refund-forbidden": { text: "You need an owner or manager role to issue refunds.", tone: "err" },
  "refund-no-charge": { text: "No Stripe charge is linked to that deposit yet.", tone: "err" },
  "refund-no-connect": { text: "This venue's Stripe account isn't connected.", tone: "err" },
  "refund-failed": { text: "The refund could not be completed with Stripe - nothing was changed. Try again, or contact support if it keeps happening.", tone: "err" },
  "refund-invalid": { text: "Refund request was missing required information.", tone: "err" },
};

export default async function VsPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const params = searchParams ? await searchParams : {};
  const noticeKey = typeof params.notice === "string" ? params.notice : "";
  const notice = NOTICES[noticeKey];
  const canRefund = venueStaffCanCreateAndPublish(access.role);

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

      {notice ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.tone === "ok"
              ? "border-green-600/30 bg-green-50 text-green-800"
              : "border-red-600/30 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

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
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Action</th>
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
                    <td className="px-5 py-3.5 text-right">
                      {p.status === "PAID" && p.type === "deposit" && canRefund ? (
                        <div className="flex justify-end">
                          <VsRefundButton
                            vsPaymentId={p.id}
                            amountLabel={`$${(p.amountCents / 100).toFixed(2)}`}
                          />
                        </div>
                      ) : p.status === "REFUNDED" ? (
                        <span className="text-xs text-[var(--vs-muted)]">Refunded</span>
                      ) : (
                        <span className="text-xs text-[var(--vs-muted)]">—</span>
                      )}
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
