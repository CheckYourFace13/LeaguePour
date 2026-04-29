import Link from "next/link";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FieldHelp } from "@/components/forms/field-help";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import { prisma } from "@/lib/db";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { playerAppRoutes } from "@/lib/routes";

export default async function PlayerPaymentsPage() {
  const session = await auth();
  const rows = await prisma.competitionRegistration.findMany({
    where: { userId: session!.user.id, paymentId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      payment: true,
      competition: {
        select: {
          title: true,
          slug: true,
          entryFeeCents: true,
          venue: { select: { slug: true, name: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Payments / history</h1>
        <p className="mt-3 max-w-2xl text-base text-lp-muted md:text-lg">
          Each row is a registration with a payment record. Stripe-backed rows reflect card payments processed by Stripe;
          older “test ledger” rows are labeled honestly if they still exist.
        </p>
      </div>
      <FieldHelp title="How to read this screen">
        <p>
          For Stripe payments, status comes from webhooks after checkout succeeds. Venue refunds use Stripe’s refund API
          for live rows; legacy test-ledger rows show separate labels.
        </p>
      </FieldHelp>

      {rows.length === 0 ? (
        <EmptyState
          title="No payment rows yet"
          description="Join an event with a listed entry fee — after you complete Stripe Checkout, the payment appears here with live status."
          action={
            <Button asChild size="lg">
              <Link href={playerAppRoutes.discover}>Discover competitions</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {rows.filter((r) => r.payment).map((r) => {
            const p = r.payment!;
            const comp = r.competition;
            const href = `/c/${comp.venue.slug}/${comp.slug}`;
            const payPres = presentRegistrationPaymentFromRow(r, comp.entryFeeCents);
            return (
              <li key={r.id}>
                <Card className="p-5 md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-lp-text">{comp.title}</p>
                      <p className="text-sm text-lp-muted">{comp.venue.name}</p>
                      <p className="mt-2 text-sm text-lp-muted">{formatDateTime(p.createdAt)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold tabular-nums text-lp-text">{formatMoney(p.amountCents, p.currency)}</p>
                      <div className="mt-2 flex justify-start sm:justify-end">
                        <RegistrationPaymentBadge presentation={payPres} />
                      </div>
                      <p className="mt-2 text-xs text-lp-muted">{payPres.description}</p>
                      <p className="mt-1 text-xs text-lp-muted">Provider: {p.provider}</p>
                    </div>
                  </div>
                  <Link
                    href={href}
                    className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-lp-accent hover:underline"
                  >
                    View event →
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
