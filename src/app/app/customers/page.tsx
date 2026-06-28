import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function VsCustomersPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const [customers, leads] = await Promise.all([
    prisma.vsCustomer.findMany({
      where: { venueId: access.venueId },
      include: { _count: { select: { privateEvents: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.privateEventLead.findMany({
      where: { venueId: access.venueId },
      select: { customerName: true, customerEmail: true, customerPhone: true, createdAt: true, eventType: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  // Merge customers and leads into one contact list (deduplicated by email)
  const emailSet = new Set(customers.map((c) => c.email));
  const leadContacts = leads.filter((l) => !emailSet.has(l.customerEmail));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Customers</h1>
        <p className="mt-1 text-[var(--vs-muted)]">
          {customers.length} customers · {leadContacts.length} additional contacts from leads
        </p>
      </div>

      {/* Customers with events */}
      {customers.length > 0 && (
        <div>
          <h2 className="font-semibold text-[var(--vs-text)] mb-3">Event customers</h2>
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Events</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--vs-text)]">{c.name}</p>
                      {c.company && <p className="text-xs text-[var(--vs-muted)]">{c.company}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <a href={`mailto:${c.email}`} className="text-[var(--vs-accent)] hover:underline">{c.email}</a>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)] hidden md:table-cell">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)]">{c._count.privateEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead contacts */}
      {leadContacts.length > 0 && (
        <div>
          <h2 className="font-semibold text-[var(--vs-text)] mb-3">Inquiry contacts</h2>
          <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-surface-2)]">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Event type</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {leadContacts.map((l, i) => (
                  <tr key={i} className="border-b border-[var(--vs-border)]/50 last:border-0 hover:bg-[var(--vs-surface-2)]">
                    <td className="px-5 py-3.5 font-medium text-[var(--vs-text)]">{l.customerName}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <a href={`mailto:${l.customerEmail}`} className="text-[var(--vs-accent)] hover:underline">{l.customerEmail}</a>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)]">{l.eventType.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3.5 text-[var(--vs-muted)]">{l.status.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {customers.length === 0 && leadContacts.length === 0 && (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--vs-text)]">No contacts yet</p>
          <p className="mt-2 text-[var(--vs-muted)]">Contacts are created automatically when customers submit inquiries.</p>
          <Link href="/app/leads" className="mt-4 inline-flex rounded-lg bg-[var(--vs-accent)] px-5 py-2.5 text-sm font-bold text-white">
            View leads
          </Link>
        </div>
      )}
    </div>
  );
}
