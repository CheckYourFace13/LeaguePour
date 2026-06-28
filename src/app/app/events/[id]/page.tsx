import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { createProposal, createContract, createBeo } from "@/lib/actions/vs";

export default async function VsEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const event = await prisma.privateEvent.findFirst({
    where: { id, venueId: access.venueId },
    include: {
      lead: true,
      vsCustomer: true,
      proposals: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      beos: { orderBy: { createdAt: "desc" } },
      vsPayments: { orderBy: { createdAt: "desc" } },
      eventSpace: true,
    },
  });
  if (!event) notFound();

  const latestProposal = event.proposals[0];
  const latestContract = event.contracts[0];
  const latestBeo = event.beos[0];
  const customerName = event.lead?.customerName ?? event.vsCustomer?.name ?? "Customer";
  const customerEmail = event.lead?.customerEmail ?? event.vsCustomer?.email ?? "";

  function Step({
    n, title, done, href, children,
  }: {
    n: string; title: string; done?: boolean; href?: string; children?: React.ReactNode;
  }) {
    return (
      <div className={`rounded-xl border p-5 ${done ? "border-[var(--vs-accent)]/40 bg-[color-mix(in_oklab,var(--vs-accent)_4%,transparent)]" : "border-[var(--vs-border)] bg-[var(--vs-surface)]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-[var(--vs-accent)] text-white" : "bg-[var(--vs-surface-2)] text-[var(--vs-muted)]"}`}>
              {done ? "✓" : n}
            </span>
            <p className={`font-semibold ${done ? "text-[var(--vs-accent)]" : "text-[var(--vs-text)]"}`}>{title}</p>
          </div>
          {href && (
            <Link href={href} className="shrink-0 text-sm font-semibold text-[var(--vs-accent)] hover:underline">
              View →
            </Link>
          )}
        </div>
        {children && <div className="mt-3 pl-10">{children}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/app/events" className="text-sm text-[var(--vs-muted)] hover:text-[var(--vs-accent)]">
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[var(--vs-text)]">
          {event.eventName}
        </h1>
        <p className="mt-1 text-[var(--vs-muted)]">
          {event.eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          {" · "}
          {event.startTime} – {event.endTime}
          {event.guestCountEstimated ? ` · ~${event.guestCountEstimated} guests` : ""}
        </p>
      </div>

      {/* Customer */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-3">Customer</p>
        <p className="font-semibold text-[var(--vs-text)]">{customerName}</p>
        <a href={`mailto:${customerEmail}`} className="text-sm text-[var(--vs-accent)] hover:underline">
          {customerEmail}
        </a>
        {(event.lead?.customerPhone ?? event.vsCustomer?.phone) && (
          <p className="text-sm text-[var(--vs-muted)] mt-0.5">
            {event.lead?.customerPhone ?? event.vsCustomer?.phone}
          </p>
        )}
      </div>

      {/* Workflow steps */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Event workflow</h2>

        {/* Step 1: Proposal */}
        <Step n="1" title="Proposal" done={!!latestProposal} href={latestProposal ? `/app/proposals/${latestProposal.id}` : undefined}>
          {!latestProposal ? (
            <form action={createProposal.bind(null, event.id)}>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-[var(--vs-muted)]">Room fee ($)</label>
                    <input name="roomFee" type="number" step="0.01" defaultValue="0" className="mt-1 w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vs-muted)]">Food/bev minimum ($)</label>
                    <input name="minimumSpend" type="number" step="0.01" defaultValue="0" className="mt-1 w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vs-muted)]">Deposit amount ($)</label>
                    <input name="depositAmount" type="number" step="0.01" defaultValue="250" className="mt-1 w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2 text-sm" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]">
                  Create proposal →
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-[var(--vs-text-soft)]">
              Status: <strong>{latestProposal.status}</strong>
              {latestProposal.totalAmount > 0 && ` · Total: $${(latestProposal.totalAmount / 100).toFixed(2)}`}
              {latestProposal.acceptedAt && " · Accepted ✓"}
            </p>
          )}
        </Step>

        {/* Step 2: Contract */}
        <Step n="2" title="Contract" done={latestContract?.status === "SIGNED"} href={latestContract ? `/app/contracts/${latestContract.id}` : undefined}>
          {!latestContract ? (
            latestProposal ? (
              <form action={createContract.bind(null, event.id, latestProposal.id)}>
                <button type="submit" className="rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]">
                  Generate contract →
                </button>
              </form>
            ) : (
              <p className="text-sm text-[var(--vs-muted)]">Create a proposal first.</p>
            )
          ) : (
            <p className="text-sm text-[var(--vs-text-soft)]">
              Status: <strong>{latestContract.status}</strong>
              {latestContract.signedAt && ` · Signed ${latestContract.signedAt.toLocaleDateString()}`}
            </p>
          )}
        </Step>

        {/* Step 3: Deposit */}
        <Step n="3" title="Deposit" done={event.vsPayments.some((p) => p.status === "PAID")}>
          {event.vsPayments.length === 0 ? (
            <p className="text-sm text-[var(--vs-muted)]">
              {latestContract?.status === "SIGNED"
                ? "The customer receives a payment link after signing."
                : "Contract must be signed before deposit is due."}
            </p>
          ) : (
            <div className="space-y-1">
              {event.vsPayments.map((p) => (
                <p key={p.id} className="text-sm text-[var(--vs-text-soft)]">
                  ${(p.amountCents / 100).toFixed(2)} — <strong>{p.status}</strong>
                  {p.paidAt && ` · Paid ${p.paidAt.toLocaleDateString()}`}
                </p>
              ))}
            </div>
          )}
        </Step>

        {/* Step 4: BEO */}
        <Step n="4" title="BEO" done={latestBeo?.status === "FINAL"} href={latestBeo ? `/app/beos/${latestBeo.id}` : undefined}>
          {!latestBeo ? (
            <form action={createBeo.bind(null, event.id)}>
              <button type="submit" className="rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]">
                Create BEO →
              </button>
            </form>
          ) : (
            <p className="text-sm text-[var(--vs-text-soft)]">
              Status: <strong>{latestBeo.status}</strong>
              {latestBeo.finalizedAt && ` · Finalized ${latestBeo.finalizedAt.toLocaleDateString()}`}
            </p>
          )}
        </Step>
      </div>
    </div>
  );
}
