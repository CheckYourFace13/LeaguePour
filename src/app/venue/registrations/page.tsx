import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { formatDateTime } from "@/lib/utils";
import { venueAppRoutes } from "@/lib/routes";
import {
  resolvePrimaryVenueAccess,
  venueStaffCanCreateAndPublish,
} from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { refundRegistrationPaymentFormAction } from "./actions";

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const { notice } = await searchParams;
  const canRefundTest = venueStaffCanCreateAndPublish(access.role);

  const rows = await prisma.competitionRegistration.findMany({
    where: { competition: { venueId: access.venueId } },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      user: { select: { name: true, email: true } },
      competition: { select: { title: true, slug: true, entryFeeCents: true } },
      payment: { select: { status: true, provider: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Registrations</h1>
        <p className="mt-3 max-w-2xl text-base text-lp-muted md:text-lg">
          Door-ready list: who is in, which competition, and payment state. Stripe-backed payments show live status
          from webhooks; legacy test-ledger rows are labeled separately.
        </p>
      </div>
      {notice === "refunded" ? (
        <div className="rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text">
          Registration cancelled and payment marked refunded (Stripe refunds also send a webhook for confirmation).
        </div>
      ) : null}
      {notice === "forbidden" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          Only owners or managers can issue refunds.
        </div>
      ) : null}
      {notice === "stripe_refund_failed" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          Stripe rejected the refund request — check the Stripe dashboard logs or try again.
        </div>
      ) : null}
      {notice === "unsupported_refund" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          This payment provider cannot be refunded from LeaguePour yet.
        </div>
      ) : null}
      {notice === "not-paid" || notice === "missing-pay" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          Refunds apply only after a payment shows as succeeded (Stripe or legacy test ledger).
        </div>
      ) : null}
      <FieldHelp title="Check-in tip">
        <p>
          Sort by competition at the door. Waivers and fees should match what players saw at signup
          — if something changed, message them before they arrive.
        </p>
      </FieldHelp>
      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1.4fr_1.1fr_1fr_1fr] gap-4 border-b border-lp-border bg-lp-surface-2/80 px-4 py-3 text-xs font-bold uppercase tracking-wider text-lp-muted md:grid">
          <span>Player</span>
          <span>Competition</span>
          <span>Signup</span>
          <span>Payment</span>
        </div>
        <ul>
          {rows.length === 0 ? (
            <li className="px-4 py-6 md:px-6">
              <EmptyState
                title="No signups to check in yet"
                description="Share the public competition link from each event — players land in this ledger as soon as they register."
                action={
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                      <Link href={venueAppRoutes.competitions}>Open competitions</Link>
                    </Button>
                    {canRefundTest ? (
                      <Button asChild variant="secondary" size="lg">
                        <Link href={venueAppRoutes.createCompetition}>Build an event</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="secondary" size="lg">
                        <Link href={venueAppRoutes.dashboard}>Back to dashboard</Link>
                      </Button>
                    )}
                  </div>
                }
              />
            </li>
          ) : (
            rows.map((r) => {
              const payPres = presentRegistrationPaymentFromRow(r, r.competition.entryFeeCents);
              return (
                <li
                  key={r.id}
                  className="border-b border-lp-border px-4 py-4 last:border-0 md:grid md:grid-cols-[1.4fr_1.1fr_1fr_1fr] md:items-start md:gap-4"
                >
                  <div>
                    <p className="font-medium">{r.user.name ?? "Player"}</p>
                    <p className="text-xs text-lp-muted">{r.user.email}</p>
                    <p className="mt-1 text-xs text-lp-muted md:hidden">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.competition.title}</p>
                    <p className="hidden text-xs text-lp-muted md:block">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 md:mt-0">
                    {r.roleLabel ? <Badge variant="accent">{r.roleLabel}</Badge> : null}
                    <Badge variant="muted">{r.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 md:mt-0">
                    <RegistrationPaymentBadge presentation={payPres} />
                    <p className="text-xs text-lp-muted">{payPres.description}</p>
                    {canRefundTest && (payPres.ui === "paid" || payPres.ui === "paid_placeholder") ? (
                      <form action={refundRegistrationPaymentFormAction}>
                        <input type="hidden" name="registrationId" value={r.id} />
                        <Button type="submit" variant="ghost" className="h-auto min-h-9 px-2 text-xs text-lp-muted">
                          {r.payment?.provider === "stripe" ? "Issue Stripe refund" : "Mark refunded (test ledger)"}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </Card>
    </div>
  );
}
