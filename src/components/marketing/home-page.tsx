import Link from "next/link";
import { ArrowRight, CalendarClock, Megaphone, MapPin, QrCode, Trophy, Users } from "lucide-react";
import { LeaguePourProductMockup } from "@/components/marketing/LeaguePourProductMockup";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { VenuePainPoints } from "@/components/marketing/VenuePainPoints";
import { cta } from "@/lib/brand";
import { marketingImages } from "@/lib/marketing-images";
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

const heroHighlights = [
  { icon: Trophy, label: "Multiple formats" },
  { icon: QrCode, label: "Scan to Sign Up" },
  { icon: MapPin, label: "Find local events" },
  { icon: Users, label: "Team Sign Up" },
];

export function HomePage() {
  return (
    <main>
      <section className="lp-hero-wash relative overflow-hidden border-b border-lp-border">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-lp-accent/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-lp-accent-2/25 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="lp-kicker mb-4">Good games. Great times.</p>
              <h1 className="lp-page-title text-5xl md:text-6xl lg:text-7xl">
                Run bar competitions. Fill more seats.
              </h1>
              <p className="mt-5 max-w-xl text-xl text-lp-text-soft leading-relaxed">
                LeaguePour helps venues manage trivia, darts, cornhole, euchre, pool, poker where legal, and recurring
                game nights with signup links, entry fees, teams, and standings.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/signup/venue">Start hosting events</Link>
                </Button>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                  <Link href={marketingRoutes.pricing}>
                    See pricing <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
                {heroHighlights.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-lp-border bg-white/80 px-3 py-2 text-sm font-semibold text-lp-text shadow-sm"
                  >
                    <Icon className="size-4 shrink-0 text-lp-accent" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <LeaguePourProductMockup />
          </div>
        </div>
      </section>

      <section className="border-b border-lp-border bg-gradient-to-r from-lp-accent/5 via-white to-lp-accent-2/15">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-2">
          <MarketingImage {...marketingImages.realVenueNights} />
          <div>
            <p className="lp-kicker text-lp-accent">Real venue nights</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Everything around the bracket matters</h2>
            <p className="mt-4 text-lg text-lp-muted leading-relaxed">
              Signups, payments, QR codes, standings, event specials, and repeat-player campaigns - the parts that turn
              one tournament into a packed weekly league night.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Live Standings", "Venue Hub", "Staff Score Entry", "Repeat-Player Campaigns"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-lp-accent/25 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-lp-accent"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2 p-6">
            <CalendarClock className="size-6 text-lp-accent" />
            <h2 className="font-display text-2xl font-extrabold">Easy sign up</h2>
            <p className="text-base text-lp-text-soft">Publish events and share QR codes in minutes.</p>
          </Card>
          <Card className="space-y-2 p-6">
            <Trophy className="size-6 text-lp-accent" />
            <h2 className="font-display text-2xl font-extrabold">Live standings</h2>
            <p className="text-base text-lp-text-soft">Enter scores, track matches, and keep the night moving.</p>
          </Card>
          <Card className="space-y-2 p-6">
            <Megaphone className="size-6 text-lp-accent" />
            <h2 className="font-display text-2xl font-extrabold">Real community</h2>
            <p className="text-base text-lp-text-soft">Reach players who already opted in for the next league night.</p>
          </Card>
        </div>
      </section>

      <VenuePainPoints />

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
        <p className="lp-kicker text-lp-accent">What LeaguePour solves</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          One place for signups, payments, and repeat league nights
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-display text-xl font-bold">For bars and venues</h3>
            <p className="mt-3 text-base text-lp-text-soft leading-relaxed">
              Stop juggling paper sheets, Venmo screenshots, and Facebook posts. Publish a competition, share a signup
              link or QR code, collect entry fees through Stripe Connect, track teams and standings, and message players
              who opted in for the next night.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-xl font-bold">For players</h3>
            <p className="mt-3 text-base text-lp-text-soft leading-relaxed">
              One free account works at any LeaguePour venue. Find events, register from your phone, pay entry fees
              securely, and manage alerts per venue. No app download required.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-y border-lp-border bg-lp-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
          <p className="lp-kicker text-lp-accent">How a bar gets started</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Five steps from signup to a full room</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { n: "1", title: "Create your venue", body: "Add your bar name, address, and public hub. Your venue page is live right away." },
              { n: "2", title: "Connect Stripe", body: "Link Stripe Connect so entry fees deposit to your bank. LeaguePour does not hold your funds." },
              { n: "3", title: "Publish an event", body: "Set format, dates, entry fee, team size, and cap. Share the link or print a QR code." },
              { n: "4", title: "Players register and pay", body: "Players sign up from their phone. Paid events use Stripe Checkout. You see who is confirmed." },
              { n: "5", title: "Run scores and fill the next night", body: "Enter scores, post standings, and message your audience for the next league or tournament." },
            ].map((step) => (
              <li key={step.n} className="rounded-xl border border-lp-border bg-white p-5">
                <span className="font-display text-sm font-bold text-lp-accent">Step {step.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-lp-muted">
            LeaguePour is self-serve. Venues in the United States can sign up today. Player discovery grows as more
            venues publish events in your area.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
        <p className="lp-kicker text-lp-accent">Payments and registration</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">How money and spots work</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Entry fees</h3>
            <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
              Venues set the listed entry fee. Players pay through Stripe Checkout. Funds go to the venue Stripe account
              minus the platform fee shown in venue settings.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Free events</h3>
            <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
              Set the fee to $0 and players register without payment. Useful for open trivia nights or trial leagues
              while you build a crowd.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Standings</h3>
            <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
              Staff enter scores from the venue dashboard. Standings update on the public competition page so players
              can follow the night without asking at the bar.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-y border-lp-border bg-lp-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="lp-page-title text-4xl md:text-5xl">Built for players</h2>
              <p className="mt-3 max-w-xl text-lg text-lp-text-soft">
                Find local events, join solo or with your crew, and register from your phone. No app download required.
              </p>
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
              <p className="mt-4 text-sm font-semibold text-lp-accent">Play. Compete. Win. Repeat.</p>
            </div>
            <MarketingImage {...marketingImages.playerDiscovery} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <Card className="space-y-4 p-6 md:p-8">
          <p className="lp-kicker">Game nights we support</p>
          <div className="grid grid-cols-2 gap-2 text-[0.9375rem] font-semibold text-lp-text md:grid-cols-4">
            {useCases.map((item) => (
              <span key={item} className="rounded-[10px] border border-lp-border bg-lp-bg px-3 py-2">
                {item}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 text-center md:px-6 md:pb-20">
        <h2 className="lp-page-title text-4xl md:text-5xl">Go live tonight</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-lp-text-soft">Self-serve. No call.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/signup/venue">{cta.startVenue}</Link>
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
            <Link href={marketingRoutes.features}>Features</Link>
          </Button>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-base text-lp-text-soft sm:grid-cols-2">
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
          <Link
            href="/find/dart-leagues"
            className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 hover:text-lp-text"
          >
            Find local dart leagues
          </Link>
          <Link
            href="/software/bar-tournament-software"
            className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 hover:text-lp-text"
          >
            Bar tournament software
          </Link>
        </div>
      </section>
    </main>
  );
}
