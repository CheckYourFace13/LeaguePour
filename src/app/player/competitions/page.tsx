import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { formatDate, formatMoney } from "@/lib/utils";
import { playerAppRoutes } from "@/lib/routes";

export default async function PlayerCompetitionsPage() {
  const session = await auth();
  const uid = session!.user.id;

  const regs = await prisma.competitionRegistration.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { status: true, provider: true } },
      competition: { include: { venue: { select: { name: true, slug: true } } } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="lp-page-title text-3xl md:text-4xl">My competitions</h1>
          <p className="mt-2 max-w-2xl text-base text-lp-muted md:text-lg">
            Listed fees are what the venue published. Checkout runs on Stripe; LeaguePour shows status from Stripe and
            your registration.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={playerAppRoutes.discover}>Discover more</Link>
        </Button>
      </div>
      {regs.length === 0 ? (
        <EmptyState
          title="You have not joined an event yet"
          description="Browse venues running blind draws, leagues, and one-night brackets. Favorite a room to hear when signup opens."
          action={
            <Button asChild size="lg">
              <Link href={playerAppRoutes.discover}>Find competitions</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {regs.map((r) => {
            const payPres = presentRegistrationPaymentFromRow(r, r.competition.entryFeeCents);
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs text-lp-muted">{r.competition.venue.name}</p>
                      <p className="font-display text-lg font-semibold">{r.competition.title}</p>
                      <p className="mt-1 text-sm text-lp-muted">
                        Starts {formatDate(r.competition.startAt)} · Listed fee{" "}
                        {formatMoney(r.competition.entryFeeCents, r.competition.entryFeeCurrency)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.roleLabel ? <Badge variant="accent">{r.roleLabel}</Badge> : null}
                      <Badge variant="muted">{r.status.replaceAll("_", " ")}</Badge>
                      <RegistrationPaymentBadge presentation={payPres} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-lp-muted">{payPres.description}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {r.status === RegistrationStatus.PENDING_PAYMENT ? (
                      <Button size="lg" className="w-full sm:w-auto" asChild>
                        <Link href={`/player/pay/${r.id}`}>Finish Stripe checkout</Link>
                      </Button>
                    ) : null}
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                      <Link href={`/c/${r.competition.venue.slug}/${r.competition.slug}`}>Open public page</Link>
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
