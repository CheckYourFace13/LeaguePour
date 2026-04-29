import Link from "next/link";
import { ArrowRight, CalendarClock, Megaphone, Trophy, Users } from "lucide-react";
import { cta } from "@/lib/brand";
import { marketingRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const useCases = [
  "Trivia",
  "Darts",
  "Cornhole / bags",
  "Euchre",
  "Poker (where legal)",
  "Pool",
  "Shuffleboard",
  "Music bingo",
];

export function HomePage() {
  return (
    <main>
      <section className="lp-hero-wash border-b border-lp-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
          <div>
            <p className="lp-kicker mb-4">Venue nights</p>
            <h1 className="lp-page-title text-4xl md:text-6xl">
              Run competitions.
              <br />
              Grow repeat traffic.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-lp-muted">
              Bar competition software for signups, entry fees, and standings.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/signup/venue">{cta.startVenue}</Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href={marketingRoutes.pricing}>
                  {cta.viewPricing} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link href={marketingRoutes.features} className="font-semibold text-lp-accent hover:underline">
                Competition management platform for venues
              </Link>
              <Link href={marketingRoutes.forVenues} className="font-semibold text-lp-accent hover:underline">
                Tournament signup software for bars
              </Link>
            </div>
          </div>
          <Card className="space-y-4 p-6">
            <p className="lp-kicker">Built for venue nights</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-lp-text">
              {useCases.map((item) => (
                <span key={item} className="rounded-[10px] border border-lp-border bg-lp-bg px-3 py-2">
                  {item}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2 p-5">
            <CalendarClock className="size-6 text-lp-accent" />
            <h2 className="font-display text-xl font-bold">Launch fast</h2>
            <p className="text-sm text-lp-muted">Publish in minutes.</p>
          </Card>
          <Card className="space-y-2 p-5">
            <Trophy className="size-6 text-lp-accent" />
            <h2 className="font-display text-xl font-bold">Run clean</h2>
            <p className="text-sm text-lp-muted">Brackets, standings, check-in.</p>
          </Card>
          <Card className="space-y-2 p-5">
            <Megaphone className="size-6 text-lp-accent" />
            <h2 className="font-display text-xl font-bold">Fill the room</h2>
            <p className="text-sm text-lp-muted">Reach people who already opted in.</p>
          </Card>
        </div>
      </section>

      <section className="border-y border-lp-border bg-lp-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
          <h2 className="lp-page-title text-3xl md:text-4xl">Players</h2>
          <p className="mt-3 max-w-xl text-lp-muted">One account. Clear rules. Secure pay on paid events.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/player">{cta.joinPlayer}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/player/discover">
                {cta.browseEvents} <Users className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-20">
        <h2 className="lp-page-title text-3xl md:text-4xl">Go live tonight</h2>
        <p className="mx-auto mt-3 max-w-xl text-lp-muted">Self-serve. No call.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/signup/venue">{cta.startVenue}</Link>
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
            <Link href={marketingRoutes.features}>Features</Link>
          </Button>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-sm text-lp-muted sm:grid-cols-2">
          <Link
            href={marketingRoutes.forPlayers}
            className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 hover:text-lp-text"
          >
            Venue player registration software
          </Link>
          <Link
            href={marketingRoutes.howItWorks}
            className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 hover:text-lp-text"
          >
            League management software for bars
          </Link>
        </div>
      </section>
    </main>
  );
}
