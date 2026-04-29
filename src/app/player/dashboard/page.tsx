import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import { prisma } from "@/lib/db";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { formatDate } from "@/lib/utils";
import { playerAppRoutes } from "@/lib/routes";

export default async function PlayerDashboardPage() {
  const session = await auth();
  const uid = session!.user.id;

  const [regCount, follows, regs] = await Promise.all([
    prisma.competitionRegistration.count({ where: { userId: uid } }),
    prisma.venueFollow.count({ where: { userId: uid } }),
    prisma.competitionRegistration.findMany({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        payment: { select: { status: true, provider: true } },
        competition: { include: { venue: { select: { name: true, slug: true } } } },
      },
    }),
  ]);

  return (
    <div className="space-y-10 md:space-y-12">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Player dashboard</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-lp-muted md:text-lg">
          Where you are on the sheet — registrations, follows, and the next public page to open.
        </p>
      </div>

      <div className="rounded-2xl border border-lp-border bg-lp-surface/40 p-5 md:p-6">
        <p className="lp-kicker">Player shortcuts</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={playerAppRoutes.competitions}>My competitions</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={playerAppRoutes.payments}>Payments / history</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={playerAppRoutes.venues}>Favorite venues</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={playerAppRoutes.preferences}>Preferences</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Card>
          <p className="lp-kicker">Registrations on file</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {regCount}
          </p>
          <p className="mt-2 text-sm text-lp-muted">
            Every row is a night you joined — paid entries use Stripe; legacy test-ledger rows are labeled in the app.
          </p>
        </Card>
        <Card>
          <p className="lp-kicker">Venues followed</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {follows}
          </p>
        </Card>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="lp-page-title text-xl md:text-2xl">Recent activity</h2>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href={playerAppRoutes.discover}>Discover more</Link>
        </Button>
      </div>
      <div className="grid gap-5">
        {regs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No sheets yet</CardTitle>
              <CardDescription>
                Pick a room you trust, follow them, and grab the next blind draw or league night — everything shows up
                here once you register.
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={playerAppRoutes.discover}>Discover competitions</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href={playerAppRoutes.venues}>Favorite venues</Link>
              </Button>
            </div>
          </Card>
        ) : (
          regs.map((r) => {
            const payPres = presentRegistrationPaymentFromRow(r, r.competition.entryFeeCents);
            return (
              <Card key={r.id}>
                <p className="lp-kicker">{r.competition.venue.name}</p>
                <p className="mt-2 font-display text-xl font-bold tracking-tight text-lp-text">{r.competition.title}</p>
                <p className="mt-3 text-base text-lp-muted">
                  Starts {formatDate(r.competition.startAt)} · {r.status.replaceAll("_", " ")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RegistrationPaymentBadge presentation={payPres} />
                </div>
                <p className="mt-2 text-xs text-lp-muted">{payPres.description}</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                    <Link href={`/c/${r.competition.venue.slug}/${r.competition.slug}`}>Open public page</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
                    <Link href={playerAppRoutes.competitions}>All my events</Link>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
