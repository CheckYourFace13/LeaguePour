import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { playerAppRoutes } from "@/lib/routes";

export default async function FavoriteVenuesPage() {
  const session = await auth();
  const follows = await prisma.venueFollow.findMany({
    where: { userId: session!.user.id },
    include: { venue: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Favorite venues</h1>
        <p className="mt-3 max-w-2xl text-base text-lp-muted md:text-lg">
          Rooms you follow so their next league or blind draw surfaces first. Listed fees are set by the venue; checkout
          for paid events runs on Stripe.
        </p>
      </div>
      {follows.length === 0 ? (
        <EmptyState
          title="No favorite venues yet"
          description="Follow rooms where you play so their next league or blind draw shows up in your feed."
          action={
            <Button asChild size="lg">
              <Link href={playerAppRoutes.discover}>Discover venues</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {follows.map((f) => (
            <li key={f.venueId}>
              <Card className="p-5">
                <p className="font-display text-lg font-semibold">{f.venue.name}</p>
                <p className="text-sm text-lp-muted">{f.venue.city}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Link href={`/v/${f.venue.slug}`}>Venue page</Link>
                  </Button>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={playerAppRoutes.discover}>Find competitions</Link>
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
